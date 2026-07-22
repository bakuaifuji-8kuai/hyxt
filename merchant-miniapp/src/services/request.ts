import axios, { AxiosError } from 'axios'

export const TOKEN_KEY = 'bapp-token'
export const USER_KEY = 'bapp-user'

const request = axios.create({
  baseURL: '/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach bearer token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — unwrap { code, message, data }
request.interceptors.response.use(
  (response) => {
    const payload = response.data
    // Standard envelope: { code, message, data }
    if (payload && typeof payload === 'object' && 'data' in payload) {
      if (payload.code !== undefined && payload.code !== 200) {
        return Promise.reject(
          new Error(payload.message || '请求失败，请稍后重试'),
        )
      }
      return payload.data
    }
    return payload
  },
  (error: AxiosError<{ message?: string; code?: number }>) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message || error.message || '网络异常，请稍后重试'

    // 401 — clear session and bounce to login
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (location.pathname !== '/login') {
        location.replace('/login')
      }
    }
    return Promise.reject(new Error(message))
  },
)

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

export interface UserInfo {
  id?: string | number
  username?: string
  name?: string
  shopId?: string | number
  shopName?: string
  role?: string
  avatar?: string
  [key: string]: unknown
}

/** POST /v1/bapp/login */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  const data = await request.post<unknown, LoginResult>(
    '/bapp/login',
    payload,
  )
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token)
  }
  if (data?.userInfo) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.userInfo))
  }
  return data
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
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

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(TOKEN_KEY)
}

export default request
