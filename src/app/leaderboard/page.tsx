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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface2">
                <th className="text-left label-caps px-4 py-3 w-12">#</th>
                <th className="text-left label-caps px-4 py-3">Contributor</th>
                <th className="text-right label-caps px-4 py-3">Submissions</th>
                <th className="text-right label-caps px-4 py-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((entry, idx) => {
                const isMe = entry.user_uuid === myUuid
                return (
                  <tr
                    key={entry.user_uuid}
                    className={`border-b border-border last:border-0 transition-colors ${
                      isMe ? 'bg-accent/5' : 'hover:bg-surface2'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">
                      {MEDALS[idx] ?? `#${idx + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-sm text-text-primary">
                        {anonymize(entry.user_uuid, entry.email)}
                        {isMe && <span className="ml-2 text-xs text-accent font-medium">← you</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-text-secondary">
                      {entry.submission_count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-accent">{entry.total_points}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-text-muted font-sans mt-6">
        Names anonymized. <Link href="/submit/" className="text-accent hover:underline">Submit prices</Link> to climb the board.
      </p>
    </div>
  )
}
