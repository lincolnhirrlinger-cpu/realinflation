'use client'
import { useState, useMemo } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useRouter } from 'next/navigation'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

export type MapMetric = 'gas' | 'rent' | 'grocery' | 'col'

interface StateData {
  name: string
  abbr: string
  slug: string
  gas: number
  rent: number
  grocery: number
  col: number
}

interface Props {
  states: StateData[]
}

const METRIC_CONFIG: Record<MapMetric, {
  label: string
  format: (v: number) => string
  low: string
  high: string
  getVal: (s: StateData) => number
}> = {
  gas: {
    label: 'Gas Price',
    format: v => `$${v.toFixed(2)}/gal`,
    low: '#fef3c7',
    high: '#c23616',
    getVal: s => s.gas,
  },
  rent: {
    label: 'Avg Rent',
    format: v => `$${Math.round(v).toLocaleString()}/mo`,
    low: '#dbeafe',
    high: '#1e3a8a',
    getVal: s => s.rent,
  },
  grocery: {
    label: 'Grocery Inflation',
    format: v => `${v.toFixed(1)}% YoY`,
    low: '#dcfce7',
    high: '#15803d',
    getVal: s => s.grocery,
  },
  col: {
    label: 'Cost of Living Index',
    format: v => `${Math.round(v)} (US=100)`,
    low: '#f0fdf4',
    high: '#7c3aed',
    getVal: s => s.col,
  },
}

// FIPS code → state name mapping (subset of common ones)
const FIPS_TO_NAME: Record<string, string> = {
  '01':'Alabama','02':'Alaska','04':'Arizona','05':'Arkansas','06':'California',
  '08':'Colorado','09':'Connecticut','10':'Delaware','11':'District of Columbia',
  '12':'Florida','13':'Georgia','15':'Hawaii','16':'Idaho','17':'Illinois',
  '18':'Indiana','19':'Iowa','20':'Kansas','21':'Kentucky','22':'Louisiana',
  '23':'Maine','24':'Maryland','25':'Massachusetts','26':'Michigan','27':'Minnesota',
  '28':'Mississippi','29':'Missouri','30':'Montana','31':'Nebraska','32':'Nevada',
  '33':'New Hampshire','34':'New Jersey','35':'New Mexico','36':'New York',
  '37':'North Carolina','38':'North Dakota','39':'Ohio','40':'Oklahoma','41':'Oregon',
  '42':'Pennsylvania','44':'Rhode Island','45':'South Carolina','46':'South Dakota',
  '47':'Tennessee','48':'Texas','49':'Utah','50':'Vermont','51':'Virginia',
  '53':'Washington','54':'West Virginia','55':'Wisconsin','56':'Wyoming',
}

function lerp(t: number, low: string, high: string): string {
  // Simple linear interpolation between two hex colors
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
  }
  const [lr,lg,lb] = parse(low)
  const [hr,hg,hb] = parse(high)
  const r = Math.round(lr + (hr-lr)*t)
  const g = Math.round(lg + (hg-lg)*t)
  const b = Math.round(lb + (hb-lb)*t)
  return `rgb(${r},${g},${b})`
}

export default function USAMap({ states }: Props) {
  const [metric, setMetric] = useState<MapMetric>('gas')
  const [tooltip, setTooltip] = useState<{name:string;value:string;x:number;y:number}|null>(null)
  const router = useRouter()

  const cfg = METRIC_CONFIG[metric]

  const stateMap = useMemo(() => {
    const m: Record<string, StateData> = {}
    for (const s of states) m[s.name] = s
    return m
  }, [states])

  const values = useMemo(() => states.map(s => cfg.getVal(s)), [states, metric])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  function getColor(stateName: string) {
    const s = stateMap[stateName]
    if (!s) return '#e5e7eb'
    const t = maxVal === minVal ? 0.5 : (cfg.getVal(s) - minVal) / (maxVal - minVal)
    return lerp(t, cfg.low, cfg.high)
  }

  return (
    <div className="w-full">
      {/* Metric switcher */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(METRIC_CONFIG) as MapMetric[]).map(m => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
              metric === m
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            }`}
          >
            {METRIC_CONFIG[m].label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative w-full bg-card rounded-xl border border-border overflow-hidden">
        <ComposableMap
          projection="geoAlbersUsa"
          className="w-full"
          style={{ height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const fips = geo.id as string
                const stateName = FIPS_TO_NAME[fips] || ''
                const stateData = stateMap[stateName]
                const slug = stateData?.slug || stateName.toLowerCase().replace(/\s+/g, '-')

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(stateName)}
                    stroke="#fff"
                    strokeWidth={0.8}
                    style={{
                      default: { outline: 'none', cursor: stateData ? 'pointer' : 'default' },
                      hover: { outline: 'none', opacity: 0.85, cursor: stateData ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e) => {
                      if (!stateData) return
                      setTooltip({
                        name: stateName,
                        value: cfg.format(cfg.getVal(stateData)),
                        x: e.clientX,
                        y: e.clientY,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (stateData) router.push(`/state/${slug}/`)
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-white border border-border rounded-lg px-3 py-2 shadow-card text-xs font-sans"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
          >
            <p className="font-semibold text-text-primary">{tooltip.name}</p>
            <p className="font-mono text-accent">{tooltip.value}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-text-muted">
        <span>Lower</span>
        <div
          className="flex-1 h-2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${cfg.low}, ${cfg.high})`
          }}
        />
        <span>Higher</span>
      </div>
      <p className="text-xs text-text-muted font-sans mt-1 text-center">
        Click any state to explore city-level data
      </p>
    </div>
  )
}
