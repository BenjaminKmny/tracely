import { useState, useEffect } from 'react'
import { Sidebar } from '../components/dashboard/Sidebar'
import { MetricCard } from '../components/dashboard/MetricCard'
import { BarChart } from '../components/dashboard/BarChart'
import { useEatsData } from '../hooks/useEatsData'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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

export function EatsDashboard() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [lastUpload, setLastUpload] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hoverType, setHoverType] = useState<HoverType>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [modalType, setModalType] = useState<HoverType>(null)
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const { stats, allOrders, allItems, filterOrders, loading } = useEatsData(year)
  const { user } = useAuth()

  const recentYears = [currentYear, currentYear - 1, currentYear - 2]
  const olderYears = Array.from({ length: Math.max(0, currentYear - 2021) }, (_, i) => currentYear - 3 - i)

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
      if (e.key === 'Escape') { setModalType(null); setModalIndex(null) }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const filteredOrders = filterOrders(hoverType, hoverIndex)
  const modalOrders = filterOrders(modalType, modalIndex)

  // Dynamic restaurants from filtered orders
  const dynamicRestaurants = (() => {
    const restMap: Record<string, { count: number; spend: number }> = {}
    filteredOrders.forEach(o => {
      if (!o.restaurant) return
      if (!restMap[o.restaurant]) restMap[o.restaurant] = { count: 0, spend: 0 }
      restMap[o.restaurant].count += 1
      restMap[o.restaurant].spend += o.order_total_eur
    })
    return Object.entries(restMap).sort((a, b) => b[1].count - a[1].count).slice(0, 8)
      .map(([restaurant, { count, spend }]) => ({ restaurant, count, spend: Math.round(spend * 100) / 100 }))
  })()

  // Dynamic items from filtered orders
  const dynamicItems = (() => {
    const orderIds = new Set(filteredOrders.map(o => o.id))
    const relevantItems = allItems.filter(i => orderIds.has(i.order_id))
    const itemMap: Record<string, number> = {}
    relevantItems.forEach(i => {
      if (!i.item_name) return
      itemMap[i.item_name] = (itemMap[i.item_name] ?? 0) + i.quantity
    })
    return Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([item, count]) => ({ item, count }))
  })()

  // Active metric cards
  const activeStats = hoverType !== null && hoverIndex !== null && stats
    ? {
        totalSpent: hoverType === 'month'
            ? stats.monthlySpend[hoverIndex].amount
            : filteredOrders.reduce((s, o) => s + o.order_total_eur, 0),
        totalOrders: hoverType === 'month'
            ? stats.monthlySpend[hoverIndex].orders
            : filteredOrders.length,
        avgOrder: hoverType === 'month'
            ? stats.monthlySpend[hoverIndex].avgOrder
            : filteredOrders.length > 0
            ?    filteredOrders.reduce((s, o) => s + o.order_total_eur, 0) / filteredOrders.length
                : 0,
        largestOrder: hoverType === 'month'
            ? stats.monthlySpend[hoverIndex].largestOrder
            : filteredOrders.length > 0
                ? Math.max(...filteredOrders.map(o => o.order_total_eur))
                : 0,
      totalItems: dynamicItems.reduce((s, i) => s + i.count, 0),
      avgItemsPerOrder: filteredOrders.length > 0
        ? Math.round((dynamicItems.reduce((s, i) => s + i.count, 0) / filteredOrders.length) * 10) / 10
        : 0,
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
              Uber Eats {hoverLabel ? <span style={{ color: ACCENT, fontWeight: 600 }}>· {hoverLabel}</span> : ''}
            </h1>
            <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>
              {hoverLabel ? `Showing data for ${hoverLabel} ${year}` : 'Your food delivery history and spending'}
            </p>
          </div>

          {/* Year selector */}
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

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !stats ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🍔</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>No Eats orders in {year}</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>Try selecting a different year or upload your data.</div>
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              <MetricCard label="Total spent" value={fmt(activeStats?.totalSpent ?? 0)} sub={hoverLabel ?? `${stats.currency} normalised`} accent tooltip="All completed order totals converted to EUR" />
              <MetricCard label="Total orders" value={String(activeStats?.totalOrders ?? 0)} tooltip="Completed Uber Eats orders" />
              <MetricCard label="Avg order" value={fmt(activeStats?.avgOrder ?? 0)} tooltip="Average spend per order" />
              <MetricCard label="Largest order" value={fmt(activeStats?.largestOrder ?? 0)} tooltip="Most expensive single order" />
              <MetricCard label="Items ordered" value={String(activeStats?.totalItems ?? 0)} tooltip="Total individual items across all orders" />
              <MetricCard label="Avg items/order" value={String(activeStats?.avgItemsPerOrder ?? 0)} tooltip="Average number of items per order" />
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

            {/* Day + Hour */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <BarChart
                title="Orders by day of week"
                data={stats.dayOfWeek.map(d => ({ label: d.day.slice(0, 3), value: d.count }))}
                height={120}
                onHover={i => { setHoverType(i !== null ? 'dow' : null); setHoverIndex(i) }}
                onClickBar={i => { setModalType('dow'); setModalIndex(i) }}
              />
              <BarChart
                title="Orders by hour"
                data={stats.hourOfDay.map(h => ({ label: h.hour === 0 ? '12a' : h.hour < 12 ? `${h.hour}a` : h.hour === 12 ? '12p' : `${h.hour - 12}p`, value: h.count }))}
                height={120}
                onHover={i => { setHoverType(i !== null ? 'hour' : null); setHoverIndex(i) }}
                onClickBar={i => { setModalType('hour'); setModalIndex(i) }}
              />
            </div>

            {/* Top restaurants + Top items */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Top restaurants</div>
                  {hoverLabel && <div style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{hoverLabel}</div>}
                </div>
                {dynamicRestaurants.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#aaa' }}>No orders for this period</div>
                ) : dynamicRestaurants.map((r, i) => {
                  const max = dynamicRestaurants[0].count
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#555', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.restaurant}</div>
                      <div style={{ width: 80, background: '#f0f0f0', borderRadius: 3, height: 5, flexShrink: 0 }}>
                        <div style={{ width: `${(r.count / max) * 100}%`, height: '100%', background: ACCENT, borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', width: 24, textAlign: 'right', flexShrink: 0 }}>{r.count}x</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Most ordered items</div>
                  {hoverLabel && <div style={{ fontSize: 11, color: ACCENT, fontWeight: 500 }}>{hoverLabel}</div>}
                </div>
                {dynamicItems.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#aaa' }}>No items for this period</div>
                ) : dynamicItems.map((item, i) => {
                  const max = dynamicItems[0].count
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#555', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.item}</div>
                      <div style={{ width: 80, background: '#f0f0f0', borderRadius: 3, height: 5, flexShrink: 0 }}>
                        <div style={{ width: `${(item.count / max) * 100}%`, height: '100%', background: ACCENT, borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', width: 24, textAlign: 'right', flexShrink: 0 }}>{item.count}x</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      {modalIndex !== null && modalLabel && (
        <>
          <div onClick={() => { setModalType(null); setModalIndex(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 16, width: '80vw', maxWidth: 800, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 101, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Orders · {modalLabel} {year}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{modalOrders.length} orders · €{modalOrders.reduce((s, o) => s + o.order_total_eur, 0).toFixed(2)} total</div>
              </div>
              <button onClick={() => { setModalType(null); setModalIndex(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa' }}>×</button>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    {['Date', 'Restaurant', 'City', 'Total', 'Platform'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modalOrders.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#aaa' }}>No orders for this period</td></tr>
                  ) : modalOrders.map((o, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ padding: '10px 16px', color: '#555', whiteSpace: 'nowrap' }}>{formatDate(o.date)}</td>
                      <td style={{ padding: '10px 16px', color: '#555', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.restaurant}</td>
                      <td style={{ padding: '10px 16px', color: '#555' }}>{o.city || '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#111', fontWeight: 600 }}>€{o.order_total_eur.toFixed(2)}</td>
                      <td style={{ padding: '10px 16px', color: '#aaa', fontSize: 12 }}>{o.platform}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}