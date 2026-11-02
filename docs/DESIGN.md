# Design system: Silver Nocturne

A redesign of the Uforia Dispensary website (Jersey City, New Jersey) on the information architecture of a large
multi-state dispensary operator's site. Style: tenebrism, an ethereal atmosphere and smoked glass, in layers.

## Palette (src/styles/tokens.css)

| Role | Token | Value |
|---|---|---|
| Deepest ground, hero, vignette edges | `--void` | #030304 |
| Page ground (brand black) | `--ink-1` | #080808 |
| Raised band, surfaces, hairlines | `--ink-2` to `--ink-4` | #0d0e0f, #141516, #1d1e20 |
| Brand charcoal: rules, disabled | `--ink-5` | #373739 |
| Primary text | `--pearl` | #eef0ee |
| Secondary text | `--silver-hi` | #d3d6d8 |
| Brand silver (the "U" monogram), tertiary text | `--silver` | #ababab |
| Captions (13px and up only) | `--silver-lo` | #7d8083 |
| Brand deep green: tints, the promo bar, green grounds | `--moss` | #203d00 |
| Luminous leaf: accents, focus ring, active states | `--leaf` | #b5dc8c |
| Text on leaf | `--leaf-ink` | #0b1400 |

Light is a token too: `--light-pool` (one cool key light from the upper left, positioned by `--lx`/`--ly`),
`--light-beam`, `--vignette`, the haze layers `--haze`, `--haze-silver`, `--mist-veil`, and the glass values
`--glass-bg`, `--glass-edge-lit`.

## Type

Montserrat for headings (weight 600, tight leading, slight negative tracking) and kickers (500, capitals, wide
tracking that echoes the wordmark, no leading line). One thin italic accent word per heading at most (`.accent`,
Montserrat italic at weight 250 with a silver to white gradient). Poppins for body copy at 16px / 1.7 and for UI.
No visible text under 13px.

## Three planes and the ethereal layer

1. **Ground (tenebrism).** `.band` sections on near-black with one key light pool and a deep vignette
   (`.band--void`, `.band--lit`, `.band--beam`, `.band--moss`). Backdrop images, haze and grain live in an inner
   `.band__clip`, so the section itself never clips what crosses its edges.
2. **Atmosphere (ethereal).** `.haze` layers drift slowly through the light (transform only, one cycle about 26 s),
   with a faint green breath from the brand green. `.grain` adds fine film grain.
3. **Glass (mid plane).** `.glass` smoked silver panes with a lit top-left edge (`.glass--lit`), `.glass--strong`
   for panes that carry text, `.glass--leaf` for deals and loyalty, `.glass--lift` for hover lift and a sheen.
4. **Front plane (depth).** `.frame-u`, the brand frame taken from the logo's square (two sharp corners, two
   rounded), image frames that overhang a band edge (`.split-hero__media`, `.protrude--down`, `.protrude--up`),
   screen-blended overlays (`.screen`) and cut-outs with a key-light rim (`.cut`).

## Components

Buttons `.btn--silver` (primary, pearl fill), `.btn--glass`, `.btn--ghost`, `.btn--leaf`, `.btn--sm`; `.link-arrow`;
`.chip`; product card `.pcard`; article card `.acard`; the inner-page hero `.split-hero` (title panel on a lit dark
ground, image in the brand frame overhanging into the next band, breadcrumb inside); `.crumbs` with "/" separators;
`.faq` accordion; `.prose` for long reading (68ch, leaf-green links, tables, quotes); `.demo-form`; `.stat`;
`.hours`.

Chrome: a slim promo bar, a frosted main bar (logo, store chip with today's hours, Shop / Deals / Find a Dispensary
/ Resources as mega menus with image cards, search, loyalty, cart, Order now), a category bar with a More list, a
drawer below 1024px, and a footer with the store block, three link columns, the legal row and a giant cropped
UFORIA wordmark lit by a slow silver sweep.

## Motion

Scroll reveals fade up and "turn the light on" (`[data-reveal]`, staggered with `--i`, visible after 2.5 s
whatever happens), scroll parallax (`[data-depth]`), pointer tilt (`[data-tilt]`), a key light that follows the
pointer (`[data-spot]`), a logo marquee (`[data-marquee]`), a rotator with real button dots (`[data-rotator]`),
slow haze drift and hover sheens. Motion uses transforms and opacity only.

## Accessibility

One h1 per page, landmarks, real links and buttons, a visible leaf-green focus ring, keyboard and Escape support
for every menu, a focus loop in the drawer and the age dialog, nothing essential behind hover, 44px taps on phones,
text contrast of 4.5:1 or more, a pause button for any looping video, and `prefers-reduced-motion` turns all motion
off. Phones use opaque smoked fills instead of live blur. The 21+ dialog never blocks the page when scripts are off.
