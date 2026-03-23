import { CityData } from './types'

// Client-safe: uses fetch, works in browser
export async function getCityData(slug: string): Promise<CityData | null> {
  try {
    const res = await fetch(`/data/${slug}.json`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
