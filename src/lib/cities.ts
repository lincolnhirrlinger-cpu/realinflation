import { CityMeta } from './types'

export const CITIES: CityMeta[] = [
  { name: 'Boise', state: 'Idaho', slug: 'boise-id', population: 240000, region: 'Mountain West' },
  { name: 'Nampa', state: 'Idaho', slug: 'nampa-id', population: 105000, region: 'Mountain West' },
  { name: 'Meridian', state: 'Idaho', slug: 'meridian-id', population: 130000, region: 'Mountain West' },
  { name: 'Idaho Falls', state: 'Idaho', slug: 'idaho-falls-id', population: 66000, region: 'Mountain West' },
  { name: 'Pocatello', state: 'Idaho', slug: 'pocatello-id', population: 57000, region: 'Mountain West' },
  { name: 'Rexburg', state: 'Idaho', slug: 'rexburg-id', population: 39000, region: 'Mountain West' },
  { name: 'Twin Falls', state: 'Idaho', slug: 'twin-falls-id', population: 52000, region: 'Mountain West' },
]

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
