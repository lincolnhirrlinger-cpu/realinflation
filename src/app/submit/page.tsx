'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface CityOption {
  name: string
  state: string
  state_abbr: string
  slug: string
}

type Category = 'Gas' | 'Groceries' | 'Dining' | 'Rent' | 'Electricity' | 'Other'

const CATEGORIES: Category[] = ['Gas', 'Groceries', 'Dining', 'Rent', 'Electricity', 'Other']

function SubmitForm() {
  const searchParams = useSearchParams()
  const defaultCity = searchParams.get('city') ?? ''

  const [cities, setCities] = useState<CityOption[]>([])
  const [city, setCity] = useState(defaultCity)
  const [category, setCategory] = useState<Category | ''>('')
  const [store, setStore] = useState('')
  const [item, setItem] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [image, setImage] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [points, setPoints] = useState(0)
  const [animatingPoints, setAnimatingPoints] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/data/cities.json')
      .then(r => r.json())
      .then((data: CityOption[]) => setCities(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('ri_points')
    if (stored) setPoints(parseInt(stored, 10) || 0)
  }, [])

  // Group cities by state
  const grouped = cities.reduce<Record<string, CityOption[]>>((acc, c) => {
    if (!acc[c.state]) acc[c.state] = []
    acc[c.state].push(c)
    return acc
  }, {})
  const sortedStates = Object.keys(grouped).sort()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!city) errs.push('Please select a city')
    if (!category) errs.push('Please select a category')
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) errs.push('Please enter a valid price')
    if (errs.length) {
      setErrors(errs)
      return
    }
    setErrors([])

    const submission = {
      city,
      category,
      store,
      item,
      price: parseFloat(price),
      date,
      hasImage: !!image,
      submittedAt: new Date().toISOString(),
    }

    // Store in localStorage
    const existing = JSON.parse(localStorage.getItem('ri_submissions') ?? '[]')
    existing.push(submission)
    localStorage.setItem('ri_submissions', JSON.stringify(existing))

    // Award points
    const earned = image ? 15 : 10
    const newPoints = points + earned
    setPoints(newPoints)
    localStorage.setItem('ri_points', String(newPoints))

    setAnimatingPoints(true)
    setTimeout(() => setAnimatingPoints(false), 1000)

    setSubmitted(true)
  }

  function handleReset() {
    setCity(defaultCity)
    setCategory('')
    setStore('')
    setItem('')
    setPrice('')
    setDate(new Date().toISOString().slice(0, 10))
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
    setSubmitted(false)
    setErrors([])
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-white font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
  const labelClass = "block text-sm font-sans font-medium text-text-primary mb-1.5"

  return (
    <>
      {/* Points counter */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-text-primary">Submit a Price</h1>
          <p className="font-sans text-text-secondary text-sm mt-1">Help us track real prices in your city.</p>
        </div>
        <div className={`font-mono text-sm bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg transition-transform ${animatingPoints ? 'scale-125' : ''}`}>
          🏆 {points} pts
        </div>
      </div>

      {submitted ? (
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="font-serif text-2xl text-text-primary mb-2">Thanks!</h2>
          <p className="font-sans text-text-secondary text-sm mb-1">
            You earned <span className="font-mono font-semibold text-accent">{image ? 15 : 10} points</span>.
          </p>
          {!image && (
            <p className="font-sans text-text-muted text-xs mb-4">
              Help us verify by adding a photo for +5 bonus points.
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={handleReset} className="btn-primary">
              Submit Another
            </button>
            <Link href={city ? `/city/${city}/` : '/'} className="btn-secondary">
              Back to City
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-5 sm:p-6 space-y-5">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {errors.map((err, i) => (
                <p key={i} className="text-sm font-sans text-red-700">{err}</p>
              ))}
            </div>
          )}

          {/* City */}
          <div>
            <label htmlFor="city" className={labelClass}>City</label>
            <select
              id="city"
              value={city}
              onChange={e => setCity(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a city…</option>
              {sortedStates.map(state => (
                <optgroup key={state} label={state}>
                  {grouped[state].map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}, {c.state_abbr}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-sans border transition-colors ${
                    category === cat
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-text-secondary border-border hover:border-accent hover:text-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Store/Location */}
          <div>
            <label htmlFor="store" className={labelClass}>Store / Location</label>
            <input
              id="store"
              type="text"
              value={store}
              onChange={e => setStore(e.target.value)}
              placeholder='e.g. "Maverick on Broadway"'
              className={inputClass}
            />
          </div>

          {/* Item */}
          <div>
            <label htmlFor="item" className={labelClass}>Item</label>
            <input
              id="item"
              type="text"
              value={item}
              onChange={e => setItem(e.target.value)}
              placeholder='e.g. "Regular unleaded" or "Dozen eggs"'
              className={inputClass}
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className={labelClass}>Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className={`${inputClass} pl-7 font-mono`}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className={labelClass}>Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Image */}
          <div>
            <label htmlFor="image" className={labelClass}>Receipt photo <span className="text-text-muted font-normal">(optional but helps verify)</span></label>
            <input
              id="image"
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files?.[0] ?? null)}
              className="w-full text-sm font-sans text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-border file:text-sm file:font-semibold file:bg-white file:text-text-primary hover:file:bg-cream file:cursor-pointer file:transition-colors"
            />
          </div>

          <button type="submit" className="btn-primary w-full text-center">
            Submit Price
          </button>
        </form>
      )}
    </>
  )
}

export default function SubmitPage() {
  return (
    <div className="max-w-[600px] mx-auto px-4 sm:px-6 py-8">
      <Suspense fallback={
        <div className="card p-6 animate-pulse">
          <div className="h-8 bg-surface2 rounded w-48 mb-4" />
          <div className="h-4 bg-surface2 rounded w-64 mb-8" />
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-surface2 rounded" />)}
          </div>
        </div>
      }>
        <SubmitForm />
      </Suspense>
    </div>
  )
}
