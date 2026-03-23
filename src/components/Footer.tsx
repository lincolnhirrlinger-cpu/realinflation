'use client'
import Link from 'next/link'

const cities = [
  { name: 'Boise', slug: 'boise-id' },
  { name: 'Nampa', slug: 'nampa-id' },
  { name: 'Meridian', slug: 'meridian-id' },
  { name: 'Idaho Falls', slug: 'idaho-falls-id' },
  { name: 'Pocatello', slug: 'pocatello-id' },
  { name: 'Rexburg', slug: 'rexburg-id' },
  { name: 'Twin Falls', slug: 'twin-falls-id' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-lg text-text-primary">
              Real<span className="text-accent">Inflation</span>
            </Link>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              The government says inflation is 2.4%.<br />
              Here is what you are actually paying.
            </p>
          </div>

          {/* Cities */}
          <div>
            <h4 className="label-caps mb-3">Idaho Cities</h4>
            <ul className="space-y-1.5">
              {cities.map(c => (
                <li key={c.slug}>
                  <Link href={`/city/${c.slug}`} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="label-caps mb-3">Resources</h4>
            <ul className="space-y-1.5">
              <li><Link href="/compare" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Compare Cities</Link></li>
              <li><Link href="/methodology" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Methodology</Link></li>
              <li><a href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">FRED Data</a></li>
              <li><a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Zillow Research</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="label-caps mb-3">Stay Updated</h4>
            <p className="text-sm text-text-secondary mb-3">Monthly price updates, no spam.</p>
            <form className="flex flex-col gap-2" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@example.com"
                className="text-sm border border-border rounded-lg px-3 py-2 bg-cream focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <button type="submit" className="btn-primary text-xs py-2">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} RealInflation. Data updated monthly. Not financial advice.
          </p>
          <div className="flex gap-4">
            <Link href="/methodology" className="text-xs text-text-muted hover:text-text-secondary">Sources</Link>
            <span className="text-xs text-text-muted">Made in Idaho</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
