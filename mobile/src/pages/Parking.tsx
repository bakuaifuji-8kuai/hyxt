import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Dialog, Modal, Stepper, Input } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, fen2yuan } from '../components/common';
import { parkingApi } from '../services/api';

export default function ParkingPage() {
  const navigate = useNavigate();
  const { data: plates, loading: platesLoading, reload: reloadPlates } = useFetch<any[]>(() => parkingApi.plates());
  const [selectedPlate, setSelectedPlate] = useState<string>('');
  const [feeData, setFeeData] = useState<any>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [plateInputVisible, setPlateInputVisible] = useState(false);
  const [plateInput, setPlateInput] = useState('');

  // 停车券相关
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [usePoints, setUsePoints] = useState(0);
  const [usePointsEnabled, setUsePointsEnabled] = useState(false);
  const [payMethod, setPayMethod] = useState<string>('wechat');

  // 换停车券弹窗
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const { data: parkCoupons, loading: parkCouponsLoading } = useFetch<any[]>(() => parkingApi.coupons(), [], couponModalVisible);

  // 选择车牌后查询费用
  useEffect(() => {
    if (!selectedPlate) { setFeeData(null); return; }
    setFeeLoading(true);
    parkingApi.fee(selectedPlate)
      .then(d => { setFeeData(d); setSelectedCoupons([]); setUsePoints(0); setUsePointsEnabled(false); })
      .catch(() => setFeeData(null))
      .finally(() => setFeeLoading(false));
  }, [selectedPlate]);

  // 添加车牌
  const handleBindPlate = async () => {
    setPlateInput('');
    setPlateInputVisible(true);
  };
  const confirmBindPlate = async () => {
    const input = plateInput.trim();
    if (!input) { Toast.show('请输入车牌号'); return; }
    try {
      await parkingApi.bindPlate(input);
      Toast.show({ content: '绑定成功', icon: 'success' });
      setPlateInputVisible(false);
      reloadPlates();
    } catch {
      Toast.show({ content: '绑定失败', icon: 'fail' });
    }
  };

  // 解绑车牌
  const handleUnbind = async (plate: string) => {
    const result = await Dialog.confirm({ content: `确认解绑车牌 ${plate}？` });
    if (!result) return;
    try {
      await parkingApi.unbindPlate(plate);
      Toast.show({ content: '已解绑', icon: 'success' });
      if (selectedPlate === plate) setSelectedPlate('');
      reloadPlates();
    } catch {
      Toast.show({ content: '解绑失败', icon: 'fail' });
    }
  };

  // 换停车券
  const handleExchangeCoupon = async (couponId: any) => {
    try {
      await parkingApi.exchange(couponId);
      Toast.show({ content: '兑换成功', icon: 'success' });
      setCouponModalVisible(false);
    } catch {
      Toast.show({ content: '兑换失败', icon: 'fail' });
    }
  };

  // 计算实付
  const couponDeduct = selectedCoupons.reduce((sum, code) => {
    const c = feeData?.availableCoupons?.find((ac: any) => ac.code === code);
    return sum + (c?.value || 0);
  }, 0);
  const pointsDeduct = usePointsEnabled
    ? Math.min(usePoints, feeData?.maxPointsDeduct || 0) * (feeData?.pointsDeductRate || 0)
    : 0;
  const actualFee = Math.max(0, (feeData?.fee || 0) - couponDeduct - pointsDeduct);

  // 确认支付
  const handlePay = async () => {
    if (!selectedPlate) { Toast.show({ content: '请先选择车牌' }); return; }
    try {
      await parkingApi.pay({
        plate: selectedPlate,
        payMethod,
        couponCodes: selectedCoupons,
        usePoints: usePointsEnabled ? usePoints : 0,
      });
      Toast.show({ content: '支付成功', icon: 'success' });
      setFeeData(null);
    } catch {
      Toast.show({ content: '支付失败', icon: 'fail' });
    }
  };

  return (
    <Page>
      <NavBar title="智慧停车" right={
        <span style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: 'var(--primary)', fontSize: 13, cursor: 'pointer' }} onClick={() => navigate('/parking/records')}>
            停车记录 ›
          </span>
        </span>
      } />

      {/* 车牌选择区 */}
      <div className="card">
        <div className="card-title">
          我的车牌
          <span className="more" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={handleBindPlate}>+ 添加车牌</span>
        </div>
        {platesLoading && <Loading />}
        {!platesLoading && plates?.length === 0 && <Empty text="暂未绑定车牌" />}
        {!platesLoading && (
          <div className="scroll-x" style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
            {plates?.map((p: any) => (
              <span
                key={p.plate}
                className={`tag ${selectedPlate === p.plate ? '' : 'tag-gray'}`}
                style={{
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: '4px 12px',
                  background: selectedPlate === p.plate ? 'var(--primary)' : '#f0f0f0',
                  color: selectedPlate === p.plate ? '#fff' : 'var(--text)',
                  fontWeight: selectedPlate === p.plate ? 600 : 400,
                }}
                onClick={() => setSelectedPlate(p.plate)}
                onContextMenu={(e) => { e.preventDefault(); handleUnbind(p.plate); }}
                onTouchEnd={(e) => { /* 长按解绑兼容 */ }}
              >
                {p.plate}
              </span>
            ))}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>长按车牌可解绑</div>
      </div>

      {/* 积分换停车券入口 */}
      <div className="section">
        <span style={{ color: 'var(--primary)', fontSize: 13, cursor: 'pointer' }} onClick={() => setCouponModalVisible(true)}>
          🎫 积分换停车券 ›
        </span>
      </div>

      {/* 停车费卡片 */}
      {selectedPlate && feeLoading && <Loading text="查询费用中" />}
      {selectedPlate && !feeLoading && feeData && (
        <>
          <div className="card" style={{
            background: 'linear-gradient(135deg, #e63946, #c81d2a)',
            color: '#fff',
            padding: 16,
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{feeData.plate}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>入场时间：{feeData.inTime}</div>
            <div style={{ fontSize: 12 }}>停车时长：{feeData.duration}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>¥{fen2yuan(feeData.fee)}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>应付费用</div>
          </div>

          {/* 优惠抵扣区 */}
          <div className="card">
            <div className="card-title">优惠抵扣</div>
            {/* 停车券抵扣 */}
            {(feeData.availableCoupons || []).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>停车券抵扣</div>
                {feeData.availableCoupons.map((c: any) => (
                  <label key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={selectedCoupons.includes(c.code)}
                      onChange={(e) => {
                        setSelectedCoupons(prev =>
                          e.target.checked ? [...prev, c.code] : prev.filter(code => code !== c.code)
                        );
                      }}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: 13 }}>{c.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                      -¥{fen2yuan(c.value)}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {/* 积分抵扣 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={usePointsEnabled}
                    onChange={(e) => setUsePointsEnabled(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: 13 }}>积分抵扣</span>
                </label>
                {usePointsEnabled && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    (最多{feeData.maxPointsDeduct}积分，{feeData.pointsDeductRate}积分=1分)
                  </span>
                )}
              </div>
              {usePointsEnabled && (
                <div style={{ marginTop: 8 }}>
                  <Stepper
                    min={0}
                    max={feeData.maxPointsDeduct || 0}
                    value={usePoints}
                    onChange={(v) => setUsePoints(v as number)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 实付金额 */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>实付金额</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>¥{fen2yuan(actualFee)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              券抵 ¥{fen2yuan(couponDeduct)} + 积分抵 ¥{fen2yuan(pointsDeduct)}
            </div>
          </div>

          {/* 支付方式 */}
          <div className="card">
            <div className="card-title">支付方式</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="payMethod"
                  checked={payMethod === 'wechat'}
                  onChange={() => setPayMethod('wechat')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: 14 }}>微信支付</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="payMethod"
                  checked={payMethod === 'alipay'}
                  onChange={() => setPayMethod('alipay')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: 14 }}>支付宝</span>
              </label>
            </div>
          </div>

          {/* 确认支付 */}
          <div className="section">
            <button className="btn btn-primary btn-block" onClick={handlePay}>
              确认支付 ¥{fen2yuan(actualFee)}
            </button>
          </div>
        </>
      )}
      {selectedPlate && !feeLoading && !feeData && <Empty text="该车牌当前无停车费用" />}

      {/* 换停车券弹窗 */}
      <Modal
        visible={couponModalVisible}
        content={
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>积分换停车券</div>
            {parkCouponsLoading && <Loading />}
            {!parkCouponsLoading && (!parkCoupons || parkCoupons.length === 0) && <Empty text="暂无可兑换停车券" />}
            {!parkCouponsLoading && parkCoupons?.map((c: any) => (
              <div className="list-item" key={c.id} style={{ cursor: 'default' }}>
                <div className="body">
                  <div className="title">{c.name}</div>
                  <div className="desc">{c.points} 积分 · 剩余 {c.stock}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleExchangeCoupon(c.id)}>兑换</button>
              </div>
            ))}
          </div>
        }
        closeOnMaskClick
        onClose={() => setCouponModalVisible(false)}
      />

      {/* 车牌输入弹窗 */}
      <Modal
        visible={plateInputVisible}
        content={
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>请输入车牌号</div>
            <input
              className="input"
              placeholder="如：京A12345"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setPlateInputVisible(false)}>取消</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmBindPlate}>确定</button>
            </div>
          </div>
        }
        closeOnMaskClick
        onClose={() => setPlateInputVisible(false)}
      />
    </Page>
  );
}
