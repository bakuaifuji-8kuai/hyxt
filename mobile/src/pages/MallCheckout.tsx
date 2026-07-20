import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { mallApi } from '../services/api';

type DeliveryTab = '快递邮寄' | '门店自提';

export default function MallCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromCart = searchParams.get('from') === 'cart';
  const goodsIdParam = searchParams.get('goodsId');
  const quantityParam = Number(searchParams.get('quantity') || '1');
  const specParam = searchParams.get('spec') || '';

  const [delivery, setDelivery] = useState<DeliveryTab>('快递邮寄');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // 地址：从 sessionStorage 读取 checkout 选中的地址，否则取默认地址
  const { data: addresses, loading: addrLoading } = useFetch<any[]>(() => mallApi.addresses() as Promise<any[]>, []);
  const [chosenAddressId, setChosenAddressId] = useState<number | null>(null);

  // 从 sessionStorage 读取 checkout 选择的地址 id
  useEffect(() => {
    const stored = sessionStorage.getItem('mall_checkout_address_id');
    if (stored) {
      setChosenAddressId(Number(stored));
      sessionStorage.removeItem('mall_checkout_address_id');
    }
  }, []);

  // 加载订单项
  useEffect(() => {
    const loadItems = async () => {
      if (fromCart) {
        const raw = sessionStorage.getItem('mall_checkout_items');
        if (raw) {
          try {
            setOrderItems(JSON.parse(raw));
            return;
          } catch {
            // ignore
          }
        }
        // 回退：拉购物车
        try {
          const cart = (await mallApi.cart()) as any[];
          setOrderItems((cart || []).filter((c: any) => c.selected));
        } catch {
          setOrderItems([]);
        }
      } else if (goodsIdParam) {
        // 立即购买
        try {
          const g = (await mallApi.goodsDetail(goodsIdParam)) as any;
          setOrderItems([
            {
              goodsId: g.id,
              name: g.name,
              image: g.image,
              price: g.price,
              quantity: quantityParam,
              spec: specParam,
              stock: g.stock,
            },
          ]);
        } catch {
          setOrderItems([]);
        }
      }
    };
    loadItems();
  }, [fromCart, goodsIdParam, quantityParam, specParam]);

  const addressList = addresses || [];
  const currentAddress =
    addressList.find((a: any) => a.id === chosenAddressId) ||
    addressList.find((a: any) => a.isDefault) ||
    addressList[0] ||
    null;

  const goodsTotal = orderItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0,
  );
  const shipping = delivery === '快递邮寄' ? (goodsTotal > 0 ? 1000 : 0) : 0;
  const discount = orderItems.length > 0 ? 500 : 0; // mock 优惠
  const payable = Math.max(0, goodsTotal + shipping - discount);

  const handleSubmit = async () => {
    if (delivery === '快递邮寄' && !currentAddress) {
      Toast.show('请先添加收货地址');
      return;
    }
    if (orderItems.length === 0) {
      Toast.show('暂无可结算商品');
      return;
    }
    setSubmitting(true);
    try {
      const items = orderItems.map((it) => ({
        goodsId: it.goodsId,
        quantity: it.quantity,
        spec: it.spec,
      }));
      const res: any = await mallApi.createOrder({
        items,
        addressId: currentAddress?.id,
        delivery,
        remark: remark.trim() || undefined,
      });
      // 清理 sessionStorage
      sessionStorage.removeItem('mall_checkout_items');
      await Dialog.alert({ content: '下单成功', confirmText: '查看订单' });
      const orderId = res?.orderId || res?.id;
      navigate(`/mall/orders/${orderId}`, { replace: true });
    } catch {
      Toast.show({ icon: 'fail', content: '下单失败' });
    } finally {
      setSubmitting(false);
    }
  };

  const goSelectAddress = () => {
    navigate('/mall/address?from=checkout');
    // 保存当前页参数以便回跳？地址页自带返回
  };

  if (orderItems.length === 0 && !fromCart && !goodsIdParam) {
    return (
      <Page>
        <NavBar title="确认订单" />
        <Empty text="暂无可结算商品" />
      </Page>
    );
  }

  return (
    <Page>
      <NavBar title="确认订单" />

      {orderItems.length === 0 ? (
        <Loading />
      ) : (
        <>
          {/* 配送方式 Tab */}
          <div className="tabs" style={{ top: 44 }}>
            {(['快递邮寄', '门店自提'] as DeliveryTab[]).map((d) => (
              <span
                key={d}
                className={`tab-item ${delivery === d ? 'active' : ''}`}
                onClick={() => setDelivery(d)}
              >
                {d}
              </span>
            ))}
          </div>

          {/* 收货地址 / 自提门店 卡片 */}
          {delivery === '快递邮寄' ? (
            <div
              className="card"
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={goSelectAddress}
            >
              <span style={{ fontSize: 20, marginRight: 10 }}>📍</span>
              {addrLoading ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>加载中...</div>
              ) : currentAddress ? (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {currentAddress.name}　{currentAddress.phone}
                    {currentAddress.isDefault && <span className="tag" style={{ marginLeft: 8 }}>默认</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }} className="ellipsis-2">
                    {currentAddress.province}{currentAddress.city}{currentAddress.district}{currentAddress.detail}
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, color: 'var(--text-secondary)' }}>请添加收货地址</div>
              )}
              <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>›</span>
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 20, marginRight: 10 }}>🏬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>恒伟商业广场 F1 服务台</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    营业时间：10:00 - 22:00
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 商品清单 */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '10px 12px 6px', fontSize: 13, color: 'var(--text-secondary)' }}>
              商品清单（{orderItems.length}件）
            </div>
            {orderItems.map((item, idx) => (
              <div
                key={idx}
                className="list-item"
                style={{ alignItems: 'flex-start', cursor: 'default' }}
              >
                <Img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                  <div className="ellipsis-2" style={{ fontSize: 13, lineHeight: 1.4 }}>{item.name}</div>
                  {item.spec && (
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      <span className="tag tag-gray">{item.spec}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
                      ¥{fen2yuan(item.price)}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>×{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 备注 */}
          <div className="card">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>订单备注</div>
            <textarea
              className="input textarea"
              placeholder="选填：给商家留言"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              maxLength={100}
              style={{ minHeight: 60 }}
            />
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
              padding: '10px 12px',
              gap: 10,
              boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
              zIndex: 100,
            }}
          >
            <div style={{ flex: 1 }}>
              实付：<span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18 }}>
                <small style={{ fontSize: 13 }}>¥</small>{fen2yuan(payable)}
              </span>
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 28px', fontSize: 15 }}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? '提交中...' : '提交订单'}
            </button>
          </div>
        </>
      )}
    </Page>
  );
}
