import { useState } from 'react'

interface BarChartProps {
  data: { label: string; value: number }[]
  title: string
  prefix?: string
  suffix?: string
  color?: string
  height?: number
}

const ACCENT = '#368CB7'

export function BarChart({ data, title, prefix = '', suffix = '', color = ACCENT, height = 140 }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{title}</div>
        {hovered !== null && (
          <div style={{ fontSize: 12, fontWeight: 700, color: color }}>
            {data[hovered].label}: {prefix}{data[hovered].value.toLocaleString('en-EU', { minimumFractionDigits: prefix === '€' ? 0 : 0 })}{suffix}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
        {data.map((d, i) => {
          const h = max > 0 ? (d.value / max) * 100 : 0
          const isHov = hovered === i
          const isDim = hovered !== null && !isHov
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: 1,
                borderRadius: '3px 3px 0 0',
                height: `${Math.max(h, d.value > 0 ? 3 : 0)}%`,
                background: isHov ? color : isDim ? '#e8e8e8' : color + '77',
                cursor: 'pointer',
                transition: 'all 0.15s',
                transform: isHov ? 'scaleY(1.03)' : 'scaleY(1)',
                transformOrigin: 'bottom',
                minHeight: d.value > 0 ? 4 : 0,
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{
            flex: 1,
            fontSize: 9,
            color: hovered === i ? color : '#ccc',
            textAlign: 'center',
            fontWeight: hovered === i ? 700 : 400,
            transition: 'color 0.15s',
            overflow: 'hidden',
          }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}