interface ChainPrice {
  name: string
  price_2022: number
  price_current: number
}

interface DiningSectionProps {
  fastFoodAvg: number
  casualDiningAvg: number
  monthlySpend: number
  inflationYoy: number
  chains: ChainPrice[]
  cityName: string
}

export default function DiningSection({
  fastFoodAvg,
  casualDiningAvg,
  monthlySpend,
  inflationYoy,
  chains,
  cityName,
}: DiningSectionProps) {
  return (
    <div className="space-y-4">
      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 stat-stripe-orange">
          <p className="label-caps mb-1">Fast Food Meal</p>
          <p className="mono-stat text-2xl">${fastFoodAvg.toFixed(2)}</p>
        </div>
        <div className="card p-4 stat-stripe-orange">
          <p className="label-caps mb-1">Casual Dining</p>
          <p className="mono-stat text-2xl">${casualDiningAvg.toFixed(2)}</p>
        </div>
        <div className="card p-4 stat-stripe-orange">
          <p className="label-caps mb-1">Monthly Spend</p>
          <p className="mono-stat text-2xl">${monthlySpend}</p>
          <span className="text-xs font-mono text-accent font-semibold">+{inflationYoy}% YoY</span>
        </div>
      </div>

      {/* Chain comparison */}
      <div className="card overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <p className="label-caps">Chain Restaurant Meal Prices — 2022 vs. Today</p>
          <p className="text-xs text-text-muted font-sans mt-1">Combo meal / typical order for one</p>
        </div>
        <div className="divide-y divide-border">
          {chains.map(chain => {
            const change = (chain.price_current - chain.price_2022) / chain.price_2022
            return (
              <div key={chain.name} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-sans font-medium text-text-primary">{chain.name}</p>
                  <p className="text-xs text-text-muted font-sans">
                    2022: <span className="font-mono">${chain.price_2022.toFixed(2)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="mono-stat text-xl text-text-primary">${chain.price_current.toFixed(2)}</p>
                  <span className="inline-block bg-red-50 text-accent text-xs font-mono font-semibold px-2 py-0.5 rounded-full">
                    +{(change * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {/* Affiliate CTA */}
        <div className="px-5 py-4 bg-cream border-t border-border">
          <p className="text-xs text-text-muted font-sans">
            Eating out more? <a href="https://www.ibotta.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">Save on groceries with Ibotta</a> and cook at home more often.
          </p>
        </div>
      </div>
    </div>
  )
}
