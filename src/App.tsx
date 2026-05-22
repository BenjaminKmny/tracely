import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { RidesDashboard } from './pages/RidesDashboard'
import { EatsDashboard } from './pages/EatsDashboard'
import { SettingsPage } from './pages/SettingsPage'
import { InsightsPage } from './pages/InsightsPage'
import { PrivacyPage } from './pages/PrivacyPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/rides" element={<RidesDashboard />} />
            <Route path="/dashboard/eats" element={<EatsDashboard />} />
            <Route path="/dashboard/insights" element={<InsightsPage />} />
            <Route path="/dashboard/upload" element={<DashboardPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>

          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}