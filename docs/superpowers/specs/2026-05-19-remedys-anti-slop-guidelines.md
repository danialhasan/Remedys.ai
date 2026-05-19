# Remedys Anti-Slop Design Guidelines

Date: 2026-05-19
Status: active companion guideline
Applies to: Remedys website, client brief PDFs, HTML mockups, decks, and reusable buyer-facing assets

## Purpose

This document defines how Remedys should avoid generic AI-generated design patterns when producing external assets.

The goal is not to hide that AI may have helped production. The goal is to make every asset feel authored, specific, useful, restrained, and accountable to a real audience.

## Core Principle

An asset feels like AI slop when it is statistically plausible but locally unaccountable:

- generic hero copy
- generic gradients
- generic cards
- generic icons
- fake proof
- fake screenshots
- stock-like people
- vague claims
- no evidence that real people made hard choices for a real buyer

The antidote is:

- specificity
- provenance
- restraint
- usability
- proof
- human judgment
- a clear point of view

## What Remedys Should Optimize For

Remedys assets should feel:

- sharp
- technical
- premium
- direct
- human
- useful
- calm
- credible
- specific to real operations

They should not feel:

- template-driven
- decorative
- over-animated
- over-carded
- stock-like
- trend-chasing
- AI-generated at first glance

## Should We Add Website Elements Or Effects?

Use effects only when they help the reader understand, navigate, or trust the work.

For the client brief PDF:

- Do not add scrolling effects. The final artifact is static.
- Do not add parallax, animated gradients, bouncy transitions, or reveal gimmicks.
- Do add visual rhythm through page structure, spacing, texture, diagrams, and contrast.

For an HTML preview or future web version:

- Add a subtle reading progress indicator only if the page is long.
- Use section anchors or a sticky contents rail only if it helps navigation.
- Use restrained reveal motion: opacity and small vertical movement only.
- Use hover states to clarify interactivity, not to decorate.
- Use motion to guide attention to a state change or decision point.
- Avoid scroll-jacking, parallax, elastic easing, animated layout properties, and effects that make the page feel like a template.

Recommended motion rule:

`Motion should explain state, guide attention, or confirm an action. If it only adds vibe, remove it.`

## Should We Use Icons?

Use icons sparingly.

Icons are appropriate when they help a reader distinguish repeated categories quickly:

- service lanes
- process steps
- engagement paths
- deliverable groups
- FAQ categories

Icons are not appropriate when they are just decorating a card grid.

If icons are used:

- use one icon family
- use simple line icons
- use consistent stroke weight
- keep icons small
- avoid generic sparkle, robot, brain, magic-wand, and abstract AI symbols
- never let an icon replace a clear label

Potential icon direction if using Lucide or a shadcn-compatible icon setup:

- AI Consulting: `Compass`, `Map`, or `Search`
- AI Automation: `Workflow`, `Repeat`, or `GitBranch`
- AI Enablement: `BookOpen`, `GraduationCap`, or `Users`
- AI Engineering: `Code2`, `Braces`, or `Terminal`
- Advise: `Eye` or `MessageSquare`
- Govern: `ShieldCheck` or `ListChecks`
- Own: `Hammer`, `Wrench`, or `Rocket`
- Review / QA: `CheckCircle`, `ClipboardCheck`, or `FileSearch`
- Handoff: `PackageCheck` or `Archive`

Use no icon when the label is already clear.

## Should We Use shadcn?

Use shadcn principles only if building an interactive HTML/web version.

Good uses:

- `Badge` for labels and service tags
- `Separator` for quiet structure
- `Accordion` for FAQ in an interactive web version
- `Tabs` only if comparing generic and current-client variants in a tool
- `Tooltip` or `HoverCard` only for optional details
- `Table` for structured comparison
- `Card` only for genuinely repeated items

Avoid:

- default shadcn card grids
- default component styling without Remedys tokens
- nested cards
- every button styled as primary
- raw blue/purple defaults
- generic dashboard blocks

If shadcn components are used, they must be rethemed through Remedys semantic tokens, spacing, typography, and radius. The component should disappear into the Remedys system rather than look like a default library output.

## Design Elements To Add

Use these to make the work feel more authored and easier to follow:

- subtle paper texture
- thin technical grid
- quiet page numbers and section labels
- restrained violet action accents
- ice-blue diagnostic accents for review/discovery moments
- dark authority panels used sparingly
- process lines that show sequence
- route maps that show options
- comparison matrices that clarify tradeoffs
- artifact stacks that show tangible deliverables
- captions that explain why a visual exists
- short proof notes when evidence is available

Every page should have one main object:

- a table
- a process
- a comparison
- a route map
- a timeline
- an artifact stack
- a FAQ grid
- a discovery map

## Design Elements To Avoid

Avoid:

- generic hero gradients
- purple-blue glow backgrounds
- glassmorphism as decoration
- fake 3D blobs
- fake dashboards
- AI-generated people
- stock office scenes
- six-card icon grids
- centered everything
- every section inside a card
- thick decorative side borders
- giant metrics without proof
- fake logo clouds
- testimonials without approval
- vague CTAs
- long line lengths above 75 characters
- copy that could be pasted onto a competitor's site

## Copy Rules

Use:

- concrete nouns
- real operating language
- direct verbs
- short paragraphs
- descriptive headings
- practical examples
- constraints and tradeoffs where useful

Avoid:

- `unlock`
- `supercharge`
- `revolutionize`
- `seamless`
- `all-in-one`
- `cutting-edge`
- `next-generation`
- `empower`
- `transform your workflow`
- `AI-powered solutions for modern teams`

Preferred Remedys phrasing:

- `Put AI to work.`
- `Start with the work, not the tool.`
- `Advisory through implementation.`
- `Automate a workflow.`
- `Learn how to use AI well.`
- `Build something useful.`
- `Choose the first move.`
- `Build the system.`
- `Drive adoption.`

## Proof And Provenance Rules

Use proof only when it is accurate and allowed.

Safe proof types:

- process proof
- anonymized workflow patterns
- delivery artifacts
- review checklists
- acceptance criteria examples
- workshop/session experience
- Squad-backed delivery discipline

Avoid:

- fake metrics
- unsupported ROI
- unapproved client logos
- unapproved testimonials
- fake customer screenshots
- compliance claims without review
- claims that imply fully autonomous or guaranteed output

If a claim cannot be supported, rewrite it as process:

Bad:

`We guarantee production-ready AI systems in weeks.`

Better:

`We define scope, acceptance criteria, review points, QA, and handoff before a build is treated as ready.`

## Layout Rules

Use a readable, intentional layout system:

- one idea per page or section
- one main object per page
- left-align most reading copy
- keep line length around 55-75 characters
- vary section rhythm without becoming chaotic
- use whitespace as structure
- keep page titles descriptive enough to tell the story alone
- keep body density balanced, closer to sparse than dense

Avoid:

- equal-weight sections everywhere
- identical card grids
- overly symmetrical layouts on every page
- nested cards
- dense paragraphs
- decorative components that do not answer a buyer question

## Interaction Rules For HTML Versions

If this becomes an HTML page or interactive preview:

- Buttons must say what happens next.
- Forms must have clear labels and useful error states.
- FAQ can be accordion-based, but all important content should remain crawlable and accessible.
- Hover states should reinforce hierarchy.
- Loading states should explain what is happening.
- Empty states should teach the next step.
- Focus states must be visible.
- Mobile layout must preserve hierarchy, not just stack everything.
- Performance should remain fast.

Use semantic HTML. Do not create visual-only structures that agents, screen readers, or search engines cannot parse.

## Anti-Slop QA Checklist

Run this before shipping any Remedys external asset.

Score each item 0, 1, or 2.

### Specificity

- The audience is clear.
- The problem is concrete.
- The category is obvious within five seconds.
- The copy uses specific nouns instead of broad adjectives.
- The page includes constraints, tradeoffs, or working details.

### Proof

- Claims are supported by process, artifacts, examples, or approved evidence.
- No fake proof is present.
- Testimonials, logos, and metrics are absent unless approved.
- The asset shows what Remedys actually does, not just what it believes.
- The next step is grounded in real material requests.

### Visual Authorship

- The design fits Remedys and the buyer.
- The page avoids generic AI/stock imagery.
- Texture, spacing, type, and color feel intentionally constrained.
- Not every section is a card grid.
- Each page has a clear focal object.

### Usability

- The reading path is obvious.
- Page titles tell the story.
- CTAs say what happens next.
- Tables and diagrams are readable.
- The asset works as a forwarded PDF without explanation.

### Editorial Quality

- The copy is scannable.
- No filler sections exist.
- No banned phrases are used.
- The tone is consistent.
- AI-assisted content has been edited by a human owner.

Target score:

- 40+ out of 50: strong
- 30-39: acceptable but needs polish
- under 30: likely generic or slop-like

## Competitor Paste Test

Before final approval, ask:

`Could a competitor paste this exact section onto their site or PDF without changing much?`

If yes, revise until the section contains something only Remedys could responsibly say, show, prove, or explain.

## Recommendation For The Remedys Client Brief

For the current client brief:

- Do not add scroll effects to the PDF.
- Do not rely on icons to make the pages feel designed.
- Use diagrams, comparison tables, and artifact stacks as the core visual language.
- Use icons only as small category aids if the page becomes easier to scan.
- Use shadcn only if creating an HTML preview or future web version, and only after applying Remedys tokens.
- Prioritize readable information architecture over decorative polish.

The design should feel elite because the thinking is clear, the hierarchy is disciplined, and the visual choices are accountable.
