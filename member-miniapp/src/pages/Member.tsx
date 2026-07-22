import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Crown, Coins, Ticket, Package, Wallet, ChevronRight, Settings,
  ShieldCheck, Headphones, Bell, LogOut, Sparkles,
} from 'lucide-react'
import { Dialog, Toast } from 'antd-mobile'
import request, { getUserInfo, logout } from '../services/request'

interface MemberData {
  id: number
  name: string
  phone: string
  avatar: string
  level: string
  levelName: string
  points: number
  balance: number
  growthValue: number
  cardNo: string
  couponCount: number
  orderCount: number
  totalSpent: number
  benefits: string[]
  nextLevel: string
  nextLevelPoints: number
  progress: number
}

const NEXT_LEVEL_NAME: Record<string, string> = {
  DIAMOND: '钻石会员',
  GOLD: '金卡会员',
  SILVER: '银卡会员',
  NORMAL: '普通会员',
}

export default function Member() {
  const navigate = useNavigate()
  const [data, setData] = useState<MemberData | null>(null)
  const localUser = getUserInfo()

  useEffect(() => {
    request
      .get<MemberData>('/capp/member')
      .then((d) => setData(d as MemberData))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  const stats = [
    { label: '金币', value: data?.points ?? 0, icon: Coins, route: '/points' },
    { label: '卡券', value: data?.couponCount ?? 0, icon: Ticket, route: '/coupons' },
    { label: '订单', value: data?.orderCount ?? 0, icon: Package, route: '/orders' },
    { label: '余额', value: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 }).format(Number(data?.balance ?? 0)), icon: Wallet, route: '' },
  ]

  const menus = [
    { label: '我的订单', icon: Package, route: '/orders' },
    { label: '金币商城', icon: Coins, route: '/mall' },
    { label: '卡券包', icon: Ticket, route: '/coupons' },
    { label: '账户安全', icon: ShieldCheck, route: '' },
    { label: '消息通知', icon: Bell, route: '' },
    { label: '联系客服', icon: Headphones, route: '' },
    { label: '系统设置', icon: Settings, route: '' },
  ]

  const handleLogout = async () => {
    const ok = await Dialog.confirm({ content: '确定要退出登录吗？' })
    if (ok) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const name = data?.name || localUser?.name || '会员'

  return (
    <div className="page member-page">
      {/* Member card */}
      <header className="member-card">
        <div className="member-card-glow" />
        <div className="member-card-top">
          <div className="member-avatar">
            {data?.avatar ? (
              <img src={data.avatar} alt={name} width={64} height={64} />
            ) : (
              <span>{name.slice(0, 1)}</span>
            )}
          </div>
          <div className="member-id">
            <div className="member-name-row">
              <h1 className="member-name">{name}</h1>
              <span className="member-level-badge">
                <Crown size={12} />
                {data?.levelName || '金卡会员'}
              </span>
            </div>
            <p className="member-phone">{data?.phone || localUser?.phone || ''}</p>
            <p className="member-cardno">No. {data?.cardNo || '––'}</p>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="member-progress">
          <div className="member-progress-head">
            <span className="member-progress-cur">
              <Sparkles size={12} /> {data?.levelName}
            </span>
            <span className="member-progress-next">
              距 {NEXT_LEVEL_NAME[data?.nextLevel || ''] || '下一等级'} 还差 {(data?.nextLevelPoints ?? 0) - (data?.growthValue ?? 0)} 成长值
            </span>
          </div>
          <div className="member-progress-bar">
            <div
              className="member-progress-fill"
              style={{ width: `${Math.min(100, data?.progress ?? 0)}%` }}
            />
          </div>
        </div>
      </header>

      {/* Quick stats */}
      <section className="section card member-stats">
        {stats.map((s) => {
          const Icon = s.icon
          const inner = (
            <>
              <span className="member-stat-icon">
                <Icon size={18} />
              </span>
              <span className="member-stat-value">
                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </span>
              <span className="member-stat-label">{s.label}</span>
            </>
          )
          return s.route ? (
            <Link key={s.label} to={s.route} className="member-stat">
              {inner}
            </Link>
          ) : (
            <button
              key={s.label}
              className="member-stat"
              onClick={() => Toast.show({ content: '敬请期待' })}
            >
              {inner}
            </button>
          )
        })}
      </section>

      {/* Benefits */}
      {data?.benefits?.length ? (
        <section className="section card member-benefits">
          <div className="section-head" style={{ padding: '16px 16px 8px' }}>
            <div className="section-title">
              <span className="accent-bar" />
              <Crown size={17} />
              <span>会员权益</span>
            </div>
          </div>
          <div className="member-benefit-list">
            {data.benefits.map((b, i) => (
              <div key={i} className="member-benefit">
                <span className="member-benefit-dot">
                  <Crown size={12} />
                </span>
                <span className="member-benefit-text">{b}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Menu */}
      <section className="section card member-menu">
        {menus.map((m) => {
          const Icon = m.icon
          const inner = (
            <>
              <span className="member-menu-icon">
                <Icon size={18} />
              </span>
              <span className="member-menu-label">{m.label}</span>
              <ChevronRight size={16} className="member-menu-arrow" />
            </>
          )
          return m.route ? (
            <Link key={m.label} to={m.route} className="member-menu-item">
              {inner}
            </Link>
          ) : (
            <button
              key={m.label}
              className="member-menu-item"
              onClick={() => Toast.show({ content: '敬请期待' })}
            >
              {inner}
            </button>
          )
        })}
      </section>

      <button className="member-logout" onClick={handleLogout}>
        <LogOut size={15} />
        <span>退出登录</span>
      </button>

      <p className="member-footer">恒伟商业广场 · 会员中心 v1.0</p>
    </div>
  )
}
