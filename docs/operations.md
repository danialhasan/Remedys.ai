# Operations

Build and verify with the commands in the root README. Deployment is through the existing authenticated Netlify CLI and exact linked project. Publish only `dist`; secrets are server-side Function variables. Review source, rendered responsive pages, inquiry states, booking destination, security headers, all routes, and excluded internal paths before release.

Use a draft deploy first. Check `/api/intake` reaches the function, unknown/legacy function paths cannot bypass its rule, missing/foreign Origin fails, and benign invalid requests eventually receive429 under the configured edge limit. Do not infer exact global protection from a rate-limit declaration. Do not send real third-party contact data during testing.

Production publication requires explicit task authorization. Preserve a source commit/PR and immutable deploy URL. A manual CLI production deploy does not change the upstream Git auto-deploy source; merge the reviewed branch through the normal repository process to keep later auto-deploys from restoring old code. Never force-push shared history.

Rollback uses a prior immutable Netlify deploy through the normal publish/restore command. Prior shipped source was ef3e7fde0f5d1167a9c1aed98879f67b2291a426, deploy6a1f4ee799de750008a7b27a. Restoring it also restores its old intake/diagnostic limitations, so prefer a scoped forward fix when feasible.

Monitor generic storage/notification errors in Netlify Functions logs. A successful inquiry response confirms storage; optional team email delivery is a separate concern. Do not log inquiry bodies or provider errors containing submitted content.
