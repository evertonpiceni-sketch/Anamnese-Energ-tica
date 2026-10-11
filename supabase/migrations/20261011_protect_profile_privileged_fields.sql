create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'role_change_not_allowed';
  end if;

  if new.plan is distinct from old.plan then
    raise exception 'plan_change_not_allowed';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields_trigger on public.profiles;
create trigger protect_profile_privileged_fields_trigger
before update on public.profiles
for each row execute function public.protect_profile_privileged_fields();
