create table if not exists public.commercial_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payment_reference text,
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_id uuid not null references public.intake_sessions(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  payment_status text not null default 'confirmed' check (payment_status in ('confirmed','refunded','cancelled')),
  raw_payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider,event_id)
);

create index if not exists commercial_payment_events_intake_idx
  on public.commercial_payment_events(intake_id,created_at desc);
create index if not exists commercial_payment_events_user_idx
  on public.commercial_payment_events(user_id,created_at desc);

alter table public.commercial_payment_events enable row level security;
create policy commercial_payment_events_admin_only on public.commercial_payment_events
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.process_confirmed_commercial_payment(
  p_provider text,
  p_event_id text,
  p_intake_id uuid,
  p_amount_cents integer,
  p_payment_reference text default null,
  p_raw_payload jsonb default '{}'::jsonb
)
returns public.commercial_entitlements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_existing public.commercial_entitlements%rowtype;
  v_result public.commercial_entitlements%rowtype;
  v_product text;
  v_addon boolean := false;
  v_event_id uuid;
begin
  if p_provider is null or btrim(p_provider) = '' then raise exception 'provider_required'; end if;
  if p_event_id is null or btrim(p_event_id) = '' then raise exception 'event_id_required'; end if;

  select user_id into v_user_id from public.intake_sessions where id = p_intake_id;
  if v_user_id is null then raise exception 'intake_not_found'; end if;

  insert into public.commercial_payment_events(provider,event_id,payment_reference,user_id,intake_id,amount_cents,raw_payload)
  values (p_provider,p_event_id,p_payment_reference,v_user_id,p_intake_id,p_amount_cents,coalesce(p_raw_payload,'{}'::jsonb))
  on conflict(provider,event_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select ce.* into v_result from public.commercial_entitlements ce where ce.intake_id = p_intake_id;
    if v_result.id is null then raise exception 'duplicate_event_without_entitlement'; end if;
    return v_result;
  end if;

  select ce.* into v_existing from public.commercial_entitlements ce where ce.intake_id = p_intake_id for update;

  if p_amount_cents = 1500 then
    if v_existing.id is null or v_existing.product_code <> 'CARE_7_BASIC' then
      raise exception 'addon_requires_existing_basic_plan';
    end if;
    update public.commercial_entitlements
      set full_report_addon_paid = true,
          paid_amount_cents = greatest(paid_amount_cents,5000) + case when full_report_addon_paid then 0 else 1500 end,
          payment_reference = coalesce(p_payment_reference,payment_reference),
          status = 'active', confirmed_at = coalesce(confirmed_at,now()), updated_at = now()
      where id = v_existing.id returning * into v_result;
  else
    case p_amount_cents
      when 5000 then v_product := 'CARE_7_BASIC'; v_addon := false;
      when 6500 then v_product := 'CARE_7_BASIC'; v_addon := true;
      when 10000 then v_product := 'CARE_7_GUIDED'; v_addon := false;
      when 18000 then v_product := 'CARE_21'; v_addon := false;
      else raise exception 'unsupported_commercial_amount';
    end case;

    insert into public.commercial_entitlements(user_id,intake_id,product_code,paid_amount_cents,status,full_report_addon_paid,payment_reference,confirmed_at,updated_at)
    values(v_user_id,p_intake_id,v_product,p_amount_cents,'active',v_addon,p_payment_reference,now(),now())
    on conflict(intake_id) do update set
      product_code = excluded.product_code,
      paid_amount_cents = excluded.paid_amount_cents,
      status = 'active',
      full_report_addon_paid = excluded.full_report_addon_paid,
      payment_reference = coalesce(excluded.payment_reference,commercial_entitlements.payment_reference),
      confirmed_at = coalesce(commercial_entitlements.confirmed_at,excluded.confirmed_at),
      updated_at = now()
    returning * into v_result;
  end if;

  update public.commercial_payment_events set processed_at = now() where id = v_event_id;
  return v_result;
end;
$$;

revoke all on function public.process_confirmed_commercial_payment(text,text,uuid,integer,text,jsonb) from public, anon, authenticated;
grant execute on function public.process_confirmed_commercial_payment(text,text,uuid,integer,text,jsonb) to service_role;

create or replace function public.admin_confirm_commercial_payment(
  p_intake_id uuid,
  p_amount_cents integer,
  p_payment_reference text default null
)
returns public.commercial_entitlements
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  return public.process_confirmed_commercial_payment(
    'manual_admin',
    'manual-' || gen_random_uuid()::text,
    p_intake_id,
    p_amount_cents,
    p_payment_reference,
    jsonb_build_object('source','admin_confirmation','confirmed_by',auth.uid())
  );
end;
$$;

revoke all on function public.admin_confirm_commercial_payment(uuid,integer,text) from public, anon;
grant execute on function public.admin_confirm_commercial_payment(uuid,integer,text) to authenticated;
