const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

interface SpendingPaceProps {
  monthlySpend: { month: string; amount: number }[]
  year: number
  label: string
}

export function SpendingPace({ monthlySpend, year, label }: SpendingPaceProps) {
  const currentMonth = new Date().getFullYear() === year ? new Date().getMonth() : 11
  const monthsWithData = monthlySpend.slice(0, currentMonth + 1).filter(m => m.amount > 0)
  const totalSoFar = monthlySpend.reduce((s, m) => s + m.amount, 0)

  if (monthsWithData.length === 0) return null

  const avgPerMonth = totalSoFar / (currentMonth + 1)
  const projected = Math.round(avgPerMonth * 12 * 100) / 100
  const remaining = monthlySpend.slice(currentMonth + 1)
  const projectedRemaining = Math.round(avgPerMonth * remaining.length * 100) / 100

  const isCurrentYear = new Date().getFullYear() === year

  return (
    <div style={{
      background: ACCENT_LIGHT,
      border: `1px solid ${ACCENT}22`,
      borderRadius: 14,
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
          {isCurrentYear ? `${label} pace` : `${label} total`}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>
          €{totalSoFar.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          spent in {year}
        </div>
      </div>
      {isCurrentYear && remaining.length > 0 && (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Projected full year</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>€{projected.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>~€{projectedRemaining} more to come</div>
        </div>
      )}
    </div>
  )
}