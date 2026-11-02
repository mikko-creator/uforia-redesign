// util.mjs - shared helpers (main session owns this file; lanes import, never edit - ask through your report).
import { img, picture, imgUrl, hasGenerated } from '../lib/images.mjs';
export { img, picture, imgUrl, hasGenerated };

// Generated image by id (docs/BUILD-CONTRACT.md "Generated image ids"). While IMAGERY is still producing, a lane build
// with ALLOW_MISSING_GEN=1 gets a styled placeholder slot instead of a build failure; the final build (no env) fails on
// any missing id.
export function gimg(id, opts = {}) {
  if (hasGenerated(id) || process.env.ALLOW_MISSING_GEN !== '1') return img(id, opts);
  return `<span class="img-slot ${opts.cls || ''}" data-slot="${String(id).replace(/"/g, '')}" role="img" aria-label="${String(opts.alt || '').replace(/"/g, '&quot;')}"></span>`;
}

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escA = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const attrs = (o = {}) => Object.entries(o).filter(([, v]) => v !== false && v != null && v !== '').map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escA(v)}"`)).join('');
export const isExternal = (u) => /^(https?:)?\/\//i.test(String(u)) || /^(mailto|tel|sms):/i.test(String(u));

// Internal page paths are directories ("/shop" -> "/shop/"); "#frag" and "?q" survive; files ("/404.html",
// "/assets/...") are left alone. External URLs unchanged.
export function href(u) {
  const s = String(u ?? '');
  if (!s || isExternal(s) || s.startsWith('#')) return s;
  const m = s.match(/^([^?#]*)([?#].*)?$/);
  let p = m[1];
  const rest = m[2] || '';
  if (!p.startsWith('/')) return s;
  if (p.startsWith('/assets/') || /\.[a-z0-9]{2,5}$/i.test(p)) return s;
  if (!p.endsWith('/')) p += '/';
  return p + rest;
}

// <a> attributes for any URL: external links open in a new tab with rel noopener (mailto/tel stay in place).
export function linkAttrs(u, extra = {}) {
  const h = href(String(u ?? ''));
  const ext = /^(https?:)?\/\//i.test(h);
  return attrs({ href: h, ...(ext ? { target: '_blank', rel: 'noopener' } : {}), ...extra });
}

// Client photo by file name in assets/photos ("watermelon-sherbet.webp"): <img> with WebP variants + srcset.
// alt defaults to site.json productPhotos[file].alt when present.
export function photo(ctx, file, opts = {}) {
  const meta = ((ctx.site && ctx.site.productPhotos) || {})[file] || {};
  return img({ src: '/assets/photos/' + file, alt: opts.alt != null ? opts.alt : meta.alt || '' }, opts);
}

export const slugify = (s) => String(s).toLowerCase().replace(/&[a-z]+;/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const stripTags = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Absolute URL for canonicals / og:url on the preview origin (site.json origin).
export const absUrl = (ctx, p) => ctx.site.origin + href(p);

// Uforia's live online menu (Dispense, on Uforia's own domain): every "shop / order" CTA ends there. Category slugs
// are the live menu's own (site.json liveMenu.categories). liveMenu(ctx) = the menu home.
export const liveMenu = (ctx, cat) => ctx.site.liveMenu.base + (cat ? '/categories/' + cat : '');

// The towns Uforia serves (site.json serviceAreas: { name, slug, path } with Uforia's own page paths, kept as captured).
export const serviceAreas = (ctx) => ctx.site.serviceAreas || [];

// Preview forms are NOT wired to any service: every form renders with data-demo-form; site.js stops the submit and
// shows the inline note. Use demoForm() for every form so the wording stays one sentence site-wide.
export const DEMO_NOTE = 'This preview form is not connected yet, so nothing is sent.';
export function demoForm({ id = '', fields = [], button = 'Submit', cls = '' } = {}) {
  return `<form class="demo-form ${cls}" data-demo-form novalidate${id ? ` id="${escA(id)}"` : ''}>
${fields.map((f, i) => { const name = slugify(f); const type = /email/i.test(f) ? 'email' : /zip/i.test(f) ? 'text' : 'text'; return `<label class="demo-form__field"><span class="demo-form__label">${esc(f)}</span><input class="demo-form__input" type="${type}" name="${name}" autocomplete="${/email/i.test(f) ? 'email' : /zip/i.test(f) ? 'postal-code' : /name/i.test(f) ? 'name' : 'off'}"${/zip/i.test(f) ? ' inputmode="numeric"' : ''}></label>`; }).join('\n')}
<button class="btn btn--silver demo-form__btn" type="submit">${esc(button)}</button>
<p class="demo-form__note" data-demo-note hidden role="status">${esc(DEMO_NOTE)}</p>
</form>`;
}
