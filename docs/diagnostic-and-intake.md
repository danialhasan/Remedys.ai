# Diagnostic & Intake

The lead-capture system, as shipped. Source of truth: `assets/site.js` (client flow +
scoring) and `netlify/functions/remedys-intake.js` (server intake). Versions live in
code: `diagnostic_v3_plain_7` (questions) and `scoring_v1_plain_7` (scoring).

## The 7 questions (verbatim)

Defined in `assets/site.js` as `DIAGNOSTIC_QUESTIONS`. The homepage terminal and
`/get-started/` both run this same array.

| # | id | Prompt | Kind | Field |
|---|---|---|---|---|
| 1 | businessDescription | "What does your business do?" | input | `business_description` |
| 2 | improvementTarget | "What needs to work better in the next 6-8 weeks?" | textarea | `improvement_target` |
| 3 | workflowSlowdown | "Which workflow is slowing the team down?" | textarea | `workflow_slowdown` |
| 4 | affectedGroup | "Who does this affect most?" | choice | `affected_group` |
| 5 | businessImpact | "What is it costing the business?" | textarea | `business_impact` |
| 6 | systemsTouched | "What systems or data does this work touch?" | textarea | `systems_touched` |
| 7 | aiUsage | "How are you using AI today?" | choice | `ai_usage` |

Then a **contact step** collects work email (and name + company, required for valid
submission). Choice options:

- **affectedGroup:** Mostly me · A few people · One team · Multiple teams · Customers or clients
- **aiUsage:** Not using AI yet · A few people use tools like ChatGPT · Some workflows use AI · We have AI systems in production

Questions 1–3 also write **legacy field aliases** (`company_description`,
`desired_outcome`, `time_drain`) alongside the v3 names, so older rows stay comparable.

## Scoring (`scoring_v1_plain_7`)

Client-side in `site.js`. Readiness is a 0–100 sum of eight weighted dimensions; most
are scored by answer specificity (`scoreAnswerSpecificity`), not just presence.

| Dimension | Max | Source |
|---|---|---|
| business_context_clarity | 10 | Q1 specificity |
| near_term_improvement_clarity | 15 | Q2 specificity |
| workflow_pain_specificity | 15 | Q3 specificity |
| business_impact | 20 | Q5 specificity |
| scope_and_adoption_surface | 10 | Q4 answered |
| systems_and_data_readiness | 15 | Q6 specificity |
| ai_maturity_fit | 10 | Q7 answered |
| contact_quality | 5 | name (2) + company (1) + non-free email (2) |

**Bands (live thresholds):**

- `>= 80` → "This looks like a strong fit for Remedys."
- `>= 68` → "There looks to be a real opportunity here."
- `< 68` → "There may be a useful starting point here."

> Older docs describe four bands (80 / 65 / 45 / below). The shipped code uses **three
> bands at 80 and 68** — that is the truth. The `>= 68` line is also the booking gate.

**Path recommendation:** separate per-path scoring ranks consulting / automation /
enablement / engineering (tie-break order: consulting → automation → enablement →
engineering). The top path becomes the primary recommendation; a secondary is shown
when it scores `>= 20` or is within a 15-point gap. Each path has fixed
`RECOMMENDATION_CONTENT` (label, time-to-value, summary, focus).

**Booking gate:** `next_move` and the result CTA show **"Book a Call"** when
`score >= 68`, otherwise **"Submit a Request"** (routes to `/get-started/#request`).

## Intake function — `netlify/functions/remedys-intake.js`

The only server-side code. The browser never touches Supabase; everything posts here.

**Accepted sources** (`ALLOWED_SOURCES`): `remedys_ai_diagnostic`,
`remedys_direct_request`, `remedys_direct_call`.

**Direct-request paths** (`ALLOWED_DIRECT_REQUEST_PATHS`): "AI Consulting",
"AI Automation", "AI Enablement", "AI Engineering", "Not sure yet / Help me choose the
right path." A direct request defaults `readiness_score` to 60 and band "Direct request
submitted".

**Security controls (all enforced server-side):**

- POST + JSON only; rejects other methods/content types.
- Body cap `MAX_BODY_BYTES = 32 * 1024` (32 KB).
- Origin allowlist from `ALLOWED_ORIGINS` (defaults to `https://remedys.ai`,
  `https://www.remedys.ai`); localhost kept working for dev.
- **Honeypot:** a filled `website` field returns a quiet `200` and stores nothing.
- IP stored only as an **HMAC-SHA256 hash** (`LEAD_IP_HASH_SECRET`); never raw.
- Supabase reached with a **server-only** secret/service-role key. No client credentials.
- `is_test` flag supported for production test submissions.

**Storage:** inserts into `public.remedys_diagnostic_submissions` via Supabase REST.
A row carries: the v3 fields + legacy aliases, `diagnostic_version`,
`scoring_version`, `readiness_score`, `recommendation_key/label/band`, `path_scores`,
`score_breakdown`, `recommendation_output`, `submission_id` (UUID), `lead_key`,
booking fields (`booking_email`, `calendar_event_id`, `booking_context`), UTM +
PostHog context, `ip_hash`, `is_test`, and `raw_payload`.

**Notifications:** Resend emails the team (`LEAD_NOTIFY_TO`) on every valid
submission; an optional confirmation goes to the submitter when
`SEND_LEAD_CONFIRMATION=true`.

**Response:** returns `canBook: readiness_score >= 68` and a booking URL
(`INTRO_CALL_BOOKING_URL`, default the Google calendar link) only when allowed.

## Supabase migrations (all applied on disk)

```
supabase/migrations/
  20260515120000_create_remedys_intake.sql       # table
  20260515133000_harden_remedys_intake.sql        # RLS + hardening
  20260519100000_align_remedys_intake_schema.sql  # schema alignment
  20260519143000_diagnostic_v3_plain_7.sql        # v3 fields (SHIPPED)
```

> The v3 migration is **already applied**. Older docs that call it "the next required
> migration" are stale — those first-class v3 fields exist now.

RLS is on; `anon`/`authenticated` cannot read or write intake rows directly.

## Verifying locally

```sh
node --check assets/site.js
node --check netlify/functions/remedys-intake.js
node scripts/verify-remedys-intake.js
```

Full env-var list and the production QA matrix are in [`operations.md`](operations.md).
