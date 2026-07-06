import axios from 'axios';

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 15000
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const data = response.data;
    // Standard wrapped response: { code, message, data }
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200) {
        return data.data;
      }
      // Non-200 → reject with message
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const msg = error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(msg));
  }
);

export default request;

// ===== Convenience CRUD helpers =====
export async function fetchList(module: string, params: Record<string, any> = {}) {
  return request.get(`/${module}`, { params });
}

export async function fetchOne(module: string, id: number) {
  return request.get(`/${module}/${id}`);
}

export async function createItem(module: string, body: Record<string, any>) {
  return request.post(`/${module}`, body);
}

export async function updateItem(module: string, id: number, body: Record<string, any>) {
  return request.put(`/${module}/${id}`, body);
}

export async function deleteItem(module: string, id: number) {
  return request.delete(`/${module}/${id}`);
}

export async function batchDelete(module: string, ids: number[]) {
  return request.post(`/${module}/batch-delete`, { ids });
}

export async function toggleStatus(module: string, id: number) {
  return request.post(`/${module}/${id}/toggle-status`);
}

export async function login(username: string, password: string) {
  return request.post('/auth/login', { username, password });
}

export async function fetchUserInfo() {
  return request.get('/auth/userinfo');
}

export async function fetchDashboard() {
  return request.get('/dashboard/summary');
}
