import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methodology & Sources — RealInflation',
  description: 'How RealInflation collects and processes price data for gas, rent, groceries, electricity, and car insurance across 115 US cities.',
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-text-muted hover:text-text-secondary font-sans mb-4 inline-block">← Home</Link>
        <p className="label-caps mb-2">Transparency</p>
        <h1 className="font-serif text-4xl text-text-primary mb-4">Methodology & Sources</h1>
        <p className="font-sans text-lg text-text-secondary leading-relaxed">
          We believe price data should be transparent, sourced from reliable public data, and updated regularly.
          Here is exactly where our numbers come from.
        </p>
      </div>

      <div className="prose max-w-none space-y-8">
        {/* Gas */}
        <section className="card p-6">
          <h2 className="font-serif text-2xl text-text-primary mb-3">Gas Prices</h2>
          <p className="font-sans text-text-secondary mb-3 leading-relaxed">
            Gas prices are sourced from the <strong>AAA Daily Fuel Gauge Report</strong> and cross-referenced with 
            <strong> GasBuddy</strong> regional data. We report regular unleaded (87 octane) as the standard measure.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary">
            Source: gasprices.aaa.com<br />
            Update frequency: Monthly (1st of month)<br />
            Geography: City/metro-level where available, state average otherwise
          </div>
        </section>

        {/* Rent */}
        <section className="card p-6">
          <h2 className="font-serif text-2xl text-text-primary mb-3">Rent Prices</h2>
          <p className="font-sans text-text-secondary mb-3 leading-relaxed">
            Rental data comes from the <strong>Zillow Observed Rent Index (ZORI)</strong>, a smoothed measure of 
            the typical observed market rate rent. ZORI is a repeat-rent index that controls for compositional changes.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary">
            Source: Zillow Research Data (zillow.com/research/data/)<br />
            Series: ZORI — Smoothed, All Homes<br />
            Update frequency: Monthly<br />
            Note: Smaller cities use nearest MSA or state average
          </div>
        </section>

        {/* Groceries */}
        <section className="card p-6">
          <h2 className="font-serif text-2xl text-text-primary mb-3">Grocery Prices</h2>
          <p className="font-sans text-text-secondary mb-3 leading-relaxed">
            Grocery item prices are sourced from the <strong>Federal Reserve Bank of St. Louis (FRED)</strong> via 
            the Bureau of Labor Statistics Average Price series. These are national averages; city-level adjustments 
            are applied using regional cost-of-living indices.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>Source: FRED API (api.stlouisfed.org)</p>
            <p>Eggs: APU0000708111</p>
            <p>Milk (gallon): APU0000709112</p>
            <p>Ground Beef: APU0000703112</p>
            <p>Bread (1 lb): APU0000702111</p>
            <p>Chicken Breast: APU0000706111</p>
            <p>Update frequency: Monthly</p>
          </div>
        </section>

        {/* CPI */}
        <section className="card p-6">
          <h2 className="font-serif text-2xl text-text-primary mb-3">CPI / Inflation Rates</h2>
          <p className="font-sans text-text-secondary mb-3 leading-relaxed">
            Official CPI figures are from the <strong>Bureau of Labor Statistics</strong> via FRED. We report 
            year-over-year percent change for the CPI-U (all urban consumers, not seasonally adjusted unless noted).
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <p>All Items CPI: CPIAUCSL</p>
            <p>Food at Home: CUSR0000SAF11</p>
            <p>Food Away from Home: CUSR0000SEFV</p>
          </div>
        </section>

        {/* Dining */}
        <section className="card p-6">
          <h2 className="font-serif text-2xl text-text-primary mb-3">Dining & Restaurant Prices</h2>
          <p className="font-sans text-text-secondary mb-3 leading-relaxed">
            Fast food combo meal prices are sourced from publicly reported data, menu price tracking databases, 
            and consumer-reported pricing. Chain prices represent a typical combo meal or standard order for one person.
            These figures are approximate and may vary by location.
          </p>
          <div className="bg-cream rounded-lg p-4 text-sm font-mono text-text-secondary">
            Source: Menu price surveys, consumer reports<br />
            Update frequency: Quarterly<br />
            Note: Prices are city-level estimates
          </div>
        </section>

        {/* Update schedule */}
        <section className="card p-6">
          <h2 className="font-serif text-2xl text-text-primary mb-3">Update Schedule</h2>
          <p className="font-sans text-text-secondary leading-relaxed">
            Data is refreshed automatically on the 1st of each month via a GitHub Actions workflow that pulls 
            from FRED API, Zillow ZORI CSV exports, and AAA gas price data. Historical data going back to 2022 
            was backfilled in March 2026 as the project launched.
          </p>
        </section>

        {/* Caveats */}
        <section className="bg-accent/5 border border-accent/20 rounded-card p-6">
          <h2 className="font-serif text-xl text-accent mb-3">Important Caveats</h2>
          <ul className="font-sans text-text-secondary space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Smaller cities without direct metro data use nearest comparable MSA or state-level FRED data with regional adjustment factors.</li>
            <li>Rent data for cities outside major Zillow metros uses the nearest comparable MSA.</li>
            <li>This site is for informational purposes only. Not financial advice.</li>
            <li>CPI is a national measure; your personal inflation rate will differ based on spending habits and location.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
