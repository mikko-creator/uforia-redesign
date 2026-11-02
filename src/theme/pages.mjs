// pages.mjs - PAGES lane: /about/ /faq/ /community-partners/ /privacy-policy/ /page/is-weed-legal-in-new-jersey/
// /page/how-to-get-a-medical-marijuana-card-new-jersey/ /learn/understanding-cannabis-purchase-limits/ /404.html.
// Captured pages render every word of src/content/pages/<slug>.json (captured HTML output as is, links mapped through
// href() and the live menu). The FAQ is built only from Uforia's own captured FAQ blocks (delivery.json first, answers
// verbatim). NJ law pages print only nj-law.json statements, each paragraph with its source link; conflicting facts are
// printed side by side with their own sources; facts about taxes are never used. Classes: contract classes + p- prefix.
import { page, crumbsHtml, icon } from './shell.mjs';
import { esc, escA, attrs, href, linkAttrs, gimg, img, stripTags, absUrl, liveMenu } from './util.mjs';

// ---------- small helpers ----------
const kicker = (t) => (t ? `<p class="kicker p-kicker">${esc(t)}</p>` : '');
const btn = (u, label, cls = 'btn--silver') => `<a class="btn ${cls}"${linkAttrs(u)}>${esc(label)}</a>`;
const arrow = (u, label) => `<a class="link-arrow p-arrow"${linkAttrs(u)}>${esc(label)}${icon('arrow')}</a>`;
const HOME = { href: '/', label: 'Home' };

// captured inline HTML: map every href (menu links to the live menu, internal links to directory form)
function mapLinks(ctx, html) {
  return String(html).replace(/href="([^"]*)"/g, (m, u) => {
    const raw = u.replace(/&amp;/g, '&');
    const mm = raw.match(/^(?:https?:\/\/(?:www\.)?uforiadispensary\.com)?\/menu(\/[^?#]*)?(.*)$/i);
    if (mm) {
      const rest = (mm[1] || '').replace(/\/$/, '');
      return `href="${escA(ctx.site.liveMenu.base + rest + (mm[2] || ''))}"`;
    }
    return `href="${escA(href(raw))}"`;
  });
}
const mapBtn = (ctx, u) => (/^(?:https?:\/\/(?:www\.)?uforiadispensary\.com)?\/menu/i.test(u) ? mapLinks(ctx, `href="${u}"`).slice(6, -1) : u);

function out(ctx, { path, title, description, og = {}, crumbs, main, mod, jsonld = [] }) {
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: absUrl(ctx, path),
      og: { title: og.title || title, description: og.description || description, type: 'website' },
      jsonld, bodyClass: `p-page p-page--${mod}`, main, crumbs, heroCrumbs: true,
    }),
  };
}

// the adopted inner-page split hero: title panel on a dark lit ground (no glass box behind the text), the image in the
// brand frame on the right, overhanging the hero's lower edge into the next band. Crumbs inside the hero.
function hero({ crumbs, kick, title, lede = '', ctas = [], media = '', mod = '' }) {
  return `<section class="p-hero ${mod}" data-spot>
<div class="band__clip p-hero__clip" aria-hidden="true"><span class="p-hero__pool"></span><span class="haze p-hero__haze"></span><span class="grain"></span></div>
<div class="wrap p-hero__grid">
<div class="p-hero__text" data-reveal>
<div class="p-hero__crumbs">${crumbsHtml(crumbs)}</div>
${kicker(kick)}
<h1 class="display p-hero__title">${title}</h1>
${lede ? `<p class="lede p-hero__lede">${lede}</p>` : ''}
${ctas.length ? `<div class="btn-row p-hero__ctas">${ctas.join('')}</div>` : ''}
</div>
${media ? `<div class="p-hero__media protrude" data-reveal style="--i:1"><div class="frame-u p-hero__frame" data-depth="0.06">${media}</div></div>` : ''}
</div>
</section>`;
}
const band = (inner, { mod = '', label = '', tone = '' } = {}) => `<section${attrs({ class: `p-band ${tone ? 'p-band--' + tone : ''} ${mod}`.replace(/\s+/g, ' ').trim(), 'aria-labelledby': label || null })}>
<div class="band__clip p-band__clip" aria-hidden="true"><span class="p-pool"></span></div>
${inner}
</section>`;

function captured(ctx, slug) {
  const c = ctx.content[slug];
  if (!c) throw new Error('pages.mjs: missing captured page ' + slug);
  return c;
}
const blocksOf = (c) => c.sections.flatMap((s) => s.blocks || []);

// ---------- /about/ ----------
function about(ctx) {
  const c = captured(ctx, 'about');
  const path = '/about/';
  const crumbs = [HOME, { href: path, label: 'About' }];
  const B = blocksOf(c);
  const story = B.find((b) => b.type === 'p' && b.role === 'divider-text');
  const ps = B.filter((b) => b.type === 'p' && b.role !== 'divider-text');
  const pic = B.find((b) => b.type === 'img');
  if (!story || ps.length !== 5 || !pic) throw new Error('pages.mjs: about.json shape changed (expected divider + 5 paragraphs + 1 image)');
  // the closing sentence of the last paragraph becomes the statement band (its words are printed once, there)
  const last = ps[4].html;
  const cut = last.indexOf('Here’s to good health');
  if (cut < 1) throw new Error('pages.mjs: about statement sentence not found');
  const lastA = last.slice(0, cut).trim();
  const statement = last.slice(cut).trim();
  const P = (h) => `<p>${mapLinks(ctx, h)}</p>`;
  const rows = [
    { text: `${kicker(stripTags(story.html))}${P(ps[0].html)}${P(ps[1].html)}`, media: `<div class="frame-u p-zz__frame p-zz__frame--break" data-tilt>${img({ src: pic.src, alt: pic.alt, w: pic.w, h: pic.h }, { sizes: '(min-width: 1024px) 420px, (min-width: 761px) 40vw, calc(62vw - 20px)', cls: 'p-zz__img' })}</div>`, mod: 'p-zz__row--photo' },
    { text: `${P(ps[2].html)}`, media: `<div class="frame-u p-zz__frame">${gimg('g-jars', { alt: '', sizes: '(min-width: 1024px) 520px, (min-width: 761px) 45vw, calc(84vw - 27px)', cls: 'p-zz__img' })}</div>` },
    { text: `${P(ps[3].html)}`, media: `<div class="frame-u p-zz__frame">${gimg('g-leaf-silver', { alt: '', sizes: '(min-width: 1024px) 520px, (min-width: 761px) 45vw, calc(84vw - 27px)', cls: 'p-zz__img' })}</div>` },
    { text: `${P(lastA)}`, media: `<div class="frame-u p-zz__frame">${gimg('g-smoke-beam', { alt: '', sizes: '(min-width: 1024px) 520px, (min-width: 761px) 45vw, calc(84vw - 27px)', cls: 'p-zz__img' })}</div>` },
  ];
  const zz = rows.map((r, i) => `<div class="p-zz__row ${i % 2 ? 'p-zz__row--rev' : ''} ${r.mod || ''}">
<div class="p-zz__text prose" data-reveal>${r.text}</div>
<div class="p-zz__media" data-reveal style="--i:1">${r.media}</div>
</div>`).join('\n');
  const main = `${hero({
    crumbs, kick: 'About Uforia', title: esc(c.h1),
    lede: esc(c.og && c.og.description ? c.og.description : ''),
    ctas: [btn('/locations/', 'Find us'), btn(liveMenu(ctx), 'Shop the menu', 'btn--glass')],
    media: gimg('g-flower-macro', { alt: '', eager: true, sizes: '(min-width: 1024px) 560px, (min-width: 761px) 45vw, calc(88vw - 28px)', cls: 'p-hero__img' }),
    mod: 'p-hero--about',
  })}
${band(`<div class="wrap p-zz">${zz}</div>`, { mod: 'p-band--story' })}
<section class="p-statement" aria-label="Our promise">
<div class="band__clip p-statement__clip" aria-hidden="true"><span class="p-statement__beam"></span><span class="haze"></span><span class="grain"></span></div>
<div class="wrap p-statement__in" data-reveal><p class="display p-statement__line">${esc(statement)}</p>
<div class="btn-row p-statement__ctas">${btn('/locations/', 'Find a dispensary')}${btn(liveMenu(ctx), 'Shop the live menu', 'btn--glass')}</div></div>
</section>`;
  return out(ctx, { path, title: c.title, description: c.description, og: c.og || {}, crumbs, main, mod: 'about' });
}

// ---------- /community-partners/ ----------
function partners(ctx) {
  const c = captured(ctx, 'community-partners');
  const path = '/community-partners/';
  const crumbs = [HOME, { href: path, label: 'Community Partners' }];
  const [intro, ...rest] = c.sections.filter((s) => (s.blocks || []).length);
  const ib = intro.blocks;
  const heroImg = ib.find((b) => b.type === 'img');
  const label = ib.find((b) => b.type === 'p' && b.role === 'divider-text');
  const introPs = ib.filter((b) => b.type === 'p' && b.role !== 'divider-text');
  // partner cards: each img starts a card; h2, p, button follow it
  const cards = [];
  for (const s of rest) for (const b of s.blocks) {
    if (b.type === 'img') cards.push({ img: b, parts: [] });
    else if (cards.length) cards[cards.length - 1].parts.push(b);
    else throw new Error('pages.mjs: community-partners block before any partner logo');
  }
  const cardHtml = cards.map((cd, i) => {
    const h = cd.parts.find((b) => b.type === 'h2');
    const body = cd.parts.filter((b) => b.type === 'p').map((b) => `<p>${mapLinks(ctx, b.html)}</p>`).join('');
    const bt = cd.parts.find((b) => b.type === 'button');
    const id = 'partner-' + (i + 1);
    const known = new Set(['h2', 'p', 'button']);
    const other = cd.parts.filter((b) => !known.has(b.type));
    if (other.length) throw new Error('pages.mjs: community-partners has unexpected blocks: ' + other.map((b) => b.type).join(','));
    return `<article class="p-partner glass glass--lit glass--lift ${i % 2 ? 'p-partner--rev' : ''}" data-reveal style="--i:${i % 3}" aria-labelledby="${id}">
<div class="p-partner__logo frame-u">${img({ src: cd.img.src, alt: cd.img.alt, w: cd.img.w, h: cd.img.h }, { sizes: '(min-width: 761px) 240px, 120px', cls: 'p-partner__img' })}</div>
<div class="p-partner__copy">${h ? `<h2 class="p-partner__name" id="${id}">${esc(h.text)}</h2>` : ''}<div class="prose p-partner__body">${body}</div>
${bt ? `<p class="p-partner__cta"><a class="btn btn--glass btn--sm"${linkAttrs(mapBtn(ctx, bt.href))}>${esc(bt.text)}${icon('ext')}<span class="p-sr"> (opens in a new tab)</span></a></p>` : ''}</div>
</article>`;
  }).join('\n');
  const main = `${hero({
    crumbs, kick: 'Community', title: esc(c.h1),
    lede: esc(c.og && c.og.description ? c.og.description : ''),
    ctas: [btn('/about/', 'About Uforia'), btn('/locations/', 'Find us', 'btn--glass')],
    media: img({ src: heroImg.src, alt: heroImg.alt, w: heroImg.w, h: heroImg.h }, { eager: true, sizes: '(min-width: 1024px) 560px, (min-width: 761px) 45vw, calc(88vw - 28px)', cls: 'p-hero__img p-hero__img--contain' }),
    mod: 'p-hero--partners',
  })}
${band(`<div class="wrap wrap--narrow p-cp-intro" data-reveal>${label ? kicker(stripTags(label.html)) : ''}<div class="prose p-lead-prose">${introPs.map((b) => `<p>${mapLinks(ctx, b.html)}</p>`).join('')}</div></div>
<div class="wrap p-partners">${cardHtml}</div>`, { mod: 'p-band--partners' })}`;
  return out(ctx, { path, title: c.title, description: c.description, og: c.og || {}, crumbs, main, mod: 'partners' });
}

// ---------- /privacy-policy/ ----------
function privacy(ctx) {
  const c = captured(ctx, 'privacy-policy');
  const path = '/privacy-policy/';
  const crumbs = [HOME, { href: path, label: 'Privacy Policy' }];
  const mail = ctx.site.email;
  const main = `${hero({
    crumbs, kick: 'Legal', title: esc(c.h1),
    lede: `Questions about your data? Contact us at <a class="p-mail"${linkAttrs('mailto:' + mail)}>${esc(mail)}</a>.`,
    mod: 'p-hero--privacy p-hero--solo',
  })}`;
  return out(ctx, { path, title: c.title, description: c.description, og: c.og || {}, crumbs, main, mod: 'privacy' });
}

// ---------- /faq/ (NEW) ----------
// Topic of each Uforia question (exact captured text). A question with no topic here still renders, under "More".
const FAQ_TOPICS = [
  ['Ordering and delivery', ['How do I place an Order for delivery?', 'What times are available for delivery?', 'Where can I receive a delivery?', 'Can my order be delivered to my car?', 'How will my order be delivered?', 'How do I track the status of my delivery order?', 'Can I designate someone else to accept my delivery?', 'Is there a delivery fee?']],
  ['Age and ID', ['Is there an age requirement to purchase cannabis products?', 'Is identification (ID) verification required to place a delivery order?', 'What is considered valid identification (ID)?', 'Is a signature required upon delivery?']],
  ['Payments and receipts', ['Is cash accepted upon delivery?', 'How do I pay for my delivery order?', 'Will I receive an invoice or receipt with my order?']],
  ['Products', ['How can I confirm that the cannabis product I purchased is regulated?']],
];
export function faqItems(ctx) {
  // delivery.json first (the main FAQ), then every other captured page; identical questions are kept once (first wins)
  const order = ['delivery', 'delivery-faq', ...Object.keys(ctx.content).sort().filter((s) => s !== 'delivery' && s !== 'delivery-faq' && s !== 'dispensary-near-locality-nj')];
  const seen = new Map();
  for (const slug of order) {
    const c = ctx.content[slug];
    if (!c) continue;
    for (const b of blocksOf(c)) if (b.type === 'faq') for (const it of b.items || []) {
      const q = String(it.q || '').trim();
      if (q && it.a_html && !seen.has(q)) seen.set(q, { q, a: it.a_html, from: slug });
    }
  }
  return [...seen.values()].slice(0, 30);
}
function faq(ctx) {
  const path = '/faq/';
  const crumbs = [HOME, { href: path, label: 'FAQ' }];
  const items = faqItems(ctx);
  const byQ = new Map(items.map((x) => [x.q, x]));
  const used = new Set();
  const groups = FAQ_TOPICS.map(([t, qs]) => [t, qs.filter((q) => byQ.has(q)).map((q) => { used.add(q); return byQ.get(q); })]);
  const restQ = items.filter((x) => !used.has(x.q));
  if (restQ.length) groups.push(['More questions', restQ]);
  let n = 0;
  const gh = groups.filter(([, qs]) => qs.length).map(([t, qs], gi) => {
    const id = 'faq-' + t.toLowerCase().replace(/[^a-z]+/g, '-');
    return `<section class="p-faq__group" aria-labelledby="${id}" data-reveal style="--i:${gi % 3}">
<h3 class="p-faq__topic" id="${id}">${esc(t)}<span class="p-faq__count">${qs.length}</span></h3>
<div class="faq p-faq__list">${qs.map((x) => { n++; return `<details class="p-faq__item"${n === 1 ? ' open' : ''}><summary class="p-faq__q"><span>${esc(x.q)}</span></summary><div class="p-faq__a prose">${mapLinks(ctx, x.a)}</div></details>`; }).join('\n')}</div>
</section>`;
  }).join('\n');
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(x.a.replace(/<\/(p|li|h4)>/g, ' ')).replace(/\s+/g, ' ').trim() } })) };
  const main = `${hero({
    crumbs, kick: 'Help', title: `Frequently Asked <span class="accent">Questions</span>`,
    lede: 'Answers from Uforia about ordering, delivery, ID and payment.',
    ctas: [btn('/delivery/', 'Delivery'), btn(liveMenu(ctx), 'Shop the menu', 'btn--glass')],
    media: gimg('g-doorstep', { alt: '', eager: true, sizes: '(min-width: 1024px) 560px, (min-width: 761px) 45vw, calc(88vw - 28px)', cls: 'p-hero__img' }),
    mod: 'p-hero--faq',
  })}
${band(`<div class="wrap wrap--narrow p-faq">
<header class="p-head" data-reveal><h2 class="display p-head__title" id="common-questions">Common questions</h2></header>
${gh}
<p class="p-faq__more" data-reveal>${arrow('/finds-us/', 'Still have a question? Contact us')}</p>
</div>`, { mod: 'p-band--faq', label: 'common-questions' })}`;
  return out(ctx, { path, title: 'Frequently Asked Questions | Uforia Dispensary', description: 'Answers to common questions about ordering, delivery, age and ID requirements and payment at Uforia Dispensary in Jersey City.', crumbs, main, mod: 'faq', jsonld: [ld] });
}

// ---------- NJ law pages (facts from ctx.nj only) ----------
// glue sentences printed on the NJ pages (everything else in their <main> is a fact statement or a source title);
// tmp/pages/nj-check.mjs verifies this.
export const NJ_GLUE = {
  intro: 'Each statement below restates an official State of New Jersey source, linked after every paragraph.',
  conflict: 'Two official texts give different figures here. Both are shown, each with its source.',
  reviewed: 'Last reviewed November 2026',
  advice: 'This is general information, not legal advice.',
  sources: 'Sources',
  sourceLabel: 'Source:',
  tableCaption: 'Per-transaction limits for adult-use customers. Each figure links to its source.',
};
const FACT_TOPIC_BANNED = /\btax(es)?\b/i; // never mention taxes

function njFacts(ctx) {
  const nj = ctx.nj;
  const facts = new Map(nj.facts.map((f) => [f.id, f]));
  const sources = new Map(nj.sources.map((s) => [s.id, s]));
  const fact = (id) => {
    const f = facts.get(id);
    if (!f) throw new Error('pages.mjs: unknown nj-law fact ' + id);
    if (FACT_TOPIC_BANNED.test(f.statement)) throw new Error('pages.mjs: tax fact used: ' + id);
    return f;
  };
  return { fact, source: (id) => { const s = sources.get(id); if (!s) throw new Error('pages.mjs: unknown nj source ' + id); return s; } };
}

function lawRenderer(ctx) {
  const F = njFacts(ctx);
  const used = [];
  const useSrc = (sid) => { if (!used.includes(sid)) used.push(sid); return F.source(sid); };
  const srcLink = (sid) => { const s = useSrc(sid); return `<a class="p-src"${linkAttrs(s.url)}>${esc(s.title)}<span class="p-sr"> (opens in a new tab)</span></a>`; };
  // one paragraph: statements (same source) joined + "Source: <title>"; `also` = facts with the identical statement
  const para = (ids, also = []) => {
    const fs = ids.map(F.fact);
    const sids = [...new Set([...fs.map((f) => f.sourceId), ...also.map((a) => F.fact(a).sourceId)])];
    for (const a of also) if (F.fact(a).statement !== fs[0].statement) throw new Error('pages.mjs: also-fact differs: ' + a);
    if (new Set(fs.map((f) => f.sourceId)).size > 1) throw new Error('pages.mjs: joined facts from different sources: ' + ids.join(','));
    return `<p class="p-fact" data-fact="${escA([...ids, ...also].join(' '))}">${fs.map((f) => esc(f.statement)).join(' ')} <span class="p-src-wrap">${esc(NJ_GLUE.sourceLabel)} ${sids.map(srcLink).join('; ')}</span></p>`;
  };
  const conflict = (specs) => `<div class="p-conflict glass glass--lit" data-reveal><p class="p-conflict__label">${icon('id', 'p-conflict__ico')}<span>${esc(NJ_GLUE.conflict)}</span></p>${specs.map((s) => (Array.isArray(s) ? para(...s) : para([s]))).join('')}</div>`;
  const item = (it) => (it.conflict ? conflict(it.conflict) : para(it.ids || it, it.also || []));
  const steps = (ids) => `<ol class="p-steps" role="list">${ids.map((id, i) => `<li class="p-step glass glass--lit" data-reveal style="--i:${i}"><span class="p-step__n" aria-hidden="true">${i + 1}</span>${para([id])}</li>`).join('')}</ol>`;
  const section = (s, si) => `<section class="p-law__sec" aria-labelledby="${escA(s.id)}">
<h2 class="p-law__h" id="${escA(s.id)}" data-reveal>${esc(s.title)}</h2>
${s.steps ? steps(s.steps) : ''}
${(s.items || []).map(item).join('\n')}
${s.more ? `<p class="p-law__more">${arrow(s.more[0], s.more[1])}</p>` : ''}
</section>`;
  const sourcesList = () => `<section class="p-law__sources" aria-labelledby="law-sources">
<h2 class="p-law__h p-law__h--sm" id="law-sources">${esc(NJ_GLUE.sources)}</h2>
<ol class="p-sources" role="list">${used.map((sid) => { const s = F.source(sid); return `<li><a${linkAttrs(s.url)}>${esc(s.title)}<span class="p-sr"> (opens in a new tab)</span></a> <span class="p-sources__pub">${esc(s.publisher)}</span></li>`; }).join('')}</ol>
<p class="p-review">${icon('clock', 'p-review__ico')}<span>${esc(NJ_GLUE.reviewed)}</span></p>
<p class="p-advice">${esc(NJ_GLUE.advice)}</p>
</section>`;
  // a table cell: the exact words of a fact statement (asserted) + a link to its source
  const cell = (id, words) => {
    const f = F.fact(id);
    if (!f.statement.includes(words)) throw new Error(`pages.mjs: table words not in fact ${id}: ${words}`);
    return `<td data-fact="${escA(id)}"><span class="p-cell">${esc(words)}</span> ${srcLink(f.sourceId)}</td>`;
  };
  return { section, sourcesList, cell, F };
}

export const LAW_PAGES = [
  {
    path: '/page/is-weed-legal-in-new-jersey/', crumb: 'Is weed legal in New Jersey?', mod: 'law',
    title: 'Is Weed Legal in New Jersey? | Uforia Dispensary',
    description: 'What New Jersey law says about adult-use cannabis: age, possession, purchase limits, where you can consume, home grow, driving and transport, with official sources.',
    h1: `Is weed legal in <span class="accent">New Jersey?</span>`,
    lede: 'What the state says about adult-use cannabis, with a link to the official source after every statement.',
    art: 'g-smoke-beam', kick: 'New Jersey law',
    ctas: [['/learn/understanding-cannabis-purchase-limits/', 'Purchase limits'], ['/page/how-to-get-a-medical-marijuana-card-new-jersey/', 'Medical card guide']],
    sections: [
      { id: 'legality', title: 'Is cannabis legal in New Jersey?', items: [['legal-creamm-act'], ['legal-buy-at-licensed'], ['legal-unlicensed-illegal'], ['legal-product-categories'], ['legal-municipal-rules'], ['legal-federal-law']] },
      { id: 'age', title: 'Age and ID', items: [['age-who-can-buy', 'age-id-check'], ['age-id-each-transaction', 'age-under-21-prohibited', 'age-under-21-entry'], ['age-adults-supplying-minors']] },
      { id: 'possession', title: 'Possession', items: [{ conflict: [[['poss-six-ounces'], ['poss-six-ounces-faq']], 'poss-rule-one-ounce'] }, ['poss-gifting']] },
      { id: 'purchase-limits', title: 'Purchase limits', items: [['limit-per-transaction']], more: ['/learn/understanding-cannabis-purchase-limits/', 'Every per-transaction limit'] },
      { id: 'consumption', title: 'Where you can consume', items: [['use-private-spaces', 'use-where-cigarettes'], ['use-private-property'], ['use-smoke-free-air-act'], ['use-rule-tobacco-places', 'use-rule-institutions', 'use-rule-landlords'], ['use-consumption-areas', 'use-consumption-area-rules'], ['use-consumption-area-own-cannabis', 'use-consumption-area-open-packages'], ['use-workplace', 'use-workplace-testing']] },
      { id: 'home-grow', title: 'Growing at home', items: [['grow-not-allowed'], ['grow-medical-not-allowed']] },
      { id: 'driving', title: 'Driving', items: [['drive-illegal', 'drive-medical-too', 'drive-statute'], ['drive-dre', 'drive-first-offense'], ['drive-rule-no-dui']] },
      { id: 'transport', title: 'Travel and transport', items: [['transport-state-lines']] },
    ],
  },
  {
    path: '/page/how-to-get-a-medical-marijuana-card-new-jersey/', crumb: 'Medical card in New Jersey', mod: 'medical',
    title: 'How to Get a Medical Marijuana Card in New Jersey | Uforia Dispensary',
    description: "How New Jersey's Medicinal Cannabis Program works: who is eligible, how to register, card fees, caregivers and medical purchase limits, with official sources.",
    h1: `How to get a medical marijuana card in <span class="accent">New Jersey</span>`,
    lede: "How the state's Medicinal Cannabis Program works, who qualifies and how to register, from the program's official pages.",
    art: 'g-tincture', kick: 'Medical cannabis',
    ctas: [['/page/is-weed-legal-in-new-jersey/', 'Is weed legal in New Jersey?'], ['/learn/understanding-cannabis-purchase-limits/', 'Purchase limits']],
    sections: [
      { id: 'program', title: 'The Medicinal Cannabis Program', items: [['mcp-what-it-is', 'mcp-laws'], ['mcp-not-insured', 'mcp-privacy'], ['mcp-patient-services']] },
      { id: 'eligibility', title: 'Who is eligible', items: [['elig-requirements', 'elig-bona-fide'], { conflict: ['elig-conditions', 'elig-conditions-faq'] }, ['elig-oud'], ['elig-adults-and-minors'], ['elig-out-of-state']] },
      { id: 'steps', title: 'How to register, step by step', steps: ['steps-find-provider', 'steps-authorization', 'steps-portal-account', 'steps-complete-registration'], items: [['steps-residency-proof'], { conflict: ['steps-photo-60-days', 'steps-photo-30-days'] }, { conflict: ['steps-minor-attestation-pediatrician', 'steps-minor-attestation-provider'] }, ['steps-online-only', 'steps-no-expedite', 'steps-buy-during-review'], ['steps-renewal']] },
      { id: 'fees', title: 'Card fees and validity', items: [['fee-id-card'], ['fee-card-validity']] },
      { id: 'caregivers', title: 'Caregivers', items: [['cg-up-to-two', 'cg-registration', 'cg-qualify', 'cg-background-check', 'cg-expiration'], ['cg-driver-not-needed']] },
      { id: 'medical-purchase', title: 'Buying as a medical patient', items: [{ conflict: ['medbuy-85g-orders', 'medbuy-85g-max', 'medbuy-84g-flower'] }, ['medbuy-any-combination', 'medbuy-vs-adult', 'medbuy-id-required', 'medbuy-priority']] },
      { id: 'medical-use', title: 'Using and carrying medicinal cannabis', items: [['use-medical-vehicle-federal', 'drive-medical-operate', 'transport-medical-state-lines', 'transport-medical-packaging']] },
    ],
  },
  {
    path: '/learn/understanding-cannabis-purchase-limits/', crumb: 'Understanding cannabis purchase limits', mod: 'limits', table: true,
    title: 'Understanding Cannabis Purchase Limits | Uforia Dispensary',
    description: 'New Jersey cannabis purchase limits per transaction by product type, combination purchases, possession and medical patient limits, with official sources.',
    h1: `Understanding cannabis <span class="accent">purchase limits</span>`,
    lede: 'How much cannabis you can buy in one transaction in New Jersey, by product type, from the official sources.',
    art: 'g-jars', kick: 'New Jersey law', crumbMid: { href: '/blog/', label: 'Learn' },
    ctas: [['live:', 'Shop the menu'], ['/page/is-weed-legal-in-new-jersey/', 'Is weed legal in New Jersey?']],
    sections: [
      { id: 'adult-limits', title: 'Adult-use limits per transaction', items: [['limit-per-transaction', 'limit-flower', 'limit-concentrate', 'limit-edibles'], { conflict: ['limit-vape', 'limit-rule-concentrate-vape'] }, ['limit-rule-flower', 'limit-rule-edibles']] },
      { id: 'combining', title: 'Combining products', items: [['limit-combination'], ['limit-rule-combination']] },
      { id: 'possession', title: 'How much you can possess', items: [{ conflict: [[['poss-six-ounces'], ['poss-six-ounces-faq']], 'poss-rule-one-ounce'] }, ['poss-gifting']] },
      { id: 'medical-patients', title: 'Medical patients', items: [{ conflict: ['medbuy-85g-max', 'medbuy-84g-flower'] }, ['medbuy-vs-adult', 'medbuy-any-combination']], more: ['/page/how-to-get-a-medical-marijuana-card-new-jersey/', 'How to get a medical card'] },
    ],
  },
];

function lawPage(ctx, spec) {
  const R = lawRenderer(ctx);
  const crumbs = [HOME, ...(spec.crumbMid ? [spec.crumbMid] : []), { href: spec.path, label: spec.crumb }];
  const ctaUrl = (u) => (u === 'live:' ? liveMenu(ctx) : u);
  let table = '';
  if (spec.table) {
    const rows = [
      ['All products combined', ['limit-per-transaction', 'up to the equivalent of 1 ounce (28.35 grams) of usable cannabis'], ['limit-rule-combination', 'may not exceed 28.35 grams (one ounce) or the equivalent']],
      ['Dried flower', ['limit-flower', 'up to 28.35 grams (1 ounce) of dried flower'], ['limit-rule-flower', 'may not sell more than 28.35 grams (one ounce) of usable cannabis']],
      ['Solid concentrate or resin', ['limit-concentrate', 'up to 4 grams of solid cannabis concentrate or resin'], ['limit-rule-concentrate-vape', 'four grams of solid concentrate']],
      ['Liquid concentrate', ['limit-concentrate', 'the equivalent of 4 grams of concentrate in liquid form'], ['limit-rule-concentrate-vape', 'four mL of liquid concentrate (oil)']],
      ['Vaporized formulations (oil)', ['limit-vape', 'up to 4 grams of vaporized formulations (oil)'], ['limit-rule-concentrate-vape', 'vaporized formulations containing no more than four mL of oil']],
      ['Edibles and other ingestibles', ['limit-edibles', 'up to 1,000 mg of ingestible cannabis products such as gummies'], ['limit-rule-edibles', 'an aggregate total of 1,000 mg of THC']],
    ];
    const srcA = R.F.source('crc-adult');
    const srcR = R.F.source('njac-17-30');
    table = `<section class="p-law__sec p-limits" aria-labelledby="limits-table">
<h2 class="p-law__h" id="limits-table" data-reveal>Limits at a glance</h2>
<div class="p-table glass glass--strong glass--lit" data-reveal><table>
<caption>${esc(NJ_GLUE.tableCaption)}</caption>
<thead><tr><th scope="col">Product type</th><th scope="col">${esc(srcA.title)}</th><th scope="col">${esc(srcR.title.replace(/ \(Supp\..*\)$/, ''))}</th></tr></thead>
<tbody>${rows.map(([label, a, r]) => `<tr><th scope="row">${esc(label)}</th>${R.cell(a[0], a[1])}${R.cell(r[0], r[1])}</tr>`).join('')}</tbody>
</table></div>
</section>`;
  }
  const body = spec.sections.map(R.section).join('\n');
  const tocList = [...(spec.table ? [['limits-table', 'Limits at a glance']] : []), ...spec.sections.map((s) => [s.id, s.title]), ['law-sources', NJ_GLUE.sources]].map(([id, t]) => `<li><a href="#${escA(id)}">${esc(t)}</a></li>`).join('');
  // phones: the same contents as a collapsed disclosure in the main column (hidden attribute on desktop, where the
  // sticky aside shows it; pages.css un-hides it below 1024px)
  const tocPhone = `<details class="p-toc-m" hidden><summary class="p-toc-m__sum"><span>On this page</span>${icon('chev', 'p-toc-m__chev')}</summary><nav aria-label="On this page"><ol role="list">${tocList}</ol></nav></details>`;
  const main = `${hero({
    crumbs, kick: spec.kick, title: spec.h1, lede: esc(spec.lede),
    ctas: spec.ctas.map(([u, l], i) => btn(ctaUrl(u), l, i ? 'btn--glass' : 'btn--silver')),
    media: gimg(spec.art, { alt: '', eager: true, sizes: '(min-width: 1024px) 520px, (min-width: 761px) 45vw, calc(88vw - 28px)', cls: 'p-hero__img' }),
    mod: 'p-hero--law',
  })}
${band(`<div class="wrap p-law">
<div class="p-law__main">
<p class="p-law__intro" data-reveal>${esc(NJ_GLUE.intro)}</p>
${tocPhone}
${table}
${body}
${R.sourcesList()}
</div>
<aside class="p-law__aside" aria-label="On this page"><nav class="p-toc glass glass--lit"><p class="p-toc__title">On this page</p><ol role="list">${tocList}</ol></nav></aside>
</div>`, { mod: 'p-band--law', tone: 'calm' })}`;
  return out(ctx, { path: spec.path, title: spec.title, description: spec.description, crumbs, main, mod: spec.mod });
}

// ---------- /404.html ----------
function notFound(ctx) {
  const L = ctx.site.brandLogo;
  const links = [['/', 'Home'], ['/shop/', 'Shop'], ['/blog/', 'Learn'], ['/locations/', 'Find a dispensary']];
  const main = `<section class="p-404" data-spot>
<div class="band__clip p-404__clip" aria-hidden="true"><span class="p-404__pool"></span><span class="haze"></span><span class="grain"></span></div>
<div class="wrap p-404__in" data-reveal>
<a class="p-404__logo"${linkAttrs('/')} aria-label="${escA(ctx.site.name)} home">${img({ src: L.src, alt: '', w: L.w, h: L.h }, { eager: true, sizes: '200px', cls: 'p-404__img' })}</a>
<p class="kicker p-kicker">Error 404</p>
<h1 class="display p-404__title">Page not <span class="accent">found</span></h1>
<p class="lede p-404__lede">The page you asked for is not here. These links will get you back on track.</p>
<ul class="p-404__links" role="list">${links.map(([u, l]) => `<li><a class="btn btn--glass"${linkAttrs(u)}>${esc(l)}</a></li>`).join('')}</ul>
</div>
</section>`;
  return out(ctx, { path: '/404.html', title: 'Page not found | Uforia Dispensary', description: 'The page you asked for could not be found on the Uforia Dispensary site.', crumbs: [], main, mod: '404' });
}

export async function render(ctx) {
  return [about(ctx), faq(ctx), partners(ctx), privacy(ctx), ...LAW_PAGES.map((s) => lawPage(ctx, s)), notFound(ctx)];
}
