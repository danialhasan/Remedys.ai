alter table public.remedys_diagnostic_submissions
  add column if not exists submission_id uuid,
  add column if not exists direct_request_path text,
  add column if not exists direct_request_description text,
  add column if not exists direct_request_extra_notes text,
  add column if not exists origin text,
  add column if not exists ip_hash text,
  add column if not exists posthog_distinct_id text,
  add column if not exists posthog_session_id text,
  add column if not exists form_variant text,
  add column if not exists booking_url text,
  add column if not exists status text not null default 'new',
  add column if not exists is_test boolean not null default false;

alter table public.remedys_diagnostic_submissions
  alter column source set default 'remedys_ai_diagnostic',
  alter column readiness_score drop not null,
  alter column recommendation_key drop not null,
  alter column company_description drop not null,
  alter column time_drain drop not null,
  alter column affected_group drop not null,
  alter column ai_usage drop not null,
  alter column desired_outcome drop not null;

alter table public.remedys_diagnostic_submissions
  drop constraint if exists remedys_diagnostic_submissions_source_check,
  drop constraint if exists remedys_diagnostic_submissions_recommendation_key_check,
  drop constraint if exists remedys_diagnostic_submissions_status_check;

alter table public.remedys_diagnostic_submissions
  add constraint remedys_diagnostic_submissions_source_check
  check (source in ('remedys_ai_diagnostic', 'remedys_direct_request')),
  add constraint remedys_diagnostic_submissions_status_check
  check (status in ('new', 'reviewing', 'qualified', 'nurture', 'closed'));

create unique index if not exists idx_remedys_diagnostic_submission_id_unique
  on public.remedys_diagnostic_submissions (submission_id)
  where submission_id is not null;

create index if not exists idx_remedys_diagnostic_status_created_at
  on public.remedys_diagnostic_submissions (status, created_at desc);

create index if not exists idx_remedys_diagnostic_posthog_distinct_id
  on public.remedys_diagnostic_submissions (posthog_distinct_id)
  where posthog_distinct_id is not null;

revoke all on table public.remedys_diagnostic_submissions from anon, authenticated;
