import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  HomeOutlined,
  ScanOutlined,
  ThunderboltOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './mobile.css';

interface MobileLayoutProps {
  children: ReactNode;
}

const tabs = [
  { key: '/mobile/home', title: '首页', icon: <HomeOutlined /> },
  { key: '/mobile/verify', title: '核销', icon: <ScanOutlined /> },
  { key: '/mobile/activities', title: '活动', icon: <ThunderboltOutlined /> },
  { key: '/mobile/notices', title: '消息', icon: <BellOutlined /> },
  { key: '/mobile/shop', title: '我的', icon: <UserOutlined /> },
];

export default function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = '/' + location.pathname.split('/').slice(0, 3).join('/');

  return (
    <div className="mobile-container">
      <div className="mobile-content">{children}</div>
      <div className="mobile-tabbar">
        <TabBar activeKey={activeKey} onChange={(key) => navigate(key)}>
          {tabs.map((tab) => (
            <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
}