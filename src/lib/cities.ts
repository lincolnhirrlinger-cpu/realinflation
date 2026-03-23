import { CityMeta } from './types'
import citiesJson from '../../public/data/cities.json'

export const CITIES: CityMeta[] = citiesJson as CityMeta[]

export function getCityBySlug(slug: string): CityMeta | undefined {
  return CITIES.find(c => c.slug === slug)
}

export function searchCities(query: string): CityMeta[] {
  const q = query.toLowerCase().trim()
  if (!q) return CITIES
  return CITIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.state.toLowerCase().includes(q) ||
    c.slug.includes(q)
  )
}

export function getAllSlugs(): string[] {
  return CITIES.map(c => c.slug)
}
