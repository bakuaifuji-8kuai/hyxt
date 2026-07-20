import React, { useState } from 'react';
import { Page, NavBar, Empty, Loading, useFetch, fen2yuan } from '../components/common';
import { parkingApi } from '../services/api';

export default function ParkingRecordsPage() {
  const { data: records, loading, error } = useFetch<any[]>(() => parkingApi.records());
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const displayMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const monthStr = `${displayMonth.getFullYear()}年${displayMonth.getMonth() + 1}月`;
  const yearMonth = `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, '0')}`;

  // 简单按月份筛选（前端过滤）
  const filtered = records?.filter((r: any) => {
    const d = r.inTime || r.outTime;
    if (!d) return true;
    return d.startsWith(yearMonth);
  }) || [];

  return (
    <Page>
      <NavBar title="停车记录" />
      {/* 月份切换 */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setMonthOffset(prev => prev + 1)}>‹</span>
        <span style={{ fontWeight: 600 }}>{monthStr}</span>
        <span
          style={{ cursor: monthOffset > 0 ? 'pointer' : 'default', fontSize: 18, opacity: monthOffset > 0 ? 1 : 0.3 }}
          onClick={() => monthOffset > 0 && setMonthOffset(prev => prev - 1)}
        >{'›'}</span>
      </div>

      {loading && <Loading />}
      {error && <Empty text="加载失败" />}
      {!loading && !error && filtered.length === 0 && <Empty text="当月无停车记录" />}
      {!loading && !error && filtered.map((r: any) => (
        <div className="card" key={r.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{r.plate}</span>
            <span className="tag-gray tag">{r.payMethod === 'wechat' ? '微信' : r.payMethod === 'alipay' ? '支付宝' : r.payMethod}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div>入场：{r.inTime}</div>
            <div>出场：{r.outTime || '—'}</div>
            <div>时长：{r.duration}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
            <span>应付：<b style={{ color: 'var(--primary)' }}>¥{fen2yuan(r.fee)}</b></span>
            <span>实付：<b style={{ color: 'var(--primary)' }}>¥{fen2yuan(r.actualFee || r.fee)}</b></span>
          </div>
          {/* 抵扣明细 */}
          {(r.couponsUsed?.length > 0 || r.points > 0) && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {r.couponsUsed?.length > 0 && `券抵：${r.couponsUsed.map((c: any) => c.name || c).join('、')}`}
              {r.points > 0 && ` | 积分抵：${r.points}积分`}
            </div>
          )}
        </div>
      ))}
    </Page>
  );
}
