import Link from 'next/link'

export default function SourceBadge({ source, verified = true, citySlug }: { source: string; verified?: boolean; citySlug?: string }) {
  const className = `inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
    verified
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-amber-50 border-amber-200 text-amber-700"
  }`

  if (!verified && citySlug) {
    const parts = source.split('Submit receipt →')
    if (parts.length === 2) {
      return (
        <span className={className}>
          ~ {parts[0]}
          <Link href={`/submit/?city=${citySlug}`} className="underline hover:text-amber-900">
            Submit receipt →
          </Link>
        </span>
      )
    }
  }

  return (
    <span className={className}>
      {verified ? "✓" : "~"} {source}
    </span>
  )
}
