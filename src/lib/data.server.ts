import fs from 'fs'
import path from 'path'
import { CityData } from './types'

// Server-only: uses fs, only import from server components
export function getCityDataServer(slug: string): CityData | null {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', `${slug}.json`)
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as CityData
  } catch {
    return null
  }
}

export function getNationalData(): any {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'national.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getAllCitiesData(): CityData[] {
  const slugs = ['boise-id','nampa-id','meridian-id','idaho-falls-id','pocatello-id','rexburg-id','twin-falls-id']
  const cities: CityData[] = []
  for (const slug of slugs) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', `${slug}.json`)
      const raw = fs.readFileSync(filePath, 'utf-8')
      cities.push(JSON.parse(raw) as CityData)
    } catch { /* skip */ }
  }
  return cities
}

/** Load cities.json meta list (lightweight, no full city data) */
export function getCitiesServer(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'cities.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}
