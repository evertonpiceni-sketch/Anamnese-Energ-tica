import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://aokdwgvwcsyqfhrgrboo.supabase.co';

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_1Qmifl1bST3CMxXX83KB5A_qeLKJvmc';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
