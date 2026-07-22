import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, Toast } from 'antd-mobile'
import {
  Store,
  MapPin,
  Phone,
  User,
  Settings,
  ChevronRight,
  LogOut,
  Bell,
  ShieldCheck,
  HelpCircle,
  FileText,
  Users,
  JapaneseYen,
  CheckCircle,
  Coins,
} from 'lucide-react'
import request, { logout, getUserInfo } from '../services/request'

interface ProfileData {
  shopName?: string
  category?: string
  floor?: string
  contact?: string
  phone?: string
  avatar?: string
  monthly?: {
    memberCount?: number
    revenue?: number
    verifyCount?: number
    issuedCoins?: number
  }
  [key: string]: unknown
}

function formatMoney(n: unknown): string {
  const num = Number(n ?? 0)
  if (Number.isNaN(num)) return '0'
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

export default function Profile() {
  const navigate = useNavigate()
  const userInfo = getUserInfo()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    try {
      const res = await request.get<unknown, ProfileData>('/bapp/profile')
      setData(res)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '资料加载失败'
      Toast.show({ content: msg, icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleLogout() {
    const confirmed = await Dialog.confirm({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmText: '退出',
      cancelText: '取消',
    })
    if (confirmed) {
      logout()
      Toast.show({ content: '已退出登录', icon: 'success' })
      navigate('/login', { replace: true })
    }
  }

  const shopName = data?.shopName || userInfo?.shopName || '我的商户'
  const contactName = data?.contact || userInfo?.name || userInfo?.username || '商户管理员'
  const monthly = data?.monthly || {}

  const settings = [
    { icon: Bell, label: '消息通知', desc: '订单与系统消息' },
    { icon: ShieldCheck, label: '账号安全', desc: '密码与权限管理' },
    { icon: FileText, label: '经营协议', desc: '服务条款与政策' },
    { icon: HelpCircle, label: '帮助与反馈', desc: '常见问题解答' },
  ]

  return (
    <div className="page">
      {/* Profile header */}
      <header className="pf-hero">
        <div className="pf-hero-bg" />
        <div className="pf-hero-content">
          <div className="pf-avatar">
            <Store size={30} strokeWidth={2.2} color="#fff" />
          </div>
          <div className="pf-hero-info">
            <h1 className="pf-name">{contactName}</h1>
            <p className="pf-shop">{shopName}</p>
          </div>
        </div>
      </header>

      {/* Shop info card */}
      <section className="card pf-shop-card">
        <div className="card-title">
          <Store size={14} strokeWidth={2.2} />
          商户信息
        </div>
        {loading ? (
          <div>
            {[0, 1, 2, 3].map((i) => (
              <div className="pf-info-row" key={i}>
                <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 60, height: 12 }} />
                <div className="skeleton" style={{ width: 100, height: 12, marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="pf-info-row">
              <span className="pf-info-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Store size={15} strokeWidth={2.2} />
              </span>
              <span className="pf-info-label">商户名称</span>
              <span className="pf-info-value">{shopName}</span>
            </div>
            {data?.category && (
              <div className="pf-info-row">
                <span className="pf-info-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                  <FileText size={15} strokeWidth={2.2} />
                </span>
                <span className="pf-info-label">经营品类</span>
                <span className="pf-info-value">{data.category}</span>
              </div>
            )}
            {data?.floor && (
              <div className="pf-info-row">
                <span className="pf-info-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                  <MapPin size={15} strokeWidth={2.2} />
                </span>
                <span className="pf-info-label">所在楼层</span>
                <span className="pf-info-value">{data.floor}</span>
              </div>
            )}
            <div className="pf-info-row">
              <span className="pf-info-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <User size={15} strokeWidth={2.2} />
              </span>
              <span className="pf-info-label">联系人</span>
              <span className="pf-info-value">{contactName}</span>
            </div>
            {data?.phone && (
              <div className="pf-info-row">
                <span className="pf-info-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                  <Phone size={15} strokeWidth={2.2} />
                </span>
                <span className="pf-info-label">联系电话</span>
                <span className="pf-info-value">{data.phone}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Monthly stats */}
      <section className="card pf-stats-card">
        <div className="card-title">
          <CheckCircle size={14} strokeWidth={2.2} />
          本月数据
        </div>
        <div className="pf-stats-grid">
          <div className="pf-stat">
            <div className="pf-stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Users size={18} strokeWidth={2.2} />
            </div>
            <div className="pf-stat-value">{monthly.memberCount ?? 0}</div>
            <div className="pf-stat-label">会员总数</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
              <JapaneseYen size={18} strokeWidth={2.2} />
            </div>
            <div className="pf-stat-value">¥{formatMoney(monthly.revenue)}</div>
            <div className="pf-stat-label">营业收入</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <CheckCircle size={18} strokeWidth={2.2} />
            </div>
            <div className="pf-stat-value">{monthly.verifyCount ?? 0}</div>
            <div className="pf-stat-label">核销次数</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
              <Coins size={18} strokeWidth={2.2} />
            </div>
            <div className="pf-stat-value text-accent">{formatMoney(monthly.issuedCoins)}</div>
            <div className="pf-stat-label">发放金币</div>
          </div>
        </div>
      </section>

      {/* Settings menu */}
      <section className="card pf-menu-card">
        <div className="card-title">
          <Settings size={14} strokeWidth={2.2} />
          设置
        </div>
        <div>
          {settings.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                type="button"
                className="pf-menu-row"
                onClick={() => Toast.show({ content: '功能开发中', icon: 'todo' })}
              >
                <span className="pf-menu-icon">
                  <Icon size={17} strokeWidth={2.1} />
                </span>
                <span className="pf-menu-body">
                  <span className="pf-menu-label">{item.label}</span>
                  <span className="pf-menu-desc">{item.desc}</span>
                </span>
                <ChevronRight size={18} className="row-action" strokeWidth={2} />
              </button>
            )
          })}
        </div>
      </section>

      {/* Logout */}
      <button type="button" className="pf-logout" onClick={handleLogout}>
        <LogOut size={17} strokeWidth={2.2} />
        退出登录
      </button>

      <p className="pf-version">商户助手 v1.0.0</p>

      <style>{`
        .pf-hero {
          position: relative;
          margin: 4px 0 0;
          padding: 28px 4px 36px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%);
        }
        .pf-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(100% 80% at 100% 0%, rgba(201, 168, 106, 0.2) 0%, transparent 55%),
            radial-gradient(80% 60% at 0% 100%, rgba(255, 255, 255, 0.08) 0%, transparent 55%);
        }
        .pf-hero-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 14px;
        }
        .pf-avatar {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
          flex-shrink: 0;
        }
        .pf-name {
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .pf-shop {
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.86);
          font-size: 13px;
        }
        .pf-shop-card {
          margin-top: -16px;
          position: relative;
          z-index: 2;
        }
        .pf-info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--line-soft);
        }
        .pf-info-row:last-child {
          border-bottom: none;
        }
        .pf-info-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pf-info-label {
          font-size: 13px;
          color: var(--text-muted);
          width: 64px;
          flex-shrink: 0;
        }
        .pf-info-value {
          flex: 1;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .pf-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .pf-stat {
          background: var(--bg);
          border-radius: var(--radius-md);
          padding: 16px;
          text-align: center;
          border: 1px solid var(--line-soft);
        }
        .pf-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .pf-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .pf-stat-label {
          margin-top: 2px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .pf-menu-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--line-soft);
          width: 100%;
          text-align: left;
        }
        .pf-menu-row:last-child {
          border-bottom: none;
        }
        .pf-menu-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pf-menu-body {
          flex: 1;
          min-width: 0;
        }
        .pf-menu-label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }
        .pf-menu-desc {
          display: block;
          margin-top: 2px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .pf-logout {
          margin-top: 16px;
          width: 100%;
          height: 50px;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          border: 1px solid var(--line);
          color: var(--danger);
          font-size: 15px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s ease;
        }
        .pf-logout:active {
          transform: scale(0.98);
        }
        .pf-version {
          text-align: center;
          margin-top: 18px;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  )
}
