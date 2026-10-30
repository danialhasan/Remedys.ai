# Direct inquiry intake

The old diagnostic, terminal, scoring, identity capture, and booking-event submission flows were retired in the October30 revamp. `/get-started/` offers a direct inquiry and direct booking/email alternatives. `/api/intake` is the only function route. The old diagnostic table name is retained for compatibility with existing stored records, not as a public product flow.

Accepted JSON fields: full_name, email, company, optional service, description, and honeypot website. Unknown keys, non-string values, excessive byte size, unsupported service names, and malformed required values are rejected before provider side effects. The function requires an exact allowed Origin. This is browser hygiene, not authentication or a bot boundary.

Netlify edge rule: five requests per sixty seconds, aggregated by IP/domain, configured in the exported function config. Netlify can take up to ten seconds to enforce a threshold; distributed abuse/global spend is not bounded by this rule. No submitted email address can receive an automatic confirmation. Fixed recipients come only from server configuration.

Required Functions environment: SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY). Optional team notification: RESEND_API_KEY, RESEND_FROM, LEAD_NOTIFY_TO. Never print values, embed them into the static build, or commit them. SEND_LEAD_CONFIRMATION is ignored. No schema migration is required by this revamp.

Runtime deploy identity comes from Netlify’s context argument, not build-only CONTEXT/DEPLOY_URL variables. Exact unique preview origins are accepted only for the matching deploy-preview identity. Preview inquiries are marked is_test and never notify the team. Production inquiries notify only when the production deploy is published. Failed storage returns a generic failure; failed notification preserves stored success and emits a generic operational log.

Native fallback is an explicit POST to a JSON endpoint: if JavaScript is unavailable, the endpoint directs users to email without putting form contents in a URL. UI errors retain values; successful submission clears them and focuses the confirmation.

Run `node --test scripts/intake.test.mjs` for handler boundary/side-effect tests. Actual edge rate limiting must be verified on a deployed preview, with benign invalid requests that cannot create records or emails.
