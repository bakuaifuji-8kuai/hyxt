import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, Dialog, Stepper } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { pointsApi } from '../services/api';

export default function PointsGoodsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goods, loading, error } = useFetch<any>(() => pointsApi.goodsDetail(id!));
  const [delivery, setDelivery] = useState<string>('自提');
  const [quantity, setQuantity] = useState(1);

  if (loading) return <Page><NavBar title="积分商品详情" /><Loading /></Page>;
  if (error || !goods) return <Page><NavBar title="积分商品详情" /><Empty text="商品不存在" /></Page>;

  const totalPoints = goods.points * quantity;
  const maxQty = goods.stock || 99;

  const handleExchange = async () => {
    try {
      await pointsApi.exchange({ goodsId: goods.id, quantity, delivery });
      const result = await Dialog.confirm({
        content: '兑换成功，去订单查看',
        confirmText: '查看订单',
        cancelText: '留在本页',
      });
      if (result) navigate('/points/orders');
    } catch {
      Toast.show({ content: '兑换失败', icon: 'fail' });
    }
  };

  return (
    <Page>
      <NavBar title="积分商品详情" />
      {/* 商品大图 */}
      <div className="banner" style={{ aspectRatio: '1/1' }}>
        <Img src={goods.image} alt={goods.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* 商品信息卡片 */}
      <div className="card">
        <div style={{ fontSize: 16, fontWeight: 600 }}>{goods.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold-dark)' }}>{goods.points} 积分</span>
          {goods.originalPrice && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
              ¥{fen2yuan(goods.originalPrice)}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          剩余 {goods.stock ?? 0} 件
        </div>
      </div>

      {/* 商品介绍 & 兑换规则 */}
      <div className="card">
        <div className="card-title">商品介绍</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{goods.description || '暂无介绍'}</div>
        <div className="card-title" style={{ marginTop: 12 }}>兑换规则</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{goods.exchangeRule || '暂无规则说明'}</div>
      </div>

      {/* 提货方式 */}
      <div className="card">
        <div className="card-title">提货方式</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {(goods.deliveryMethods || ['到店自提', '快递邮寄']).map((m: string) => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="delivery"
                checked={delivery === m}
                onChange={() => setDelivery(m)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: 14 }}>{m}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 数量选择 */}
      <div className="card">
        <div className="card-title">兑换数量</div>
        <Stepper
          min={1}
          max={maxQty}
          value={quantity}
          onChange={(v) => setQuantity(v as number)}
          style={{ '--button-background-color': 'var(--primary)' }}
        />
      </div>

      {/* 底部固定栏 */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '0.5px solid var(--border)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-dark)' }}>
          合计 <span style={{ fontSize: 24 }}>{totalPoints}</span> 积分
        </span>
        <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 15 }} onClick={handleExchange}>
          立即兑换
        </button>
      </div>
    </Page>
  );
}
