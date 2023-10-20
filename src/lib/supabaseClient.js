import { createClient } from '@supabase/supabase-js'


export const supabase = createClient('https://nmpabtmidtpyqlqdpnif.supabase.co', import.meta.env.VITE_KEY)