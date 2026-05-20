interface MetricCardProps {
    label: string
    value: string
    sub?: string
    accent?: boolean
  }
  
  const ACCENT = '#368CB7'
  const ACCENT_LIGHT = '#EBF4FA'
  
  export function MetricCard({ label, value, sub, accent }: MetricCardProps) {
    return (
      <div style={{
        background: accent ? ACCENT_LIGHT : 'white',
        border: `1px solid ${accent ? ACCENT + '33' : '#eee'}`,
        borderRadius: 14,
        padding: '16px 18px',
      }}>
        <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
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