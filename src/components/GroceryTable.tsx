import clsx from 'clsx'

interface GroceryItem {
  name: string
  slug: string
  current: number
  history: Array<{ date: string; price: number }>
  change_from_2022: number
  note?: string
}

interface GroceryTableProps {
  items: GroceryItem[]
}

const SHOW_YEARS = ['2022', '2024', '2026']

export default function GroceryTable({ items }: GroceryTableProps) {
  // Show only key items on mobile (the ones with FRED data)
  const keyItems = items.filter(i =>
    ['Eggs (dozen)', 'Milk (gallon)', 'Ground Beef (lb)', 'Bread (loaf)', 'Chicken Breast (lb)'].includes(i.name)
  )
  const otherItems = items.filter(i => !keyItems.includes(i))

  return (
    <div className="card overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <p className="label-caps">Grocery Prices — 2022 to Present</p>
        <p className="text-xs text-text-muted font-sans mt-1">National BLS averages · <span className="text-amber-600">submit local prices below ↓</span></p>
      </div>

      {/* Mobile: compact card rows */}
      <div className="md:hidden divide-y divide-border">
        {[...keyItems, ...otherItems].map(item => {
          const changePct = Math.abs(item.change_from_2022) > 2 ? item.change_from_2022 : item.change_from_2022 * 100
          const isUp = changePct > 5
          const isDown = changePct < -5
          const price2022 = item.history?.find(h => h.date === '2022')?.price
          const price2026 = item.history?.find(h => h.date === '2026')?.price ?? item.current
          return (
            <div key={item.slug} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-medium text-text-primary truncate">{item.name}</p>
                {item.note && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{item.note}</p>
                )}
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  {price2022 ? `$${price2022.toFixed(2)} in 2022` : ''}
                  {price2022 && price2026 ? ' → ' : ''}
                  {price2026 ? <span className="text-text-primary font-semibold">${price2026.toFixed(2)}</span> : ''}
                </p>
              </div>
              <span
                className={clsx(
                  'shrink-0 inline-block font-mono text-xs font-semibold px-2 py-1 rounded-full',
                  isUp && 'bg-red-50 text-accent',
                  isDown && 'bg-green-50 text-green-700',
                  !isUp && !isDown && 'bg-gray-100 text-text-secondary'
                )}
              >
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
              {['2022', '2023', '2024', '2025', '2026'].map(yr => (
                <th key={yr} className="text-right px-3 py-3 label-caps text-xs">{yr}</th>
              ))}
              <th className="text-right px-5 py-3 label-caps text-xs">Since 2022</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => {
              const changePct = Math.abs(item.change_from_2022) > 2 ? item.change_from_2022 : item.change_from_2022 * 100
              const isUp = changePct > 5
              const isDown = changePct < -5
              return (
                <tr key={item.slug} className="hover:bg-cream/60 transition-colors">
                  <td className="px-5 py-3 font-sans text-text-primary font-medium whitespace-nowrap">
                    {item.name}
                    {item.note && (
                      <span className="block text-xs text-text-muted font-normal mt-0.5">{item.note}</span>
                    )}
                  </td>
                  {['2022', '2023', '2024', '2025', '2026'].map(yr => {
                    const h = item.history?.find(h => h.date === yr)
                    return (
                      <td key={yr} className="text-right px-3 py-3 font-mono text-sm text-text-secondary">
                        {h ? `$${h.price.toFixed(2)}` : '—'}
                      </td>
                    )
                  })}
                  <td className="text-right px-5 py-3">
                    <span
                      className={clsx(
                        'inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded-full',
                        isUp && 'bg-red-50 text-accent',
                        isDown && 'bg-green-50 text-green-700',
                        !isUp && !isDown && 'bg-gray-100 text-text-secondary'
                      )}
                    >
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
