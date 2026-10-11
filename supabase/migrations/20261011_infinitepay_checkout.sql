create table if not exists public.commercial_checkout_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_id uuid not null references public.intake_sessions(id) on delete cascade,
  order_nsu text not null unique,
  amount_cents integer not null check (amount_cents in (1500,5000,6500,10000,18000)),
  product_code text,
  full_report_addon boolean not null default false,
  status text not null default 'created' check (status in ('created','pending','paid','cancelled','failed')),
  checkout_url text,
  invoice_slug text,
  transaction_nsu text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists commercial_checkout_orders_user_idx
  on public.commercial_checkout_orders(user_id);
create index if not exists commercial_checkout_orders_intake_idx
  on public.commercial_checkout_orders(intake_id);
create index if not exists commercial_checkout_orders_status_idx
  on public.commercial_checkout_orders(status);

alter table public.commercial_checkout_orders enable row level security;

drop policy if exists commercial_checkout_orders_select on public.commercial_checkout_orders;
drop policy if exists commercial_checkout_orders_insert on public.commercial_checkout_orders;
drop policy if exists commercial_checkout_orders_update on public.commercial_checkout_orders;

create policy commercial_checkout_orders_select on public.commercial_checkout_orders
for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy commercial_checkout_orders_update on public.commercial_checkout_orders
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.create_checkout_order_for_user(
  p_user_id uuid,
  p_intake_id uuid,
  p_amount_cents integer,
  p_order_nsu text,
  p_product_code text,
  p_full_report_addon boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_amount_cents not in (1500,5000,6500,10000,18000) then
    raise exception 'unsupported_commercial_amount';
  end if;

  if not exists (
    select 1 from public.intake_sessions i
    where i.id = p_intake_id and i.user_id = p_user_id
  ) then
    raise exception 'intake_not_owned_by_user';
  end if;

  insert into public.commercial_checkout_orders(
    user_id,intake_id,order_nsu,amount_cents,product_code,full_report_addon,status
  ) values (
    p_user_id,p_intake_id,p_order_nsu,p_amount_cents,p_product_code,p_full_report_addon,'created'
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_checkout_order_for_user(uuid,uuid,integer,text,text,boolean)
  from public, anon, authenticated;
grant execute on function public.create_checkout_order_for_user(uuid,uuid,integer,text,text,boolean)
  to service_role;

create or replace function public.mark_checkout_order_paid(
  p_order_nsu text,
  p_transaction_nsu text,
  p_invoice_slug text,
  p_payment_reference text default null
)
returns table(intake_id uuid, amount_cents integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.commercial_checkout_orders
  set status = 'paid',
      transaction_nsu = p_transaction_nsu,
      invoice_slug = p_invoice_slug,
      payment_reference = coalesce(p_payment_reference, payment_reference),
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where order_nsu = p_order_nsu
  returning commercial_checkout_orders.intake_id,
            commercial_checkout_orders.amount_cents
  into intake_id, amount_cents;

  if intake_id is null then
    raise exception 'checkout_order_not_found';
  end if;

  return next;
end;
$$;

revoke all on function public.mark_checkout_order_paid(text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.mark_checkout_order_paid(text,text,text,text)
  to service_role;
