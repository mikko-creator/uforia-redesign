// learn.mjs - LEARN lane: the adopted Learn hub at Uforia's /blog/, every post at /<slug>/ (174), Uforia's guide pages
// /education/ /terpenes/ /safe-consumption/ on the article template, and /learn/<slug>/ for every ctx.learn guide.
// Classes are prefixed n- (component classes from FOUNDATION are used as is). No cross-lane imports.
import { esc, escA, href, linkAttrs, gimg, img, hasGenerated, imgUrl, slugify, stripTags, absUrl, liveMenu } from './util.mjs';
import { page, icon, crumbsHtml } from './shell.mjs';

const ORG = 'Uforia Dispensary';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : ''; };
const ymd = (iso) => String(iso || '').slice(0, 10);
const byDate = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));
// PAGES owns this /learn/ path (NJ purchase limits, built from ctx.nj): never render a guide over it.
const PAGES_OWNED = new Set(['/learn/understanding-cannabis-purchase-limits/']);

// meta description: tags stripped, at most 160 characters, cut at a word boundary
function desc160(s) {
  const t = stripTags(s).replace(/\s+/g, ' ').trim();
  if (t.length <= 160) return t;
  const cut = t.slice(0, 161);
  const i = cut.lastIndexOf(' ');
  return (i > 60 ? cut.slice(0, i) : t.slice(0, 160)).replace(/[\s,;:]+$/, '');
}
const words = (html) => stripTags(html).split(/\s+/).filter(Boolean).length;
const readMin = (html) => Math.max(1, Math.round(words(html) / 225));

// generated mood image for a post without a featured image, chosen by its most specific category (alt '')
const MOOD = [['Buy Cannabis Flower', 'g-flower-macro'], ['Premium Flower', 'g-jars'], ['Buy Cannabis Edibles', 'g-silver-dust'], ['Cannabis Dispensary Jersey City', 'g-mist-veil'], ['Cannabis Education', 'g-leaf-silver'], ['Blog', 'g-smoke-beam']];
const moodFor = (cats = []) => (MOOD.find(([c]) => cats.includes(c)) || [0, 'g-mist-veil'])[1];
const mainCat = (cats = []) => (MOOD.find(([c]) => c !== 'Blog' && cats.includes(c)) || [cats[0] || 'Blog'])[0];

// one card model for posts and guides
function postItem(p, excerpt) {
  const fi = p.featuredImage && p.featuredImage.src ? p.featuredImage : null; // one post has a remote-only image (src null)
  return { kind: 'post', path: href(p.path || `/${p.slug}/`), title: p.title, date: p.date, cats: p.categories || [], label: mainCat(p.categories || []), excerpt: excerpt || stripTags(p.description || ''), photo: fi, gen: fi ? null : moodFor(p.categories || []), tags: p.tags || [], html: p.html || '' };
}
function guideItem(g) {
  const path = href(g.path || `/learn/${g.slug}/`);
  return { kind: 'guide', path, title: g.title, date: g.date, cats: [g.category || 'Cannabis Education'], label: 'Guides', excerpt: stripTags(g.description || g.lede || ''), photo: null, gen: g.image || 'g-leaf-silver', tags: [], minutes: g.readMinutes };
}
// image of a card item: Uforia's featured photo, or the generated mood image (decorative)
function itemImg(it, opts) {
  if (it.photo) return img({ src: it.photo.src, alt: it.photo.alt || '', w: it.photo.w, h: it.photo.h }, { ...opts, alt: opts.alt != null ? opts.alt : it.photo.alt || '' });
  return gimg(it.gen, { ...opts, alt: '' });
}

const CARD_SIZES = '(min-width: 1180px) 380px, (min-width: 720px) 45vw, 92vw';
function card(it, i = 0, extra = '') {
  // FOUNDATION's card pattern: the title link stretches over the whole card (.acard__title a::after)
  return `<article class="acard n-card"${extra} data-reveal style="--i:${i % 6}">
<span class="acard__media n-card__media">${itemImg(it, { sizes: CARD_SIZES, cls: 'n-card__img', alt: '' })}</span>
<span class="acard__meta n-card__meta"><span class="n-card__cat">${esc(it.label)}</span><time datetime="${escA(ymd(it.date))}">${esc(fmtDate(it.date))}</time></span>
<h3 class="acard__title n-card__title"><a${linkAttrs(it.path)}>${esc(it.title)}</a></h3>
${it.excerpt ? `<p class="acard__excerpt n-card__excerpt">${esc(it.excerpt)}</p>` : ''}
<span class="acard__more n-card__more" aria-hidden="true">Read more ${icon('arrow')}</span>
</article>`;
}

// ---------- shared article pieces ----------
const clip = (mod = '') => `<div class="band__clip" aria-hidden="true"><span class="band__bg n-pool ${mod}"></span><span class="haze n-haze"></span><span class="grain"></span></div>`;

function articleHero({ crumbs, kicker, title, titleId = 'n-title', chips = [], dateIso, minutes, byline, lede, media, mod = '' }) {
  return `<section class="split-hero n-hero n-hero--article ${mod}" aria-labelledby="${titleId}">
${clip('n-pool--hero')}
<div class="wrap n-hero__grid">
<div class="split-hero__panel n-hero__panel">
${crumbsHtml(crumbs)}
${kicker ? `<p class="kicker n-hero__kicker">${kicker}</p>` : ''}
<h1 class="display n-hero__title" id="${titleId}">${title}</h1>
${chips.length ? `<ul class="n-chips n-chips--static" aria-label="Categories">${chips.map((c) => `<li><span class="chip">${esc(c)}</span></li>`).join('')}</ul>` : ''}
<p class="n-hero__meta">${dateIso ? `<time datetime="${escA(ymd(dateIso))}">${esc(fmtDate(dateIso))}</time>` : ''}${minutes ? `<span>${minutes} min read</span>` : ''}${byline ? `<span>By ${esc(byline)}</span>` : ''}</p>
${lede ? `<p class="lede n-hero__lede">${lede}</p>` : ''}
</div>
<div class="split-hero__media n-hero__media">${media}</div>
</div>
</section>`;
}

function keepReading(items, title = 'Keep reading') {
  if (!items.length) return '';
  return `<section class="band band--void n-more-band" aria-labelledby="n-keep">
${clip('n-pool--right')}
<div class="wrap">
<header class="n-head" data-reveal><p class="kicker">More to read</p><h2 class="display n-head__title" id="n-keep">${esc(title)}</h2></header>
<div class="n-grid n-grid--3">${items.map((it, i) => card(it, i)).join('\n')}</div>
<p class="n-head__all"><a class="link-arrow"${linkAttrs('/blog/')}>All articles ${icon('arrow')}</a></p>
</div>
</section>`;
}

// the shop / loyalty band: Uforia's own "Join Our Rewards Program" copy from its blog page, verbatim
function ctaBand(ctx, id = 'n-cta') {
  const blog = ctx.content.blog || {};
  const sec = (blog.sections || []).find((s) => /rewards/i.test(s.heading || '')) || {};
  const p = ((sec.blocks || []).find((b) => b.type === 'p') || {}).html || '';
  const btn = (sec.blocks || []).find((b) => b.type === 'button') || { text: 'Sign Up Now', href: '/loyalty/' };
  return `<section class="band band--moss n-cta" aria-labelledby="${id}">
${clip('n-pool--cta')}
<div class="wrap"><div class="n-cta__box glass glass--leaf glass--lit" data-reveal>
<div class="n-cta__text"><p class="kicker">Shop and earn</p>
<h2 class="display n-cta__title" id="${id}">${esc(sec.heading || 'Join Our Rewards Program')}</h2>
${p ? `<p class="n-cta__copy">${p}</p>` : ''}</div>
<div class="btn-row n-cta__btns"><a class="btn btn--silver"${linkAttrs(liveMenu(ctx))}>Shop the menu ${icon('ext')}</a><a class="btn btn--glass"${linkAttrs(btn.href || '/loyalty/')}>${esc(btn.text)}</a></div>
</div></div>
</section>`;
}

// trusted captured html: demote any h1 (the page title is the only h1); internal links in directory form
const prose = (html) => String(html || '')
  .replace(/<h1(\s[^>]*)?>/gi, (m, a) => `<h2${a || ''}>`).replace(/<\/h1>/gi, '</h2>')
  .replace(/href="(\/[^"]*)"/g, (m, u) => `href="${escA(href(u))}"`);

const orgLd = (ctx) => ({ '@type': 'Organization', name: ORG, url: ctx.site.origin });

// ---------- posts ----------
function relatedPosts(items, it) {
  const pool = items.filter((x) => x.kind === 'post' && x.path !== it.path);
  const same = pool.filter((x) => x.cats.includes(it.label));
  const any = pool.filter((x) => !same.includes(x) && x.cats.some((c) => it.cats.includes(c)));
  return [...same, ...any, ...pool].filter((x, i, a) => a.indexOf(x) === i).slice(0, 3);
}

function postPage(ctx, p, it, items) {
  const path = it.path;
  const media = it.photo
    ? img({ src: it.photo.src, alt: it.photo.alt || '', w: it.photo.w, h: it.photo.h }, { sizes: '(min-width: 1024px) 560px, 92vw', eager: true, cls: 'n-hero__img' })
    : gimg(it.gen, { alt: '', sizes: '(min-width: 1024px) 560px, 92vw', eager: true, cls: 'n-hero__img' });
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog/' }, { label: p.title }];
  const main = `${articleHero({ crumbs, kicker: esc(it.label), title: esc(p.title), chips: it.cats, dateIso: p.date, minutes: readMin(p.html), media })}
<section class="band n-body" aria-label="Article">
${clip('n-pool--body')}
<div class="wrap n-body__wrap"><article class="prose n-prose">
${prose(p.html)}
</article></div>
</section>
${keepReading(relatedPosts(items, it))}
${ctaBand(ctx)}`;
  const can = absUrl(ctx, path);
  const image = it.photo ? ctx.site.origin + it.photo.src : null;
  const description = desc160(p.description || p.html);
  return {
    path,
    html: page({
      ctx, path, title: p.seoTitle || `${p.title} | ${ORG}`, description, canonical: can, heroCrumbs: true, crumbs,
      og: { type: 'article', ...(image ? { image } : {}) }, bodyClass: 'n-page n-page--post', main,
      jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description, datePublished: p.date, dateModified: p.modified || p.date, ...(image ? { image } : {}), mainEntityOfPage: can, author: orgLd(ctx), publisher: orgLd(ctx) },
    }),
  };
}

// ---------- captured guide pages (/education/ /terpenes/ /safe-consumption/) ----------
function mapBtnHref(h) {
  const s = String(h || '');
  if (/^(https?:\/\/uforiadispensary\.com)?\/menu/i.test(s)) return null; // handled by caller (live menu)
  if (!s || s === '#') return '/finds-us/'; // the live "Contact Us" buttons point at "#": Uforia's contact page
  return s.replace(/^https?:\/\/uforiadispensary\.com/i, '') || '/';
}
function capturedBody(ctx, rec, skipImg) {
  const ids = new Set();
  const uid = (t) => { let id = slugify(t) || 'section'; let n = 2; while (ids.has(id)) id = `${slugify(t)}-${n++}`; ids.add(id); return id; };
  const toc = [];
  const imgHtml = (b) => {
    const small = (b.w || 0) <= 320;
    const im = img({ src: b.src, alt: b.alt || '', w: b.w, h: b.h }, { sizes: small ? `${Math.max(40, b.w || 120)}px` : '(min-width: 900px) 720px, 92vw', cls: small ? 'n-img n-img--icon' : 'n-img' });
    return b.href ? `<a class="n-img-link"${linkAttrs(b.href)}>${im}</a>` : im;
  };
  const block = (b) => {
    switch (b.type) {
      case 'p': return b.role === 'divider-text' ? `<p class="n-divider">${b.html}</p>` : `<p>${b.html}</p>`;
      case 'h2': case 'h3': case 'h4': { const id = uid(b.text); if (b.type === 'h2') toc.push({ id, text: b.text }); return `<${b.type} id="${id}">${esc(b.text)}</${b.type}>`; }
      case 'ul': case 'ol': return `<${b.type}${b.role === 'icon-list' ? ' class="n-checks"' : ''}>${(b.items || []).map((x) => `<li>${typeof x === 'string' ? x : x.html || esc(x.text || '')}</li>`).join('')}</${b.type}>`;
      case 'img': return `<figure class="n-fig">${imgHtml(b)}</figure>`;
      case 'button': {
        const m = mapBtnHref(b.href);
        const u = m === null ? liveMenu(ctx) : m;
        return `<p class="n-btn-line"><a class="btn btn--ghost btn--sm"${linkAttrs(u)}>${esc(b.text)}${/^https?:/.test(href(u)) ? ' ' + icon('ext') : ''}</a></p>`;
      }
      case 'quote': return `<blockquote>${b.html || esc(b.text || '')}${b.cite ? `<cite>${esc(b.cite)}</cite>` : ''}</blockquote>`;
      case 'faq': return `<div class="faq n-faq">${(b.items || []).map((q) => `<details><summary>${esc(q.q)}</summary><div class="faq__a">${q.a_html || ''}</div></details>`).join('')}</div>`;
      case 'icon-box': return `<div class="n-ibox">${b.title ? `<h3 id="${uid(b.title)}">${esc(b.title)}</h3>` : ''}${b.html || esc(b.text || '')}</div>`;
      case 'table': return `<div class="n-table"><table>${(b.rows || []).map((r, i) => `<tr>${r.map((c) => (i === 0 ? `<th scope="col">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</table></div>`;
      case 'embed': return b.src ? `<p><a class="link-arrow"${linkAttrs(b.src)}>Open ${esc(b.kind || 'the embed')} ${icon('ext')}</a></p>` : '';
      default: return b.html ? `<p>${b.html}</p>` : b.text ? `<p>${esc(b.text)}</p>` : '';
    }
  };
  const out = [];
  for (const s of rec.sections || []) {
    if (s.level !== 1 && s.heading) { const id = uid(s.heading); toc.push({ id, text: s.heading }); out.push(`<h2 id="${id}">${esc(s.heading)}</h2>`); }
    let run = [];
    const flush = () => { if (run.length > 1) out.push(`<div class="n-gallery">${run.map((b) => `<figure class="n-fig">${imgHtml(b)}</figure>`).join('')}</div>`); else if (run.length) out.push(block(run[0])); run = []; };
    for (const b of s.blocks || []) {
      if (b === skipImg) continue;
      if (b.type === 'img') { run.push(b); continue; }
      flush();
      out.push(block(b));
    }
    flush();
  }
  return { body: out.join('\n'), toc };
}
function tocHtml(toc) {
  if (toc.length < 4) return '';
  return `<nav class="n-toc glass glass--strong" aria-labelledby="n-toc-title"><p class="kicker n-toc__title" id="n-toc-title">On this page</p><ol>${toc.map((t) => `<li><a href="#${escA(t.id)}">${esc(t.text)}</a></li>`).join('')}</ol></nav>`;
}
function capturedPage(ctx, slug, items) {
  const rec = ctx.content[slug];
  if (!rec) return null;
  const path = href(rec.path || `/${slug}/`);
  const allBlocks = (rec.sections || []).flatMap((s) => s.blocks || []);
  const heroImg = allBlocks.find((b) => b.type === 'img' && (b.w || 0) >= 600 && !b.href);
  const media = heroImg
    ? img({ src: heroImg.src, alt: heroImg.alt || '', w: heroImg.w, h: heroImg.h }, { sizes: '(min-width: 1024px) 560px, 92vw', eager: true, cls: 'n-hero__img' })
    : gimg('g-leaf-silver', { alt: '', sizes: '(min-width: 1024px) 560px, 92vw', eager: true, cls: 'n-hero__img' });
  const { body, toc } = capturedBody(ctx, rec, heroImg);
  const h1 = rec.h1 || rec.title;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Learn', href: '/blog/' }, { label: stripTags(h1) }];
  const nav = tocHtml(toc);
  const related = items.filter((x) => x.kind === 'guide').slice(0, 3);
  const main = `${articleHero({ crumbs, kicker: 'Guide', title: esc(h1), media, mod: 'n-hero--guide' })}
<section class="band n-body${nav ? ' n-body--toc' : ''}" aria-label="Guide">
${clip('n-pool--body')}
<div class="wrap n-body__wrap">${nav}<article class="prose n-prose">
${body}
</article></div>
</section>
${keepReading(related.length ? related : items.slice(0, 3))}
${ctaBand(ctx)}`;
  return {
    path,
    html: page({
      ctx, path, title: rec.title, description: rec.description || desc160(body), canonical: absUrl(ctx, path), heroCrumbs: true, crumbs,
      og: { title: (rec.og && rec.og.title) || rec.title, description: (rec.og && rec.og.description) || rec.description, type: 'article' },
      bodyClass: 'n-page n-page--guide', main,
    }),
  };
}

// ---------- new guides /learn/<slug>/ ----------
function guidePage(ctx, g, it, items, titles) {
  const path = it.path;
  const media = gimg(it.gen, { alt: '', sizes: '(min-width: 1024px) 560px, 92vw', eager: true, cls: 'n-hero__img' });
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Learn', href: '/blog/' }, { label: g.title }];
  const ids = new Set();
  const secs = (g.sections || []).map((s) => { let id = slugify(s.heading) || 'section'; while (ids.has(id)) id += '-2'; ids.add(id); return { ...s, id }; });
  const nav = tocHtml(secs.map((s) => ({ id: s.id, text: s.heading })));
  const take = (g.takeaways || []).length ? `<aside class="n-take glass glass--lit" aria-labelledby="n-take-title"><p class="kicker">Summary</p><h2 class="n-take__title" id="n-take-title">Key takeaways</h2><ul class="n-checks">${g.takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></aside>` : '';
  const rel = (g.related || []).map((u) => href(u)).filter((u) => u !== path);
  const relLinks = rel.length ? `<nav class="n-rel" aria-labelledby="n-rel-title"><h2 class="n-rel__title" id="n-rel-title">Related reading</h2><ul>${rel.map((u) => `<li><a class="link-arrow"${linkAttrs(u)}>${esc(titles.get(u) || u.replace(/^\/(learn\/|page\/)?|\/$/g, '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()))} ${icon('arrow')}</a></li>`).join('')}</ul></nav>` : '';
  const more = rel.map((u) => items.find((x) => x.path === u)).filter(Boolean);
  const fill = items.filter((x) => x.kind === 'guide' && x.path !== path && !more.includes(x));
  const main = `${articleHero({ crumbs, kicker: 'Guide', title: esc(g.title), dateIso: g.date, minutes: g.readMinutes, byline: g.author || ORG, lede: esc(g.lede || ''), media, mod: 'n-hero--guide' })}
<section class="band n-body${nav ? ' n-body--toc' : ''}" aria-label="Guide">
${clip('n-pool--body')}
<div class="wrap n-body__wrap">${nav}<article class="prose n-prose">
${secs.map((s) => `<h2 id="${escA(s.id)}">${esc(s.heading)}</h2>\n${prose(s.html)}`).join('\n')}
${take}
${relLinks}
<p class="n-note">Educational content, not medical or legal advice.</p>
</article></div>
</section>
${keepReading([...more, ...fill].slice(0, 3))}
${ctaBand(ctx)}`;
  const can = absUrl(ctx, path);
  const image = hasGenerated(it.gen) ? ctx.site.origin + imgUrl(it.gen, 1440) : null;
  const description = desc160(g.description || g.lede || '');
  return {
    path,
    html: page({
      ctx, path, title: g.seoTitle || `${g.title} | ${ORG}`, description, canonical: can, heroCrumbs: true, crumbs,
      og: { type: 'article', ...(image ? { image } : {}) }, bodyClass: 'n-page n-page--learn', main,
      jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description, datePublished: g.date, dateModified: g.modified || g.date, ...(image ? { image } : {}), mainEntityOfPage: can, author: orgLd(ctx), publisher: orgLd(ctx) },
    }),
  };
}

// ---------- the Learn hub at /blog/ ----------
const TIP_RE = /\b(tips?|how to|guide)\b/i;
function hubPage(ctx, items, postItems) {
  const rec = ctx.content.blog || { sections: [] };
  const path = href(rec.path || '/blog/');
  const s0 = (rec.sections || []).find((s) => s.level === 1) || { blocks: [] };
  const intro = (s0.blocks || []).filter((b) => b.type === 'p').map((b) => `<p class="lede n-hero__lede">${b.html}</p>`).join('');
  const labels = (s0.blocks || []).filter((b) => b.type === 'button').map((b) => b.text); // ALL, NEWS, Education, tips
  const latest = (rec.sections || []).find((s) => (s.blocks || []).some((b) => b.type === 'post-list')) || { heading: 'Latest cannabis insights' };
  const h1 = rec.h1 || 'Find Cannabis News, Education & Culture';
  const h1Html = esc(h1).replace(/(\S+)$/, '<span class="accent">$1</span>');

  // featured = the newest post; zigzag = the next four newest items; the grid holds every post and guide
  const feat = postItems[0];
  const zig = items.filter((x) => x !== feat).slice(0, 4);

  // chips: Uforia's own four filter labels first (ALL / NEWS = its "Blog" posts / Education = "Cannabis Education" /
  // tips = how-to, tips and guide pieces), then the posts' other categories, then the new guides
  const catCount = new Map();
  for (const it of postItems) for (const c of it.cats) catCount.set(c, (catCount.get(c) || 0) + 1);
  const own = [['all', labels[0] || 'ALL'], ['blog', labels[1] || 'NEWS'], ['cannabis-education', labels[2] || 'Education'], ['tips', labels[3] || 'tips']];
  const rest = [...catCount].filter(([c]) => !['Blog', 'Cannabis Education'].includes(c)).sort((a, b) => b[1] - a[1]).map(([c]) => [slugify(c), c]);
  const chips = [...own, ...rest, ...(items.some((x) => x.kind === 'guide') ? [['guides', 'Guides']] : [])];
  const tagsOf = (it) => {
    const t = new Set(['all', ...it.cats.map(slugify)]);
    if (it.kind === 'guide') t.add('guides');
    if (TIP_RE.test(it.title) || it.tags.some((x) => TIP_RE.test(x))) t.add('tips');
    return [...t].join(' ');
  };

  const featHtml = feat ? `<article class="n-feat" data-reveal>
<a class="n-feat__link"${linkAttrs(feat.path)}>
<span class="frame-u n-feat__media" data-tilt>${itemImg(feat, { sizes: '(min-width: 1024px) 600px, 92vw', eager: true, cls: 'n-feat__img', alt: '' })}</span>
<span class="glass glass--lit n-feat__body"><span class="kicker">Featured article</span>
<span class="n-feat__title">${esc(feat.title)}</span>
<span class="n-feat__meta">${esc(feat.label)} <span aria-hidden="true">/</span> <time datetime="${escA(ymd(feat.date))}">${esc(fmtDate(feat.date))}</time></span>
<span class="link-arrow">Read the article ${icon('arrow')}</span></span>
</a>
</article>` : '';

  const hero = `<section class="split-hero n-hero n-hero--hub" aria-labelledby="n-title">
${clip('n-pool--hero')}
<div class="wrap n-hero__grid">
<div class="split-hero__panel n-hero__panel">
${crumbsHtml([{ label: 'Home', href: '/' }, { label: stripTags(h1) }])}
<p class="kicker n-hero__kicker">Learn</p>
<h1 class="display n-hero__title" id="n-title">${h1Html}</h1>
${intro}
<div class="btn-row"><a class="btn btn--silver" href="#n-latest">Browse articles</a><a class="btn btn--glass"${linkAttrs('/education/')}>Education guide</a></div>
</div>
<div class="n-hero__media n-hero__media--feat">${featHtml}</div>
</div>
</section>`;

  const zigHtml = zig.length ? `<section class="band band--lit n-zig-band" aria-labelledby="n-zig">
${clip('n-pool--left')}
<div class="wrap">
<header class="n-head" data-reveal><p class="kicker">Start here</p><h2 class="display n-head__title" id="n-zig">New <span class="accent">guides</span> and reads</h2></header>
<div class="n-zig">${zig.map((it, i) => `<article class="n-zig__row" data-reveal style="--i:${i}">
<a class="frame-u n-zig__media"${linkAttrs(it.path)} tabindex="-1" aria-hidden="true">${itemImg(it, { sizes: '(min-width: 1280px) 700px, (min-width: 900px) 56vw, 92vw', cls: 'n-zig__img', alt: '' })}</a>
<div class="glass glass--lit glass--lift n-zig__body"><p class="kicker">${esc(it.label)}</p>
<h3 class="n-zig__title"><a${linkAttrs(it.path)}>${esc(it.title)}</a></h3>
${it.excerpt ? `<p class="n-zig__excerpt">${esc(it.excerpt)}</p>` : ''}
<p class="n-zig__meta"><time datetime="${escA(ymd(it.date))}">${esc(fmtDate(it.date))}</time>${it.minutes ? ` <span aria-hidden="true">/</span> ${it.minutes} min read` : ''}</p>
<a class="link-arrow"${linkAttrs(it.path)}>Read ${it.kind === 'guide' ? 'the guide' : 'the article'} ${icon('arrow')}</a></div>
</article>`).join('\n')}</div>
</div>
</section>` : '';

  const gridHtml = `<section class="band n-grid-band" id="n-latest" aria-labelledby="n-latest-title">
${clip('n-pool--right')}
<div class="wrap" data-filter-scope data-limit="12">
<header class="n-head n-head--row" data-reveal><div><p class="kicker">All articles</p><h2 class="display n-head__title" id="n-latest-title">${esc(latest.heading || 'Latest cannabis insights')}</h2></div>
<p class="n-head__count" aria-live="polite"><span data-filter-count data-one="article" data-many="articles and guides">${items.length} articles and guides</span></p></header>
<div class="n-chips chip-row" data-filter-group role="group" aria-label="Filter articles by topic">${chips.map(([k, l], i) => `<button type="button" class="chip" data-filter="${escA(k)}" aria-pressed="${i === 0 ? 'true' : 'false'}">${esc(l)}</button>`).join('')}</div>
<div class="n-grid">${items.map((it, i) => card(it, i, ` data-filter-item data-tags="${escA(tagsOf(it))}"`)).join('\n')}</div>
<p class="n-empty" data-filter-empty hidden>No articles match this topic yet.</p>
<p class="n-more"><button type="button" class="btn btn--glass" data-more data-limit="12">Show more</button></p>
</div>
</section>`;

  const main = `${hero}\n${zigHtml}\n${gridHtml}\n${ctaBand(ctx, 'n-rewards')}`;
  return {
    path,
    html: page({
      ctx, path, title: rec.title || `Blog | ${ORG}`, description: rec.description || 'Cannabis news, education and culture from Uforia Dispensary in Jersey City.', canonical: absUrl(ctx, path), heroCrumbs: true,
      crumbs: [{ label: 'Home', href: '/' }, { label: 'Blog' }],
      og: { title: (rec.og && rec.og.title) || rec.title, description: (rec.og && rec.og.description) || rec.description },
      bodyClass: 'n-page n-page--hub', main,
      jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: rec.title, url: absUrl(ctx, path), isPartOf: { '@type': 'WebSite', name: ORG, url: ctx.site.origin } },
    }),
  };
}

export async function render(ctx) {
  const posts = (ctx.posts || []).slice().sort(byDate);
  // the blog page's captured post-list excerpts are Uforia's own card text: reuse them on those cards
  const listed = new Map();
  for (const s of (ctx.content.blog || {}).sections || []) for (const b of s.blocks || []) if (b.type === 'post-list') for (const x of b.items || []) if (x.title) listed.set(stripTags(x.title).trim(), x.excerpt || '');
  const postItems = posts.map((p) => postItem(p, listed.get(String(p.title).trim())));
  const guides = (ctx.learn || []).filter((g) => g && g.title && Array.isArray(g.sections)).filter((g) => !PAGES_OWNED.has(href(g.path || `/learn/${g.slug}/`)));
  const guideItems = guides.map(guideItem);
  const items = [...guideItems, ...postItems].sort(byDate);
  const titles = new Map(items.map((x) => [x.path, x.title]));
  for (const [slug, rec] of Object.entries(ctx.content || {})) if (rec && rec.path) titles.set(href(rec.path), stripTags(rec.h1 || rec.title || slug));

  const out = [hubPage(ctx, items, postItems)];
  posts.forEach((p, i) => out.push(postPage(ctx, p, postItems[i], items)));
  for (const slug of ['education', 'terpenes', 'safe-consumption']) { const pg = capturedPage(ctx, slug, items); if (pg) out.push(pg); }
  guides.forEach((g, i) => out.push(guidePage(ctx, g, guideItems[i], items, titles)));
  return out;
}
