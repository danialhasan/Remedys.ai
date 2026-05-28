# Remedys.ai — Documentation

Start here. This folder is the reference layer for the Remedys.ai website.

**The live site is the source of truth.** These docs describe what is actually
shipped today. When code and docs disagree, the code wins and the doc is wrong —
fix the doc. Forward-looking plans live in [`history/`](history/) or are labelled
as not-yet-built; do not mistake them for the current state.

## What Remedys.ai is

A static, multi-page marketing site for Remedys — an AI-native product studio that
sells four service paths (Consulting, Automation, Enablement, Engineering) and
captures leads through an on-page AI diagnostic and a direct-request form.

- **Stack:** hand-written HTML per route, one shared `assets/site.css`, one shared
  `assets/site.js`. GSAP + ScrollTrigger (CDN) for motion. No build step, no framework.
- **Lead capture:** browser → `assets/site.js` → Netlify function
  `netlify/functions/remedys-intake.js` → Supabase. The browser never writes to
  Supabase directly.
- **Analytics:** PostHog, configured via `<meta>` tags read by `site.js`.
- **Hosting:** Netlify, auto-deploy on push to `main`, publish directory `.`.

## Read this first: the site is mid-migration

The site currently runs **three coexisting design systems**. Any change to shared
CSS/JS touches all three, so know which one a page uses before editing:

| System | `body` signature | Pages | Fonts |
|---|---|---|---|
| V10 homepage rail | `body.page-light` | `/` only | Chivo Mono + Source Serif 4 + Switzer |
| Inner-page (current) | `body.page-ivory` | about, automation, contact, enablement, engineering, events, get-started, privacy, services | Chivo Mono + Source Serif 4 + Switzer |
| Legacy | plain `<body>` | consulting, education, implementation | Instrument Serif + Manrope |

A single `:root` in `site.css` declares **both** a light/violet palette and a
dark/orange palette, so orange (`#ff6b35`, bound to the generic `--accent` token)
is still live across the site. Full detail in [`design-system.md`](design-system.md).

## Map of these docs

| Doc | What it covers |
|---|---|
| [`architecture.md`](architecture.md) | Routes, file map, the three-system reality, what is and isn't built |
| [`design-system.md`](design-system.md) | Palette tokens, fonts, the dual-palette root, per-system styling |
| [`content.md`](content.md) | Page-by-page inventory of what each route actually says |
| [`diagnostic-and-intake.md`](diagnostic-and-intake.md) | The 7-question diagnostic, scoring, intake function, Supabase data model |
| [`brand-and-voice.md`](brand-and-voice.md) | Positioning, the four paths, naming, voice |
| [`anti-slop-guidelines.md`](anti-slop-guidelines.md) | Standing rules for buyer-facing assets (specificity, proof, banned words) |
| [`operations.md`](operations.md) | Deploy, environment variables, launch wiring, QA checklist |
| [`history/`](history/) | Superseded specs and prior handoffs — context, not current truth |

## When you change the site

1. Make the change in the relevant route's HTML and/or the shared `assets/`.
2. If the change alters a documented fact (a route, a token, a copy block, the data
   model), update the matching doc in the same change.
3. The doc is wrong the moment it disagrees with the deployed site. Keep them in step.
