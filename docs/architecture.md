# Architecture

`scripts/build.py` renders 14 routes and a404 page from shared templates, then copies an explicit public asset allowlist into `dist`. Generated output is ignored by Git and is the only Netlify publish directory. No repository-wide copy, symlinks, source files, docs, or database migrations enter the public output.

`assets/site.css` defines the shared responsive system. `assets/site.js` implements the mobile navigation and direct inquiry submission. There is no diagnostic, scoring engine, remote script, remote font, analytics identity capture, or browser persistence.

`netlify/functions/intake.mjs` is a native Node function with an explicit `/api/intake` route and Netlify edge rate limiting. It stores minimal inquiry fields through the existing server-only Supabase table and optionally notifies the configured team via Resend. External booking stays a direct Google Calendar link.

The build has no third-party application dependencies. Security headers are declared in `netlify.toml`.
