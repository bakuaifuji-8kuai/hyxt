import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { Page, NavBar, Loading, Empty, useFetch, formatNumber } from '../components/common';
import { memberApi } from '../services/api';

const levelCardClass: Record<string, string> = {
  NORMAL: '',
  SILVER: 'gold',
  GOLD: 'gold',
  DIAMOND: 'diamond',
};

function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}

export default function MemberCardPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(memberApi.card, [], true);
  const [platesVisible, setPlatesVisible] = useState(false);

  if (loading) return <Page><NavBar title="我的会员卡" /><Loading /></Page>;
  if (error) return <Page><NavBar title="我的会员卡" /><Empty text="加载失败" /></Page>;
  if (!data) return null;

  const { member, level, benefits, stats, plates } = data as any;
  const cardClass = levelCardClass[member?.level] || '';
  const progressPct = level?.nextLevel
    ? Math.min(100, ((member?.points || 0) / (level.minPoints || 1)) * 100)
    : 100;
  const gap = level?.nextLevel ? (level.gap ?? (level.nextLevel?.minPoints ?? 0) - (member?.points ?? 0)) : 0;

  const statItems = [
    { label: '本月消费', value: stats?.monthSpend != null ? `¥${(stats.monthSpend / 100).toFixed(0)}` : '0' },
    { label: '累计积分', value: formatNumber(stats?.totalPoints ?? member?.points ?? 0) },
    { label: '累计券数', value: String(stats?.totalCoupons ?? 0) },
    { label: '累计订单', value: String(stats?.totalOrders ?? 0) },
  ];

  return (
    <Page>
      <NavBar title="我的会员卡" />

      {/* 大会员卡 */}
      <div className={`member-card-big ${cardClass}`}>
        <div className="top">
          <span className="level-name">{level?.name || member?.level || '普通会员'}</span>
          <span className="level-badge">VIP</span>
        </div>
        <div className="points">{formatNumber(member?.points ?? 0)}</div>
        <div className="bottom">
          <div>{member?.name || '会员'}　{maskPhone(member?.phone || '')}</div>
        </div>
      </div>

      {/* 等级进度 */}
      {level?.nextLevel && (
        <div className="card" style={{ marginTop: 0 }}>
          <div className="flex-between mb-8">
            <span className="text-sm text-muted">升级进度</span>
            <span className="text-sm text-primary">还差 {formatNumber(gap)} 积分升级到 {level.nextLevel?.name || '下一等级'}</span>
          </div>
          <div className="progress" style={{ background: 'rgba(230,57,70,0.1)' }}>
            <div className="progress-bar" style={{ width: `${progressPct}%`, background: 'var(--primary)' }} />
          </div>
          <div className="flex-between mt-8">
            <span className="text-sm">{level.name}</span>
            <span className="text-sm">{level.nextLevel?.name}</span>
          </div>
        </div>
      )}

      {/* 数据统计 */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', textAlign: 'center', gap: 8 }}>
          {statItems.map((s) => (
            <div key={s.label}>
              <div className="text-xl text-bold" style={{ color: 'var(--primary)' }}>{s.value}</div>
              <div className="text-sm text-muted mt-8">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 我的权益 */}
      <div className="section">
        <div className="section-title">我的权益</div>
        <div className="card" style={{ margin: 0, padding: 0 }}>
          {(!benefits || benefits.length === 0) && <Empty text="暂无权益" />}
          {(benefits || []).map((b: any, i: number) => (
            <div className="list-item" key={i}>
              <div className="icon">{b.type === 'DISCOUNT' ? '💰' : b.type === 'GIFT' ? '🎁' : '✨'}</div>
              <div className="body">
                <div className="title">{b.name}</div>
                <div className="desc">
                  {b.type === 'DISCOUNT' && b.value ? `${(b.value / 10).toFixed(1)}折优惠` : ''}
                  {b.type === 'GIFT' ? '生日礼品' : ''}
                  {b.type === 'PARKING' ? '免费停车' : ''}
                  {!b.type ? (b.description || '') : ''}
                </div>
              </div>
              <span className="arrow">›</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部按钮 */}
      <div style={{ padding: '16px 12px', display: 'flex', gap: 8 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPlatesVisible(true)}>
          我的车牌
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/points/logs')}>
          积分明细
        </button>
      </div>

      {/* 车牌弹窗 */}
      {platesVisible && (
        <Dialog
          visible={platesVisible}
          title="我的车牌"
          content={
            (!plates || plates.length === 0)
              ? '暂无绑定车牌'
              : plates.map((p: any, i: number) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '0.5px solid #f0f0f0', fontSize: 15 }}>
                  {typeof p === 'string' ? p : p.plate || p.number || JSON.stringify(p)}
                </div>
              ))
          }
          closeOnAction
          onClose={() => setPlatesVisible(false)}
          actions={[{ key: 'ok', text: '关闭' }]}
        />
      )}
    </Page>
  );
}
