// shell.mjs - page wrapper (FOUNDATION): <head>, promo bar, main bar (logo, store chip, mega menus, tools), category
// bar, drawer (below 1024px), footer, 21+ gate. The exports and the page() signature are FIXED (every lane calls them):
//   page({ ctx, path, title, description, canonical, og, jsonld, bodyClass, main, crumbs, heroCrumbs, scripts, preload })
//     main       the page's <main> INNER html (page() wraps it in <main id="main">)
//     crumbs     [{ label, href }, ...] or [[href, label], ...] (last = current page). Printed in a bar under the header
//                unless heroCrumbs is true (then the template prints crumbsHtml(crumbs) inside its hero).
//     og         { title, description, type, image, url } (image defaults to the g-hero-bud still, absolute)
//     jsonld     object or array of objects -> <script type="application/ld+json">
//     scripts    extra script file names under /assets/js/ (site.js always loads)
//     preload    [{ href, as, type, media, imagesrcset, imagesizes, fetchpriority, crossorigin }] -> <link rel="preload">
// Every word in the chrome comes from ctx.site / ctx.ia / ctx.menu / ctx.posts (Uforia's own) except neutral glue
// (Menu, Order now, Store hours, the gate's question and buttons).
import { esc, escA, attrs, href, linkAttrs, absUrl, gimg, img, imgUrl, hasGenerated, liveMenu, serviceAreas } from './util.mjs';

export const CSS_ORDER = ['fonts', 'tokens', 'base', 'components', 'motion', 'shell', 'home', 'shop', 'places', 'learn', 'pages', 'mobile', 'fix'];

const ICONS = {
  ext: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h11"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  pin: '<path d="M19 10c0 5.6-7 11-7 11s-7-5.4-7-11a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bag: '<path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
  truck: '<path d="M2.5 6.5h11v9.5h-11z"/><path d="M13.5 10h4l3 3.2V16h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  cart: '<path d="M3 4h2.2l2.3 11h10.3L20 7.5H6.4"/><circle cx="9.2" cy="19" r="1.4"/><circle cx="16.6" cy="19" r="1.4"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m20 20-4.4-4.4"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  tag: '<path d="M12.6 2.8H4.8a2 2 0 0 0-2 2v7.8l8.6 8.6a2.2 2.2 0 0 0 3.1 0l6.7-6.7a2.2 2.2 0 0 0 0-3.1Z"/><circle cx="8" cy="8" r="1.3"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.2"/><path d="M14 10h4M14 14h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="12" rx="1"/><path d="M12 8.5v12M3.5 12.5h17"/><path d="M12 8.5c-1.6-3.6-5.5-3.8-5.5-1.3 0 1.8 3.4 1.3 5.5 1.3 2.1 0 5.5.5 5.5-1.3 0-2.5-3.9-2.3-5.5 1.3Z"/>',
  phone: '<path d="M5 3.5h3.6l1.8 4.6-2.4 1.6a11 11 0 0 0 6.3 6.3l1.6-2.4 4.6 1.8V19a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5Z"/>',
  star: '<path d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.38 2.85 1.03-6L3.3 9.6l6-.9Z"/>',
  leaf: '<path d="M5 20c0-8.5 5.5-14 15-15-.6 9.5-6.4 15-15 15Z"/><path d="m5 20 8.5-8.5"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6.5L20.5 7"/>',
  up: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.9"/>',
  facebook: '<path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.6 1.6-1.6h1.6V4.3a21 21 0 0 0-2.4-.1c-2.4 0-3.9 1.4-3.9 4v2.3H8.8v3h2.6V21"/>',
  tiktok: '<path d="M14 3.5v11.2a3.6 3.6 0 1 1-3.6-3.6"/><path d="M14 3.5c.4 2.6 2.2 4.4 5 4.6"/>',
  yelp: '<path d="M10.8 3.4c.9-.3 2 .1 2 1.1v7.3c0 .8-1 1.1-1.5.5L6.7 6.6c-.5-.6-.3-1.4.4-1.7Z"/><path d="m13.8 14.2 5.6 1.8c.8.3 1 1.2.4 1.8l-2.2 2.4c-.6.6-1.5.4-1.8-.4l-1.9-4.7c-.2-.6.3-1.1.9-.9Z"/><path d="m14 11.7 4.8-2.6c.7-.4 1.6 0 1.7.8l.3 2.8c.1.8-.6 1.4-1.4 1.2l-5.1-1c-.6-.1-.8-1-.3-1.2Z"/><path d="m11.4 15.1-.3 5.5c0 .8-.8 1.3-1.6 1l-2.6-1.2c-.7-.3-.9-1.2-.3-1.8l3.6-4c.4-.5 1.2-.2 1.2.5Z"/>',
};
export function icon(name, cls = '') {
  return `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.arrow}</svg>`;
}

// crumbs: [{ label, href }] or [[href, label]]; the last one is the current page. Separators are drawn by CSS ("/").
const crumbParts = (c) => (Array.isArray(c) ? { href: c[0], label: c[1] } : c || {});
export function crumbsHtml(crumbs = []) {
  if (!crumbs || !crumbs.length) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((raw, i) => {
    const c = crumbParts(raw);
    return `<li>${i < crumbs.length - 1 && c.href ? `<a${linkAttrs(c.href)}>${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}</li>`;
  }).join('')}</ol></nav>`;
}

// ---------- shared bits ----------
const isCur = (h, path) => !!h && !/^(https?:)?\/\//i.test(h) && href(h) === path;
const cur = (h, path) => (isCur(h, path) ? ' aria-current="page"' : '');
const cats = (ctx) => ((ctx.site.liveMenu || {}).categories || []);
const catBySlug = (ctx, slug) => cats(ctx).find((c) => c.slug === slug);
const cartUrl = (ctx) => liveMenu(ctx) + '/cart';

function logoImg(ctx, cls, eager) {
  const L = ctx.site.brandLogo;
  return `<img${attrs({ class: cls, src: L.src, width: L.w, height: L.h, alt: L.alt || ctx.site.name, decoding: 'async', loading: eager ? 'eager' : 'lazy' })}>`;
}

// the hours rows; each row carries the weekday numbers it covers (from hours.byDay) so site.js can mark today
export function hoursHtml(ctx, cls = '') {
  const h = ctx.site.hours;
  const byDay = h.byDay || {};
  return `<dl class="hours${cls ? ' ' + cls : ''}">${h.rows.map((r) => {
    const days = Object.keys(byDay).filter((d) => byDay[d][0] === r.open && byDay[d][1] === r.close).join(' ');
    return `<div class="hours__row" data-days="${escA(days)}"><dt>${esc(r.days)}</dt><dd>${esc(r.open)} to ${esc(r.close)}</dd></div>`;
  }).join('')}</dl>`;
}

// ---------- link expansion (ia.json special values) ----------
function expandLinks(ctx, links) {
  if (links === 'categories') return cats(ctx).map((c) => ({ label: c.name, href: `/products/${c.slug}/` }));
  if (links === 'offers') return ((ctx.menu && ctx.menu.offers) || []).map((o) => ({ label: o.title, href: o.liveUrl }));
  if (links === 'areas') return serviceAreas(ctx).map((a) => ({ label: a.name, href: a.path }));
  return (Array.isArray(links) ? links : []).map((l) => ({ ...l, href: l.href === 'live:' ? liveMenu(ctx) : l.href }));
}
const featHref = (ctx, h) => (h === 'live:' ? liveMenu(ctx) : h);

function linkList(ctx, links, path, cls = '') {
  return `<ul class="mega__links${cls}">${links.map((l) => {
    const ext = /^(https?:)?\/\//i.test(l.href);
    return `<li><a class="mega__link"${linkAttrs(l.href)}${cur(l.href, path)}><span>${esc(l.label)}</span>${ext ? icon('ext', 'ico--ext') : ''}</a></li>`;
  }).join('')}</ul>`;
}

function megaGroups(ctx, item, path) {
  return item.groups.map((g) => {
    const links = expandLinks(ctx, g.links);
    const cols = links.length > 10 ? 3 : links.length > 6 ? 2 : 1;
    const kind = typeof g.links === 'string' ? ' mega__group--' + g.links : '';
    return `<div class="mega__group${kind}" style="--cols:${cols}"><p class="mega__h">${esc(g.title)}</p>${linkList(ctx, links, path, cols > 1 ? ' mega__links--cols' : '')}</div>`;
  }).join('');
}

function megaFeatures(ctx, item) {
  if (item.features === 'latest-posts') {
    const posts = (ctx.posts || []).slice(0, 3);
    return `<div class="mega__features mega__features--posts"><p class="mega__h">Latest articles</p><ul class="mega__posts">${posts.map((p) => {
      const fi = p.featuredImage && p.featuredImage.src ? p.featuredImage : null;
      const media = fi ? img({ src: fi.src, alt: '', w: fi.w, h: fi.h }, { sizes: '(min-width: 1024px) 240px, 96px', alt: '' }) : '<span class="mega__post-blank"></span>';
      return `<li><a class="mega__post"${linkAttrs(p.path)}><span class="mega__post-media">${media}</span><span class="mega__post-t">${esc(p.title)}</span></a></li>`;
    }).join('')}</ul></div>`;
  }
  const feats = Array.isArray(item.features) ? item.features : [];
  if (!feats.length) return '';
  return `<div class="mega__features" style="--n:${feats.length}">${feats.map((f) => `<a class="mega__card"${linkAttrs(featHref(ctx, f.href))}>
<span class="mega__media">${gimg(f.image, { alt: '', sizes: '(min-width: 1024px) 300px, 120px' })}</span>
<span class="mega__card-body"><span class="mega__card-t">${esc(f.title)}</span><span class="mega__card-l">${esc(f.text)}</span></span>
<span class="mega__card-go" aria-hidden="true">${icon('arrow')}</span>
</a>`).join('')}</div>`;
}

function megaOwnsPath(ctx, item, path) {
  if (isCur(item.href, path)) return true;
  return item.groups.some((g) => expandLinks(ctx, g.links).some((l) => isCur(l.href, path)));
}

// ---------- store chip (main bar on desktop, top of the drawer below 1024px) ----------
function storeChip(ctx, id) {
  const sb = ctx.ia.storeBar;
  return `<div class="store-chip" data-dropdown>
<a class="store-chip__link"${linkAttrs(sb.href)}>
<span class="store-chip__pin">${icon('pin')}</span>
<span class="store-chip__txt">
<span class="store-chip__top"><span class="store-chip__label">${esc(sb.label)}</span><span class="store-chip__mode">${esc(sb.mode)}</span></span>
<span class="store-chip__name"><span class="store-chip__store">${esc(sb.name)}</span><span class="store-chip__sep">, </span><span class="store-chip__place">${esc(sb.place)}</span></span>
</span>
</a>
<button class="store-chip__hours" type="button" aria-expanded="false" aria-controls="${id}" data-dropdown-trigger>${icon('clock')}<span data-hours-today>Store hours</span>${icon('chev', 'ico--chev')}</button>
<div class="store-chip__pop" id="${id}" data-dropdown-panel>
<p class="store-chip__pop-h">Store hours</p>
${hoursHtml(ctx)}
<p class="store-chip__addr">${icon('pin')}<span>${esc(ctx.site.address.line)}</span></p>
<p class="store-chip__links"><a${linkAttrs(ctx.site.directionsUrl)}>Get directions</a><a${linkAttrs(ctx.site.phone.href)}>${esc(ctx.site.phone.display)}</a></p>
</div>
</div>`;
}

// ---------- nav (desktop mega bar; the same element is the drawer below 1024px) ----------
function navHtml(ctx, path) {
  const { nav, promo } = ctx.ia;
  const items = nav.map((it) => {
    const id = 'mega-' + (it.mega || it.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    return `<li class="nav__item${megaOwnsPath(ctx, it, path) ? ' is-current' : ''}" data-mega>
<button class="nav__link nav__trigger" type="button" aria-expanded="false" aria-controls="${id}" data-dropdown-trigger><span>${esc(it.label)}</span>${icon('chev', 'ico--chev')}</button>
<div class="mega" id="${id}" data-dropdown-panel>
<div class="mega__panel wrap wrap--wide">
<div class="mega__groups">${megaGroups(ctx, it, path)}</div>
${megaFeatures(ctx, it)}
</div>
</div>
</li>`;
  }).join('\n');
  return `<nav class="nav" id="site-nav" aria-label="Main" data-nav>
<div class="nav__drawer-head"><span class="nav__drawer-title">Menu</span><button class="nav__close" type="button" data-nav-close>${icon('close')}<span class="sr-only">Close menu</span></button></div>
<div class="nav__drawer-store">${storeChip(ctx, 'hours-pop-drawer')}
<p class="nav__promo">${icon('truck')}<span>${esc(promo.text)}</span> <a${linkAttrs(promo.href)}>${esc(promo.cta)}</a></p></div>
<ul class="nav__list">
${items}
</ul>
<div class="nav__drawer-foot">
<a class="btn btn--silver"${linkAttrs(liveMenu(ctx))}>Order now${icon('arrow')}</a>
<ul class="nav__tools">
<li><a class="nav__tool"${linkAttrs(liveMenu(ctx))}>${icon('search')}<span>Search the menu</span></a></li>
<li><a class="nav__tool"${linkAttrs('/loyalty/')}${cur('/loyalty/', path)}>${icon('user')}<span>Loyalty rewards</span></a></li>
<li><a class="nav__tool"${linkAttrs(cartUrl(ctx))}>${icon('bag')}<span>Cart</span></a></li>
</ul>
</div>
</nav>`;
}

function catbarHtml(ctx, path) {
  const cb = ctx.ia.categoryBar;
  const link = (slug) => { const c = catBySlug(ctx, slug); if (!c) return ''; const h = `/products/${c.slug}/`; return `<li><a class="catbar__link"${linkAttrs(h)}${cur(h, path)}>${esc(c.name)}</a></li>`; };
  return `<nav class="catbar" aria-label="Product categories">
<div class="catbar__inner wrap wrap--wide">
<ul class="catbar__list">
${cb.main.map(link).join('')}
<li class="catbar__more" data-dropdown>
<button class="catbar__link catbar__trigger" type="button" aria-expanded="false" aria-controls="catbar-more" data-dropdown-trigger>More${icon('chev', 'ico--chev')}</button>
<div class="catbar__pop" id="catbar-more" data-dropdown-panel><ul>${cb.more.map(link).join('')}</ul></div>
</li>
</ul>
<a class="catbar__all"${linkAttrs('/shop/')}${cur('/shop/', path)}>Shop all${icon('arrow')}</a>
</div>
</nav>`;
}

function headerHtml(ctx, path) {
  const h = ctx.site.hours;
  return `<header class="site-header" data-header data-hours="${escA(JSON.stringify(h.byDay || {}))}" data-tz="${escA(h.timezone || 'America/New_York')}">
<div class="mainbar wrap wrap--wide">
<a class="brand"${linkAttrs('/')}${path === '/' ? ' aria-current="page"' : ''}>${logoImg(ctx, 'brand__logo', true)}</a>
<div class="mainbar__store">${storeChip(ctx, 'hours-pop')}</div>
${navHtml(ctx, path)}
<div class="header-tools">
<a class="header-tool header-tool--search"${linkAttrs(liveMenu(ctx), { title: 'Search the menu' })}>${icon('search')}<span class="sr-only">Search the menu</span></a>
<a class="header-tool header-tool--account"${linkAttrs('/loyalty/', { title: 'Loyalty rewards' })}>${icon('user')}<span class="sr-only">Loyalty rewards</span></a>
<a class="header-tool header-tool--bag"${linkAttrs(cartUrl(ctx), { title: 'Cart' })}>${icon('bag')}<span class="sr-only">Cart</span></a>
<a class="btn btn--silver btn--sm header-cta"${linkAttrs(liveMenu(ctx))}>Order now</a>
<button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>${icon('menu')}<span class="sr-only">Open menu</span></button>
</div>
</div>
</header>
<div class="nav-scrim" data-nav-scrim hidden></div>
${catbarHtml(ctx, path)}`;
}

function promoHtml(ctx) {
  const p = ctx.ia.promo;
  return `<div class="promo-bar"><p class="promo-bar__inner wrap wrap--wide"><span class="promo-bar__dot" aria-hidden="true"></span><span>${esc(p.text)}</span><a class="promo-bar__cta"${linkAttrs(p.href)}>${esc(p.cta)}${icon('arrow')}</a></p></div>`;
}

// ---------- footer ----------
function footerHtml(ctx, path) {
  const s = ctx.site;
  const f = ctx.ia.footer;
  const col = (c, i) => `<div class="footer__col"><h2 class="footer__h">${esc(c.title)}</h2><ul class="footer__links">${expandLinks(ctx, c.links).map((l) => `<li><a${linkAttrs(l.href)}${cur(l.href, path)}>${esc(l.label)}</a></li>`).join('')}</ul></div>`;
  const socials = (s.socials || []).map((x) => `<li><a class="footer__social"${linkAttrs(x.href, { 'aria-label': x.name, title: x.name })}>${icon(x.name.toLowerCase())}</a></li>`).join('');
  return `<footer class="site-footer">
<div class="footer__clip" aria-hidden="true"><span class="haze"></span><span class="grain"></span></div>
<div class="wrap wrap--wide footer__inner">
<div class="footer__grid">
<section class="footer__store" aria-labelledby="footer-store-h">
<a class="brand brand--footer"${linkAttrs('/')}>${logoImg(ctx, 'brand__logo', false)}</a>
<h2 class="footer__h" id="footer-store-h">${esc(s.name)}</h2>
<address class="footer__addr"><a${linkAttrs(s.directionsUrl)}>${icon('pin')}<span>${esc(s.address.line)}</span></a></address>
<ul class="footer__contact">
<li><a${linkAttrs(s.phone.href)}>${icon('phone')}<span>${esc(s.phone.display)}</span></a></li>
<li><a${linkAttrs(s.phone.href)}>${icon('phone')}<span>${esc(s.phone.vanity)}</span></a></li>
<li><a${linkAttrs('mailto:' + s.email)}>${icon('mail')}<span>${esc(s.email)}</span></a></li>
</ul>
<div class="footer__hours"><p class="footer__sub">${icon('clock')}<span>Store hours</span></p>${hoursHtml(ctx)}</div>
<ul class="footer__socials">${socials}</ul>
</section>
<nav class="footer__cols" aria-label="Footer">
${f.columns.map(col).join('\n')}
</nav>
</div>
<div class="footer__legal">
<p class="footer__copy">&copy; 2026 ${esc(s.name)}</p>
<ul class="footer__legal-links">${f.legal.map((l) => `<li><a${linkAttrs(l.href)}${cur(l.href, path)}>${esc(l.label)}</a></li>`).join('')}</ul>
<a class="footer__top" href="#top">Back to top${icon('up')}</a>
</div>
</div>
<div class="footer__mark" aria-hidden="true" data-footer-mark>
<span class="footer__word">UFORIA</span>
<span class="footer__band"><span class="footer__band-in"><span class="footer__word footer__word--lit">UFORIA</span></span></span>
</div>
</footer>`;
}

// ---------- 21+ gate (D7): hidden by default; site.js opens it unless localStorage uforia-age-ok = 1. Never blocks
// the page without JS. ----------
function gateHtml(ctx) {
  return `<div class="age-gate" data-age-gate data-age-key="uforia-age-ok" hidden>
<div class="age-gate__card glass glass--lit glass--strong" role="dialog" aria-modal="true" aria-labelledby="age-gate-q">
${logoImg(ctx, 'age-gate__logo', false)}
<h2 class="age-gate__q" id="age-gate-q">Are you at least 21?</h2>
<label class="age-gate__check"><input type="checkbox" data-age-check><span>Yes, I am at least 21 years of age.</span></label>
<div class="btn-row age-gate__actions"><button class="btn btn--silver" type="button" data-age-yes disabled>Enter Site</button><a class="btn btn--ghost" href="https://www.google.com/" data-age-no>No</a></div>
<p class="age-gate__note">${esc(ctx.site.age || '')}</p>
</div>
</div>`;
}

function ogImage(ctx, og) {
  let u = og.image;
  if (!u && hasGenerated('g-hero-bud')) u = imgUrl('g-hero-bud', 1440);
  if (!u) return '';
  return /^https?:/i.test(u) ? u : (ctx.site.origin || '') + u;
}

export function page({ ctx, path, title, description, canonical, og = {}, jsonld = [], bodyClass = '', main = '', crumbs = [], heroCrumbs = false, scripts = [], preload = [] }) {
  const can = canonical || absUrl(ctx, path);
  const css = (ctx.cssFiles || []).map((f) => `<link rel="stylesheet" href="/assets/css/${f}.css">`).join('\n');
  const ld = (Array.isArray(jsonld) ? jsonld : [jsonld]).filter(Boolean).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const pre = (preload || []).filter(Boolean).map((p) => `<link rel="preload"${attrs(p)}>`).join('\n');
  const js = [...new Set([...(ctx.jsFiles || ['site.js']), ...(scripts || [])])];
  const ogi = ogImage(ctx, og || {});
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${escA(description)}">
<link rel="canonical" href="${escA(can)}">
<meta property="og:site_name" content="${escA(ctx.site.name)}">
<meta property="og:title" content="${escA(og.title || title)}">
<meta property="og:description" content="${escA(og.description || description)}">
<meta property="og:url" content="${escA(og.url || can)}">
<meta property="og:type" content="${escA(og.type || 'website')}">
${ogi ? `<meta property="og:image" content="${escA(ogi)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#080808">
<meta name="color-scheme" content="dark">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/site-icon-32x32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/brand/site-icon-192x192.png">
<link rel="apple-touch-icon" href="/assets/brand/site-icon-180x180.png">
<link rel="preload" href="/assets/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/poppins-400.woff2" as="font" type="font/woff2" crossorigin>
${pre}
${css}
<script>document.documentElement.classList.add('js');</script>
${ld}
</head>
<body id="top"${attrs({ class: bodyClass })}>
<a class="skip" href="#main">Skip to content</a>
<div class="site">
${promoHtml(ctx)}
${headerHtml(ctx, path)}
${crumbs && crumbs.length && !heroCrumbs ? `<div class="crumbs-bar"><div class="wrap wrap--wide">${crumbsHtml(crumbs)}</div></div>` : ''}
<main id="main">
${main}
</main>
${footerHtml(ctx, path)}
</div>
${gateHtml(ctx)}
${js.map((f) => `<script src="/assets/js/${escA(f)}" defer></script>`).join('\n')}
</body>
</html>`;
}
