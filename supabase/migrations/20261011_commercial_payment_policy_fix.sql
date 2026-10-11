drop policy if exists commercial_payment_events_admin_only on public.commercial_payment_events;

create policy commercial_payment_events_admin_select
on public.commercial_payment_events
for select to authenticated
using (public.is_admin());

create policy commercial_payment_events_admin_insert
on public.commercial_payment_events
for insert to authenticated
with check (public.is_admin());

create policy commercial_payment_events_admin_update
on public.commercial_payment_events
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy commercial_payment_events_admin_delete
on public.commercial_payment_events
for delete to authenticated
using (public.is_admin());
