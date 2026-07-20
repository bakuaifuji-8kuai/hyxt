import React, { useState } from 'react';
import { Toast } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, fen2yuan } from '../components/common';
import { couponApi } from '../services/api';

type TabKey = 'unused' | 'used' | 'expired';

export default function CouponMinePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('unused');
  const { data, loading, error } = useFetch<any>(() => couponApi.mine());

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'unused', label: '未使用' },
    { key: 'used', label: '已使用' },
    { key: 'expired', label: '已过期' },
  ];

  const handleUse = () => {
    Toast.show({ content: '请到店出示' });
  };

  const renderCoupon = (item: any, status: TabKey) => {
    const t = item.template || item;
    const thresholdText = t.type === 'cash' ? '无门槛' : `满${fen2yuan(t.minSpend)}可用`;
    const extraClass = status === 'used' ? 'used' : status === 'expired' ? 'expired' : '';
    return (
      <div className={`coupon-card ${extraClass}`} key={item.code || item.id}>
        <div className="left">
          <div className="amount"><small>¥</small>{fen2yuan(t.value)}</div>
          <div className="threshold">{thresholdText}</div>
        </div>
        <div className="right">
          <div className="name">{t.name}</div>
          <div className="scope">{t.scope || '全场通用'}</div>
          <div className="validity">有效期至 {t.endDate}</div>
          {status === 'unused' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn btn-primary btn-sm" onClick={handleUse}>立即使用</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const list = data ? (data[activeTab] || []) : [];

  return (
    <Page>
      <NavBar title="我的券包" />
      {/* Tab 切换 */}
      <div className="tabs">
        {tabs.map(t => (
          <span
            key={t.key}
            className={`tab-item ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </span>
        ))}
      </div>

      {loading && <Loading />}
      {error && <Empty text="加载失败" />}
      {!loading && !error && list.length === 0 && <Empty text="暂无优惠券" />}
      {!loading && !error && list.map((item: any) => renderCoupon(item, activeTab))}
    </Page>
  );
}
