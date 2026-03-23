export function formatPrice(value: number, decimals = 2): string {
  return `$${value.toFixed(decimals)}`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(decimals)}%`
}

export function formatPercentRaw(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatChange(value: number): string {
  const pct = (value * 100).toFixed(1)
  return `${value >= 0 ? '+' : ''}${pct}%`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function changeColor(value: number): string {
  if (value > 0.05) return 'text-accent'
  if (value < -0.05) return 'text-green-600'
  return 'text-text-secondary'
}

export function changeBg(value: number): string {
  if (value > 0.05) return 'bg-red-50 text-accent'
  if (value < -0.05) return 'bg-green-50 text-green-700'
  return 'bg-gray-100 text-text-secondary'
}
