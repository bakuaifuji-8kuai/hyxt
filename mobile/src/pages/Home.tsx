import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { homeApi } from '../services/api';
import { useFetch, Img, fen2yuan, Loading, Empty } from '../components/common';

const MALL_NAME = '恒伟商业广场';

const QUICK_NAV_ITEMS = [
  { name: '停车缴费', icon: '🅿️', link: '/parking' },
  { name: '领券中心', icon: '🎟️', link: '/coupon' },
  { name: '积分商城', icon: '🪙', link: '/points' },
  { name: '活动中心', icon: '🎉', link: '/activity' },
  { name: '品牌导览', icon: '🏢', link: '/merchants' },
  { name: '餐饮美食', icon: '🍜', link: '/food' },
  { name: '新人礼', icon: '🎁', link: '/activity/new-member/0' },
  { name: '业主服务', icon: '🏡', link: '/property' },
];

function BannerSwiper({ banners }: { banners: { imageUrl: string; linkUrl: string; title: string }[] }) {
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

function CountdownTimer({ endTime }: { endTime: string | number }) {
  const [h, setH] = useState('00');
  const [m, setM] = useState('00');
  const [s, setS] = useState('00');

  useEffect(() => {
    const end = new Date(endTime).getTime();
    if (isNaN(end)) return;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setH(String(Math.floor(diff / 3600000)).padStart(2, '0'));
      setM(String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'));
      setS(String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  return (
    <span className="countdown">
      <b>{h}</b>:<b>{m}</b>:<b>{s}</b>
    </span>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => homeApi.home() as Promise<any>, []);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (data?.popup) setPopupVisible(true);
  }, [data]);

  if (loading) return <div className="page"><Loading /></div>;
  if (error) return <div className="page"><Empty text="加载失败" /></div>;

  const { banners = [], services = [], seckill = [], groupbuy = [], newMember, referral, merchants = [] } = data || {};

  return (
    <div className="page">
      {/* 顶部固定栏 */}
      <div className="navbar" style={{ background: 'var(--primary)', color: '#fff', borderBottom: 'none' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 16 }}>
          📍 {MALL_NAME}
        </span>
        <span
          style={{ flex: 1, margin: '0 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 12px', fontSize: 13, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
          onClick={() => navigate('/search')}
        >
          🔍 搜索品牌/活动
        </span>
        <span style={{ cursor: 'pointer', fontSize: 20 }} onClick={() => navigate('/messages')}>💬</span>
      </div>

      {/* Banner */}
      {banners.length > 0 && <BannerSwiper banners={banners} />}

      {/* 会员卡摘要条 */}
      <div className="member-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/member/card')}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="level-badge">普通会员</span>
          <span style={{ fontSize: 13 }}>积分 <b style={{ fontSize: 18 }}>{data?.member?.points ?? '--'}</b></span>
        </span>
        <span style={{ fontSize: 12, opacity: 0.9 }}>查看权益 ›</span>
      </div>

      {/* 金刚区 */}
      <div className="quick-nav">
        {QUICK_NAV_ITEMS.map((item) => (
          <div key={item.name} className="quick-nav-item" onClick={() => navigate(item.link)}>
            <span className="quick-nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      {/* 秒杀板块 */}
      {seckill.length > 0 && (
        <div className="section">
          <div className="section-title">
            秒杀专区
            <span className="more" style={{ cursor: 'pointer' }} onClick={() => navigate('/activity/seckill/0')}>更多 ›</span>
          </div>
          <div className="scroll-x flex gap-8" style={{ padding: '0 0 8px' }}>
            {seckill.map((item: any, i: number) => (
              <div key={i} style={{ minWidth: 110, background: '#fff', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }} onClick={() => navigate(`/activity/seckill/${item.id || i}`)}>
                <Img src={item.imageUrl || item.image} alt={item.name} style={{ width: 110, height: 110, objectFit: 'cover' }} />
                <div style={{ padding: 6 }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>¥{fen2yuan(item.seckillPrice ?? item.price)}</div>
                  <div style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: 11 }}>¥{fen2yuan(item.originPrice ?? item.price)}</div>
                  {item.endTime && <CountdownTimer endTime={item.endTime} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 拼团板块 */}
      {groupbuy.length > 0 && (
        <div className="section">
          <div className="section-title">拼团优惠</div>
          <div className="goods-grid">
            {groupbuy.map((item: any, i: number) => (
              <div key={i} className="goods-card" onClick={() => navigate(`/activity/groupbuy/${item.id || i}`)}>
                <Img src={item.imageUrl || item.image} alt={item.name} />
                <div className="info">
                  <div className="name ellipsis-2">{item.name}</div>
                  <div className="price">¥{fen2yuan(item.groupPrice ?? item.price)}</div>
                  {item.joinCount != null && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.joinCount}人参团</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推荐品牌/商户 */}
      {merchants.length > 0 && (
        <div className="section">
          <div className="section-title">品牌推荐</div>
          <div className="goods-grid">
            {merchants.map((item: any, i: number) => (
              <div key={i} className="goods-card" onClick={() => navigate(`/merchants/${item.id || i}`)}>
                <Img src={item.logo || item.imageUrl} alt={item.name} style={{ width: '100%', height: 80, objectFit: 'contain', background: '#f5f5f5', padding: 8 }} />
                <div className="info">
                  <div className="name ellipsis">{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.category || ''}{item.floor ? ` · ${item.floor}F` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 弹窗广告 */}
      {popupVisible && data?.popup && (
        <div className="popup-mask" onClick={() => setPopupVisible(false)}>
          <div className="popup-ad" onClick={(e) => e.stopPropagation()}>
            <Img src={data.popup.imageUrl} alt="广告" />
            <div className="close" onClick={() => setPopupVisible(false)}>✕</div>
          </div>
        </div>
      )}

      {/* 浮动客服按钮 */}
      <div className="fab" onClick={() => navigate('/service')}>🛎️</div>
    </div>
  );
}
