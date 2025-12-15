import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Backward-compat para código que usa "supabase" global
if (typeof window !== 'undefined') {
  window.supabase = supabase;
}
