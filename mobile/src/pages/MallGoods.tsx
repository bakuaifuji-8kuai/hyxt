import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img, fen2yuan } from '../components/common';
import { mallApi } from '../services/api';

type SortKey = 'comprehensive' | 'sales' | 'price_asc' | 'price_desc';

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: 'comprehensive', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price_asc', label: '价格↑' },
  { key: 'price_desc', label: '价格↓' },
];

export default function MallGoodsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const keyword = searchParams.get('keyword') || '';
  const [sort, setSort] = useState<SortKey>('comprehensive');

  const { data: homeData } = useFetch<any>(() => mallApi.home() as Promise<any>, []);
  const categories: any[] = homeData?.categories || [];

  const { data: goodsList, loading, error } = useFetch<any[]>(
    () => mallApi.goods({ category: category || undefined, keyword: keyword || undefined, sort }) as Promise<any[]>,
    [category, keyword, sort],
  );

  const selectCategory = (catId: string) => {
    const next = new URLSearchParams(searchParams);
    if (catId) next.set('category', catId);
    else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  const selectSort = (k: SortKey) => {
    setSort(k);
  };

  const goods = (Array.isArray(goodsList) ? goodsList : (goodsList as any)?.list) || [];

  return (
    <Page>
      <NavBar title="全部商品" />

      {/* 顶部搜索框 */}
      <div
        style={{ background: '#fff', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}
        onClick={() => navigate('/search?from=mall-goods')}
      >
        <div
          style={{
            flex: 1,
            background: '#f5f5f5',
            borderRadius: 20,
            padding: '6px 12px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <span>🔍</span>
          <span>{keyword || '搜索商品'}</span>
        </div>
      </div>

      {/* 筛选条 */}
      <div className="tabs" style={{ top: 44 }}>
        {SORT_TABS.map((t) => (
          <span
            key={t.key}
            className={`tab-item ${sort === t.key ? 'active' : ''}`}
            onClick={() => selectSort(t.key)}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* 主体：左侧分类 + 右侧商品 */}
      <div style={{ display: 'flex', minHeight: 360 }}>
        {/* 左侧分类侧边栏 */}
        <div
          style={{
            width: 80,
            background: '#f5f5f5',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <div
            onClick={() => selectCategory('')}
            style={{
              padding: '14px 6px',
              textAlign: 'center',
              fontSize: 12,
              cursor: 'pointer',
              background: !category ? '#fff' : 'transparent',
              color: !category ? 'var(--primary)' : 'var(--text)',
              fontWeight: !category ? 600 : 400,
              borderLeft: !category ? '3px solid var(--primary)' : '3px solid transparent',
            }}
          >
            全部
          </div>
          {categories.map((cat: any) => {
            const catId = String(cat.id ?? cat.name);
            const active = category === catId;
            return (
              <div
                key={catId}
                onClick={() => selectCategory(catId)}
                style={{
                  padding: '14px 6px',
                  textAlign: 'center',
                  fontSize: 12,
                  cursor: 'pointer',
                  background: active ? '#fff' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text)',
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{cat.icon || '🛍️'}</span>
                <span className="ellipsis" style={{ width: '100%' }}>{cat.name}</span>
              </div>
            );
          })}
        </div>

        {/* 右侧商品网格 */}
        <div style={{ flex: 1, padding: '8px 8px 12px', minWidth: 0 }}>
          {loading ? (
            <Loading />
          ) : error ? (
            <Empty text="加载失败" />
          ) : goods.length === 0 ? (
            <Empty text="暂无商品" />
          ) : (
            <div className="goods-grid" style={{ padding: 0, gap: 8 }}>
              {goods.map((g: any, i: number) => (
                <div
                  key={g.id ?? i}
                  className="goods-card"
                  onClick={() => navigate(`/mall/goods/${g.id}`)}
                >
                  <Img src={g.image} alt={g.name} />
                  <div className="info">
                    <div className="name ellipsis-2">{g.name}</div>
                    <div className="price">
                      <small>¥</small>{fen2yuan(g.price)}
                      {g.originalPrice ? (
                        <span className="origin">¥{fen2yuan(g.originalPrice)}</span>
                      ) : null}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                      已售 {g.sales ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
