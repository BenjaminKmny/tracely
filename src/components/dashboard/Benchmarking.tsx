const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

// Placeholder averages — replace with real aggregated data once enough users exist
const BENCHMARKS = {
  rides: {
    avgMonthlySpend: 85,
    avgFare: 18.50,
    surgeRate: 14,
    avgRidesPerMonth: 6,
  },
  eats: {
    avgMonthlySpend: 120,
    avgOrderValue: 38,
    avgOrdersPerMonth: 4,
    avgItemsPerOrder: 3.2,
  },
}

interface RidesBenchmarkProps {
  type: 'rides'
  totalSpent: number
  avgFare: number
  surgeRate: number
  totalRides: number
  monthsActive: number
}

interface EatsBenchmarkProps {
  type: 'eats'
  totalSpent: number
  avgOrder: number
  totalOrders: number
  avgItemsPerOrder: number
  monthsActive: number
}

type BenchmarkingProps = RidesBenchmarkProps | EatsBenchmarkProps

function percentile(userVal: number, avgVal: number): number {
  // Simple approximation — within 20% of average = 50th percentile
  const ratio = userVal / avgVal
  if (ratio < 0.5) return 15
  if (ratio < 0.75) return 30
  if (ratio < 0.9) return 42
  if (ratio < 1.1) return 55
  if (ratio < 1.3) return 68
  if (ratio < 1.6) return 80
  if (ratio < 2.0) return 88
  return 95
}

function BarComparison({ label, userVal, avgVal, prefix = '€', higher = 'worse' }: {
  label: string
  userVal: number
  avgVal: number
  prefix?: string
  higher?: 'better' | 'worse'
}) {
  const maxVal = Math.max(userVal, avgVal) * 1.1
  const userPct = (userVal / maxVal) * 100
  const avgPct = (avgVal / maxVal) * 100
  const userIsHigher = userVal > avgVal
  const userColor = higher === 'worse'
    ? userIsHigher ? '#EF4444' : '#22C55E'
    : userIsHigher ? '#22C55E' : '#EF4444'

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: '#555' }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: userColor }}>
          {prefix}{userVal.toLocaleString()} <span style={{ color: '#bbb', fontWeight: 400 }}>vs {prefix}{avgVal} avg</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 6 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: '#f0f0f0', borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: `${avgPct}%`, height: '100%', background: '#ddd', borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: `${userPct}%`, height: '100%', background: userColor, borderRadius: 3, opacity: 0.8 }} />
      </div>
    </div>
  )
}

export function Benchmarking(props: BenchmarkingProps) {
  const monthsActive = Math.max(props.monthsActive, 1)

  if (props.type === 'rides') {
    const monthlySpend = Math.round(props.totalSpent / monthsActive)
    const monthlyRides = Math.round(props.totalRides / monthsActive)
    const pct = percentile(monthlySpend, BENCHMARKS.rides.avgMonthlySpend)

    return (
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>How you compare</div>
          <div style={{ background: ACCENT_LIGHT, color: ACCENT, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
            Top {100 - pct}% spender
          </div>
        </div>
        <BarComparison label="Monthly spend" userVal={monthlySpend} avgVal={BENCHMARKS.rides.avgMonthlySpend} higher="worse" />
        <BarComparison label="Avg fare" userVal={props.avgFare} avgVal={BENCHMARKS.rides.avgFare} higher="worse" />
        <BarComparison label="Rides per month" userVal={monthlyRides} avgVal={BENCHMARKS.rides.avgRidesPerMonth} prefix="" higher="better" />
        <BarComparison label="Surge rate %" userVal={props.surgeRate} avgVal={BENCHMARKS.rides.surgeRate} prefix="" higher="worse" />
        <div style={{ fontSize: 11, color: '#ccc', marginTop: 8 }}>Based on anonymised Tracely user averages</div>
      </div>
    )
  }

  const monthlySpend = Math.round(props.totalSpent / monthsActive)
  const monthlyOrders = Math.round(props.totalOrders / monthsActive)
  const pct = percentile(monthlySpend, BENCHMARKS.eats.avgMonthlySpend)

  return (
    <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>How you compare</div>
        <div style={{ background: ACCENT_LIGHT, color: ACCENT, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
          Top {100 - pct}% spender
        </div>
      </div>
      <BarComparison label="Monthly spend" userVal={monthlySpend} avgVal={BENCHMARKS.eats.avgMonthlySpend} higher="worse" />
      <BarComparison label="Avg order value" userVal={props.avgOrder} avgVal={BENCHMARKS.eats.avgOrderValue} higher="worse" />
      <BarComparison label="Orders per month" userVal={monthlyOrders} avgVal={BENCHMARKS.eats.avgOrdersPerMonth} prefix="" higher="better" />
      <BarComparison label="Items per order" userVal={props.avgItemsPerOrder} avgVal={BENCHMARKS.eats.avgItemsPerOrder} prefix="" higher="better" />
      <div style={{ fontSize: 11, color: '#ccc', marginTop: 8 }}>Based on anonymised Tracely user averages</div>
    </div>
  )
}