import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { key: '/home', label: '首页', icon: HomeIcon },
  { key: '/mall', label: '商城', icon: MallIcon },
  { key: '/activity', label: '活动', icon: ActivityIcon },
  { key: '/points', label: '积分', icon: PointsIcon },
  { key: '/me', label: '我的', icon: MeIcon },
];

export function TabBarLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = '/' + location.pathname.split('/')[1];

  return (
    <>
      <div className="app-container has-tabbar">{children}</div>
      <div className="tabbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeKey === t.key;
          return (
            <div
              key={t.key}
              className={`tabbar-item ${active ? 'active' : ''}`}
              onClick={() => navigate(t.key)}
            >
              <Icon active={active} />
              <span>{t.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// 内联 SVG 图标，避免依赖 @ant-design/icons-mobile 的版本兼容问题
type IconProps = { active?: boolean };

function HomeIcon({ active }: IconProps) {
  const c = active ? '#e63946' : '#8c8c8c';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V11z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}
function MallIcon({ active }: IconProps) {
  const c = active ? '#e63946' : '#8c8c8c';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 9h16l-1 11H5L4 9z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M9 9V6a3 3 0 016 0v3" stroke={c} strokeWidth="2"/>
    </svg>
  );
}
function ActivityIcon({ active }: IconProps) {
  const c = active ? '#e63946' : '#8c8c8c';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.5 6.5L21 9l-5 4.5L17 21l-5-3-5 3 1-7.5L3 9l6.5-.5L12 2z" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}
function PointsIcon({ active }: IconProps) {
  const c = active ? '#e63946' : '#8c8c8c';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2"/>
      <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MeIcon({ active }: IconProps) {
  const c = active ? '#e63946' : '#8c8c8c';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2"/>
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
