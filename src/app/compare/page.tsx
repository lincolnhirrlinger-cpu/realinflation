'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { getCityData } from '@/lib/data'
import { CITIES } from '@/lib/cities'
import ComparisonTable from '@/components/ComparisonTable'
import AdSlot from '@/components/AdSlot'
import { useEffect, useState } from 'react'
import type { CityData } from '@/lib/types'

function CompareContent() {
  const searchParams = useSearchParams()
  const slugA = searchParams.get('a') ?? 'boise-id'
  const slugB = searchParams.get('b') ?? 'nampa-id'

  const [cityA, setCityA] = useState<CityData | null>(null)
  const [cityB, setCityB] = useState<CityData | null>(null)

  useEffect(() => {
    getCityData(slugA).then(setCityA)
    getCityData(slugB).then(setCityB)
  }, [slugA, slugB])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-text-muted hover:text-text-secondary font-sans mb-4 inline-block">← Home</Link>
        <p className="label-caps mb-2">Side-by-Side</p>
        <h1 className="font-serif text-4xl text-text-primary mb-2">
          {cityA?.city ?? '...'} vs. {cityB?.city ?? '...'}
        </h1>
        <p className="text-text-secondary font-sans">Compare cost of living across US cities</p>
      </div>

      {/* Picker form */}
      <div className="card p-5 mb-8">
        <p className="label-caps mb-3">Choose Cities to Compare</p>
        <form method="get" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city-a" className="text-xs font-sans text-text-secondary">City A</label>
            <select
              id="city-a"
              name="a"
              defaultValue={slugA}
              className="border border-border rounded-lg px-3 py-2 text-sm font-sans bg-cream focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              {CITIES.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city-b" className="text-xs font-sans text-text-secondary">City B</label>
            <select
              id="city-b"
              name="b"
              defaultValue={slugB}
              className="border border-border rounded-lg px-3 py-2 text-sm font-sans bg-cream focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              {CITIES.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">Compare →</button>
        </form>
      </div>

      {/* Quick compare links */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-text-muted font-sans mr-1">Popular:</span>
        {[
          { a: 'boise-id', b: 'meridian-id', label: 'Boise vs Meridian' },
          { a: 'boise-id', b: 'nampa-id', label: 'Boise vs Nampa' },
          { a: 'idaho-falls-id', b: 'pocatello-id', label: 'Idaho Falls vs Pocatello' },
          { a: 'rexburg-id', b: 'twin-falls-id', label: 'Rexburg vs Twin Falls' },
        ].map(link => (
          <Link
            key={`${link.a}-${link.b}`}
            href={`/compare?a=${link.a}&b=${link.b}`}
            className="text-xs text-accent hover:underline font-sans px-2 py-1 bg-accent/5 rounded"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {cityA && cityB ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-5 stat-stripe-red">
              <p className="label-caps mb-2">{cityA.city}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-text-secondary">Gas</span>
                  <span className="font-mono font-bold text-text-primary">${cityA.gas.current.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-text-secondary">Avg Rent</span>
                  <span className="font-mono font-bold text-text-primary">${cityA.rent.avg_all.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-text-secondary">COL Index</span>
                  <span className="font-mono font-bold text-text-primary">{cityA.col_index}</span>
                </div>
              </div>
            </div>
            <div className="card p-5 stat-stripe-blue">
              <p className="label-caps mb-2">{cityB.city}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-text-secondary">Gas</span>
                  <span className="font-mono font-bold text-text-primary">${cityB.gas.current.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-text-secondary">Avg Rent</span>
                  <span className="font-mono font-bold text-text-primary">${cityB.rent.avg_all.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-text-secondary">COL Index</span>
                  <span className="font-mono font-bold text-text-primary">{cityB.col_index}</span>
                </div>
              </div>
            </div>
          </div>

          <ComparisonTable cityA={cityA} cityB={cityB} />
          <AdSlot id="compare-ad-1" />

          <div className="mt-6 text-center">
            <p className="font-sans text-sm text-text-secondary mb-3">Green = lower cost. Red = higher cost.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/city/${slugA}`} className="btn-secondary text-sm">{cityA.city} Full Report →</Link>
              <Link href={`/city/${slugB}`} className="btn-secondary text-sm">{cityB.city} Full Report →</Link>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-8 text-center text-text-secondary font-sans">
          Loading comparison...
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-8 text-text-secondary font-sans">Loading...</div>}>
      <CompareContent />
    </Suspense>
  )
}
