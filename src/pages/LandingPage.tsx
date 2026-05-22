import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

// ─── Data ─────────────────────────────────────────────────────────────────────

const RIDES_MONTHLY = [41, 0, 15, 71, 53, 104, 244, 75, 64, 57, 31, 147]
const EATS_MONTHLY  = [68, 155, 204, 329, 149, 376, 260, 299, 202, 310, 183, 229]
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const RIDES_STATS = [
  { label: 'Total spent', value: '€1,294' },
  { label: 'Rides',       value: '88' },
  { label: 'Avg fare',    value: '€21.93' },
  { label: 'Surge rides', value: '17' },
]
const EATS_STATS = [
  { label: 'Total spent', value: '€3,362' },
  { label: 'Orders',      value: '74' },
  { label: 'Avg order',   value: '€45.43' },
  { label: 'Top item',    value: 'Bowl' },
]

// Per-month route/restaurant data
const RIDES_BY_MONTH = [
  [{ name: 'Nova Zemblastraat → Osdorpplein', pct: 100, count: 3 }, { name: 'Schiphol → Van Oldenbarneveldtstr.', pct: 67, count: 2 }, { name: 'Leidseplein → Home', pct: 33, count: 1 }],
  [{ name: 'No rides this month', pct: 0, count: 0 }, { name: '', pct: 0, count: 0 }, { name: '', pct: 0, count: 0 }],
  [{ name: 'Centraal → Nova Zemblastraat', pct: 100, count: 1 }, { name: '', pct: 0, count: 0 }, { name: '', pct: 0, count: 0 }],
  [{ name: 'Nova Zemblastraat → Osdorpplein', pct: 100, count: 4 }, { name: 'Schiphol → Home', pct: 75, count: 3 }, { name: 'Leidseplein → Home', pct: 50, count: 2 }],
  [{ name: '2e Hugo de Grootstr. → Schiphol', pct: 100, count: 3 }, { name: 'Nova Zemblastraat → Centraal', pct: 67, count: 2 }, { name: 'Rembrandtplein → Home', pct: 33, count: 1 }],
  [{ name: 'Nova Zemblastraat → Osdorpplein', pct: 100, count: 5 }, { name: '2e Hugo de Grootstr. → Schiphol', pct: 60, count: 3 }, { name: 'Schiphol → Home', pct: 40, count: 2 }],
  [{ name: 'Nova Zemblastraat → Osdorpplein', pct: 100, count: 11 }, { name: 'Schiphol → Van Oldenbarneveldtstr.', pct: 55, count: 6 }, { name: '2e Hugo de Grootstr. → Schiphol', pct: 45, count: 5 }],
  [{ name: '2e Hugo de Grootstr. → Vijzelstraat', pct: 100, count: 3 }, { name: 'Nova Zemblastraat → Schiphol', pct: 67, count: 2 }, { name: 'Schiphol → Home', pct: 33, count: 1 }],
  [{ name: 'Nieuwmarkt → Home', pct: 100, count: 2 }, { name: 'Centraal → Nova Zemblastraat', pct: 50, count: 1 }, { name: '', pct: 0, count: 0 }],
  [{ name: 'Nova Zemblastraat → Osdorpplein', pct: 100, count: 2 }, { name: 'Schiphol → Home', pct: 50, count: 1 }, { name: '', pct: 0, count: 0 }],
  [{ name: 'Centraal → Nova Zemblastraat', pct: 100, count: 2 }, { name: 'Leidseplein → Home', pct: 50, count: 1 }, { name: '', pct: 0, count: 0 }],
  [{ name: 'Nova Zemblastraat → Osdorpplein', pct: 100, count: 6 }, { name: 'Schiphol → Home', pct: 67, count: 4 }, { name: 'Leidseplein → Nova Zemblastraat', pct: 33, count: 2 }],
]

const EATS_BY_MONTH = [
  [{ name: 'Sushi One', pct: 100, count: 1 }, { name: "McDonald's", pct: 0, count: 0 }, { name: "Papa John's", pct: 0, count: 0 }],
  [{ name: "McDonald's", pct: 100, count: 3 }, { name: 'Sushi One', pct: 67, count: 2 }, { name: 'Thunderbuns', pct: 33, count: 1 }],
  [{ name: 'Bollywood Indian', pct: 100, count: 3 }, { name: "McDonald's", pct: 67, count: 2 }, { name: 'Sushi One', pct: 33, count: 1 }],
  [{ name: "Papa John's", pct: 100, count: 5 }, { name: 'Sushi One', pct: 60, count: 3 }, { name: 'Burger Maffia', pct: 40, count: 2 }],
  [{ name: 'Sushito West', pct: 100, count: 2 }, { name: 'KFC', pct: 50, count: 1 }, { name: '', pct: 0, count: 0 }],
  [{ name: 'Sushi One', pct: 100, count: 4 }, { name: 'Burger Maffia', pct: 75, count: 3 }, { name: "McDonald's", pct: 50, count: 2 }],
  [{ name: 'Sushi One', pct: 100, count: 4 }, { name: "Papa John's", pct: 75, count: 3 }, { name: 'Thunderbuns', pct: 50, count: 2 }],
  [{ name: "Papa John's", pct: 100, count: 4 }, { name: 'Sushito Nieuw-West', pct: 75, count: 3 }, { name: 'Bollywood Indian', pct: 50, count: 2 }],
  [{ name: 'Burger Maffia', pct: 100, count: 3 }, { name: 'Sushi One', pct: 67, count: 2 }, { name: 'KFC', pct: 33, count: 1 }],
  [{ name: 'Sushi One', pct: 100, count: 5 }, { name: "McDonald's", pct: 80, count: 4 }, { name: 'Thunderbuns', pct: 60, count: 3 }],
  [{ name: "Papa John's", pct: 100, count: 3 }, { name: 'Sushi One', pct: 67, count: 2 }, { name: 'Burger Maffia', pct: 33, count: 1 }],
  [{ name: 'Sushi One', pct: 100, count: 5 }, { name: 'Bollywood Indian', pct: 60, count: 3 }, { name: "McDonald's", pct: 40, count: 2 }],
]

const RIDES_RESTAURANTS = [
  { name: 'Nova Zemblastraat → Osdorpplein', pct: 100, count: 11 },
  { name: 'Schiphol → Van Oldenbarneveldtstr.', pct: 55, count: 6 },
  { name: '2e Hugo de Grootstr. → Schiphol', pct: 45, count: 5 },
]
const EATS_RESTAURANTS = [
  { name: 'Sushi One', pct: 100, count: 12 },
  { name: "McDonald's", pct: 58, count: 7 },
  { name: "Papa John's", pct: 42, count: 5 },
]

const testimonials = [
  { quote: "I finally feel in control of my finances. Seeing everything laid out made it so easy to spot where I could cut back.", name: "Marta V.", location: "Amsterdam" },
  { quote: "I had no idea the same route was costing me so differently depending on the day. Now I plan around it.", name: "James K.", location: "London" },
  { quote: "Two minutes to set up and I had a complete picture of my spending going back years. Genuinely eye-opening.", name: "Sofia R.", location: "Madrid" },
  { quote: "Never realised how much those late-night food orders were adding up. Tracely showed me in seconds.", name: "Pieter D.", location: "Rotterdam" },
  { quote: "The route breakdown completely changed how I think about getting around the city.", name: "Aisha M.", location: "Berlin" },
]

const features = [
  {
    title: 'Ride history at a glance',
    description: 'See your most frequent routes, average fare, surge pricing history, and peak hours.',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  },
  {
    title: 'Food delivery insights',
    description: 'What you order, how often, from which places, and what it adds up to over time.',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    title: 'Trends over time',
    description: 'Monthly and yearly charts that reveal when your spending changed.',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  },
  {
    title: 'Meal replacements (Pro)',
    description: 'AI suggestions to recreate your top orders at home, with live supermarket pricing.',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
]

// ─── Browser mockup ────────────────────────────────────────────────────────────

function BrowserMockup() {
  const [tab, setTab] = useState<'rides' | 'eats'>('eats')
  const [hovered, setHovered] = useState<number | null>(null)

  const monthly  = tab === 'rides' ? RIDES_MONTHLY : EATS_MONTHLY
  const stats    = tab === 'rides' ? RIDES_STATS   : EATS_STATS
  const byMonth  = tab === 'rides' ? RIDES_BY_MONTH : EATS_BY_MONTH
  const maxVal   = Math.max(...monthly)

  const activeRows = hovered !== null ? byMonth[hovered] : (tab === 'rides' ? RIDES_RESTAURANTS : EATS_RESTAURANTS)

  const activeStats = hovered !== null
    ? stats.map((s, i) => {
        if (i === 0) return { ...s, value: `€${monthly[hovered]}` }
        if (i === 1) return { ...s, value: MONTHS[hovered] }
        return s
      })
    : stats

  return (
    <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e8e8', boxShadow: '0 40px 100px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.05)' }}>
      <div style={{ background: '#f5f5f5', borderBottom: '1px solid #e8e8e8', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        <div style={{ flex: 1, background: 'white', borderRadius: 6, height: 22, margin: '0 12px', display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>app.tracely.co/dashboard</span>
        </div>
      </div>
      <div style={{ padding: 20, background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>Tracely</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['rides', 'eats'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setHovered(null) }}
                style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: tab === t ? ACCENT : '#f5f5f5', color: tab === t ? 'white' : '#888', transition: 'all 0.15s', textTransform: 'capitalize' }}
              >{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
          {activeStats.map((c, i) => (
            <div key={i} style={{ background: '#fafafa', borderRadius: 8, padding: '8px 10px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 9, color: '#aaa', marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: hovered !== null && i === 0 ? ACCENT : '#111', transition: 'color 0.2s' }}>{c.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 12px', marginBottom: 12, border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#888', fontWeight: 500 }}>Monthly spend</div>
            {hovered !== null && <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT }}>{MONTHS[hovered]}: €{monthly[hovered]}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 56 }}>
            {monthly.map((v, i) => {
              const h = maxVal > 0 ? (v / maxVal) * 100 : 0
              const isHov = hovered === i
              const isDim = hovered !== null && !isHov
              return (
                <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${Math.max(h, 4)}%`, background: isHov ? ACCENT : isDim ? '#e8e8e8' : ACCENT + '66', cursor: 'pointer', transition: 'all 0.15s', transform: isHov ? 'scaleY(1.04)' : 'scaleY(1)', transformOrigin: 'bottom' }}
                />
              )
            })}
          </div>
          <div style={{ display: 'flex', marginTop: 4 }}>
            {MONTHS.map((m, i) => (
              <div key={m} style={{ flex: 1, fontSize: 7, color: hovered === i ? ACCENT : '#ccc', textAlign: 'center', fontWeight: hovered === i ? 700 : 400, transition: 'color 0.15s' }}>{m}</div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 7, fontWeight: 500 }}>
            {tab === 'rides' ? 'Top routes' : 'Top restaurants'}
            {hovered !== null && <span style={{ color: ACCENT, marginLeft: 6 }}>({MONTHS[hovered]})</span>}
          </div>
          {activeRows.map((r, i) => (
            <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
                opacity: r.name ? 1 : 0,
                minHeight: 11,
            }}>
                <div style={{
                fontSize: 9,
                color: '#555',
                width: 160,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                }}>
                {r.name || 'Placeholder'}
                </div>

                <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 3, height: 5 }}>
                <div style={{
                    width: `${r.pct}%`,
                    height: '100%',
                    background: ACCENT,
                    borderRadius: 3,
                    transition: 'width 0.35s ease',
                }} />
                </div>

                <div style={{ fontSize: 9, color: '#888', width: 20, textAlign: 'right' }}>
                {r.count > 0 ? `${r.count}x` : ''}
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ─── Phone mockup (original slim design) ─────────────────────────────────────

function PhoneMockup() {
    return (
      <div style={{
        width: 132,
        background: '#0b0b0b',
        borderRadius: 32,
        padding: 5,
        boxShadow: '0 24px 60px rgba(0,0,0,0.24), inset 0 0 0 1px #2a2a2a',
        position: 'relative',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 27,
          minHeight: 270,
          overflow: 'hidden',
          position: 'relative',
          padding: '34px 9px 10px',
        }}>
          <div style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 34,
            height: 5,
            background: '#333',
            borderRadius: 20,
            zIndex: 2,
          }} />
  
          <div style={{
            fontSize: 8,
            fontWeight: 800,
            color: '#111',
            marginBottom: 10,
            letterSpacing: '-0.2px',
          }}>
            This week
          </div>
  
          <div style={{
            background: ACCENT_LIGHT,
            borderRadius: 10,
            padding: '8px',
            marginBottom: 7,
          }}>
            <div style={{
              fontSize: 7,
              color: ACCENT,
              fontWeight: 700,
              marginBottom: 3,
            }}>
              Uber Eats
            </div>
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111',
              letterSpacing: '-0.8px',
              lineHeight: 1,
            }}>
              €45.43
            </div>
            <div style={{ fontSize: 6.5, color: '#aaa', marginTop: 3 }}>
              avg order this week
            </div>
          </div>
  
          <div style={{
            background: '#f7f7f7',
            borderRadius: 10,
            padding: '8px',
            marginBottom: 7,
          }}>
            <div style={{
              fontSize: 7,
              color: '#888',
              fontWeight: 600,
              marginBottom: 3,
            }}>
              Rides
            </div>
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111',
              letterSpacing: '-0.8px',
              lineHeight: 1,
            }}>
              3
            </div>
            <div style={{ fontSize: 6.5, color: '#aaa', marginTop: 3 }}>
              trips this week
            </div>
          </div>
  
          <div style={{
            background: '#f7f7f7',
            borderRadius: 10,
            padding: '8px',
          }}>
            <div style={{
              fontSize: 7,
              color: '#888',
              marginBottom: 3,
            }}>
              Top order
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#111',
              letterSpacing: '-0.2px',
            }}>
              Build Your Bowl
            </div>
            <div style={{ fontSize: 6.5, color: '#aaa', marginTop: 3 }}>
              ordered 47 times
            </div>
          </div>
  
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: 6,
            transform: 'translateX(-50%)',
            width: 34,
            height: 4,
            background: '#333',
            borderRadius: 4,
          }} />
        </div>
      </div>
    )
  }

// ─── Upload animation (original timing) ──────────────────────────────────────

function UploadAnimation() {
  const [frame, setFrame] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const delays = [2000, 1000, 1500, 2500, 2000]
    let i = 0
    const advance = () => {
      i = (i + 1) % 5
      setFrame(i)
      timerRef.current = setTimeout(advance, delays[i])
    }
    timerRef.current = setTimeout(advance, delays[0])
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
        @keyframes prog   { from { width:0 } to { width:68% } }
      `}</style>

      {frame === 0 && (
        <div key="idle" style={{ textAlign: 'center', animation: 'fadeUp .4s ease', width: 260 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '2px dashed #d4e4f0', padding: '36px 28px' }}>
            <div style={{ width: 46, height: 46, background: ACCENT_LIGHT, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={ACCENT}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 5 }}>Drop your Uber data export here</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>ZIP file from privacy.uber.com</div>
          </div>
        </div>
      )}

      {frame === 1 && (
        <div key="hover" style={{ textAlign: 'center', animation: 'fadeUp .3s ease', width: 260, position: 'relative' }}>
          <div style={{ background: ACCENT_LIGHT, borderRadius: 16, border: `2px dashed ${ACCENT}`, padding: '36px 28px' }}>
            <div style={{ width: 46, height: 46, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={ACCENT}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>Release to upload</div>
          </div>
          <div style={{ position: 'absolute', top: -22, right: 10, background: 'white', border: '1px solid #e0e8f0', borderRadius: 10, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(54,140,183,0.12)', animation: 'floatY 1s ease-in-out infinite' }}>
            <div style={{ width: 26, height: 26, background: '#FFF3E0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#F57C00"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#333' }}>Uber_Data.zip</div>
              <div style={{ fontSize: 9, color: '#aaa' }}>43.2 MB</div>
            </div>
          </div>
        </div>
      )}

      {frame === 2 && (
        <div key="parse" style={{ textAlign: 'center', animation: 'fadeUp .3s ease', width: 260 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eee', padding: '32px 24px' }}>
            <div style={{ width: 42, height: 42, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', margin: '0 auto 14px', animation: 'spin .9s linear infinite' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 5 }}>Reading your data</div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 14 }}>288 rides and 74 orders found</div>
            <div style={{ background: '#f5f5f5', borderRadius: 100, height: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: ACCENT, borderRadius: 100, animation: 'prog 1.5s ease forwards' }} />
            </div>
          </div>
        </div>
      )}

      {frame === 3 && (
        <div key="done" style={{ textAlign: 'center', animation: 'fadeUp .4s ease', width: 300 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e6f4eb', padding: '24px', marginBottom: 10 }}>
            <div style={{ width: 42, height: 42, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#22C55E"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3 }}>Your dashboard is ready</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>288 rides and 74 food orders imported</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
            {[{ l: 'Rides', v: '€1,294' }, { l: 'Eats', v: '€3,362' }, { l: 'Avg fare', v: '€21.93' }].map(c => (
              <div key={c.l} style={{ background: 'white', borderRadius: 10, padding: '9px', border: '1px solid #eee', animation: 'fadeUp .5s ease' }}>
                <div style={{ fontSize: 8, color: '#aaa', marginBottom: 3 }}>{c.l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{c.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {frame === 4 && (
        <div key="dashboard" style={{ width: '100%', animation: 'fadeUp .5s ease' }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eee', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Your dashboard</div>
              <div style={{ fontSize: 9, color: ACCENT, fontWeight: 500 }}>Updated just now</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
              {[{ l: 'Rides', v: '€1,294' }, { l: 'Eats', v: '€3,362' }, { l: 'Avg fare', v: '€21.93' }, { l: 'Top route', v: '11x' }].map(c => (
                <div key={c.l} style={{ background: '#fafafa', borderRadius: 6, padding: '6px 8px' }}>
                  <div style={{ fontSize: 8, color: '#aaa' }}>{c.l}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{c.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44 }}>
              {[30, 55, 45, 80, 40, 100, 75, 90, 55, 70, 80, 60].map((h, i) => (
                <div key={i} style={{ flex: 1, background: i === 5 ? ACCENT : '#eee', borderRadius: '2px 2px 0 0', height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Infinite testimonial carousel ───────────────────────────────────────────

const CARD_WIDTH = 300
const CARD_GAP = 18

function TestimonialCarousel() {
  const [index, setIndex] = useState(testimonials.length)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isMoving, setIsMoving] = useState(false)

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const infinite = [...testimonials, ...testimonials, ...testimonials]

  const resetAutoTimer = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)

    autoTimerRef.current = setTimeout(() => {
      setIsAnimating(true)
      setIsMoving(true)
      setIndex(i => i + 1)
    }, 4200)
  }

  useEffect(() => {
    resetAutoTimer()

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    }
  }, [])

  const goTo = (next: number) => {
    if (isMoving) return

    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)

    setIsAnimating(true)
    setIsMoving(true)
    setIndex(next)
  }

  const goNext = () => {
    if (isMoving) return

    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)

    setIsAnimating(true)
    setIsMoving(true)
    setIndex(i => i + 1)
  }

  const goPrev = () => {
    if (isMoving) return

    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)

    setIsAnimating(true)
    setIsMoving(true)
    setIndex(i => i - 1)
  }

  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.propertyName !== 'transform') return

    setIsMoving(false)

    if (index <= 0) {
      setIsAnimating(false)
      setIndex(testimonials.length)
    } else if (index >= testimonials.length * 2) {
      setIsAnimating(false)
      setIndex(testimonials.length)
    }

    resetAutoTimer()
  }

  const offset = index * (CARD_WIDTH + CARD_GAP)

  const realIndex =
    ((index - testimonials.length) % testimonials.length + testimonials.length) %
    testimonials.length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#aaa',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          What people say
        </div>

        <h2 style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#111',
          letterSpacing: '-0.8px',
        }}>
          The feeling of finally knowing
        </h2>
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: CARD_WIDTH + 180,
        margin: '0 auto',
        overflow: 'visible',
      }}>
        <div style={{
          overflow: 'hidden',
          borderRadius: 16,
        }}>
          <div
            onTransitionEnd={onTransitionEnd}
            style={{
              display: 'flex',
              gap: CARD_GAP,
              transition: isAnimating
                ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
                : 'none',
              transform: `translateX(calc(-${offset}px + 50% - ${CARD_WIDTH / 2}px))`,
            }}
          >
            {infinite.map((t, i) => {
              const isActive = i === index

              return (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: CARD_WIDTH,
                    minWidth: CARD_WIDTH,
                    maxWidth: CARD_WIDTH,
                    background: 'white',
                    borderRadius: 16,
                    padding: '26px 22px',
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `1.5px solid ${isActive ? ACCENT + '55' : '#eee'}`,
                    transition: 'opacity 0.35s ease, transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
                    opacity: isActive ? 1 : 0.22,
                    transform: isActive ? 'scale(1)' : 'scale(0.92)',
                    boxShadow: isActive ? `0 8px 32px ${ACCENT}15` : 'none',
                    cursor: isMoving ? 'default' : 'pointer',
                    flexShrink: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: 32,
                      color: ACCENT,
                      lineHeight: 1,
                      marginBottom: 10,
                      fontWeight: 900,
                    }}>
                      "
                    </div>

                    <p style={{
                      fontSize: 14,
                      color: '#444',
                      lineHeight: 1.55,
                      marginBottom: 18,
                      fontStyle: 'italic',
                      minHeight: 90,
                    }}>
                      {t.quote}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: ACCENT_LIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                      color: ACCENT,
                      flexShrink: 0,
                    }}>
                      {t.name[0]}
                    </div>

                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#bbb' }}>
                        {t.location}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={goPrev} style={{
          position: 'absolute',
          left: -42,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid #e0e0e0',
          background: 'white',
          cursor: isMoving ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 2,
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#555">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button onClick={goNext} style={{
          position: 'absolute',
          right: -42,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid #e0e0e0',
          background: 'white',
          cursor: isMoving ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 2,
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#555">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i + testimonials.length)}
            style={{
              width: realIndex === i ? 20 : 6,
              height: 6,
              borderRadius: 100,
              border: 'none',
              background: realIndex === i ? ACCENT : '#ddd',
              cursor: isMoving ? 'default' : 'pointer',
              transition: 'all 0.3s',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid #f0f0f0', padding: '0 32px', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: '#111', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#111', letterSpacing: '-0.4px' }}>Tracely</span>
            </div>
            <nav style={{ display: 'flex', gap: 2 }}>
              {[{ label: 'How it works', href: '#how-it-works' }, { label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }].map(item => (
                <a key={item.label} href={item.href}
                  style={{ fontSize: 14, color: '#666', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#666')}
                >{item.label}</a>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link to="/login" style={{ fontSize: 14, color: '#666', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, fontWeight: 500 }}>Log in</Link>
            <Link to="/signup" style={{ fontSize: 14, background: ACCENT, color: 'white', textDecoration: 'none', padding: '8px 18px', borderRadius: 9, fontWeight: 700 }}>Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '100px 32px 72px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0F7FF', border: '1px solid #C8DFF0', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={ACCENT}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>Your data stays yours. GDPR compliant. Delete anytime.</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 6.5vw, 72px)', fontWeight: 900, color: '#111', lineHeight: 1.02, letterSpacing: '-2.5px', marginBottom: 22 }}>
            Take back control of your finances
          </h1>
          <p style={{ fontSize: 18, color: '#888', lineHeight: 1.65, maxWidth: 500, margin: '0 auto 52px' }}>
            Connect the dots between your spending and your habits. Upload your data from apps like Uber and finally understand where your money goes each month.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <Link to="/signup" style={{ fontSize: 15, background: ACCENT, color: 'white', textDecoration: 'none', padding: '13px 28px', borderRadius: 10, fontWeight: 700 }}>Start for free</Link>
            <a href="#how-it-works" style={{ fontSize: 15, color: '#666', textDecoration: 'none', padding: '13px 28px', borderRadius: 10, fontWeight: 500, border: '1px solid #e8e8e8' }}>See how it works</a>
          </div>
          <div style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>Free forever. No credit card needed.</div>
        </div>
        <div style={{ maxWidth: 880, margin: '64px auto 0', padding: '0 16px' }}>
          <BrowserMockup />
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '64px 0', borderTop: '1px solid #f5f5f5', background: '#fafafa', overflow: 'hidden' }}>
        <TestimonialCarousel />
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '88px 32px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>How it works</div>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: '#111', letterSpacing: '-1.2px', marginBottom: 14 }}>Up and running in two minutes</h2>
              <p style={{ fontSize: 15, color: '#888', lineHeight: 1.7, marginBottom: 36 }}>
                No account linking. No sharing passwords. You request your own data, upload it here, and we do the rest. Your information never leaves our secure, GDPR-compliant platform without your permission.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {[
                  { n: '01', title: 'Request your data export', desc: <span>Visit <a href="https://myprivacy.uber.com/exploreyourdata/download" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>myprivacy.uber.com</a> and download your personal data archive. It arrives as a ZIP file within 48 hours.</span> },
                  { n: '02', title: 'Drop it into Tracely', desc: 'Drag the ZIP straight into the app. We parse everything instantly, right in your browser.' },
                  { n: '03', title: 'Understand your habits', desc: 'Your full history appears as a clean dashboard. Upload again anytime to keep things current.' },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, background: ACCENT, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: '#888', lineHeight: 1.55 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#f7f9fb', borderRadius: 20, border: '1px solid #e4edf4', overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '88px 32px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#111', letterSpacing: '-1.5px', marginBottom: 14 }}>Clarity, not just numbers</h2>
            <p style={{ fontSize: 16, color: '#888', maxWidth: 420, margin: '0 auto' }}>Tracely turns raw spending data into insights you can actually act on.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {features.map(f => (
              <div key={f.title} style={{ border: '1px solid #eee', borderRadius: 16, padding: '24px', background: 'white' }}>
                <div style={{ width: 40, height: 40, background: ACCENT_LIGHT, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Devices */}
      <section style={{ padding: '88px 32px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ flex: 1, maxWidth: 400 }}><BrowserMockup /></div>
            <div style={{ marginLeft: -20, marginBottom: 8 }}><PhoneMockup /></div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Wherever you are</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: '#111', letterSpacing: '-1.2px', marginBottom: 14 }}>Your financial picture, always in reach</h2>
            <p style={{ fontSize: 15, color: '#888', lineHeight: 1.7, marginBottom: 28 }}>Whether you want a deep dive on desktop or a quick gut-check on your phone, Tracely works beautifully across every screen.</p>
            {['Full analytics dashboard on desktop', 'Quick weekly summaries on mobile', 'Synced across all your devices instantly'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, background: ACCENT_LIGHT, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke={ACCENT}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span style={{ fontSize: 14, color: '#555' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '88px 32px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: '#111', letterSpacing: '-1.2px', marginBottom: 12 }}>Start free, upgrade when ready</h2>
            <p style={{ fontSize: 15, color: '#888' }}>No tricks, no hidden fees.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 20, padding: '28px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 8 }}>Free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>€0</span>
                <span style={{ fontSize: 13, color: '#aaa' }}>/month</span>
              </div>
              {['Rides dashboard', 'Eats dashboard', 'Full history', 'Upload every 2 months', 'GDPR data deletion'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22C55E"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span style={{ fontSize: 13, color: '#555' }}>{item}</span>
                </div>
              ))}
              <Link to="/signup" style={{ display: 'block', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#111', border: '1px solid #e0e0e0', borderRadius: 10, padding: '12px 0', textDecoration: 'none', marginTop: 24 }}>Get started free</Link>
            </div>
            <div style={{ background: '#111', borderRadius: 20, padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Pro</span>
                <span style={{ fontSize: 10, background: ACCENT, color: 'white', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>Coming soon</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>€6.99</span>
                <span style={{ fontSize: 13, color: '#555' }}>/month</span>
              </div>
              {['Everything in Free', 'Unlimited uploads', 'Bolt, Deliveroo and more', 'AI meal replacement suggestions', 'Live ingredient pricing'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={ACCENT}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span style={{ fontSize: 13, color: '#888' }}>{item}</span>
                </div>
              ))}
              <button disabled style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#444', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 0', background: 'transparent', cursor: 'not-allowed', marginTop: 24 }}>Coming soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 900, color: '#111', letterSpacing: '-1.8px', marginBottom: 16 }}>Financial clarity starts here</h2>
          <p style={{ fontSize: 16, color: '#888', marginBottom: 32, lineHeight: 1.65 }}>Join people who finally understand their spending. Free to start, takes two minutes.</p>
          <Link to="/signup" style={{ fontSize: 15, background: ACCENT, color: 'white', textDecoration: 'none', padding: '14px 36px', borderRadius: 12, fontWeight: 800, display: 'inline-block' }}>Start for free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, background: '#111', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>Tracely</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/privacy" style={{ fontSize: 12, color: '#bbb', textDecoration: 'none' }}>Privacy policy</Link>
            <a href="#" style={{ fontSize: 12, color: '#bbb', textDecoration: 'none' }}>Terms of service</a>
          </div>
          <span style={{ fontSize: 12, color: '#ddd' }}>2026 Tracely</span>
        </div>
      </footer>

    </div>
  )
}