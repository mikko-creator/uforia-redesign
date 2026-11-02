# Uforia Dispensary: website redesign pitch

A complete redesign of [uforiadispensary.com](https://uforiadispensary.com), built as a static site for review.

**Preview (noindex):** https://mikko-creator.github.io/uforia-redesign/

## What it is

- **Uforia's own content.** Every Uforia page (except one unfinished template page), all 174 blog posts, the store facts, the brand assets and the photos come from
  uforiadispensary.com as it stood on November 2, 2026. Uforia's page URLs are kept, so existing links and search
  rankings carry over.
- **A larger site structure.** The pages are organised the way a large multi-state dispensary operator organises its
  site: a store bar, mega menus (Shop, Deals, Find a Dispensary, Resources), a category bar, product listing pages for
  every menu category, a locations hub with a store page and a page per town served, a Learn hub with article pages,
  loyalty, FAQ, and New Jersey law and medical card pages.
- **New pages written for the pitch.** Fourteen evergreen Learn guides, the FAQ (built from Uforia's own answers) and
  three New Jersey pages whose every statement comes from official State of New Jersey sources, each linked.
- **Ordering stays on Uforia's live menu.** Every Shop and Order button opens Uforia's live online menu. Product cards
  show a snapshot of that menu taken on November 2, 2026.

## Design: Silver Nocturne

Uforia's black, silver and deep green, set in three planes: **tenebrism** (near-black grounds carved by one cool
silver key light), **ethereal** atmosphere (mist veils and haze drifting through that light) and **glassmorphism**
(smoked silver panes over the light), with images that break their frames and cross section edges, scroll-driven
reveals and parallax, and hover effects throughout. The design system is described in `docs/DESIGN.md`.

## Imagery

Uforia's own photos, category art, brand logos and video are used as published. The industry mood imagery (13 stills
and the hero loop) was generated for this pitch, carries an AI label in its metadata and is described in
`docs/MEDIA.md`. None of it depicts Uforia's store, staff, customers or products.

## Build

Node 18+ and `cwebp` on the PATH; no dependencies.

```
node src/build.mjs            # builds the site into dist/
node tools/serve.mjs --root dist --port 8080 --not-found 404.html
```

`src/content/` holds the content (pages, posts, guides, menu snapshot, facts), `src/theme/` the page templates,
`src/styles/` the stylesheets, `src/scripts/site.js` the behaviour, `assets/` fonts, photos, generated imagery and media.
