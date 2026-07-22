import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home as HomeIcon, Coins, Ticket, Crown, ChevronLeft } from 'lucide-react'
import { getToken } from './services/request'
import Login from './pages/Login'
import Home from './pages/Home'
import Points from './pages/Points'
import Coupons from './pages/Coupons'
import Mall from './pages/Mall'
import Member from './pages/Member'
import Parking from './pages/Parking'
import RestaurantGuide from './pages/RestaurantGuide'
import Orders from './pages/Orders'

const TAB_ITEMS = [
  { path: '/home', label: '首页', icon: HomeIcon },
  { path: '/points', label: '金币', icon: Coins },
  { path: '/coupons', label: '卡券', icon: Ticket },
  { path: '/member', label: '我的', icon: Crown },
]

function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = '/' + location.pathname.split('/')[1]

  return (
    <nav className="tabbar">
      {TAB_ITEMS.map((item) => {
        const Icon = item.icon
        const active = current === item.path
        return (
          <button
            key={item.path}
            className={`tabbar-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function TabLayout() {
  return (
    <div className="app-shell">
      <Outlet />
      <TabBar />
    </div>
  )
}

const SUB_TITLES: Record<string, string> = {
  '/mall': '金币商城',
  '/parking': '智慧停车',
  '/restaurant': '餐饮导览',
  '/orders': '我的订单',
}

function SubLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const title = SUB_TITLES[location.pathname] || ''
  return (
    <div className="app-shell">
      <header className="sub-header">
        <button className="sub-back" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={22} />
        </button>
        <span className="sub-title">{title}</span>
        <span className="sub-placeholder" />
      </header>
      <Outlet />
    </div>
  )
}

function ProtectedRoute() {
  const token = getToken()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<TabLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/points" element={<Points />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/member" element={<Member />} />
          </Route>

          <Route element={<SubLayout />}>
            <Route path="/mall" element={<Mall />} />
            <Route path="/parking" element={<Parking />} />
            <Route path="/restaurant" element={<RestaurantGuide />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
