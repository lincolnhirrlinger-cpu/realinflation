import Link from 'next/link'

interface Props {
  type: 'insurance' | 'rent' | 'gas' | 'moving'
  city: string
  state: string
  slug?: string
  value?: string // e.g. "$2,150/yr avg" for insurance
}

// City-slug overrides — direct links to Goldstone properties or local partners
const CITY_RENT_OVERRIDES: Record<string, { links: Array<{ name: string; href: string }>; badge: string }> = {
  'rexburg-id': {
    links: [
      { name: 'Savoye Apartments', href: 'https://www.savoyeapartments.com' },
      { name: 'Teton River Townhomes', href: 'https://www.tetonrivertownhomes.com' },
    ],
    badge: 'Local · GoldStone',
  },
}

const AFFILIATES = {
  insurance: {
    label: 'Car Insurance',
    headline: (city: string, val?: string) =>
      val ? `Avg ${val} in ${city}. Compare rates:` : `Compare car insurance rates in ${city}:`,
    cta: 'Get free quotes →',
    href: 'https://www.everquote.com/?utm_source=realinflation&utm_medium=city_page',
    badge: 'Free · No spam',
    icon: '🚗',
    color: 'blue',
  },
  rent: {
    label: 'Find Apartments',
    headline: (city: string, val?: string) =>
      val ? `Avg rent ${val}/mo in ${city}. Browse listings:` : `Find apartments in ${city}:`,
    cta: 'Browse listings →',
    href: 'https://www.apartments.com/?utm_source=realinflation',
    badge: 'Verified listings',
    icon: '🏠',
    color: 'green',
  },
  gas: {
    label: 'Save on Gas',
    headline: (city: string) => `Find the cheapest gas near ${city}:`,
    cta: 'Find cheap gas →',
    href: 'https://www.gasbuddy.com/?utm_source=realinflation',
    badge: 'Real-time prices',
    icon: '⛽',
    color: 'yellow',
  },
  moving: {
    label: 'Moving to this city?',
    headline: (city: string) => `Get moving quotes for ${city}:`,
    cta: 'Compare movers →',
    href: 'https://www.moving.com/?utm_source=realinflation',
    badge: 'Free estimates',
    icon: '📦',
    color: 'purple',
  },
}

const COLOR_MAP = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  yellow: 'bg-amber-50 border-amber-200 text-amber-900',
  purple: 'bg-purple-50 border-purple-200 text-purple-900',
}

export default function AffiliateCTA({ type, city, state, slug, value }: Props) {
  const aff = AFFILIATES[type]
  const colorClass = COLOR_MAP[aff.color as keyof typeof COLOR_MAP]

  // Rexburg (and future city overrides) get local property links for rent
  if (type === 'rent' && slug && CITY_RENT_OVERRIDES[slug]) {
    const override = CITY_RENT_OVERRIDES[slug]
    return (
      <div className={`rounded-xl border px-4 py-3 ${colorClass}`}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl mt-0.5">{aff.icon}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-0.5">{aff.label}</p>
            <p className="text-sm font-sans leading-snug">{aff.headline(city, value)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {override.links.map(link => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold font-sans bg-white/70 border border-current/20 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
            >
              🏡 {link.name} →
            </a>
          ))}
          <span className="self-center text-xs opacity-50 ml-1">{override.badge}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-4 ${colorClass}`}>
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-xl mt-0.5 shrink-0">{aff.icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-0.5">{aff.label}</p>
          <p className="text-sm font-sans leading-snug">{aff.headline(city, value)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <a
          href={aff.href}
          target="_blank"
          rel="noopener sponsored"
          className="text-sm font-semibold font-sans whitespace-nowrap hover:underline"
        >
          {aff.cta}
        </a>
        <span className="text-xs opacity-50">{aff.badge}</span>
      </div>
    </div>
  )
}
