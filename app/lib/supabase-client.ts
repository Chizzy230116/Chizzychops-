'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Guard only fires in the browser, never during SSR/build
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnon)) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseAnon ?? 'placeholder-key'
)