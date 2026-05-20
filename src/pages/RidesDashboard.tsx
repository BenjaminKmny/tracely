import { useState } from 'react'
import { Sidebar } from '../components/dashboard/Sidebar'
import { MetricCard } from '../components/dashboard/MetricCard'
import { BarChart } from '../components/dashboard/BarChart'
import { useRidesData } from '../hooks/useRidesData'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

function fmt(n: number, prefix = '€') {
  return `${prefix}${n.toLocaleString('en-EU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function RidesDashboard() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [lastUpload, setLastUpload] = useState<string | null>(null)
  const { stats, loading } = useRidesData(year)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('last_upload_at').eq('id', user.id).single()
      .then(({ data }) => setLastUpload(data?.last_upload_at ?? null))
  }, [user])

  const years = Array.from({ length: currentYear - 2018 }, (_, i) => currentYear - i)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar lastUpload={lastUpload} />

      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', maxWidth: 'calc(100vw - 220px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>Rides</h1>
            <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>Your Uber ride history and spending</p>
          </div>
          {/* Year selector */}
          <div style={{ display: 'flex', gap: 4 }}>
            {years.map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                style={{
                    fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                    background: year === y ? ACCENT : 'white',
                    color: year === y ? 'white' : '#888',
                    border: `1px solid ${year === y ? ACCENT : '#eee'}`,
                  transition: 'all 0.15s',
                }}
              >{y}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !stats ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🚗</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>No rides in {year}</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>Try selecting a different year or upload your data.</div>
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              <MetricCard label="Total spent" value={fmt(stats.totalSpent)} sub={`${stats.currency} normalised`} accent />
              <MetricCard label="Total rides" value={String(stats.totalRides)} />
              <MetricCard label="Avg fare" value={fmt(stats.avgFare)} />
              <MetricCard label="Surge rides" value={String(stats.surgeRides)} sub={`${Math.round(stats.surgeRides / stats.totalRides * 100)}% of trips`} />
              <MetricCard label="Cheapest ride" value={fmt(stats.cheapestRide)} />
              <MetricCard label="Most expensive" value={fmt(stats.mostExpensiveRide)} />
            </div>

            {/* Monthly spend */}
            <div style={{ marginBottom: 16 }}>
              <BarChart
                title="Monthly spend"
                data={stats.monthlySpend.map(m => ({ label: m.month, value: m.amount }))}
                prefix="€"
                height={160}
              />
            </div>

            {/* Day + Hour */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <BarChart
                title="Rides by day of week"
                data={stats.dayOfWeek.map(d => ({ label: d.day.slice(0, 3), value: d.count }))}
                height={120}
              />
              <BarChart
                title="Rides by hour"
                data={stats.hourOfDay.map(h => ({
                  label: h.hour === 0 ? '12a' : h.hour < 12 ? `${h.hour}a` : h.hour === 12 ? '12p' : `${h.hour - 12}p`,
                  value: h.count,
                }))}
                height={120}
              />
            </div>

            {/* Top routes + City */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

              {/* Top routes */}
              <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 14 }}>Top routes</div>
                {stats.topRoutes.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#aaa' }}>No route data available</div>
                ) : (
                  stats.topRoutes.map((r, i) => {
                    const max = stats.topRoutes[0].count
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: '#555', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.route}</div>
                        <div style={{ width: 80, background: '#f0f0f0', borderRadius: 3, height: 5, flexShrink: 0 }}>
                          <div style={{ width: `${(r.count / max) * 100}%`, height: '100%', background: ACCENT, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa', width: 24, textAlign: 'right', flexShrink: 0 }}>{r.count}x</div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* City breakdown */}
              <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 14 }}>Cities</div>
                {stats.cityBreakdown.map((c, i) => {
                  const max = stats.cityBreakdown[0].count
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#555', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.city}</div>
                      <div style={{ width: 50, background: '#f0f0f0', borderRadius: 3, height: 5, flexShrink: 0 }}>
                        <div style={{ width: `${(c.count / max) * 100}%`, height: '100%', background: ACCENT, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', width: 20, textAlign: 'right', flexShrink: 0 }}>{c.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Ride types */}
            <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 14 }}>Ride types</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {stats.rideTypes.map((t, i) => {
                  const total = stats.rideTypes.reduce((s, r) => s + r.count, 0)
                  const pct = Math.round(t.count / total * 100)
                  return (
                    <div key={i} style={{ background: i === 0 ? ACCENT_LIGHT : '#f5f5f5', border: `1px solid ${i === 0 ? ACCENT + '33' : '#eee'}`, borderRadius: 10, padding: '8px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? ACCENT : '#555' }}>{t.type}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{t.count} rides · {pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}