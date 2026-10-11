create table if not exists public.commercial_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_id uuid not null unique references public.intake_sessions(id) on delete cascade,
  product_code text not null check (product_code in ('CARE_7_BASIC','CARE_7_GUIDED','CARE_21')),
  paid_amount_cents integer not null check (paid_amount_cents >= 0),
  status text not null default 'active' check (status in ('pending','active','revoked','refunded')),
  full_report_addon_paid boolean not null default false,
  payment_reference text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commercial_entitlements_user_id_idx
  on public.commercial_entitlements(user_id);
create index if not exists commercial_entitlements_status_idx
  on public.commercial_entitlements(status);

alter table public.commercial_entitlements enable row level security;

drop policy if exists entitlements_select on public.commercial_entitlements;
drop policy if exists entitlements_admin_all on public.commercial_entitlements;
drop policy if exists entitlements_admin_insert on public.commercial_entitlements;
drop policy if exists entitlements_admin_update on public.commercial_entitlements;
drop policy if exists entitlements_admin_delete on public.commercial_entitlements;

create policy entitlements_select on public.commercial_entitlements
for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy entitlements_admin_insert on public.commercial_entitlements
for insert to authenticated with check (public.is_admin());

create policy entitlements_admin_update on public.commercial_entitlements
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy entitlements_admin_delete on public.commercial_entitlements
for delete to authenticated
using (public.is_admin());

-- PostgREST upsert de intake usa onConflict=user_id,external_ref.
-- O índice não pode ser parcial para essa inferência funcionar de forma confiável.
drop index if exists public.intake_sessions_user_external_ref_uidx;
create unique index intake_sessions_user_external_ref_uidx
  on public.intake_sessions(user_id, external_ref);

-- Usuário só vê plano permanente quando o entitlement daquela anamnese está ativo.
drop policy if exists care_select on public.care_plans;
create policy care_select on public.care_plans
for select to authenticated
using (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.commercial_entitlements ce
      where ce.intake_id = care_plans.intake_id
        and ce.user_id = (select auth.uid())
        and ce.status = 'active'
    )
  )
);

-- Resultado permanente publicado também depende do entitlement.
drop policy if exists results_select on public.user_results;
create policy results_select on public.user_results
for select to authenticated
using (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and published_at is not null
    and exists (
      select 1
      from public.commercial_entitlements ce
      where ce.intake_id = user_results.intake_id
        and ce.user_id = (select auth.uid())
        and ce.status = 'active'
    )
  )
);

-- Áudio preparativo fixo só aparece para quem possui entitlement ativo.
drop policy if exists protocol_audio_assets_admin_all on public.protocol_audio_assets;
drop policy if exists protocol_audio_assets_user_select on public.protocol_audio_assets;
drop policy if exists protocol_audio_assets_select on public.protocol_audio_assets;
drop policy if exists protocol_audio_assets_admin_insert on public.protocol_audio_assets;
drop policy if exists protocol_audio_assets_admin_update on public.protocol_audio_assets;
drop policy if exists protocol_audio_assets_admin_delete on public.protocol_audio_assets;

create policy protocol_audio_assets_select on public.protocol_audio_assets
for select to authenticated
using (
  public.is_admin()
  or (
    status = 'published'
    and exists (
      select 1
      from public.commercial_entitlements ce
      where ce.user_id = (select auth.uid())
        and ce.status = 'active'
    )
  )
);

create policy protocol_audio_assets_admin_insert on public.protocol_audio_assets
for insert to authenticated with check (public.is_admin());
create policy protocol_audio_assets_admin_update on public.protocol_audio_assets
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy protocol_audio_assets_admin_delete on public.protocol_audio_assets
for delete to authenticated using (public.is_admin());

-- Storage: áudio personalizado exige usuário + anamnese com entitlement ativo.
drop policy if exists personalized_audio_user_read_own on storage.objects;
create policy personalized_audio_user_read_own on storage.objects
for select to authenticated
using (
  bucket_id = 'personalized-audios'
  and (storage.foldername(name))[1] = ((select auth.uid()))::text
  and exists (
    select 1
    from public.commercial_entitlements ce
    where ce.user_id = (select auth.uid())
      and ce.intake_id::text = (storage.foldername(name))[2]
      and ce.status = 'active'
  )
);

-- Storage: preparatório depende de asset publicado + entitlement ativo.
drop policy if exists protocol_audio_user_read on storage.objects;
create policy protocol_audio_user_read on storage.objects
for select to authenticated
using (
  bucket_id = 'protocol-audios'
  and exists (
    select 1
    from public.protocol_audio_assets a
    where a.storage_path = storage.objects.name
      and a.status = 'published'
  )
  and exists (
    select 1
    from public.commercial_entitlements ce
    where ce.user_id = (select auth.uid())
      and ce.status = 'active'
  )
);

-- Consolida INSERT de solicitações de e-mail para evitar políticas permissivas duplicadas.
drop policy if exists email_request_admin_insert on public.result_email_requests;
drop policy if exists email_request_user_insert on public.result_email_requests;
drop policy if exists email_request_insert on public.result_email_requests;
create policy email_request_insert on public.result_email_requests
for insert to authenticated
with check (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and requested_by = 'user'
    and recipient_email is null
    and exists (
      select 1
      from public.intake_sessions i
      where i.id = result_email_requests.intake_id
        and i.user_id = (select auth.uid())
    )
  )
);

-- Índices apontados pelo advisor de performance.
create index if not exists audio_generation_jobs_care_plan_id_idx
  on public.audio_generation_jobs(care_plan_id);
create index if not exists audio_generation_jobs_intake_id_idx
  on public.audio_generation_jobs(intake_id);
create index if not exists care_composition_review_versions_user_id_idx
  on public.care_composition_review_versions(user_id);

-- Tabela legada permanece fechada para usuário comum.
drop policy if exists quiz_sessions_admin_only on public.quiz_sessions;
create policy quiz_sessions_admin_only on public.quiz_sessions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
