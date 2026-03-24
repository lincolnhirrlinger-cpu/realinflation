'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserPoints } from '@/lib/supabase'

export default function PointsCounter() {
  const [points, setPoints] = useState<number | null>(null)

  useEffect(() => {
    const uuid = localStorage.getItem('ri_user_uuid')
    if (!uuid) return
    getUserPoints(uuid).then(p => { if (p > 0) setPoints(p) })
  }, [])

  if (!points) return null

  return (
    <Link
      href="/leaderboard/"
      className="hidden md:flex items-center gap-1.5 text-xs font-mono text-accent bg-accent/8 border border-accent/20 px-2 py-1 rounded-lg hover:bg-accent/15 transition-colors"
    >
      🏆 {points} pts
    </Link>
  )
}
