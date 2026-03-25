import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methodology & Sources — RealInflation',
  description: 'How RealInflation collects and processes real price data for gas, rent, groceries, electricity, and car insurance across 115 US cities — updated daily.',
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-text-muted hover:text-text-secondary font-sans mb-4 inline-block">← Home</Link>
        <p className="label-caps mb-2">Transparency</p>
        <h1 className="font-serif text-4xl text-text-primary mb-4">Methodology & Sources</h1>
        <p className="font-sans text-lg text-text-secondary leading-relaxed">
          Every number on this site comes from a verifiable public source or a community submission.
          No estimates, no guesses — and if a data point is still being verified, we say so.
          Here is exactly where our numbers come from and how often they update.
        </p>
      </div>

      {/* Update cadence banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
        <span className="text-xl mt-0.5">🔄</span>
        <div>
          <p className="font-sans font-semibold text-green-900 text-sm">Daily automated refresh</p>
          <p className="font-sans text-green-800 text-xs mt-1 leading-relaxed">
            An automated pipeline runs every morning at 6 AM MT pulling live data from AAA, Zillow, FRED/BLS, and EIA.
            City pages are rebuilt and redeployed automatically — no manual updates needed.
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Gas */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⛽</span>
            <h2 className="font-serif text-2xl text-text-primary">Gas Prices</h2>
          </div>
          <p className="font-sans text-text-secondary mb-4 leading-relaxed">
            State-level regular unleaded (87 octane) prices are scraped daily from the <strong>AAA Daily Fuel Gauge Report</strong> — the same source used by AP, Reuters, and CNN for gas price reporting. City prices use the state average; metro-specific data applied where available.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>Source: AAA Daily Fuel Gauge Report — gasprices.aaa.com</p>
            <p>Coverage: All 50 states + DC</p>
            <p>Update frequency: <strong className="text-green-700">Daily</strong></p>
            <p>Grade: Regular unleaded (87 octane)</p>
          </div>
        </section>

        {/* Rent */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏠</span>
            <h2 className="font-serif text-2xl text-text-primary">Rent Prices</h2>
          </div>
          <p className="font-sans text-text-secondary mb-4 leading-relaxed">
            Rental data comes from the <strong>Zillow Observed Rent Index (ZORI)</strong> — a repeat-rent index tracking the same units over time, which eliminates compositional bias from new construction. We use the Metro ZORI series covering all home types (SFR + condos + multifamily).
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>Source: Zillow Research — files.zillowstatic.com</p>
            <p>Series: Metro ZORI — Smoothed, All Homes + Multifamily</p>
            <p>Coverage: 113 of 115 cities on direct ZORI data</p>
            <p>Update frequency: <strong className="text-green-700">Monthly</strong> (Zillow publishes mid-month)</p>
            <p>Note: 2 smaller cities use nearest comparable MSA</p>
          </div>
        </section>

        {/* Groceries */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🛒</span>
            <h2 className="font-serif text-2xl text-text-primary">Grocery Prices</h2>
          </div>
          <p className="font-sans text-text-secondary mb-4 leading-relaxed">
            Grocery item prices come from the <strong>BLS Average Price Series</strong> via the FRED API. These are national average retail prices collected by BLS field representatives from stores across the country each month. They represent the price a typical consumer pays — not a specific store or brand.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>Source: FRED API — api.stlouisfed.org</p>
            <p>Eggs (dozen): APU0000708111</p>
            <p>Milk (gallon): APU0000709112</p>
            <p>Ground Beef (lb): APU0000703112</p>
            <p>Bread (loaf): APU0000702111</p>
            <p>Chicken Breast (lb): APU0000706111</p>
            <p>Update frequency: <strong className="text-green-700">Monthly</strong></p>
            <p>Note: National averages — local store prices may be lower or higher</p>
          </div>
          <p className="font-sans text-xs text-amber-700 mt-3 bg-amber-50 rounded px-3 py-2">
            💡 Know a lower local price? <Link href="/submit/" className="underline font-semibold">Submit it</Link> — community prices help us show what your city actually pays vs. the national average.
          </p>
        </section>

        {/* Electricity */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚡</span>
            <h2 className="font-serif text-2xl text-text-primary">Electricity Rates</h2>
          </div>
          <p className="font-sans text-text-secondary mb-4 leading-relaxed">
            Residential electricity rates come directly from the <strong>U.S. Energy Information Administration (EIA)</strong> via their open API. We pull state-level average retail rates for the residential sector — the same data utilities are required to report to the federal government.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>Source: EIA Open Data API — api.eia.gov</p>
            <p>Series: Electricity Retail Sales — Residential sector</p>
            <p>Coverage: All 50 states + DC</p>
            <p>Update frequency: <strong className="text-green-700">Monthly</strong> (EIA publishes ~6 weeks lag)</p>
            <p>Unit: Cents per kilowatt-hour (¢/kWh)</p>
            <p>Monthly bill estimate assumes 900 kWh/mo average household usage</p>
          </div>
        </section>

        {/* Car Insurance */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🚗</span>
            <h2 className="font-serif text-2xl text-text-primary">Car Insurance</h2>
          </div>
          <p className="font-sans text-text-secondary mb-4 leading-relaxed">
            State average annual car insurance premiums are sourced from <strong>Bankrate</strong> and the <strong>National Association of Insurance Commissioners (NAIC)</strong> annual auto insurance report. Figures represent full-coverage premiums for a typical driver profile.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>Source: Bankrate / NAIC Auto Insurance Database</p>
            <p>Coverage: State-level averages for all 50 states</p>
            <p>Update frequency: Annual (NAIC) / Quarterly (Bankrate)</p>
            <p>Profile: 40-year-old, full coverage, clean record</p>
          </div>
        </section>

        {/* CPI */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h2 className="font-serif text-2xl text-text-primary">CPI & Inflation Rates</h2>
          </div>
          <p className="font-sans text-text-secondary mb-4 leading-relaxed">
            Official CPI figures are from the <strong>Bureau of Labor Statistics</strong> via the FRED API. We report year-over-year percent change for the CPI-U (all urban consumers, not seasonally adjusted). The "official" CPI on city pages is the national figure — we display it alongside real item prices so you can judge the gap yourself.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>All Items CPI: CPIAUCSL</p>
            <p>Food at Home: CUSR0000SAF11</p>
            <p>Shelter CPI: CUSR0000SAH1</p>
            <p>Update frequency: <strong className="text-green-700">Monthly</strong></p>
          </div>
        </section>

        {/* Community submissions */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">👥</span>
            <h2 className="font-serif text-2xl text-text-primary">Community Submissions</h2>
          </div>
          <p className="font-sans text-text-secondary mb-4 leading-relaxed">
            Any user can <Link href="/submit/" className="text-accent hover:underline font-semibold">submit a local price</Link> with a receipt or screenshot. Community prices are labeled separately from official data and displayed alongside the BLS/FRED national figure. Submissions earn points on the <Link href="/leaderboard/" className="text-accent hover:underline">leaderboard</Link> and count toward the airdrop allocation.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>Backend: Supabase (PostgreSQL)</p>
            <p>Verification: Manual review for outliers</p>
            <p>Points: 10 pts per accepted submission</p>
            <p>Display: Shown alongside national BLS average, clearly labeled</p>
          </div>
        </section>

        {/* Data tiers */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏷️</span>
            <h2 className="font-serif text-2xl text-text-primary">Data Quality Tiers</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-sm mt-0.5 shrink-0">✅ Verified</span>
              <p className="font-sans text-sm text-text-secondary">Pulled directly from a named government or institutional source (BLS, FRED, EIA, Zillow ZORI, AAA). Updated automatically.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-600 font-bold text-sm mt-0.5 shrink-0">~ Estimated</span>
              <p className="font-sans text-sm text-text-secondary">Derived from regional averages or nearest comparable metro. Clearly labeled. We encourage community submissions to replace these.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-sm mt-0.5 shrink-0">👥 Community</span>
              <p className="font-sans text-sm text-text-secondary">Submitted by users with receipts or screenshots. Displayed alongside official data, not replacing it.</p>
            </div>
          </div>
        </section>

        {/* Caveats */}
        <section className="bg-accent/5 border border-accent/20 rounded-card p-6">
          <h2 className="font-serif text-xl text-accent mb-3">Important Caveats</h2>
          <ul className="font-sans text-text-secondary space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Smaller cities without direct metro data use the nearest comparable MSA or state-level data with regional adjustments.</li>
            <li>Grocery prices are national BLS averages — your local store prices will vary. Submit yours to help us show local reality.</li>
            <li>This site is for informational purposes only. Not financial advice.</li>
            <li>CPI is a national measure. Your personal inflation rate will differ based on your spending habits and location.</li>
            <li>Historical data back to 2022 was backfilled at launch using the same source APIs.</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
