import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { Page, NavBar, Loading, Empty, Img, useFetch } from '../components/common';
import { merchantApi } from '../services/api';

export default function MerchantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => merchantApi.detail(id!), [id], !!id);
  const [fav, setFav] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  if (loading) return <Page><NavBar title="商户详情" /><Loading /></Page>;
  if (error || !data) return <Page><NavBar title="商户详情" /><Empty text="加载失败" /></Page>;

  const m = data as any;
  const location = m.location || {};
  const foodConfig = m.foodConfig || {};
  const activities = m.activities || [];

  return (
    <Page>
      <NavBar title="商户详情" />

      {/* 商户大图 + 基本信息 */}
      <div className="banner" style={{ aspectRatio: '375/200' }}>
        <Img src={m.image || m.cover || m.logo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* 顶部右侧按钮 */}
        <div style={{
          position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, zIndex: 10,
        }}>
          {m.phone && (
            <a
              href={`tel:${m.phone}`}
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--primary)' }}
            >
              📞 拨号
            </a>
          )}
          <button
            className="btn btn-sm"
            style={{ background: fav ? 'var(--primary)' : 'rgba(255,255,255,0.9)', color: fav ? '#fff' : 'var(--text)' }}
            onClick={() => { setFav(!fav); Toast.show({ icon: 'success', content: fav ? '取消收藏' : '已收藏' }); }}
          >
            {fav ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
        </div>
      </div>

      {/* 商户名 + 标签 */}
      <div style={{ padding: '12px 12px 0' }}>
        <div className="text-xl text-bold">{m.name}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {m.category && <span className="tag">{m.category}</span>}
          {location.floor && <span className="tag tag-gray">{location.floor}</span>}
          {m.status && <span className={`tag ${m.status === '营业中' ? 'tag-green' : 'tag-gray'}`}>{m.status}</span>}
        </div>
      </div>

      {/* 商户介绍 */}
      {m.desc && (
        <div className="card">
          <div className="card-title">商户介绍</div>
          <div className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{m.desc}</div>
        </div>
      )}

      {/* 楼层位置 */}
      {(location.floor || location.positionNo) && (
        <div className="card">
          <div className="card-title">
            楼层位置
            <span className="more" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setMapVisible(true)}>
              查看楼层地图 ›
            </span>
          </div>
          <div className="text-md">
            {location.floor && <span>{location.floor}　</span>}
            {location.positionNo && <span>铺位 {location.positionNo}</span>}
          </div>
        </div>
      )}

      {/* 在售活动 */}
      {activities.length > 0 && (
        <div className="card">
          <div className="card-title">在售活动</div>
          {activities.map((a: any, i: number) => (
            <div className="list-item" key={i} style={{ padding: '10px 0' }}>
              <div className="icon">🎉</div>
              <div className="body">
                <div className="title">{a.name || a.title}</div>
                <div className="desc">{a.type || '活动'}　{a.status || ''}</div>
              </div>
              <span className="arrow">›</span>
            </div>
          ))}
        </div>
      )}

      {/* 餐饮配置 */}
      {foodConfig.cuisineType && (
        <div className="card">
          <div className="card-title">餐饮信息</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div>
              <div className="text-sm text-muted">菜系</div>
              <div className="text-md text-bold">{foodConfig.cuisineType}</div>
            </div>
            {foodConfig.avgCost && (
              <div>
                <div className="text-sm text-muted">人均</div>
                <div className="text-md text-bold text-primary">¥{foodConfig.avgCost}</div>
              </div>
            )}
          </div>

          {/* 推荐菜品 */}
          {foodConfig.recommendDishes && foodConfig.recommendDishes.length > 0 && (
            <>
              <div className="text-sm text-muted mb-8">推荐菜品</div>
              <div className="scroll-x" style={{ display: 'flex', gap: 8 }}>
                {foodConfig.recommendDishes.map((dish: any, i: number) => (
                  <div key={i} style={{
                    minWidth: 80, textAlign: 'center', background: '#f5f5f5', borderRadius: 8, padding: 8,
                  }}>
                    <div className="text-sm text-bold">{typeof dish === 'string' ? dish : dish.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 当前优惠 */}
          {foodConfig.promo && (
            <div className="mt-8">
              <span className="tag tag-green">当前优惠：{foodConfig.promo}</span>
            </div>
          )}
        </div>
      )}

      {/* 底部按钮 */}
      <div style={{ padding: '16px 12px' }}>
        <button className="btn btn-primary btn-block" onClick={() => navigate(`/coupon?merchant=${id}`)}>
          领取商户券
        </button>
      </div>

      {/* 楼层地图弹窗 */}
      {mapVisible && (
        <Dialog
          visible={mapVisible}
          title={`${location.floor || '楼层'}地图`}
          content={
            <div style={{ textAlign: 'center', padding: 20, color: '#8c8c8c' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
              <div>楼层导航地图（占位示意）</div>
              {location.navMap && <Img src={location.navMap} alt="楼层地图" style={{ width: '100%', marginTop: 12 }} />}
            </div>
          }
          closeOnAction
          onClose={() => setMapVisible(false)}
          actions={[{ key: 'ok', text: '关闭' }]}
        />
      )}
    </Page>
  );
}
