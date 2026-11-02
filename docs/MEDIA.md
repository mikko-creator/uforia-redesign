# Media: generated imagery and motion

This redesign adds a set of illustrative images and one background loop. They set the mood of the "Silver Nocturne" design: near-black scenes, one cool silver-white light from the upper left, soft mist with a faint jade tint, and plenty of dark space for type and the glass panels that float over them.

## What is generated and what is Uforia's own

- **Generated:** every file in `assets/generated/` and the hero loop files `assets/media/hero-mist.mp4`, `hero-mist-sm.mp4`, `hero-mist.jpg` and `hero-mist-sm.jpg`. They are listed in the tables below.
- **Uforia's own:** the brand marks in `assets/brand/` and the photographs in `assets/photos/` belong to Uforia. This note does not cover them.

None of the generated images shows a real Uforia product, store, staff member or customer, and none of them stands in for one. No image shows a person. The doorstep is a generic scene, not a real address. The product scenes are generic still lifes, not Uforia's stock.

## Models and providers

| Media | Model family | Provider |
|---|---|---|
| The thirteen stills in `assets/generated/` | FLUX 1.1 Pro Ultra (Black Forest Labs) | fal.ai |
| Hero loop `hero-mist` | No AI video model. The loop is a procedural animation of the `g-mist-veil` still: a slow, periodic warp curls the mist veils and carries them upward while the light stays in place. | rendered in the project (ffmpeg, H.264) |

## Labelling

- Every generated JPEG carries an embedded IPTC XMP packet with `Iptc4xmpExt:DigitalSourceType` = `http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia` and a description saying that it is an AI-generated illustration, not a photograph of Uforia.
- The two loop videos carry the same note, with the same IPTC source-type URI, in their container `comment` and `description` tags. The two poster JPEGs carry the XMP label.
- Each still has a sidecar `<file>.json` next to it. The sidecar records the model, the full prompt, the seed, the request id, the size, a SHA-256 hash and the review verdict.
- `node tools/ai-label.mjs verify assets/generated assets/media/hero-mist.mp4 assets/media/hero-mist-sm.mp4 assets/media/hero-mist.jpg assets/media/hero-mist-sm.jpg --control` checks every label. The `--control` flag first strips the label from copies to prove the check can fail.

## Stills

| id | Aspect, size | What it shows | Alt text |
|---|---|---|---|
| `g-hero-bud` | 16:9, 2752x1536 | Home hero still and poster, OG image. One frosted bud right of centre. Dark mist on the left 55% holds the type. | A single frosted cannabis bud on a black surface, its trichomes glinting like frost in a cool silver-white light from the upper left, with a soft veil of mist drifting through the dark. |
| `g-mist-veil` | 16:9, 2752x1536 | Key frame of the hero loop and the ethereal bands. Mist veils under a light pool, no objects. | Translucent veils of mist drifting through a single shaft of silver-white light in darkness, with a faint jade-green tint in the haze. |
| `g-leaf-silver` | 4:5, 1856x2304 | One fan leaf on pure black, used with `mix-blend-mode: screen` so it can cross section seams. | A single cannabis fan leaf on pure black, its serrated edges rimmed with silver light and a few dew drops catching the light. |
| `g-flower-macro` | 3:2, 2496x1664 | Flower category and learn cards. A macro of trichome heads. | Macro close-up of a cannabis flower, its resin glands glinting in cool side light while the far side of the bud falls into black shadow. |
| `g-prerolls` | 3:2, 2496x1664 | Pre-rolls category. Two paper cones filled with ground flower. | Two unlit paper pre-roll cones filled with ground cannabis flower, lying on dark slate beside a small heap of ground flower, in raking light. |
| `g-vape` | 3:2, 2496x1664 | Vaporizers category. One blank cartridge. | One plain, unbranded glass vape cartridge holding amber oil on black glass, with a thin thread of vapour curling in the dark beside it. |
| `g-concentrate` | 3:2, 2496x1664 | Concentrates category. A small dab of rosin on parchment. | A small dab of pale gold hash rosin, a waxy cannabis concentrate, on a sheet of unbleached parchment paper on dark stone. |
| `g-tincture` | 3:2, 2496x1664 | Tinctures, topicals, wellness and medical. A blank dropper bottle and a leaf. | A plain amber glass dropper bottle on a slab of black stone beside a cannabis fan leaf, lit by a single cool light from the upper left. |
| `g-jars` | 3:2, 2496x1664 | Shop, deals and the mega menu. Two glass jars of flower. | Two clear glass apothecary jars of cured cannabis flower on black stone, caught in a single pool of silver-white light. |
| `g-smoke-beam` | 16:9, 2752x1536 | Learn and resources heroes. | Soft smoke drifting through a single beam of silver-white light in total darkness. |
| `g-doorstep` | 3:2, 2496x1664 | Delivery pages. A generic doorstep, not a real address. | A plain brown paper bag on a dark stone doorstep in front of a dark door at night, lit by a single light from the upper left. |
| `g-silver-dust` | 16:9, 2752x1536 | Band texture. | Fine silver dust drifting in a shaft of cool light against black. |
| `g-jc-night` | 16:9, 2752x1536 | Store and locations heroes. A generic brownstone street at night in documentary style: not a photograph of Uforia or of any specific street. | A quiet street of brick brownstone rowhouses at night, warm light in a few windows and wet pavement under a streetlight. |

## Motion

| id | Files | What it shows |
|---|---|---|
| `hero-mist` | `assets/media/hero-mist.mp4` (1920x1080), `hero-mist-sm.mp4` (720x1080 crop for phones), posters `hero-mist.jpg` and `hero-mist-sm.jpg` (first frame) | The `g-mist-veil` still with the mist slowly curling and rising through the light. 6-second seamless loop, 24 fps, H.264, no audio track. It is decorative: muted, `aria-hidden`, with a pause control, and only the poster shows under `prefers-reduced-motion`. |
