alter table public.commercial_checkout_orders
  drop constraint if exists commercial_checkout_orders_amount_cents_check;

alter table public.commercial_checkout_orders
  add constraint commercial_checkout_orders_amount_cents_check
  check (amount_cents in (100,1500,5000,6500,10000,18000));

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
  if p_amount_cents not in (100,1500,5000,6500,10000,18000) then
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
      when 100 then v_product := 'CARE_7_BASIC'; v_addon := false;
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

revoke all on function public.process_confirmed_commercial_payment(text,text,uuid,integer,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.process_confirmed_commercial_payment(text,text,uuid,integer,text,jsonb)
  to service_role;
