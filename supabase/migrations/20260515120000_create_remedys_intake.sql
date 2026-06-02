create extension if not exists pgcrypto;

create table if not exists public.remedys_diagnostic_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in ('remedys_ai_diagnostic', 'remedys_direct_request')),
  submission_id uuid,
  full_name text,
  email text,
  company text,
  newsletter_opt_in boolean not null default false,
  readiness_score integer check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  recommendation_key text,
  recommendation_label text,
  recommendation_band text,
  expected_time_to_value text,
  prefill_service text,
  company_description text,
  time_drain text,
  affected_group text,
  ai_usage text,
  desired_outcome text,
  direct_request_path text,
  direct_request_description text,
  direct_request_extra_notes text,
  page_path text,
  referrer text,
  user_agent text,
  origin text,
  ip_hash text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  raw_payload jsonb not null default '{}'::jsonb
);

alter table public.remedys_diagnostic_submissions enable row level security;

revoke all on table public.remedys_diagnostic_submissions from anon, authenticated;

create index if not exists idx_remedys_diagnostic_created_at
  on public.remedys_diagnostic_submissions (created_at desc);

create index if not exists idx_remedys_diagnostic_email
  on public.remedys_diagnostic_submissions (lower(email));

create index if not exists idx_remedys_diagnostic_source
  on public.remedys_diagnostic_submissions (source);

create index if not exists idx_remedys_diagnostic_recommendation
  on public.remedys_diagnostic_submissions (recommendation_key);
