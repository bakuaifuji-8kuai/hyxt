import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, NavBar, Loading, Empty, useFetch, Img } from '../components/common';
import { merchantApi } from '../services/api';

const CATEGORIES = ['全部', '餐饮', '零售', '服饰', '娱乐', '服务'];
const FLOORS = ['全部', 'F1', 'F2', 'F3', 'F4', 'B1'];

export default function MerchantListPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [floor, setFloor] = useState('');
  const [showCatDrop, setShowCatDrop] = useState(false);
  const [showFloorDrop, setShowFloorDrop] = useState(false);

  const catParam = category === '全部' || !category ? undefined : category;
  const floorParam = floor === '全部' || !floor ? undefined : floor;

  const { data, loading, error, reload } = useFetch(
    () => merchantApi.list({ category: catParam, floor: floorParam }),
    [catParam, floorParam],
    true,
  );

  const merchants = (data || []) as any[];

  return (
    <Page>
      <NavBar title="品牌导览" />

      {/* 筛选条 */}
      <div style={{
        position: 'sticky', top: 44, zIndex: 40, background: '#fff',
        display: 'flex', borderBottom: '0.5px solid var(--border)',
      }}>
        {/* 业态 */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div
            className="flex-center"
            style={{ height: 40, cursor: 'pointer', fontSize: 13, gap: 4, color: category && category !== '全部' ? 'var(--primary)' : 'var(--text)' }}
            onClick={() => { setShowCatDrop(!showCatDrop); setShowFloorDrop(false); }}
          >
            {category || '业态'} ▾
          </div>
          {showCatDrop && (
            <div style={{
              position: 'absolute', top: 40, left: 0, right: 0,
              background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '0 0 8px 8px', zIndex: 50,
            }}>
              {CATEGORIES.map((c) => (
                <div
                  key={c}
                  style={{
                    padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                    color: category === c ? 'var(--primary)' : 'var(--text)',
                    fontWeight: category === c ? 600 : 400,
                  }}
                  onClick={() => { setCategory(c); setShowCatDrop(false); }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 楼层 */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div
            className="flex-center"
            style={{ height: 40, cursor: 'pointer', fontSize: 13, gap: 4, color: floor && floor !== '全部' ? 'var(--primary)' : 'var(--text)' }}
            onClick={() => { setShowFloorDrop(!showFloorDrop); setShowCatDrop(false); }}
          >
            {floor || '楼层'} ▾
          </div>
          {showFloorDrop && (
            <div style={{
              position: 'absolute', top: 40, left: 0, right: 0,
              background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '0 0 8px 8px', zIndex: 50,
            }}>
              {FLOORS.map((f) => (
                <div
                  key={f}
                  style={{
                    padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                    color: floor === f ? 'var(--primary)' : 'var(--text)',
                    fontWeight: floor === f ? 600 : 400,
                  }}
                  onClick={() => { setFloor(f); setShowFloorDrop(false); }}
                >
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 商户列表 */}
      {loading ? <Loading /> : (
        merchants.length === 0 ? <Empty text="暂无商户" /> : (
          <div className="card" style={{ margin: '8px 12px', padding: 0 }}>
            {merchants.map((m: any) => (
              <div className="list-item" key={m.id} onClick={() => navigate(`/merchants/${m.id}`)}>
                <div className="icon" style={{ background: 'var(--primary-light)', fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>
                  {m.logo ? (
                    <Img src={m.logo} alt={m.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    (m.name?.[0] || '商')
                  )}
                </div>
                <div className="body">
                  <div className="title">{m.name}</div>
                  <div className="desc">
                    {m.category && <span className="tag" style={{ marginRight: 4 }}>{m.category}</span>}
                    {m.floor && <span>{m.floor}　</span>}
                    {m.desc && <span className="ellipsis">{m.desc}</span>}
                  </div>
                </div>
                <span className="arrow">›</span>
              </div>
            ))}
          </div>
        )
      )}
    </Page>
  );
}
