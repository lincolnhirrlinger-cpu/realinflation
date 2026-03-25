'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface LeaderEntry {
  user_uuid: string
  total_points: number
  submission_count: number
  last_submission: string | null
  email: string | null
}

const MEDALS = ['🥇', '🥈', '🥉']

function anonymize(uuid: string, email: string | null): string {
  if (email) {
    const [local] = email.split('@')
    return local.slice(0, 3) + '***'
  }
  return 'User ' + uuid.slice(0, 6).toUpperCase()
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [myUuid] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('ri_user_uuid') ?? '' : ''
  )
  const [myPoints, setMyPoints] = useState<number | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('user_points')
        .select('user_uuid, total_points, submission_count, last_submission, email')
        .order('total_points', { ascending: false })
        .limit(50)

      if (data) {
        setLeaders(data)
        const myIdx = data.findIndex(r => r.user_uuid === myUuid)
        if (myIdx >= 0) {
          setMyPoints(data[myIdx].total_points)
          setMyRank(myIdx + 1)
        }
      }
      setLoading(false)
    }
    load()
  }, [myUuid])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-text-muted hover:text-accent font-sans">← Back to RealInflation</Link>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-text-primary mb-2">Leaderboard</h1>
        <p className="font-sans text-text-secondary">
          Top contributors helping track real prices across America. Points = airdrop allocation weight.
        </p>
      </div>

      {/* Your rank */}
      {myPoints !== null && myRank !== null && (
        <div className="card p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-sans text-sm text-text-muted">Your rank</p>
              <p className="font-mono font-bold text-text-primary">#{myRank} · {myPoints} pts</p>
            </div>
          </div>
          <Link href="/submit/" className="btn-primary text-sm">Submit more →</Link>
        </div>
      )}

      {!myPoints && (
        <div className="card p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-sans text-sm text-text-secondary">You haven't submitted yet.</p>
            <p className="font-sans text-xs text-text-muted">Each submission earns 10 points toward the airdrop.</p>
          </div>
          <Link href="/submit/" className="btn-primary text-sm">Start submitting →</Link>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse font-sans text-text-muted">Loading leaderboard...</div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-sans text-text-muted">No submissions yet — be the first!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leaders.map((entry, idx) => {
              const isMe = entry.user_uuid === myUuid
              return (
                <div
                  key={entry.user_uuid}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isMe ? 'bg-accent/5' : 'hover:bg-surface2'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 font-mono text-sm text-text-muted text-center">
                    {MEDALS[idx] ?? `#${idx + 1}`}
                  </div>
                  {/* Name + submissions */}
                  <div className="flex-1 min-w-0">
                    <span className="font-sans text-sm text-text-primary">
                      {anonymize(entry.user_uuid, entry.email)}
                    </span>
                    {isMe && <span className="ml-2 text-xs text-accent font-medium">← you</span>}
                    <p className="text-xs text-text-muted font-sans mt-0.5">
                      {entry.submission_count} submission{entry.submission_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Points */}
                  <div className="shrink-0 text-right">
                    <span className="font-mono font-bold text-accent text-base">{entry.total_points}</span>
                    <p className="text-xs text-text-muted font-sans">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-text-muted font-sans mt-6">
        Names anonymized. <Link href="/submit/" className="text-accent hover:underline">Submit prices</Link> to climb the board.
      </p>
    </div>
  )
}
