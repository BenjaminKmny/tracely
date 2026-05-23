import { useState, useEffect } from 'react'
import { Sidebar } from '../components/dashboard/Sidebar'
import { MetricCard } from '../components/dashboard/MetricCard'
import { BarChart } from '../components/dashboard/BarChart'
import { InsightCard } from '../components/dashboard/InsightCard'
import { SpendingPace } from '../components/dashboard/SpendingPace'
import { Benchmarking } from '../components/dashboard/Benchmarking'
import { YearInReviewButton } from '../components/dashboard/YearInReview'
import { useRidesData } from '../hooks/useRidesData'
import { useEatsData } from '../hooks/useEatsData'
import { generateRidesInsights } from '../hooks/useInsights'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function fmt(n: number, prefix = '€') {
  return `${prefix}${n.toLocaleString('en-EU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type HoverType = 'month' | 'dow' | 'hour' | null

export function RidesDashboard() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [lastUpload, setLastUpload] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hoverType, setHoverType] = useState<HoverType>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [modalType, setModalType] = useState<HoverType>(null)
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const [rideDetailModal, setRideDetailModal] = useState<'cheapest' | 'expensive' | null>(null)
  const { stats, allRides, filterRides, loading } = useRidesData(year)
  const { stats: eatsStats } = useEatsData(year)
  const { user } = useAuth()

  const recentYears = [currentYear, currentYear - 1, currentYear - 2]
  const olderYears = Array.from({ length: Math.max(0, currentYear - 2021) }, (_, i) => currentYear - 3 - i)

  const ridesInsights = stats ? generateRidesInsights(stats, year) : []
  const previewInsights = ridesInsights.slice(0, 3)

  const cheapestRide = allRides.length > 0
    ? allRides.reduce((best, r) => r.fare_eur < best.fare_eur ? r : best)
    : null

  const mostExpensiveRide = allRides.length > 0
    ? allRides.reduce((best, r) => r.fare_eur > best.fare_eur ? r : best)
    : null

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('last_upload_at').eq('id', user.id).single()
      .then(({ data }) => setLastUpload(data?.last_upload_at ?? null))
  }, [user])

  useEffect(() => {
    const close = () => setDropdownOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalType(null)
        setModalIndex(null)
        setRideDetailModal(null)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const filteredRides = filterRides(hoverType, hoverIndex)
  const modalRides = filterRides(modalType, modalIndex)

  const dynamicRoutes = (() => {
    const routeMap: Record<string, number> = {}
    filteredRides.forEach(r => {
      if (!r.pickup || !r.dropoff) return
      const pickup = r.pickup.split(',')[0].trim()
      const dropoff = r.dropoff.split(',')[0].trim()
      if (!pickup || !dropoff) return
      const key = `${pickup} → ${dropoff}`
      routeMap[key] = (routeMap[key] ?? 0) + 1
    })
    return Object.entries(routeMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([route, count]) => ({ route, count }))
  })()

  const dynamicCities = (() => {
    const cityMap: Record<string, number> = {}
    filteredRides.forEach(r => { if (r.city) cityMap[r.city] = (cityMap[r.city] ?? 0) + 1 })
    return Object.entries(cityMap).sort((a, b) => b[1] - a[1]).map(([city, count]) => ({ city, count }))
  })()

  const activeStats = hoverType === 'month' && hoverIndex !== null && stats
    ? {
        totalSpent: stats.monthlySpend[hoverIndex].amount,
        totalRides: stats.monthlySpend[hoverIndex].rides,
        avgFare: stats.monthlySpend[hoverIndex].avgFare,
        surgeRides: stats.monthlySpend[hoverIndex].surgeCount,
        cheapestRide: stats.monthlySpend[hoverIndex].cheapest,
        mostExpensiveRide: stats.monthlySpend[hoverIndex].mostExpensive,
      }
    : hoverType !== null && hoverIndex !== null
    ? {
        totalSpent: filteredRides.filter(r => r.fare_eur > 0).reduce((s, r) => s + r.fare_eur, 0),
        totalRides: filteredRides.length,
        avgFare: filteredRides.filter(r => r.fare_eur > 0).length > 0
          ? filteredRides.filter(r => r.fare_eur > 0).reduce((s, r) => s + r.fare_eur, 0) / filteredRides.filter(r => r.fare_eur > 0).length
          : 0,
        surgeRides: filteredRides.filter(r => r.surged).length,
        cheapestRide: filteredRides.filter(r => r.fare_eur > 0).length > 0 ? Math.min(...filteredRides.filter(r => r.fare_eur > 0).map(r => r.fare_eur)) : 0,
        mostExpensiveRide: filteredRides.filter(r => r.fare_eur > 0).length > 0 ? Math.max(...filteredRides.filter(r => r.fare_eur > 0).map(r => r.fare_eur)) : 0,
      }
    : stats

  const hoverLabel = hoverType === 'month' && hoverIndex !== null ? MONTHS[hoverIndex]
    : hoverType === 'dow' && hoverIndex !== null ? DAYS[hoverIndex]
    : hoverType === 'hour' && hoverIndex !== null ? (hoverIndex === 0 ? '12am' : hoverIndex < 12 ? `${hoverIndex}am` : hoverIndex === 12 ? '12pm' : `${hoverIndex - 12}pm`)
    : null

  const modalLabel = modalType === 'month' && modalIndex !== null ? MONTHS[modalIndex]
    : modalType === 'dow' && modalIndex !== null ? DAYS[modalIndex]
    : modalType === 'hour' && modalIndex !== null ? (modalIndex === 0 ? '12am' : modalIndex < 12 ? `${modalIndex}am` : modalIndex === 12 ? '12pm' : `${modalIndex - 12}pm`)
    : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar lastUpload={lastUpload} />

      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', maxWidth: 'calc(100vw - 220px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>
              Rides {hoverLabel ? <span style={{ color: ACCENT, fontWeight: 600 }}>· {hoverLabel}</span> : ''}
            </h1>
            <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>
              {hoverLabel ? `Showing data for ${hoverLabel} ${year}` : 'Your Uber ride history and spending'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stats && <YearInReviewButton year={year} ridesStats={stats} eatsStats={eatsStats ?? null} />}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {recentYears.map(y => (
                <button key={y} onClick={() => setYear(y)}
                  style={{ fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: year === y ? ACCENT : 'white', color: year === y ? 'white' : '#888', border: `1px solid ${year === y ? ACCENT : '#eee'}`, transition: 'all 0.15s' }}
                >{y}</button>
              ))}
              {olderYears.length > 0 && (
                <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setDropdownOpen(o => !o)}
                    style={{ fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: olderYears.includes(year) ? ACCENT : 'white', color: olderYears.includes(year) ? 'white' : '#888', border: `1px solid ${olderYears.includes(year) ? ACCENT : '#eee'}`, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {olderYears.includes(year) ? year : 'Earlier'}
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {dropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'white', border: '1px solid #eee', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 50, minWidth: 100, overflow: 'hidden' }}>
                      {olderYears.map(y => (
                        <button key={y} onClick={() => { setYear(y); setDropdownOpen(false) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, fontWeight: year === y ? 600 : 400, color: year === y ? ACCENT : '#555', background: year === y ? ACCENT_LIGHT : 'transparent', border: 'none', cursor: 'pointer' }}
                        >{y}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>
                Try a different year or upload your Uber data to get started.
            </div>
            <Link to="/dashboard/upload" style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: 'white', background: ACCENT, textDecoration: 'none', padding: '10px 20px', borderRadius: 9 }}>
                Upload data →
            </Link>
            </div>
        ) : (
          <>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              <MetricCard label="Total spent" value={fmt(activeStats?.totalSpent ?? 0)} sub={hoverLabel ?? `${stats.currency} normalised`} accent tooltip="All completed ride fares converted to EUR" />
              <MetricCard label="Total rides" value={String(activeStats?.totalRides ?? 0)} tooltip="Completed rides only — cancelled trips excluded" />
              <MetricCard label="Avg fare" value={fmt(activeStats?.avgFare ?? 0)} tooltip="Average fare across completed rides only" />
              <MetricCard label="Surge rides" value={String(activeStats?.surgeRides ?? 0)} sub={activeStats && activeStats.totalRides > 0 ? `${Math.round((activeStats.surgeRides / activeStats.totalRides) * 100)}% of trips` : undefined} tooltip="Rides where Uber applied surge pricing" />
              <MetricCard
                label="Cheapest ride"
                value={fmt(activeStats?.cheapestRide ?? 0)}
                tooltip="Lowest single fare you paid — click to see details"
                onClick={cheapestRide ? () => setRideDetailModal('cheapest') : undefined}
              />
              <MetricCard
                label="Most expensive"
                value={fmt(activeStats?.mostExpensiveRide ?? 0)}
                tooltip="Highest single fare you paid — click to see details"
                onClick={mostExpensiveRide ? () => setRideDetailModal('expensive') : undefined}
              />
            </div>

            {/* Spending pace */}
            <div style={{ marginBottom: 16 }}>
              <SpendingPace monthlySpend={stats.monthlySpend} year={year} label="Rides" />
            </div>

            {/* Monthly spend */}
            <div style={{ marginBottom: 16 }}>
              <BarChart
                title="Monthly spend"
                data={stats.monthlySpend.map(m => ({ label: m.month, value: m.amount }))}
                prefix="€" height={160}
                onHover={i => { setHoverType(i !== null ? 'month' : null); setHoverIndex(i) }}
                onClickBar={i => { setModalType('month'); setModalIndex(i) }}
              />
            </div>

            {/* Insight cards */}
            {previewInsights.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 16 }}>
                {previewInsights.map(i => <InsightCard key={i.id} emoji={i.emoji} text={i.text} highlight={i.highlight} compact />)}
              </div>
            )}

            {/* Day + Hour */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <BarChart
                title="Rides by day of week"
                data={stats.dayOfWeek.map(d => ({ label: d.day.slice(0, 3), value: d.count }))}
                height={120}
                onHover={i => { setHoverType(i !== null ? 'dow' : null); setHoverIndex(i) }}
                onClickBar={i => { setModalType('dow'); setModalIndex(i) }}
              />
              <BarChart
                title="Rides by hour"
                data={stats.hourOfDay.map(h => ({ label: h.hour === 0 ? '12a' : h.hour < 12 ? `${h.hour}a` : h.hour === 12 ? '12p' : `${h.hour - 12}p`, value: h.count }))}
                height={120}
                onHover={i => { setHoverType(i !== null ? 'hour' : null); setHoverIndex(i) }}
                onClickBar={i => { setModalType('hour'); setModalIndex(i) }}
              />
            </div>

            {/* Top routes + Cities */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Top routes</div>
                  {hoverLabel && <div style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{hoverLabel}</div>}
                </div>
                {dynamicRoutes.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#aaa', padding: '8px 0' }}>No routes for {hoverLabel ?? 'this period'}</div>
                ) : dynamicRoutes.map((r, i) => {
                  const max = dynamicRoutes[0].count
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#555', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.route}</div>
                      <div style={{ width: 80, background: '#f0f0f0', borderRadius: 3, height: 5, flexShrink: 0 }}>
                        <div style={{ width: `${Math.max((r.count / max) * 100, 4)}%`, height: '100%', background: ACCENT, borderRadius: 3, transition: 'width 0.2s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', width: 24, textAlign: 'right', flexShrink: 0 }}>{r.count}x</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Cities</div>
                  {hoverLabel && <div style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{hoverLabel}</div>}
                </div>
                {dynamicCities.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#aaa', padding: '8px 0' }}>No city data for {hoverLabel ?? 'this period'}</div>
                ) : dynamicCities.map((c, i) => {
                  const max = dynamicCities[0].count
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#555', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.city}</div>
                      <div style={{ width: 50, background: '#f0f0f0', borderRadius: 3, height: 5, flexShrink: 0 }}>
                        <div style={{ width: `${Math.max((c.count / max) * 100, 4)}%`, height: '100%', background: ACCENT, borderRadius: 3, transition: 'width 0.2s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', width: 20, textAlign: 'right', flexShrink: 0 }}>{c.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Ride types */}
            <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
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

            {/* Benchmarking */}
            <Benchmarking
              type="rides"
              totalSpent={stats.totalSpent}
              avgFare={stats.avgFare}
              surgeRate={Math.round((stats.surgeRides / stats.totalRides) * 100)}
              totalRides={stats.totalRides}
              monthsActive={stats.monthlySpend.filter(m => m.rides > 0).length}
            />
          </>
        )}
      </main>

      {/* Bar drill-down modal */}
      {modalIndex !== null && modalLabel && (
        <>
          <div onClick={() => { setModalType(null); setModalIndex(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 16, width: '80vw', maxWidth: 900, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 101, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Rides · {modalLabel} {year}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{modalRides.length} rides · €{modalRides.filter(r => r.fare_eur > 0).reduce((s, r) => s + r.fare_eur, 0).toFixed(2)} total</div>
              </div>
              <button onClick={() => { setModalType(null); setModalIndex(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa' }}>×</button>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    {['Date', 'Pickup', 'Dropoff', 'City', 'Type', 'Fare', 'Duration', 'Surge'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modalRides.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#aaa' }}>No rides for this period</td></tr>
                  ) : modalRides.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ padding: '10px 16px', color: '#555', whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                      <td style={{ padding: '10px 16px', color: '#555', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.pickup?.split(',')[0] ?? '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#555', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.dropoff?.split(',')[0] ?? '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#555' }}>{r.city || '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#555' }}>{r.ride_type || '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#111', fontWeight: 600 }}>{r.fare_eur > 0 ? `€${r.fare_eur.toFixed(2)}` : '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#555' }}>{r.duration_mins > 0 ? `${r.duration_mins}m` : '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        {r.surged
                          ? <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6 }}>Surge</span>
                          : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Ride detail modal (cheapest / most expensive) */}
      {rideDetailModal && (() => {
        const ride = rideDetailModal === 'cheapest' ? cheapestRide : mostExpensiveRide
        if (!ride) return null
        return (
          <>
            <div onClick={() => setRideDetailModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 16, width: 420, zIndex: 101, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>
                  {rideDetailModal === 'cheapest' ? '🎯 Cheapest ride' : '💸 Most expensive ride'}
                </div>
                <button onClick={() => setRideDetailModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa' }}>×</button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: ACCENT, letterSpacing: '-1px', marginBottom: 16 }}>
                  €{ride.fare_eur.toFixed(2)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'Date', value: formatDate(ride.date) },
                    { label: 'Pickup', value: ride.pickup?.split(',')[0] ?? '—' },
                    { label: 'Dropoff', value: ride.dropoff?.split(',')[0] ?? '—' },
                    { label: 'City', value: ride.city || '—' },
                    { label: 'Ride type', value: ride.ride_type || '—' },
                    { label: 'Duration', value: ride.duration_mins > 0 ? `${ride.duration_mins} minutes` : '—' },
                    { label: 'Surge', value: ride.surged ? 'Yes' : 'No' },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                      <div style={{ fontSize: 12, color: '#aaa' }}>{row.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}