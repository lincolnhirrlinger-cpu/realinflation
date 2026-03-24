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

function priceSince2022(item: GroceryItem): number {
  const h = item.history.find(h => h.date === '2022')
  return h?.price ?? item.current
}

export default function GroceryTable({ items }: GroceryTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <p className="label-caps">Grocery Item Prices — 2022 to Present</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-cream">
              <th className="text-left px-5 py-3 label-caps text-xs">Item</th>
              {['2022','2023','2024','2025','2026'].map(yr => (
                <th key={yr} className="text-right px-3 py-3 label-caps text-xs">{yr}</th>
              ))}
              <th className="text-right px-5 py-3 label-caps text-xs">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => {
              // change_from_2022 is stored as a percentage value (e.g. 29.6 = 29.6%)
              const changePct = Math.abs(item.change_from_2022) > 2 ? item.change_from_2022 : item.change_from_2022 * 100
              const isUp = changePct > 5
              const isDown = changePct < -5
              return (
                <tr key={item.slug} className="hover:bg-cream/60 transition-colors">
                  <td className="px-5 py-3 font-sans text-text-primary font-medium">
                    {item.name}
                    {item.note && (
                      <span className="block text-xs text-text-muted font-normal mt-0.5">{item.note}</span>
                    )}
                  </td>
                  {['2022','2023','2024','2025','2026'].map(yr => {
                    const h = item.history.find(h => h.date === yr)
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
                      {changePct >= 0 ? '+' : ''}
                      {changePct.toFixed(1)}%
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
