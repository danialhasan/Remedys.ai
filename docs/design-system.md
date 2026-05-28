# Design System

The visual system as it actually exists in `assets/site.css` today. This is the
honest, shipped state — including the incoherences. For where the brand is *heading*
(single violet accent, retired orange), that is a separate direction, not yet built.

## The dual palette (root cause of the incoherence)

A single `:root` block at the top of `assets/site.css` declares **two palettes at
once** — a light/violet/blue set and a dark/orange set. Both are live; pages pull
from whichever tokens their system uses.

```css
:root {
  color-scheme: light;
  /* light set */
  --paper:  #f7f8fb;
  --ink:    #0b1020;
  --muted:  #5f667a;
  --line:   rgba(11, 16, 32, 0.14);
  --violet: #7b4dff;   /* brand accent (intended) */
  --blue:   #72b7ff;   /* ice-blue, reserved for the diagnostic */
  --navy:   #070812;
  --panel:  #112b4d;
  /* dark set */
  --bg:        #000;
  --bg-soft:   #0d0d0d;
  --bg-panel:  #050505;
  --text:      #f0eee5;
  --line-soft: rgba(255, 255, 255, 0.08);
  /* accent set — ORANGE, bound to the generic --accent token */
  --accent:        #ff6b35;
  --accent-hover:  #ff7f4d;
  --accent-active: #ff5a1f;
  --accent-soft:   rgba(255, 107, 53, 0.12);
  --accent-fade:   rgba(255, 107, 53, 0.04);
  --black: #000;
  --white: #fff;
  /* type */
  --font-body:    "Switzer", Arial, sans-serif;
  --font-display: "Gloock", Georgia, serif;
  --font-mono:    "Chivo Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

**Three colours, not one accent.** The site uses violet (`--violet`), ice-blue
(`--blue`), and orange (`--accent`). Orange is not a stray leftover — it is bound to
the *generic* `--accent` token, so anything that styles with `--accent` renders
orange unless a page overrides it. This is why orange still appears across the site.

## Fonts

| Token | Value | Loaded? |
|---|---|---|
| `--font-body` | Switzer | Yes — Fontshare (`page-light` + `page-ivory` pages) |
| `--font-mono` | Chivo Mono | Yes — Google Fonts |
| (serif accent) | Source Serif 4 | Yes — Google Fonts |
| `--font-display` | **Gloock** | **No — never loaded.** Falls back to Georgia serif. |

`--font-display: "Gloock"` is declared but no page links the Gloock webfont, so every
headline using `--font-display` silently renders in Georgia. Either load Gloock or
change the token to the intended display face.

**Legacy pages load entirely different fonts.** `consulting/`, `education/`, and
`implementation/` link **Instrument Serif + Manrope** (Google Fonts) instead of the
Chivo Mono / Source Serif 4 / Switzer stack. This is the most visible symptom of the
incomplete migration.

## Per-system styling

`assets/site.css` is layered. Section banners in the file mark the migration strata:

- **`body.page-light`** — the V10 homepage rail system (latest). Light editorial base;
  the dark diagnostic terminal is the one dramatic, high-contrast moment.
- **`body.page-ivory`** — the current inner-page system ("Canonical 2026 site layer"
  plus a "Varick-inspired … Squad orange accent" layer). Uses the four-path IA. Note
  the layer name itself bakes in the orange accent.
- **plain `<body>`** — the legacy "site-shell" system. Different fonts, older IA
  (AI Consulting / AI Education / AI Implementation), a decorative orbit/visual-core
  hero panel, pill/ghost buttons, and an orange "R" brand mark.

The homepage footer still renders an **orange multi-span logo mark**, another point of
palette incoherence on an otherwise violet/light page.

## Intended direction (not yet implemented)

The agreed direction is to consolidate to **violet (`#7b4dff`) as the single brand
accent**, reserve ice-blue (`#72b7ff`) semantically for the diagnostic only, and
**retire orange**. That work has not landed: the dual palette above is still what
ships. Treat the consolidation as a roadmap item, not a documented fact, until the
`:root` actually changes and the legacy pages are migrated.

## Practical notes for editing

- A change to `--accent`, shared components, or fonts in `site.css` hits **all three
  systems**. Check the page's `body` signature first (see [`architecture.md`](architecture.md)).
- Ice-blue (`--blue`) carries meaning — the diagnostic. Don't reuse it decoratively.
- Motion is GSAP + ScrollTrigger. Keep it to opacity and small vertical movement per
  [`anti-slop-guidelines.md`](anti-slop-guidelines.md); no parallax or scroll-jacking.
