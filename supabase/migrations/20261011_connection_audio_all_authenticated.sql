-- The common connection audio is available to every signed-in user.
-- Personalized assets keep their existing commercial access requirements.
alter policy protocol_audio_assets_select on public.protocol_audio_assets
using (
  public.is_admin()
  or (status = 'published' and (
    (id = 'preparatory-default' and fixed_for_all_users = true)
    or exists (select 1 from public.commercial_entitlements ce where ce.user_id = (select auth.uid()) and ce.status = 'active')
  ))
);
alter policy protocol_audio_user_read on storage.objects
using (
  bucket_id = 'protocol-audios'
  and exists (
    select 1 from public.protocol_audio_assets a
    where a.storage_path = objects.name and a.status = 'published'
    and (
      (a.id = 'preparatory-default' and a.fixed_for_all_users = true)
      or exists (select 1 from public.commercial_entitlements ce where ce.user_id = (select auth.uid()) and ce.status = 'active')
    )
  )
);
