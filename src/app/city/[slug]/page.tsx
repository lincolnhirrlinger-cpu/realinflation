import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getCityDataServer } from '@/lib/data.server'
import { CITIES, getAllSlugs } from '@/lib/cities'
import StatCard from '@/components/StatCard'
import SourceBadge from '@/components/SourceBadge'
import GroceryTable from '@/components/GroceryTable'
import DiningSection from '@/components/DiningSection'
import AdSlot from '@/components/AdSlot'
import Newsletter from '@/components/Newsletter'
import CitySubmissionBadge from '@/components/CitySubmissionBadge'
import AffiliateCTA from '@/components/AffiliateCTA'
import WorkforceSection from '@/components/WorkforceSection'

// CityCharts: client component with date range filter — wraps GasChart + RentChart
const CityCharts = dynamic(() => import('@/components/CityCharts'), {
  ssr: false,
  loading: () => <div className="card p-5 h-[300px] animate-pulse bg-surface2" />,
})

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCityDataServer(params.slug)
  if (!data) return {}
  const year = new Date().getFullYear()
  return {
    title: `Cost of Living in ${data.city}, ${data.state} (${year}) — Real Prices | RealInflation`,
    description: `Gas is $${data.gas.current.toFixed(2)}/gal, average rent is $${data.rent.avg_all.toLocaleString()}/mo in ${data.city}, ${data.state}. Real grocery prices, electricity costs, and car insurance vs. national averages.`,
    keywords: [
      `cost of living ${data.city}`,
      `${data.city} gas prices`,
      `${data.city} rent prices ${year}`,
      `${data.city} inflation`,
      `${data.city} ${data.state} cost of living`,
      `groceries ${data.city}`,
      `is ${data.city} expensive`,
      'real inflation tracker',
    ],
    openGraph: {
      title: `Cost of Living in ${data.city}, ${data.state} (${year}) — RealInflation`,
      description: `Gas $${data.gas.current.toFixed(2)}/gal · Rent $${data.rent.avg_all.toLocaleString()}/mo · Groceries +${data.groceries.inflation_rate.current_yoy}% YoY. Real prices, not government averages.`,
      url: `https://realinflation.co/city/${data.slug}/`,
      type: 'website',
      images: [{ url: '/og-default.png', width: 1200, height: 630, alt: `Cost of Living in ${data.city}, ${data.state}` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@realinflationco',
      title: `${data.city}, ${data.state} — Real Prices ${year}`,
      description: `Gas $${data.gas.current.toFixed(2)} · Rent $${data.rent.avg_all.toLocaleString()}/mo · Track real inflation at realinflation.co`,
    },
    alternates: {
      canonical: `https://realinflation.co/city/${data.slug}/`,
    },
  }
}

function JsonLd({ data }: { data: NonNullable<Awaited<ReturnType<typeof getCityDataServer>>> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Cost of Living in ${data.city}, ${data.state}`,
    description: `Real consumer prices in ${data.city}, ${data.state} including gas, rent, groceries, and dining.`,
    url: `https://realinflation.co/city/${data.slug}`,
    dateModified: data.last_updated,
    publisher: {
      '@type': 'Organization',
      name: 'RealInflation',
      url: 'https://realinflation.co',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function CityPage({ params }: Props) {
  const data = await getCityDataServer(params.slug)
  if (!data) notFound()

  // Same-state cities only (excluding current city)
  const stateCities = CITIES.filter(c => c.state_abbr === data.state_abbr && c.slug !== params.slug)
  const stateSlug = data.state.toLowerCase().replace(/\s+/g, '-')

  // Find 2022 baseline (Jan 2022) for change calculation
  const gas2000 = data.gas.history.find(h => h.date === '2000-01') ?? data.gas.history.find(h => h.date?.startsWith('2000')) ?? data.gas.history[0]
  const rent2000 = data.rent.history.find(h => h.date === '2000') ?? data.rent.history.find(h => h.date?.startsWith('2000')) ?? data.rent.history[0]
  const gasChange = (data.gas.current - gas2000.price) / gas2000.price
  const rentChange = (data.rent.avg_all - rent2000.avg) / rent2000.avg
  const groceryYoy = data.groceries.inflation_rate.current_yoy

  // SEO paragraph
  const seoText = `In ${data.city}, ${data.state}, a gallon of regular gas costs $${data.gas.current.toFixed(2)} as of ${data.last_updated} — ${
    data.gas.current > data.gas.national_current
      ? `$${(data.gas.current - data.gas.national_current).toFixed(2)} above the national average of $${data.gas.national_current.toFixed(2)}`
      : `$${(data.gas.national_current - data.gas.current).toFixed(2)} below the national average of $${data.gas.national_current.toFixed(2)}`
  }. The average monthly rent for all unit types is $${data.rent.avg_all.toLocaleString()}, compared to the national average of $${data.rent.national_avg.toLocaleString()}. Grocery inflation is running at ${data.groceries.inflation_rate.current_yoy}% year-over-year. Since 2022, bread prices have increased significantly while egg prices have been volatile due to avian flu outbreaks. ${data.city}'s cost-of-living index of ${data.col_index} puts it ${data.col_index > 100 ? 'above' : 'below'} the national average of 100.`

  return (
    <>
      <JsonLd data={data} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm font-sans text-text-muted mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-text-secondary">Home</Link>
          <span>/</span>
          <span className="text-text-primary">{data.city}, {data.state}</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="label-caps">Cost of Living</span>
            <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-0.5 rounded">
              Updated {data.last_updated}
            </span>
            <CitySubmissionBadge slug={params.slug} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-text-primary mb-3">
            {data.city}, {data.state}
          </h1>
          <p className="font-sans text-text-secondary text-lg leading-relaxed max-w-2xl">
            {seoText}
          </p>
        </div>

        {/* State breadcrumb + same-state cities */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-sm font-sans text-text-muted">
            <Link href="/states/" className="hover:text-accent">States</Link>
            <span>›</span>
            <Link href={`/state/${stateSlug}/`} className="hover:text-accent">{data.state}</Link>
            <span>›</span>
            <span className="text-text-primary">{data.city}</span>
          </div>
          {stateCities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stateCities.map(c => (
                <Link
                  key={c.slug}
                  href={`/city/${c.slug}/`}
                  className="text-xs font-sans px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stat cards */}
        <section className="mb-8">
          <h2 className="section-title mb-4">Key Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <StatCard
                label="Gas (Regular)"
                value={`$${data.gas.current.toFixed(2)}`}
                subvalue={`National: $${data.gas.national_current.toFixed(2)}`}
                change={gasChange}
                changeLabel="since 2000"
                stripe="red"
              />
              <div className="mt-1"><SourceBadge source="AAA Gas Prices" /></div>
            </div>
            <div>
              <StatCard
                label="Avg Rent (All)"
                value={`$${data.rent.avg_all.toLocaleString()}`}
                subvalue={`National: $${data.rent.national_avg.toLocaleString()}`}
                change={rentChange}
                changeLabel="since 2000"
                stripe="blue"
              />
              <div className="mt-1"><SourceBadge source={data.rent.source ?? 'Zillow ZORI'} /></div>
            </div>
            <div>
              <StatCard
                label="Grocery Inflation"
                value={`${groceryYoy}%`}
                subvalue="Year-over-year"
                stripe="green"
              />
              <div className="mt-1"><SourceBadge source="BLS/FRED CPI" /></div>
            </div>
            <div>
              <StatCard
                label="Fast Food Avg"
                value={`$${data.dining.fast_food_avg.toFixed(2)}`}
                subvalue="Combo meal"
                change={data.dining.restaurant_inflation_yoy / 100}
                changeLabel="YoY"
                stripe="orange"
              />
              <div className="mt-1"><SourceBadge source="Est. · Submit receipt →" verified={false} citySlug={params.slug} /></div>
            </div>
            <div>
              <StatCard
                label="Electricity"
                value={`${data.electricity?.cents_per_kwh ?? '—'}¢`}
                subvalue={`per kWh · ~$${data.electricity?.avg_monthly_bill ?? data.electricity?.monthly_avg_bill ?? '—'}/mo`}
                change={((data.electricity?.cents_per_kwh ?? 17.38) - (data.electricity?.national_avg_cents ?? 17.38)) / (data.electricity?.national_avg_cents ?? 17.38)}
                changeLabel="vs US avg"
                stripe="orange"
              />
              <div className="mt-1"><SourceBadge source="EIA Residential" /></div>
            </div>
            <div>
              <StatCard
                label="Car Insurance"
                value={`$${data.car_insurance?.monthly_avg?.toFixed(0) ?? '—'}/mo`}
                subvalue={`$${data.car_insurance?.annual_avg?.toLocaleString() ?? '—'}/yr`}
                change={((data.car_insurance?.annual_avg ?? 2150) - 2150) / 2150}
                changeLabel="vs national avg"
                stripe="red"
              />
              <div className="mt-1"><SourceBadge source="Bankrate/NAIC" /></div>
            </div>
            {data.income?.median_household && data.income.cost_burden && (
              <div>
                <StatCard
                  label="Median Household Income"
                  value={`$${data.income.median_household.toLocaleString()}`}
                  subvalue={`${data.income.cost_burden.burden_pct}% goes to essentials`}
                  change={-(data.income.cost_burden.burden_pct / 100)}
                  changeLabel="cost burden"
                  stripe="blue"
                />
                <div className="mt-1"><SourceBadge source="Census ACS 2023" /></div>
              </div>
            )}
          </div>
          {/* Insurance affiliate CTA */}
          <div className="mt-4">
            <AffiliateCTA
              type="insurance"
              city={data.city}
              state={data.state}
              value={`$${data.car_insurance?.annual_avg?.toLocaleString() ?? '2,150'}`}
            />
          </div>
        </section>

        {/* Help improve CTA */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-sans font-semibold text-amber-900 text-sm">📸 Help make this data more accurate</p>
            <p className="font-sans text-amber-700 text-xs mt-0.5">Some prices above are regional estimates. Submit a receipt from a local store to help us show what {data.city} residents actually pay.</p>
          </div>
          <Link href={`/submit/?city=${params.slug}`} className="shrink-0 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors">
            Submit a Receipt
          </Link>
        </div>

        <AdSlot id="city-ad-1" />

        {/* Charts row with date range filter */}
        <section className="mb-8">
          <CityCharts
            gasHistory={data.gas.history}
            rentHistory={data.rent.history}
            cityName={data.city}
          />
          {/* Gas affiliate CTA */}
          <div className="mt-4">
            <AffiliateCTA type="gas" city={data.city} state={data.state} />
          </div>
        </section>

        {/* Rent affiliate CTA */}
        <div className="mb-6">
          <AffiliateCTA type="rent" city={data.city} state={data.state} slug={params.slug} value={`$${data.rent.avg_all.toLocaleString()}`} />
        </div>

        {/* Grocery table */}
        <section className="mb-8">
          <h2 className="section-title mb-4">Grocery Prices</h2>
          <GroceryTable items={data.groceries.items} />
        </section>

        <AdSlot id="city-ad-2" />

        {/* Dining section */}
        <section className="mb-8">
          <h2 className="section-title mb-4">Dining & Restaurants</h2>
          <DiningSection
            fastFoodAvg={data.dining.fast_food_avg}
            casualDiningAvg={data.dining.casual_dining_avg}
            monthlySpend={data.dining.monthly_household_spend}
            inflationYoy={data.dining.restaurant_inflation_yoy}
            chains={data.dining.chains}
            cityName={data.city}
          />
        </section>

        {/* Rent affiliate */}
        <section className="mb-8 card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="label-caps mb-1">Looking for an Apartment in {data.city}?</p>
            <p className="text-sm font-sans text-text-secondary">
              Average 1BR: <span className="font-mono font-semibold text-text-primary">${data.rent.avg_1br.toLocaleString()}/mo</span> · 
              2BR: <span className="font-mono font-semibold text-text-primary">${data.rent.avg_2br.toLocaleString()}/mo</span>
            </p>
          </div>
          <a
            href={`https://www.apartments.com/${data.city.toLowerCase().replace(' ','-')}-id/`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary whitespace-nowrap"
          >
            Browse {data.city} Apartments →
          </a>
        </section>

        {/* Workforce section — shows when BLS QCEW data is available */}
        {data.workforce && (
          <WorkforceSection
            workforce={data.workforce}
            cityName={data.city}
            medianHouseholdIncome={data.income?.median_household}
          />
        )}

        <Newsletter />

        {/* Compare CTA */}
        <section className="text-center py-6">
          <p className="font-sans text-text-secondary mb-3">How does {data.city} compare to other {data.state} cities?</p>
          <Link href="/compare" className="btn-primary">Compare Cities Side by Side →</Link>
        </section>
      </div>
    </>
  )
}
