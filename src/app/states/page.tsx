import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllStateMetas } from '@/lib/states'
import { getCityDataServer } from '@/lib/data.server'

export const metadata: Metadata = {
  title: 'Browse Cost of Living by State (2026) | RealInflation',
  description:
    'Compare real consumer prices — gas, rent, and groceries — across all 50 states and DC. Click any state to see city-by-city breakdowns.',
}

export default function StatesPage() {
  const states = getAllStateMetas()

  // For each state, pull gas price from the first city's JSON
  const stateCards = states.map(state => {
    // slug of first city in state: find it via the state slug
    // We need to dynamically get the first city's gas price
    const slug = state.slug
    return { ...state }
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-3">
          Browse by State
        </h1>
        <p className="font-sans text-base text-text-secondary max-w-2xl">
          Compare real consumer prices across all 50 states and DC. Each state page shows
          city-by-city gas, rent, and cost of living data.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stateCards.map(state => (
          <Link
            key={state.slug}
            href={`/state/${state.slug}`}
            className="card p-4 hover:shadow-card-hover group flex flex-col gap-1"
          >
            <div className="flex items-start justify-between">
              <span className="font-sans font-semibold text-text-primary text-sm group-hover:text-accent transition-colors leading-tight">
                {state.name}
              </span>
              <span className="text-xs font-mono text-text-muted bg-cream border border-border px-1.5 py-0.5 rounded shrink-0 ml-1">
                {state.abbr}
              </span>
            </div>
            <p className="text-xs text-text-muted font-sans">{state.region}</p>
            <p className="text-xs text-text-secondary font-sans mt-1">
              {state.cityCount} {state.cityCount === 1 ? 'city' : 'cities'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
