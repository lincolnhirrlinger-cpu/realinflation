'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CITIES = [
  { name: 'Boise', state: 'Idaho', slug: 'boise-id' },
  { name: 'Nampa', state: 'Idaho', slug: 'nampa-id' },
  { name: 'Meridian', state: 'Idaho', slug: 'meridian-id' },
  { name: 'Idaho Falls', state: 'Idaho', slug: 'idaho-falls-id' },
  { name: 'Pocatello', state: 'Idaho', slug: 'pocatello-id' },
  { name: 'Rexburg', state: 'Idaho', slug: 'rexburg-id' },
  { name: 'Twin Falls', state: 'Idaho', slug: 'twin-falls-id' },
]

interface CitySearchProps {
  placeholder?: string
  className?: string
  size?: 'sm' | 'lg'
}

export default function CitySearch({ placeholder = 'Search a city...', className = '', size = 'lg' }: CitySearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = query.length > 0
    ? CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.state.toLowerCase().includes(query.toLowerCase())
      )
    : CITIES

  function go(slug: string) {
    setOpen(false)
    setQuery('')
    router.push(`/city/${slug}`)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocused(f => Math.min(f + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocused(f => Math.max(f - 1, 0))
    } else if (e.key === 'Enter' && filtered[focused]) {
      go(filtered[focused].slug)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    setFocused(0)
  }, [query])

  const inputClass = size === 'lg'
    ? 'w-full pl-12 pr-4 py-4 text-base rounded-xl border border-border bg-white shadow-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-sans text-text-primary placeholder-text-muted transition-shadow'
    : 'w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-sans text-text-primary placeholder-text-muted'

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <div className={`absolute left-${size === 'lg' ? '4' : '3'} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none`}>
        <svg className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className={inputClass}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-card-hover z-50 overflow-hidden"
          role="listbox"
        >
          {filtered.map((city, i) => (
            <li
              key={city.slug}
              className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${i === focused ? 'bg-cream' : 'hover:bg-cream/60'}`}
              onMouseDown={() => go(city.slug)}
              onMouseEnter={() => setFocused(i)}
              role="option"
              aria-selected={i === focused}
            >
              <span className="font-sans font-medium text-text-primary">{city.name}</span>
              <span className="text-xs text-text-muted font-sans">{city.state}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
