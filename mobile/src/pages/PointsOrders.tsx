import React, { useState } from 'react';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { api } from '../services/request';
import { Toast, Dialog } from 'antd-mobile';

type TabKey = 'all' | 'pending_ship' | 'pending_pickup' | 'completed';

export default function PointsOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const { data: orders, loading, error, reload } = useFetch<any[]>(() => api.get('/c/points/orders'));

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending_ship', label: '待发货' },
    { key: 'pending_pickup', label: '待自提' },
    { key: 'completed', label: '已完成' },
  ];

  const filtered = orders?.filter((o: any) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  }) || [];

  const handleViewLogistics = () => {
    Dialog.alert({ content: '物流信息暂未更新，请稍后查看' });
  };

  const handleCancel = async (id: any) => {
    const result = await Dialog.confirm({ content: '确认取消该订单？' });
    if (result) {
      try {
        await api.post(`/c/points/orders/${id}/cancel`);
        Toast.show({ content: '已取消', icon: 'success' });
        reload();
      } catch {
        Toast.show({ content: '取消失败', icon: 'fail' });
      }
    }
  };

  const handleConfirmReceive = async (id: any) => {
    try {
      await api.post(`/c/points/orders/${id}/confirm`);
      Toast.show({ content: '已确认收货', icon: 'success' });
      reload();
    } catch {
      Toast.show({ content: '操作失败', icon: 'fail' });
    }
  };

  const statusLabel: Record<string, string> = {
    pending_ship: '待发货',
    pending_pickup: '待自提',
    completed: '已完成',
    cancelled: '已取消',
  };

  return (
    <Page>
      <NavBar title="兑换订单" />
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
      {!loading && !error && filtered.length === 0 && <Empty text="暂无订单" />}
      {!loading && !error && filtered.map((o: any) => (
        <div className="card" key={o.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            <span>订单号：{o.orderNo || o.id}</span>
            <span className="tag">{statusLabel[o.status] || o.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Img src={o.goods?.image} alt={o.goods?.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ellipsis text-bold" style={{ fontSize: 14 }}>{o.goods?.name || o.goodsName}</div>
              <div style={{ fontSize: 13, color: 'var(--gold-dark)', marginTop: 4 }}>{o.points || o.costPoints} 积分</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{o.createdAt}</div>
            </div>
          </div>
          {/* 底部操作按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            {o.status === 'completed' && (
              <button className="btn btn-outline btn-sm" onClick={handleViewLogistics}>查看物流</button>
            )}
            {o.status === 'pending_ship' && (
              <button className="btn btn-sm" onClick={() => handleCancel(o.id)}>取消订单</button>
            )}
            {o.status === 'pending_pickup' && (
              <button className="btn btn-primary btn-sm" onClick={() => handleConfirmReceive(o.id)}>确认收货</button>
            )}
          </div>
        </div>
      ))}
    </Page>
  );
}
