import { useState, useEffect } from 'react'
import { Package, ChevronRight } from 'lucide-react'
import { Toast } from 'antd-mobile'
import request from '../services/request'

interface OrderItem {
  id: number
  orderNo: string
  goods: string
  amount: number
  status: string
  time: string
}

const STATUS_CLS: Record<string, string> = {
  已完成: 'tag-success',
  已退款: 'tag-ghost',
  已取消: 'tag-ghost',
  待支付: 'tag-danger',
  已支付: 'tag-gold',
}

export default function Orders() {
  const [list, setList] = useState<OrderItem[]>([])

  useEffect(() => {
    request
      .get<OrderItem[]>('/capp/orders')
      .then((d) => setList(d as OrderItem[]))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  return (
    <div className="page page--no-tab orders-page">
      <div className="orders-intro">
        <Package size={18} />
        <span>共 {list.length || 0} 笔订单</span>
      </div>

      <div className="orders-list">
        {list.length ? (
          list.map((o) => (
            <div key={o.id} className="card order-card">
              <div className="order-head">
                <span className="order-no">订单号 {o.orderNo}</span>
                <span className={`tag ${STATUS_CLS[o.status] || 'tag-ghost'}`}>{o.status}</span>
              </div>
              <div className="order-body">
                <span className="order-goods-icon">
                  <Package size={20} />
                </span>
                <div className="order-goods-info">
                  <p className="order-goods-name">{o.goods}</p>
                  <p className="order-time">{o.time}</p>
                </div>
                <div className="order-amount">
                  <span className="order-amount-sym">¥</span>
                  <span className="order-amount-val">{o.amount}</span>
                </div>
              </div>
              <div className="order-foot">
                {o.status === '已完成' ? (
                  <button
                    className="order-action"
                    onClick={() => Toast.show({ content: '再次购买·敬请期待' })}
                  >
                    再次购买
                  </button>
                ) : null}
                <button
                  className="order-action ghost"
                  onClick={() => Toast.show({ content: '查看详情·敬请期待' })}
                >
                  查看详情 <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Package size={36} color="var(--ink-4)" />
            <span className="empty-text">暂无订单</span>
          </div>
        )}
      </div>
    </div>
  )
}
