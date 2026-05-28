# Remedys.ai

Marketing site for Remedys — an AI-native product studio. Static, multi-page HTML with
a shared CSS/JS system, an on-page AI diagnostic, and a Netlify-function lead intake.

**Full documentation lives in [`docs/`](docs/) — start there** ([docs/README.md](docs/README.md)).
This file is just the quickstart.

## Quickstart

```bash
npx serve -l 4500 .
```

Open `http://localhost:4500`. No build step — edit a route's `index.html` or the shared
files in `assets/`, then refresh.

## Layout

```
index.html          # homepage
<route>/index.html  # 12 inner routes (services, automation, enablement, engineering,
                    #   consulting, education, implementation, about, events,
                    #   get-started, contact, privacy)
assets/             # site.css + site.js (shared across all pages)
netlify/functions/  # remedys-intake.js (lead capture; the only server-side code)
supabase/           # intake table migrations
docs/               # reference documentation (source of truth for "how it works")
```

Three design systems currently coexist (mid-migration). Know which one a page uses
before editing shared CSS/JS — see [docs/architecture.md](docs/architecture.md).

## Stack

- Static HTML, vanilla CSS + JS, GSAP for motion
- PostHog analytics (configured via `<meta>` tags read by `assets/site.js`)
- Netlify hosting — push to `main` auto-deploys (`publish = "."`, no build)
- Supabase for lead storage, written to only by the Netlify intake function

## Deploy & operations

Push to `main` for an automatic Netlify deploy. Environment variables, the launch/QA
checklist, and manual-deploy steps are in [docs/operations.md](docs/operations.md).

## Repo

- origin: https://github.com/shafan9/Remedys.ai
