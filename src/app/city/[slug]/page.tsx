import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getCityDataServer } from '@/lib/data.server'
import { CITIES, getAllSlugs } from '@/lib/cities'
import StatCard from '@/components/StatCard'
import GroceryTable from '@/components/GroceryTable'
import DiningSection from '@/components/DiningSection'
import AdSlot from '@/components/AdSlot'
import Newsletter from '@/components/Newsletter'

// Load charts client-side only — Recharts uses browser APIs (window/ResizeObserver)
const GasChart = dynamic(() => import('@/components/GasChart'), {
  ssr: false,
  loading: () => <div className="card p-5 h-[300px] animate-pulse bg-surface2" />,
})
const RentChart = dynamic(() => import('@/components/RentChart'), {
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
    description: `Gas is $${data.gas.current.toFixed(2)}/gal, average rent is $${data.rent.avg_all.toLocaleString()}/mo in ${data.city}, ${data.state}. Track real inflation vs. CPI with monthly price data.`,
    openGraph: {
      title: `Cost of Living in ${data.city}, ${data.state} — RealInflation`,
      description: `Gas $${data.gas.current.toFixed(2)} · Rent $${data.rent.avg_all.toLocaleString()}/mo · Groceries up ${(data.groceries.inflation_rate.current_yoy)}% YoY`,
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

  const gasChange = (data.gas.current - data.gas.history[0].price) / data.gas.history[0].price
  const rentChange = (data.rent.avg_all - data.rent.history[0].avg) / data.rent.history[0].avg
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
          <div className="flex items-center gap-3 mb-2">
            <span className="label-caps">Cost of Living</span>
            <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-0.5 rounded">
              Updated {data.last_updated}
            </span>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Gas (Regular)"
              value={`$${data.gas.current.toFixed(2)}`}
              subvalue={`National: $${data.gas.national_current.toFixed(2)}`}
              change={gasChange}
              changeLabel="vs. 2022"
              stripe="red"
            />
            <StatCard
              label="Avg Rent (All)"
              value={`$${data.rent.avg_all.toLocaleString()}`}
              subvalue={`National: $${data.rent.national_avg.toLocaleString()}`}
              change={rentChange}
              changeLabel="vs. 2022"
              stripe="blue"
            />
            <StatCard
              label="Grocery Inflation"
              value={`${groceryYoy}%`}
              subvalue="Year-over-year"
              stripe="green"
            />
            <StatCard
              label="Fast Food Avg"
              value={`$${data.dining.fast_food_avg.toFixed(2)}`}
              subvalue="Combo meal"
              change={data.dining.restaurant_inflation_yoy / 100}
              changeLabel="YoY"
              stripe="orange"
            />
          </div>
        </section>

        <AdSlot id="city-ad-1" />

        {/* Charts row */}
        <section className="mb-8">
          <h2 className="section-title mb-4">Price History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GasChart history={data.gas.history} cityName={data.city} />
            <RentChart history={data.rent.history} cityName={data.city} />
          </div>
          {/* Gas affiliate CTA */}
          <div className="mt-3 text-xs text-text-muted font-sans">
            Spending too much on gas?{' '}
            <a href="https://creditcards.com/gas/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              A gas rewards card can save you 3–5% back on every fill-up →
            </a>
          </div>
        </section>

        {/* Grocery table */}
        <section className="mb-8">
          <h2 className="section-title mb-4">Grocery Prices</h2>
          <GroceryTable items={data.groceries.items} />
          <div className="mt-3 text-xs text-text-muted font-sans">
            Save on groceries?{' '}
            <a href="https://home.ibotta.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Ibotta gives cash back on everyday groceries →
            </a>
          </div>
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
