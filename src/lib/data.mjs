// data.mjs - load every content file once.
//   ctx.site     src/content/site.json   Uforia's facts (main session; every value traced to facts/uforia-facts.json)
//   ctx.ia       src/content/ia.json     the adopted architecture mapped onto Uforia: nav, megas, footer, page map
//   ctx.images   src/content/images.json generated media registry (IMAGERY lane)
//   ctx.content  src/content/pages/<slug>.json  Uforia's captured pages ({ path, title, description, sections, ... })
//   ctx.posts    src/content/posts/<slug>.json  Uforia's 174 blog posts, newest first
//   ctx.learn    src/content/learn/<slug>.json  NEW evergreen guides written for the adopted Learn pattern, newest first
//   ctx.menu     src/content/menu.json          snapshot of Uforia's live menu (categories, sample products, offers)
//   ctx.nj       src/content/nj-law.json        New Jersey law facts with official sources (copied from facts/ by main)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './paths.mjs';
import { normaliseDashes } from './punct.mjs';

const readJson = (rel, fallback) => {
  const f = path.join(ROOT, rel);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback;
};
const readDir = (rel) => {
  const dir = path.join(ROOT, rel);
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) out[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  return out;
};
const byDate = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

// "/menu..." (an href value, or href="/menu..." inside captured HTML) -> the absolute live menu URL
function liveMenuLinks(v, base, key = '') {
  if (typeof v === 'string') {
    if (key === 'href' && /^\/menu(\/|$|\?|#)/.test(v)) return base + v.slice(5);
    return v.indexOf('/menu') === -1 ? v : v.replace(/href="\/menu(\/[^"]*|\?[^"]*|#[^"]*)?"/g, (m, rest) => 'href="' + base + (rest || '') + '"');
  }
  if (Array.isArray(v)) return v.map((x) => liveMenuLinks(x, base, key));
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = liveMenuLinks(x, base, k); return o; }
  return v;
}

export function loadAll() {
  const site = readJson('src/content/site.json');
  const ia = readJson('src/content/ia.json');
  const images = readJson('src/content/images.json', { photos: {}, media: {} });
  // punctuation-only dash normalisation of every copy source (src/lib/punct.mjs); words are unchanged. Captured links to
  // the live menu ("/menu/...", rewritten root-relative by the capture) go back to the absolute live menu: the rebuild
  // has no /menu/ page, ordering stays on Uforia's Dispense menu.
  const menuBase = (site && site.liveMenu && site.liveMenu.base) || 'https://uforiadispensary.com/menu';
  const content = liveMenuLinks(normaliseDashes(readDir('src/content/pages')), menuBase);
  const posts = liveMenuLinks(normaliseDashes(Object.values(readDir('src/content/posts')).sort(byDate)), menuBase);
  const learn = normaliseDashes(Object.values(readDir('src/content/learn')).sort(byDate));
  const menu = normaliseDashes(readJson('src/content/menu.json', { categories: [], offers: [] }));
  const nj = normaliseDashes(readJson('src/content/nj-law.json', { facts: [], sources: [] }));
  return { site, ia, images, content, posts, learn, menu, nj };
}
