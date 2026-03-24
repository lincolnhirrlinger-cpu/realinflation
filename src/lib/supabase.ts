import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vdysencobninrxpffqrz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXNlbmNvYm5pbnJ4cGZmcXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzY1OTYsImV4cCI6MjA4OTk1MjU5Nn0.1UF0BWaoo9kHUGr97_tCSoGoxZh1Z4HezGnk601AnCw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Submission {
  city_slug: string
  category: string
  store?: string
  item?: string
  price: number
  submitted_date: string
  user_uuid: string
  image_url?: string
}

export async function submitPrice(data: Submission): Promise<{ points: number; error?: string }> {
  const points = 10

  const { error } = await supabase.from('submissions').insert({
    ...data,
    points_earned: points,
    verified: false,
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return { points: 0, error: error.message }
  }

  // Upsert user points
  await supabase.rpc('increment_user_points', {
    p_user_uuid: data.user_uuid,
    p_points: points,
  })

  return { points }
}

export async function getUserPoints(userUuid: string): Promise<number> {
  const { data } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_uuid', userUuid)
    .single()
  return data?.total_points ?? 0
}

export async function getCitySubmissions(citySlug: string) {
  const { data } = await supabase
    .from('submissions')
    .select('category, price, store, item, created_at')
    .eq('city_slug', citySlug)
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

export async function getCitySubmissionCount(citySlug: string): Promise<number> {
  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('city_slug', citySlug)
  return count ?? 0
}
