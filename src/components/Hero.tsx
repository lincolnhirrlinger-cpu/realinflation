import CitySearch from './CitySearch'
import Link from 'next/link'

const QUICK_CITIES = [
  { name: 'Boise', slug: 'boise-id' },
  { name: 'Meridian', slug: 'meridian-id' },
  { name: 'Idaho Falls', slug: 'idaho-falls-id' },
  { name: 'Twin Falls', slug: 'twin-falls-id' },
]

export default function Hero() {
  return (
    <section className="pt-12 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-mono font-semibold mb-6">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          Updated March 2026
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-text-primary leading-tight mb-4">
          The government says inflation<br />
          <span className="text-accent italic">is 2.4%.</span>
        </h1>
        <p className="font-serif text-2xl sm:text-3xl text-text-secondary italic mb-8">
          Here is what you are actually paying.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-6">
          <CitySearch placeholder="Search your city..." size="lg" />
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-sm text-text-muted font-sans mr-1">Quick:</span>
          {QUICK_CITIES.map(c => (
            <Link
              key={c.slug}
              href={`/city/${c.slug}`}
              className="text-sm text-text-secondary hover:text-accent font-sans underline underline-offset-2 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
