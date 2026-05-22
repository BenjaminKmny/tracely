import { useState, useEffect } from 'react'
import { useAllTimeData } from '../../hooks/useAllTimeData'
import { RidesStats } from '../../hooks/useRidesData'
import { EatsStats } from '../../hooks/useEatsData'


const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

interface YearInReviewProps {
  year: number
  ridesStats: RidesStats | null
  eatsStats: EatsStats | null
}

function StatBlock({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 16px', background: 'white', borderRadius: 14, border: '1px solid #eee' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

export function YearInReviewButton({ year, ridesStats, eatsStats }: YearInReviewProps) {
  const [open, setOpen] = useState(false)
  const { records } = useAllTimeData()

  const totalSpent = (ridesStats?.totalSpent ?? 0) + (eatsStats?.totalSpent ?? 0)
  const totalRides = ridesStats?.totalRides ?? 0
  const totalOrders = eatsStats?.totalOrders ?? 0
  const topRoute = ridesStats?.topRoutes[0] ?? null
  const topRestaurant = eatsStats?.topRestaurants[0] ?? null
  const topItem = eatsStats?.topItems[0] ?? null
  const peakRideDay = ridesStats?.dayOfWeek.reduce((best, d) => d.count > best.count ? d : best)
  const peakEatsDay = eatsStats?.dayOfWeek.reduce((best, d) => d.count > best.count ? d : best)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: ACCENT,
          background: ACCENT_LIGHT, border: `1px solid ${ACCENT}33`,
          borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
        }}
      >
        ✨ {year} in review
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#fafafa', borderRadius: 20, width: '90vw', maxWidth: 680,
            maxHeight: '90vh', overflow: 'auto', zIndex: 101,
            boxShadow: '0 32px 80px rgba(0,0,0,0.2)', padding: 28,
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your year in review</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{year}</div>
              <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#aaa' }}>×</button>
            </div>

            {/* Total spend hero */}
            <div style={{ background: ACCENT, borderRadius: 16, padding: '24px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 500 }}>You spent a total of</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>€{totalSpent.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>across rides and food delivery in {year}</div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              <StatBlock emoji="🚗" label="rides taken" value={String(totalRides)} />
              <StatBlock emoji="🍔" label="food orders" value={String(totalOrders)} />
              <StatBlock emoji="💸" label="avg ride fare" value={`€${ridesStats?.avgFare ?? 0}`} />
            </div>

            {/* Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {topRoute && (
                <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>📍</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Most taken route</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{topRoute.route}</div>
                    <div style={{ fontSize: 11, color: ACCENT }}>{topRoute.count} times</div>
                  </div>
                </div>
              )}
              {topRestaurant && (
                <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>🍽️</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Favourite restaurant</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{topRestaurant.restaurant}</div>
                    <div style={{ fontSize: 11, color: ACCENT }}>{topRestaurant.count} orders · €{topRestaurant.spend} spent</div>
                  </div>
                </div>
              )}
              {topItem && (
                <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Most ordered item</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{topItem.item}</div>
                    <div style={{ fontSize: 11, color: ACCENT }}>{topItem.count} times</div>
                  </div>
                </div>
              )}
              {peakRideDay && peakRideDay.count > 0 && (
                <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>📅</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Busiest day for rides</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{peakRideDay.day}</div>
                    <div style={{ fontSize: 11, color: ACCENT }}>{peakRideDay.count} rides</div>
                  </div>
                </div>
              )}
              {peakEatsDay && peakEatsDay.count > 0 && (
                <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>🛋️</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Favourite day to order food</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{peakEatsDay.day}</div>
                    <div style={{ fontSize: 11, color: ACCENT }}>{peakEatsDay.count} orders</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center' }}>Based on data uploaded to Tracely</div>
          </div>
        </>
      )}
    </>
  )
}