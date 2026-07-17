import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Space, theme } from 'antd';
import {
  DashboardOutlined, IdcardOutlined, CrownOutlined, GiftOutlined,
  CarOutlined, ThunderboltOutlined, CustomerServiceOutlined, MessageOutlined,
  TeamOutlined, WalletOutlined, ShopOutlined, SettingOutlined,
  UserOutlined, LogoutOutlined, ApartmentOutlined as Flow,
  SafetyCertificateOutlined, FileTextOutlined, AccountBookOutlined,
  PictureOutlined, GlobalOutlined, HomeOutlined, ReloadOutlined,
  BarChartOutlined, SearchOutlined, MobileOutlined
} from '@ant-design/icons';
import { getMenuTree } from './services/modules';
import { isAuthenticated, handleLogout } from './services/request';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GenericCRUD from './pages/GenericCRUD';
import BusinessFlow from './pages/BusinessFlow';
import MemberProfile from './pages/MemberProfile';
import ShopGoods from './pages/ShopGoods';
import ShopHomeConfig from './pages/ShopHomeConfig';
import OrderManage from './pages/OrderManage';
import AnalyticsCenter from './pages/AnalyticsCenter';
import ParkingManage from './pages/ParkingManage';
import CouponManage from './pages/CouponManage';
import PointsMall from './pages/PointsMall';
import MarketingCenter from './pages/MarketingCenter';

const { Header, Sider, Content } = Layout;

const CATEGORY_ICONS: Record<string, any> = {
  '会员数字化': IdcardOutlined,
  '积分中心': CrownOutlined,
  '礼券中心': GiftOutlined,
  '智慧停车': CarOutlined,
  '营销中心': ThunderboltOutlined,
  '服务中心': CustomerServiceOutlined,
  '营销触达': MessageOutlined,
  '私域运营': TeamOutlined,
  '企微社群': TeamOutlined,
  '电子钱包': WalletOutlined,
  '商户营销': ShopOutlined,
  '在线商城': ShopOutlined,
  '配置中心': SettingOutlined,
  '系统管理': UserOutlined,
  '核销中心': SafetyCertificateOutlined,
  '开票管理': FileTextOutlined,
  '财务凭证': AccountBookOutlined,
  '内容管理': PictureOutlined,
  '公域运营': GlobalOutlined,
  '地产积分': HomeOutlined,
  '物品租借': ReloadOutlined,
  '数据中心': BarChartOutlined,
  '自助积分': CrownOutlined,
  '在线客服': MessageOutlined,
  'AI小票': CrownOutlined,
  '广告推广': PictureOutlined,
  '客服管理': CustomerServiceOutlined,
  '搜索管理': SearchOutlined,
  '小程序营销平台': PictureOutlined,
  '系统安全': SafetyCertificateOutlined,
  'C端小程序': MobileOutlined,
  '商家小程序': ShopOutlined,
};

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: themeToken } = theme.useToken();

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [location.pathname]);

  if (!authed && !location.pathname.startsWith('/login')) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname.startsWith('/login')) {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  const menuTree = getMenuTree();
  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">数据总览</Link> },
    ...menuTree.map((g) => {
      const Icon = CATEGORY_ICONS[g.category] || DashboardOutlined;
      return {
        key: `group-${g.category}`,
        icon: <Icon />,
        label: g.category,
        children: g.items.map((m) => ({
          key: `/m/${m.key}`,
          label: <Link to={`/m/${m.key}`}>{m.name}</Link>
        }))
      };
    }),
    { key: '/business-flow', icon: <Flow />, label: <Link to="/business-flow">业务流程</Link> }
  ];

  const selectedKeys = [location.pathname];
  const openKeys: string[] = [];
  for (const g of menuTree) {
    if (g.items.some((m) => location.pathname === `/m/${m.key}`)) {
      openKeys.push(`group-${g.category}`);
    }
  }

  const userInfo = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || '{}'); } catch { return {}; } })();

  const handleLogoutClick = () => {
    handleLogout();
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={240} theme="light">
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 16, fontWeight: 'bold', color: themeToken.colorPrimary }}>力唯会员营销平台</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          style={{ borderRight: 0, maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            <span style={{ fontWeight: 600 }}>力唯智慧商业会员营销平台</span>
          </Space>
          <Dropdown menu={{ items: [
            { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogoutClick }
          ] }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{userInfo.name || 'admin'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/business-flow" element={<BusinessFlow />} />
            <Route path="/m/member-profiles" element={<MemberProfile />} />
            <Route path="/m/shop-goods" element={<ShopGoods />} />
            <Route path="/m/shop-orders" element={<OrderManage />} />
            <Route path="/m/shop-home-config" element={<ShopHomeConfig />} />
            <Route path="/m/coupon-templates" element={<CouponManage />} />
            <Route path="/m/points-goods" element={<PointsMall />} />
            <Route path="/m/analytics-overview" element={<AnalyticsCenter />} />
            <Route path="/m/analytics-reports" element={<AnalyticsCenter />} />
            <Route path="/m/parking-records" element={<ParkingManage />} />
            <Route path="/m/parking-lots" element={<ParkingManage />} />
            <Route path="/m/parking-rules" element={<ParkingManage />} />
            <Route path="/m/parking-benefit" element={<ParkingManage />} />
            <Route path="/m/parking-plates" element={<ParkingManage />} />
            <Route path="/m/marketing-campaigns" element={<MarketingCenter />} />
            <Route path="/m/marketing-coupons" element={<MarketingCenter />} />
            <Route path="/m/marketing-groupbuy" element={<MarketingCenter />} />
            <Route path="/m/marketing-seckill" element={<MarketingCenter />} />
            <Route path="/m/activity-signups" element={<MarketingCenter />} />
            <Route path="/m/checkin-activities" element={<MarketingCenter />} />
            <Route path="/m/referral-gifts" element={<MarketingCenter />} />
            <Route path="/m/new-member-gifts" element={<MarketingCenter />} />
            <Route path="/m/help-coupons" element={<MarketingCenter />} />
            <Route path="/m/word-coupons" element={<MarketingCenter />} />
            <Route path="/m/games" element={<MarketingCenter />} />
            <Route path="/m/surveys" element={<MarketingCenter />} />
            <Route path="/m/votes" element={<MarketingCenter />} />
            <Route path="/m/countdown-sales" element={<MarketingCenter />} />
            <Route path="/m/pre-sales" element={<MarketingCenter />} />
            <Route path="/m/bargain" element={<MarketingCenter />} />
            <Route path="/m/lucky-draws" element={<MarketingCenter />} />
            <Route path="/m/blind-boxes" element={<MarketingCenter />} />
            <Route path="/m/count-cards" element={<MarketingCenter />} />
            <Route path="/m/checkin-coupons" element={<MarketingCenter />} />
            <Route path="/m/douyin-coupons" element={<MarketingCenter />} />
            <Route path="/m/:moduleKey" element={<GenericCRUDWrapper />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function GenericCRUDWrapper() {
  const location = useLocation();
  const moduleKey = location.pathname.split('/m/')[1] || '';
  return <GenericCRUD key={moduleKey} moduleKey={moduleKey} />;
}
