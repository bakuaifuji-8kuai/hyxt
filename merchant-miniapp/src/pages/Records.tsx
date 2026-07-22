import { useEffect, useState } from 'react'
import { PullToRefresh, Toast } from 'antd-mobile'
import { Receipt, CheckCircle, Clock, User, Ticket, Inbox } from 'lucide-react'
import request from '../services/request'

interface RecordItem {
  id?: string | number
  orderNo?: string
  memberName?: string
  couponName?: string
  amount?: number
  time?: string
  status?: string | 'success' | 'pending' | 'failed'
  [key: string]: unknown
}

interface RecordsResp {
  list?: RecordItem[]
  total?: number
  [key: string]: unknown
}

function isSuccess(status?: string): boolean {
  if (!status) return true
  const s = status.toLowerCase()
  return s === 'success' || s === '成功' || s === '已核销' || s === 'verified'
}

function StatusBadge({ status }: { status?: string }) {
  const success = isSuccess(status)
  const label = success ? '已核销' : status || '已核销'
  return (
    <span className={`badge ${success ? 'badge-success' : 'badge-neutral'}`}>
      <CheckCircle size={12} strokeWidth={2.4} />
      {label}
    </span>
  )
}

export default function Records() {
  const [list, setList] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    try {
      const res = await request.get<unknown, RecordsResp | RecordItem[]>('/bapp/records')
      const items = Array.isArray(res) ? res : res?.list || []
      setList(items)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '记录加载失败'
      Toast.show({ content: msg, icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="page">
      <PullToRefresh onRefresh={fetchData}>
        <header className="rec-header">
          <p className="dash-greeting">核销流水</p>
          <h1 className="page-title">核销记录</h1>
          <p className="page-subtitle">查看最近的券核销与交易明细</p>
        </header>

        {/* Summary strip */}
        <div className="rec-summary">
          <div className="rec-summary-item">
            <span className="rec-summary-num">{list.length}</span>
            <span className="rec-summary-label">记录总数</span>
          </div>
          <div className="rec-summary-divider" />
          <div className="rec-summary-item">
            <Receipt size={18} strokeWidth={2} color="var(--primary)" />
            <span className="rec-summary-label">实时同步</span>
          </div>
        </div>

        {loading ? (
          <div className="card-list">
            {[0, 1, 2].map((i) => (
              <div className="card rec-card" key={i}>
                <div className="skeleton" style={{ width: 90, height: 18 }} />
                <div className="skeleton" style={{ width: '50%', height: 13, marginTop: 10 }} />
                <div className="rec-card-foot" style={{ marginTop: 14 }}>
                  <div className="skeleton" style={{ width: 80, height: 22 }} />
                  <div className="skeleton" style={{ width: 60, height: 20 }} />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="card empty-state">
            <Inbox size={40} strokeWidth={1.5} className="empty-icon" />
            <div>暂无核销记录</div>
            <div className="rec-empty-sub">核销券后记录将显示在此处</div>
          </div>
        ) : (
          <div className="card-list">
            {list.map((item, idx) => (
              <article className="card rec-card" key={item.id ?? item.orderNo ?? idx}>
                <div className="rec-card-top">
                  <span className="rec-order-no">
                    <Receipt size={13} strokeWidth={2.2} />
                    {item.orderNo || `单号 ${idx + 1}`}
                  </span>
                  <StatusBadge status={item.status as string} />
                </div>

                <div className="rec-card-meta">
                  <div className="rec-meta-row">
                    <User size={14} strokeWidth={2} className="rec-meta-icon" />
                    <span className="rec-meta-label">会员</span>
                    <span className="rec-meta-value">{item.memberName || '—'}</span>
                  </div>
                  <div className="rec-meta-row">
                    <Ticket size={14} strokeWidth={2} className="rec-meta-icon" />
                    <span className="rec-meta-label">券名称</span>
                    <span className="rec-meta-value">{item.couponName || '—'}</span>
                  </div>
                  <div className="rec-meta-row">
                    <Clock size={14} strokeWidth={2} className="rec-meta-icon" />
                    <span className="rec-meta-label">时间</span>
                    <span className="rec-meta-value rec-meta-time">{item.time || '—'}</span>
                  </div>
                </div>

                <div className="rec-card-foot">
                  <span className="rec-amount-label">核销金额</span>
                  <span className="rec-amount">¥{Number(item.amount ?? 0).toFixed(2)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </PullToRefresh>

      <style>{`
        .rec-header {
          padding: 8px 4px 16px;
        }
        .rec-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-xs);
          margin-bottom: 14px;
        }
        .rec-summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .rec-summary-num {
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .rec-summary-label {
          font-size: 12px;
          color: var(--text-soft);
        }
        .rec-summary-divider {
          width: 1px;
          height: 24px;
          background: var(--line);
        }
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rec-card {
          padding: 16px 18px;
        }
        .rec-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rec-order-no {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-soft);
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .rec-card-meta {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rec-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .rec-meta-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .rec-meta-label {
          color: var(--text-muted);
          width: 48px;
          flex-shrink: 0;
        }
        .rec-meta-value {
          color: var(--ink);
          font-weight: 500;
          flex: 1;
        }
        .rec-meta-time {
          color: var(--text-soft);
          font-weight: 400;
          font-size: 12px;
        }
        .rec-card-foot {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px dashed var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rec-amount-label {
          font-size: 12px;
          color: var(--text-muted);
        }
        .rec-amount {
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .rec-empty-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }
      `}</style>
    </div>
  )
}
