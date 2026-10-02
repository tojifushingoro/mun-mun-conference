import { createClient } from '@supabase/supabase-js'

// ============================================================
//  SUPABASE CONFIGURATION
//
//  Credentials are read from environment variables so they never
//  live in committed source. Copy .env.example to .env.local and
//  fill in the values from Supabase -> Project Settings -> API.
//
//  Restart the dev server after editing .env.local.
// ============================================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

if (!isSupabaseConfigured) {
  console.error(
    'Supabase is not configured. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})