import { CityMeta } from './types'
import { CITIES } from './cities'

export interface StateMeta {
  name: string
  abbr: string
  slug: string
  region: string
  cityCount: number
}

// Convert state name to slug: "New York" → "new-york"
function stateNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

// Build a map of slug → list of cities
function buildStateMap(): Map<string, CityMeta[]> {
  const map = new Map<string, CityMeta[]>()
  for (const city of CITIES) {
    const slug = stateNameToSlug(city.state)
    if (!map.has(slug)) {
      map.set(slug, [])
    }
    map.get(slug)!.push(city)
  }
  return map
}

const STATE_MAP = buildStateMap()

export function getStateCities(stateSlug: string): CityMeta[] {
  return STATE_MAP.get(stateSlug) ?? []
}

export function getAllStateSlugs(): string[] {
  return Array.from(STATE_MAP.keys()).sort()
}

export function getStateMeta(slug: string): StateMeta | null {
  const cities = STATE_MAP.get(slug)
  if (!cities || cities.length === 0) return null
  const first = cities[0]
  return {
    name: first.state,
    abbr: first.state_abbr,
    slug,
    region: first.region,
    cityCount: cities.length,
  }
}

export function getAllStateMetas(): StateMeta[] {
  return getAllStateSlugs()
    .map(slug => getStateMeta(slug))
    .filter((m): m is StateMeta => m !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}
