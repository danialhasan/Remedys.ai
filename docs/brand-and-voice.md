# Brand & Voice

Positioning, naming, and voice as expressed on the live site. The detailed production
rules (banned words, proof, layout) live in [`anti-slop-guidelines.md`](anti-slop-guidelines.md);
this doc is the *what we say and why*.

## Positioning

Remedys is an **AI-native product studio** (the homepage eyebrow). The core promise is
**"Put AI to work."** — start with the work, not the tool, and go advisory-through-
implementation rather than selling a single deliverable.

The credibility stance is honest and process-based: "No fake artifacts." Proof comes
from process discipline and Squad-backed delivery, not invented metrics, logos, or
testimonials.

## The four paths (current IA)

The site sells four service paths. Each has a fixed value proposition baked into the
diagnostic's `RECOMMENDATION_CONTENT` (`assets/site.js`):

| Path | One-line job | Time-to-value |
|---|---|---|
| **AI Consulting** | Advisory + opportunity mapping — find the right first move before building. | 2–4 weeks |
| **AI Automation** | Automate the workflow creating repeated manual work. | 4–8 weeks |
| **AI Enablement** | Get the team fluent enough to use AI well and consistently. | 1–3 weeks |
| **AI Engineering** | Build the product/tool/integration the business actually needs. | Depends on scope |

These map to `/consulting/`, `/automation/`, `/enablement/`, `/engineering/`.

## Naming history (why two IAs exist)

The current four-path naming replaced an older three-bucket model. The old names are
still live as standalone pages (no redirects exist — see [`architecture.md`](architecture.md)):

| Old name | Status now |
|---|---|
| AI Consulting | Kept (one of the four paths) |
| **AI Education** (`/education/`) | Superseded by **AI Enablement**; page still live |
| **AI Implementation** (`/implementation/`) | Superseded by **AI Automation / AI Engineering**; page still live |

When writing nav, CTAs, or schema, prefer the **four-path** names. Treat "AI Education"
and "AI Implementation" as legacy until those pages are migrated or redirected.

## Voice

Sharp, technical, premium, direct, human, calm, credible, specific to real operations.
Not template-driven, decorative, over-animated, stock-like, or trend-chasing.

**Approved phrasing that recurs on the site:**

- "Put AI to work."
- "Start with the work, not the tool."
- "Advisory through implementation."
- "Choose the first move."
- "Build something useful."
- "No fake artifacts."

**Banned marketing words** (full list in [`anti-slop-guidelines.md`](anti-slop-guidelines.md)):
unlock, supercharge, revolutionize, seamless, all-in-one, cutting-edge,
next-generation, empower, "transform your workflow", "AI-powered solutions for modern
teams".

## Proof rules (short version)

Use only accurate, allowed proof: process, anonymized workflow patterns, delivery
artifacts, review checklists, acceptance criteria, workshop/session experience, and
Squad-backed delivery discipline. Never fake metrics, ROI, client logos, testimonials,
screenshots, or autonomy/guarantee claims. If a claim can't be supported, rewrite it
as process. The **competitor-paste test** applies: if a competitor could paste a
section onto their own site unchanged, it isn't specific enough.
