import { api } from './request';

// ============ 首页 ============
export const homeApi = {
  home: () => api.get('/c/home'),
};

// ============ 会员卡 ============
export const memberApi = {
  card: () => api.get('/c/member/card'),
};

// ============ 优惠券 ============
export const couponApi = {
  available: () => api.get('/c/coupons/available'),
  claim: (templateId: number | string) => api.post(`/c/coupons/${templateId}/claim`),
  mine: () => api.get('/c/coupons/mine'),
};

// ============ 积分商城 ============
export const pointsApi = {
  mall: () => api.get('/c/points/mall'),
  goodsDetail: (id: number | string) => api.get(`/c/points/goods/${id}`),
  exchange: (data: { goodsId: number; quantity: number; delivery: string }) =>
    api.post('/c/points/exchange', data),
  logs: (params: { page?: number; pageSize?: number } = {}) =>
    api.get('/c/points/logs', { params }),
};

// ============ 活动 ============
export const activityApi = {
  all: () => api.get('/c/activities'),
  signup: (id: number | string) => api.post(`/c/activity/${id}/signup`),
};

// ============ 签到 ============
export const checkinApi = {
  status: () => api.get('/c/checkin/status'),
  do: () => api.post('/c/checkin'),
};

// ============ 停车 ============
export const parkingApi = {
  plates: () => api.get('/c/parking/plates'),
  bindPlate: (plate: string) => api.post('/c/parking/plates', { plate }),
  unbindPlate: (plate: string) => api.delete(`/c/parking/plates/${plate}`),
  fee: (plate: string) => api.get('/c/parking/fee', { params: { plate } }),
  pay: (data: { plate: string; payMethod: string; couponCodes?: string[]; usePoints?: number }) =>
    api.post('/c/parking/pay', data),
  records: () => api.get('/c/parking/records'),
  coupons: () => api.get('/c/parking/coupons'),
  exchange: (couponId: number | string) => api.post('/c/parking/exchange', { couponId }),
};

// ============ 商户 ============
export const merchantApi = {
  list: (params: { category?: string; floor?: string; keyword?: string } = {}) =>
    api.get('/c/merchants', { params }),
  detail: (id: number | string) => api.get(`/c/merchants/${id}`),
  food: () => api.get('/c/food'),
};

// ============ 商城 ============
export const mallApi = {
  home: () => api.get('/c/mall/home'),
  goods: (params: { category?: string; keyword?: string; sort?: string } = {}) =>
    api.get('/c/mall/goods', { params }),
  goodsDetail: (id: number | string) => api.get(`/c/mall/goods/${id}`),
  addCart: (data: { goodsId: number; quantity: number; spec?: string }) => api.post('/c/mall/cart', data),
  cart: () => api.get('/c/mall/cart'),
  updateCart: (itemId: number, quantity: number) => api.put(`/c/mall/cart/${itemId}`, { quantity }),
  removeCart: (itemId: number) => api.delete(`/c/mall/cart/${itemId}`),
  createOrder: (data: { items: any[]; addressId?: number; delivery: string; remark?: string }) =>
    api.post('/c/mall/order', data),
  orders: (params: { status?: string } = {}) => api.get('/c/mall/orders', { params }),
  orderDetail: (id: number | string) => api.get(`/c/mall/orders/${id}`),
  cancelOrder: (id: number | string) => api.post(`/c/mall/orders/${id}/cancel`),
  refundOrder: (id: number | string, reason: string) => api.post(`/c/mall/orders/${id}/refund`, { reason }),
  addresses: () => api.get('/c/mall/addresses'),
  addAddress: (data: any) => api.post('/c/mall/addresses', data),
  updateAddress: (id: number, data: any) => api.put(`/c/mall/addresses/${id}`, data),
  removeAddress: (id: number) => api.delete(`/c/mall/addresses/${id}`),
};

// ============ 营销玩法 ============
export const promoApi = {
  groupbuyJoin: (id: number | string) => api.post(`/c/groupbuy/${id}/join`),
  seckillBuy: (id: number | string) => api.post(`/c/seckill/${id}/buy`),
  helpCoupon: (id: number | string) => api.post(`/c/help-coupon/${id}/help`),
  helpCouponClaim: (id: number | string) => api.post(`/c/help-coupon/${id}/claim`),
  wordCouponClaim: (word: string) => api.post('/c/word-coupon/claim', { word }),
  gamePlay: (id: number | string) => api.post(`/c/game/${id}/play`),
  surveySubmit: (id: number | string, answers: any) => api.post(`/c/survey/${id}/submit`, { answers }),
  voteSubmit: (id: number | string, optionId: any) => api.post(`/c/vote/${id}/submit`, { optionId }),
  newMemberClaim: () => api.post('/c/new-member/claim'),
  referralCode: () => api.get('/c/referral/code'),
  referralRecords: () => api.get('/c/referral/records'),
};

// ============ 拍照积分 ============
export const photoPointsApi = {
  upload: (data: { merchantId?: number; amount: number; image: string }) =>
    api.post('/c/photo-points/upload', data),
  records: () => api.get('/c/photo-points/records'),
};

// ============ 物品租借 ============
export const rentalApi = {
  items: () => api.get('/c/rental/items'),
  apply: (itemId: number | string) => api.post('/c/rental/apply', { itemId }),
  records: () => api.get('/c/rental/records'),
  return: (recordId: number | string) => api.post(`/c/rental/${recordId}/return`),
};

// ============ 消息 ============
export const messageApi = {
  list: () => api.get('/c/messages'),
  read: (data: { ids?: number[]; all?: boolean }) => api.post('/c/messages/read', data),
};

// ============ 客服 ============
export const csApi = {
  knowledge: (keyword: string) => api.get('/c/cs/knowledge', { params: { keyword } }),
  chat: (question: string) => api.post('/c/cs/chat', { question }),
  transfer: () => api.post('/c/cs/transfer'),
};

// ============ 业主 / 地产 ============
export const propertyApi = {
  auth: (data: { property: string; community: string; name: string; phone: string }) =>
    api.post('/c/property/auth', data),
  info: () => api.get('/c/property/info'),
  tasks: () => api.get('/c/property/tasks'),
  submitTask: (id: number | string, evidence?: any) => api.post(`/c/property/tasks/${id}/submit`, { evidence }),
  activities: () => api.get('/c/property/activities'),
  signup: (id: number | string) => api.post(`/c/property/activities/${id}/signup`),
  goods: () => api.get('/c/property/goods'),
};
