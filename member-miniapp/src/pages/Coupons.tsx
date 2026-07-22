import { useState, useEffect, useMemo } from 'react'
import { Ticket, Percent, ChevronRight } from 'lucide-react'
import { Toast } from 'antd-mobile'
import request from '../services/request'

interface Coupon {
  id: number
  name: string
  type: string
  value: number
  minSpend: number
  status: 'unused' | 'used' | 'expired'
  expireDate: string
}

const TABS = [
  { key: 'unused', label: '未使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
] as const

function valueLabel(c: Coupon): string {
  if (c.type === 'parking') return `${c.value}分钟`
  if (c.type === 'goods') return '兑换券'
  return `¥${c.value}`
}
function unitLabel(c: Coupon): string {
  if (c.type === 'parking') return '停车'
  if (c.type === 'goods') return ''
  return '元'
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('unused')

  useEffect(() => {
    request
      .get<Coupon[]>('/capp/coupons')
      .then((d) => setCoupons(d as Coupon[]))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  const counts = useMemo(
    () => ({
      unused: coupons.filter((c) => c.status === 'unused').length,
      used: coupons.filter((c) => c.status === 'used').length,
      expired: coupons.filter((c) => c.status === 'expired').length,
    }),
    [coupons],
  )

  const list = coupons.filter((c) => c.status === tab)

  return (
    <div className="page coupons-page">
      <header className="coupons-header">
        <div className="coupons-header-glow" />
        <div className="coupons-header-title">
          <Ticket size={22} />
          <span>我的卡券</span>
        </div>
        <p className="coupons-header-sub">尊享权益 · 一券在手</p>
      </header>

      <div className="coupons-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`coupons-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="coupons-tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="coupons-list">
        {list.length ? (
          list.map((c) => (
            <div key={c.id} className={`coupon-card coupon--${c.status}`}>
              <div className="coupon-left">
                <Percent size={14} className="coupon-left-icon" />
                <span className="coupon-value">{valueLabel(c)}</span>
                <span className="coupon-unit">{unitLabel(c)}</span>
              </div>
              <div className="coupon-notch coupon-notch-top" />
              <div className="coupon-notch coupon-notch-bottom" />
              <div className="coupon-divider" />
              <div className="coupon-right">
                <p className="coupon-name">{c.name}</p>
                <p className="coupon-cond">
                  {c.minSpend > 0 ? `满${c.minSpend}元可用` : '无门槛使用'}
                </p>
                <p className="coupon-expire">有效期至 {c.expireDate}</p>
                {c.status === 'unused' ? (
                  <button
                    className="coupon-use-btn"
                    onClick={() => Toast.show({ content: '去使用·敬请期待' })}
                  >
                    立即使用 <ChevronRight size={13} />
                  </button>
                ) : (
                  <span className="coupon-stamp">
                    {c.status === 'used' ? '已使用' : '已过期'}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Ticket size={36} color="var(--ink-4)" />
            <span className="empty-text">暂无卡券</span>
          </div>
        )}
      </div>
    </div>
  )
}
