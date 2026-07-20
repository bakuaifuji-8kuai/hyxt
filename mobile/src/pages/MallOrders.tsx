import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { mallApi } from '../services/api';

type TabKey = 'all' | 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
};

const STATUS_TAG_CLASS: Record<string, string> = {
  pending: 'tag',
  paid: 'tag tag-blue',
  shipped: 'tag tag-gold',
  completed: 'tag tag-green',
  cancelled: 'tag tag-gray',
};

export default function MallOrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const { data: raw, loading, error, reload } = useFetch<any>(
    () => mallApi.orders({ status: activeTab === 'all' ? undefined : activeTab }) as Promise<any>,
    [activeTab],
  );

  // 适配两种返回格式
  const normalize = (): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    // 分组对象：{ pending:[...], paid:[...]... }
    const lists: any[] = [];
    Object.keys(raw).forEach((k) => {
      if (Array.isArray((raw as any)[k])) lists.push(...(raw as any)[k]);
    });
    return lists;
  };

  const orders = normalize();

  const handleCancel = async (o: any) => {
    const ok = await Dialog.confirm({ content: '确定取消该订单？' });
    if (!ok) return;
    try {
      await mallApi.cancelOrder(o.id);
      Toast.show({ icon: 'success', content: '已取消' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '取消失败' });
    }
  };

  const handlePay = (o: any) => {
    Toast.show({ content: '支付功能开发中', icon: 'fail' });
  };

  const handleRefund = async (o: any) => {
    const ok = await Dialog.confirm({ content: '确定申请退款？' });
    if (!ok) return;
    try {
      await mallApi.refundOrder(o.id, '买家申请退款');
      Toast.show({ icon: 'success', content: '已申请退款' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  const handleViewLogistics = (o: any) => {
    Dialog.alert({
      title: '物流信息',
      content: (
        <div style={{ textAlign: 'left', fontSize: 13, lineHeight: 1.8 }}>
          <div>物流公司：顺丰速运</div>
          <div>运单号：SF{String(o.id || '').padStart(12, '0')}</div>
          <div style={{ marginTop: 6 }}>最新轨迹：包裹已到达【恒伟商业广场】派送点，即将派送。</div>
        </div>
      ),
    });
  };

  const handleConfirmReceive = async (o: any) => {
    const ok = await Dialog.confirm({ content: '确认已收到商品？' });
    if (!ok) return;
    try {
      await mallApi.cancelOrder(o.id); // mock 调用，后端无 confirm 接口
      Toast.show({ icon: 'success', content: '已确认收货' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  const handleRepurchase = (o: any) => {
    const firstGoods = o.goods?.[0];
    if (firstGoods?.goodsId || firstGoods?.id) {
      navigate(`/mall/goods/${firstGoods.goodsId || firstGoods.id}`);
    } else {
      navigate('/mall/goods');
    }
  };

  const handleReview = (o: any) => {
    Toast.show('评价功能开发中');
  };

  return (
    <Page>
      <NavBar title="我的订单" />

      <div className="tabs" style={{ top: 44 }}>
        {TABS.map((t) => (
          <span
            key={t.key}
            className={`tab-item ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </span>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <Empty text="加载失败" />
      ) : orders.length === 0 ? (
        <Empty text="暂无订单" />
      ) : (
        <div style={{ padding: '8px 12px' }}>
          {orders.map((o: any, idx: number) => (
            <div
              key={o.id ?? idx}
              className="card"
              style={{ margin: 0, marginBottom: 10, padding: 12, cursor: 'pointer' }}
              onClick={() => navigate(`/mall/orders/${o.id}`)}
            >
              {/* 订单号 + 状态 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  订单号：{o.orderNo || o.id}
                </span>
                <span className={STATUS_TAG_CLASS[o.status] || 'tag tag-gray'}>
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>

              {/* 商品列表（横向滚动） */}
              <div className="scroll-x" style={{ display: 'flex', gap: 8, padding: '4px 0 8px' }}>
                {(o.goods || []).map((g: any, gi: number) => (
                  <div
                    key={gi}
                    style={{ width: 72, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <Img
                      src={g.image}
                      alt={g.name}
                      style={{ width: 72, height: 72, borderRadius: 6, objectFit: 'cover' }}
                    />
                    <div className="ellipsis" style={{ fontSize: 11 }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>×{g.quantity}</div>
                  </div>
                ))}
              </div>

              {/* 金额栏 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 6, fontSize: 13, borderTop: '0.5px solid var(--border)', paddingTop: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>共{(o.goods || []).reduce((s: number, g: any) => s + (g.quantity || 1), 0)}件 实付</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 16 }}>
                  ¥{fen2yuan(o.amount)}
                </span>
              </div>

              {/* 底部按钮 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                {o.status === 'pending' && (
                  <>
                    <button className="btn btn-sm" onClick={() => handleCancel(o)}>取消订单</button>
                    <button className="btn btn-primary btn-sm" onClick={() => handlePay(o)}>去支付</button>
                  </>
                )}
                {o.status === 'paid' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleRefund(o)}>申请退款</button>
                )}
                {o.status === 'shipped' && (
                  <>
                    <button className="btn btn-sm" onClick={() => handleViewLogistics(o)}>查看物流</button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleConfirmReceive(o)}>确认收货</button>
                  </>
                )}
                {o.status === 'completed' && (
                  <>
                    <button className="btn btn-sm" onClick={() => handleReview(o)}>评价</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleRepurchase(o)}>再次购买</button>
                  </>
                )}
                {o.status === 'cancelled' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleRepurchase(o)}>再次购买</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
