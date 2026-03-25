import clsx from 'clsx'

interface GroceryItem {
  name: string
  slug: string
  current: number
  history: Array<{ date: string; price: number }>
  change_from_2022: number
  change_from_2000?: number
  change_from_baseline?: number
  baseline_year?: number
  note?: string
  kroger_price?: number
  kroger_store?: string
}

interface GroceryTableProps {
  items: GroceryItem[]
}

const DESKTOP_YEARS = ['2000', '2005', '2010', '2015', '2020', '2022', '2026']

export default function GroceryTable({ items }: GroceryTableProps) {
  const keyItems = items.filter(i =>
    ['Eggs (dozen)', 'Milk (gallon)', 'Ground Beef (lb)', 'Bread (loaf)', 'Chicken Breast (lb)'].includes(i.name)
  )
  const otherItems = items.filter(i => !keyItems.includes(i))

  function getChangePct(item: GroceryItem): number {
    // Prefer 2000 baseline; fall back to 2022
    const raw = item.change_from_2000 ?? item.change_from_baseline ?? item.change_from_2022
    return Math.abs(raw) > 2 ? raw : raw * 100
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <p className="label-caps">Grocery Prices — 2000 to Present</p>
        <p className="text-xs text-text-muted font-sans mt-1">
          National BLS averages · <span className="text-amber-600">submit local prices below ↓</span>
        </p>
      </div>

      {/* Mobile: compact card rows */}
      <div className="md:hidden divide-y divide-border">
        {[...keyItems, ...otherItems].map(item => {
          const changePct = getChangePct(item)
          const isUp = changePct > 5
          const isDown = changePct < -5
          const price2000 = item.history?.find(h => h.date === '2000')?.price
          const priceCurrent = item.history?.find(h => h.date === '2026')?.price
            ?? item.history?.find(h => h.date === '2025')?.price
            ?? item.current
          return (
            <div key={item.slug} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-medium text-text-primary truncate">{item.name}</p>
                {item.note && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{item.note}</p>
                )}
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  {price2000 ? `$${price2000.toFixed(2)} in 2000` : ''}
                  {price2000 && priceCurrent ? ' → ' : ''}
                  {priceCurrent ? <span className="text-text-primary font-semibold">${priceCurrent.toFixed(2)}</span> : ''}
                  <span className="text-text-muted"> BLS avg</span>
                </p>
                {item.kroger_price && (
                  <p className="text-xs text-blue-700 font-mono mt-0.5">
                    ${item.kroger_price.toFixed(2)} @ {item.kroger_store ?? 'Kroger'}
                  </p>
                )}
              </div>
              <span className={clsx(
                'shrink-0 inline-block font-mono text-xs font-semibold px-2 py-1 rounded-full',
                isUp && 'bg-red-50 text-accent',
                isDown && 'bg-green-50 text-green-700',
                !isUp && !isDown && 'bg-gray-100 text-text-secondary'
              )}>
                {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Desktop: full year table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-cream">
              <th className="text-left px-5 py-3 label-caps text-xs">Item</th>
              {DESKTOP_YEARS.map(yr => (
                <th key={yr} className={clsx(
                  'text-right px-3 py-3 label-caps text-xs',
                  yr === '2000' && 'text-text-muted'
                )}>{yr}</th>
              ))}
              <th className="text-right px-5 py-3 label-caps text-xs">Since 2000</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => {
              const changePct = getChangePct(item)
              const isUp = changePct > 5
              const isDown = changePct < -5
              return (
                <tr key={item.slug} className="hover:bg-cream/60 transition-colors">
                  <td className="px-5 py-3 font-sans text-text-primary font-medium whitespace-nowrap">
                    {item.name}
                    {item.note && (
                      <span className="block text-xs text-text-muted font-normal mt-0.5">{item.note}</span>
                    )}
                    {item.kroger_price && (
                      <span className="block text-xs text-blue-700 font-mono mt-0.5">
                        ${item.kroger_price.toFixed(2)} @ {item.kroger_store ?? 'Kroger'}
                      </span>
                    )}
                  </td>
                  {DESKTOP_YEARS.map(yr => {
                    const h = item.history?.find(h => h.date === yr)
                    return (
                      <td key={yr} className={clsx(
                        'text-right px-3 py-3 font-mono text-sm',
                        yr === '2000' ? 'text-text-muted' : 'text-text-secondary'
                      )}>
                        {h ? `$${h.price.toFixed(2)}` : '—'}
                      </td>
                    )
                  })}
                  <td className="text-right px-5 py-3">
                    <span className={clsx(
                      'inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded-full',
                      isUp && 'bg-red-50 text-accent',
                      isDown && 'bg-green-50 text-green-700',
                      !isUp && !isDown && 'bg-gray-100 text-text-secondary'
                    )}>
                      {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
