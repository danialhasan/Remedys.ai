alter table public.remedys_diagnostic_submissions
  add column if not exists diagnostic_version text,
  add column if not exists scoring_version text,
  add column if not exists lead_key text,
  add column if not exists booking_email text,
  add column if not exists calendar_event_id text,
  add column if not exists booking_context jsonb not null default '{}'::jsonb,
  add column if not exists path_scores jsonb not null default '{}'::jsonb,
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists recommendation_output jsonb not null default '{}'::jsonb,
  add column if not exists business_description text,
  add column if not exists improvement_target text,
  add column if not exists workflow_slowdown text,
  add column if not exists business_impact text,
  add column if not exists systems_touched text;

alter table public.remedys_diagnostic_submissions
  drop constraint if exists remedys_diagnostic_submissions_source_check;

alter table public.remedys_diagnostic_submissions
  add constraint remedys_diagnostic_submissions_source_check
  check (source in ('remedys_ai_diagnostic', 'remedys_direct_request', 'remedys_direct_call'));

create index if not exists idx_remedys_diagnostic_lead_key
  on public.remedys_diagnostic_submissions (lead_key)
  where lead_key is not null;

create index if not exists idx_remedys_diagnostic_booking_email
  on public.remedys_diagnostic_submissions (booking_email)
  where booking_email is not null;

create index if not exists idx_remedys_diagnostic_version_created_at
  on public.remedys_diagnostic_submissions (diagnostic_version, created_at desc)
  where diagnostic_version is not null;
