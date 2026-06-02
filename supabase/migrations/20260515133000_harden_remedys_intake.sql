alter table public.remedys_diagnostic_submissions
  add column if not exists posthog_distinct_id text,
  add column if not exists posthog_session_id text,
  add column if not exists form_variant text,
  add column if not exists booking_url text,
  add column if not exists status text not null default 'new',
  add column if not exists is_test boolean not null default false;

create unique index if not exists idx_remedys_diagnostic_submission_id_unique
  on public.remedys_diagnostic_submissions (submission_id)
  where submission_id is not null;

create index if not exists idx_remedys_diagnostic_status_created_at
  on public.remedys_diagnostic_submissions (status, created_at desc);

create index if not exists idx_remedys_diagnostic_posthog_distinct_id
  on public.remedys_diagnostic_submissions (posthog_distinct_id)
  where posthog_distinct_id is not null;

alter table public.remedys_diagnostic_submissions
  drop constraint if exists remedys_diagnostic_submissions_status_check;

alter table public.remedys_diagnostic_submissions
  add constraint remedys_diagnostic_submissions_status_check
  check (status in ('new', 'reviewing', 'qualified', 'nurture', 'closed'));
