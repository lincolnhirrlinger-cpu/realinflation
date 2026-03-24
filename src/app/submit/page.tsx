'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { submitPrice, getUserPoints } from '@/lib/supabase'
import { Suspense } from 'react'

const CATEGORIES = ['Gas', 'Groceries', 'Dining', 'Rent', 'Electricity', 'Other']

function getOrCreateUUID(): string {
  if (typeof window === 'undefined') return ''
  let uuid = localStorage.getItem('ri_user_uuid')
  if (!uuid) {
    uuid = crypto.randomUUID()
    localStorage.setItem('ri_user_uuid', uuid)
  }
  return uuid
}

function SubmitForm() {
  const searchParams = useSearchParams()
  const [cities, setCities] = useState<{ name: string; slug: string; state: string }[]>([])
  const [citySlug, setCitySlug] = useState(searchParams.get('city') ?? '')
  const [category, setCategory] = useState('Groceries')
  const [store, setStore] = useState('')
  const [item, setItem] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [pointsEarned, setPointsEarned] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/data/cities.json')
      .then(r => r.json())
      .then(data => setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
    const uuid = getOrCreateUUID()
    if (uuid) getUserPoints(uuid).then(setTotalPoints)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!citySlug || !price) return
    setStatus('loading')
    const uuid = getOrCreateUUID()
    const result = await submitPrice({
      city_slug: citySlug,
      category: category.toLowerCase(),
      store: store || undefined,
      item: item || undefined,
      price: parseFloat(price),
      submitted_date: date,
      user_uuid: uuid,
    })
    if (result.error) {
      setStatus('error')
      setErrorMsg(result.error)
    } else {
      setPointsEarned(result.points)
      setTotalPoints(p => p + result.points)
      // Also store in localStorage as fallback
      const stored = JSON.parse(localStorage.getItem('ri_submissions') ?? '[]')
      stored.push({ citySlug, category, store, item, price, date, ts: Date.now() })
      localStorage.setItem('ri_submissions', JSON.stringify(stored))
      localStorage.setItem('ri_points', String(totalPoints + result.points))
      setStatus('success')
    }
  }

  // Group cities by state for select
  const byState: Record<string, typeof cities> = {}
  for (const c of cities) {
    ;(byState[c.state] = byState[c.state] ?? []).push(c)
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-serif text-3xl text-text-primary mb-2">Thanks for contributing!</h2>
        <p className="text-text-secondary font-sans mb-6">
          Your submission helps make RealInflation more accurate for everyone in {citySlug.split('-').slice(0, -1).map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}.
        </p>
        <div className="inline-flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl px-6 py-4 mb-8">
          <span className="text-3xl">🏆</span>
          <div className="text-left">
            <p className="font-mono font-bold text-accent text-xl">+{pointsEarned} pts earned</p>
            <p className="font-sans text-sm text-text-secondary">{totalPoints} total points</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => { setStatus('idle'); setPrice(''); setStore(''); setItem('') }}
            className="btn-secondary"
          >
            Submit Another
          </button>
          <Link href={`/city/${citySlug}/`} className="btn-primary">
            View {citySlug.split('-').slice(0,-1).map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')} Prices
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Points counter */}
      {totalPoints > 0 && (
        <div className="flex items-center justify-end gap-2 text-sm font-mono text-accent">
          <span>🏆</span><span>{totalPoints} pts</span>
        </div>
      )}

      {/* City */}
      <div>
        <label className="label-caps block mb-1.5">City</label>
        <select
          required
          value={citySlug}
          onChange={e => setCitySlug(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        >
          <option value="">Select a city...</option>
          {Object.entries(byState).sort(([a],[b])=>a.localeCompare(b)).map(([state, cs]) => (
            <optgroup key={state} label={state}>
              {cs.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="label-caps block mb-1.5">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`text-sm font-sans px-3 py-1.5 rounded-full border transition-colors ${
                category === cat
                  ? 'bg-accent text-white border-accent'
                  : 'border-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Store */}
      <div>
        <label className="label-caps block mb-1.5">Store / Location <span className="text-text-muted normal-case font-sans">(optional)</span></label>
        <input
          type="text"
          value={store}
          onChange={e => setStore(e.target.value)}
          placeholder="e.g. Maverick on Main St, Albertsons, McDonald's"
          className="w-full px-4 py-3 rounded-lg border border-border bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      {/* Item */}
      <div>
        <label className="label-caps block mb-1.5">Item <span className="text-text-muted normal-case font-sans">(optional)</span></label>
        <input
          type="text"
          value={item}
          onChange={e => setItem(e.target.value)}
          placeholder="e.g. Regular unleaded, Dozen eggs, Big Mac combo"
          className="w-full px-4 py-3 rounded-lg border border-border bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      {/* Price + Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-caps block mb-1.5">Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-3 rounded-lg border border-border bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>
        </div>
        <div>
          <label className="label-caps block mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      {/* Points preview */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-sans text-green-800">
        🏆 You'll earn <strong>10 points</strong> for this submission
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm font-sans text-red-700">
          Error: {errorMsg || 'Something went wrong. Please try again.'}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-accent text-white font-semibold font-sans py-3 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Price'}
      </button>

      <p className="text-center text-xs text-text-muted font-sans">
        Submissions are anonymous. We use this data to show real local prices.
      </p>
    </form>
  )
}

export default function SubmitPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-text-muted hover:text-accent font-sans">← Back to RealInflation</Link>
      </div>
      <h1 className="font-serif text-4xl text-text-primary mb-2">Submit a Price</h1>
      <p className="font-sans text-text-secondary mb-8">
        Help your neighbors know what things actually cost. Every submission makes our data more accurate.
      </p>
      <div className="card p-6">
        <Suspense fallback={<div className="animate-pulse h-64 bg-surface2 rounded-xl" />}>
          <SubmitForm />
        </Suspense>
      </div>
    </div>
  )
}
