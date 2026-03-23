import clsx from 'clsx'
import { CityData } from '@/lib/types'

interface ComparisonTableProps {
  cityA: CityData
  cityB: CityData
}

function Row({ label, a, b, format }: { label: string; a: number; b: number; format: (v: number) => string }) {
  const aWins = a <= b
  return (
    <tr className="border-b border-border hover:bg-cream/50 transition-colors">
      <td className="px-4 py-3 text-sm font-sans text-text-secondary">{label}</td>
      <td className={clsx('px-4 py-3 text-right font-mono text-sm font-semibold', aWins ? 'text-green-700' : 'text-accent')}>
        {format(a)}
      </td>
      <td className={clsx('px-4 py-3 text-right font-mono text-sm font-semibold', !aWins ? 'text-green-700' : 'text-accent')}>
        {format(b)}
      </td>
    </tr>
  )
}

export default function ComparisonTable({ cityA, cityB }: ComparisonTableProps) {
  const fmt$ = (v: number) => `$${v.toFixed(2)}`
  const fmtRent = (v: number) => `$${v.toLocaleString()}`
  const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`

  const grA = cityA.groceries.items
  const grB = cityB.groceries.items
  const getItem = (items: typeof grA, slug: string) => items.find(i => i.slug === slug)

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 border-b border-border bg-cream">
        <div className="px-4 py-3 label-caps">Metric</div>
        <div className="px-4 py-3 label-caps text-right text-accent">{cityA.city}</div>
        <div className="px-4 py-3 label-caps text-right text-blue-600">{cityB.city}</div>
      </div>

      {/* Gas */}
      <div className="px-4 py-2 bg-cream/50 border-b border-border">
        <p className="label-caps text-xs">Gas</p>
      </div>
      <Row label="Current Gas Price (regular)" a={cityA.gas.current} b={cityB.gas.current} format={fmt$} />

      {/* Rent */}
      <div className="px-4 py-2 bg-cream/50 border-b border-border">
        <p className="label-caps text-xs">Rent</p>
      </div>
      <Row label="Average All Units" a={cityA.rent.avg_all} b={cityB.rent.avg_all} format={fmtRent} />
      <Row label="1 Bedroom Avg" a={cityA.rent.avg_1br} b={cityB.rent.avg_1br} format={fmtRent} />
      <Row label="2 Bedroom Avg" a={cityA.rent.avg_2br} b={cityB.rent.avg_2br} format={fmtRent} />

      {/* Groceries */}
      <div className="px-4 py-2 bg-cream/50 border-b border-border">
        <p className="label-caps text-xs">Groceries</p>
      </div>
      {['eggs','ground-beef','milk','bread','chicken'].map(slug => {
        const a = getItem(grA, slug)
        const b = getItem(grB, slug)
        if (!a || !b) return null
        return <Row key={slug} label={a.name} a={a.current} b={b.current} format={fmt$} />
      })}

      {/* Dining */}
      <div className="px-4 py-2 bg-cream/50 border-b border-border">
        <p className="label-caps text-xs">Dining Out</p>
      </div>
      <Row label="Fast Food Meal Avg" a={cityA.dining.fast_food_avg} b={cityB.dining.fast_food_avg} format={fmt$} />
      <Row label="Casual Dining Avg" a={cityA.dining.casual_dining_avg} b={cityB.dining.casual_dining_avg} format={fmt$} />
      <Row label="Monthly Dining Spend" a={cityA.dining.monthly_household_spend} b={cityB.dining.monthly_household_spend} format={fmtRent} />
    </div>
  )
}
