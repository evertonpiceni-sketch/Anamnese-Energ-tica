create table if not exists public.commercial_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_id uuid not null references public.intake_sessions(id) on delete cascade,
  product_code text not null check (product_code in ('CARE_7_BASIC', 'CARE_7_GUIDED', 'CARE_21')),
  paid_amount_cents integer not null check (paid_amount_cents >= 0),
  status text not null default 'active' check (status in ('pending', 'active', 'revoked', 'refunded')),
  full_report_addon_paid boolean not null default false,
  payment_reference text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (intake_id)
);

create index if not exists commercial_entitlements_user_id_idx
  on public.commercial_entitlements(user_id);

create index if not exists commercial_entitlements_status_idx
  on public.commercial_entitlements(status);

alter table public.commercial_entitlements enable row level security;

drop policy if exists commercial_entitlements_user_select on public.commercial_entitlements;
create policy commercial_entitlements_user_select
  on public.commercial_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists commercial_entitlements_admin_all on public.commercial_entitlements;
create policy commercial_entitlements_admin_all
  on public.commercial_entitlements
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

comment on table public.commercial_entitlements is
  'Entitlements comerciais por anamnese. Ausência de registro ativo nunca concede acesso.';
