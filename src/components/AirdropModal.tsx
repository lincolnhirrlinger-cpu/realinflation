'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AirdropModalProps {
  userUuid: string
  totalPoints: number
  cityName: string
  onClose: () => void
}

export default function AirdropModal({ userUuid, totalPoints, cityName, onClose }: AirdropModalProps) {
  const [email, setEmail] = useState('')
  const [wallet, setWallet] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    // Save email + wallet to user_points row
    const { error: updateErr } = await supabase
      .from('user_points')
      .upsert({
        user_uuid: userUuid,
        email,
        wallet_address: wallet || null,
        email_verified: false,
      }, { onConflict: 'user_uuid' })

    if (updateErr) {
      setStatus('error')
      setErrorMsg(updateErr.message)
      return
    }

    // Send magic link via Supabase Auth
    const { error: authErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `https://www.realinflation.co/submit/`,
        data: { user_uuid: userUuid },
      },
    })

    if (authErr) {
      setStatus('error')
      setErrorMsg(authErr.message)
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="font-serif text-2xl text-text-primary mb-2">Check your email</h2>
          <p className="font-sans text-text-secondary mb-6">
            We sent a magic link to <strong>{email}</strong>. Click it to verify and lock in your airdrop spot.
          </p>
          <p className="font-sans text-sm text-text-muted mb-6">
            Your <strong className="text-accent font-mono">{totalPoints} pts</strong> from {cityName} are saved.
          </p>
          <button onClick={onClose} className="btn-secondary w-full">Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-3xl mb-2">🪂</div>
            <h2 className="font-serif text-2xl text-text-primary">Secure your airdrop spot</h2>
            <p className="font-sans text-sm text-text-secondary mt-1">
              Early contributors get priority for the RealInflation token launch.
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary text-xl leading-none mt-1">✕</button>
        </div>

        {/* Points badge */}
        <div className="flex items-center gap-3 bg-accent/8 border border-accent/20 rounded-xl px-4 py-3 mb-6">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-mono font-bold text-accent">{totalPoints} points earned</p>
            <p className="font-sans text-xs text-text-muted">Points = airdrop allocation weight</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="label-caps block mb-1.5">Email <span className="text-accent normal-case font-sans font-normal">*required</span></label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-border bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          {/* Wallet */}
          <div>
            <label className="label-caps block mb-1.5">
              Wallet address <span className="text-text-muted normal-case font-sans font-normal">(optional — add later)</span>
            </label>
            <input
              type="text"
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              placeholder="0x... or base address"
              className="w-full px-4 py-3 rounded-lg border border-border bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <p className="text-xs text-text-muted font-sans mt-1">Base network (EVM-compatible). You can add this later.</p>
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-sans">
              {errorMsg || 'Something went wrong. Please try again.'}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-accent text-white font-semibold font-sans py-3 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Sending link...' : 'Send magic link →'}
          </button>

          <button type="button" onClick={onClose} className="w-full text-sm text-text-muted font-sans hover:text-text-secondary transition-colors py-1">
            Skip for now — I'll do this later
          </button>
        </form>
      </div>
    </div>
  )
}
