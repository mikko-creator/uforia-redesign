// home.mjs - the home page "/" (HOME lane, "SILVER NOCTURNE"). Section order = the adopted operator's home (contract 6
// HOME); every captured word of src/content/pages/home.json is rendered (tools/words-check.mjs --only home). Facts come
// from ctx.site / ctx.menu / ctx.posts / delivery.json, never retyped. New words are neutral glue only (kickers, button
// labels, one-line intros, alt text). No inline JS; root-absolute URLs only in HTML attributes (contract D6).
import fs from 'node:fs';
import path from 'node:path';
import { page, icon } from './shell.mjs';
import { esc, escA, linkAttrs, gimg, img, photo, liveMenu, serviceAreas } from './util.mjs';
import { ROOT } from '../lib/paths.mjs';

const must = (v, what) => { if (v == null || v === '' || (Array.isArray(v) && !v.length)) throw new Error('home: missing content: ' + what); return v; };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : ''; };
const titleCase = (s) => String(s || '').toLowerCase().replace(/_/g, ' ').replace(/\b[a-z]/g, (c) => c.toUpperCase());

// captured inline HTML: links to the old /menu... go to the live menu (absolute), everything else is kept as captured
const fixHtml = (ctx, html) => String(html || '').replace(/href="\/menu([^"]*)"/g, (_, rest) => `href="${escA(ctx.site.liveMenu.base + rest.replace(/\/$/, ''))}" target="_blank" rel="noopener"`);
// a captured button: /menu... -> live menu, the rest through href()
const btnHref = (ctx, h) => (/^\/menu(\/|$)/.test(h) || /^https:\/\/uforiadispensary\.com\/menu/.test(h) ? liveMenu(ctx) : h);

// the captured sections by id / heading
function sec(home, id) { return must((home.sections || []).find((s) => s.id === id), 'home.json section ' + id); }
const blocks = (s, type) => (s.blocks || []).filter((b) => b.type === type);

// the hero loop (images.json media 'hero-mist'), only when its files are on disk (fail closed: else the mist still)
function heroLoop(ctx) {
  const m = ((ctx.images && ctx.images.media) || {})['hero-mist'];
  if (!m) return null;
  const ok = (u) => typeof u === 'string' && u.startsWith('/assets/media/') && fs.existsSync(path.join(ROOT, u.slice(1)));
  if (!ok(m.mp4) || !ok(m.poster)) return null;
  return { mp4: m.mp4, mp4Small: ok(m.mp4Small) ? m.mp4Small : '', poster: m.poster, posterSmall: ok(m.posterSmall) ? m.posterSmall : '' };
}

const head = (kicker, hHtml, id, cls = '') => `<div class="h-head ${cls}" data-reveal>${kicker ? `<p class="kicker h-kicker">${esc(kicker)}</p>` : ''}<h2 id="${id}" class="display h-head__h">${hHtml}</h2></div>`;
// one thin italic accent word (the last), text unchanged
function accentLast(s) {
  const t = String(s).trim();
  const i = t.lastIndexOf(' ');
  return i === -1 ? `<span class="accent">${esc(t)}</span>` : `${esc(t.slice(0, i))} <span class="accent">${esc(t.slice(i + 1))}</span>`;
}

export async function render(ctx) {
  const site = must(ctx.site, 'site.json');
  const home = must(ctx.content && ctx.content.home, 'pages/home.json');
  const menu = must(ctx.menu, 'menu.json');
  const posts = must(ctx.posts, 'posts');
  const live = liveMenu(ctx);
  const cats = must(site.liveMenu && site.liveMenu.categories, 'liveMenu.categories');
  const catBy = (slug) => must(cats.find((c) => c.slug === slug), 'category ' + slug);

  // ---------- 1. hero stage ----------
  const s1 = sec(home, 'cannabis-dispensary-jersey-city');
  const display = must(blocks(s1, 'h2')[0], 'hero display line').text;
  const welcome = must(blocks(s1, 'p')[0], 'hero welcome').html;
  const shopBtn = must(blocks(s1, 'button')[0], 'hero button');
  const loop = heroLoop(ctx);
  const film = loop
    ? `<div class="h-hero__film"><picture>${loop.posterSmall ? `<source media="(max-width: 720px)" srcset="${escA(loop.posterSmall)}">` : ''}<img class="h-hero__poster" src="${escA(loop.poster)}" alt="" width="1920" height="1080" decoding="async" fetchpriority="high"></picture><video class="h-hero__video" autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1">${loop.mp4Small ? `<source src="${escA(loop.mp4Small)}" type="video/mp4" media="(max-width: 720px)">` : ''}<source src="${escA(loop.mp4)}" type="video/mp4"></video></div>`
    : `<div class="h-hero__film">${gimg('g-mist-veil', { alt: '', eager: true, cls: 'h-hero__poster' })}</div>`;
  const toggle = loop ? `<button class="h-hero__toggle btn btn--glass btn--sm" type="button" data-video-toggle aria-pressed="false">${icon('close', 'h-hero__toggle-ico')}<span class="h-hero__toggle-t">Pause motion</span></button>` : '';

  const offer = must((menu.offers || [])[0], 'menu offer');
  const slides = [
    { href: '/delivery/', ico: 'truck', k: 'Delivery', t: must(site.delivery && site.delivery.freeOver, 'delivery.freeOver') },
    { href: '/loyalty/', ico: 'gift', k: 'Loyalty rewards', t: 'Earn points each time you shop.' },
    { href: '/deals/', ico: 'tag', k: 'Deals', t: offer.title.replace(/\s+/g, ' ') },
  ];
  const rotator = `<div class="h-promos glass glass--lit" data-rotator role="region" aria-roledescription="carousel" aria-label="Uforia promotions">
<div class="rotator__stage h-promos__stage">
${slides.map((s) => `<a class="h-promo" data-slide${linkAttrs(s.href)}><span class="h-promo__ico" aria-hidden="true">${icon(s.ico)}</span><span class="h-promo__txt"><span class="h-promo__k">${esc(s.k)}</span><span class="h-promo__t">${esc(s.t)}</span></span>${icon('arrow', 'h-promo__go')}</a>`).join('\n')}
</div>
<div class="h-promos__dots" data-rotator-dots></div>
</div>`;

  const heroHtml = `<section class="h-hero band band--void" data-spot aria-labelledby="h-hero-h1">
<div class="band__clip h-hero__clip" aria-hidden="true">${film}<span class="h-hero__scrim"></span><span class="h-hero__pool"></span><span class="h-hero__beam"></span><span class="haze h-hero__haze"></span><span class="h-hero__vig"></span></div>
<div class="wrap wrap--wide h-hero__inner">
<div class="h-hero__copy">
<h1 id="h-hero-h1" class="h-hero__h1" data-reveal><span class="h-dot" aria-hidden="true"></span>${esc(home.h1)}</h1>
<h2 class="display h-hero__display" data-reveal style="--i:2">${accentLast(display)}</h2>
<p class="lede h-hero__lede" data-reveal style="--i:3">${welcome}</p>
<div class="btn-row h-hero__ctas" data-reveal style="--i:4"><a class="btn btn--silver"${linkAttrs(btnHref(ctx, shopBtn.href))}>${esc(shopBtn.text)}${icon('arrow')}</a><a class="btn btn--glass"${linkAttrs('/locations/')}>${icon('pin')}Find Us</a></div>
<div class="h-hero__promos" data-reveal style="--i:5">${rotator}</div>
</div>
<div class="h-hero__stage" aria-hidden="true">
<span class="h-hero__halo"></span>
<div class="h-hero__bud" data-depth="0.08">${gimg('g-hero-bud', { alt: '', eager: true, cls: 'h-hero__bud-img', sizes: '(max-width: 720px) 64vw, 62vw' })}</div>
</div>
</div>
${toggle}
</section>
<div class="h-seam" aria-hidden="true"><div class="h-seam__leaf screen protrude"><div data-depth="0.18">${gimg('g-leaf-silver', { alt: '', cls: 'h-seam__img', sizes: '(max-width: 720px) 34vw, 22vw' })}</div></div></div>`;

  // ---------- 2. promo tiles: deals, delivery, loyalty, brands ----------
  const tiles = [
    { href: '/deals/', k: 'Deals', t: 'Deals at Uforia', line: offer.title.replace(/\s+/g, ' '), media: photo(ctx, 'uf/Cannabis-dispensary-jersey-city-products.webp', { alt: 'Cannabis products on display at Uforia Dispensary, with pre-rolls, flower containers and branded packaging.', sizes: '(max-width: 720px) 46vw, 25vw' }) },
    { href: '/delivery/', k: 'Delivery', t: 'Cannabis delivery', line: site.delivery.freeOver, media: photo(ctx, 'uf/Cannabis-Delivery-in-Jersey-1.jpg', { alt: 'Uforia Dispensary delivery packaging with the cannabis leaf logo.', sizes: '(max-width: 720px) 46vw, 25vw' }) },
    { href: '/loyalty/', k: 'Loyalty', t: 'Loyalty rewards', line: 'Earn points each time you shop.', media: photo(ctx, 'uf/cannabis-dispensary-jersey-city.jpg', { alt: 'Inside Uforia Dispensary: display shelves and the green wall with the Uforia logo.', sizes: '(max-width: 720px) 46vw, 25vw' }) },
    { href: '/brands/', k: 'Brands', t: 'Our brands', line: 'The brands on Uforia\'s shelves.', media: photo(ctx, 'uf/uforia-2-1.jpg', { alt: 'Tinctures, gummies and vape pens on display at Uforia Dispensary.', sizes: '(max-width: 720px) 46vw, 25vw' }) },
  ];
  const tilesHtml = `<section class="h-tiles band" aria-labelledby="h-tiles-h">
<div class="band__clip" aria-hidden="true"><span class="h-tiles__pool"></span></div>
<div class="wrap">
${head('Uforia Dispensary', 'Deals, delivery and <span class="accent">rewards</span>', 'h-tiles-h', 'h-head--center')}
<ul class="h-tiles__grid" role="list">
${tiles.map((t, i) => `<li class="h-tiles__item" data-reveal style="--i:${i}"><a class="h-tile frame-u"${linkAttrs(t.href)}><span class="h-tile__media">${t.media}</span><span class="h-tile__body"><span class="h-tile__k">${esc(t.k)}</span><span class="h-tile__t">${esc(t.t)}</span><span class="h-tile__line">${esc(t.line)}</span><span class="h-tile__go">View ${esc(t.k.toLowerCase())}${icon('arrow')}</span></span></a></li>`).join('\n')}
</ul>
</div>
</section>`;

  // ---------- 3. shop our live inventory: Uforia's own category art + the "Premium Cannabis Products" copy ----------
  const sP = sec(home, 'premium-cannabis-products-flowers-edibles-concentrates');
  const pP = must(blocks(sP, 'p')[0], 'premium p');
  const pBtn = must(blocks(sP, 'button')[0], 'premium button');
  const ORDER = ['flower', 'pre-rolls', 'vaporizers', 'edibles', 'concentrates', 'topicals', 'accessories-and-merch'];
  const catTiles = ORDER.map(catBy).filter((c) => c.art);
  const catsHtml = `<section class="h-cats band band--lit" aria-labelledby="h-cats-h">
<div class="band__clip" aria-hidden="true"><span class="h-cats__pool"></span><span class="haze h-cats__haze"></span></div>
<div class="wrap">
<div class="h-cats__top">
${head('Shop our live inventory', esc(sP.heading), 'h-cats-h')}
<div class="h-cats__intro prose" data-reveal style="--i:1"><p>${fixHtml(ctx, pP.html)}</p><p class="btn-row"><a class="btn btn--silver"${linkAttrs(btnHref(ctx, pBtn.href))}>${esc(pBtn.text)}${icon('arrow')}</a></p></div>
</div>
<ul class="h-cats__grid" role="list">
${catTiles.map((c, i) => `<li class="h-cats__item" data-reveal style="--i:${i}"><a class="h-cat glass" data-tilt${linkAttrs('/products/' + c.slug + '/')}><span class="h-cat__art">${photo(ctx, c.art, { alt: c.name, sizes: '160px' })}</span><span class="h-cat__name">${esc(c.name)}${icon('arrow', 'h-cat__go')}</span></a></li>`).join('\n')}
</ul>
</div>
</section>`;

  // ---------- 4. product row: Flower from the menu snapshot ----------
  const flower = must((menu.categories || []).find((c) => c.slug === 'flower'), 'menu flower');
  const prods = must(flower.products, 'flower products').filter((p) => p.image).slice(0, 8);
  const pcard = (p, i) => {
    const name = String(p.name).split(' | ')[0];
    const meta = [p.strainType ? titleCase(p.strainType) : '', p.size || '', p.thc ? 'THC ' + p.thc : ''].filter(Boolean);
    const price = p.salePrice != null ? `<span class="pcard__price">$${esc(p.salePrice)}</span> <s class="pcard__was">$${esc(p.price)}</s>` : `<span class="pcard__price">$${esc(p.price)}</span>`;
    return `<li class="h-prods__item" data-reveal style="--i:${i % 4}"><a class="pcard h-pcard"${linkAttrs('/products/flower/')}><span class="pcard__media h-pcard__media">${img({ src: p.image, alt: `${titleCase(name)}, ${p.brand}` }, { sizes: '(max-width: 720px) 62vw, 260px' })}</span><span class="h-pcard__body"><span class="pcard__brand">${esc(p.brand)}</span><span class="pcard__name">${esc(titleCase(name))}</span><span class="pcard__meta">${meta.map((m) => `<span>${esc(m)}</span>`).join('')}</span><span class="h-pcard__foot">${price}<span class="pcard__cta">View${icon('arrow')}</span></span></span></a></li>`;
  };
  const prodsHtml = `<section class="h-prods band" aria-labelledby="h-prods-h">
<div class="wrap">
<div class="h-row__top">
${head('From the menu', 'Flower', 'h-prods-h')}
<a class="link-arrow h-row__all"${linkAttrs('/products/flower/')} data-reveal>Shop all flower${icon('arrow')}</a>
</div>
<ul class="h-prods__row" role="list">
${prods.map(pcard).join('\n')}
</ul>
<p class="h-note">Menu snapshot, prices on the <a${linkAttrs(liveMenu(ctx, 'flower'))}>live menu</a>.</p>
</div>
</section>`;

  // ---------- 5a. delivery service (captured section-2) ----------
  const s2 = sec(home, 'section-2');
  const s2img = must(blocks(s2, 'img')[0], 'section-2 img');
  const s2h = must(blocks(s2, 'h2')[0], 'section-2 h2');
  const s2p = must(blocks(s2, 'p')[0], 'section-2 p');
  const s2b = must(blocks(s2, 'button')[0], 'section-2 button');
  const deliveryHtml = `<section class="h-deliv band band--beam" aria-labelledby="h-deliv-h">
<div class="band__clip" aria-hidden="true"><span class="h-deliv__pool"></span><span class="haze h-deliv__haze"></span></div>
<div class="wrap h-deliv__inner">
<figure class="h-deliv__media frame-u" data-reveal><div class="h-deliv__img" data-depth="0.06">${img({ src: s2img.src, alt: s2img.alt, w: s2img.w, h: s2img.h }, { sizes: '(max-width: 720px) 92vw, 50vw' })}</div></figure>
<div class="h-deliv__copy">
<p class="kicker h-kicker" data-reveal>Delivery</p>
<h2 id="h-deliv-h" class="display h-deliv__h" data-reveal style="--i:1">${esc(s2h.text)}</h2>
<div class="prose h-deliv__p" data-reveal style="--i:2"><p>${fixHtml(ctx, s2p.html)}</p></div>
<div class="btn-row" data-reveal style="--i:3"><a class="btn btn--glass"${linkAttrs(btnHref(ctx, s2b.href))}>${esc(s2b.text)}${icon('arrow')}</a><a class="link-arrow"${linkAttrs('/delivery/')}>Delivery details${icon('arrow')}</a></div>
</div>
</div>
</section>`;

  // ---------- 5b. benefits: five icon boxes as glass cards; the closing paragraph stays between them ----------
  const sB = sec(home, 'benefits-of-our-cannabis-delivery-service');
  const iconCards = (s, start) => {
    const out = [];
    let pendingImg = null;
    for (const b of s.blocks || []) {
      if (b.type === 'img') pendingImg = b;
      if (b.type === 'icon-box') { out.push({ img: pendingImg, title: b.title, html: b.html }); pendingImg = null; }
    }
    return out.map((c, i) => `<li class="h-ben__item" data-reveal style="--i:${start + i}"><article class="h-ben glass glass--lit glass--lift"><span class="h-ben__ico">${c.img ? img({ src: c.img.src, alt: '', w: c.img.w, h: c.img.h }, { sizes: '48px' }) : icon('leaf')}</span><h3 class="h-ben__t">${esc(c.title)}</h3><p class="h-ben__p">${fixHtml(ctx, c.html)}</p></article></li>`).join('\n');
  };
  const s4 = sec(home, 'section-4');
  const s5 = sec(home, 'section-5');
  const s6 = sec(home, 'section-6');
  const benHtml = `<section class="h-bens band" aria-labelledby="h-bens-h">
<div class="band__clip" aria-hidden="true"><span class="h-bens__pool"></span></div>
<div class="wrap">
${head('Why Uforia', accentLast(sB.heading), 'h-bens-h', 'h-head--center')}
<ul class="h-bens__grid h-bens__grid--3" role="list">
${iconCards(s4, 0)}
</ul>
<div class="h-bens__mid" data-reveal><p>${fixHtml(ctx, must(blocks(s5, 'p')[0], 'section-5 p').html)}</p></div>
<ul class="h-bens__grid h-bens__grid--2" role="list">
${iconCards(s6, 0)}
</ul>
</div>
</section>`;

  // ---------- 5c. high-quality delivery + dispensary services: editorial band, a Uforia photo breaking its frame ----------
  const sH = sec(home, 'high-quality-cannabis-delivery-and-dispensary-services-in-th');
  const edHtml = `<section class="h-ed band band--lit" aria-labelledby="h-ed-h">
<div class="band__clip" aria-hidden="true"><span class="h-ed__pool"></span><span class="haze h-ed__haze"></span></div>
<div class="wrap h-ed__inner">
<div class="h-ed__copy">
${head('Delivery and dispensary', esc(sH.heading), 'h-ed-h')}
<div class="prose h-ed__prose" data-reveal style="--i:1">${blocks(sH, 'p').map((p) => `<p>${fixHtml(ctx, p.html)}</p>`).join('\n')}</div>
</div>
<div class="h-ed__art">
<div class="h-ed__frame frame-u" aria-hidden="true"></div>
<figure class="h-ed__photo frame-u" data-tilt data-reveal style="--i:2">${photo(ctx, 'uf/cannabis-dispensary-jersey-city-1.jpg', { alt: 'Uforia Dispensary interior in Jersey City: product displays and illuminated signage.', sizes: '(max-width: 720px) 80vw, 34vw' })}</figure>
</div>
</div>
</section>`;

  // ---------- 5d. BRANDS: every logo as a light chip in a marquee ----------
  const sBr = sec(home, 'brands');
  const logos = must(blocks(sec(home, 'section-10'), 'img'), 'brand logos');
  const brandsHtml = `<section class="h-brands band" aria-labelledby="h-brands-h">
<div class="wrap">
<div class="h-row__top">
${head('Brands we carry', esc(sBr.heading), 'h-brands-h')}
<a class="link-arrow h-row__all"${linkAttrs('/brands/')} data-reveal>All brands${icon('arrow')}</a>
</div>
</div>
<div class="h-brands__marquee" data-marquee data-reveal>
${logos.map((l) => `<span class="h-logo">${img({ src: l.src, alt: l.alt, w: l.w, h: l.h }, { sizes: '160px' })}</span>`).join('\n')}
</div>
</section>`;

  // ---------- 5e. LOYALTY REWARDS PROGRAM: the green-breath glass band ----------
  const sL = sec(home, 'loyalty-rewards-program');
  const lP = must(blocks(sL, 'p')[0], 'loyalty p');
  const lB = must(blocks(sL, 'button')[0], 'loyalty button');
  const loyaltyHtml = `<section class="h-loyal band band--moss" aria-labelledby="h-loyal-h">
<div class="band__clip" aria-hidden="true">${gimg('g-silver-dust', { alt: '', cls: 'band__bg h-loyal__bg', sizes: '100vw' })}<span class="h-loyal__veil"></span><span class="haze h-loyal__haze"></span></div>
<div class="wrap">
<div class="h-loyal__pane glass glass--leaf glass--lit" data-reveal data-spot>
<span class="h-loyal__ico" aria-hidden="true">${icon('gift')}</span>
<div class="h-loyal__copy">
<p class="kicker h-kicker">Loyalty rewards</p>
<h2 id="h-loyal-h" class="display h-loyal__h">${esc(sL.heading)}</h2>
<p class="h-loyal__p">${fixHtml(ctx, lP.html)}</p>
</div>
<div class="btn-row h-loyal__ctas"><a class="btn btn--leaf"${linkAttrs(btnHref(ctx, lB.href))}>${esc(lB.text)}${icon('arrow')}</a>${site.loyalty && site.loyalty.signupUrl ? `<a class="btn btn--ghost"${linkAttrs(site.loyalty.signupUrl)}>${esc(site.loyalty.signupLabel || 'Sign Up')}${icon('ext')}</a>` : ''}</div>
</div>
</div>
</section>`;

  // ---------- 6. store card + 7. areas we serve (captured "Visit your trusted Jersey City Dispensary") ----------
  const sV = sec(home, 'visit-your-trusted-jersey-city-dispensary');
  const vH2 = blocks(sV, 'h2');
  const areasH = must(vH2.find((b) => /areas we serve/i.test(b.text)), 'Areas We Serve h2');
  const areasUl = must(blocks(sV, 'ul')[0], 'areas list');
  const areasBtn = must(blocks(sV, 'button')[0], 'areas button');
  const hours = must(site.hours && site.hours.rows, 'hours rows');
  const store = (serviceAreas(ctx).find((a) => a.store) || { path: '/jersey-city-dispensary/' }).path;
  const storeHtml = `<section class="h-store band band--beam" aria-labelledby="h-store-h">
<div class="band__clip" aria-hidden="true"><span class="h-store__pool"></span></div>
<div class="wrap h-store__inner">
<div class="h-store__map frame-u" data-reveal><iframe class="h-store__iframe" src="${escA(site.mapEmbed)}" title="Map: Uforia Dispensary, ${escA(site.address.line)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
<div class="h-store__card glass glass--strong glass--lit" data-reveal style="--i:1">
<p class="kicker h-kicker"><span class="h-dot" aria-hidden="true"></span>You're shopping ${esc(site.mode)} at</p>
<h2 id="h-store-h" class="display h-store__h">${esc(sV.heading)}</h2>
<p class="h-store__name">${esc(site.name)}, ${esc(site.address.city)}</p>
<address class="h-store__addr">${icon('pin')}<span>${esc(site.address.street)}<br>${esc(site.address.city)}, ${esc(site.address.state)} ${esc(site.address.zip)}</span></address>
<div class="h-store__hours"><p class="h-store__label">${icon('clock')}Store hours</p><dl>${hours.map((r) => `<div class="h-store__row"><dt>${esc(r.days)}</dt><dd>${esc(r.open)} to ${esc(r.close)}</dd></div>`).join('')}</dl></div>
<ul class="h-store__contact" role="list">
<li><a${linkAttrs(site.phone.href)}>${icon('phone')}${esc(site.phone.display)}</a><span class="h-store__vanity">${esc(site.phone.vanity)}</span></li>
<li><a${linkAttrs('mailto:' + site.email)}>${icon('ext')}${esc(site.email)}</a></li>
</ul>
<div class="btn-row h-store__ctas"><a class="btn btn--silver"${linkAttrs(site.directionsUrl)}>Get directions${icon('ext')}</a><a class="btn btn--glass"${linkAttrs(store)}>Store details${icon('arrow')}</a></div>
</div>
</div>
</section>`;

  const areasHtml = `<section class="h-areas band" aria-labelledby="h-areas-h">
<div class="band__clip" aria-hidden="true"><span class="haze h-areas__haze"></span></div>
<div class="wrap h-areas__inner">
<div class="h-areas__copy">
${head('Pickup and delivery', esc(areasH.text), 'h-areas-h')}
<ul class="h-areas__list" role="list" data-reveal style="--i:1">${areasUl.items.map((it) => `<li>${icon('pin')}${it}</li>`).join('')}</ul>
<p class="btn-row" data-reveal style="--i:2"><a class="btn btn--glass"${linkAttrs(btnHref(ctx, areasBtn.href))}>${esc(areasBtn.text)}${icon('arrow')}</a></p>
</div>
<div class="h-areas__chips" data-reveal style="--i:2">
<p class="h-areas__label">Every area page</p>
<ul class="h-areas__chiplist" role="list">${serviceAreas(ctx).map((a) => `<li><a class="chip${a.store ? ' chip--leaf' : ''}"${linkAttrs(a.path)}>${esc(a.name)}</a></li>`).join('')}</ul>
</div>
</div>
</section>`;

  // ---------- 8. latest cannabis insights: the 6 newest posts ----------
  const sI = sec(home, 'latest-cannabis-insights');
  const iBtn = must(blocks(sI, 'button').slice(-1)[0], 'insights button');
  const newest = posts.slice(0, 6);
  const acard = (p, i) => {
    const fi = p.featuredImage && p.featuredImage.src ? p.featuredImage : null;
    const media = fi ? img({ src: fi.src, alt: fi.alt || '', w: fi.w, h: fi.h }, { sizes: '(max-width: 720px) 80vw, 33vw' }) : gimg('g-smoke-beam', { alt: '', sizes: '33vw' });
    return `<li class="h-posts__item" data-reveal style="--i:${i % 3}"><a class="acard h-acard"${linkAttrs(p.path || '/' + p.slug + '/')}><span class="acard__media h-acard__media">${media}</span><span class="h-acard__body"><span class="acard__meta"><time datetime="${escA(String(p.date).slice(0, 10))}">${esc(fmtDate(p.date))}</time></span><span class="acard__title">${esc(p.title)}</span><span class="acard__more">Read article${icon('arrow')}</span></span></a></li>`;
  };
  const postsHtml = `<section class="h-posts band" aria-labelledby="h-posts-h">
<div class="wrap">
<div class="h-row__top">
${head('From the blog', accentLast(sI.heading), 'h-posts-h')}
<a class="btn btn--glass h-row__all"${linkAttrs(btnHref(ctx, iBtn.href))} data-reveal>${esc(iBtn.text)}${icon('arrow')}</a>
</div>
<ul class="h-posts__grid" role="list">
${newest.map(acard).join('\n')}
</ul>
</div>
</section>`;

  // ---------- 9. FAQ: only Uforia's own Q&A (delivery.json), answers verbatim ----------
  const del = must(ctx.content.delivery, 'pages/delivery.json');
  const faqBlock = must((del.sections || []).flatMap((s) => s.blocks || []).find((b) => b.type === 'faq'), 'delivery faq');
  const PICK = [/place an order/i, /age requirement/i, /what times/i, /delivered to my car/i, /cash accepted/i, /how will my order be delivered/i];
  const faqs = PICK.map((re) => must(faqBlock.items.find((it) => re.test(it.q)), 'faq ' + re));
  const faqHtml = `<section class="h-faq band" aria-labelledby="h-faq-h">
<div class="band__clip" aria-hidden="true"><span class="h-faq__pool"></span></div>
<div class="wrap h-faq__inner">
<div class="h-faq__side">
${head('Delivery questions', 'Frequently Asked <span class="accent">Questions</span>', 'h-faq-h')}
<p class="h-faq__lede" data-reveal style="--i:1">Answers from Uforia's delivery page.</p>
<p class="btn-row" data-reveal style="--i:2"><a class="btn btn--glass"${linkAttrs('/faq/')}>All FAQs${icon('arrow')}</a></p>
</div>
<div class="faq h-faq__list" data-reveal style="--i:1">
${faqs.map((f) => `<details class="faq__item h-faq__item"><summary class="faq__q h-faq__q"><span>${esc(f.q)}</span>${icon('plus', 'h-faq__plus')}</summary><div class="faq__a h-faq__a prose">${fixHtml(ctx, f.a_html)}</div></details>`).join('\n')}
</div>
</div>
</section>`;

  const main = [heroHtml, tilesHtml, catsHtml, prodsHtml, deliveryHtml, benHtml, edHtml, brandsHtml, loyaltyHtml, storeHtml, areasHtml, postsHtml, faqHtml].join('\n');

  // JSON-LD: the LocalBusiness Uforia publishes on its home page (home.json jsonld), else one built from site.json
  const flat = (a) => (Array.isArray(a) ? a.flatMap(flat) : a ? [a] : []);
  let ld = flat(home.jsonld).filter((o) => o && o['@type'] === 'LocalBusiness');
  if (!ld.length) {
    ld = [{ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: site.name, url: site.origin + '/', telephone: site.phone.display, email: site.email, address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.state, postalCode: site.address.zip, addressCountry: 'US' }, geo: { '@type': 'GeoCoordinates', latitude: site.address.geo.lat, longitude: site.address.geo.lng }, sameAs: (site.socials || []).map((s) => s.href) }];
  }

  const html = page({
    ctx,
    path: '/',
    title: home.title,
    description: home.description,
    canonical: home.canonical || undefined,
    og: { title: (home.og && home.og.title) || home.title, description: (home.og && home.og.description) || home.description, type: 'website' },
    jsonld: ld,
    bodyClass: 'h-page',
    main,
    crumbs: [],
    // phones preload their own poster (the <picture> swaps to posterSmall at 720px and below), desktop keeps its own
    preload: loop ? (loop.posterSmall ? [{ href: loop.poster, as: 'image', media: '(min-width: 721px)' }, { href: loop.posterSmall, as: 'image', media: '(max-width: 720px)' }] : [{ href: loop.poster, as: 'image' }]) : [],
  });
  return [{ path: '/', html }];
}
