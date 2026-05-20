import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { UploadZone } from '../components/upload/UploadZone'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
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

      setLastUpload(profile?.last_upload_at ?? null)
      setHasData((count ?? 0) > 0)
      setLoading(false)
    }
    load()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <header style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: '#111', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#111', letterSpacing: '-0.4px' }}>Tracely</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {lastUpload && (
              <span style={{ fontSize: 12, color: '#aaa' }}>
                Last updated {formatDate(lastUpload)}
              </span>
            )}
            <span style={{ fontSize: 13, color: '#888' }}>{user?.email}</span>
            <button
              onClick={handleSignOut}
              style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 58px)' }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 32px' }}>

          {!hasData ? (
            /* Empty state — first upload */
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.6px', marginBottom: 6 }}>
                  Welcome to Tracely
                </h1>
                <p style={{ fontSize: 15, color: '#888', lineHeight: 1.6 }}>
                  Upload your Uber data export to see your full spending picture. Your data is stored securely and privately against your account.
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
            /* Has data — show upload + placeholder for dashboard */
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.6px', marginBottom: 6 }}>
                  Your dashboard
                </h1>
                <p style={{ fontSize: 14, color: '#aaa' }}>
                  Last updated {formatDate(lastUpload)} · <span style={{ color: ACCENT }}>Dashboard charts coming in Phase 5</span>
                </p>
              </div>

              {/* Upload new data */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #eee', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>Update your data</div>
                <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>Upload a newer Uber export to add your latest activity.</div>
                <UploadZone />
              </div>
            </>
          )}
        </main>
      )}
    </div>
  )
}