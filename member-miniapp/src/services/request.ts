import axios, { type AxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'capp-token'
const USER_KEY = 'capp-user'

export interface UserInfo {
  id: number
  phone: string
  name: string
  avatar: string
  level: string
  levelName: string
  points: number
  balance: number
  growthValue: number
  cardNo: string
}

export interface LoginResult {
  token: string
  tokenType: string
  expiresIn: number
  userInfo: UserInfo
}

const instance = axios.create({
  baseURL: '/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach bearer token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor: extract res.data.data and handle auth errors
instance.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 200) {
        return body.data
      }
      // Business error
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return body
  },
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      // Redirect to login if not already there
      if (!window.location.hash.includes('/login') && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    const msg = error?.response?.data?.message || error.message || '网络异常'
    return Promise.reject(new Error(msg))
  },
)

// Typed wrapper: interceptors already unwrap res.data.data, so methods resolve to T directly.
interface Http {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

const http = instance as unknown as Http

/** Login with phone + verify code. Code is always 123456 in mock. */
export async function login(phone: string, code: string): Promise<LoginResult> {
  return http.post<LoginResult>('/capp/login', { phone, code })
}

export function saveAuth(token: string, userInfo: UserInfo) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUserInfo(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export default http
