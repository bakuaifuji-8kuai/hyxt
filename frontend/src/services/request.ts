import { login as storeLogin, checkAuth, logout, fetchList, fetchOne, createItem, updateItem, deleteItem, toggleStatus, fetchDashboard } from './store';

export function login(username: string, password: string) {
  return Promise.resolve(storeLogin(username, password));
}

export function isAuthenticated() {
  return checkAuth();
}

export function handleLogout() {
  logout();
}

export async function fetchListData(module: string, params: Record<string, any> = {}) {
  return fetchList(module, params);
}

export async function fetchOneData(module: string, id: number) {
  return fetchOne(module, id);
}

export async function createItemData(module: string, body: Record<string, any>) {
  return createItem(module, body);
}

export async function updateItemData(module: string, id: number, body: Record<string, any>) {
  return updateItem(module, id, body);
}

export async function deleteItemData(module: string, id: number) {
  return deleteItem(module, id);
}

export async function toggleStatusData(module: string, id: number) {
  return toggleStatus(module, id);
}

export async function fetchUserInfo() {
  return { id: 1, username: 'admin', name: '超级管理员', role: 'admin', permissions: ['*'] };
}

// 移动端商户登录
export function loginMobile(phone: string) {
  const token = 'mobile-token-' + Date.now();
  localStorage.setItem('mobileToken', token);
  localStorage.setItem('mobilePhone', phone);

  // 模拟获取店铺信息
  const shopInfo = { id: 1, name: '海底捞', category: '餐饮', phone: '0731-88888001', contractExpiry: '2025-12-31', status: 'enabled' };
  localStorage.setItem('mobileShopInfo', JSON.stringify(shopInfo));

  return { token, shopInfo };
}

export function isMobileAuthenticated() {
  return !!localStorage.getItem('mobileToken');
}

export function handleMobileLogout() {
  localStorage.removeItem('mobileToken');
  localStorage.removeItem('mobilePhone');
  localStorage.removeItem('mobileShopInfo');
}

export async function fetchDashboardSummary() {
  return fetchDashboard();
}

import axios from 'axios';

export async function request(url: string, options: Record<string, any> = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
  const response = await axios({
    url: `/api/v1/${url}`,
    headers,
    ...options
  });
  return response.data;
}