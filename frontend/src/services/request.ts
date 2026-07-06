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
  deleteItem(module, id);
}

export async function toggleStatusData(module: string, id: number) {
  return toggleStatus(module, id);
}

export async function fetchUserInfo() {
  return { id: 1, username: 'admin', name: '超级管理员', role: 'admin', permissions: ['*'] };
}

export async function fetchDashboardSummary() {
  return fetchDashboard();
}