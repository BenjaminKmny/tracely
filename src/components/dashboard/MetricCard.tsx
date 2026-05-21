import { useState } from 'react'

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  tooltip?: string
}

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

export function MetricCard({ label, value, sub, accent, tooltip }: MetricCardProps) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div style={{
      background: accent ? ACCENT_LIGHT : 'white',
      border: `1px solid ${accent ? ACCENT + '33' : '#eee'}`,
      borderRadius: 14,
      padding: '16px 18px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        {tooltip && (
          <div
            style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#ccc">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showTip && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                marginBottom: 6, background: '#111', color: 'white',
                fontSize: 11, padding: '6px 10px', borderRadius: 7,
                whiteSpace: 'nowrap', zIndex: 50,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                {tooltip}
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #111' }} />
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent ? ACCENT : '#111', letterSpacing: '-0.5px', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#bbb', marginTop: 5 }}>{sub}</div>
      )}
    </div>
  )
}