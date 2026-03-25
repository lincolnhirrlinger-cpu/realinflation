import { CityMeta } from './types'
import { CITIES } from './cities'

export interface StateMeta {
  name: string
  abbr: string
  slug: string
  region: string
  cityCount: number
}

// All 50 states + DC — so every state has a page even without tracked cities
const ALL_STATES: Array<{ name: string; abbr: string; region: string }> = [
  { name: 'Alabama', abbr: 'AL', region: 'South' },
  { name: 'Alaska', abbr: 'AK', region: 'West' },
  { name: 'Arizona', abbr: 'AZ', region: 'West' },
  { name: 'Arkansas', abbr: 'AR', region: 'South' },
  { name: 'California', abbr: 'CA', region: 'West' },
  { name: 'Colorado', abbr: 'CO', region: 'West' },
  { name: 'Connecticut', abbr: 'CT', region: 'Northeast' },
  { name: 'Delaware', abbr: 'DE', region: 'South' },
  { name: 'Florida', abbr: 'FL', region: 'South' },
  { name: 'Georgia', abbr: 'GA', region: 'South' },
  { name: 'Hawaii', abbr: 'HI', region: 'West' },
  { name: 'Idaho', abbr: 'ID', region: 'West' },
  { name: 'Illinois', abbr: 'IL', region: 'Midwest' },
  { name: 'Indiana', abbr: 'IN', region: 'Midwest' },
  { name: 'Iowa', abbr: 'IA', region: 'Midwest' },
  { name: 'Kansas', abbr: 'KS', region: 'Midwest' },
  { name: 'Kentucky', abbr: 'KY', region: 'South' },
  { name: 'Louisiana', abbr: 'LA', region: 'South' },
  { name: 'Maine', abbr: 'ME', region: 'Northeast' },
  { name: 'Maryland', abbr: 'MD', region: 'South' },
  { name: 'Massachusetts', abbr: 'MA', region: 'Northeast' },
  { name: 'Michigan', abbr: 'MI', region: 'Midwest' },
  { name: 'Minnesota', abbr: 'MN', region: 'Midwest' },
  { name: 'Mississippi', abbr: 'MS', region: 'South' },
  { name: 'Missouri', abbr: 'MO', region: 'Midwest' },
  { name: 'Montana', abbr: 'MT', region: 'West' },
  { name: 'Nebraska', abbr: 'NE', region: 'Midwest' },
  { name: 'Nevada', abbr: 'NV', region: 'West' },
  { name: 'New Hampshire', abbr: 'NH', region: 'Northeast' },
  { name: 'New Jersey', abbr: 'NJ', region: 'Northeast' },
  { name: 'New Mexico', abbr: 'NM', region: 'West' },
  { name: 'New York', abbr: 'NY', region: 'Northeast' },
  { name: 'North Carolina', abbr: 'NC', region: 'South' },
  { name: 'North Dakota', abbr: 'ND', region: 'Midwest' },
  { name: 'Ohio', abbr: 'OH', region: 'Midwest' },
  { name: 'Oklahoma', abbr: 'OK', region: 'South' },
  { name: 'Oregon', abbr: 'OR', region: 'West' },
  { name: 'Pennsylvania', abbr: 'PA', region: 'Northeast' },
  { name: 'Rhode Island', abbr: 'RI', region: 'Northeast' },
  { name: 'South Carolina', abbr: 'SC', region: 'South' },
  { name: 'South Dakota', abbr: 'SD', region: 'Midwest' },
  { name: 'Tennessee', abbr: 'TN', region: 'South' },
  { name: 'Texas', abbr: 'TX', region: 'South' },
  { name: 'Utah', abbr: 'UT', region: 'West' },
  { name: 'Vermont', abbr: 'VT', region: 'Northeast' },
  { name: 'Virginia', abbr: 'VA', region: 'South' },
  { name: 'Washington', abbr: 'WA', region: 'West' },
  { name: 'West Virginia', abbr: 'WV', region: 'South' },
  { name: 'Wisconsin', abbr: 'WI', region: 'Midwest' },
  { name: 'Wyoming', abbr: 'WY', region: 'West' },
  { name: 'District of Columbia', abbr: 'DC', region: 'South' },
]

const ALL_STATES_BY_SLUG = new Map(
  ALL_STATES.map(s => [s.name.toLowerCase().replace(/\s+/g, '-'), s])
)

// Convert state name to slug: "New York" → "new-york"
function stateNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

// Build a map of slug → list of cities
function buildStateMap(): Map<string, CityMeta[]> {
  const map = new Map<string, CityMeta[]>()
  // Pre-seed all 50 states so every state has a page
  for (const s of ALL_STATES) {
    map.set(stateNameToSlug(s.name), [])
  }
  for (const city of CITIES) {
    const slug = stateNameToSlug(city.state)
    if (!map.has(slug)) map.set(slug, [])
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
  const stateInfo = ALL_STATES_BY_SLUG.get(slug)
  if (!stateInfo) return null
  const cities = STATE_MAP.get(slug) ?? []
  return {
    name: stateInfo.name,
    abbr: stateInfo.abbr,
    slug,
    region: stateInfo.region,
    cityCount: cities.length,
  }
}

export function getAllStateMetas(): StateMeta[] {
  return getAllStateSlugs()
    .map(slug => getStateMeta(slug))
    .filter((m): m is StateMeta => m !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}
