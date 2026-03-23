'use client'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface RentHistory {
  date: string
  avg: number
  onebed: number
  national: number
}

interface RentChartProps {
  history: RentHistory[]
  cityName: string
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-lg p-3 shadow-card text-xs font-mono">
      <p className="font-sans font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function RentChart({ history, cityName }: RentChartProps) {
  return (
    <div className="card p-5">
      <p className="label-caps mb-4">Average Monthly Rent History</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={history} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#9b9890' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={v => `$${v.toLocaleString()}`}
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#9b9890' }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Outfit' }} />
          <Line
            type="monotone"
            dataKey="avg"
            name={`${cityName} All`}
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="onebed"
            name={`${cityName} 1BR`}
            stroke="#60a5fa"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="national"
            name="National Avg"
            stroke="#9b9890"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#9b9890', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
