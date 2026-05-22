const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

interface InsightCardProps {
  emoji: string
  text: string
  highlight?: string
  compact?: boolean
}

export function InsightCard({ emoji, text, highlight, compact }: InsightCardProps) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #eee',
      borderRadius: 14,
      padding: compact ? '12px 16px' : '16px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
    }}>
      <div style={{
        width: compact ? 32 : 38,
        height: compact ? 32 : 38,
        background: ACCENT_LIGHT,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: compact ? 16 : 18,
        flexShrink: 0,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: compact ? 12 : 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
          {text}
        </p>
        {highlight && (
          <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, marginTop: 4 }}>
            {highlight}
          </div>
        )}
      </div>
    </div>
  )
}