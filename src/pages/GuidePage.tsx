import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/dashboard/Sidebar'
import { BottomTabBar } from '../components/dashboard/BottomTabBar'
import { MobileHeader } from '../components/dashboard/MobileHeader'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

type Platform = 'desktop' | 'mobile'

function StepNumber({ n }: { n: number }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: ACCENT, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 800, flexShrink: 0,
    }}>{n}</div>
  )
}

function Screenshot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div style={{ margin: '16px 0 8px' }}>
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid #e8e8e8',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: '#f5f5f5',
      }}>
        <img
          src={src} alt={alt}
          style={{ width: '100%', display: 'block' }}
          loading="lazy"
        />
      </div>
      {caption && (
        <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 6 }}>{caption}</div>
      )}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #eee',
      borderRadius: 16, padding: '24px 24px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <StepNumber n={n} />
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{title}</div>
      </div>
      <div style={{ paddingLeft: 50 }}>
        {children}
      </div>
    </div>
  )
}

function DesktopGuide() {
  return (
    <div>
      <Step n={1} title="Go to the Uber privacy portal">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 4px' }}>
          Open your browser and go to{' '}
          <a href="https://myprivacy.uber.com/exploreyourdata/download" target="_blank" rel="noreferrer"
            style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>
            myprivacy.uber.com
          </a>
          . This is Uber's official data download page. You don't need to navigate through the Uber website — just open this link directly.
        </p>
        <Screenshot src="/guide/guide-step1-privacy-page.png" alt="Uber privacy portal" caption="uber.com/global/en/privacy-notice-riders-order-recipients" />
        <div style={{ background: ACCENT_LIGHT, border: `1px solid ${ACCENT}22`, borderRadius: 10, padding: '10px 14px', marginTop: 10 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 2 }}>💡 Shortcut</div>
          <div style={{ fontSize: 12, color: '#555' }}>
            You can skip the privacy notice and go directly to the download page:{' '}
            <a href="https://myprivacy.uber.com/exploreyourdata/download" target="_blank" rel="noreferrer"
              style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>
              myprivacy.uber.com/exploreyourdata/download
            </a>
          </div>
        </div>
      </Step>

      <Step n={2} title="Log in to your Uber account">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 4px' }}>
          Uber will ask you to log in with your phone number or email. Use the same account you use for your rides and food orders. You can also log in with Google or Apple.
        </p>
        <Screenshot src="/guide/guide-step3-login.png" alt="Uber login page" caption="Log in with your phone, email, Google or Apple" />
      </Step>

      <Step n={3} title='Click "Download Data"'>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 4px' }}>
          Once logged in, you'll land on the "Download your data" page. If your data is ready, you'll see a <strong>Download Data</strong> button — click it and your ZIP file will start downloading immediately.
        </p>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '8px 0 4px' }}>
          If it says "Request Data" instead, click that button and Uber will prepare your file. It usually only takes a few minutes — not the 48 hours they warn about.
        </p>
        <Screenshot src="/guide/guide-step4-download.png" alt="Download your data page" caption="Click the Download Data button to get your ZIP file" />
      </Step>

      <Step n={4} title="Wait for the email (usually just a few minutes)">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 4px' }}>
          If you requested the data, Uber will send you an email when it's ready. The subject line will be <strong>"Your Uber data is ready for download"</strong>. Despite what Uber says, this usually arrives within a few minutes — not 48 hours.
        </p>
        <Screenshot src="/guide/guide-step5-email.png" alt="Uber data ready email" caption="You'll get an email from Uber when your file is ready" />
        <div style={{ background: '#FFF8E7', border: '1px solid #F5D77A', borderRadius: 10, padding: '10px 14px', marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#92400E', fontWeight: 600, marginBottom: 2 }}>⏱ Download within 7 days</div>
          <div style={{ fontSize: 12, color: '#92400E' }}>Uber's download links expire after 7 days. Download the file and upload it to Tracely before then.</div>
        </div>
      </Step>

      <Step n={5} title="Open the email and download the ZIP">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 4px' }}>
          Open the email from Uber and click <strong>"Go to Download Page"</strong>. You'll be taken back to the Uber privacy portal where you can click <strong>Download Data</strong> to save the ZIP file to your computer.
        </p>
        <Screenshot src="/guide/guide-step6-download-button.png" alt="Go to download page button in email" caption="Click 'Go to Download Page' in the email, then download your ZIP" />
      </Step>

      <Step n={6} title="Upload to Tracely — you're done!">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 16px' }}>
          Go to the Upload page in Tracely and drag the ZIP file into the upload box, or click "Browse files" to select it. Tracely will parse your data and show you a preview before importing anything. The whole process takes about 30 seconds.
        </p>
        <Link to="/dashboard/upload" style={{
          display: 'inline-block',
          background: ACCENT, color: 'white',
          fontSize: 14, fontWeight: 700,
          padding: '11px 24px', borderRadius: 10,
          textDecoration: 'none',
        }}>
          Go to Upload →
        </Link>
      </Step>
    </div>
  )
}

function MobileGuide() {
  return (
    <div>
      <div style={{ background: '#F0F7FF', border: `1px solid ${ACCENT}22`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>📱 On your phone</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
          Open <strong>Safari or Chrome</strong> on your phone. The process is the same as desktop — you just do it in your mobile browser instead of on a computer.
        </div>
      </div>

      <Step n={1} title="Open the Uber privacy portal">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 8px' }}>
          In Safari or Chrome, tap the address bar and go to:
        </p>
        <a href="https://myprivacy.uber.com/exploreyourdata/download" target="_blank" rel="noreferrer"
          style={{ display: 'block', background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: ACCENT, fontWeight: 600, textDecoration: 'none', wordBreak: 'break-all', marginBottom: 8 }}>
          myprivacy.uber.com/exploreyourdata/download
        </a>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.55, margin: 0 }}>
          You can also tap the link above to open it directly.
        </p>
      </Step>

      <Step n={2} title="Log in to your Uber account">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: 0 }}>
          Log in with your phone number, email, Google or Apple — whichever you normally use for Uber.
        </p>
        <Screenshot src="/guide/guide-step3-login.png" alt="Uber login" caption="Same login screen on mobile browser" />
      </Step>

      <Step n={3} title='Tap "Download Data" or "Request Data"'>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 8px' }}>
          If your data is ready, tap <strong>Download Data</strong>. The ZIP file will download to your phone's Files app.
        </p>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: 0 }}>
          If it says <strong>Request Data</strong>, tap it and wait for the email — usually just a few minutes.
        </p>
        <Screenshot src="/guide/guide-step4-download.png" alt="Download page" />
      </Step>

      <Step n={4} title="Check your email">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 8px' }}>
          Open the email from Uber titled <strong>"Your Uber data is ready for download"</strong> and tap <strong>Go to Download Page</strong>. Then tap <strong>Download Data</strong> to save the file.
        </p>
        <Screenshot src="/guide/guide-step5-email.png" alt="Email from Uber" caption="Tap 'Go to Download Page' in the email" />
        <div style={{ background: '#FFF8E7', border: '1px solid #F5D77A', borderRadius: 10, padding: '10px 14px', marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#92400E', fontWeight: 600, marginBottom: 2 }}>⏱ Download within 7 days</div>
          <div style={{ fontSize: 12, color: '#92400E' }}>The link expires after 7 days so don't wait too long.</div>
        </div>
      </Step>

      <Step n={5} title="Upload to Tracely">
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 8px' }}>
          The ZIP file will be in your <strong>Files app</strong> (usually in Downloads). Go to the Upload page in Tracely, tap <strong>Choose file</strong>, and select the ZIP from your Files app.
        </p>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 16px' }}>
          Tracely will show you a preview of your data before importing anything.
        </p>
        <Link to="/dashboard/upload" style={{
          display: 'inline-block',
          background: ACCENT, color: 'white',
          fontSize: 14, fontWeight: 700,
          padding: '11px 24px', borderRadius: 10,
          textDecoration: 'none',
        }}>
          Go to Upload →
        </Link>
      </Step>
    </div>
  )
}

export function GuidePage() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [lastUpload, setLastUpload] = useState<string | null>(null)
  const [platform, setPlatform] = useState<Platform>('desktop')

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
        <div style={{ maxWidth: 680 }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
              How to get your Uber data
            </h1>
            <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
              Step-by-step guide to downloading your data from Uber and uploading it to Tracely.
            </p>
          </div>

          {/* Platform toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 4, width: 'fit-content' }}>
            {([
              { key: 'desktop', label: '💻  On a computer' },
              { key: 'mobile', label: '📱  On your phone' },
            ] as { key: Platform; label: string }[]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setPlatform(opt.key)}
                style={{
                  fontSize: 13, fontWeight: 500,
                  padding: '8px 18px', borderRadius: 9,
                  border: 'none', cursor: 'pointer',
                  background: platform === opt.key ? ACCENT : 'transparent',
                  color: platform === opt.key ? 'white' : '#888',
                  transition: 'all 0.15s',
                }}
              >{opt.label}</button>
            ))}
          </div>

          {/* Time estimate banner */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { icon: '⏱', label: 'Takes about 5 minutes' },
              { icon: '🆓', label: 'Completely free' },
              { icon: '🔒', label: 'Your data stays private' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #eee', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#555', fontWeight: 500 }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Guide content */}
          {platform === 'desktop' ? <DesktopGuide /> : <MobileGuide />}

          {/* FAQ */}
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 16, padding: '20px 24px', marginTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 16 }}>Common questions</div>
            {[
              {
                q: 'Is it safe to download my data from Uber?',
                a: "Yes. You're downloading your own data directly from Uber's official privacy portal. No third party is involved in that step.",
              },
              {
                q: 'Is it safe to upload my data to Tracely?',
                a: 'Yes. Your data is stored securely in an EU-based database with row-level security — only your account can access it. We never share or sell your data. You can delete everything anytime from Settings.',
              },
              {
                q: "It says it'll take 48 hours — do I really have to wait?",
                a: "No — that's just Uber's worst-case estimate. In practice it usually takes 2–10 minutes. You'll get an email the moment it's ready.",
              },
              {
                q: 'The download link in the email expired. What do I do?',
                a: 'Go back to myprivacy.uber.com, log in, and request a new download. The link expires after 7 days.',
              },
              {
                q: 'I can only see recent trips. Where is my full history?',
                a: "The ZIP export includes your complete history going back to when you first used Uber — not just recent activity. Make sure you're uploading the full ZIP file, not a specific CSV inside it.",
              },
            ].map((item, i, arr) => (
              <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 5 }}>{item.q}</div>
                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 14 }}>Ready? Upload your ZIP file and see your spending breakdown.</div>
            <Link to="/dashboard/upload" style={{
              display: 'inline-block',
              background: ACCENT, color: 'white',
              fontSize: 14, fontWeight: 700,
              padding: '12px 28px', borderRadius: 10,
              textDecoration: 'none',
            }}>
              Upload my Uber data →
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}