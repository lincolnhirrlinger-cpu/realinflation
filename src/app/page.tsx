import type { Metadata } from 'next'
import Link from 'next/link'
import Hero from '@/components/Hero'
import StatCard from '@/components/StatCard'
import Newsletter from '@/components/Newsletter'
import AdSlot from '@/components/AdSlot'

export const metadata: Metadata = {
  title: 'RealInflation — What Things Actually Cost in Your City',
  description: 'Track real consumer prices for gas, rent, groceries, and fast food across Idaho cities vs. government CPI. Updated monthly.',
}

const CITIES = [
  { name: 'Boise', slug: 'boise-id', gasPrice: 4.04, rentAvg: 1523, groceryYoy: 2.4, colIndex: 102 },
  { name: 'Meridian', slug: 'meridian-id', gasPrice: 4.09, rentAvg: 1689, groceryYoy: 2.6, colIndex: 108 },
  { name: 'Nampa', slug: 'nampa-id', gasPrice: 3.97, rentAvg: 1289, groceryYoy: 2.2, colIndex: 94 },
  { name: 'Idaho Falls', slug: 'idaho-falls-id', gasPrice: 3.85, rentAvg: 1098, groceryYoy: 2.0, colIndex: 90 },
  { name: 'Twin Falls', slug: 'twin-falls-id', gasPrice: 3.82, rentAvg: 1045, groceryYoy: 2.1, colIndex: 88 },
  { name: 'Pocatello', slug: 'pocatello-id', gasPrice: 3.79, rentAvg: 978, groceryYoy: 1.9, colIndex: 87 },
  { name: 'Rexburg', slug: 'rexburg-id', gasPrice: 3.72, rentAvg: 845, groceryYoy: 1.7, colIndex: 82 },
]

const NATIONAL_STATS = {
  cpiYoy: 2.4,
  gasNational: 3.88,
  rentNational: 1900,
  breadChange: 0.582,
  beefChange: 0.363,
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <Hero />

      {/* National headline stats */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="section-title">National Snapshot</h2>
          <span className="text-xs text-text-muted font-mono">March 2026</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Official CPI (YoY)"
            value="2.4%"
            subvalue="All items, seasonally adj."
            stripe="blue"
          />
          <StatCard
            label="Avg Gas Price"
            value="$3.88"
            subvalue="Regular unleaded"
            change={-0.095}
            changeLabel="vs. 2022 peak"
            stripe="red"
          />
          <StatCard
            label="Avg Rent"
            value="$1,900"
            subvalue="All units, national"
            change={0.086}
            changeLabel="since 2022"
            stripe="blue"
          />
          <StatCard
            label="Bread Price"
            value="$3.78"
            subvalue="Per 1 lb loaf"
            change={0.582}
            changeLabel="since 2022"
            stripe="red"
          />
        </div>
      </section>

      {/* The headline context */}
      <section className="mb-12 bg-white border border-border rounded-card p-6 md:p-8 stat-stripe-red">
        <div className="max-w-2xl">
          <p className="label-caps mb-3">The Real Story</p>
          <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-4">
            CPI says +2.4%. Your grocery bill says otherwise.
          </h2>
          <p className="font-sans text-base text-text-secondary leading-relaxed mb-4">
            Ground beef is up <strong className="text-accent font-mono">+38.7%</strong> since 2022. 
            Bread is up <strong className="text-accent font-mono">+58.2%</strong>. Fast food has jumped 
            <strong className="text-accent font-mono"> +33%</strong> since pre-pandemic. 
            The headline CPI smooths over what you actually feel at the register.
          </p>
          <p className="font-sans text-sm text-text-secondary leading-relaxed">
            We track prices by city so you can see exactly how your local market compares — 
            not the national average politicians quote on TV.
          </p>
        </div>
      </section>

      <AdSlot id="home-ad-1" />

      {/* City grid */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="section-title">Idaho Cities</h2>
          <Link href="/compare" className="text-sm text-accent hover:underline font-sans">
            Compare cities →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.map(city => (
            <Link
              key={city.slug}
              href={`/city/${city.slug}`}
              className="card p-5 hover:shadow-card-hover group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-sans font-semibold text-text-primary text-base group-hover:text-accent transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-xs text-text-muted font-sans">Idaho</p>
                </div>
                <span className="text-xs font-mono bg-cream px-2 py-0.5 rounded text-text-secondary border border-border">
                  COL {city.colIndex}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs label-caps mb-1">Gas</p>
                  <p className="font-mono font-bold text-sm text-text-primary">${city.gasPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs label-caps mb-1">Rent</p>
                  <p className="font-mono font-bold text-sm text-text-primary">${city.rentAvg.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs label-caps mb-1">Food ↑</p>
                  <p className="font-mono font-bold text-sm text-accent">+{city.groceryYoy}%</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Notable movers */}
      <section className="mb-12">
        <h2 className="section-title mb-4">Biggest Movers Since 2022</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Bread (1 lb)" value="$3.45" change={0.582} changeLabel="Boise" stripe="red" />
          <StatCard label="Ground Beef (lb)" value="$5.48" change={0.387} changeLabel="Boise" stripe="red" />
          <StatCard label="Fast Food Meal" value="$13.50" change={0.435} changeLabel="Wendys" stripe="orange" />
          <StatCard label="Meridian Rent" value="$1,689" change={0.118} changeLabel="since 2022" stripe="blue" />
        </div>
      </section>

      <Newsletter />

      <AdSlot id="home-ad-2" />
    </div>
  )
}
