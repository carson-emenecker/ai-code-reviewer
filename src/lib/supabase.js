import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const FREE_DAILY_LIMIT = 3

function todayString() {
  return new Date().toISOString().split('T')[0] // "YYYY-MM-DD"
}

export async function getUsageToday(userId) {
  const { data } = await supabase
    .from('usage_tracking')
    .select('review_count')
    .eq('user_id', userId)
    .eq('date', todayString())
    .maybeSingle()
  return data?.review_count ?? 0
}

export async function getUserSubscription(userId) {
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.status ?? 'free'
}
