import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mallApi } from '../services/api';
import { useFetch, Img, fen2yuan, Loading, Empty } from '../components/common';

const PROMO_ENTRIES = [
  { name: '拼团', icon: '👥', link: '/activity/groupbuy/0' },
  { name: '秒杀', icon: '⚡', link: '/activity/seckill/0' },
  { name: '预售', icon: '📦', link: '/activity/pre-sale/0' },
  { name: '盲盒', icon: '🎁', link: '/activity/blind-box/0' },
];

function BannerSwiper({ banners }: { banners: any[] }) {
  const [idx, setIdx] = useState(0);
  const len = banners.length;

  useEffect(() => {
    if (len <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % len), 5000);
    return () => clearInterval(t);
  }, [len]);

  if (!len) return null;
  const cur = banners[idx];

  return (
    <div className="banner">
      <Img src={cur.imageUrl} alt={cur.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {len > 1 && (
        <div className="banner-dots">
          {banners.map((_, i) => (
            <span key={i} className={i === idx ? 'active' : ''} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MallPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => mallApi.home() as Promise<any>, []);

  if (loading) return <div className="page"><Loading /></div>;
  if (error) return <div className="page"><Empty text="加载失败" /></div>;

  const { banners = [], categories = [], goods = [], promotions } = data || {};

  return (
    <div className="page">
      {/* 顶部搜索框 + 消息 */}
      <div className="navbar" style={{ borderBottom: 'none' }}>
        <span
          style={{ flex: 1, background: '#f5f5f5', borderRadius: 20, padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}
          onClick={() => navigate('/search?from=mall')}
        >
          🔍 搜索商品
        </span>
        <span style={{ marginLeft: 10, cursor: 'pointer', fontSize: 20 }} onClick={() => navigate('/messages')}>💬</span>
      </div>

      {/* 商城 Banner */}
      {banners.length > 0 && <BannerSwiper banners={banners} />}

      {/* 商品分类金刚区 */}
      {categories.length > 0 && (
        <div className="quick-nav">
          {categories.map((cat: any) => (
            <div key={cat.id || cat.name} className="quick-nav-item" onClick={() => navigate(`/mall/goods?category=${cat.id || cat.name}`)}>
              <span className="quick-nav-icon">{cat.icon || '🛍️'}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* 营销入口横条 */}
      <div className="card flex-between" style={{ padding: '10px 8px' }}>
        {PROMO_ENTRIES.map((item) => (
          <span
            key={item.name}
            className="flex-center flex-col"
            style={{ cursor: 'pointer', gap: 2, fontSize: 11 }}
            onClick={() => navigate(item.link)}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            {item.name}
          </span>
        ))}
      </div>

      {/* 商品列表 */}
      {goods.length > 0 ? (
        <div className="section">
          <div className="section-title">热门商品</div>
          <div className="goods-grid">
            {goods.map((item: any, i: number) => (
              <div key={item.id || i} className="goods-card" onClick={() => navigate(`/mall/goods/${item.id || i}`)}>
                <Img src={item.imageUrl || item.image || item.coverUrl} alt={item.name} />
                <div className="info">
                  <div className="name ellipsis-2">{item.name}</div>
                  <div className="price">¥{fen2yuan(item.price)}{item.sales != null && <small> · 已售{item.sales}</small>}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty text="暂无商品" />
      )}

      {/* 查看更多 */}
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <span className="btn btn-outline btn-sm" onClick={() => navigate('/mall/goods')}>查看更多</span>
      </div>
    </div>
  );
}
