import { Link } from 'react-router-dom'

const ACCENT = '#368CB7'

export function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid #f0f0f0', padding: '0 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 26, height: 26, background: '#111', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#111', letterSpacing: '-0.4px' }}>Tracely</span>
          </Link>
          <Link to="/" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Back to home</Link>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '56px 32px 80px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Legal</p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', letterSpacing: '-1px', marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: '#aaa' }}>Last updated: May 2026</p>
        </div>

        {[
          {
            title: '1. Who we are',
            body: `Tracely is a personal analytics tool that helps you understand your spending on ride-hailing and food delivery platforms. Tracely is operated as a personal project and the data controller is the developer reachable at benjamin@kemeny.cl.`,
          },
          {
            title: '2. What data we collect',
            body: `We collect and store the following personal data:

- Your email address, used to identify your account
- Ride history data you upload from Uber exports, including pickup and dropoff addresses, fares, dates, and ride types
- Food delivery order data you upload from Uber Eats exports, including restaurant names, item names, order totals, and dates

We do not collect any data automatically. All data is provided explicitly by you through a manual file upload.`,
          },
          {
            title: '3. Why we collect it',
            body: `We collect this data solely to provide you with analytics and insights about your own spending habits. Your data is used to generate the dashboards, charts, and summaries you see when logged in. We do not use your data for advertising, profiling, or any purpose other than displaying it back to you.`,
          },
          {
            title: '4. How long we store it',
            body: `We store your data for as long as your account is active. You can delete all your data at any time from the Settings page. When you delete your data or your account, it is permanently removed from our systems within 24 hours.`,
          },
          {
            title: '5. Who we share it with',
            body: `We do not sell, share, or transfer your personal data to any third parties. Your data is stored securely on Supabase, a GDPR-compliant infrastructure provider based in the EU. Supabase acts as a data processor under our instructions and does not have access to your data for their own purposes.`,
          },
          {
            title: '6. Your rights under GDPR',
            body: `As a user in the European Union or European Economic Area, you have the following rights:

- Right of access: you can download all your data from the Settings page at any time
- Right to erasure: you can delete all your data or your entire account from the Settings page
- Right to portability: your data export is available in JSON format from Settings
- Right to rectification: contact us if any data is inaccurate
- Right to object: you can stop using Tracely and delete your data at any time

To exercise any of these rights, use the Settings page or contact us at benjamin@kemeny.cl.`,
          },
          {
            title: '7. Cookies and tracking',
            body: `Tracely does not use advertising cookies or third-party tracking. We use only essential session cookies required to keep you logged in. We do not use Google Analytics or any other analytics services that track your behaviour across sites.`,
          },
          {
            title: '8. Security',
            body: `All data is encrypted in transit using HTTPS. Data at rest is stored on Supabase infrastructure with row-level security, meaning your data is only accessible by your own account. No other user can access your data.`,
          },
          {
            title: '9. Changes to this policy',
            body: `If we make significant changes to this privacy policy, we will notify you by email or by displaying a notice in the app. Continued use of Tracely after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: '10. Contact',
            body: `For any privacy-related questions or requests, contact us at benjamin@kemeny.cl.`,
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: '1px solid #f5f5f5' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 12 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ background: '#F0F7FF', border: `1px solid ${ACCENT}22`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>Your data controls</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>You can download or delete all your data at any time from your account settings.</div>
          <Link to="/dashboard/settings" style={{ fontSize: 13, fontWeight: 600, color: ACCENT, textDecoration: 'none' }}>Go to Settings →</Link>
        </div>
      </main>
    </div>
  )
}