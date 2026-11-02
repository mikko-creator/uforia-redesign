// places.mjs - PLACES lane: /locations/ (new hub), /jersey-city-dispensary/ (adopted STORE template), the 14 town pages
// (same template), /delivery/, /delivery-faq/ (the delivery FAQ under its own URL, canonical to /delivery/), /finds-us/.
// Every captured word renders (tools/words-check.mjs); glue is neutral; facts come from site.json / menu.json only.
import fs from 'node:fs';
import path from 'node:path';
import { esc, escA, href, linkAttrs, gimg, img, absUrl, liveMenu, serviceAreas } from './util.mjs';
import { page, crumbsHtml, icon } from './shell.mjs';
import { ROOT } from '../lib/paths.mjs';

const TOWNS = ['hoboken-nj', 'weehawken-nj', 'edgewater-nj', 'union-city-nj', 'kearny-nj', 'newark-nj', 'harrison-nj', 'secaucus-nj', 'north-bergen-nj', 'journal-square-jersey-city-nj', 'greenville-jersey-city-nj', 'bergen-lafayette-jersey-city-nj', 'west-new-york-nj', 'bayonne-nj'];
const STORE_PHOTO = { src: '/assets/photos/uf/IMG-20251017-WA0109-geotagged-compressed-1.jpg', alt: 'Inside Uforia Dispensary in Jersey City', w: 1600, h: 2133 };
const TOWN_PHOTO = { src: '/assets/photos/uf/cannabis-dispensary-jersey-city.webp', alt: 'Inside Uforia Dispensary in Jersey City', w: 765, h: 1020 };

// ---------- links ----------
// Captured links: "/menu..." (and the live origin's /menu) go to the live menu (absolute); other own-origin links become
// local directory paths; external links open in a new tab.
function mapUrl(ctx, raw) {
  let u = String(raw || '').trim().replace(/&amp;/g, '&');
  if (!u) return '';
  if (/^https?:\/\/(www\.)?uforiadispensary\.com(\/|$)/i.test(u)) u = u.replace(/^https?:\/\/(www\.)?uforiadispensary\.com/i, '') || '/';
  if (/^\/menu(\/|\?|$)/i.test(u)) return ctx.site.liveMenu.base + u.slice(5);
  return href(u);
}
const extAttrs = (u) => (/^https?:/i.test(u) ? ' target="_blank" rel="noopener"' : '');
function fixHtml(ctx, html) {
  return String(html ?? '').replace(/<a\b([^>]*)>/gi, (m, inner) => {
    const hm = inner.match(/\shref="([^"]*)"/i);
    if (!hm) return m;
    const u = mapUrl(ctx, hm[1]);
    const rest = inner.replace(/\shref="[^"]*"/i, '').replace(/\s(target|rel)="[^"]*"/gi, '');
    return `<a${rest} href="${escA(u)}"${extAttrs(u)}>`;
  });
}
const a = (u, inner, cls = '', extra = {}) => `<a${linkAttrs(u, { class: cls || null, ...extra })}>${inner}</a>`;

// ---------- facts (site.json) ----------
const telHref = (ctx) => ctx.site.phone.href;
function hoursRows(ctx) {
  return `<dl class="l-hours">${ctx.site.hours.rows.map((r) => `<div class="l-hours__row"><dt>${esc(r.days)}</dt><dd>${esc(r.open)} to ${esc(r.close)}</dd></div>`).join('')}</dl>`;
}
function storeCard(ctx, { heading = 'Uforia Dispensary, Jersey City', level = 'h2', kicker = 'Our store', lead = '', cls = '', storeLink = true } = {}) {
  const s = ctx.site;
  return `<div class="l-store glass glass--lit glass--strong ${cls}" data-reveal>
  <p class="kicker l-store__kicker">${esc(kicker)}</p>
  <${level} class="l-store__title">${esc(heading)}</${level}>
  ${lead ? `<p class="l-store__lead">${esc(lead)}</p>` : ''}
  <ul class="l-store__facts">
    <li>${icon('pin', 'l-ico')}<span>${esc(s.address.line)}</span></li>
    <li>${icon('phone', 'l-ico')}<span><a href="${escA(telHref(ctx))}">${esc(s.phone.display)}</a> <span class="l-muted">or</span> <a href="${escA(telHref(ctx))}">${esc(s.phone.vanity)}</a></span></li>
    <li>${icon('arrow', 'l-ico')}<span><a href="mailto:${escA(s.email)}">${esc(s.email)}</a></span></li>
    <li class="l-store__hours">${icon('clock', 'l-ico')}<div><span class="l-store__label">Store hours</span>${hoursRows(ctx)}</div></li>
  </ul>
  <p class="l-store__age">${esc(s.age)} ${esc(s.mode)}.</p>
  <div class="btn-row l-btns">
    ${a(s.directionsUrl, `${icon('pin')}<span>Get directions</span>`, 'btn btn--silver btn--sm')}
    ${a(liveMenu(ctx), `${icon('bag')}<span>Shop the menu</span>`, 'btn btn--glass btn--sm')}
    ${storeLink ? a('/jersey-city-dispensary/', '<span>Store page</span>', 'link-arrow') : ''}
  </div>
</div>`;
}
function mapFrame(ctx, src, cls = '') {
  return `<div class="l-map frame-u ${cls}" data-reveal><iframe src="${escA(src || ctx.site.mapEmbed)}" title="Map: Uforia Dispensary, ${escA(ctx.site.address.line)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
}
function localBusiness(ctx) {
  const s = ctx.site;
  const days = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
  const t24 = (t) => { const m = String(t).match(/(\d+)\s*(AM|PM)/i); if (!m) return t; let h = +m[1] % 12; if (/pm/i.test(m[2])) h += 12; return String(h).padStart(2, '0') + ':00'; };
  return {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: s.name, url: s.origin + '/', telephone: s.phone.display, email: s.email,
    address: { '@type': 'PostalAddress', streetAddress: s.address.street, addressLocality: s.address.city, addressRegion: s.address.state, postalCode: s.address.zip, addressCountry: 'US' },
    geo: { '@type': 'GeoCoordinates', latitude: s.address.geo.lat, longitude: s.address.geo.lng },
    openingHoursSpecification: Object.entries(s.hours.byDay).map(([d, [o, c]]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: days[d], opens: t24(o), closes: t24(c) })),
    sameAs: s.socials.map((x) => x.href),
  };
}

// ---------- captured blocks ----------
const townFor = (ctx, title) => { const n = String(title || '').split(',')[0].trim().toLowerCase(); return serviceAreas(ctx).find((t) => t.name.toLowerCase() === n) || null; };
function btn(ctx, b, k) {
  const u = mapUrl(ctx, b.href);
  const cls = k === 0 ? 'btn btn--silver' : 'btn btn--glass';
  const ic = /^tel:/.test(u) ? icon('phone') : /google\.com\/maps|maps\.app/.test(u) ? icon('pin') : /\/menu/.test(u) ? icon('bag') : '';
  return `<a class="${cls}" href="${escA(u)}"${extAttrs(u)}>${ic}<span>${esc(b.text)}</span></a>`;
}
function figure(ctx, b, cls = '') {
  const small = (b.w || 0) && b.w < 700;
  const pic = img({ src: b.src, alt: b.alt || '', w: b.w, h: b.h }, { sizes: small ? '(min-width: 1024px) 420px, 100vw' : '(min-width: 1024px) 560px, 100vw', cls: 'l-fig__img' });
  const u = b.href ? mapUrl(ctx, b.href) : '';
  return `<figure class="l-fig frame-u ${small ? 'l-fig--small' : ''} ${cls}" data-reveal>${u ? `<a href="${escA(u)}"${extAttrs(u)} class="l-fig__link">${pic}</a>` : pic}</figure>`;
}
function iconImg(ctx, b) {
  if (b.icon && fs.existsSync(path.join(ROOT, b.icon.replace(/^\//, '')))) return img({ src: b.icon, alt: '' }, { sizes: '96px', cls: 'l-cat__img' });
  return `<span class="l-cat__glyph">${icon('leaf')}</span>`;
}
function iconGrid(ctx, grp) {
  const role = grp[0].role || '';
  if (role === 'image-box') {
    return `<ul class="l-cats" role="list">${grp.map((b, i) => { const u = mapUrl(ctx, b.href || '/menu/'); return `<li data-reveal style="--i:${i}"><a class="l-cat glass glass--lift" href="${escA(u)}"${extAttrs(u)}>${iconImg(ctx, b)}<span class="l-cat__name">${esc(b.title)}</span>${b.html ? `<span class="l-cat__text">${fixHtml(ctx, b.html)}</span>` : ''}</a></li>`; }).join('')}</ul>`;
  }
  if (role === 'flip-box') {
    return `<ul class="l-areas" role="list">${grp.map((b, i) => {
      const t = townFor(ctx, b.title);
      const back = b.back && typeof b.back === 'object' ? b.back : {};
      const more = back.button && back.button.text ? back.button.text : 'More';
      return `<li class="l-area glass glass--lift" data-reveal style="--i:${i % 6}">
  <h3 class="l-area__name">${t ? a(t.path, esc(b.title)) : esc(b.title)}</h3>
  ${b.html ? `<p>${fixHtml(ctx, b.html)}</p>` : ''}
  ${back.html ? `<p class="l-area__text">${fixHtml(ctx, back.html)}</p>` : ''}
  ${a(t ? t.path : '#faq', `<span>${esc(more)}</span>${icon('arrow')}`, 'link-arrow l-area__more', { 'aria-label': `${more}: ${t ? t.name : b.title}` })}
</li>`;
    }).join('')}</ul>`;
  }
  return `<div class="l-boxes">${grp.map((b, i) => {
    const num = String(b.title || '').match(/^(\d+)\.\s*/);
    const glyph = b.icon && fs.existsSync(path.join(ROOT, b.icon.replace(/^\//, ''))) ? img({ src: b.icon, alt: '' }, { sizes: '64px', cls: 'l-box__img' }) : num ? `<span class="l-box__num" aria-hidden="true">${esc(num[1])}</span>` : `<span class="l-box__glyph">${icon('leaf')}</span>`;
    const inner = `${glyph}<h3 class="l-box__title">${esc(b.title)}</h3>${b.html ? `<div class="l-box__text">${fixHtml(ctx, b.html)}</div>` : ''}`;
    return `<div class="l-box glass glass--lit" data-reveal style="--i:${i}">${b.href ? `<a class="l-box__link" href="${escA(mapUrl(ctx, b.href))}"${extAttrs(mapUrl(ctx, b.href))}>${inner}</a>` : inner}</div>`;
  }).join('')}</div>`;
}
function listHtml(ctx, b) {
  const tag = b.type === 'ol' ? 'ol' : 'ul';
  if (b.role === 'icon-list') {
    return `<ul class="l-contact" role="list">${b.items.map((it) => {
      const s = String(it);
      const ic = /tel:/.test(s) ? 'phone' : /mailto:/.test(s) ? 'arrow' : /\d{1,2}\s*(AM|PM)/i.test(s) ? 'clock' : 'pin';
      return `<li>${icon(ic, 'l-ico')}<span>${fixHtml(ctx, s)}</span></li>`;
    }).join('')}</ul>`;
  }
  if (b.role === 'social') return `<ul class="l-social" role="list">${b.items.map((it) => `<li class="chip">${fixHtml(ctx, it)}</li>`).join('')}</ul>`;
  return `<${tag} class="l-list">${b.items.map((it) => `<li>${fixHtml(ctx, typeof it === 'string' ? it : it.html || it.text || '')}</li>`).join('')}</${tag}>`;
}
function faqHtml(ctx, b) {
  return `<div class="faq l-faq">${b.items.map((it) => `<details class="faq__item l-faq__item"><summary class="faq__q l-faq__q"><span>${esc(it.q)}</span>${icon('plus', 'l-faq__ico')}</summary><div class="faq__a l-faq__a">${fixHtml(ctx, it.a_html)}</div></details>`).join('')}</div>`;
}
function embedHtml(ctx, b) {
  if (b.kind === 'map') return mapFrame(ctx, b.src);
  const isReviews = /review/i.test(b.src);
  return `<div class="l-embed ${isReviews ? 'l-embed--reviews' : ''} glass" data-reveal><iframe src="${escA(b.src)}" title="${escA(b.title || (isReviews ? 'Uforia Dispensary customer reviews' : 'Embedded content'))}" loading="lazy"></iframe></div>`;
}
function block(ctx, b) {
  switch (b.type) {
    case 'p': return `<p>${fixHtml(ctx, b.html)}</p>`;
    case 'h1': return `<h2 class="l-h l-h--lead">${esc(b.text)}</h2>`;
    case 'h2': return `<h2 class="l-h">${esc(b.text)}</h2>`;
    case 'h3': return `<h3 class="l-h3">${esc(b.text)}</h3>`;
    case 'h4': return `<h4 class="l-h4">${esc(b.text)}</h4>`;
    case 'ul': case 'ol': return listHtml(ctx, b);
    case 'img': return figure(ctx, b);
    case 'faq': return faqHtml(ctx, b);
    case 'embed': return embedHtml(ctx, b);
    case 'quote': return `<blockquote class="l-quote">${fixHtml(ctx, b.html || esc(b.text))}${b.cite ? `<cite>${esc(b.cite)}</cite>` : ''}</blockquote>`;
    case 'table': return `<div class="l-table"><table>${(b.rows || []).map((r) => `<tr>${r.map((c) => `<td>${fixHtml(ctx, c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    case 'button': return `<div class="btn-row l-btns">${btn(ctx, b, 0)}</div>`;
    case 'icon-box': return iconGrid(ctx, [b]);
    default: return b.html ? `<div>${fixHtml(ctx, b.html)}</div>` : b.text ? `<p>${esc(b.text)}</p>` : '';
  }
}
function blocksHtml(ctx, blocks) {
  const out = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === 'icon-box') { const g = []; while (i < blocks.length && blocks[i].type === 'icon-box' && (blocks[i].role || '') === (b.role || '')) g.push(blocks[i++]); out.push(iconGrid(ctx, g)); continue; }
    if (b.type === 'button') { const g = []; while (i < blocks.length && blocks[i].type === 'button') g.push(blocks[i++]); out.push(`<div class="btn-row l-btns">${g.map((x, k) => btn(ctx, x, k)).join('')}</div>`); continue; }
    out.push(block(ctx, b));
    i++;
  }
  return out.join('\n');
}

// One captured section as a band. Layout by content: a single photo + text = media split; a level-4 CTA = glass CTA band.
function sectionBand(ctx, s, { idx = 0, tone = '' } = {}) {
  const blocks = s.blocks || [];
  const imgs = blocks.filter((b) => b.type === 'img');
  const head = s.heading ? `<h2 class="l-sec__title display" data-reveal>${esc(s.heading)}</h2>` : '';
  const id = s.id ? ` id="${escA(s.id)}"` : '';
  const ground = tone || (idx % 2 ? 'band--lit' : '');
  if (s.level === 4) {
    return `<section class="band band--moss l-sec l-cta"${id}><div class="band__clip" aria-hidden="true"><span class="l-cta__light"></span></div><div class="wrap"><div class="l-cta__panel glass glass--leaf glass--lit" data-reveal>${head}${blocksHtml(ctx, blocks)}</div></div></section>`;
  }
  if (imgs.length === 1 && blocks.length > 1) {
    const rest = blocks.filter((b) => b !== imgs[0]);
    const imgFirst = blocks[0] === imgs[0];
    return `<section class="band ${ground} l-sec l-sec--media${imgFirst ? ' l-sec--media-left' : ''}"${id}><div class="wrap l-media"><div class="l-media__text prose">${head}${blocksHtml(ctx, rest)}</div><div class="l-media__fig">${figure(ctx, imgs[0], 'l-fig--tall')}</div></div></section>`;
  }
  const hasGrid = blocks.some((b) => b.type === 'icon-box' || b.type === 'faq' || b.type === 'embed');
  return `<section class="band ${ground} l-sec"${id}><div class="wrap ${hasGrid ? '' : 'l-flow'}">${head}<div class="l-sec__body ${hasGrid ? '' : 'prose'}">${blocksHtml(ctx, blocks)}</div></div></section>`;
}

// ---------- shared bands ----------
function heroHtml(ctx, { crumbs, kicker, h1, lede = '', facts = true, photoRef = STORE_PHOTO, night = true, gen = null, ctas = null, extra = '' }) {
  const s = ctx.site;
  const media = gen ? gimg(gen, { cls: 'l-hero__img', eager: true, sizes: '(min-width: 1024px) 46vw, 100vw' }) : img(photoRef, { cls: 'l-hero__img', eager: true, sizes: '(min-width: 1024px) 40vw, 100vw' });
  const buttons = ctas || `${a(liveMenu(ctx), `${icon('bag')}<span>Shop the menu</span>`, 'btn btn--silver')}
      ${a(s.directionsUrl, `${icon('pin')}<span>Get directions</span>`, 'btn btn--glass')}
      <a class="btn btn--ghost" href="${escA(telHref(ctx))}">${icon('phone')}<span>Call ${esc(s.phone.display)}</span></a>`;
  return `<section class="split-hero band band--void l-hero" data-spot>
  <div class="band__clip" aria-hidden="true">
    ${night ? `<div class="l-hero__night">${gimg('g-jc-night', { alt: '', cls: 'l-hero__night-img', sizes: '100vw' })}</div>` : ''}
    <span class="l-hero__pool"></span><span class="haze"></span><span class="grain"></span>
  </div>
  <div class="wrap l-hero__grid">
    <div class="l-hero__panel">
      ${crumbsHtml(crumbs)}
      <p class="kicker l-hero__kicker" data-reveal>${esc(kicker)}</p>
      <h1 class="display l-hero__title" data-reveal style="--i:1">${h1}</h1>
      ${lede ? `<p class="lede l-hero__lede" data-reveal style="--i:2">${lede}</p>` : ''}
      ${facts ? `<ul class="l-hero__facts" data-reveal style="--i:3">
        <li>${icon('pin', 'l-ico')}<span>${esc(s.address.line)}</span></li>
        <li>${icon('clock', 'l-ico')}<span>${s.hours.rows.map((r) => `${esc(r.short)} ${esc(r.open)} to ${esc(r.close)}`).join('<span class="l-dot" aria-hidden="true"> · </span>')}</span></li>
        <li>${icon('phone', 'l-ico')}<span><a href="${escA(telHref(ctx))}">${esc(s.phone.display)}</a></span></li>
      </ul>` : ''}
      ${extra}
      <div class="btn-row l-hero__ctas" data-reveal style="--i:4">${buttons}</div>
    </div>
    <figure class="l-hero__media frame-u protrude" data-reveal style="--i:2">${media}</figure>
  </div>
</section>`;
}
function areaChips(ctx, exceptPath, title = 'More areas we serve') {
  const list = serviceAreas(ctx).filter((t) => t.path !== exceptPath);
  return `<section class="band l-sec l-more" aria-labelledby="l-more-h"><div class="wrap">
  <p class="kicker">Pickup and delivery</p>
  <h2 class="l-sec__title display" id="l-more-h">${esc(title)}</h2>
  <ul class="l-chips" role="list">${list.map((t, i) => `<li data-reveal style="--i:${i % 8}">${a(t.path, `${icon('pin')}<span>${esc(t.name)}</span>`, 'chip l-chip')}</li>`).join('')}
  <li data-reveal>${a('/locations/', '<span>All locations</span>', 'chip chip--leaf l-chip')}</li></ul>
</div></section>`;
}
function deliveryCta(ctx, town) {
  const d = ctx.site.delivery;
  return `<section class="band band--beam l-sec l-dcta" aria-labelledby="l-dcta-h"><div class="band__clip" aria-hidden="true"><span class="l-dcta__light"></span></div>
  <div class="wrap l-dcta__grid">
    <div class="l-dcta__text" data-reveal>
      <p class="kicker">Delivery</p>
      <h2 class="display" id="l-dcta-h">Delivery${town ? ` to ${esc(town)}` : ''} from <span class="accent">Uforia</span></h2>
      <p class="lede">${esc(d.freeOver)} ${esc(d.prepay)} ${esc(ctx.site.age)}</p>
      <div class="btn-row">${a(liveMenu(ctx), `${icon('truck')}<span>Order delivery</span>`, 'btn btn--silver')}${a('/delivery/', '<span>Delivery details</span>', 'btn btn--glass')}</div>
    </div>
    <div class="l-dcta__fig frame-u" data-reveal style="--i:1">${gimg('g-doorstep', { alt: '', cls: 'l-dcta__img', sizes: '(min-width: 1024px) 40vw, 100vw' })}</div>
  </div>
</section>`;
}
function headOf(rec) { return { title: rec.title, description: rec.description, og: { title: rec.og && rec.og.title, description: rec.og && rec.og.description } }; }
const crumbsFor = (label, mid = []) => [{ label: 'Home', href: '/' }, ...mid, { label }];

// ---------- pages ----------
function storePage(ctx) {
  const rec = ctx.content['jersey-city-dispensary'];
  const s = ctx.site;
  const secs = rec.sections;
  const first = secs[0];
  const crumbs = crumbsFor(rec.h1, [{ label: 'Locations', href: '/locations/' }]);
  const offers = (ctx.menu.offers || []);
  const deals = offers.length ? `<section class="band band--lit l-sec l-deals" aria-labelledby="l-deals-h"><div class="wrap">
  <div class="l-head"><div><p class="kicker">Live offers</p><h2 class="l-sec__title display" id="l-deals-h">Deals at this store</h2></div>${a(liveMenu(ctx) + '/offers', '<span>All offers on the live menu</span>', 'link-arrow')}</div>
  <ul class="l-deals__grid" role="list">${offers.map((o, i) => `<li data-reveal style="--i:${i % 4}"><a class="l-deal glass glass--leaf glass--lift" href="${escA(o.liveUrl)}" target="_blank" rel="noopener">${icon('tag', 'l-deal__ico')}<span class="l-deal__title">${esc(o.title)}</span>${o.description && o.description.trim() !== o.title.trim() ? `<span class="l-deal__desc">${esc(o.description)}</span>` : ''}<span class="l-deal__go">View offer ${icon('ext')}</span></a></li>`).join('')}</ul>
</div></section>` : '';
  const about = `<section class="band l-sec l-about" id="${escA(first.id)}"><div class="wrap l-about__grid">
  <div class="l-about__text prose" data-reveal>${blocksHtml(ctx, first.blocks)}</div>
  <aside class="l-about__aside" aria-label="Store details">${storeCard(ctx, { heading: 'Store details', kicker: 'Uforia Dispensary, Jersey City', storeLink: false })}</aside>
</div></section>`;
  const bring = `<section class="band l-sec l-bring" aria-labelledby="l-bring-h"><div class="wrap">
  <h2 class="l-sec__title display" id="l-bring-h">What to bring</h2>
  <ul class="l-bring__grid" role="list">
    <li class="l-bring__item glass glass--lit" data-reveal>${icon('id', 'l-bring__ico')}<p>${esc(s.firstVisit)}</p></li>
    <li class="l-bring__item glass glass--lit" data-reveal style="--i:1">${icon('user', 'l-bring__ico')}<p>${esc(s.age)}</p></li>
  </ul>
</div></section>`;
  const loyalty = `<section class="band band--moss l-sec l-loyal" aria-labelledby="l-loyal-h"><div class="band__clip" aria-hidden="true"><span class="l-cta__light"></span></div><div class="wrap"><div class="l-loyal__panel glass glass--leaf glass--lit" data-reveal>
  ${icon('gift', 'l-loyal__ico')}
  <div><p class="kicker">Loyalty</p><h2 class="display" id="l-loyal-h">Uforia <span class="accent">rewards</span></h2><p>See how Uforia's loyalty program works, or sign up.</p></div>
  <div class="btn-row">${a(s.loyalty.page, '<span>Loyalty program</span>', 'btn btn--silver')}${a(s.loyalty.signupUrl, `<span>${esc(s.loyalty.signupLabel)}</span>`, 'btn btn--glass')}</div>
</div></div></section>`;
  const mid = secs.slice(1, secs.length - 1).map((x, i) => sectionBand(ctx, x, { idx: i + 1 })).join('\n');
  const last = sectionBand(ctx, secs[secs.length - 1], { idx: 0, tone: 'band--lit' });
  const main = `${heroHtml(ctx, { crumbs, kicker: 'Jersey City dispensary', h1: esc(rec.h1), facts: true, photoRef: STORE_PHOTO })}
${deals}
${about}
${mid}
${bring}
${loyalty}
${last}
${areaChips(ctx, rec.path)}`;
  const hasLB = JSON.stringify(rec.jsonld || []).includes('"LocalBusiness"');
  return { path: rec.path, html: page({ ctx, path: rec.path, ...headOf(rec), canonical: absUrl(ctx, rec.path), jsonld: [...(rec.jsonld || []), ...(hasLB ? [] : [localBusiness(ctx)])], bodyClass: 'l-page l-page--store', main, crumbs, heroCrumbs: true }) };
}

function townPage(ctx, slug) {
  const rec = ctx.content[slug];
  const t = serviceAreas(ctx).find((x) => x.path === rec.path);
  const town = t ? t.name : rec.h1;
  const secs = rec.sections;
  const first = secs[0];
  const crumbs = crumbsFor(rec.h1, [{ label: 'Locations', href: '/locations/' }]);
  const about = `<section class="band l-sec l-about" id="${escA(first.id)}"><div class="wrap l-about__grid">
  <div class="l-about__text prose" data-reveal>${blocksHtml(ctx, first.blocks)}</div>
  <aside class="l-about__aside" aria-label="Our store">${storeCard(ctx, { heading: `Our Jersey City dispensary serves ${town}`, kicker: 'Uforia Dispensary, Jersey City' })}</aside>
</div></section>`;
  const rest = secs.slice(1).map((x, i) => sectionBand(ctx, x, { idx: i + 1 })).join('\n');
  const main = `${heroHtml(ctx, { crumbs, kicker: `Serving ${town}`, h1: esc(rec.h1), lede: `Our Jersey City dispensary serves ${esc(town)}: pickup at 138 Griffith Street or delivery.`, facts: true, photoRef: TOWN_PHOTO })}
${about}
${rest}
${deliveryCta(ctx, town)}
${areaChips(ctx, rec.path)}`;
  return { path: rec.path, html: page({ ctx, path: rec.path, ...headOf(rec), canonical: absUrl(ctx, rec.path), jsonld: rec.jsonld || [], bodyClass: 'l-page l-page--town', main, crumbs, heroCrumbs: true }) };
}

function deliveryMain(ctx, rec, { h1, crumbs, kicker }) {
  const secs = rec.sections;
  const first = secs[0];
  const s0 = first.blocks;
  const lede = s0.find((b) => b.type === 'p');
  const restFirst = s0.filter((b) => b !== lede && b.type !== 'button');
  const ctas = s0.filter((b) => b.type === 'button').map((b, k) => btn(ctx, b, k)).join('');
  const extra = `${first.heading && h1 !== esc(first.heading) ? `<h2 class="l-hero__sub" data-reveal style="--i:2">${esc(first.heading)}</h2>` : ''}${restFirst.length ? `<div class="l-hero__note" data-reveal style="--i:3">${blocksHtml(ctx, restFirst)}</div>` : ''}`;
  const bands = secs.slice(1).map((x, i) => {
    if ((x.blocks || []).some((b) => b.role === 'flip-box')) {
      return `<section class="band band--lit l-sec l-zones" id="${escA(x.id)}"><div class="wrap">
  <h2 class="l-sec__title display" data-reveal>${esc(x.heading)}</h2>
  <div class="l-sec__body">${blocksHtml(ctx, x.blocks)}</div>
</div></section>`;
    }
    if ((x.blocks || []).some((b) => b.type === 'faq') && /faq/i.test(x.id + ' ' + x.heading)) {
      return `<section class="band l-sec l-dfaq" id="faq" aria-labelledby="l-dfaq-h"><div class="wrap wrap--narrow">
  <p class="kicker">Questions</p>
  <h2 class="l-sec__title display" id="l-dfaq-h">${esc(x.heading)}</h2>
  ${blocksHtml(ctx, x.blocks)}
</div></section>`;
    }
    return sectionBand(ctx, x, { idx: i + 1 });
  }).join('\n');
  return `${heroHtml(ctx, { crumbs, kicker, h1, lede: lede ? fixHtml(ctx, lede.html) : '', facts: false, night: false, gen: 'g-doorstep', ctas, extra })}
${bands}
${areaChips(ctx, '', 'Pickup or delivery in your area')}`;
}
function deliveryPage(ctx) {
  const rec = ctx.content.delivery;
  const crumbs = crumbsFor(rec.h1);
  const main = deliveryMain(ctx, rec, { h1: esc(rec.h1), crumbs, kicker: 'Uforia delivery' });
  return { path: rec.path, html: page({ ctx, path: rec.path, ...headOf(rec), canonical: absUrl(ctx, rec.path), jsonld: rec.jsonld || [], bodyClass: 'l-page l-page--delivery', main, crumbs, heroCrumbs: true }) };
}
function deliveryFaqPage(ctx) {
  const rec = ctx.content['delivery-faq'];
  const crumbs = crumbsFor('Delivery FAQ', [{ label: rec.h1, href: '/delivery/' }]);
  const main = deliveryMain(ctx, rec, { h1: 'Delivery FAQ', crumbs, kicker: 'Uforia delivery' })
    + `<section class="band l-sec l-back"><div class="wrap">${a('/delivery/', `<span>Back to the delivery page</span>${icon('arrow')}`, 'link-arrow')}</div></section>`;
  const p = rec.path || '/delivery-faq/';
  return { path: p, html: page({ ctx, path: p, title: 'Delivery FAQ | Uforia Dispensary', description: rec.description, og: { title: 'Delivery FAQ | Uforia Dispensary', description: rec.description }, canonical: absUrl(ctx, '/delivery/'), jsonld: [], bodyClass: 'l-page l-page--delivery l-page--dfaq', main, crumbs, heroCrumbs: true }) };
}

function findsUsPage(ctx) {
  const rec = ctx.content['finds-us'];
  const s = ctx.site;
  const crumbs = crumbsFor(rec.h1);
  const [visit, connect] = rec.sections;
  const list = visit.blocks.find((b) => b.type === 'ul');
  const dirBtn = visit.blocks.find((b) => b.type === 'button');
  const map = visit.blocks.find((b) => b.type === 'embed');
  const others = visit.blocks.filter((b) => b !== list && b !== dirBtn && b !== map);
  const ctas = `${dirBtn ? btn(ctx, dirBtn, 0) : ''}${a(liveMenu(ctx), `${icon('bag')}<span>Shop the menu</span>`, 'btn btn--glass')}`;
  const main = `${heroHtml(ctx, { crumbs, kicker: 'Find us', h1: esc(rec.h1), lede: `${esc(s.address.line)}. ${esc(s.age)}`, facts: false, photoRef: STORE_PHOTO, ctas })}
<section class="band l-sec l-visit" id="${escA(visit.id)}"><div class="wrap l-visit__grid">
  <div class="l-visit__text" data-reveal>
    <h2 class="l-sec__title display">${esc(visit.heading)}</h2>
    ${list ? listHtml(ctx, list) : ''}
    ${blocksHtml(ctx, others)}
    <div class="btn-row l-btns">${dirBtn ? btn(ctx, dirBtn, 0) : ''}<a class="btn btn--glass" href="${escA(telHref(ctx))}">${icon('phone')}<span>Call ${esc(s.phone.display)}</span></a></div>
  </div>
  <div class="l-visit__map">${map ? mapFrame(ctx, map.src, 'l-map--tall') : mapFrame(ctx, s.mapEmbed, 'l-map--tall')}</div>
</div></section>
${connect ? `<section class="band band--lit l-sec l-connect" id="${escA(connect.id)}"><div class="wrap">
  <h2 class="l-sec__title display" data-reveal>${esc(connect.heading)}</h2>
  ${blocksHtml(ctx, connect.blocks)}
</div></section>` : ''}
${areaChips(ctx, '', 'Areas we serve')}`;
  return { path: rec.path, html: page({ ctx, path: rec.path, ...headOf(rec), canonical: absUrl(ctx, rec.path), jsonld: rec.jsonld || [], bodyClass: 'l-page l-page--findus', main, crumbs, heroCrumbs: true }) };
}

function locationsPage(ctx) {
  const s = ctx.site;
  const p = '/locations/';
  const crumbs = crumbsFor('Find a Dispensary');
  const areas = serviceAreas(ctx);
  const shown = (s.delivery.areasShown || []).filter((n) => !townFor(ctx, n));
  const main = `${heroHtml(ctx, { crumbs, kicker: 'Find a dispensary', h1: `Find a <span class="accent">Uforia</span> dispensary`, lede: `One store in Jersey City, with pickup and delivery to nearby towns.`, facts: true, night: false, gen: 'g-jc-night' })}
<section class="band l-sec l-hub" aria-label="Store and map"><div class="wrap l-hub__grid">
  <div class="l-hub__card">${storeCard(ctx, { heading: 'Uforia Dispensary, Jersey City', level: 'h2', kicker: 'Our store', lead: s.address.full })}</div>
  <div class="l-hub__map">${mapFrame(ctx, s.mapEmbed, 'l-map--tall')}</div>
</div></section>
<section class="band band--lit l-sec l-serve" aria-labelledby="l-serve-h"><div class="wrap">
  <p class="kicker">Pickup and delivery</p>
  <h2 class="l-sec__title display" id="l-serve-h">Areas we serve</h2>
  <ul class="l-towns" role="list">${areas.map((t, i) => `<li data-reveal style="--i:${i % 5}">${a(t.path, `${icon(t.store ? 'bag' : 'pin', 'l-ico')}<span class="l-town__name">${esc(t.name)}</span><span class="l-town__meta">${t.store ? 'Our store' : 'Area page'}</span>${icon('arrow', 'l-town__go')}`, 'l-town glass glass--lift')}</li>`).join('')}</ul>
  ${shown.length ? `<p class="l-also">Delivery areas shown on our delivery page also include: ${shown.map((n) => `<span class="l-also__town">${esc(n)}</span>`).join(', ')}.</p>` : ''}
</div></section>
${deliveryCta(ctx, '')}`;
  const title = 'Find a Dispensary | Uforia Dispensary';
  const description = `Find Uforia Dispensary at ${s.address.line}: store hours, phone, directions and the towns we serve with pickup and delivery.`;
  return { path: p, html: page({ ctx, path: p, title, description, canonical: absUrl(ctx, p), jsonld: [localBusiness(ctx), { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: absUrl(ctx, '/') }, { '@type': 'ListItem', position: 2, name: 'Find a Dispensary', item: absUrl(ctx, p) }] }], bodyClass: 'l-page l-page--locations', main, crumbs, heroCrumbs: true }) };
}

export async function render(ctx) {
  const out = [locationsPage(ctx), storePage(ctx)];
  for (const slug of TOWNS) if (ctx.content[slug]) out.push(townPage(ctx, slug));
  out.push(deliveryPage(ctx), deliveryFaqPage(ctx), findsUsPage(ctx));
  return out;
}
