import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog } from 'antd-mobile';
import {
  ShopOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  LogoutOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { fetchList } from '../../services/store';
import '../mobile.css';

interface ShopInfo {
  id: number;
  name: string;
  category: string;
  contractExpiry: string;
  phone: string;
  status: string;
}

export default function MobileShop() {
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 从 localStorage 获取店铺信息
    const shopStr = localStorage.getItem('mobileShopInfo');
    if (shopStr) {
      setShopInfo(JSON.parse(shopStr));
    } else {
      // 默认取第一条
      const result = fetchList('bapp/shop-info', { pageSize: 1 });
      if (result.list.length > 0) {
        setShopInfo(result.list[0]);
        localStorage.setItem('mobileShopInfo', JSON.stringify(result.list[0]));
      }
    }
  };

  const handleLogout = () => {
    Dialog.confirm({
      content: '确定要退出登录吗？',
      confirmText: '退出',
      onConfirm: () => {
        localStorage.removeItem('mobileToken');
        localStorage.removeItem('mobileShopInfo');
        navigate('/mobile/login', { replace: true });
      },
    });
  };

  const menuItems = [
    { icon: <ShopOutlined />, label: '店铺信息', value: shopInfo?.name || '-', onClick: () => {} },
    { icon: <PhoneOutlined />, label: '联系电话', value: shopInfo?.phone || '-', onClick: () => {} },
    { icon: <ClockCircleOutlined />, label: '营业时间', value: '10:00-22:00', onClick: () => {} },
    { icon: <CalendarOutlined />, label: '合同到期', value: shopInfo?.contractExpiry || '-', onClick: () => {} },
  ];

  return (
    <div>
      {/* 店铺头部 */}
      <div className="mobile-shop-header">
        <div className="mobile-shop-avatar">
          <ShopOutlined />
        </div>
        <div className="mobile-shop-name">{shopInfo?.name || '我的门店'}</div>
        <div className="mobile-shop-category">{shopInfo?.category || '餐饮'}</div>
      </div>

      {/* 基本信息 */}
      <div className="mobile-card">
        <div className="mobile-card-title">基本信息</div>
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className="mobile-list-item"
            style={{ padding: '12px 0' }}
            onClick={item.onClick}
          >
            <div style={{ color: '#1677ff', marginRight: 12 }}>{item.icon}</div>
            <div style={{ flex: 1, fontSize: 14 }}>{item.label}</div>
            <div style={{ color: '#666', fontSize: 14 }}>{item.value}</div>
            <RightOutlined style={{ color: '#ccc', marginLeft: 8 }} />
          </div>
        ))}
      </div>

      {/* 账号信息 */}
      <div className="mobile-card">
        <div className="mobile-card-title">账号信息</div>
        <div className="mobile-list-item" style={{ padding: '12px 0' }}>
          <div style={{ flex: 1, fontSize: 14 }}>登录账号</div>
          <div style={{ color: '#666', fontSize: 14 }}>
            {localStorage.getItem('mobilePhone') || '13800138000'}
          </div>
        </div>
      </div>

      {/* 退出登录 */}
      <div style={{ padding: '24px 16px' }}>
        <Button
          block
          style={{
            height: 48,
            borderRadius: 24,
            background: '#f5f5f5',
            color: '#666',
            border: 'none',
          }}
          onClick={handleLogout}
        >
          <LogoutOutlined style={{ marginRight: 8 }} /> 退出登录
        </Button>
      </div>
    </div>
  );
}