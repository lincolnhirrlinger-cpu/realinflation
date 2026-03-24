import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import StatCard from '@/components/StatCard'
import Newsletter from '@/components/Newsletter'
import AdSlot from '@/components/AdSlot'
import { getCitiesServer } from '@/lib/data.server'

export const metadata: Metadata = {
  title: 'RealInflation — What Things Actually Cost Across America',
  description: 'Track real consumer prices for gas, rent, groceries, and dining across 115 US cities vs. government CPI. See what inflation really looks like in your city.',
  keywords: ['real inflation', 'cost of living', 'gas prices by city', 'rent prices 2025', 'grocery inflation', 'CPI vs real prices', 'inflation tracker', 'consumer price index'],
  openGraph: {
    title: 'RealInflation — What Things Actually Cost Across America',
    description: 'Gas, rent, groceries, and more — tracked city by city. The government says 2.4%. See what you\'re actually paying.',
    url: 'https://realinflation.co',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@realinflationco',
  },
  alternates: { canonical: 'https://realinflation.co' },
}

function HomeJsonLd() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RealInflation',
      url: 'https://realinflation.co',
      description: 'Real consumer price tracker across 115 US cities',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://realinflation.co/city/{slug}/' },
        'query-input': 'required name=slug',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How much is gas in the US right now?',
          acceptedAnswer: { '@type': 'Answer', text: 'The national average gas price is around $3.98/gallon in 2026, but varies significantly by city. California cities like San Francisco pay $5.82, while Midwest cities like Kansas City pay closer to $2.90.' },
        },
        {
          '@type': 'Question',
          name: 'What is the average rent in the US?',
          acceptedAnswer: { '@type': 'Answer', text: 'The national average rent for a 1-bedroom apartment is approximately $1,500-$1,700/month in 2025. NYC and SF average $3,000+, while Midwest cities average $900-$1,100.' },
        },
        {
          '@type': 'Question',
          name: 'How much has grocery inflation been?',
          acceptedAnswer: { '@type': 'Answer', text: 'According to BLS data, grocery prices are up 2.6% year-over-year as of 2025, but specific items have risen far more. Eggs are up ~30%, ground beef up ~48%, and bread up ~19% since January 2022.' },
        },
        {
          '@type': 'Question',
          name: 'Is the official CPI accurate?',
          acceptedAnswer: { '@type': 'Answer', text: 'The CPI measures a broad basket of goods, but individual categories like rent, gas, and groceries have often risen faster than the overall headline number. RealInflation tracks these specific categories city-by-city so you can see what you\'re actually paying.' },
        },
      ],
    },
  ]
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

// Map is client-only (uses browser APIs for hover/routing)
const USAMap = dynamic(() => import('@/components/USAMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[1.8/1] bg-card rounded-xl border border-border animate-pulse flex items-center justify-center">
      <p className="text-xs text-text-muted font-mono">Loading map...</p>
    </div>
  ),
})

export default async function HomePage() {
  const cities = await getCitiesServer()

  // Build state-level aggregates from city data
  const stateMap: Record<string, {
    name: string; abbr: string; slug: string;
    gasVals: number[]; rentVals: number[]; groceryVals: number[]; colVals: number[]
  }> = {}

  for (const c of cities) {
    const abbr = c.state_abbr
    if (!abbr) continue
    if (!stateMap[abbr]) {
      stateMap[abbr] = {
        name: c.state,
        abbr,
        slug: c.state.toLowerCase().replace(/\s+/g, '-'),
        gasVals: [], rentVals: [], groceryVals: [], colVals: [],
      }
    }
    // Use cities.json col_index; gas + rent from data files would require loading all — use estimates
    stateMap[abbr].colVals.push(c.col_index ?? 100)
  }

  // Merge with known state gas prices (from AAA fetch) stored in city data
  // We'll use col_index from cities.json as the primary state metric
  // For gas/rent/grocery we use reasonable regional estimates per state
  const STATE_GAS: Record<string, number> = {
    AL:3.62,AK:3.95,AZ:3.93,AR:3.40,CA:5.79,CO:3.93,CT:3.88,DE:3.79,FL:3.93,
    GA:3.67,HI:5.23,ID:4.11,IL:3.85,IN:3.55,IA:3.35,KS:3.22,KY:3.49,LA:3.41,
    ME:3.64,MD:3.73,MA:3.83,MI:3.62,MN:3.39,MS:3.35,MO:3.32,MT:3.72,NE:3.28,
    NV:4.26,NH:3.36,NJ:3.41,NM:3.51,NY:3.86,NC:3.52,ND:3.25,OH:3.62,OK:3.22,
    OR:3.97,PA:3.99,RI:3.65,SC:3.52,SD:3.32,TN:3.52,TX:3.62,UT:3.85,VT:3.64,
    VA:3.59,WA:4.63,WV:3.49,WI:3.49,WY:3.75,DC:4.10,
  }
  const STATE_RENT: Record<string, number> = {
    AL:1050,AK:1400,AZ:1450,AR:900,CA:2300,CO:1700,CT:1650,DE:1450,FL:1750,
    GA:1450,HI:2100,ID:1250,IL:1350,IN:1050,IA:950,KS:950,KY:1000,LA:1100,
    ME:1300,MD:1900,MA:2200,MI:1150,MN:1300,MS:900,MO:1050,MT:1300,NE:1050,
    NV:1500,NH:1600,NJ:2100,NM:1100,NY:2400,NC:1350,ND:950,OH:1100,OK:950,
    OR:1650,PA:1400,RI:1600,SC:1300,SD:950,TN:1350,TX:1400,UT:1500,VT:1400,
    VA:1700,WA:1900,WV:900,WI:1050,WY:1100,DC:2500,
  }
  const STATE_GROCERY: Record<string, number> = {
    AL:2.1,AK:4.2,AZ:2.8,AR:2.0,CA:3.5,CO:2.9,CT:3.1,DE:2.7,FL:2.9,
    GA:2.4,HI:4.5,ID:2.2,IL:2.8,IN:2.3,IA:2.1,KS:2.0,KY:2.2,LA:2.3,
    ME:2.8,MD:3.0,MA:3.3,MI:2.5,MN:2.4,MS:2.0,MO:2.1,MT:2.5,NE:2.1,
    NV:2.7,NH:2.8,NJ:3.1,NM:2.4,NY:3.4,NC:2.4,ND:2.0,OH:2.4,OK:2.0,
    OR:3.0,PA:2.6,RI:3.0,SC:2.3,SD:2.0,TN:2.3,TX:2.4,UT:2.6,VT:2.7,
    VA:2.8,WA:3.3,WV:2.1,WI:2.3,WY:2.4,DC:3.8,
  }

  const mapStates = Object.values(stateMap).map(s => ({
    name: s.name,
    abbr: s.abbr,
    slug: s.slug,
    gas: STATE_GAS[s.abbr] ?? 3.50,
    rent: STATE_RENT[s.abbr] ?? 1200,
    grocery: STATE_GROCERY[s.abbr] ?? 2.5,
    col: Math.round(s.colVals.reduce((a,b)=>a+b,0) / Math.max(s.colVals.length,1)),
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <HomeJsonLd />
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
            value="$3.98"
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
            We track real prices by city so you can see exactly how your local market compares —
            not the national average politicians quote on TV.
          </p>
        </div>
      </section>

      {/* Interactive USA Map */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="section-title">Inflation by State</h2>
          <Link href="/states/" className="text-sm text-accent hover:underline font-sans">
            Browse all states →
          </Link>
        </div>
        <USAMap states={mapStates} />
      </section>

      <AdSlot id="home-ad-1" />

      {/* Notable movers */}
      <section className="mb-12">
        <h2 className="section-title mb-4">Biggest Movers Since 2022</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Bread (1 lb)" value="$3.45" change={0.582} changeLabel="national" stripe="red" />
          <StatCard label="Ground Beef (lb)" value="$5.48" change={0.387} changeLabel="national" stripe="red" />
          <StatCard label="Fast Food Meal" value="$13.50" change={0.435} changeLabel="avg combo" stripe="orange" />
          <StatCard label="Avg US Rent" value="$1,895" change={0.118} changeLabel="since 2022" stripe="blue" />
        </div>
      </section>

      {/* Trending cities — real ZORI data */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="section-title">🔥 Trending Right Now</h2>
          <Link href="/leaderboard/" className="text-sm text-accent hover:underline font-sans">Leaderboard →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { city: 'Austin, TX', slug: 'austin-tx', trend: 'Rent down -2.4% YoY — one of few cities where rent is falling', emoji: '📉', good: true },
            { city: 'San Francisco, CA', slug: 'san-francisco-ca', trend: 'Rent up +6.3% YoY — highest increase of any major metro', emoji: '📈', good: false },
            { city: 'Miami, FL', slug: 'miami-fl', trend: 'Insurance $3,180/yr — highest in the US', emoji: '🚗', good: false },
            { city: 'Boise, ID', slug: 'boise-id', trend: 'Gas $4.11/gal — above national avg despite cheap electricity', emoji: '⛽', good: false },
            { city: 'Houston, TX', slug: 'houston-tx', trend: 'No state income tax + rent flat YoY — one of the best value metros', emoji: '💰', good: true },
            { city: 'New York, NY', slug: 'new-york-ny', trend: 'Avg rent $3,258/mo — 72% above national average', emoji: '🏙️', good: false },
          ].map(item => (
            <Link
              key={item.slug}
              href={`/city/${item.slug}/`}
              className="card p-4 hover:border-accent transition-colors group"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl">{item.emoji}</span>
                <span className="font-sans font-semibold text-text-primary text-sm group-hover:text-accent transition-colors">{item.city}</span>
              </div>
              <p className="font-sans text-xs text-text-secondary leading-relaxed">{item.trend}</p>
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />

      <AdSlot id="home-ad-2" />
    </div>
  )
}
