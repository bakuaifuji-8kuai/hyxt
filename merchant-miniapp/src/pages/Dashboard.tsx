import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PullToRefresh, Toast } from 'antd-mobile'
import {
  CheckCircle,
  JapaneseYen,
  UserPlus,
  Coins,
  AlertCircle,
  ChevronRight,
  ScanLine,
  CircleParking,
  TrendingUp,
  CalendarDays,
  RefreshCw,
} from 'lucide-react'
import request, { getUserInfo } from '../services/request'

interface DashboardData {
  shopName?: string
  today?: {
    verifyCount?: number
    revenue?: number
    newMembers?: number
    issuedCoins?: number
  }
  week?: {
    verifyCount?: number
    revenue?: number
    newMembers?: number
    issuedCoins?: number
  }
  tasks?: Array<{
    id?: string | number
    title?: string
    desc?: string
    level?: 'high' | 'normal' | 'low'
  }>
  [key: string]: unknown
}

function formatMoney(n: unknown): string {
  const num = Number(n ?? 0)
  if (Number.isNaN(num)) return '0'
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function formatDate(): string {
  const dt = new Date()
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(dt)
}

export default function Dashboard() {
  const userInfo = getUserInfo()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    try {
      const res = await request.get<unknown, DashboardData>('/bapp/dashboard')
      setData(res)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '数据加载失败'
      Toast.show({ content: msg, icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const shopName = data?.shopName || userInfo?.shopName || '我的商户'
  const today = data?.today || {}
  const week = data?.week || {}
  const tasks = data?.tasks || []

  return (
    <div className="page">
      <PullToRefresh onRefresh={fetchData}>
        {/* Header */}
        <header className="dash-header">
          <div className="dash-header-top">
            <div>
              <p className="dash-greeting">商户工作台</p>
              <h1 className="dash-shop">{shopName}</h1>
            </div>
            <button
              className="dash-refresh"
              onClick={fetchData}
              aria-label="刷新"
            >
              <RefreshCw size={18} strokeWidth={2} />
            </button>
          </div>
          <div className="dash-date">
            <CalendarDays size={14} strokeWidth={2} />
            <span>{formatDate()}</span>
          </div>
        </header>

        {/* Today stats — 2x2 grid */}
        <section className="dash-section">
          <div className="dash-section-head">
            <span className="dash-section-title">今日概览</span>
            <span className="dash-section-tag">实时</span>
          </div>
          {loading ? (
            <div className="dash-grid">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="stat-tile">
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                  <div className="skeleton" style={{ width: 60, height: 12, marginTop: 16 }} />
                  <div className="skeleton" style={{ width: 80, height: 22, marginTop: 6 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-grid">
              <div className="stat-tile">
                <div className="stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                  <CheckCircle size={20} strokeWidth={2.2} />
                </div>
                <div className="stat-label">核销次数</div>
                <div className="stat-value">{today.verifyCount ?? 0}<span className="stat-suffix">次</span></div>
              </div>
              <div className="stat-tile">
                <div className="stat-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                  <JapaneseYen size={20} strokeWidth={2.2} />
                </div>
                <div className="stat-label">营业收入</div>
                <div className="stat-value">¥{formatMoney(today.revenue)}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                  <UserPlus size={20} strokeWidth={2.2} />
                </div>
                <div className="stat-label">新增会员</div>
                <div className="stat-value">{today.newMembers ?? 0}<span className="stat-suffix">人</span></div>
              </div>
              <div className="stat-tile">
                <div className="stat-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                  <Coins size={20} strokeWidth={2.2} />
                </div>
                <div className="stat-label">发放金币</div>
                <div className="stat-value">{formatMoney(today.issuedCoins)}<span className="stat-suffix">枚</span></div>
              </div>
            </div>
          )}
        </section>

        {/* Week summary */}
        <section className="card mt-12">
          <div className="card-title">
            <TrendingUp size={14} strokeWidth={2.2} />
            本周汇总
          </div>
          <div className="week-grid">
            <div className="week-item">
              <div className="week-label">核销次数</div>
              <div className="week-value">{week.verifyCount ?? 0}</div>
            </div>
            <div className="week-divider" />
            <div className="week-item">
              <div className="week-label">营业收入</div>
              <div className="week-value">¥{formatMoney(week.revenue)}</div>
            </div>
            <div className="week-divider" />
            <div className="week-item">
              <div className="week-label">新增会员</div>
              <div className="week-value">{week.newMembers ?? 0}</div>
            </div>
            <div className="week-divider" />
            <div className="week-item">
              <div className="week-label">发放金币</div>
              <div className="week-value text-accent">{formatMoney(week.issuedCoins)}</div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-12">
          <div className="dash-actions">
            <Link
              to="/coupon-verify"
              className="dash-action dash-action--primary"
            >
              <span className="dash-action-icon">
                <ScanLine size={22} strokeWidth={2.2} />
              </span>
              <span className="dash-action-label">核销券</span>
              <span className="dash-action-sub">扫码或输入码</span>
            </Link>
            <Link
              to="/parking-issue"
              className="dash-action dash-action--accent"
            >
              <span className="dash-action-icon">
                <CircleParking size={22} strokeWidth={2.2} />
              </span>
              <span className="dash-action-label">发停车券</span>
              <span className="dash-action-sub">输入车牌发放</span>
            </Link>
          </div>
        </section>

        {/* Pending tasks */}
        <section className="card mt-12">
          <div className="dash-section-head" style={{ marginBottom: 4 }}>
            <span className="dash-section-title">待办事项</span>
            {tasks.length > 0 && <span className="badge badge-warning">{tasks.length}</span>}
          </div>
          {loading ? (
            <div>
              {[0, 1].map((i) => (
                <div className="row" key={i}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '60%', height: 14 }} />
                    <div className="skeleton" style={{ width: '40%', height: 11, marginTop: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <CheckCircle size={36} strokeWidth={1.6} className="empty-icon" />
              <div>暂无待办，一切就绪</div>
            </div>
          ) : (
            <div>
              {tasks.map((task, idx) => (
                <div className="row" key={task.id ?? idx}>
                  <div
                    className="row-icon"
                    style={{
                      background: task.level === 'high' ? 'var(--warning-soft)' : 'var(--primary-soft)',
                      color: task.level === 'high' ? 'var(--warning)' : 'var(--primary)',
                    }}
                  >
                    <AlertCircle size={18} strokeWidth={2.2} />
                  </div>
                  <div className="row-body">
                    <div className="row-title">{task.title}</div>
                    {task.desc && <div className="row-sub">{task.desc}</div>}
                  </div>
                  <ChevronRight size={18} className="row-action" strokeWidth={2} />
                </div>
              ))}
            </div>
          )}
        </section>
      </PullToRefresh>

      <style>{`
        .dash-header {
          padding: 8px 4px 18px;
        }
        .dash-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .dash-greeting {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .dash-shop {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-top: 2px;
          color: var(--ink);
        }
        .dash-refresh {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: var(--bg-elevated);
          box-shadow: var(--shadow-xs);
          border: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-soft);
        }
        .dash-date {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-soft);
          background: var(--bg-elevated);
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid var(--line);
        }
        .dash-section {
          margin-top: 8px;
        }
        .dash-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 0 2px;
        }
        .dash-section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .dash-section-tag {
          font-size: 11px;
          color: var(--primary);
          background: var(--primary-soft);
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
        }
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .week-grid {
          display: flex;
          align-items: center;
        }
        .week-item {
          flex: 1;
          text-align: center;
        }
        .week-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .week-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .week-divider {
          width: 1px;
          height: 28px;
          background: var(--line);
        }
        .dash-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .dash-action {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          padding: 18px;
          border-radius: var(--radius-lg);
          text-align: left;
          transition: transform 0.15s ease;
          position: relative;
          overflow: hidden;
        }
        .dash-action:active {
          transform: scale(0.98);
        }
        .dash-action--primary {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
        }
        .dash-action--accent {
          background: linear-gradient(135deg, #c9a86a 0%, #b3934f 100%);
          color: #fff;
          box-shadow: 0 8px 18px rgba(201, 168, 106, 0.28);
        }
        .dash-action-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dash-action-label {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .dash-action-sub {
          font-size: 11px;
          opacity: 0.85;
        }
      `}</style>
    </div>
  )
}
