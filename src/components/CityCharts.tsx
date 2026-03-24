'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import DateRangeFilter, { filterByRange, DateRange } from './DateRangeFilter'

const GasChart = dynamic(() => import('./GasChart'), { ssr: false, loading: () => <div className="h-48 bg-card rounded-xl animate-pulse" /> })
const RentChart = dynamic(() => import('./RentChart'), { ssr: false, loading: () => <div className="h-48 bg-card rounded-xl animate-pulse" /> })

interface GasHistory { date: string; price: number; national: number }
interface RentHistory { date: string; avg: number; onebed: number; national: number }

interface Props {
  gasHistory: GasHistory[]
  rentHistory: RentHistory[]
  cityName: string
}

export default function CityCharts({ gasHistory, rentHistory, cityName }: Props) {
  const [range, setRange] = useState<DateRange>('5y')

  const filteredGas = filterByRange(gasHistory, range)
  const filteredRent = filterByRange(rentHistory, range)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="section-title">Price History</h2>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>
      <div className="space-y-6">
        <GasChart history={filteredGas} cityName={cityName} />
        <RentChart history={filteredRent} cityName={cityName} />
      </div>
    </div>
  )
}
