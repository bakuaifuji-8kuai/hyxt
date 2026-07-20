import React from 'react';
import { useNavigate } from 'react-router-dom';
import { pointsApi } from '../services/api';
import { useFetch, Img, formatNumber, Loading, Empty } from '../components/common';

const EARN_TASKS = [
  { name: '完善资料', icon: '✏️', points: 50, link: '/profile/edit' },
  { name: '每日签到', icon: '📅', points: 10, link: '/checkin' },
  { name: '拍照积分', icon: '📸', points: 20, link: '/photo-points' },
  { name: '消费返积分', icon: '🛒', points: 0, link: '/mall/orders' },
];

export default function PointsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => pointsApi.mall() as Promise<any>, []);

  if (loading) return <div className="page"><Loading /></div>;
  if (error) return <div className="page"><Empty text="加载失败" /></div>;

  const { balance = 0, hotGoods = [], categories = [] } = data || {};

  return (
    <div className="page">
      {/* 顶部积分余额 */}
      <div
        style={{
          margin: '0 12px 12px',
          borderRadius: 16,
          padding: '24px 16px 16px',
          background: 'linear-gradient(135deg, #3a2a5e 0%, #6b3fa0 50%, #c81d2a 100%)',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(107,63,160,0.25)',
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.85 }}>我的积分</div>
        <div style={{ fontSize: 36, fontWeight: 700, margin: '4px 0' }}>{formatNumber(balance)}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8, fontSize: 12, opacity: 0.9 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/points/logs')}>积分明细 ›</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/points/orders')}>兑换订单 ›</span>
        </div>
      </div>

      {/* 积分获取入口横条 */}
      <div className="card flex-between" style={{ padding: '10px 4px' }}>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/photo-points')}>
          <span style={{ fontSize: 22 }}>📸</span>拍照积分
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/checkin')}>
          <span style={{ fontSize: 22 }}>📅</span>签到
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/activity/new-member/0')}>
          <span style={{ fontSize: 22 }}>🎁</span>新人礼
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/activity/referral/0')}>
          <span style={{ fontSize: 22 }}>🤝</span>推荐有礼
        </span>
      </div>

      {/* 热门兑换 */}
      <div className="section">
        <div className="section-title">热门兑换</div>
        {hotGoods.length > 0 ? (
          <div className="goods-grid">
            {hotGoods.map((item: any, i: number) => (
              <div key={item.id || i} className="goods-card" onClick={() => navigate(`/points/goods/${item.id || i}`)}>
                <Img src={item.imageUrl || item.image} alt={item.name} />
                <div className="info">
                  <div className="name ellipsis-2">{item.name}</div>
                  <div className="price" style={{ color: 'var(--gold-dark)' }}>{item.points ?? item.requiredPoints}积分</div>
                  {item.stock != null && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>库存{item.stock}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="暂无兑换商品" />
        )}
      </div>

      {/* 赚积分任务 */}
      <div className="section">
        <div className="section-title">赚积分</div>
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          {EARN_TASKS.map((task) => (
            <div key={task.name} className="list-item" onClick={() => navigate(task.link)}>
              <span className="icon">{task.icon}</span>
              <span className="body">
                <span className="title">{task.name}</span>
                {task.points > 0 && <span className="desc">+{task.points}积分</span>}
              </span>
              <span className="tag tag-gold">去完成</span>
            </div>
          ))}
        </div>
      </div>

      {/* 积分规则说明 */}
      <div style={{ textAlign: 'center', padding: '16px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
        积分规则：消费1元=1积分，积分不可转让，有效期为获取后12个月
      </div>
    </div>
  );
}
