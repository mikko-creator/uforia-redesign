// shop.mjs - SHOP lane (docs/BUILD-CONTRACT.md section 6): /shop/, /products/<cat>/ for every live-menu category,
// /deals/, /brands/, /loyalty/. Uforia's words only (captured pages + menu snapshot + site.json); new words are
// neutral glue. Every shop / order CTA goes to the live menu through liveMenu().
import { esc, escA, href, linkAttrs, gimg, img, photo, absUrl, liveMenu, slugify, stripTags } from './util.mjs';
import { page, crumbsHtml, icon } from './shell.mjs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const money = (n) => (n == null || n === '' ? '' : '$' + (Number.isInteger(Number(n)) ? Number(n) : Number(n).toFixed(2)));
const uniq = (a) => [...new Set(a)];
const ext = (u, label, cls = '', extra = {}) => `<a class="${cls}"${linkAttrs(u, extra)}>${label}</a>`;

// ---------- neutral product-format glue (contract D2: what the format is; no effects, health or potency claims) ----------
const ABOUT = {
  flower: ['Flower is the dried and cured bud of the cannabis plant.', 'It is sold by weight, often in eighths of an ounce (3.5 grams), and is usually ground before it is rolled or packed.', 'Each card shows the strain type, the size and the cannabinoid figures listed on the menu.'],
  'pre-rolls': ['A pre-roll is ground cannabis flower already rolled in paper and ready to light, often called a joint.', 'Pre-rolls come as singles or in packs, and the size on each card is the weight of flower inside.'],
  vaporizers: ['Vaporizers heat cannabis oil or flower to make vapor instead of smoke.', 'Most vape products are cartridges of cannabis oil that attach to a battery, or all-in-one pens that need no separate battery.'],
  edibles: ['Edibles are foods made with cannabis, such as gummies and chocolates, that are eaten rather than inhaled.', 'Read the package label before you start, and see our safe consumption page for Uforia\'s own guidance.'],
  concentrates: ['Concentrates are made by collecting the resin of the cannabis plant and separating it from the plant material.', 'They come in many textures and styles, such as rosin, live resin, badder, wax and kief.'],
  tinctures: ['A tincture is a liquid cannabis extract, usually sold in a small bottle with a dropper so each amount can be measured.', 'Tinctures are taken by mouth or added to food and drinks.'],
  topicals: ['Topicals are cannabis-infused lotions, balms and salves that are applied to the skin rather than inhaled or eaten.'],
  beverages: ['Cannabis beverages are drinks made with cannabis, such as sodas, seltzers and drink mixes.', 'Like edibles they are taken by mouth, so read the label for the amount in each serving.'],
  'accessories-and-merch': ['This category covers the tools that go with cannabis, such as papers, wraps and glass pieces, along with merchandise.'],
  'top-shelf': ['Top Shelf is a collection on Uforia\'s live menu built around New Jersey cultivators.', 'Browse the live menu to see what it holds today.'],
};
// related categories + Learn pages per category (learn guides are linked only when ctx.learn has them)
const RELATED = {
  flower: { cats: ['pre-rolls', 'top-shelf', 'concentrates'], learn: ['how-many-grams-in-an-eighth', 'indica-vs-sativa-vs-hybrid', 'what-is-thca'], pages: ['terpenes'] },
  'pre-rolls': { cats: ['flower', 'concentrates', 'accessories-and-merch'], learn: ['indica-vs-sativa-vs-hybrid'], pages: ['terpenes', 'education'] },
  vaporizers: { cats: ['concentrates', 'accessories-and-merch'], learn: ['live-resin-vs-rosin'], pages: ['education', 'safe-consumption'] },
  edibles: { cats: ['beverages', 'tinctures'], learn: [], pages: ['safe-consumption', 'education'] },
  concentrates: { cats: ['vaporizers', 'flower'], learn: ['live-resin-vs-rosin', 'what-is-kief'], pages: ['terpenes'] },
  tinctures: { cats: ['edibles', 'topicals', 'beverages'], learn: [], pages: ['safe-consumption', 'education'] },
  topicals: { cats: ['tinctures', 'edibles'], learn: [], pages: ['education', 'safe-consumption'] },
  beverages: { cats: ['edibles', 'tinctures'], learn: [], pages: ['safe-consumption', 'education'] },
  'accessories-and-merch': { cats: ['flower', 'pre-rolls', 'concentrates'], learn: [], pages: ['education'] },
  'top-shelf': { cats: ['flower', 'pre-rolls'], learn: ['what-is-thca', 'indica-vs-sativa-vs-hybrid'], pages: ['terpenes'] },
};
const PAGE_LABEL = { terpenes: 'Terpenes', education: 'Education', 'safe-consumption': 'Safe consumption' };

// ---------- data helpers ----------
const cats = (ctx) => ctx.site.liveMenu.categories;
const catBySlug = (ctx, s) => cats(ctx).find((c) => c.slug === s);
const snapCat = (ctx, cat) => (ctx.menu.categories || []).find((m) => m.slug === cat.live) || { products: [] };
const products = (ctx, cat) => snapCat(ctx, cat).products || [];
const learnBySlug = (ctx, s) => (ctx.learn || []).find((g) => (g.slug || slugify(g.title || '')) === s);
const snapNote = (ctx) => `Menu snapshot from ${fmtDate(ctx.menu.capturedAt)}. Live prices and availability on the live menu.`;
const extLabel = (t) => `${esc(t)}${icon('ext', 's-ext')}`;

// category picture: Uforia's own art (white line icon) or the generated still
function catArt(ctx, cat, opts = {}) {
  if (cat.art) return photo(ctx, cat.art, { alt: opts.alt != null ? opts.alt : cat.artAlt || cat.name, sizes: opts.sizes || '200px', cls: opts.cls, eager: opts.eager });
  if (cat.gen) return gimg(cat.gen, { alt: opts.alt != null ? opts.alt : undefined, sizes: opts.sizes || '400px', cls: opts.cls, eager: opts.eager });
  return '';
}

// captured block renderer (trusted inline html; buttons through href()/live menu)
function btnHref(ctx, h) {
  const s = String(h || '');
  if (/^\/menu(\/|$)/.test(s) || /^https:\/\/uforiadispensary\.com\/menu/.test(s)) return liveMenu(ctx);
  return s;
}
function capBtn(ctx, b, cls = 'btn btn--silver') {
  const u = btnHref(ctx, b.href);
  const isExt = /^https?:/i.test(u);
  return `<a class="${cls}"${linkAttrs(u)}>${esc(b.text)}${isExt ? icon('ext', 's-ext') : ''}</a>`;
}
const paras = (html) => String(html).split(/<br\s*\/?>/i).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p}</p>`).join('\n');

// ---------- shared bits ----------
function bandClip(extra = '') {
  return `<div class="band__clip" aria-hidden="true"><div class="band__bg"></div>${extra}<div class="haze"></div><div class="grain"></div></div>`;
}
function hero({ crumbs, kicker, h1, line, ctas = '', media, mediaCls = '', badge = '', cls = '' }) {
  return `<section class="split-hero band band--lit s-hero ${cls}" data-spot>
${bandClip()}
<div class="wrap s-hero__grid">
<div class="s-hero__text">
${crumbsHtml(crumbs)}
${kicker ? `<p class="kicker" data-reveal>${kicker}</p>` : ''}
<h1 class="display s-hero__title${stripTags(h1).length > 24 ? ' s-hero__title--long' : ''}" data-reveal style="--i:1">${h1}</h1>
${line ? `<p class="lede s-hero__line" data-reveal style="--i:2">${line}</p>` : ''}
${ctas ? `<div class="btn-row" data-reveal style="--i:3">${ctas}</div>` : ''}
</div>
<div class="s-hero__media" data-reveal style="--i:2">
<div class="frame-u protrude s-hero__frame ${mediaCls}">${media}</div>
${badge}
</div>
</div>
</section>`;
}
const crumbsLd = (ctx, crumbs) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, ...(c.href ? { item: absUrl(ctx, c.href) } : {}) })) });

function pcard(ctx, cat, p, i, { sizes = '(min-width: 1280px) 300px, (min-width: 1024px) 24vw, (min-width: 600px) 30vw, 40vw' } = {}) {
  const tags = [p.brand ? 'brand-' + slugify(p.brand) : '', p.strainType ? 'type-' + slugify(p.strainType) : ''].filter(Boolean).join(' ');
  const live = liveMenu(ctx, cat.live);
  const meta = [p.strainType ? `<span class="s-pcard__type">${esc(p.strainType)}</span>` : '', p.size ? `<span>${esc(p.size)}</span>` : '', p.thc ? `<span>THC ${esc(p.thc)}</span>` : '', p.cbd ? `<span>CBD ${esc(p.cbd)}</span>` : ''].filter(Boolean).join('');
  const price = p.salePrice != null ? `${money(p.salePrice)} <s class="pcard__was">${money(p.price)}</s>` : money(p.price);
  return `<li class="s-grid__item" data-filter-item data-tags="${escA(tags)}">
<article class="pcard s-pcard" data-reveal style="--i:${i % 4}">
<a class="pcard__media s-pcard__media"${linkAttrs(live, { tabindex: '-1', 'aria-hidden': 'true' })}>${img({ src: p.image, alt: p.name }, { sizes })}</a>
<div class="s-pcard__body">
<p class="pcard__brand">${esc(p.brand)}</p>
<h3 class="pcard__name">${esc(p.name)}</h3>
<p class="pcard__meta">${meta}</p>
<p class="pcard__price">${price}</p>
<a class="pcard__cta s-pcard__cta"${linkAttrs(live, { 'aria-label': `Find ${p.name} on the live menu (opens in a new tab)` })}>Live menu${icon('arrow', 's-arr')}</a>
</div>
</article>
</li>`;
}

function offerCard(o, i, cls = '') {
  const t = String(o.title || '').replace(/\s+/g, ' ').trim();
  const d = String(o.description || '').replace(/\s+/g, ' ').trim();
  const showD = d && d.toLowerCase() !== t.toLowerCase();
  return `<li class="s-offer ${cls}" data-reveal style="--i:${i % 4}">
<article class="glass glass--leaf glass--lift s-offer__card">
<p class="s-offer__tag">${icon('tag', 's-offer__ico')}Offer</p>
<h3 class="s-offer__title">${esc(t)}</h3>
${showD ? `<p class="s-offer__desc">${esc(d)}</p>` : ''}
<a class="link-arrow s-offer__link"${linkAttrs(o.liveUrl, { 'aria-label': `View offer: ${t} (opens in a new tab)` })}>View offer${icon('ext', 's-ext')}</a>
</article>
</li>`;
}

function loyaltyBand(ctx, { headingTag = 'h2' } = {}) {
  const L = ctx.site.loyalty;
  return `<section class="band band--moss s-loyal" data-spot>
${bandClip()}
<div class="wrap s-loyal__grid">
<div class="s-loyal__text" data-reveal>
<p class="kicker">Loyalty rewards</p>
<${headingTag} class="s-loyal__title">Earn points each time you <span class="accent">shop</span></${headingTag}>
<p class="s-loyal__line">Points can be redeemed for discounts, exclusive products, or special promotional offers.</p>
</div>
<div class="btn-row s-loyal__ctas" data-reveal style="--i:1">
<a class="btn btn--leaf"${linkAttrs(L.signupUrl)}>${esc(L.signupLabel || 'Sign Up')}${icon('ext', 's-ext')}</a>
<a class="btn btn--glass"${linkAttrs(L.page || '/loyalty/')}>About the program</a>
</div>
</div>
</section>`;
}

function liveCta(ctx, { title = 'Shop the full live menu', line = 'Every category, live prices and availability, ready for pickup or delivery ordering on Uforia\'s own menu.' } = {}) {
  return `<section class="band band--beam s-cta" data-spot>
${bandClip()}
<div class="wrap s-cta__inner" data-reveal>
<h2 class="s-cta__title">${esc(title)}</h2>
<p class="s-cta__line">${esc(line)}</p>
<div class="btn-row s-cta__btns"><a class="btn btn--silver"${linkAttrs(liveMenu(ctx))}>Open the live menu${icon('ext', 's-ext')}</a><a class="btn btn--ghost"${linkAttrs('/deals/')}>See deals</a></div>
</div>
</section>`;
}

// ---------- /shop/ ----------
function shopPage(ctx) {
  const path = '/shop/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Shop' }];
  const tiles = cats(ctx).map((c, i) => `<li data-reveal style="--i:${i % 5}"><a class="glass glass--lift s-cat${c.art ? ' s-cat--art' : ' s-cat--gen'}"${linkAttrs('/products/' + c.slug + '/')}>
<span class="s-cat__media">${catArt(ctx, c, { alt: '', sizes: c.art ? '160px' : '(min-width: 1024px) 240px, 45vw' })}</span>
<span class="s-cat__name">${esc(c.name)}</span>
<span class="s-cat__go">${icon('arrow', 's-arr')}</span>
</a></li>`).join('\n');
  const rows = cats(ctx).filter((c) => products(ctx, c).length).map((c) => {
    const ps = products(ctx, c).slice(0, 4);
    return `<section class="s-row" aria-labelledby="row-${c.slug}">
<div class="s-row__head" data-reveal><h3 class="s-row__title" id="row-${c.slug}">${esc(c.name)}</h3><a class="link-arrow s-row__all"${linkAttrs('/products/' + c.slug + '/')}>Shop all ${esc(c.name)}${icon('arrow', 's-arr')}</a></div>
<ul class="s-grid s-grid--row" role="list">${ps.map((p, i) => pcard(ctx, c, p, i, { sizes: '(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 600px) 30vw, 40vw' })).join('\n')}</ul>
</section>`;
  }).join('\n');
  const main = `${hero({
    crumbs,
    kicker: 'Uforia Dispensary, Jersey City',
    h1: 'Shop',
    line: 'Every category on Uforia\'s live menu, from flower and pre-rolls to edibles, tinctures and accessories.',
    ctas: `<a class="btn btn--silver"${linkAttrs(liveMenu(ctx))}>Shop the live menu${icon('ext', 's-ext')}</a><a class="btn btn--glass"${linkAttrs('/deals/')}>See deals</a>`,
    media: photo(ctx, 'uf/Cannabis-dispensary-jersey-city-products.jpg', { alt: 'Display of cannabis products at Uforia Dispensary, featuring pre-rolls, flower, and various branded containers.', eager: true, sizes: '(min-width: 1024px) 560px, (min-width: 768px) 92vw, 64vw' }),
  })}
<section class="band s-after-hero s-cats" aria-labelledby="cats-h">
<div class="wrap">
<div class="s-head" data-reveal><p class="kicker">Categories</p><h2 class="s-h2" id="cats-h">Shop by <span class="accent">category</span></h2></div>
<ul class="s-catgrid" role="list">
${tiles}
</ul>
</div>
</section>
<section class="band band--void s-rows" aria-labelledby="rows-h">
<div class="wrap">
<div class="s-head" data-reveal><p class="kicker">From the menu</p><h2 class="s-h2" id="rows-h">On the shelves <span class="accent">now</span></h2><p class="s-note">${esc(snapNote(ctx))}</p></div>
${rows}
</div>
</section>
<section class="band s-offers" aria-labelledby="offers-h">
<div class="wrap">
<div class="s-head s-head--row" data-reveal><div><p class="kicker">Offers</p><h2 class="s-h2" id="offers-h">Deals on the live <span class="accent">menu</span></h2></div><a class="link-arrow"${linkAttrs('/deals/')}>All deals${icon('arrow', 's-arr')}</a></div>
<ul class="s-offers__strip" role="list">${(ctx.menu.offers || []).map((o, i) => offerCard(o, i, 's-offer--strip')).join('\n')}</ul>
</div>
</section>
${liveCta(ctx)}`;
  return { path, html: page({ ctx, path, title: 'Shop | Uforia Dispensary', description: 'Shop cannabis by category at Uforia Dispensary in Jersey City: flower, pre-rolls, vaporizers, edibles, concentrates, tinctures, topicals, beverages and accessories, with the live menu one click away.', crumbs, heroCrumbs: true, bodyClass: 'page-shop', main, jsonld: [crumbsLd(ctx, crumbs)] }) };
}

// ---------- /products/<cat>/ (the adopted LISTING) ----------
function listingPage(ctx, cat, idx) {
  const path = '/products/' + cat.slug + '/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop/' }, { label: cat.name }];
  const ps = products(ctx, cat);
  const live = liveMenu(ctx, cat.live);
  const offers = ctx.menu.offers || [];

  // hero media: the generated still when there is one (Uforia's line-art icon floats as a badge), else the icon art
  const media = cat.gen ? gimg(cat.gen, { eager: true, sizes: '(min-width: 1024px) 560px, (min-width: 768px) 92vw, 64vw' }) : `<span class="s-hero__art">${catArt(ctx, cat, { eager: true, sizes: '320px' })}</span>`;
  const badge = cat.gen && cat.art ? `<span class="glass glass--lit s-hero__badge" aria-hidden="true">${catArt(ctx, cat, { alt: '', sizes: '120px' })}</span>` : '';

  // filters (Brand, Type), each only with 2+ values
  const brands = uniq(ps.map((p) => p.brand).filter(Boolean));
  const types = uniq(ps.map((p) => p.strainType).filter(Boolean));
  const facet = (label, prefix, vals) => (vals.length < 2 ? '' : `<fieldset class="s-filter">
<legend class="s-filter__label">${label}</legend>
<div class="s-filter__chips">${vals.map((v) => `<button type="button" class="chip s-chip" data-filter="${prefix}-${slugify(v)}" aria-pressed="false">${esc(v)}</button>`).join('')}</div>
</fieldset>`);
  const facets = facet('Brand', 'brand', brands) + facet('Type', 'type', types);
  const catNav = `<nav class="s-catnav" aria-label="Product categories"><p class="s-filter__label">Categories</p><ul role="list">${cats(ctx).map((c) => `<li><a class="s-catnav__link"${linkAttrs('/products/' + c.slug + '/')}${c.slug === cat.slug ? ' aria-current="page"' : ''}>${esc(c.name)}</a></li>`).join('')}</ul></nav>`;

  // promo banner: an offer on even categories, loyalty on odd ones
  const o = offers.length ? offers[idx % offers.length] : null;
  const promo = idx % 2 === 0 && o ? `<li class="s-grid__promo" data-reveal><div class="glass glass--leaf s-promo">
<div class="s-promo__text"><p class="kicker">Offer on the live menu</p><p class="s-promo__title">${esc(o.title.replace(/\s+/g, ' '))}</p>${o.description && o.description.toLowerCase().replace(/\s+/g, ' ') !== o.title.toLowerCase().replace(/\s+/g, ' ') ? `<p class="s-promo__line">${esc(o.description)}</p>` : ''}</div>
<a class="btn btn--leaf btn--sm"${linkAttrs(o.liveUrl)}>View offer${icon('ext', 's-ext')}</a>
</div></li>` : `<li class="s-grid__promo" data-reveal><div class="glass glass--leaf s-promo">
<div class="s-promo__text"><p class="kicker">Loyalty rewards</p><p class="s-promo__title">Earn points each time you shop</p><p class="s-promo__line">Redeem them for discounts, exclusive products, or special promotional offers.</p></div>
<a class="btn btn--leaf btn--sm"${linkAttrs('/loyalty/')}>Join the program</a>
</div></li>`;

  const liveCard = `<li class="s-grid__live" data-reveal><a class="glass glass--lit glass--lift s-livecard"${linkAttrs(live)}>
<span class="s-livecard__ico">${icon('bag')}</span>
<span class="s-livecard__title">Shop the full live menu</span>
<span class="s-livecard__line">See every product in ${esc(cat.name)} with live prices and availability.</span>
<span class="s-livecard__go">Open ${esc(cat.liveName || cat.name)}${icon('ext', 's-ext')}</span>
</a></li>`;

  let body;
  if (ps.length) {
    const cards = ps.map((p, i) => pcard(ctx, cat, p, i));
    const at = ps.length > 6 ? 6 : cards.length;
    cards.splice(at, 0, promo);
    body = `<div class="s-list" data-filter-group>
<aside class="s-list__side" aria-label="Filter ${escA(cat.name)}">
<p class="s-count"><strong>${ps.length}</strong> ${ps.length === 1 ? 'product' : 'products'} in this snapshot</p>
${facets ? `<p class="s-filter__label s-filter__by">Filter results by</p><button type="button" class="chip s-chip s-chip--all" data-filter="all" aria-pressed="true">Show all</button>\n${facets}` : ''}
${catNav}
<p class="s-note s-note--side">${esc(snapNote(ctx))}</p>
</aside>
<div class="s-list__main">
<ul class="s-grid" role="list">
${cards.join('\n')}
${liveCard}
</ul>
</div>
</div>`;
  } else {
    body = `<div class="s-list s-list--empty">
<aside class="s-list__side" aria-label="${escA(cat.name)} navigation">${catNav}</aside>
<div class="s-list__main">
<div class="glass glass--lit s-empty" data-reveal>
<div class="s-empty__art">${cat.art ? catArt(ctx, cat, { alt: '', sizes: '220px' }) : gimg(cat.gen, { alt: '', sizes: '(min-width: 1024px) 420px, (min-width: 768px) 80vw, 54vw' })}</div>
<div class="s-empty__text">
<h2 class="s-empty__title">Browse ${esc(cat.name)} on the live menu</h2>
<p>See this category on Uforia's live menu for what is available today, with live prices.</p>
<a class="btn btn--silver"${linkAttrs(live)}>Browse ${esc(cat.name)}${icon('ext', 's-ext')}</a>
</div>
</div>
<p class="s-note">${esc(snapNote(ctx))}</p>
</div>
</div>`;
  }

  const rel = RELATED[cat.slug] || { cats: [], learn: [], pages: [] };
  const relCats = rel.cats.map((s) => catBySlug(ctx, s)).filter(Boolean).map((c) => `<li><a class="chip"${linkAttrs('/products/' + c.slug + '/')}>${esc(c.name)}</a></li>`).join('');
  const relLearn = [
    ...rel.learn.map((s) => learnBySlug(ctx, s)).filter(Boolean).map((g) => `<li><a class="link-arrow"${linkAttrs('/learn/' + (g.slug || slugify(g.title)) + '/')}>${esc(stripTags(g.title))}${icon('arrow', 's-arr')}</a></li>`),
    ...rel.pages.map((s) => `<li><a class="link-arrow"${linkAttrs('/' + s + '/')}>${esc(PAGE_LABEL[s])}${icon('arrow', 's-arr')}</a></li>`),
  ].join('');
  const about = `<section class="band band--void s-about" aria-labelledby="about-h">
<div class="wrap s-about__grid">
<div class="s-about__text" data-reveal>
<p class="kicker">About the format</p>
<h2 class="s-h2" id="about-h">About ${esc(cat.name)}</h2>
<div class="prose">${(ABOUT[cat.slug] || []).map((s) => `<p>${esc(s)}</p>`).join('')}</div>
</div>
<div class="s-about__links" data-reveal style="--i:1">
${relCats ? `<p class="s-filter__label">Related categories</p><ul class="s-chips" role="list">${relCats}</ul>` : ''}
${relLearn ? `<p class="s-filter__label">Learn more</p><ul class="s-learn" role="list">${relLearn}</ul>` : ''}
</div>
</div>
</section>`;

  const main = `${hero({
    crumbs,
    kicker: 'Shop by category',
    h1: esc(cat.name),
    line: cat.liveName ? esc(cat.liveName) : `${esc(cat.name)} at Uforia, with live prices and availability on the live menu.`,
    ctas: `<a class="btn btn--silver"${linkAttrs(live)}>Shop ${esc(cat.name)} live${icon('ext', 's-ext')}</a><a class="btn btn--glass"${linkAttrs('/shop/')}>All categories</a>`,
    media,
    mediaCls: cat.gen ? '' : 's-hero__frame--art',
    badge,
  })}
<section class="band s-after-hero s-listing" aria-label="${escA(cat.name)} products">
<div class="wrap wrap--wide">
${body}
</div>
</section>
${about}
${loyaltyBand(ctx)}`;
  const title = `${cat.name} | Uforia Dispensary`;
  const description = ps.length
    ? `${cat.name} at Uforia Dispensary in Jersey City: products from the menu with brand, type, size and price, and a link to the live menu for live prices and availability.`
    : `${cat.name} at Uforia Dispensary in Jersey City: browse this category on Uforia's live menu for live prices and availability.`;
  return { path, html: page({ ctx, path, title, description, crumbs, heroCrumbs: true, bodyClass: 'page-listing', main, jsonld: [crumbsLd(ctx, crumbs)] }) };
}

// ---------- /deals/ ----------
function dealsPage(ctx) {
  const rec = ctx.content.deals;
  const path = rec.path;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Deals' }];
  const blocks = rec.sections.flatMap((s) => s.blocks || []);
  const divider = blocks.find((b) => b.type === 'p' && b.role === 'divider-text');
  const ps = blocks.filter((b) => b.type === 'p' && b.role !== 'divider-text');
  const btn = blocks.find((b) => b.type === 'button');
  // Uforia's own "LIMITED OFFER!" clip is a badge on black that animates away: screen-blended over a jars still, the
  // black drops out and the badge plays over the light (main session, after the lane)
  const media = `<div class="s-deals__stack">${gimg('g-jars', { alt: '', sizes: '(min-width: 1024px) 560px, (min-width: 768px) 92vw, 64vw', cls: 's-deals__img', eager: true })}<video class="s-deals__video" poster="/assets/media/uf-deals.jpg" width="1280" height="720" muted autoplay loop playsinline preload="metadata" aria-hidden="true"><source src="/assets/media/uf-deals-sm.mp4" type="video/mp4" media="(max-width: 767px)"><source src="/assets/media/uf-deals.mp4" type="video/mp4"></video></div>
<button type="button" class="s-vtoggle" data-video-toggle aria-pressed="false" aria-label="Pause the deals video">${icon('close', 's-vtoggle__ico')}<span>Pause</span></button>`;
  const main = `${hero({
    crumbs,
    kicker: esc(stripTags(divider ? divider.html : 'Deals')),
    h1: esc(rec.h1),
    line: 'Cannabis offers from Uforia\'s live menu, each with a link to the offer itself.',
    ctas: `${btn ? capBtn(ctx, btn) : ''}<a class="btn btn--glass"${linkAttrs('#offers')}>See the offers</a>`,
    media,
    mediaCls: 's-deals__frame',
    cls: 's-hero--deals',
  })}
<section class="band s-after-hero s-dealtext" aria-label="About our deals">
<div class="wrap wrap--narrow prose" data-reveal>
${ps.map((b) => `<p>${b.html}</p>`).join('\n')}
</div>
</section>
<section class="band band--void s-offers s-offers--deals" id="offers" aria-labelledby="offers-h">
${bandClip()}
<div class="wrap">
<div class="s-head" data-reveal><p class="kicker">On the live menu</p><h2 class="s-h2" id="offers-h">Exclusive offers from Uforia <span class="accent">Dispensary</span></h2><p class="s-note">Offers as listed on the live menu on ${esc(fmtDate(ctx.menu.capturedAt))}. Each card opens the offer on the live menu.</p></div>
<ul class="s-offers__grid" role="list">${(ctx.menu.offers || []).map((o, i) => offerCard(o, i)).join('\n')}</ul>
</div>
</section>
${loyaltyBand(ctx)}`;
  return { path, html: page({ ctx, path, title: rec.title, description: rec.description, canonical: rec.canonical, og: { title: rec.og && rec.og.title, description: rec.og && rec.og.description }, crumbs, heroCrumbs: true, bodyClass: 'page-deals', main, jsonld: [crumbsLd(ctx, crumbs)] }) };
}

// ---------- /brands/ ----------
function brandsPage(ctx) {
  const rec = ctx.content.brands;
  const path = rec.path;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Brands' }];
  const s1 = rec.sections[1].blocks;
  const heroImg = s1.find((b) => b.type === 'img');
  const divider = s1.find((b) => b.type === 'p' && b.role === 'divider-text');
  const intro = s1.filter((b) => b.type === 'p' && b.role !== 'divider-text');
  const btn = s1.find((b) => b.type === 'button');
  const groups = rec.sections.slice(2).map((s, si) => {
    const pairs = [];
    let cur = null;
    for (const b of s.blocks || []) {
      if (b.type === 'img') { cur = { img: b, ps: [] }; pairs.push(cur); } else if (b.type === 'p') { if (!cur) { cur = { img: null, ps: [] }; pairs.push(cur); } cur.ps.push(b); }
    }
    return `<ul class="s-brandrow s-brandrow--${pairs.length}" role="list">${pairs.map((p, i) => `<li data-reveal style="--i:${i}"><article class="glass glass--lift s-brand">
<div class="s-brand__chip">${p.img ? `<img src="${escA(p.img.src)}" width="${p.img.w}" height="${p.img.h}" alt="${escA(p.img.alt)}" loading="lazy" decoding="async">` : ''}</div>
<div class="s-brand__text">${p.ps.map((b) => `<p>${b.html}</p>`).join('')}</div>
</article></li>`).join('\n')}</ul>`;
  }).join('\n');
  const main = `${hero({
    crumbs,
    kicker: esc(stripTags(divider ? divider.html : 'Brands')),
    h1: esc(rec.h1),
    line: 'The cannabis brands Uforia carries, from respected high-end names to local craft cultivators.',
    ctas: `${btn ? capBtn(ctx, btn, 'btn btn--silver') : ''}<a class="btn btn--glass"${linkAttrs(liveMenu(ctx))}>Shop the live menu${icon('ext', 's-ext')}</a>`,
    media: heroImg ? img({ src: heroImg.src, alt: heroImg.alt, w: heroImg.w, h: heroImg.h }, { eager: true, sizes: '(min-width: 1024px) 480px, (min-width: 768px) 360px, 64vw' }) : '',
    mediaCls: 's-hero__frame--square',
  })}
<section class="band s-after-hero s-brandintro" aria-label="Our selection">
<div class="wrap wrap--narrow prose" data-reveal>
${intro.map((b) => paras(b.html)).join('\n')}
</div>
</section>
<section class="band band--void s-brands" aria-labelledby="brands-h">
${bandClip()}
<div class="wrap">
<div class="s-head" data-reveal><p class="kicker">Premium brands at Uforia Dispensary</p><h2 class="s-h2" id="brands-h">Discover the <span class="accent">brands</span></h2></div>
${groups}
</div>
</section>
${liveCta(ctx, { title: 'Find these brands on the live menu', line: 'Search the live menu by brand to see what is in stock today.' })}`;
  return { path, html: page({ ctx, path, title: rec.title, description: rec.description, canonical: rec.canonical, og: { title: rec.og && rec.og.title, description: rec.og && rec.og.description }, crumbs, heroCrumbs: true, bodyClass: 'page-brands', main, jsonld: [crumbsLd(ctx, crumbs)] }) };
}

// ---------- /loyalty/ (the adopted REWARDS template) ----------
function loyaltyPage(ctx) {
  const rec = ctx.content.loyalty;
  const path = rec.path;
  const L = ctx.site.loyalty;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Loyalty' }];
  const blocks = rec.sections.flatMap((s) => s.blocks || []);
  const btns = blocks.filter((b) => b.type === 'button');
  const signBtns = btns.filter((b) => /alpineiq|sign/i.test(b.href + b.text));
  const shopBtn = btns.find((b) => /^shop/i.test(b.text));
  const heroImg = blocks.find((b) => b.type === 'img');
  const divider = blocks.find((b) => b.type === 'p' && b.role === 'divider-text');
  const body = blocks.filter((b) => b.type === 'p' && b.role !== 'divider-text');
  const signUp = (b) => `<a class="btn btn--leaf"${linkAttrs(L.signupUrl)}>${esc(b ? b.text : L.signupLabel)}${icon('ext', 's-ext')}</a>`;
  const shopNow = shopBtn ? capBtn(ctx, shopBtn, 'btn btn--glass') : '';
  const steps = [
    { ico: 'user', t: 'Join', d: 'Sign up for the Uforia Dispensary loyalty program.' },
    { ico: 'bag', t: 'Earn', d: 'Earn points each time you shop.' },
    { ico: 'gift', t: 'Redeem', d: 'Redeem points for discounts, exclusive products, or special promotional offers.' },
  ];
  const perks = [
    { ico: 'star', t: 'Early access', d: 'Early access to new products.' },
    { ico: 'id', t: 'Members-only events', d: 'Events for loyalty members.' },
    { ico: 'tag', t: 'Personalized offers', d: 'Offers based on your preferences and purchase history.' },
  ];
  const main = `${hero({
    crumbs,
    kicker: esc(stripTags(divider ? divider.html : 'Rewards program')),
    h1: esc(rec.h1),
    line: 'Earn points each time you shop at Uforia, for every customer, however often you visit.',
    ctas: `${signUp(signBtns[0])}${shopNow}`,
    media: heroImg ? img({ src: heroImg.src, alt: heroImg.alt, w: heroImg.w, h: heroImg.h }, { eager: true, sizes: '(min-width: 1024px) 560px, (min-width: 768px) 92vw, 64vw' }) : '',
  })}
<section class="band s-after-hero s-rintro" aria-label="The program">
<div class="wrap wrap--narrow" data-reveal>
<div class="prose s-rintro__text">${body.map((b) => paras(b.html)).join('\n')}</div>
<div class="btn-row s-rintro__ctas">${signUp(signBtns[1] || signBtns[0])}${shopNow}</div>
</div>
</section>
<section class="band band--void s-steps" aria-labelledby="steps-h">
${bandClip()}
<div class="wrap">
<div class="s-head s-head--center" data-reveal><p class="kicker">Three steps</p><h2 class="s-h2" id="steps-h">How it <span class="accent">works</span></h2></div>
<ol class="s-steps__list" role="list">${steps.map((s, i) => `<li class="glass glass--lit glass--lift s-step" data-reveal style="--i:${i}">
<span class="s-step__n" aria-hidden="true">${i + 1}</span>
<span class="s-step__ico">${icon(s.ico)}</span>
<h3 class="s-step__t">${esc(s.t)}</h3>
<p class="s-step__d">${esc(s.d)}</p>
</li>`).join('\n')}</ol>
</div>
</section>
<section class="band s-perks" aria-labelledby="perks-h">
<div class="wrap">
<div class="s-head s-head--center" data-reveal><p class="kicker">Member perks</p><h2 class="s-h2" id="perks-h">Perks for <span class="accent">members</span></h2></div>
<ul class="s-perks__list" role="list">${perks.map((p, i) => `<li class="s-perk" data-reveal style="--i:${i}">
<span class="s-perk__ico">${icon(p.ico)}</span>
<h3 class="s-perk__t">${esc(p.t)}</h3>
<p class="s-perk__d">${esc(p.d)}</p>
</li>`).join('\n')}</ul>
</div>
</section>
<section class="band band--moss s-loyal s-loyal--end" data-spot>
${bandClip()}
<div class="wrap s-loyal__grid">
<div class="s-loyal__text" data-reveal><p class="kicker">Join today</p><h2 class="s-loyal__title">Start earning on your next <span class="accent">visit</span></h2></div>
<div class="btn-row s-loyal__ctas" data-reveal style="--i:1">${signUp(null)}<a class="btn btn--glass"${linkAttrs(liveMenu(ctx))}>Shop Now${icon('ext', 's-ext')}</a></div>
</div>
</section>`;
  return { path, html: page({ ctx, path, title: rec.title, description: rec.description, canonical: rec.canonical, og: { title: rec.og && rec.og.title, description: rec.og && rec.og.description }, crumbs, heroCrumbs: true, bodyClass: 'page-loyalty', main, jsonld: [crumbsLd(ctx, crumbs)] }) };
}

export async function render(ctx) {
  const out = [shopPage(ctx)];
  cats(ctx).forEach((c, i) => out.push(listingPage(ctx, c, i)));
  out.push(dealsPage(ctx), brandsPage(ctx), loyaltyPage(ctx));
  return out;
}
