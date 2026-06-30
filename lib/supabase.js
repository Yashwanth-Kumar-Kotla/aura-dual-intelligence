import { createClient } from '@supabase/supabase-js'

// Use service role key server-side — it bypasses RLS so API routes work,
// while RLS still blocks all direct public/anon access to the tables.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
)
