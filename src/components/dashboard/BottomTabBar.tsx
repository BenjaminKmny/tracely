import { Link, useLocation } from 'react-router-dom'

const ACCENT = '#368CB7'
const ACCENT_LIGHT = '#EBF4FA'

const tabs = [
  {
    label: 'Rides',
    path: '/dashboard/rides',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? ACCENT : '#aaa'}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    label: 'Eats',
    path: '/dashboard/eats',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? ACCENT : '#aaa'}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Insights',
    path: '/dashboard/insights',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? ACCENT : '#aaa'}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: 'Upload',
    path: '/dashboard/upload',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? ACCENT : '#aaa'}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '/dashboard/settings',
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? ACCENT : '#aaa'}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function BottomTabBar() {
  const location = useLocation()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: 'white',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <Link
            key={tab.path}
            to={tab.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              flex: 1,
              padding: '6px 0',
            }}
          >
            {tab.icon(active)}
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: active ? ACCENT : '#aaa',
              letterSpacing: '0.01em',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}