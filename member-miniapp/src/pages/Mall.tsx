import { useState, useEffect, useMemo } from 'react'
import { ShoppingBag, Coins, ChevronRight } from 'lucide-react'
import { Toast } from 'antd-mobile'
import request, { getUserInfo } from '../services/request'

interface MallGoods {
  id: number
  name: string
  points: number
  originalPrice: number
  stock: number
  image: string
  category: string
}
interface MallData {
  banners: unknown[]
  categories: string[]
  goods: MallGoods[]
}

const GOOD_GRADIENTS = [
  'linear-gradient(135deg, #f6ece0, #e9d6b8)',
  'linear-gradient(135deg, #eef0f7, #d8dcea)',
  'linear-gradient(135deg, #fdece7, #f6d4c8)',
  'linear-gradient(135deg, #e8f3ee, #c9e4d4)',
]

export default function Mall() {
  const [data, setData] = useState<MallData | null>(null)
  const [activeCat, setActiveCat] = useState('全部')
  const userCoins = getUserInfo()?.points ?? 0

  useEffect(() => {
    request
      .get<MallData>('/capp/mall')
      .then((d) => setData(d as MallData))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  const goods = useMemo(() => {
    if (!data?.goods) return []
    if (activeCat === '全部') return data.goods
    return data.goods.filter((g) => g.category === activeCat)
  }, [data, activeCat])

  return (
    <div className="page page--no-tab mall-page">
      {/* Coins balance banner */}
      <div className="mall-balance">
        <div className="mall-balance-left">
          <span className="mall-balance-icon">
            <Coins size={18} />
          </span>
          <div>
            <p className="mall-balance-label">可用金币</p>
            <p className="mall-balance-value">{userCoins.toLocaleString()}</p>
          </div>
        </div>
        <button className="mall-balance-more" onClick={() => Toast.show({ content: '赚金币·敬请期待' })}>
          赚金币 <ChevronRight size={13} />
        </button>
      </div>

      {/* Category tabs */}
      <div className="mall-cats no-scrollbar">
        {(data?.categories || ['全部']).map((cat) => (
          <button
            key={cat}
            className={`mall-cat-pill ${activeCat === cat ? 'active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="mall-grid">
        {goods.length ? (
          goods.map((g, i) => (
            <div key={g.id} className="mall-good card">
              <div
                className="mall-good-img"
                style={{ background: GOOD_GRADIENTS[i % GOOD_GRADIENTS.length] }}
              >
                <ShoppingBag size={26} color="var(--gold-deep)" />
                {g.stock <= 30 && <span className="mall-good-low">仅剩{g.stock}件</span>}
              </div>
              <div className="mall-good-info">
                <p className="mall-good-name">{g.name}</p>
                <p className="mall-good-orig">价值 ¥{g.originalPrice}</p>
                <div className="mall-good-bottom">
                  <span className="mall-good-price">
                    <Coins size={13} />
                    <span className="num">{g.points}</span>
                    <span className="unit">金币</span>
                  </span>
                  <button
                    className="mall-good-btn"
                    onClick={() => Toast.show({ content: '兑换·敬请期待' })}
                  >
                    兑换
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : data ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <ShoppingBag size={36} color="var(--ink-4)" />
            <span className="empty-text">该分类暂无商品</span>
          </div>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mall-good card">
              <div className="skeleton mall-good-img" />
              <div className="mall-good-info">
                <span className="skeleton" style={{ width: '80%', height: 14 }} />
                <span className="skeleton" style={{ width: '50%', height: 11, marginTop: 8 }} />
                <span className="skeleton" style={{ width: '60%', height: 16, marginTop: 12 }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
