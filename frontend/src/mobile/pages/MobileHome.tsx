import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Grid } from 'antd-mobile';
import {
  ScanOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { fetchList } from '../../services/store';
import '../mobile.css';

interface SalesStats {
  shop: string;
  date: string;
  orderCount: number;
  salesAmount: number;
  memberAmount: number;
  nonMemberAmount: number;
}

interface VerifyStats {
  shop: string;
  date: string;
  couponCount: number;
  orderCount: number;
  activityCount: number;
  totalPoints: number;
}

export default function MobileHome() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState<SalesStats | null>(null);
  const [verifyData, setVerifyData] = useState<VerifyStats | null>(null);
  const [shopInfo, setShopInfo] = useState<any>(null);

  useEffect(() => {
    // 获取店铺信息
    const shopStr = localStorage.getItem('mobileShopInfo');
    if (shopStr) {
      setShopInfo(JSON.parse(shopStr));
    }

    // 获取今日销售数据
    const salesResult = fetchList('bapp/sales-stats', { pageSize: 1 });
    if (salesResult.list.length > 0) {
      setSalesData(salesResult.list[0]);
    }

    // 获取今日核销数据
    const verifyResult = fetchList('bapp/verify-stats', { pageSize: 1 });
    if (verifyResult.list.length > 0) {
      setVerifyData(verifyResult.list[0]);
    }
  }, []);

  const quickItems = [
    { icon: <ScanOutlined />, label: '扫码核销', path: '/mobile/verify', color: '#1677ff' },
    { icon: <GiftOutlined />, label: '发放优惠券', path: '/mobile/verify', color: '#52c41a' },
    { icon: <ThunderboltOutlined />, label: '查看活动', path: '/mobile/activities', color: '#faad14' },
    { icon: <SettingOutlined />, label: '店铺设置', path: '/mobile/shop', color: '#8e44ad' },
  ];

  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div>
      {/* 头部 */}
      <div className="mobile-header">
        <div className="mobile-header-title">{shopInfo?.name || '我的门店'}</div>
        <div className="mobile-header-subtitle">{today}</div>
      </div>

      {/* 核心数据 */}
      <div className="mobile-card">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 12, color: '#666' }}>今日销售额</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#1677ff', marginTop: 4 }}>
            ¥{(salesData?.salesAmount || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>
            <ArrowUpOutlined /> 同比上涨 12.5%
          </div>
        </div>

        <div className="mobile-stats-grid" style={{ marginTop: 16 }}>
          <div className="mobile-stat-item">
            <div className="mobile-stat-value">{salesData?.orderCount || 0}</div>
            <div className="mobile-stat-label">今日订单</div>
          </div>
          <div className="mobile-stat-item">
            <div className="mobile-stat-value">{verifyData?.couponCount || 0}</div>
            <div className="mobile-stat-label">核销笔数</div>
          </div>
          <div className="mobile-stat-item">
            <div className="mobile-stat-value">{verifyData?.totalPoints || 0}</div>
            <div className="mobile-stat-label">发放积分</div>
          </div>
          <div className="mobile-stat-item">
            <div className="mobile-stat-value">--</div>
            <div className="mobile-stat-label">发放优惠券</div>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="mobile-card">
        <div className="mobile-card-title">快捷入口</div>
        <div className="mobile-quick-grid">
          {quickItems.map((item, idx) => (
            <div
              key={idx}
              className="mobile-quick-item"
              onClick={() => navigate(item.path)}
            >
              <div className="mobile-quick-icon" style={{ background: item.color }}>
                {item.icon}
              </div>
              <div className="mobile-quick-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 近期活动 */}
      <div className="mobile-card">
        <div className="mobile-card-title">近期活动</div>
        <div
          style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}
          onClick={() => navigate('/mobile/activities')}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: '#333' }}>暑期大促活动</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>2024.07.15 - 2024.08.31</div>
          </div>
          <span className="mobile-tag mobile-tag-warning">进行中</span>
        </div>
      </div>
    </div>
  );
}