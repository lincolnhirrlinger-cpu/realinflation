'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-xl text-text-primary">Real<span className="text-accent">Inflation</span></span>
            <span className="hidden sm:inline-block text-xs font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">BETA</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/states/" className="text-sm font-sans text-text-secondary hover:text-text-primary transition-colors">States</Link>
            <Link href="/compare/" className="text-sm font-sans text-text-secondary hover:text-text-primary transition-colors">Compare</Link>
            <Link href="/methodology/" className="text-sm font-sans text-text-secondary hover:text-text-primary transition-colors">Methodology</Link>
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link href="/states/" className="hidden sm:inline-flex btn-primary text-sm">Browse States</Link>
            <button
              className="md:hidden p-2 text-text-secondary"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-3 flex flex-col gap-3">
            <Link href="/states/" className="text-sm font-sans text-text-secondary px-1" onClick={() => setMenuOpen(false)}>States</Link>
            <Link href="/compare/" className="text-sm font-sans text-text-secondary px-1" onClick={() => setMenuOpen(false)}>Compare</Link>
            <Link href="/methodology/" className="text-sm font-sans text-text-secondary px-1" onClick={() => setMenuOpen(false)}>Methodology</Link>
          </div>
        )}
      </div>
    </header>
  )
}
