import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h4" stroke="#0c0a09" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-stone-100 font-semibold text-lg tracking-tight">Tracely</span>
        </div>
        <h1 className="text-stone-100 text-2xl font-semibold mb-2">You're in! 🎉</h1>
        <p className="text-stone-500 text-sm mb-1">Logged in as</p>
        <p className="text-amber-400 text-sm font-mono mb-8">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm text-stone-400 border border-stone-700 rounded-lg hover:bg-stone-800 transition-colors"
        >
          Sign out
        </button>
        <p className="text-stone-700 text-xs mt-6">Dashboard UI coming in Phase 3</p>
      </div>
    </div>
  )
}
