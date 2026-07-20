import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Toast } from 'antd-mobile';
import { memberApi } from '../services/api';
import { logout, getStoredMember, fetchMe } from '../services/auth';
import { useFetch, formatNumber, Loading } from '../components/common';

const SERVICE_GROUPS = [
  {
    title: '营销活动',
    items: [
      { name: '我的活动', icon: '🎯', link: '/activity/mine' },
      { name: '邀请记录', icon: '🤝', link: '/activity/referral/0' },
      { name: '签到记录', icon: '📅', link: '/checkin' },
    ],
  },
  {
    title: '卡券订单',
    items: [
      { name: '我的订单', icon: '📦', link: '/mall/orders' },
      { name: '积分订单', icon: '🪙', link: '/points/orders' },
      { name: '我的券包', icon: '🎟️', link: '/coupon/mine' },
    ],
  },
  {
    title: '便民服务',
    items: [
      { name: '物品租借', icon: '🔧', link: '/rental' },
      { name: '拍照积分', icon: '📸', link: '/photo-points' },
      { name: '在线客服', icon: '💬', link: '/service' },
      { name: '业主服务', icon: '🏡', link: '/property' },
    ],
  },
  {
    title: '设置',
    items: [
      { name: '收货地址', icon: '📍', link: '/mall/address' },
      { name: '消息中心', icon: '🔔', link: '/messages' },
      { name: '关于我们', icon: 'ℹ️', link: '__about__' },
    ],
  },
];

function getCardClass(level?: string) {
  const l = (level || '').toUpperCase();
  if (l === 'DIAMOND') return 'diamond';
  if (l === 'GOLD' || l === 'SILVER') return 'gold';
  return '';
}

function getLevelName(level?: string) {
  const l = (level || '').toUpperCase();
  if (l === 'DIAMOND') return '钻石会员';
  if (l === 'GOLD') return '黄金会员';
  if (l === 'SILVER') return '白银会员';
  return '普通会员';
}

export default function MePage() {
  const navigate = useNavigate();
  const { data: cardData, loading, reload } = useFetch(() => memberApi.card() as Promise<any>, []);
  const [member, setMember] = useState(getStoredMember());

  useEffect(() => {
    fetchMe().then(setMember).catch(() => {});
  }, []);

  if (loading) return <div className="page"><Loading /></div>;

  const level = member?.level || cardData?.level?.code || '';
  const points = cardData?.stats?.totalPoints ?? member?.points ?? 0;
  const name = member?.name || '未登录';
  const phone = member?.phone || '';
  const profileCompleteness = cardData?.profileCompleteness ?? 60;

  return (
    <div className="page">
      {/* 会员卡大卡 */}
      <div className={`member-card-big ${getCardClass(level)}`} onClick={() => navigate('/member/card')}>
        <div className="top">
          <div>
            <div className="level-name">{getLevelName(level)}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>积分 <span className="points">{formatNumber(points)}</span></div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            👤
          </div>
        </div>
        <div className="bottom">
          <span>{name}</span>
          {phone && <span style={{ marginLeft: 12 }}>{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>}
        </div>
      </div>

      {/* 资料完善度 */}
      <div className="card">
        <div className="flex-between mb-8">
          <span style={{ fontSize: 13 }}>资料完善度 {profileCompleteness}%</span>
          <span style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/profile/edit')}>完善资料领奖励 ›</span>
        </div>
        <div className="progress" style={{ background: '#f0f0f0' }}>
          <div className="progress-bar" style={{ width: `${profileCompleteness}%`, background: 'var(--primary)' }} />
        </div>
      </div>

      {/* 4 个统计项 */}
      <div className="card flex-between" style={{ padding: '12px 4px' }}>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/points/logs')}>
          <span style={{ fontSize: 18, color: 'var(--primary)' }}>{formatNumber(points)}</span>积分
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/coupon/mine')}>
          <span style={{ fontSize: 18, color: 'var(--primary)' }}>{cardData?.stats?.totalCoupons ?? 0}</span>优惠券
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/mall/orders')}>
          <span style={{ fontSize: 18, color: 'var(--primary)' }}>0</span>订单
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11, flex: 1 }} onClick={() => navigate('/parking/records')}>
          <span style={{ fontSize: 18, color: 'var(--primary)' }}>🅿️</span>停车
        </span>
      </div>

      {/* 我的服务 */}
      {SERVICE_GROUPS.map((group) => (
        <div key={group.title} className="section">
          <div className="section-title">{group.title}</div>
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            {group.items.map((item) => (
              <div
                key={item.name}
                className="list-item"
                onClick={() => {
                  if (item.link === '__about__') {
                    Dialog.alert({
                      title: '关于我们',
                      content: '恒伟商业广场 C端小程序 v1.0.0',
                    });
                  } else {
                    navigate(item.link);
                  }
                }}
              >
                <span className="icon">{item.icon}</span>
                <span className="body"><span className="title">{item.name}</span></span>
                <span className="arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 退出登录 */}
      <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
        <span
          style={{ color: 'var(--primary)', fontSize: 14, cursor: 'pointer' }}
          onClick={async () => {
            const confirmed = await Dialog.confirm({ content: '确定退出登录？' });
            if (confirmed) {
              logout();
              navigate('/login');
              Toast.show('已退出登录');
            }
          }}
        >
          退出登录
        </span>
      </div>
    </div>
  );
}
