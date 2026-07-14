import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tsjovrjcpqqckopexmur.supabase.co'

const supabaseAnonKey = 'sb_publishable_Hyb3YbPs16hpOJdCVS7uQA_erL-O6_8'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)