// sitemap.mjs - PAGES lane: /sitemap/ (Uforia's URL and H1 kept) + /sitemap.xml. Rendered LAST (index.mjs MODULES), so
// ctx.pages holds every rendered page: each one is listed once, grouped Shop / Deals and loyalty / Locations / Learn /
// Company / Legal (a page no rule knows lands in Company, never dropped). Posts are collapsed under a details/summary.
// Labels: Uforia's own sitemap labels (sitemap.json) first, then ia.json labels, site.json categories and areas, post
// titles, then the page's own <h1>. sitemap.xml: every page path absolute on site.origin, no lastmod; written straight
// into the build's out dir (ctx.out) so the build's HTML checks do not see it; returned as a page only if ctx.out is absent.
import fs from 'node:fs';
import nodePath from 'node:path';
import { esc, escA, linkAttrs, stripTags, absUrl, liveMenu } from './util.mjs';
import { page, crumbsHtml, icon } from './shell.mjs';

const PATH = '/sitemap/';
const GROUPS = ['Shop', 'Deals and loyalty', 'Locations', 'Learn', 'Company', 'Legal'];

function labels(ctx) {
  const L = new Map();
  const put = (u, l) => { if (!u || !l || typeof u !== 'string' || !u.startsWith('/')) return; const p = u.replace(/[?#].*$/, ''); const k = /\.[a-z0-9]{2,5}$/i.test(p) || p.endsWith('/') ? p : p + '/'; if (!L.has(k)) L.set(k, stripTags(l).trim()); };
  const sm = ctx.content.sitemap;
  if (sm) for (const s of sm.sections) for (const b of s.blocks || []) for (const it of b.items || []) { const m = /href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(typeof it === 'string' ? it : ''); if (m) put(m[1], m[2]); }
  put('/', 'Home');
  for (const a of ctx.site.serviceAreas || []) put(a.path, a.name);
  for (const c of ctx.site.liveMenu.categories || []) put('/products/' + c.slug + '/', c.name);
  const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.href === 'string' && (o.label || o.title)) put(o.href, o.label || o.title); Object.values(o).forEach(walk); } };
  walk(ctx.ia);
  for (const p of ctx.posts || []) put(p.path || '/' + p.slug + '/', p.title);
  for (const g of ctx.learn || []) put('/learn/' + g.slug + '/', g.title);
  return L;
}

function groupOf(p) {
  if (p === '/shop/' || p.startsWith('/products/') || p === '/brands/') return 'Shop';
  if (p === '/deals/' || p === '/loyalty/') return 'Deals and loyalty';
  if (p === '/locations/' || p === '/finds-us/' || p === '/delivery/' || p === '/delivery-faq/' || p === '/jersey-city-dispensary/' || /-nj\/$/.test(p)) return 'Locations';
  if (p === '/blog/' || p.startsWith('/learn/') || p.startsWith('/page/') || ['/education/', '/terpenes/', '/safe-consumption/'].includes(p)) return 'Learn';
  if (p === '/privacy-policy/' || p === PATH) return 'Legal';
  return 'Company';
}

const ORDER = ['/', '/about/', '/community-partners/', '/faq/', '/shop/', '/brands/', '/deals/', '/loyalty/', '/locations/', '/jersey-city-dispensary/', '/finds-us/', '/delivery/', '/delivery-faq/', '/blog/', '/education/', '/terpenes/', '/safe-consumption/', '/page/is-weed-legal-in-new-jersey/', '/page/how-to-get-a-medical-marijuana-card-new-jersey/', '/learn/understanding-cannabis-purchase-limits/', '/privacy-policy/', PATH];

export async function render(ctx) {
  const L = labels(ctx);
  const h1Of = (html) => { const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html || ''); return m ? stripTags(m[1]).replace(/\s+/g, ' ').trim() : ''; };
  const postPaths = new Set((ctx.posts || []).map((p) => p.path || '/' + p.slug + '/'));
  const areaOrder = (ctx.site.serviceAreas || []).map((a) => a.path);
  const catOrder = (ctx.site.liveMenu.categories || []).map((c) => '/products/' + c.slug + '/');
  const all = [...ctx.pages.keys()].filter((p) => p.endsWith('/'));
  if (!all.includes(PATH)) all.push(PATH);
  const entries = all.map((p) => ({ path: p, label: L.get(p) || h1Of((ctx.pages.get(p) || {}).html) || p, post: postPaths.has(p), group: postPaths.has(p) ? 'Learn' : groupOf(p) }));
  const rank = (p) => { const i = ORDER.indexOf(p); if (i !== -1) return i; const a = areaOrder.indexOf(p); if (a !== -1) return ORDER.indexOf('/jersey-city-dispensary/') + 0.01 * (a + 1); const c = catOrder.indexOf(p); if (c !== -1) return ORDER.indexOf('/shop/') + 0.01 * (c + 1); return ORDER.length; };
  entries.sort((a, b) => rank(a.path) - rank(b.path) || a.label.localeCompare(b.label));
  const li = (e) => `<li><a class="p-sm__link"${linkAttrs(e.path, e.path === PATH ? { 'aria-current': 'page' } : {})}>${esc(e.label)}</a></li>`;

  // Uforia's own "Custom Links" (live menu links) from the captured sitemap, listed under Shop with their captured labels
  const sm = ctx.content.sitemap;
  const custom = [];
  const exploreHeading = sm && (sm.sections.find((s) => /Explore/i.test(s.heading || '')) || {}).heading;
  if (sm) for (const s of sm.sections) if (/custom links/i.test(s.heading || '')) for (const b of s.blocks || []) for (const it of b.items || []) {
    const m = /href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(it);
    if (m) custom.push({ url: ctx.site.liveMenu.base + m[1].replace(/^\/menu/, '').replace(/\/$/, ''), label: stripTags(m[2]) });
  }

  const groups = GROUPS.map((g, gi) => {
    const items = entries.filter((e) => e.group === g && !e.post);
    const posts = entries.filter((e) => e.group === g && e.post).sort((a, b) => a.label.localeCompare(b.label));
    if (!items.length && !posts.length && !(g === 'Shop' && custom.length)) return '';
    const id = 'sm-' + g.toLowerCase().replace(/[^a-z]+/g, '-');
    return `<section class="p-sm__group glass glass--lit${g === 'Learn' ? ' p-sm__group--wide' : ''}" data-reveal style="--i:${gi % 3}" aria-labelledby="${id}">
<h2 class="p-sm__title" id="${id}">${esc(g)}<span class="p-sm__count">${items.length + posts.length}</span></h2>
<ul class="p-sm__list" role="list">${items.map(li).join('')}</ul>
${g === 'Shop' && custom.length ? `<p class="p-sm__sub">Live menu</p><ul class="p-sm__list" role="list">${custom.map((c) => `<li><a class="p-sm__link"${linkAttrs(c.url)}>${esc(c.label)}${icon('ext', 'p-sm__ext')}<span class="p-sr"> (opens in a new tab)</span></a></li>`).join('')}</ul>` : ''}
${posts.length ? `<details class="p-sm__posts"><summary class="p-sm__sum">All articles <span class="p-sm__count">${posts.length}</span>${icon('chev', 'p-sm__chev')}</summary><ul class="p-sm__list p-sm__list--cols" role="list">${posts.map(li).join('')}</ul></details>` : ''}
</section>`;
  }).join('\n');

  const c = sm || {};
  const crumbs = [{ href: '/', label: 'Home' }, { href: PATH, label: 'Sitemap' }];
  const title = c.title || 'Sitemap | Uforia Dispensary';
  const description = c.description || 'Every page of the Uforia Dispensary site, grouped.';
  const main = `<section class="p-hero p-hero--solo p-hero--sitemap" data-spot>
<div class="band__clip p-hero__clip" aria-hidden="true"><span class="p-hero__pool"></span><span class="haze p-hero__haze"></span><span class="grain"></span></div>
<div class="wrap p-hero__grid">
<div class="p-hero__text" data-reveal>
<div class="p-hero__crumbs">${crumbsHtml(crumbs)}</div>
<p class="kicker p-kicker">Sitemap</p>
<h1 class="display p-hero__title">${esc(c.h1 || 'Sitemap')}</h1>
<p class="lede p-hero__lede">Every page of the site, grouped: ${entries.length} in all.</p>
</div>
</div>
</section>
<section class="p-band p-band--calm p-band--sitemap" aria-labelledby="sm-explore">
<div class="band__clip p-band__clip" aria-hidden="true"><span class="p-pool"></span></div>
<div class="wrap">
<header class="p-head" data-reveal><h2 class="display p-head__title p-head__title--sm" id="sm-explore">${esc(exploreHeading || 'All pages')}</h2></header>
<div class="p-sm__grid">${groups}</div>
</div>
</section>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.slice().sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)).map((p) => `  <url><loc>${escA(absUrl(ctx, p))}</loc></url>`).join('\n')}
</urlset>
`;
  const pages = [{ path: PATH, html: page({ ctx, path: PATH, title, description, canonical: absUrl(ctx, PATH), og: { title: (c.og && c.og.title) || title, description: (c.og && c.og.description) || description, type: 'website' }, bodyClass: 'p-page p-page--sitemap', main, crumbs, heroCrumbs: true }) }];
  if (ctx.out) { fs.mkdirSync(ctx.out, { recursive: true }); fs.writeFileSync(nodePath.join(ctx.out, 'sitemap.xml'), xml); }
  else pages.push({ path: '/sitemap.xml', html: xml });
  return pages;
}
