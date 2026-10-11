create table if not exists public.full_report_publications (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null unique references public.intake_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  report_json jsonb not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists full_report_publications_user_id_idx
  on public.full_report_publications(user_id);

alter table public.full_report_publications enable row level security;

create policy full_report_select on public.full_report_publications
for select to authenticated
using (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.commercial_entitlements ce
      where ce.intake_id = full_report_publications.intake_id
        and ce.user_id = (select auth.uid())
        and ce.status = 'active'
        and (
          ce.product_code in ('CARE_7_GUIDED','CARE_21')
          or ce.full_report_addon_paid = true
        )
    )
  )
);

create policy full_report_admin_insert on public.full_report_publications
for insert to authenticated with check (public.is_admin());
create policy full_report_admin_update on public.full_report_publications
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy full_report_admin_delete on public.full_report_publications
for delete to authenticated using (public.is_admin());
