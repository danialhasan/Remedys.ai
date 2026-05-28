# Architecture

How the Remedys.ai site is put together, as shipped.

## Stack

- **Static multi-page HTML.** One hand-authored `index.html` per route directory,
  served at a clean URL (`/services/`, `/get-started/`, …). No framework, no build.
- **Two shared assets** do most of the work:
  - `assets/site.css` — the entire visual system for all three design systems (~5,300 lines).
  - `assets/site.js` — navigation, the diagnostic flow, form validation, analytics, intake POSTs.
- **GSAP + ScrollTrigger** loaded from the jsDelivr CDN for reveal motion.
- **PostHog** for analytics, configured through `<meta>` tags that `site.js` reads.
- **Netlify** hosts the static files and runs one serverless function for lead intake.
- **Supabase** stores leads (Postgres + REST), written to only by the Netlify function.

## Routes (13 live pages)

Every route is a directory containing `index.html`. The `body` signature tells you
which design system the page uses.

| Route | `body` | System |
|---|---|---|
| `/` | `page-light` | V10 homepage rail |
| `/services/` | `page-ivory` | Inner-page (current) |
| `/automation/` | `page-ivory` | Inner-page (current) |
| `/enablement/` | `page-ivory` | Inner-page (current) |
| `/engineering/` | `page-ivory` | Inner-page (current) |
| `/about/` | `page-ivory` | Inner-page (current) |
| `/events/` | `page-ivory` | Inner-page (current) |
| `/get-started/` | `page-ivory` | Inner-page (current) |
| `/contact/` | `page-ivory` | Inner-page (current) |
| `/privacy/` | `page-ivory` | Inner-page (current) |
| `/consulting/` | plain `<body>` | Legacy |
| `/education/` | plain `<body>` | Legacy |
| `/implementation/` | plain `<body>` | Legacy |

## The three design systems

The site is mid-migration. Three systems coexist; shared CSS/JS serves all of them.
See [`design-system.md`](design-system.md) for the styling detail — the summary here
is about *which pages belong to which system and why it matters*.

1. **V10 homepage rail (`body.page-light`)** — the newest system, homepage only. A
   "rail" layout with the dark diagnostic terminal as its one dramatic moment.
2. **Inner-page (`body.page-ivory`)** — the current system for nine inner pages. Shares
   the homepage's font stack (Chivo Mono + Source Serif 4 + Switzer) and the newer
   information architecture (the four service paths).
3. **Legacy (plain `<body>`)** — three pages (consulting, education, implementation)
   still on the oldest system. They load a *different* font stack (Instrument Serif +
   Manrope), use the older menu IA (AI Consulting / AI Education / AI Implementation),
   and carry their own decorative "orbit" hero panel.

**Why it matters:** editing shared `assets/site.css` or `assets/site.js` affects all
three systems at once. Confirm a page's `body` signature before assuming a change is
safe. The migration is incomplete — the older IA and the newer four-path IA both exist
in the live navigation depending on which page you land on.

## Lead-capture flow

```
Visitor
  → homepage diagnostic terminal  OR  /get-started/ form
  → assets/site.js  (validate, score the diagnostic, attach analytics context)
  → POST /.netlify/functions/remedys-intake
  → Supabase  public.remedys_diagnostic_submissions
  → Resend    (team notification + optional confirmation email)
PostHog receives funnel events in parallel (no free-text lead content).
```

The browser holds no Supabase credentials. All writes go through the Netlify function,
which uses a server-only service key. Full data model and security notes in
[`diagnostic-and-intake.md`](diagnostic-and-intake.md).

## File map

```
Remedys.ai/
├── index.html               # homepage (page-light)
├── <route>/index.html       # 12 inner routes (see table above)
├── assets/
│   ├── site.css             # all three design systems
│   ├── site.js              # nav, diagnostic, forms, analytics, intake
│   └── favicon.svg
├── netlify/
│   └── functions/
│       └── remedys-intake.js  # the only server-side code
├── netlify.toml             # publish = "."  (no redirects, no build command)
├── supabase/
│   └── migrations/          # intake table schema (see diagnostic-and-intake.md)
├── scripts/
│   └── verify-remedys-intake.js   # local check for the intake contract
├── mockups/                 # design prototypes — NOT part of the live site
├── docs/                    # this folder
└── output/                  # gitignored local handoff archive (invisible to agents)
```

## What is NOT built (despite being referenced elsewhere)

Older handoff material assumes things that are not in the repo today. Do not treat
them as live:

- **No `/blog/`.** The archived sitemap lists it; no such route exists.
- **No `sitemap.xml`, `robots.txt`, or `llms.txt`** at the project root. The launch
  checklist references them, but the files are absent.
- **No redirects.** `netlify.toml` contains only `publish = "."`. There are no
  `_redirects` and no `[[redirects]]` blocks, so the legacy-route redirects described
  in older docs (e.g. `/implementation/` → `/automation/`) are **not** implemented.
  `consulting/`, `education/`, and `implementation/` are full standalone legacy pages,
  not redirect stubs.
- **`output/` is gitignored.** The rich CTO-handoff bundle there is a frozen local
  archive; it is not visible to the repository or to agents working from a clone.

## Deploy

Push to `main` → Netlify auto-deploys the static root. No build step. Operational
detail (env vars, manual deploy, QA) is in [`operations.md`](operations.md).
