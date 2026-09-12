import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabasePublishableKey &&
    !supabaseUrl.includes('your-supabase-project-id') &&
    !supabasePublishableKey.includes('your_supabase_publishable')
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    'Supabase warning: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables are set to placeholders in .env.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-anon-key'
);

