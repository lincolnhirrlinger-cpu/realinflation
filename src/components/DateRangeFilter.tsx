'use client'
import { useState } from 'react'

export type DateRange = '1y' | '3y' | '5y' | '10y' | '2000'

interface Props {
  value: DateRange
  onChange: (r: DateRange) => void
}

const OPTIONS: { label: string; value: DateRange }[] = [
  { label: '1 Year', value: '1y' },
  { label: '3 Years', value: '3y' },
  { label: '5 Years', value: '5y' },
  { label: '10 Years', value: '10y' },
  { label: 'Since 2000', value: '2000' },
]

export default function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs font-sans text-text-muted mr-1">Range:</span>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${
            value === opt.value
              ? 'bg-accent text-white border-accent'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Filter a history array by range */
export function filterByRange<T extends { date: string }>(data: T[], range: DateRange): T[] {
  if (!data?.length) return data
  const now = new Date()
  let cutoff: Date
  switch (range) {
    case '1y':  cutoff = new Date(now.getFullYear() - 1, now.getMonth()); break
    case '3y':  cutoff = new Date(now.getFullYear() - 3, now.getMonth()); break
    case '5y':  cutoff = new Date(now.getFullYear() - 5, now.getMonth()); break
    case '10y': cutoff = new Date(now.getFullYear() - 10, now.getMonth()); break
    case '2000': cutoff = new Date(2000, 0); break
    default:    cutoff = new Date(now.getFullYear() - 1, now.getMonth())
  }
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2,'0')}`
  return data.filter(d => d.date >= cutoffStr)
}
