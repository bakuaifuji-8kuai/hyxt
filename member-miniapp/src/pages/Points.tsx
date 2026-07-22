import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Coins, ChevronRight, TrendingUp, Gift } from 'lucide-react'
import { Toast } from 'antd-mobile'
import request from '../services/request'

interface PointsData {
  total: number
  todayEarn: number
  logs: {
    id: number
    type: string
    points: number
    balance: number
    remark: string
    time: string
  }[]
}

const TYPE_TAG: Record<string, { cls: string; label: string }> = {
  消费: { cls: 'tag-gold', label: '消费' },
  签到: { cls: 'tag-success', label: '签到' },
  奖励: { cls: 'tag-info', label: '奖励' },
}

export default function Points() {
  const [data, setData] = useState<PointsData | null>(null)

  useEffect(() => {
    request
      .get<PointsData>('/capp/points')
      .then((d) => setData(d as PointsData))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  return (
    <div className="page points-page">
      {/* Gradient header */}
      <header className="points-header">
        <div className="points-header-glow" />
        <div className="points-header-top">
          <div className="points-coin-icon">
            <Coins size={26} />
          </div>
          <h1 className="points-header-label">我的金币</h1>
        </div>
        <div className="points-total">
          {data ? data.total.toLocaleString() : '––'}
        </div>
        <div className="points-today">
          <TrendingUp size={13} />
          <span>今日已获 +{data?.todayEarn ?? 0} 金币</span>
        </div>
        <div className="points-actions">
          <Link to="/mall" className="btn-gold-ghost points-action">
            <Gift size={15} />
            <span>金币兑换</span>
          </Link>
          <Link to="/orders" className="btn-gold-ghost points-action">
            <Coins size={15} />
            <span>兑换记录</span>
          </Link>
        </div>
      </header>

      {/* Transactions */}
      <section className="section card points-list">
        <div className="section-head" style={{ padding: '16px 16px 10px' }}>
          <div className="section-title">
            <span className="accent-bar" />
            <span>金币明细</span>
          </div>
        </div>
        {data?.logs?.length ? (
          data.logs.map((log) => {
            const tag = TYPE_TAG[log.type] || { cls: 'tag-ghost', label: log.type }
            return (
              <div key={log.id} className="points-item">
                <div className="points-item-left">
                  <span className={`tag ${tag.cls}`}>{tag.label}</span>
                  <div className="points-item-meta">
                    <p className="points-item-remark">{log.remark}</p>
                    <p className="points-item-time">{log.time}</p>
                  </div>
                </div>
                <div className="points-item-right">
                  <p className="points-item-amount">+{log.points}</p>
                  <p className="points-item-balance">余额 {log.balance}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state">
            <Coins size={36} color="var(--ink-4)" />
            <span className="empty-text">暂无金币明细</span>
          </div>
        )}
      </section>

      <div className="points-tip">
        <ChevronRight size={12} />
        <span>消费1元 = 1金币，金币可用于商城兑换与停车抵扣</span>
      </div>
    </div>
  )
}
