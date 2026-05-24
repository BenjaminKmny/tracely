import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/dashboard/Sidebar'
import { UploadZone } from '../components/upload/UploadZone'
import { BottomTabBar } from '../components/dashboard/BottomTabBar'
import { MobileHeader } from '../components/dashboard/MobileHeader'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

export function UploadPage() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [lastUpload, setLastUpload] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('last_upload_at').eq('id', user.id).single()
      .then(({ data }) => setLastUpload(data?.last_upload_at ?? null))
  }, [user])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      <Sidebar lastUpload={lastUpload} />
      {isMobile && <MobileHeader />}
      {isMobile && <BottomTabBar />}

      <main style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1,
        padding: isMobile ? '68px 16px 88px' : '32px 36px',
        maxWidth: isMobile ? '100vw' : 'calc(100vw - 220px)',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 560 }}>
          {!isMobile && (
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>Update your data</h1>
              <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>Upload a newer Uber export to add your latest activity.</p>
            </div>
          )}

          <UploadZone />

          {/* Guide link */}
          <div style={{ marginTop: 20, background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>Don't have your data yet?</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>Follow our step-by-step guide to download it from Uber in 5 minutes.</div>
            </div>
            <Link to="/dashboard/guide" style={{ fontSize: 13, fontWeight: 600, color: ACCENT, background: ACCENT_LIGHT, border: `1px solid ${ACCENT}33`, borderRadius: 8, padding: '7px 14px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              View guide →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}