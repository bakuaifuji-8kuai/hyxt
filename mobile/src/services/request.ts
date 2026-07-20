import axios, { AxiosRequestConfig } from 'axios';
import { Toast } from 'antd-mobile';

// 拦截器把响应统一解包成 data，所以这里把 api 的方法签名重写成 Promise<T>
type ApiInstance = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

const instance = axios.create({
  baseURL: '/v1',
  timeout: 10000,
});

// 自动注入 token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('capp_token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// 统一响应处理 + 401 跳登录
instance.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 200) return body.data;
      Toast.show({ content: body.message || '请求失败', icon: 'fail' });
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('capp_token');
      localStorage.removeItem('capp_member');
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login';
      }
    } else {
      Toast.show({ content: err.message || '网络异常', icon: 'fail' });
    }
    return Promise.reject(err);
  }
);

export const api = instance as unknown as ApiInstance;
