import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Sidebar } from '../components/dashboard/Sidebar'
import { BottomTabBar } from '../components/dashboard/BottomTabBar'
import { MobileHeader } from '../components/dashboard/MobileHeader'
import { useIsMobile } from '../hooks/useIsMobile'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [lastUpload, setLastUpload] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState<{ rides: number; orders: number } | null>(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('last_upload_at').eq('id', user.id).single()
      setLastUpload(profile?.last_upload_at ?? null)
      const { count: ridesCount } = await supabase.from('uber_rides').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const { count: ordersCount } = await supabase.from('uber_eats_orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setStats({ rides: ridesCount ?? 0, orders: ordersCount ?? 0 })
    }
    load()
  }, [user])

  const handleDeleteData = async () => {
    if (!user) return
    setDeleting(true)
    await supabase.from('uber_eats_items').delete().eq('user_id', user.id)
    await supabase.from('uber_eats_orders').delete().eq('user_id', user.id)
    await supabase.from('uber_rides').delete().eq('user_id', user.id)
    await supabase.from('profiles').update({ last_upload_at: null }).eq('id', user.id)
    setDeleting(false)
    setShowConfirm(false)
    setStats({ rides: 0, orders: 0 })
    setLastUpload(null)
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Failed to delete account')
      await signOut()
      navigate('/')
    } catch (e: any) {
      console.error('Delete account error:', e)
      alert(`Failed to delete account: ${e.message}`)
      setDeleting(false)
    }
  }

  const handleDownloadData = async () => {
    if (!user) return
    const { data: rides } = await supabase.from('uber_rides').select('*').eq('user_id', user.id).order('date', { ascending: true })
    const { data: orders } = await supabase.from('uber_eats_orders').select('*').eq('user_id', user.id).order('date', { ascending: true })
    const { data: items } = await supabase.from('uber_eats_items').select('*').eq('user_id', user.id)
    const exportData = { exported_at: new Date().toISOString(), account: { email: user.email }, rides: rides ?? [], eats_orders: orders ?? [], eats_items: items ?? [] }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tracely-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: '...', overflowX: 'hidden' }}>
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
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>Settings</h1>
              <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>Manage your account and data</p>
            </div>
          )}

          {/* Account info */}
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '20px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 16 }}>Account</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f5f5f5', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#888' }}>Email</div>
              <div style={{ fontSize: 13, color: '#111', fontWeight: 500, maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f5f5f5', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#888' }}>Plan</div>
              <div style={{ fontSize: 12, background: ACCENT_LIGHT, color: ACCENT, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>Free</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#888' }}>Last upload</div>
              <div style={{ fontSize: 13, color: '#111' }}>
                {lastUpload ? new Date(lastUpload).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
              </div>
            </div>
          </div>

          {/* Data summary */}
          {stats && (
            <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '20px 20px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 16 }}>Your data</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#fafafa', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Rides stored</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.4px' }}>{stats.rides}</div>
                </div>
                <div style={{ background: '#fafafa', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Eats orders stored</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.4px' }}>{stats.orders}</div>
                </div>
              </div>
            </div>
          )}

          {/* Export */}
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '20px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 16 }}>Export your data</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>Download all your data</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>Export as JSON — your GDPR data portability right.</div>
              </div>
              <button onClick={handleDownloadData} style={{ fontSize: 13, fontWeight: 600, color: ACCENT, background: ACCENT_LIGHT, border: `1px solid ${ACCENT}33`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Download JSON
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ background: 'white', border: '1px solid #FEE2E2', borderRadius: 14, padding: '20px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', marginBottom: 16 }}>Danger zone</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f5f5f5', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>Delete all data</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>Remove all rides and orders. Account stays active.</div>
              </div>
              <button onClick={() => setShowConfirm(true)} style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
              whiteSpace: 'nowrap' }}>
              Delete data
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>Delete account</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>Permanently delete your account and all data. Cannot be undone.</div>
            </div>
            <button onClick={handleDeleteAccount} style={{ fontSize: 13, fontWeight: 600, color: 'white', background: '#EF4444', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Delete account
            </button>
          </div>
        </div>
      </div>
    </main>

    {/* Confirmation modal */}
    {showConfirm && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '28px 24px', maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
          <div style={{ width: 44, height: 44, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#EF4444"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111', textAlign: 'center', marginBottom: 8 }}>Delete all data?</div>
          <div style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
            This will permanently remove {stats?.rides ?? 0} rides and {stats?.orders ?? 0} Eats orders. Your account stays active. This cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #eee', background: 'white', color: '#555', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleDeleteData} disabled={deleting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#EF4444', color: 'white', fontSize: 14, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
              {deleting ? 'Deleting...' : 'Yes, delete all'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)
}