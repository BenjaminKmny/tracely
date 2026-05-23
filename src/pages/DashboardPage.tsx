import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BottomTabBar } from '../components/dashboard/BottomTabBar'
import { MobileHeader } from '../components/dashboard/MobileHeader'
import { Sidebar } from '../components/dashboard/Sidebar'
import { useIsMobile } from '../hooks/useIsMobile'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!user) return
    supabase
      .from('uber_rides')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        navigate(data ? '/dashboard/rides' : '/dashboard/upload', { replace: true })
      })
  }, [user])

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <Sidebar />
      {isMobile && <MobileHeader />}
      {isMobile && <BottomTabBar />}

      <main style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            border: `3px solid ${ACCENT_LIGHT}`,
            borderTop: `3px solid ${ACCENT}`,
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    </div>
  )
}