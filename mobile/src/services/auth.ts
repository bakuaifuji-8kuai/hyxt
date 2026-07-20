import { api } from './request';

export interface Member {
  id: number;
  name: string;
  phone: string;
  level: string;
  points: number;
  avatar?: string;
  gender?: string;
  birthday?: string;
  address?: string;
  email?: string;
  status?: string;
  [k: string]: any;
}

const DEMO_PHONE = '13800000001';
const DEMO_CODE = '1234';

/** 手机号一键登录（mock：任意手机号+任意 4-6 位 code 都能登录，未注册自动注册） */
export async function loginByPhone(phone: string, code: string) {
  const data: any = await api.post('/c/auth/login', { phone, code });
  localStorage.setItem('capp_token', data.token);
  localStorage.setItem('capp_member', JSON.stringify(data.member));
  return data.member as Member;
}

/** 一键体验登录（demo 账号） */
export async function loginDemo() {
  return loginByPhone(DEMO_PHONE, DEMO_CODE);
}

export function logout() {
  localStorage.removeItem('capp_token');
  localStorage.removeItem('capp_member');
  api.post('/c/auth/logout').catch(() => {});
}

export function getStoredMember(): Member | null {
  try {
    const raw = localStorage.getItem('capp_member');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('capp_token');
}

export async function fetchMe(): Promise<Member> {
  const m: any = await api.get('/c/auth/me');
  localStorage.setItem('capp_member', JSON.stringify(m));
  return m as Member;
}

export async function updateProfile(patch: Partial<Member>) {
  // C 端暂无独立更新接口，复用 me + 后台 member/list PUT
  const me = getStoredMember();
  if (!me) throw new Error('未登录');
  return api.put(`/member/list/${me.id}`, patch).then(() => fetchMe());
}
