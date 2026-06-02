# Content Inventory

What each live route actually says, route by route. Headlines and titles are verbatim
from the shipped HTML. Use this to find where a copy block lives before editing it.

## Information architecture, as shipped

Two IAs coexist (the migration is incomplete):

- **Current four-path IA** — Consulting, Automation, Enablement, Engineering. This is
  what the homepage and `/services/` link to.
- **Superseded IA** — "AI Education" and "AI Implementation" still exist as full pages
  with no redirect. They predate the four-path model (Education → Enablement,
  Implementation → Automation/Engineering) but are still live.

Note the quirk: `/consulting/` is a *current* path but still renders on the **legacy**
design system (see [`design-system.md`](design-system.md)).

## Homepage — `/`

- **Title:** `Put AI to work. | Remedys.ai`
- **H1:** `Put AI to work.`  ·  **System:** `page-light`
- **Section flow:**
  1. Header — rail nav (Services / Diagnostic / Who We Are / Get Started CTA + burger).
  2. Hero — eyebrow "AI-native product studio", H1 "Put AI to work.", subhead, CTAs
     "Get Started" + "Explore Services".
  3. Truth strip — "How we work / No fake artifacts" + **3 steps**: 01 Understand the
     work · 02 Choose the first move · 03 Make it real. (Three steps, not five.)
  4. Services — "Four ways to make AI useful." → 01 AI Consulting, 02 AI Automation,
     03 AI Enablement, 04 AI Engineering (links to the four path pages).
  5. Diagnostic — `#diagnostic`, the dark terminal pane, auto-starting at "Question 01/07".
  6. Proof — the Squad paragraph.
  7. Sessions — "In the room…" → "View Past Sessions" (`/events/`).
  8. Final CTA, then footer (note: footer logo mark is still orange).

## Services and the four paths

| Route | Title | H1 | System |
|---|---|---|---|
| `/services/` | `Services \| Four ways to put AI to work.` | "Let's put AI to work." | `page-ivory` |
| `/consulting/` | `AI Consulting` | "Find the right starting point." | **legacy** |
| `/automation/` | `AI Automation` | "Ship the first workflow that should not stay manual." | `page-ivory` |
| `/enablement/` | `AI Enablement` | "Get the team fluent enough to use AI well." | `page-ivory` |
| `/engineering/` | `AI Engineering` | "Bring in engineering help to make something real." | `page-ivory` |

## Superseded path pages (still live, no redirect)

| Route | Title | H1 | System |
|---|---|---|---|
| `/education/` | `AI Education` | "Help your team use AI well." | **legacy** |
| `/implementation/` | `AI Implementation` | "Build practical systems that make the business stronger." | **legacy** |

These three legacy pages (`consulting`, `education`, `implementation`) share the
older font stack and IA. They are reachable by direct URL; older docs that describe
`/implementation/` and `/education/` as redirects are wrong — no redirects exist.

## Company, intake, and utility pages

| Route | Title | H1 | System |
|---|---|---|---|
| `/about/` | `Who We Are` | "Practical AI help, led by people close to the work." | `page-ivory` |
| `/events/` | `Events` | "Workshops, sessions, and practical AI in the room." | `page-ivory` |
| `/get-started/` | `Get Started \| AI Diagnostic and Direct Request` | "Tell us what you need help with." | `page-ivory` |
| `/contact/` | `Contact` | "Talk to the team directly." | `page-ivory` |
| `/privacy/` | `Privacy Overview & Data Use` | "Privacy, stated plainly." | `page-ivory` |

### `/get-started/` — the intake hub

Split layout offering two entry points: **Run the Diagnostic** (jumps to the on-page
diagnostic panel) and a **direct request** (pick a path, describe the need). Carries
`ContactPage` schema. The diagnostic and request both feed the intake function — see
[`diagnostic-and-intake.md`](diagnostic-and-intake.md).

## Voice anchors

Approved phrasing recurs across pages: "Put AI to work.", "Advisory through
implementation.", "Choose the first move.", "No fake artifacts." Banned marketing
words and the proof rules live in [`brand-and-voice.md`](brand-and-voice.md) and
[`anti-slop-guidelines.md`](anti-slop-guidelines.md).
