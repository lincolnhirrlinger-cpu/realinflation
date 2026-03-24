'use client'
import Link from 'next/link'

const cities = [
  { name: 'New York', slug: 'new-york-ny' },
  { name: 'Los Angeles', slug: 'los-angeles-ca' },
  { name: 'Chicago', slug: 'chicago-il' },
  { name: 'Houston', slug: 'houston-tx' },
  { name: 'Miami', slug: 'miami-fl' },
  { name: 'Seattle', slug: 'seattle-wa' },
  { name: 'Boise', slug: 'boise-id' },
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
            {/* Social links */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://x.com/realinflationco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                aria-label="Follow on X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                @realinflationco
              </a>
              <a
                href="https://realinflation.co/submit/"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                Submit prices
              </a>
            </div>
          </div>

          {/* Cities */}
          <div>
            <h4 className="label-caps mb-3">Popular Cities</h4>
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
          <div className="flex items-center gap-4">
            <a href="https://x.com/realinflationco" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </a>
            <Link href="/methodology/" className="text-xs text-text-muted hover:text-text-secondary">Sources</Link>
            <Link href="/leaderboard/" className="text-xs text-text-muted hover:text-text-secondary">Leaderboard</Link>
            <span className="text-xs text-text-muted">Made in Idaho 🥔</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
