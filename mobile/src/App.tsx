import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PhoneFrame } from './components/common';
import { TabBarLayout } from './layouts/TabBarLayout';
import { isLoggedIn, fetchMe } from './services/auth';

import Login from './pages/Login';
import Home from './pages/Home';
import Mall from './pages/Mall';
import Activity from './pages/Activity';
import Points from './pages/Points';
import Me from './pages/Me';

// 详情页（由 subagent 实现）
import MemberCard from './pages/MemberCard';
import ProfileEdit from './pages/ProfileEdit';
import Search from './pages/Search';
import Messages from './pages/Messages';
import MerchantList from './pages/MerchantList';
import MerchantDetail from './pages/MerchantDetail';
import Food from './pages/Food';
import Coupon from './pages/Coupon';
import CouponMine from './pages/CouponMine';
import PointsGoodsDetail from './pages/PointsGoodsDetail';
import PointsLogs from './pages/PointsLogs';
import PointsOrders from './pages/PointsOrders';
import Parking from './pages/Parking';
import ParkingRecords from './pages/ParkingRecords';
import MallGoods from './pages/MallGoods';
import MallGoodsDetail from './pages/MallGoodsDetail';
import MallCart from './pages/MallCart';
import MallCheckout from './pages/MallCheckout';
import MallOrders from './pages/MallOrders';
import MallOrderDetail from './pages/MallOrderDetail';
import MallAddress from './pages/MallAddress';
import Checkin from './pages/Checkin';
import GameDetail from './pages/GameDetail';
import SurveyDetail from './pages/SurveyDetail';
import VoteDetail from './pages/VoteDetail';
import GenericActivityDetail from './pages/GenericActivityDetail';
import PhotoPoints from './pages/PhotoPoints';
import Rental from './pages/Rental';
import Service from './pages/Service';
import Property from './pages/Property';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // 拉取最新会员信息（已登录时）
  useEffect(() => {
    if (isLoggedIn() && !location.pathname.startsWith('/login')) {
      fetchMe().catch(() => {});
    }
  }, [location.pathname]);

  // 登录拦截
  useEffect(() => {
    if (!isLoggedIn() && !location.pathname.startsWith('/login')) {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <PhoneFrame>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* TabBar 主页 */}
        <Route path="/home" element={<TabBarLayout><Home /></TabBarLayout>} />
        <Route path="/mall" element={<TabBarLayout><Mall /></TabBarLayout>} />
        <Route path="/activity" element={<TabBarLayout><Activity /></TabBarLayout>} />
        <Route path="/points" element={<TabBarLayout><Points /></TabBarLayout>} />
        <Route path="/me" element={<TabBarLayout><Me /></TabBarLayout>} />

        {/* 会员相关 */}
        <Route path="/member/card" element={<MemberCard />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />

        {/* 搜索 / 消息 */}
        <Route path="/search" element={<Search />} />
        <Route path="/messages" element={<Messages />} />

        {/* 商户导览 */}
        <Route path="/merchants" element={<MerchantList />} />
        <Route path="/merchants/:id" element={<MerchantDetail />} />
        <Route path="/food" element={<Food />} />

        {/* 优惠券 */}
        <Route path="/coupon" element={<Coupon />} />
        <Route path="/coupon/mine" element={<CouponMine />} />

        {/* 积分商城详情 */}
        <Route path="/points/goods/:id" element={<PointsGoodsDetail />} />
        <Route path="/points/logs" element={<PointsLogs />} />
        <Route path="/points/orders" element={<PointsOrders />} />

        {/* 停车 */}
        <Route path="/parking" element={<Parking />} />
        <Route path="/parking/records" element={<ParkingRecords />} />

        {/* 商城详情系列 */}
        <Route path="/mall/goods" element={<MallGoods />} />
        <Route path="/mall/goods/:id" element={<MallGoodsDetail />} />
        <Route path="/mall/cart" element={<MallCart />} />
        <Route path="/mall/checkout" element={<MallCheckout />} />
        <Route path="/mall/orders" element={<MallOrders />} />
        <Route path="/mall/orders/:id" element={<MallOrderDetail />} />
        <Route path="/mall/address" element={<MallAddress />} />

        {/* 营销玩法 */}
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/survey/:id" element={<SurveyDetail />} />
        <Route path="/vote/:id" element={<VoteDetail />} />
        <Route path="/activity/:type/:id" element={<GenericActivityDetail />} />

        {/* 便民服务 */}
        <Route path="/photo-points" element={<PhotoPoints />} />
        <Route path="/rental" element={<Rental />} />
        <Route path="/service" element={<Service />} />
        <Route path="/property" element={<Property />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </PhoneFrame>
  );
}
