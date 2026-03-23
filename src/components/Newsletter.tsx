'use client'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="bg-text-primary rounded-card p-8 md:p-12 my-12">
      <div className="max-w-2xl mx-auto text-center">
        <p className="label-caps text-white/50 mb-3">Newsletter</p>
        <h2 className="font-serif text-3xl text-white mb-3">
          Get the Monthly Price Report
        </h2>
        <p className="text-white/70 font-sans text-base mb-6">
          We track gas, groceries, and rent so you know what's coming before it hits your wallet. 
          One email, once a month, no spam.
        </p>
        {submitted ? (
          <div className="bg-white/10 rounded-lg px-6 py-4 text-white font-sans text-sm">
            ✓ You're on the list. We'll be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 font-sans text-sm"
            />
            <button
              type="submit"
              className="bg-accent text-white px-6 py-3 rounded-lg font-sans font-semibold text-sm hover:bg-accent-dark transition-colors whitespace-nowrap"
            >
              Subscribe Free
            </button>
          </form>
        )}
        <p className="text-white/30 text-xs font-sans mt-4">
          No spam. Unsubscribe anytime. Data updated monthly from FRED, Zillow, AAA.
        </p>
      </div>
    </section>
  )
}
