'use client'
import { useState } from 'react'
import clsx from 'clsx'

interface Sector {
  code: string
  label: string
  employment: number
  avg_weekly_wage: number
  pct_of_total: number
  trend_5yr_pct?: number
}

interface WorkforceData {
  county_fips: string
  year: number
  source: string
  total_employment: number
  top_sectors: Sector[]
  dominant_sector: string
  median_weekly_wage_all: number
}

interface Props {
  workforce: WorkforceData
  cityName: string
  medianHouseholdIncome?: number
}

const SECTOR_COLORS: Record<string, string> = {
  '1025': 'bg-blue-500',    // Education & Health
  '1021': 'bg-amber-500',   // Trade/Transport
  '1024': 'bg-purple-500',  // Professional & Business
  '1026': 'bg-orange-400',  // Leisure & Hospitality
  '1013': 'bg-yellow-600',  // Construction
  '1012': 'bg-gray-500',    // Manufacturing
  '1023': 'bg-green-600',   // Financial
  '1022': 'bg-cyan-500',    // Information/Tech
  '1028': 'bg-slate-500',   // Government
  '1011': 'bg-lime-700',    // Natural Resources
  '1027': 'bg-rose-400',    // Other Services
}

function TrendBadge({ pct }: { pct?: number }) {
  if (pct == null) return null
  const isUp = pct > 2
  const isDown = pct < -2
  return (
    <span className={clsx(
      'text-xs font-mono px-1.5 py-0.5 rounded-full shrink-0',
      isUp && 'bg-green-50 text-green-700',
      isDown && 'bg-red-50 text-accent',
      !isUp && !isDown && 'bg-gray-100 text-text-muted'
    )}>
      {pct >= 0 ? '+' : ''}{pct.toFixed(1)}% 5yr
    </span>
  )
}

export default function WorkforceSection({ workforce, cityName, medianHouseholdIncome }: Props) {
  const [showAll, setShowAll] = useState(false)

  const sectors = showAll ? workforce.top_sectors : workforce.top_sectors.slice(0, 5)
  const annualWage = workforce.median_weekly_wage_all * 52
  const burdenPct = medianHouseholdIncome
    ? Math.round(medianHouseholdIncome / annualWage * 100) / 100
    : null

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Local Workforce</h2>
        <span className="text-xs font-mono text-text-muted">{workforce.year} · BLS QCEW</span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card px-4 py-3">
          <p className="label-caps text-xs mb-1">Total Jobs</p>
          <p className="font-mono font-bold text-text-primary text-lg">
            {(workforce.total_employment / 1000).toFixed(0)}k
          </p>
        </div>
        <div className="card px-4 py-3">
          <p className="label-caps text-xs mb-1">Median Weekly Pay</p>
          <p className="font-mono font-bold text-text-primary text-lg">
            ${workforce.median_weekly_wage_all.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted font-sans">${Math.round(annualWage / 1000)}k/yr</p>
        </div>
        <div className="card px-4 py-3">
          <p className="label-caps text-xs mb-1">Top Sector</p>
          <p className="font-sans font-semibold text-text-primary text-sm leading-tight">
            {workforce.dominant_sector}
          </p>
        </div>
        {medianHouseholdIncome && (
          <div className="card px-4 py-3">
            <p className="label-caps text-xs mb-1">Household vs Worker Pay</p>
            <p className="font-mono font-bold text-text-primary text-lg">
              ${Math.round(medianHouseholdIncome / 1000)}k
            </p>
            <p className="text-xs text-text-muted font-sans">household median</p>
          </div>
        )}
      </div>

      {/* Sector breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <p className="label-caps text-xs">Employment by Sector — {cityName}</p>
          <p className="text-xs text-text-muted font-sans mt-0.5">
            % of local workforce · avg weekly wage · 5-year growth trend
          </p>
        </div>

        <div className="divide-y divide-border">
          {sectors.map(sector => {
            const barWidth = Math.min(sector.pct_of_total * 3, 100)
            const color = SECTOR_COLORS[sector.code] ?? 'bg-gray-400'
            const annualSectorWage = sector.avg_weekly_wage * 52

            return (
              <div key={sector.code} className="px-5 py-3">
                {/* Mobile + desktop layout */}
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="font-sans text-sm font-medium text-text-primary truncate">
                    {sector.label}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <TrendBadge pct={sector.trend_5yr_pct} />
                    <span className="font-mono text-sm font-semibold text-text-primary">
                      ${sector.avg_weekly_wage.toLocaleString()}<span className="text-text-muted font-normal text-xs">/wk</span>
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} opacity-70`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-text-muted w-10 text-right shrink-0">
                    {sector.pct_of_total.toFixed(1)}%
                  </span>
                  <span className="text-xs text-text-muted font-sans w-20 text-right shrink-0 hidden md:block">
                    {(sector.employment / 1000).toFixed(1)}k workers
                  </span>
                </div>

                {/* Annual wage note on mobile */}
                <p className="text-xs text-text-muted font-mono mt-0.5 md:hidden">
                  ~${Math.round(annualSectorWage / 1000)}k/yr
                </p>
              </div>
            )
          })}
        </div>

        {workforce.top_sectors.length > 5 && (
          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-xs text-accent hover:underline font-sans"
            >
              {showAll ? '▲ Show less' : `▼ Show all ${workforce.top_sectors.length} sectors`}
            </button>
          </div>
        )}

        <div className="px-5 py-2 border-t border-border bg-cream/50">
          <p className="text-xs text-text-muted font-sans">
            Source: {workforce.source} · County FIPS {workforce.county_fips}
          </p>
        </div>
      </div>

      {/* Affordability by sector callout */}
      {workforce.top_sectors.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Best paid sector */}
          {(() => {
            const best = [...workforce.top_sectors].sort((a, b) => b.avg_weekly_wage - a.avg_weekly_wage)[0]
            const worst = [...workforce.top_sectors].sort((a, b) => a.avg_weekly_wage - b.avg_weekly_wage)[0]
            return (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-xs label-caps text-green-800 mb-1">Highest Paying Sector</p>
                  <p className="font-sans font-semibold text-green-900">{best.label}</p>
                  <p className="font-mono text-sm text-green-800">
                    ${best.avg_weekly_wage.toLocaleString()}/wk · ${Math.round(best.avg_weekly_wage * 52 / 1000)}k/yr
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs label-caps text-amber-800 mb-1">Most Workers (lowest wage)</p>
                  <p className="font-sans font-semibold text-amber-900">{worst.label}</p>
                  <p className="font-mono text-sm text-amber-800">
                    ${worst.avg_weekly_wage.toLocaleString()}/wk · ${Math.round(worst.avg_weekly_wage * 52 / 1000)}k/yr
                  </p>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </section>
  )
}
