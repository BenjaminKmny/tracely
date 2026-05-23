import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const ACCENT = '#368CB7'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/rides': 'Rides',
  '/dashboard/eats': 'Uber Eats',
  '/dashboard/insights': 'Insights',
  '/dashboard/upload': 'Upload data',
  '/dashboard/settings': 'Settings',
}

export function MobileHeader() {
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const title = PAGE_TITLES[location.pathname] ?? 'Tracely'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 52,
      background: 'white', borderBottom: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', zIndex: 50,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <Link to="/dashboard/rides" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
        <div style={{ width: 24, height: 24, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#111', letterSpacing: '-0.4px' }}>Tracely</span>
      </Link>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>{title}</span>
      <button
        onClick={handleSignOut}
        style={{ fontSize: 12, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
      >
        Sign out
      </button>
    </div>
  )
}