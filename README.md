# Remedys.ai website

Static website for Remedys AI consulting and implementation. Shared page content and templates live in `scripts/build.py`; first-party CSS, JavaScript, vector artwork, and the approved split-R brand live in `assets/`.

## Build and preview

```sh
python3 scripts/build.py
python3 scripts/verify-site.py
node --test scripts/intake.test.mjs
python3 -m http.server 4173 --directory dist --bind 127.0.0.1
```

Node 22+ is used for the Netlify function. The static build uses Python 3.9+ and its standard library. There are no application package dependencies.

For isolated form UI tests, run `node scripts/preview.mjs` and visit port4174. That harness returns mocked success/error responses, never calls providers, and is not published. Put `[simulate error]` in its description field to exercise retry behavior.

## Deploy

The existing Netlify project is `remedys-ai` / `01da3b98-f396-47d4-bc89-3c065c8d1c61`, with custom domain https://remedys.ai. Link this exact project; do not create another.

```sh
netlify link --id 01da3b98-f396-47d4-bc89-3c065c8d1c61
netlify deploy --context deploy-preview
# Production requires task authorization and the release checks below.
netlify deploy --prod --context production
```

Always publish the generated `dist` directory configured in `netlify.toml`. Never publish the repository root. Do not override the publish directory to expose docs, source, migrations, or local artifacts.

The public intake endpoint is `/api/intake`. Secrets remain in Netlify Functions environment variables. See [operations](docs/operations.md), [intake](docs/diagnostic-and-intake.md), and the [revamp record](docs/revamp-2026-10-30.md).

Original multi-page source: upstream `danialhasan/Remedys.ai`, shipped baseline `ef3e7fde`. This redesign is prepared on a dedicated `codex/` branch and retained in source control before production publication. The original local checkout and untracked planning notes are preserved.
