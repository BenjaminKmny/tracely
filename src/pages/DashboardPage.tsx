import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { UploadZone } from '../components/upload/UploadZone'
import { Sidebar } from '../components/dashboard/Sidebar'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lastUpload, setLastUpload] = useState<string | null>(null)
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_upload_at')
        .eq('id', user.id)
        .single()

      const { count } = await supabase
        .from('uber_rides')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const uploadAt = profile?.last_upload_at ?? null
      setLastUpload(uploadAt)
      const dataExists = (count ?? 0) > 0
      setHasData(dataExists)
      setLoading(false)

      // If data exists and we're at /dashboard, redirect to rides
      if (dataExists && window.location.pathname === '/dashboard') {
        navigate('/dashboard/rides', { replace: true })
      }
    }
    load()
  }, [user, navigate])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fafafa' }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar lastUpload={lastUpload} />

      <main style={{ marginLeft: 220, flex: 1, padding: '48px 36px', maxWidth: 'calc(100vw - 220px)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {!hasData ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 6 }}>
                  Welcome to Tracely
                </h1>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
                  Upload your Uber data export to see your full spending picture.
                </p>
              </div>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #eee', marginBottom: 20 }}>
                <UploadZone />
              </div>
              <div style={{ background: ACCENT_LIGHT, borderRadius: 12, padding: '14px 18px', border: `1px solid ${ACCENT}22` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>How to get your data</div>
                <ol style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
                  <li>Go to <a href="https://myprivacy.uber.com/exploreyourdata/download" target="_blank" rel="noreferrer" style={{ color: ACCENT }}>myprivacy.uber.com</a></li>
                  <li>Request a copy of your data</li>
                  <li>Wait for the email (usually 24–48 hours)</li>
                  <li>Download the ZIP and drop it above</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 6 }}>
                  Update your data
                </h1>
                <p style={{ fontSize: 14, color: '#aaa' }}>
                  Upload a newer Uber export to add your latest activity.
                </p>
              </div>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #eee' }}>
                <UploadZone />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}