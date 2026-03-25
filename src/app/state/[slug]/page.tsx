import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllStateSlugs, getStateMeta, getStateCities } from '@/lib/states'
import { getCityDataServer } from '@/lib/data.server'
import { CityData } from '@/lib/types'
import { readFileSync } from 'fs'
import path from 'path'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllStateSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = getStateMeta(slug)
  if (!meta) return {}
  const year = new Date().getFullYear()
  return {
    title: `Cost of Living in ${meta.name} (${year}) — Real Prices by City | RealInflation`,
    description: `Compare real gas prices, rent, and consumer costs across cities in ${meta.name}. Updated ${year} data from RealInflation.`,
  }
}

export default async function StatePage({ params }: PageProps) {
  const { slug } = await params
  const meta = getStateMeta(slug)
  if (!meta) notFound()

  const cities = getStateCities(slug)

  // Load detailed data for each city
  const cityDataList: (CityData | null)[] = cities.map(c => getCityDataServer(c.slug))

  // Load county income data for this state
  interface CountyRecord { fips: string; name: string; state_fips: string; median_household_income: number | null }
  let stateCounties: CountyRecord[] = []
  try {
    const countiesPath = path.join(process.cwd(), 'public', 'data', 'counties.json')
    const countiesRaw = JSON.parse(readFileSync(countiesPath, 'utf8'))
    // Get state FIPS from first available city data
    const firstCity = cityDataList.find(d => d?.income?.county_fips)
    const stateFips = firstCity?.income?.county_fips?.slice(0, 2) ?? ''
    if (stateFips) {
      stateCounties = countiesRaw.counties
        .filter((c: CountyRecord) => c.state_fips === stateFips && c.median_household_income)
        .sort((a: CountyRecord, b: CountyRecord) => (b.median_household_income ?? 0) - (a.median_household_income ?? 0))
    }
  } catch (_) {
    stateCounties = []
  }

  // Compute state-level averages from available city data
  const available = cityDataList.filter((d): d is CityData => d !== null)
  const avgGas =
    available.length > 0
      ? available.reduce((sum, d) => sum + d.gas.current, 0) / available.length
      : null
  const avgRent =
    available.length > 0
      ? available.reduce((sum, d) => sum + d.rent.avg_all, 0) / available.length
      : null
  const avgCol =
    cities.length > 0
      ? cities.reduce((sum, c) => sum + c.col_index, 0) / cities.length
      : null

  const year = new Date().getFullYear()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs font-sans text-text-muted mb-6">
        <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
        {' / '}
        <Link href="/states" className="hover:text-text-primary transition-colors">States</Link>
        {' / '}
        <span className="text-text-secondary">{meta.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-serif text-3xl md:text-4xl text-text-primary">
            {meta.name}
          </h1>
          <span className="text-sm font-mono bg-cream border border-border px-2 py-1 rounded text-text-secondary">
            {meta.abbr}
          </span>
        </div>
        <p className="text-sm text-text-muted font-sans">
          {meta.region} · {meta.cityCount} {meta.cityCount === 1 ? 'city' : 'cities'} tracked · Updated {year}
        </p>
      </div>

      {/* State-level averages */}
      {(avgGas !== null || avgRent !== null || avgCol !== null) && (
        <section className="mb-10">
          <h2 className="section-title mb-4">State Averages</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {avgGas !== null && (
              <div className="card p-5 stat-stripe-red">
                <p className="label-caps mb-1">Avg Gas Price</p>
                <p className="font-mono font-bold text-2xl text-text-primary">
                  ${avgGas.toFixed(2)}
                </p>
                <p className="text-xs text-text-muted font-sans mt-1">Regular unleaded</p>
              </div>
            )}
            {avgRent !== null && (
              <div className="card p-5 stat-stripe-blue">
                <p className="label-caps mb-1">Avg Rent</p>
                <p className="font-mono font-bold text-2xl text-text-primary">
                  ${Math.round(avgRent).toLocaleString()}
                </p>
                <p className="text-xs text-text-muted font-sans mt-1">All units/mo</p>
              </div>
            )}
            {avgCol !== null && (
              <div className="card p-5">
                <p className="label-caps mb-1">Avg COL Index</p>
                <p className="font-mono font-bold text-2xl text-text-primary">
                  {avgCol.toFixed(0)}
                </p>
                <p className="text-xs text-text-muted font-sans mt-1">vs. 100 national avg</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* City grid */}
      <section className="mb-10">
        <h2 className="section-title mb-4">Cities in {meta.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city, i) => {
            const data = cityDataList[i]
            return (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="card p-5 hover:shadow-card-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-sans font-semibold text-text-primary text-base group-hover:text-accent transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs text-text-muted font-sans">{meta.name}</p>
                  </div>
                  <span className="text-xs font-mono bg-cream px-2 py-0.5 rounded text-text-secondary border border-border">
                    COL {city.col_index}
                  </span>
                </div>
                {data ? (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs label-caps mb-1">Gas</p>
                      <p className="font-mono font-bold text-sm text-text-primary">
                        ${data.gas.current.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs label-caps mb-1">Rent</p>
                      <p className="font-mono font-bold text-sm text-text-primary">
                        ${Math.round(data.rent.avg_all).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs label-caps mb-1">Food ↑</p>
                      <p className="font-mono font-bold text-sm text-accent">
                        +{data.groceries.inflation_rate.current_yoy.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted font-sans">Data coming soon</p>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      {/* County Income Table */}
      {stateCounties.length > 0 && (
        <section className="mb-10">
          <h2 className="section-title mb-4">Median Household Income by County</h2>
          <p className="text-xs text-text-muted font-sans mb-4">Source: Census ACS 5-Year 2023 · {stateCounties.length} counties</p>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-cream">
                    <th className="text-left px-5 py-3 label-caps text-xs">County</th>
                    <th className="text-right px-5 py-3 label-caps text-xs">Median Income</th>
                    <th className="text-right px-5 py-3 label-caps text-xs hidden md:table-cell">vs State Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stateCounties.map((county, i) => {
                    const stateAvg = stateCounties.reduce((s, c) => s + (c.median_household_income ?? 0), 0) / stateCounties.length
                    const diff = ((county.median_household_income ?? 0) - stateAvg) / stateAvg * 100
                    const shortName = county.name.replace(/, .*$/, '')
                    return (
                      <tr key={county.fips} className="hover:bg-cream/60 transition-colors">
                        <td className="px-5 py-2.5 font-sans text-text-primary text-sm">
                          <span className="text-text-muted font-mono text-xs mr-2">{i + 1}</span>
                          {shortName}
                        </td>
                        <td className="text-right px-5 py-2.5 font-mono font-semibold text-text-primary">
                          ${(county.median_household_income ?? 0).toLocaleString()}
                        </td>
                        <td className="text-right px-5 py-2.5 hidden md:table-cell">
                          <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${diff >= 0 ? 'text-green-700 bg-green-50' : 'text-accent bg-red-50'}`}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="border-t border-border pt-6">
        <Link href="/states" className="text-sm text-accent hover:underline font-sans">
          ← Browse all states
        </Link>
      </div>
    </div>
  )
}
