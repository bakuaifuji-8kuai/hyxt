import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, NavBar, Loading, Empty, useFetch, Img } from '../components/common';
import { merchantApi } from '../services/api';

const CUISINES = ['全部', '中餐', '日料', '韩餐', '西餐', '火锅', '烧烤', '快餐'];
const PRICE_RANGES = [
  { label: '全部', min: 0, max: Infinity },
  { label: '50以下', min: 0, max: 50 },
  { label: '50-100', min: 50, max: 100 },
  { label: '100-200', min: 100, max: 200 },
  { label: '200以上', min: 200, max: Infinity },
];
const RATING_OPTIONS = ['全部', '4.5+', '4.0+'];

function starStr(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  return '⭐'.repeat(full) + (half ? '✨' : '');
}

export default function FoodPage() {
  const navigate = useNavigate();
  const [cuisine, setCuisine] = useState('全部');
  const [priceIdx, setPriceIdx] = useState(0);
  const [ratingIdx, setRatingIdx] = useState(0);

  const { data, loading, error } = useFetch<any[]>(merchantApi.food, [], true);

  const filtered = useMemo(() => {
    if (!data) return [];
    const priceRange = PRICE_RANGES[priceIdx];
    const ratingMin = ratingIdx === 0 ? 0 : parseFloat(RATING_OPTIONS[ratingIdx]);
    return (data as any[]).filter((m: any) => {
      const fc = m.foodConfig || {};
      // 菜系筛选
      if (cuisine !== '全部' && fc.cuisineType !== cuisine) return false;
      // 人均筛选
      const avg = fc.avgCost || 0;
      if (avg < priceRange.min || avg >= priceRange.max) return false;
      // 评分筛选（mock 评分或用 rating 字段）
      const r = (m as any).rating || 4.2;
      if (r < ratingMin) return false;
      return true;
    });
  }, [data, cuisine, priceIdx, ratingIdx]);

  return (
    <Page>
      <NavBar title="餐饮美食" />

      {/* 筛选条 */}
      <div style={{
        position: 'sticky', top: 44, zIndex: 40, background: '#fff',
        borderBottom: '0.5px solid var(--border)', padding: '8px 12px',
      }}>
        {/* 菜系 */}
        <div className="scroll-x" style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          {CUISINES.map((c) => (
            <span
              key={c}
              className={`tag ${cuisine === c ? '' : 'tag-gray'}`}
              style={{ cursor: 'pointer', padding: '4px 10px', whiteSpace: 'nowrap' }}
              onClick={() => setCuisine(c)}
            >
              {c}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* 人均 */}
          {PRICE_RANGES.map((p, i) => (
            <span
              key={p.label}
              className={`tag ${priceIdx === i ? '' : 'tag-gray'}`}
              style={{ cursor: 'pointer', padding: '4px 10px', whiteSpace: 'nowrap', fontSize: 11 }}
              onClick={() => setPriceIdx(i)}
            >
              {p.label}
            </span>
          ))}
          {/* 评分 */}
          {RATING_OPTIONS.map((r, i) => (
            <span
              key={r}
              className={`tag ${ratingIdx === i ? '' : 'tag-gray'}`}
              style={{ cursor: 'pointer', padding: '4px 10px', whiteSpace: 'nowrap', fontSize: 11 }}
              onClick={() => setRatingIdx(i)}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* 餐厅列表 */}
      {loading ? <Loading /> : (
        filtered.length === 0 ? <Empty text="暂无餐厅" /> : (
          <div style={{ padding: '8px 12px' }}>
            {filtered.map((m: any) => {
              const fc = m.foodConfig || {};
              const rating = (m as any).rating || 4.2;
              const dishes = fc.recommendDishes || [];
              return (
                <div
                  className="card"
                  key={m.id}
                  style={{ margin: '0 0 12px', cursor: 'pointer' }}
                  onClick={() => navigate(`/merchants/${m.id}`)}
                >
                  <div style={{ display: 'flex', gap: 10 }}>
                    {/* 餐厅图 */}
                    <Img
                      src={m.image || m.cover || m.logo}
                      alt={m.name}
                      style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-lg text-bold ellipsis">{m.name}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        {fc.cuisineType && <span className="tag tag-gray">{fc.cuisineType}</span>}
                        {fc.avgCost && <span className="text-sm text-muted">人均¥{fc.avgCost}</span>}
                      </div>
                      <div className="text-sm text-muted" style={{ marginTop: 4 }}>
                        {starStr(rating)} {rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  {/* 推荐菜品横滚 */}
                  {dishes.length > 0 && (
                    <div className="scroll-x" style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {dishes.map((d: any, i: number) => (
                        <span key={i} className="tag tag-gray" style={{ whiteSpace: 'nowrap', padding: '4px 8px' }}>
                          {typeof d === 'string' ? d : d.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {fc.promo && (
                    <div style={{ marginTop: 6 }}>
                      <span className="tag tag-green">{fc.promo}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </Page>
  );
}
