import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Dialog, SwipeAction, Stepper } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { mallApi } from '../services/api';

const GUESS_YOU_LIKE = [
  { id: 'g1', name: '北欧风针织抱枕套', image: '', price: 5900, originalPrice: 9900, sales: 312 },
  { id: 'g2', name: '便携折叠购物袋', image: '', price: 1500, originalPrice: 2900, sales: 1024 },
  { id: 'g3', name: '不锈钢保温杯 500ml', image: '', price: 8800, originalPrice: 12800, sales: 876 },
  { id: 'g4', name: '香薰蜡烛礼盒', image: '', price: 12800, originalPrice: 19900, sales: 542 },
];

export default function MallCartPage() {
  const navigate = useNavigate();
  const { data: cartList, loading, error, reload } = useFetch<any[]>(() => mallApi.cart() as Promise<any[]>);
  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const items = cartList || [];

  // 同步外部 selected 字段
  const isAllSelected = items.length > 0 && items.every((it: any) => selectedIds.includes(it.id));
  const selectedItems = items.filter((it: any) => selectedIds.includes(it.id));
  const totalAmount = selectedItems.reduce(
    (sum: number, it: any) => sum + Number(it.price) * Number(it.quantity || 1),
    0,
  );

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(items.map((it: any) => it.id));
  };

  const handleQuantityChange = async (item: any, v: number) => {
    try {
      await mallApi.updateCart(item.id, v);
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '更新失败' });
    }
  };

  const handleRemove = async (item: any) => {
    const ok = await Dialog.confirm({ content: `确定删除「${item.name}」？` });
    if (!ok) return;
    try {
      await mallApi.removeCart(item.id);
      Toast.show({ icon: 'success', content: '已删除' });
      setSelectedIds((prev) => prev.filter((x) => x !== item.id));
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '删除失败' });
    }
  };

  const handleBatchRemove = async () => {
    if (selectedIds.length === 0) {
      Toast.show('请先选择要删除的商品');
      return;
    }
    const ok = await Dialog.confirm({ content: `确定删除选中的 ${selectedIds.length} 件商品？` });
    if (!ok) return;
    try {
      await Promise.all(selectedIds.map((id) => mallApi.removeCart(id)));
      Toast.show({ icon: 'success', content: '已删除' });
      setSelectedIds([]);
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '删除失败' });
    }
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      Toast.show('请选择要结算的商品');
      return;
    }
    const payload = selectedItems.map((it: any) => ({
      id: it.id,
      goodsId: it.goodsId,
      name: it.name,
      image: it.image,
      price: it.price,
      quantity: it.quantity,
      spec: it.spec,
      stock: it.stock,
    }));
    sessionStorage.setItem('mall_checkout_items', JSON.stringify(payload));
    navigate('/mall/checkout?from=cart');
  };

  return (
    <Page>
      <NavBar
        title="购物车"
        right={
          <span
            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
            onClick={() => {
              setManageMode((m) => !m);
              if (!manageMode) setSelectedIds([]);
            }}
          >
            {manageMode ? '完成' : '管理'}
          </span>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Empty text="加载失败" />
      ) : items.length === 0 ? (
        <>
          <Empty text="购物车空空如也" />
        </>
      ) : (
        <>
          <div className="card" style={{ padding: 0, margin: '8px 12px' }}>
            {items.map((item: any, idx: number) => {
              const checked = selectedIds.includes(item.id);
              const content = (
                <div
                  className="list-item"
                  key={item.id}
                  style={{ alignItems: 'flex-start', cursor: 'default' }}
                >
                  {/* checkbox */}
                  <div
                    onClick={() => toggleSelect(item.id)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: checked ? 'none' : '1px solid #ccc',
                      background: checked ? 'var(--primary)' : '#fff',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      marginRight: 10,
                      marginTop: 22,
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {checked ? '✓' : ''}
                  </div>
                  <Img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                    <div className="ellipsis-2" style={{ fontSize: 13, lineHeight: 1.4 }}>{item.name}</div>
                    {item.spec && (
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                        <span className="tag tag-gray">{item.spec}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                        ¥{fen2yuan(item.price)}
                      </span>
                      <Stepper
                        min={1}
                        max={item.stock || 99}
                        value={item.quantity || 1}
                        onChange={(v) => handleQuantityChange(item, v as number)}
                        style={{ '--button-background-color': 'var(--primary)' }}
                      />
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={item.id} style={{ borderBottom: idx === items.length - 1 ? 'none' : '0.5px solid var(--border)' }}>
                  {manageMode ? (
                    <div
                      style={{ display: 'flex', alignItems: 'stretch', background: '#fff' }}
                    >
                      <div style={{ flex: 1 }}>{content}</div>
                      <button
                        className="btn btn-primary"
                        style={{ borderRadius: 0, width: 70, fontSize: 13 }}
                        onClick={() => handleRemove(item)}
                      >
                        删除
                      </button>
                    </div>
                  ) : (
                    <SwipeAction
                      key={item.id}
                      rightActions={[
                        {
                          key: 'delete',
                          text: '删除',
                          color: 'danger',
                          onClick: () => handleRemove(item),
                        },
                      ]}
                    >
                      {content}
                    </SwipeAction>
                  )}
                </div>
              );
            })}
          </div>

          {/* 猜你喜欢 */}
          <div className="section" style={{ marginTop: 16 }}>
            <div className="section-title">猜你喜欢</div>
            <div className="goods-grid" style={{ padding: 0 }}>
              {GUESS_YOU_LIKE.map((g) => (
                <div key={g.id} className="goods-card" onClick={() => navigate(`/mall/goods/${g.id}`)}>
                  <Img src={g.image} alt={g.name} />
                  <div className="info">
                    <div className="name ellipsis-2">{g.name}</div>
                    <div className="price">
                      <small>¥</small>{fen2yuan(g.price)}
                      <span className="origin">¥{fen2yuan(g.originalPrice)}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>已售 {g.sales}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部留白 */}
          <div style={{ height: 60 }} />
        </>
      )}

      {/* 底部固定栏 */}
      {items.length > 0 && (
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
            padding: '8px 12px',
            gap: 10,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
            zIndex: 100,
          }}
        >
          <div onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: isAllSelected ? 'none' : '1px solid #ccc',
                background: isAllSelected ? 'var(--primary)' : '#fff',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              {isAllSelected ? '✓' : ''}
            </div>
            <span style={{ fontSize: 13 }}>全选</span>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            合计：<span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 16 }}>¥{fen2yuan(totalAmount)}</span>
          </div>
          {manageMode ? (
            <button className="btn btn-outline" style={{ padding: '8px 18px' }} onClick={handleBatchRemove}>
              删除({selectedIds.length})
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ padding: '8px 18px' }}
              disabled={selectedIds.length === 0}
              onClick={handleCheckout}
            >
              去结算({selectedIds.length})
            </button>
          )}
        </div>
      )}
    </Page>
  );
}
