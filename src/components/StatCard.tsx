import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string
  subvalue?: string
  change?: number
  changeLabel?: string
  stripe?: 'red' | 'blue' | 'green' | 'orange'
  note?: string
}

const stripeMap = {
  red: 'stat-stripe-red',
  blue: 'stat-stripe-blue',
  green: 'stat-stripe-green',
  orange: 'stat-stripe-orange',
}

export default function StatCard({
  label,
  value,
  subvalue,
  change,
  changeLabel,
  stripe = 'red',
  note,
}: StatCardProps) {
  const isUp = change !== undefined && change > 0
  const isDown = change !== undefined && change < 0
  const isNeutral = change === undefined || change === 0

  return (
    <div className={clsx('card p-5', stripeMap[stripe])}>
      <p className="label-caps mb-2">{label}</p>
      <p className="mono-stat text-3xl text-text-primary mb-1">{value}</p>
      {subvalue && (
        <p className="text-sm text-text-secondary font-sans mb-2">{subvalue}</p>
      )}
      {change !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-full',
              isUp && 'bg-red-50 text-accent',
              isDown && 'bg-green-50 text-green-700',
              isNeutral && 'bg-gray-100 text-text-secondary'
            )}
          >
            {isUp ? '↑' : isDown ? '↓' : '→'}
            {' '}
            {Math.abs(change * 100).toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-text-muted font-sans">{changeLabel}</span>
          )}
        </div>
      )}
      {note && (
        <p className="text-xs text-text-muted font-sans mt-2 italic">{note}</p>
      )}
    </div>
  )
}
