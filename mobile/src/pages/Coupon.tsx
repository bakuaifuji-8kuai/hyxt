import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, fen2yuan } from '../components/common';
import { couponApi } from '../services/api';

export default function CouponPage() {
  const navigate = useNavigate();
  const { data: coupons, loading, error, reload } = useFetch<any[]>(() => couponApi.available());

  const handleClaim = async (id: number) => {
    try {
      await couponApi.claim(id);
      Toast.show({ content: '领取成功', icon: 'success' });
      reload();
    } catch {
      Toast.show({ content: '领取失败', icon: 'fail' });
    }
  };

  return (
    <Page>
      <NavBar title="领券中心" right={
        <span style={{ color: 'var(--primary)', fontSize: 13, cursor: 'pointer' }} onClick={() => navigate('/coupon/mine')}>
          我的券包 ›
        </span>
      } />
      {/* 顶部 banner */}
      <div style={{
        margin: '0 12px 12px',
        borderRadius: 12,
        padding: 16,
        background: 'linear-gradient(135deg, #e63946, #c81d2a)',
        color: '#fff',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>本月可领 {coupons?.length ?? 0} 张优惠券</div>
        <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>快来领取，优惠享不停</div>
      </div>

      {loading && <Loading />}
      {error && <Empty text="加载失败" />}
      {!loading && !error && (!coupons || coupons.length === 0) && <Empty text="暂无可领优惠券" />}
      {!loading && !error && coupons?.map((c: any) => {
        const claimedByMe = c.claimedByMe;
        const soldOut = c.claimed >= c.quantity;
        const disabled = claimedByMe || soldOut;
        const label = claimedByMe ? '已领取' : soldOut ? '已抢光' : '立即领取';
        const thresholdText = c.type === 'cash' ? '无门槛' : `满${fen2yuan(c.minSpend)}可用`;
        return (
          <div className="coupon-card" key={c.id}>
            <div className="left">
              <div className="amount"><small>¥</small>{fen2yuan(c.value)}</div>
              <div className="threshold">{thresholdText}</div>
            </div>
            <div className="right">
              <div className="name">{c.name}</div>
              <div className="scope">{c.scope || '全场通用'}</div>
              <div className="validity">有效期至 {c.endDate}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  className={`btn ${disabled ? '' : 'btn-primary'} btn-sm`}
                  disabled={disabled}
                  onClick={() => !disabled && handleClaim(c.id)}
                >
                  {label}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </Page>
  );
}
