create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  consent_lgpd_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, consent_lgpd_at)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    case when coalesce((new.raw_user_meta_data ->> 'consent_lgpd')::boolean, false) then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.intake_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_ref text not null,
  person_name text,
  age_text text,
  contact_text text,
  status text not null default 'completed' check (status in ('draft','completed','archived')),
  completed_at timestamptz,
  answers jsonb not null default '{}'::jsonb,
  free_text_need text,
  free_text_challenges text,
  free_text_strengths text,
  body_regions jsonb not null default '[]'::jsonb,
  declared_intention text,
  service_preferences text,
  energetic_sensitivity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, external_ref)
);

create index if not exists intake_sessions_user_completed_idx
  on public.intake_sessions(user_id, completed_at desc);

create table if not exists public.user_results (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null unique references public.intake_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  headline text not null,
  intro text not null,
  priorities jsonb not null default '[]'::jsonb,
  intention text not null,
  closing text not null,
  solfeggio jsonb,
  floral jsonb not null default '[]'::jsonb,
  aromatherapy jsonb not null default '[]'::jsonb,
  etheric_crystals jsonb not null default '[]'::jsonb,
  journey_mode text not null default 'NAO_INDICADO',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.intake_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  result_id uuid references public.user_results(id) on delete set null,
  status text not null default 'preparing' check (status in ('preparing','ready','active','superseded')),
  audio_plan_id text not null unique,
  audio_title text,
  audio_status text not null default 'awaiting_audio' check (audio_status in ('awaiting_audio','published')),
  audio_storage_path text,
  audio_duration_seconds integer,
  solfeggio jsonb,
  floral jsonb not null default '[]'::jsonb,
  aromatherapy jsonb not null default '[]'::jsonb,
  etheric_crystals jsonb not null default '[]'::jsonb,
  journey_mode text not null default 'NAO_INDICADO',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists care_plans_intake_updated_idx
  on public.care_plans(intake_id, updated_at desc);
create index if not exists care_plans_user_idx
  on public.care_plans(user_id);

create table if not exists public.care_plan_technical (
  id uuid primary key default gen_random_uuid(),
  care_plan_id uuid not null unique references public.care_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  composition_signature text not null,
  base_system text,
  main_system text,
  complementary_systems jsonb not null default '[]'::jsonb,
  internal_resources jsonb not null default '{}'::jsonb,
  script_outline jsonb not null default '[]'::jsonb,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_composition_reviews (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null unique references public.intake_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','approved','superseded')),
  engine_snapshot jsonb not null default '{}'::jsonb,
  manual_composition jsonb not null default '{}'::jsonb,
  admin_notes text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_composition_review_versions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.care_composition_reviews(id) on delete cascade,
  intake_id uuid not null references public.intake_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  engine_snapshot jsonb not null default '{}'::jsonb,
  manual_composition jsonb not null default '{}'::jsonb,
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.audio_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  care_plan_id uuid not null references public.care_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_id uuid not null references public.intake_sessions(id) on delete cascade,
  audio_plan_id text not null unique,
  status text not null default 'script_draft',
  spoken_script text not null default '',
  voice_provider text,
  voice_id text,
  narration_storage_path text,
  final_storage_path text,
  solfeggio_hz integer,
  mix_notes text,
  admin_notes text,
  last_error text,
  script_approved_at timestamptz,
  final_approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audio_generation_job_versions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.audio_generation_jobs(id) on delete cascade,
  status text not null,
  spoken_script text,
  voice_provider text,
  voice_id text,
  narration_storage_path text,
  final_storage_path text,
  solfeggio_hz integer,
  mix_notes text,
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.practice_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  care_plan_id uuid not null references public.care_plans(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  perception_before integer check (perception_before between 0 and 10),
  perception_after integer check (perception_after between 0 and 10),
  observation text,
  status text not null default 'started' check (status in ('started','completed'))
);

create index if not exists practice_logs_user_started_idx
  on public.practice_logs(user_id, started_at desc);

create table if not exists public.protocol_audio_assets (
  id text primary key,
  title text not null,
  subtitle text,
  storage_path text,
  duration_seconds integer,
  status text not null default 'draft' check (status in ('draft','published','inactive')),
  fixed_for_all_users boolean not null default false,
  downloadable boolean not null default false,
  energetic_programming jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.protocol_audio_assets (
  id, title, subtitle, status, fixed_for_all_users, downloadable, energetic_programming
) values (
  'preparatory-default',
  'Áudio preparativo',
  'Um apoio inicial enquanto seu material personalizado é preparado.',
  'draft',
  true,
  false,
  jsonb_build_object(
    'support', jsonb_build_array('Golden Light Source','Original Reiki Platinum'),
    'main_system', 'Soul Shakti',
    'sequence', jsonb_build_array('Body Purification','Soul Healing','Mind Empowerment','Spiritual Alignment','Integração')
  )
) on conflict (id) do nothing;

create table if not exists public.result_email_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_id uuid not null references public.intake_sessions(id) on delete cascade,
  requested_by text not null check (requested_by in ('user','admin')),
  recipient_email text,
  pdf_storage_path text not null,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','provider_not_configured')),
  provider_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.intake_sessions enable row level security;
alter table public.user_results enable row level security;
alter table public.care_plans enable row level security;
alter table public.care_plan_technical enable row level security;
alter table public.care_composition_reviews enable row level security;
alter table public.care_composition_review_versions enable row level security;
alter table public.audio_generation_jobs enable row level security;
alter table public.audio_generation_job_versions enable row level security;
alter table public.practice_logs enable row level security;
alter table public.protocol_audio_assets enable row level security;
alter table public.result_email_requests enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy intake_own_select on public.intake_sessions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy intake_own_insert on public.intake_sessions for insert to authenticated with check (user_id = auth.uid() or public.is_admin());
create policy intake_own_update on public.intake_sessions for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy user_results_own_select on public.user_results for select to authenticated using ((user_id = auth.uid() and published_at is not null) or public.is_admin());
create policy user_results_admin_write on public.user_results for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy care_plans_own_select on public.care_plans for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy care_plans_admin_write on public.care_plans for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy care_plan_technical_admin_only on public.care_plan_technical for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy composition_reviews_admin_only on public.care_composition_reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy composition_review_versions_admin_only on public.care_composition_review_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy audio_generation_jobs_admin_only on public.audio_generation_jobs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy audio_generation_versions_admin_only on public.audio_generation_job_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy practice_own_select on public.practice_logs for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy practice_own_insert on public.practice_logs for insert to authenticated with check (user_id = auth.uid() or public.is_admin());
create policy practice_own_update on public.practice_logs for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy protocol_assets_entitled_select on public.protocol_audio_assets for select to authenticated using (
  status = 'published' and exists (
    select 1 from public.commercial_entitlements ce
    where ce.user_id = auth.uid() and ce.status = 'active'
  )
  or public.is_admin()
);
create policy protocol_assets_admin_write on public.protocol_audio_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy result_email_own_select on public.result_email_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy result_email_own_insert on public.result_email_requests for insert to authenticated with check (user_id = auth.uid() or public.is_admin());
create policy result_email_admin_update on public.result_email_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('personalized-audios','personalized-audios',false),
  ('protocol-audios','protocol-audios',false),
  ('result-pdfs','result-pdfs',false)
on conflict (id) do update set public = excluded.public;

create policy personalized_audio_user_read on storage.objects for select to authenticated using (
  bucket_id = 'personalized-audios'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
create policy personalized_audio_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'personalized-audios' and public.is_admin());
create policy personalized_audio_admin_update on storage.objects for update to authenticated using (bucket_id = 'personalized-audios' and public.is_admin()) with check (bucket_id = 'personalized-audios' and public.is_admin());
create policy personalized_audio_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'personalized-audios' and public.is_admin());

create policy protocol_audio_entitled_read on storage.objects for select to authenticated using (
  bucket_id = 'protocol-audios'
  and (
    public.is_admin()
    or exists (
      select 1 from public.commercial_entitlements ce
      where ce.user_id = auth.uid() and ce.status = 'active'
    )
  )
);
create policy protocol_audio_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'protocol-audios' and public.is_admin());
create policy protocol_audio_admin_update on storage.objects for update to authenticated using (bucket_id = 'protocol-audios' and public.is_admin()) with check (bucket_id = 'protocol-audios' and public.is_admin());
create policy protocol_audio_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'protocol-audios' and public.is_admin());

create policy result_pdf_user_read on storage.objects for select to authenticated using (
  bucket_id = 'result-pdfs'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
create policy result_pdf_user_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'result-pdfs'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
create policy result_pdf_user_update on storage.objects for update to authenticated using (
  bucket_id = 'result-pdfs'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
) with check (
  bucket_id = 'result-pdfs'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
