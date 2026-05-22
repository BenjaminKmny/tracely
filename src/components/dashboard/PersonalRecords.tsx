import { useAllTimeData } from '../../hooks/useAllTimeData'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function RecordRow({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <div style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#bbb' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111', textAlign: 'right' }}>{value}</div>
    </div>
  )
}

interface PersonalRecordsProps {
  compact?: boolean
}

export function PersonalRecords({ compact }: PersonalRecordsProps) {
  const { records, loading } = useAllTimeData()

  if (loading) {
    return (
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 13, color: '#aaa' }}>Loading records...</div>
      </div>
    )
  }

  if (!records) return null

  const currentYear = records.currentYear

  return (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 16 }}>

      {/* Rides records */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>🚗</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Rides records</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>All time</div>

        <RecordRow emoji="🏆" label="Total rides" value={String(records.totalRidesAllTime)} />
        <RecordRow emoji="💰" label="Total spent on rides" value={`€${records.totalSpentRidesAllTime.toLocaleString()}`} />
        {records.mostExpensiveRideAllTime && (
          <RecordRow
            emoji="💸"
            label="Most expensive ride"
            value={`€${records.mostExpensiveRideAllTime.fare}`}
            sub={`${records.mostExpensiveRideAllTime.pickup} → ${records.mostExpensiveRideAllTime.dropoff}`}
          />
        )}
        {records.cheapestRideAllTime && (
          <RecordRow
            emoji="🎯"
            label="Cheapest ride"
            value={`€${records.cheapestRideAllTime.fare}`}
            sub={`${records.cheapestRideAllTime.pickup} → ${records.cheapestRideAllTime.dropoff}`}
          />
        )}
        {records.longestRideAllTime && (
          <RecordRow
            emoji="⏱️"
            label="Longest ride"
            value={`${records.longestRideAllTime.mins} min`}
            sub={`${records.longestRideAllTime.pickup} → ${records.longestRideAllTime.dropoff}`}
          />
        )}
        {records.topRouteAllTime && (
          <RecordRow emoji="📍" label="Most taken route" value={`${records.topRouteAllTime.count}x`} sub={records.topRouteAllTime.route} />
        )}
        {records.topCityAllTime && (
          <RecordRow emoji="🏙️" label="Favourite city" value={records.topCityAllTime.city} sub={`${records.topCityAllTime.count} rides`} />
        )}
        {records.mostActiveMonthRidesAllTime && (
          <RecordRow emoji="📅" label="Busiest month" value={records.mostActiveMonthRidesAllTime.month} sub={`${records.mostActiveMonthRidesAllTime.count} rides`} />
        )}
        <RecordRow emoji="⚡" label="Surge rate" value={`${records.surgeRateAllTime}%`} />

        {records.totalRidesThisYear > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px' }}>{currentYear}</div>
            <RecordRow emoji="🚗" label="Rides this year" value={String(records.totalRidesThisYear)} />
            <RecordRow emoji="💰" label="Spent this year" value={`€${records.totalSpentRidesThisYear.toLocaleString()}`} />
            {records.topRouteThisYear && (
              <RecordRow emoji="📍" label="Top route this year" value={`${records.topRouteThisYear.count}x`} sub={records.topRouteThisYear.route} />
            )}
          </>
        )}
      </div>

      {/* Eats records */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>🍔</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Eats records</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>All time</div>

        <RecordRow emoji="🏆" label="Total orders" value={String(records.totalOrdersAllTime)} />
        <RecordRow emoji="💰" label="Total spent on Eats" value={`€${records.totalSpentEatsAllTime.toLocaleString()}`} />
        <RecordRow emoji="📊" label="Avg order value" value={`€${records.avgOrderAllTime}`} />
        {records.largestOrderAllTime && (
          <RecordRow
            emoji="💸"
            label="Largest order"
            value={`€${records.largestOrderAllTime.total}`}
            sub={`${records.largestOrderAllTime.restaurant} · ${formatDate(records.largestOrderAllTime.date)}`}
          />
        )}
        {records.topRestaurantAllTime && (
          <RecordRow emoji="🍽️" label="Most ordered from" value={`${records.topRestaurantAllTime.count}x`} sub={records.topRestaurantAllTime.restaurant} />
        )}
        {records.topItemAllTime && (
          <RecordRow emoji="⭐" label="Most ordered item" value={`${records.topItemAllTime.count}x`} sub={records.topItemAllTime.item} />
        )}
        {records.mostActiveMonthEatsAllTime && (
          <RecordRow emoji="📅" label="Busiest month" value={records.mostActiveMonthEatsAllTime.month} sub={`${records.mostActiveMonthEatsAllTime.count} orders`} />
        )}

        {records.totalOrdersThisYear > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px' }}>{currentYear}</div>
            <RecordRow emoji="🍔" label="Orders this year" value={String(records.totalOrdersThisYear)} />
            <RecordRow emoji="💰" label="Spent this year" value={`€${records.totalSpentEatsThisYear.toLocaleString()}`} />
            {records.topRestaurantThisYear && (
              <RecordRow emoji="🍽️" label="Top restaurant this year" value={`${records.topRestaurantThisYear.count}x`} sub={records.topRestaurantThisYear.restaurant} />
            )}
            {records.topItemThisYear && (
              <RecordRow emoji="⭐" label="Top item this year" value={`${records.topItemThisYear.count}x`} sub={records.topItemThisYear.item} />
            )}
          </>
        )}
      </div>
    </div>
  )
}