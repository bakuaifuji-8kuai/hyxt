import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { mallApi } from '../services/api';

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
};

const STATUS_DESC: Record<string, string> = {
  pending: '等待付款，请在 30 分钟内完成支付',
  paid: '商家正在备货，请耐心等待发货',
  shipped: '商品已发出，请留意收货',
  completed: '订单已完成，期待您的再次光临',
  cancelled: '订单已取消',
};

const MOCK_LOGISTICS = [
  { time: '2026-07-19 15:30', content: '已签收，签收人：本人' },
  { time: '2026-07-19 09:12', content: '包裹已到达【恒伟商业广场】派送点' },
  { time: '2026-07-18 22:40', content: '快件已从【杭州转运中心】发出' },
];

export default function MallOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, loading, error, reload } = useFetch<any>(() => mallApi.orderDetail(id!));

  const handleCancel = async () => {
    const ok = await Dialog.confirm({ content: '确定取消该订单？' });
    if (!ok) return;
    try {
      await mallApi.cancelOrder(id!);
      Toast.show({ icon: 'success', content: '已取消' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '取消失败' });
    }
  };

  const handlePay = () => {
    Toast.show({ content: '支付功能开发中', icon: 'fail' });
  };

  const handleRefund = async () => {
    const ok = await Dialog.confirm({ content: '确定申请退款？' });
    if (!ok) return;
    try {
      await mallApi.refundOrder(id!, '买家申请退款');
      Toast.show({ icon: 'success', content: '已申请退款' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  const handleConfirmReceive = async () => {
    const ok = await Dialog.confirm({ content: '确认已收到商品？' });
    if (!ok) return;
    try {
      await mallApi.cancelOrder(id!); // mock：后端无 confirm 接口
      Toast.show({ icon: 'success', content: '已确认收货' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  const handleRepurchase = () => {
    const first = order?.goods?.[0];
    if (first?.goodsId || first?.id) {
      navigate(`/mall/goods/${first.goodsId || first.id}`);
    } else {
      navigate('/mall/goods');
    }
  };

  if (loading) return <Page><NavBar title="订单详情" /><Loading /></Page>;
  if (error || !order) return <Page><NavBar title="订单详情" /><Empty text="订单不存在" /></Page>;

  const status = order.status;
  const goodsList = order.goods || [];
  const goodsTotal = goodsList.reduce((s: number, g: any) => s + Number(g.price) * Number(g.quantity || 1), 0);
  const shipping = order.delivery === '快递邮寄' || order.delivery === '快递' ? 1000 : 0;
  const discount = order.discount ?? 500;
  const payable = order.amount ?? Math.max(0, goodsTotal + shipping - discount);
  const address = order.address;
  const logistics = order.logistics || MOCK_LOGISTICS;

  return (
    <Page>
      <NavBar title="订单详情" />

      {/* 状态卡片（红色渐变） */}
      <div
        style={{
          margin: '0 12px 12px',
          padding: '20px 16px',
          borderRadius: 12,
          color: '#fff',
          background: 'linear-gradient(135deg, #e63946 0%, #c81d2a 100%)',
          boxShadow: '0 4px 12px rgba(230, 57, 70, 0.25)',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          {STATUS_LABEL[status] || status}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>
          {STATUS_DESC[status] || ''}
        </div>
      </div>

      {/* 收货地址 / 自提信息 */}
      <div className="card" style={{ display: 'flex', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, marginRight: 10, marginTop: 2 }}>
          {order.delivery === '快递邮寄' || order.delivery === '快递' ? '📍' : '🏬'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {order.delivery === '快递邮寄' || order.delivery === '快递' ? (
            address ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {address.name}　{address.phone}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {address.province}{address.city}{address.district}{address.detail}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>暂无收货地址</div>
            )
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 500 }}>恒伟商业广场 F1 服务台</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                营业时间：10:00 - 22:00
              </div>
            </>
          )}
        </div>
      </div>

      {/* 物流信息（已发货状态） */}
      {(status === 'shipped' || status === 'completed') && logistics && logistics.length > 0 && (
        <div className="card">
          <div className="card-title">
            物流信息
            <span className="more">顺丰速运 · SF{String(order.id || '').padStart(12, '0')}</span>
          </div>
          <div style={{ position: 'relative', paddingLeft: 12 }}>
            {logistics.map((l: any, i: number) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  paddingBottom: i === logistics.length - 1 ? 0 : 14,
                  paddingLeft: 14,
                }}
              >
                {/* 时间点 */}
                <span
                  style={{
                    position: 'absolute',
                    left: -2,
                    top: 4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--primary)' : '#ccc',
                  }}
                />
                {/* 连线 */}
                {i !== logistics.length - 1 && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 1,
                      top: 12,
                      bottom: 0,
                      width: 1,
                      background: 'var(--border)',
                    }}
                  />
                )}
                <div style={{ fontSize: 13, color: i === 0 ? 'var(--text)' : 'var(--text-secondary)', fontWeight: i === 0 ? 500 : 400 }}>
                  {l.content}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{l.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 商品清单 */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '10px 12px 6px', fontSize: 13, color: 'var(--text-secondary)' }}>
          商品清单
        </div>
        {goodsList.map((g: any, idx: number) => (
          <div
            key={idx}
            className="list-item"
            style={{ alignItems: 'flex-start', cursor: 'default' }}
          >
            <Img
              src={g.image}
              alt={g.name}
              style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
              <div className="ellipsis-2" style={{ fontSize: 13, lineHeight: 1.4 }}>{g.name}</div>
              {g.spec && (
                <div style={{ fontSize: 11, marginTop: 4 }}>
                  <span className="tag tag-gray">{g.spec}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>¥{fen2yuan(g.price)}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>×{g.quantity}</span>
              </div>
            </div>
            <div style={{ width: 70, textAlign: 'right', fontSize: 13, color: 'var(--text)' }}>
              ¥{fen2yuan(Number(g.price) * Number(g.quantity || 1))}
            </div>
          </div>
        ))}
      </div>

      {/* 金额明细 */}
      <div className="card">
        <div className="card-title">金额明细</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>商品总额</span>
            <span>¥{fen2yuan(goodsTotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>运费</span>
            <span>{shipping === 0 ? '免运费' : `¥${fen2yuan(shipping)}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>优惠</span>
            <span style={{ color: 'var(--primary)' }}>-¥{fen2yuan(discount)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 8,
              borderTop: '0.5px solid var(--border)',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontWeight: 600 }}>实付金额</span>
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 20 }}>
              <small style={{ fontSize: 14 }}>¥</small>{fen2yuan(payable)}
            </span>
          </div>
        </div>
      </div>

      {/* 订单信息 */}
      <div className="card">
        <div className="card-title">订单信息</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          <InfoRow label="订单号" value={order.orderNo || String(order.id || '')} />
          <InfoRow label="下单时间" value={order.createdAt || '-'} />
          <InfoRow label="支付方式" value={order.payMethod || (status === 'pending' ? '未支付' : '微信支付')} />
          <InfoRow label="配送方式" value={order.delivery || '快递邮寄'} />
          {order.remark && <InfoRow label="备注" value={order.remark} />}
        </div>
      </div>

      {/* 底部留白 */}
      <div style={{ height: 60 }} />

      {/* 底部固定栏 */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTop: '0.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '10px 12px',
          gap: 8,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          zIndex: 100,
        }}
      >
        {status === 'pending' && (
          <>
            <button className="btn btn-sm" onClick={handleCancel}>取消订单</button>
            <button className="btn btn-primary btn-sm" onClick={handlePay}>去支付</button>
          </>
        )}
        {status === 'paid' && (
          <button className="btn btn-outline btn-sm" onClick={handleRefund}>申请退款</button>
        )}
        {status === 'shipped' && (
          <button className="btn btn-primary btn-sm" onClick={handleConfirmReceive}>确认收货</button>
        )}
        {(status === 'completed' || status === 'cancelled') && (
          <button className="btn btn-outline btn-sm" onClick={handleRepurchase}>再次购买</button>
        )}
      </div>
    </Page>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <span style={{ color: 'var(--text-secondary)', width: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
