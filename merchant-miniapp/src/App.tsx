import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { LayoutGrid, Receipt, ScanLine, User } from 'lucide-react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import CouponVerify from './pages/CouponVerify'
import ParkingIssue from './pages/ParkingIssue'
import Profile from './pages/Profile'
import { isLoggedIn } from './services/request'

const TABS = [
  { path: '/dashboard', label: '工作台', icon: LayoutGrid },
  { path: '/records', label: '核销记录', icon: Receipt },
  { path: '/coupon-verify', label: '核销', icon: ScanLine },
  { path: '/profile', label: '我的', icon: User },
] as const

function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = location.pathname

  return (
    <nav className="tabbar" role="tablist">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const active = current.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            type="button"
            className={`tabbar-item${active ? ' active' : ''}`}
            onClick={() => navigate(tab.path)}
            role="tab"
            aria-selected={active}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

function ShellWithTabs({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      {children}
      <TabBar />
    </div>
  )
}

function RedirectHome() {
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
    }
  }, [])

  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ShellWithTabs>
                <Dashboard />
              </ShellWithTabs>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <ShellWithTabs>
                <Records />
              </ShellWithTabs>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupon-verify"
          element={
            <ProtectedRoute>
              <ShellWithTabs>
                <CouponVerify />
              </ShellWithTabs>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parking-issue"
          element={
            <ProtectedRoute>
              <ShellWithTabs>
                <ParkingIssue />
              </ShellWithTabs>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ShellWithTabs>
                <Profile />
              </ShellWithTabs>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<RedirectHome />} />
        <Route path="*" element={<RedirectHome />} />
      </Routes>
    </BrowserRouter>
  )
}
