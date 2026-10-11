revoke all on function public.protect_profile_privileged_fields() from public, anon, authenticated;
grant execute on function public.protect_profile_privileged_fields() to postgres, service_role;

drop function if exists public.admin_confirm_commercial_payment(uuid,integer,text);
