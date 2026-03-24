'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCitySubmissionCount } from '@/lib/supabase'

export default function CitySubmissionBadge({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    getCitySubmissionCount(slug).then(setCount)
  }, [slug])

  if (count === null) return null
  if (count === 0) return (
    <Link href={`/submit/?city=${slug}`} className="text-xs font-sans text-text-muted hover:text-accent transition-colors">
      + Be first to submit a price
    </Link>
  )
  return (
    <Link href={`/submit/?city=${slug}`} className="text-xs font-mono bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded hover:bg-green-100 transition-colors">
      👥 {count} community {count === 1 ? 'price' : 'prices'} submitted
    </Link>
  )
}
