import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/dashboard/Sidebar'
import { InsightCard } from '../components/dashboard/InsightCard'
import { PersonalRecords } from '../components/dashboard/PersonalRecords'
import { BottomTabBar } from '../components/dashboard/BottomTabBar'
import { MobileHeader } from '../components/dashboard/MobileHeader'
import { useRidesData } from '../hooks/useRidesData'
import { useEatsData } from '../hooks/useEatsData'
import { useIsMobile } from '../hooks/useIsMobile'
import { generateRidesInsights, generateEatsInsights, Insight } from '../hooks/useInsights'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

export function InsightsPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [lastUpload, setLastUpload] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'insights' | 'records'>('insights')
  const { stats: ridesStats, loading: ridesLoading } = useRidesData(year)
  const { stats: eatsStats, loading: eatsLoading } = useEatsData(year)
  const { user } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('last_upload_at').eq('id', user.id).single()
      .then(({ data }) => setLastUpload(data?.last_upload_at ?? null))
  }, [user])

  const loading = ridesLoading || eatsLoading
  const ridesInsights: Insight[] = ridesStats ? generateRidesInsights(ridesStats, year) : []
  const eatsInsights: Insight[] = eatsStats ? generateEatsInsights(eatsStats, year) : []
  const allInsights = [...ridesInsights, ...eatsInsights]
  const patternInsights = allInsights.filter(i => i.category === 'pattern')
  const ridesOnlyInsights = allInsights.filter(i => i.category === 'rides')
  const eatsOnlyInsights = allInsights.filter(i => i.category === 'eats')
  const recentYears = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
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

        {!isMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>Insights</h1>
              <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>Patterns and records from your data</p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {recentYears.map(y => (
                <button key={y} onClick={() => setYear(y)}
                  style={{ fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: year === y ? ACCENT : 'white', color: year === y ? 'white' : '#888', border: `1px solid ${year === y ? ACCENT : '#eee'}`, transition: 'all 0.15s' }}
                >{y}</button>
              ))}
            </div>
          </div>
        )}

        {isMobile && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#aaa', marginRight: 4 }}>Year:</span>
            {recentYears.map(y => (
              <button key={y} onClick={() => setYear(y)}
                style={{ fontSize: 13, fontWeight: 500, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', background: year === y ? ACCENT : 'white', color: year === y ? 'white' : '#888', border: `1px solid ${year === y ? ACCENT : '#eee'}` }}
              >{y}</button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', border: '1px solid #eee', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {(['insights', 'records'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', background: activeTab === tab ? ACCENT : 'transparent', color: activeTab === tab ? 'white' : '#888', transition: 'all 0.15s', textTransform: 'capitalize' }}
            >{tab}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT_LIGHT}`, borderTop: `3px solid ${ACCENT}`, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : activeTab === 'records' ? (
          <PersonalRecords compact={isMobile} />
        ) : allInsights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>No insights yet for {year}</div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>Upload your Uber data to see personalised insights.</div>
            <Link to="/dashboard/upload" style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: 'white', background: ACCENT, textDecoration: 'none', padding: '10px 20px', borderRadius: 9 }}>
              Upload data →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {patternInsights.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Patterns</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {patternInsights.map(i => <InsightCard key={i.id} emoji={i.emoji} text={i.text} highlight={i.highlight} />)}
                </div>
              </div>
            )}
            {ridesOnlyInsights.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Rides</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ridesOnlyInsights.map(i => <InsightCard key={i.id} emoji={i.emoji} text={i.text} highlight={i.highlight} />)}
                </div>
              </div>
            )}
            {eatsOnlyInsights.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Uber Eats</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {eatsOnlyInsights.map(i => <InsightCard key={i.id} emoji={i.emoji} text={i.text} highlight={i.highlight} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}