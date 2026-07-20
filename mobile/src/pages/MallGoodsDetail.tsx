import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, Stepper, Modal } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { mallApi } from '../services/api';

const MOCK_REVIEWS = [
  { id: 1, user: '小**红', avatar: '🌸', rating: 5, content: '包装精美，质量很好，物流也很快，推荐购买！', date: '2026-07-15' },
  { id: 2, user: '大**军', avatar: '🛒', rating: 5, content: '性价比超高，已经回购第二次了，会继续支持。', date: '2026-07-10' },
  { id: 3, user: 'a**z', avatar: '✨', rating: 4, content: '整体不错，就是发货稍微慢了一点。', date: '2026-07-02' },
];

export default function MallGoodsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goods, loading, error } = useFetch<any>(() => mallApi.goodsDetail(id!));

  const [imgIdx, setImgIdx] = useState(0);
  const [specModalVisible, setSpecModalVisible] = useState(false);
  const [mode, setMode] = useState<'cart' | 'buy'>('cart');
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  if (loading) return <Page><NavBar title="商品详情" /><Loading /></Page>;
  if (error || !goods) return <Page><NavBar title="商品详情" /><Empty text="商品不存在" /></Page>;

  const images: string[] = goods.images && goods.images.length ? goods.images : [goods.image];
  const specs: any[] = goods.specs || [];
  const hasSpecs = specs.length > 0;

  const tags: string[] = [];
  if (goods.包邮 !== false) tags.push('包邮');
  if (goods.活动) tags.push(goods.活动);
  tags.push('7天无理由');
  tags.push('假一赔十');

  const selectSpec = (specName: string, value: string) => {
    setSelectedSpecs((prev) => ({ ...prev, [specName]: value }));
  };

  const specText = () => {
    if (!hasSpecs) return '';
    return specs
      .map((s) => selectedSpecs[s.name] || s.values?.[0] || '')
      .filter(Boolean)
      .join(' / ');
  };

  const openSpecModal = (m: 'cart' | 'buy') => {
    setMode(m);
    if (hasSpecs) {
      // 默认选中第一个
      const init: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.values && s.values.length) init[s.name] = s.values[0];
      });
      setSelectedSpecs(init);
    }
    setQuantity(1);
    setSpecModalVisible(true);
  };

  const handleConfirm = async () => {
    const spec = specText();
    if (mode === 'cart') {
      try {
        await mallApi.addCart({ goodsId: goods.id, quantity, spec: spec || undefined });
        Toast.show({ icon: 'success', content: '已加入购物车' });
        setSpecModalVisible(false);
      } catch {
        Toast.show({ icon: 'fail', content: '加入失败' });
      }
    } else {
      setSpecModalVisible(false);
      const params = new URLSearchParams({
        goodsId: String(goods.id),
        quantity: String(quantity),
      });
      if (spec) params.set('spec', spec);
      navigate(`/mall/checkout?${params.toString()}`);
    }
  };

  const maxQty = goods.stock || 99;

  return (
    <Page>
      <NavBar title="商品详情" />

      {/* 主图轮播 */}
      <div
        className="banner"
        style={{ aspectRatio: '1/1', margin: 0, borderRadius: 0 }}
      >
        <Img
          src={images[imgIdx]}
          alt={goods.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {images.length > 1 && (
          <div className="banner-dots">
            {images.map((_, i) => (
              <span key={i} className={i === imgIdx ? 'active' : ''} onClick={() => setImgIdx(i)} />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="scroll-x" style={{ display: 'flex', gap: 6, padding: '8px 12px', background: '#fff' }}>
          {images.map((src, i) => (
            <Img
              key={i}
              src={src}
              alt={`图${i + 1}`}
              style={{
                width: 56,
                height: 56,
                borderRadius: 6,
                objectFit: 'cover',
                flexShrink: 0,
                border: i === imgIdx ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
              }}
              onClick={() => setImgIdx(i)}
            />
          ))}
        </div>
      )}

      {/* 商品信息卡片 */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary)' }}>
            <small style={{ fontSize: 14 }}>¥</small>{fen2yuan(goods.price)}
          </span>
          {goods.originalPrice ? (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
              ¥{fen2yuan(goods.originalPrice)}
            </span>
          ) : null}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>{goods.name}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {tags.map((t, i) => (
            <span key={i} className={`tag ${i === 0 ? '' : 'tag-gold'}`}>{t}</span>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingTop: 10,
            borderTop: '0.5px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <span>已售 {goods.sales ?? 0}</span>
          <span>库存 {goods.stock ?? 0}</span>
          <span>分类：{goods.category || '通用'}</span>
        </div>
      </div>

      {/* 规格选择卡片 */}
      {hasSpecs && (
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => openSpecModal('cart')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>已选</span>
              <span className="ellipsis" style={{ fontSize: 13 }}>{specText() || '请选择规格'}</span>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>›</span>
          </div>
        </div>
      )}

      {/* 商品介绍 */}
      <div className="card">
        <div className="card-title">商品介绍</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {goods.description || '暂无介绍'}
        </div>
      </div>

      {/* 商品评价 */}
      <div className="card">
        <div className="card-title">
          商品评价
          <span className="more">{MOCK_REVIEWS.length}条</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_REVIEWS.map((r) => (
            <div key={r.id} style={{ paddingBottom: 10, borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{r.avatar}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{r.user}</span>
                <span style={{ color: '#f5b25b', fontSize: 12 }}>{'★'.repeat(r.rating)}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 11 }}>{r.date}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{r.content}</div>
            </div>
          ))}
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
          padding: '8px 12px',
          gap: 8,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          zIndex: 100,
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 50, cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)' }}
          onClick={() => navigate('/service')}
        >
          <span style={{ fontSize: 20 }}>💬</span>
          客服
        </div>
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 50, cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)' }}
          onClick={() => navigate('/mall/cart')}
        >
          <span style={{ fontSize: 20 }}>🛒</span>
          购物车
        </div>
        <button
          className="btn btn-outline"
          style={{ flex: 1, padding: '10px 0', fontSize: 14 }}
          onClick={() => openSpecModal('cart')}
        >
          加入购物车
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1, padding: '10px 0', fontSize: 14 }}
          onClick={() => openSpecModal('buy')}
        >
          立即购买
        </button>
      </div>

      {/* 规格选择 Modal */}
      <Modal
        visible={specModalVisible}
        onClose={() => setSpecModalVisible(false)}
        closeOnAction
        title={mode === 'cart' ? '加入购物车' : '立即购买'}
        content={
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {/* 商品概览 */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '0.5px solid var(--border)' }}>
              <Img src={goods.image} alt={goods.name} style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ellipsis-2" style={{ fontSize: 13 }}>{goods.name}</div>
                <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 6 }}>
                  ¥{fen2yuan(goods.price)}
                </div>
              </div>
            </div>

            {/* 规格选择 */}
            {specs.map((s) => (
              <div key={s.name} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{s.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(s.values || []).map((v: string) => {
                    const active = (selectedSpecs[s.name] || s.values[0]) === v;
                    return (
                      <span
                        key={v}
                        onClick={() => selectSpec(s.name, v)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 999,
                          fontSize: 12,
                          cursor: 'pointer',
                          background: active ? 'var(--primary-light)' : '#f5f5f5',
                          color: active ? 'var(--primary)' : 'var(--text)',
                          border: active ? '1px solid var(--primary)' : '1px solid transparent',
                        }}
                      >
                        {v}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 数量选择 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>数量</span>
              <Stepper
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(v) => setQuantity(v as number)}
                style={{ '--button-background-color': 'var(--primary)' }}
              />
            </div>
          </div>
        }
        actions={[
          { key: 'cancel', text: '取消', onClick: () => setSpecModalVisible(false) },
          { key: 'ok', text: mode === 'cart' ? '加入购物车' : '立即购买', onClick: handleConfirm },
        ]}
      />
    </Page>
  );
}
