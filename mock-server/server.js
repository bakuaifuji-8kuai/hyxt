const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const SECRET = 'hengwei-mock-secret-2024';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============ 静态资源托管（前端构建产物）============
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// ============ /api/v1 -> /v1 路径重写（兼容前端 baseURL）============
app.use((req, res, next) => {
  if (req.url.startsWith('/api/v1/')) {
    req.url = req.url.replace('/api/v1/', '/v1/');
  } else if (req.url === '/api/v1') {
    req.url = '/v1';
  }
  next();
});

// ============ Response wrapper middleware ============
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // If it's already a standard envelope {code: number, message, data}, return as-is.
    // Use typeof number to avoid false-positive on items that carry a `code` STRING field
    // (e.g. member-level 'code', system-role 'code').
    if (body && typeof body === 'object' && typeof body.code === 'number' && 'message' in body) {
      return originalJson(body);
    }
    // Paginated array → {code, message, data: {list, total, page, pageSize}}
    if (Array.isArray(body) && req._pagination) {
      const { page, pageSize } = req._pagination;
      const total = body.length;
      const start = (page - 1) * pageSize;
      const list = body.slice(start, start + pageSize);
      return originalJson({ code: 200, message: 'success', data: { list, total, page, pageSize } });
    }
    // Plain object/array → wrap
    return originalJson({ code: 200, message: 'success', data: body });
  };
  next();
});

// ============ Auth ============
const USERS = {
  admin: { id: 1, username: 'admin', password: 'admin', name: '超级管理员', role: 'admin' }
};

app.post('/v1/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const u = USERS[username];
  if (!u || u.password !== password) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
  }
  const token = jwt.sign({ sub: u.username, userId: u.id }, SECRET, { expiresIn: '12h' });
  res.json({
    code: 200, message: 'success',
    data: { token, tokenType: 'Bearer', expiresIn: 43200, userInfo: { id: u.id, username: u.username, name: u.name, role: u.role } }
  });
});

app.get('/v1/auth/userinfo', auth, (req, res) => {
  const u = USERS[req.user.sub];
  res.json({ id: u.id, username: u.username, name: u.name, role: u.role, permissions: ['*'] });
});

app.post('/v1/auth/logout', (req, res) => {
  res.json({ code: 200, message: 'success', data: null });
});

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ code: 401, message: '未登录', data: null });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, message: 'token无效', data: null });
  }
}

// ============ Pagination parser ============
app.use((req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  req._pagination = { page, pageSize };
  next();
});

// ============ Generic in-memory data store ============
// Each module: { fields, data, autoIncrement }
const modules = {};

function defineModule(name, fields, seedData = []) {
  const data = seedData.map((item, idx) => ({ id: idx + 1, ...item }));
  modules[name] = {
    fields,
    data,
    nextId: data.length + 1
  };
}

function getModule(name) { return modules[name]; }

// ============ Generic CRUD factory ============
function crudRouter(moduleName) {
  const router = express.Router();
  router.use(auth);

  // List
  router.get('/', (req, res) => {
    const m = getModule(moduleName);
    if (!m) return res.status(404).json({ code: 404, message: '模块不存在', data: null });
    let list = [...m.data];
    // Simple filter: any query param matching a field name
    for (const [k, v] of Object.entries(req.query)) {
      if (['page', 'pageSize'].includes(k)) continue;
      list = list.filter(item => String(item[k] ?? '').toLowerCase().includes(String(v).toLowerCase()));
    }
    // Simple sort by id desc
    list.sort((a, b) => b.id - a.id);
    res.json(list);
  });

  // Get one
  router.get('/:id', (req, res) => {
    const m = getModule(moduleName);
    const item = m.data.find(x => x.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ code: 404, message: '不存在', data: null });
    res.json(item);
  });

  // Create
  router.post('/', (req, res) => {
    const m = getModule(moduleName);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newItem = { id: m.nextId++, ...req.body, createdAt: now, updatedAt: now };
    m.data.push(newItem);
    res.json(newItem);
  });

  // Update
  router.put('/:id', (req, res) => {
    const m = getModule(moduleName);
    const idx = m.data.findIndex(x => x.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ code: 404, message: '不存在', data: null });
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    m.data[idx] = { ...m.data[idx], ...req.body, id: m.data[idx].id, updatedAt: now };
    res.json(m.data[idx]);
  });

  // Delete
  router.delete('/:id', (req, res) => {
    const m = getModule(moduleName);
    const idx = m.data.findIndex(x => x.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ code: 404, message: '不存在', data: null });
    const [removed] = m.data.splice(idx, 1);
    res.json({ success: true, removed });
  });

  // Batch delete
  router.post('/batch-delete', (req, res) => {
    const m = getModule(moduleName);
    const ids = req.body.ids || [];
    m.data = m.data.filter(x => !ids.includes(x.id));
    res.json({ success: true, count: ids.length });
  });

  // Toggle status
  router.post('/:id/toggle-status', (req, res) => {
    const m = getModule(moduleName);
    const item = m.data.find(x => x.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ code: 404, message: '不存在', data: null });
    item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
    item.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    res.json(item);
  });

  return router;
}

// ============ Module definitions with seed data ============

// 会员数字化
defineModule('member/level', ['name', 'code', 'minPoints', 'discount', 'status'], [
  { name: '普通会员', code: 'NORMAL', minPoints: 0, discount: 1.0, status: 'enabled' },
  { name: '银卡会员', code: 'SILVER', minPoints: 1000, discount: 0.95, status: 'enabled' },
  { name: '金卡会员', code: 'GOLD', minPoints: 5000, discount: 0.9, status: 'enabled' },
  { name: '钻石会员', code: 'DIAMOND', minPoints: 20000, discount: 0.85, status: 'enabled' }
]);

defineModule('member/list', ['name', 'phone', 'gender', 'birthday', 'age', 'address', 'occupation', 'hobby', 'email', 'level', 'points', 'status'], [
  { name: '张三', phone: '13800138001', gender: 'male', birthday: '1990-05-20', age: 34, address: '长沙市岳麓区', occupation: '金融', hobby: '健身、电影', email: 'zhangsan@example.com', level: 'GOLD', points: 6200, status: 'enabled' },
  { name: '李四', phone: '13800138002', gender: 'female', birthday: '1992-08-15', age: 32, address: '长沙市天心区', occupation: '教师', hobby: '旅游、美食', email: 'lisi@example.com', level: 'SILVER', points: 1500, status: 'enabled' },
  { name: '王五', phone: '13800138003', gender: 'male', birthday: '1988-12-01', age: 36, address: '长沙市开福区', occupation: 'IT', hobby: '数码、阅读', email: 'wangwu@example.com', level: 'NORMAL', points: 200, status: 'enabled' }
]);

defineModule('member/tags', ['name', 'category', 'rule', 'count', 'status'], [
  { name: '高消费客户', category: '消费', rule: '年消费>10000', count: 128, status: 'enabled' },
  { name: '流失预警', category: '活跃', rule: '90天未到店', count: 56, status: 'enabled' }
]);

// 积分中心
defineModule('points/rules', ['name', 'type', 'points', 'condition', 'status'], [
  { name: '消费送积分', type: 'consume', points: 1, condition: '每消费1元送1积分', status: 'enabled' },
  { name: '签到积分', type: 'signin', points: 5, condition: '每日签到送5积分', status: 'enabled' },
  { name: '生日双倍', type: 'birthday', points: 2, condition: '生日当天积分翻倍', status: 'enabled' }
]);

defineModule('points/goods', ['name', 'points', 'stock', 'image', 'status'], [
  { name: '星巴克咖啡券', points: 500, stock: 100, image: '', status: 'enabled' },
  { name: '电影票2张', points: 1500, stock: 50, image: '', status: 'enabled' },
  { name: '100元无门槛券', points: 1000, stock: 80, image: '', status: 'enabled' }
]);

defineModule('points/logs', ['member', 'type', 'points', 'balance', 'remark'], [
  { member: '张三', type: 'consume', points: 100, balance: 6200, remark: '消费100元' },
  { member: '李四', type: 'signin', points: 5, balance: 1500, remark: '每日签到' }
]);

// 礼券中心
defineModule('coupon/templates', ['name', 'scope', 'shopName', 'type', 'value', 'minSpend', 'quantity', 'claimed', 'used', 'coverImage', 'validityType', 'validityDays', 'startTime', 'endTime', 'useScope', 'description', 'status', 'groupPrice'], [
  { name: '满200减30', scope: 'platform', type: 'fullcut', value: 30, minSpend: 200, quantity: 1000, claimed: 320, used: 156, validityType: 'days', validityDays: 30, useScope: 'all', description: '全场通用，不可与其他优惠叠加', status: 'enabled' },
  { name: '新人立减10元', scope: 'platform', type: 'cash', value: 10, minSpend: 0, quantity: 5000, claimed: 1200, used: 890, validityType: 'days', validityDays: 7, useScope: 'all', description: '新用户专享，无门槛使用', status: 'enabled' },
  { name: '8折优惠券', scope: 'platform', type: 'discount', value: 8, minSpend: 100, quantity: 2000, claimed: 560, used: 230, validityType: 'days', validityDays: 15, useScope: 'all', description: '全场商品8折，最高优惠50元', status: 'enabled' },
  { name: '团50抵扣100', scope: 'platform', type: 'groupbuy', value: 100, minSpend: 0, groupPrice: 50, quantity: 1000, claimed: 450, used: 280, validityType: 'days', validityDays: 30, useScope: 'all', description: '团购专享，50元抵100元', status: 'enabled' },
  { name: '海底捞满300减50', scope: 'shop', shopName: '海底捞', type: 'fullcut', value: 50, minSpend: 300, quantity: 500, claimed: 280, used: 120, validityType: 'days', validityDays: 30, useScope: 'all', description: '仅限海底捞门店使用', status: 'enabled' },
  { name: '星巴克满100减20', scope: 'shop', shopName: '星巴克', type: 'fullcut', value: 20, minSpend: 100, quantity: 800, claimed: 450, used: 200, validityType: 'days', validityDays: 15, useScope: 'all', description: '仅限星巴克门店使用', status: 'enabled' }
]);

defineModule('coupon/batches', ['name', 'template', 'count', 'claimed', 'status'], [
  { name: '618活动券批次', template: '满200减30', count: 500, claimed: 120, status: 'enabled' }
]);

// 智慧停车
defineModule('parking/records', ['plate', 'member', 'inTime', 'outTime', 'duration', 'fee', 'points'], [
  { plate: '京A12345', member: '张三', inTime: '2024-06-01 10:00', outTime: '2024-06-01 12:00', duration: 120, fee: 20, points: 20 }
]);

defineModule('parking/benefit', ['name', 'level', 'freeHours', 'pointsRate', 'status'], [
  { name: '金卡会员停车权益', level: 'GOLD', freeHours: 2, pointsRate: 1, status: 'enabled' }
]);

defineModule('marketing/campaigns', ['name', 'type', 'startTime', 'endTime', 'status', 'budget', 'usedBudget', 'groupbuyRules'], [
  { id: 1, name: '618大促', type: 'promotion', startTime: '2024-06-18', endTime: '2024-06-20', status: 'enabled', budget: 50000, usedBudget: 0 },
  { id: 2, name: '会员日', type: 'memberday', startTime: '2024-06-20', endTime: '2024-06-20', status: 'enabled', budget: 20000, usedBudget: 0 },
  { id: 3, name: '三人拼团活动', type: 'groupbuy', startTime: '2024-07-15', endTime: '2024-07-30', status: 'enabled', budget: 10000, usedBudget: 3500, groupbuyRules: [{ payAmount: 50, deductAmount: 100 }, { payAmount: 200, deductAmount: 450 }] }
]);

defineModule('marketing/coupons', ['name', 'campaign', 'template', 'count', 'claimed'], [
  { name: '618主券', campaign: '618大促', template: '满200减30', count: 500, claimed: 120 }
]);

defineModule('marketing/groupbuy', ['name', 'payAmount', 'deductAmount', 'minCount', 'joined', 'status'], [
  { name: '海底捞双人套餐', payAmount: 50, deductAmount: 100, minCount: 3, joined: 8, status: 'enabled' }
]);

defineModule('marketing/seckill', ['name', 'price', 'originalPrice', 'stock', 'sold', 'startTime', 'status'], [
  { name: '1元秒杀可乐', price: 1, originalPrice: 5, stock: 100, sold: 100, startTime: '2024-06-18 10:00', status: 'enabled' }
]);

// 服务中心
defineModule('service/orders', ['orderNo', 'member', 'service', 'amount', 'status', 'time'], [
  { orderNo: 'S20240601001', member: '张三', service: '干洗服务', amount: 50, status: 'finished', time: '2024-06-01 10:00' }
]);

// 营销触达
defineModule('message/templates', ['name', 'channel', 'type', 'content', 'status'], [
  { name: '生日祝福', channel: 'sms', type: 'birthday', content: '亲爱的会员，生日快乐！', status: 'enabled' },
  { name: '优惠券到账', channel: 'wechat', type: 'coupon', content: '您的优惠券已到账，请查收', status: 'enabled' }
]);

defineModule('message/campaigns', ['name', 'template', 'channel', 'audience', 'sent', 'read', 'status'], [
  { name: '618预热推送', template: '优惠券到账', channel: 'wechat', audience: 5000, sent: 5000, read: 2100, status: 'finished' }
]);

// 电子钱包
defineModule('wallet/accounts', ['member', 'balance', 'points', 'status'], [
  { member: '张三', balance: 500.00, points: 6200, status: 'enabled' },
  { member: '李四', balance: 100.00, points: 1500, status: 'enabled' }
]);

defineModule('wallet/transactions', ['member', 'type', 'amount', 'balance', 'remark', 'time'], [
  { member: '张三', type: 'recharge', amount: 500, balance: 500, remark: '充值', time: '2024-06-01 10:00' },
  { member: '张三', type: 'consume', amount: -50, balance: 450, remark: '干洗服务', time: '2024-06-01 11:00' }
]);

// 商户营销
defineModule('merchant/list', ['name', 'category', 'contact', 'phone', 'status'], [
  { name: '海底捞', category: '餐饮', contact: '王经理', phone: '13900139001', status: 'enabled' },
  { name: '星巴克', category: '餐饮', contact: '李经理', phone: '13900139002', status: 'enabled' }
]);

// 在线商城
defineModule('shop/goods', ['name', 'category', 'price', 'stock', 'sales', 'status'], [
  { name: '纯棉T恤', category: '服装', price: 99, stock: 200, sales: 50, status: 'enabled' },
  { name: '蓝牙耳机', category: '数码', price: 299, stock: 100, sales: 30, status: 'enabled' }
]);

defineModule('shop/orders', ['orderNo', 'member', 'goods', 'amount', 'status', 'time'], [
  { orderNo: 'O20240601001', member: '张三', goods: '纯棉T恤', amount: 99, status: 'paid', time: '2024-06-01 10:00' }
]);

defineModule('shop/categories', ['name', 'sort', 'status'], [
  { name: '服装', sort: 1, status: 'enabled' },
  { name: '数码', sort: 2, status: 'enabled' }
]);

// 数据中心
defineModule('analytics/dashboards', ['name', 'type', 'config', 'status'], [
  { name: '会员增长看板', type: 'member', config: '{}', status: 'enabled' }
]);

// 配置中心
defineModule('config/shops', ['name', 'address', 'phone', 'status'], [
  { name: '总店', address: '北京市朝阳区', phone: '010-12345678', status: 'enabled' }
]);

defineModule('config/terminals', ['name', 'shop', 'type', 'status'], [
  { name: '收银机1', shop: '总店', type: 'cashier', status: 'enabled' }
]);

// 系统管理
defineModule('system/users', ['name', 'username', 'role', 'status'], [
  { name: '超级管理员', username: 'admin', role: 'admin', status: 'enabled' },
  { name: '运营小李', username: 'li', role: 'operator', status: 'enabled' }
]);

defineModule('system/roles', ['name', 'code', 'permissions', 'status'], [
  { name: '管理员', code: 'admin', permissions: '["*"]', status: 'enabled' },
  { name: '运营', code: 'operator', permissions: '["member:*","marketing:*"]', status: 'enabled' }
]);

// 核销中心
defineModule('verification/records', ['code', 'member', 'target', 'shop', 'status', 'time'], [
  { code: 'HX20240001', member: '张三', target: '满200减30', shop: '总店', status: 'verified', time: '2024-06-01 12:00' },
  { code: 'HX20240002', member: '李四', target: '星巴克咖啡券', shop: '总店', status: 'unused', time: '' }
]);

defineModule('verification/staff', ['name', 'shop', 'count', 'status'], [
  { name: '收银员A', shop: '总店', count: 128, status: 'enabled' }
]);

// 渠道核销管理
defineModule('channel/configs', ['channel', 'channelName', 'appId', 'appSecret', 'accessToken', 'tokenExpireTime', 'callbackUrl', 'spiCallbackUrl', 'serverWhitelist', 'depositAmount', 'qualificationStatus', 'accountType', 'poiStatus', 'poiAuditReason', 'annualReviewDate', 'noteMountPermission', 'independentSwitch', 'status', 'createdAt'], [
  { id: 1, channel: 'douyin', channelName: '抖音来客', appId: 'dy_123456', appSecret: '******', accessToken: 'dy_token_abc', tokenExpireTime: '2024-12-31 23:59:59', callbackUrl: 'https://api.hengwei.com/v1/channel/douyin/callback', spiCallbackUrl: 'https://api.hengwei.com/v1/channel/douyin/spi', serverWhitelist: '192.168.1.100', depositAmount: 10000, qualificationStatus: 'approved', accountType: '', poiStatus: '', poiAuditReason: '', annualReviewDate: '', noteMountPermission: false, independentSwitch: true, status: 'enabled', createdAt: '2024-07-01 10:00:00' },
  { id: 2, channel: 'meituan', channelName: '美团开放平台', appId: 'mt_654321', appSecret: '******', accessToken: 'mt_token_xyz', tokenExpireTime: '2024-12-31 23:59:59', callbackUrl: 'https://api.hengwei.com/v1/channel/meituan/callback', spiCallbackUrl: 'https://api.hengwei.com/v1/channel/meituan/spi', serverWhitelist: '', depositAmount: 0, qualificationStatus: 'approved', accountType: '', poiStatus: '', poiAuditReason: '', annualReviewDate: '', noteMountPermission: false, independentSwitch: true, status: 'enabled', createdAt: '2024-07-01 10:00:00' },
  { id: 3, channel: 'xiaohongshu', channelName: '小红书企业号', appId: 'xhs_789012', appSecret: '******', accessToken: 'xhs_token_123', tokenExpireTime: '2024-12-31 23:59:59', callbackUrl: 'https://api.hengwei.com/v1/channel/xiaohongshu/callback', spiCallbackUrl: 'https://api.hengwei.com/v1/channel/xiaohongshu/spi', serverWhitelist: '', depositAmount: 0, qualificationStatus: 'approved', accountType: 'enterprise', poiStatus: 'approved', poiAuditReason: '', annualReviewDate: '2025-07-01', noteMountPermission: true, independentSwitch: true, status: 'enabled', createdAt: '2024-07-01 10:00:00' }
]);

defineModule('merchant/contracts', ['merchantId', 'merchantName', 'contractNo', 'contractType', 'channelType', 'status', 'signDate', 'startDate', 'endDate', 'discountCostRatio', 'platformFeeRatio', 'settlementMethod', 'settlementCycle', 'bankName', 'bankAccount', 'accountName', 'contactPerson', 'contactPhone', 'remark', 'createdBy'], [
  { id: 1, merchantId: 1, merchantName: '星巴克', contractNo: 'HT-20240701-001-DM', contractType: 'channelCouponVerify', channelType: 'all', status: 'authorized', signDate: '2024-07-01', startDate: '2024-07-01', endDate: '2025-06-30', discountCostRatio: 50, platformFeeRatio: 100, settlementMethod: 'rentDeduct', settlementCycle: 'monthly', bankName: '', bankAccount: '', accountName: '', contactPerson: '李经理', contactPhone: '13800138001', remark: '', createdBy: '管理员' },
  { id: 2, merchantId: 2, merchantName: '海底捞', contractNo: 'HT-20240701-002-DM', contractType: 'channelCouponVerify', channelType: 'all', status: 'signed', signDate: '2024-07-05', startDate: '2024-07-05', endDate: '2025-07-04', discountCostRatio: 40, platformFeeRatio: 100, settlementMethod: 'bankTransfer', settlementCycle: 'monthly', bankName: '工商银行', bankAccount: '622202********1234', accountName: '海底捞餐饮有限公司', contactPerson: '王经理', contactPhone: '13900139001', remark: '', createdBy: '管理员' }
]);

defineModule('merchant/authorizations', ['merchantId', 'merchantName', 'channel', 'authorizationType', 'platformShopId', 'platformShopName', 'authorizationStatus', 'authorizationUrl', 'authorizationCode', 'shopAccessToken', 'authorizedPermissions', 'failureReason', 'contractId', 'createdAt'], [
  { id: 1, merchantId: 1, merchantName: '星巴克', channel: 'douyin', authorizationType: 'serviceProvider', platformShopId: 'poi_123', platformShopName: '星巴克(恒伟广场店)', authorizationStatus: 'completed', authorizationUrl: '', authorizationCode: '', shopAccessToken: '', authorizedPermissions: '团购核销、门店查询、对账查询', failureReason: '', contractId: 1, createdAt: '2024-07-02 10:00:00' },
  { id: 2, merchantId: 1, merchantName: '星巴克', channel: 'meituan', authorizationType: 'oauth', platformShopId: 'mt_456', platformShopName: '星巴克(恒伟广场店)', authorizationStatus: 'completed', authorizationUrl: '', authorizationCode: '', shopAccessToken: 'mt_shop_token_abc', authorizedPermissions: '团购核销、门店查询、对账查询', failureReason: '', contractId: 1, createdAt: '2024-07-03 10:00:00' },
  { id: 3, merchantId: 2, merchantName: '海底捞', channel: 'douyin', authorizationType: 'serviceProvider', platformShopId: 'poi_789', platformShopName: '海底捞(恒伟广场店)', authorizationStatus: 'pending', authorizationUrl: 'https://open.douyin.com/oauth/authorize?client_key=dy_123456&redirect_uri=...', authorizationCode: '', shopAccessToken: '', authorizedPermissions: '', failureReason: '', contractId: 2, createdAt: '2024-07-06 10:00:00' },
  { id: 4, merchantId: 1, merchantName: '星巴克', channel: 'xiaohongshu', authorizationType: 'oauth', platformShopId: 'xhs_poi_001', platformShopName: '星巴克(恒伟广场店)', authorizationStatus: 'completed', authorizationUrl: '', authorizationCode: '', shopAccessToken: 'xhs_shop_token_001', authorizedPermissions: '团购核销、门店查询、笔记挂载', failureReason: '', contractId: 1, createdAt: '2024-07-04 10:00:00' }
]);

defineModule('channel/templates', ['channel', 'platformTemplateId', 'templateName', 'couponType', 'faceValue', 'minConsume', 'discountRate', 'totalStock', 'soldCount', 'validStartTime', 'validEndTime', 'applicableShops', 'merchantCostRatio', 'platformFeeRatio', 'status', 'syncTime'], [
  { id: 1, channel: 'douyin', platformTemplateId: 'dy_temp_001', templateName: '50元代金券', couponType: 'voucher', faceValue: 50, minConsume: 100, discountRate: 0, totalStock: 1000, soldCount: 356, validStartTime: '2024-07-01 00:00:00', validEndTime: '2024-12-31 23:59:59', applicableShops: '["poi_123", "poi_789"]', merchantCostRatio: 50, platformFeeRatio: 10, status: 'synced', syncTime: '2024-07-01 10:00:00' },
  { id: 2, channel: 'meituan', platformTemplateId: 'mt_temp_001', templateName: '8折优惠券', couponType: 'couponPercent', faceValue: 0, minConsume: 200, discountRate: 0.8, totalStock: 500, soldCount: 189, validStartTime: '2024-07-01 00:00:00', validEndTime: '2024-12-31 23:59:59', applicableShops: '["mt_456"]', merchantCostRatio: 40, platformFeeRatio: 8, status: 'synced', syncTime: '2024-07-01 10:00:00' },
  { id: 3, channel: 'douyin', platformTemplateId: '', templateName: '双人套餐团购券', couponType: 'groupbuy', faceValue: 199, minConsume: 0, discountRate: 0, totalStock: 200, soldCount: 0, validStartTime: '2024-08-01 00:00:00', validEndTime: '2024-12-31 23:59:59', applicableShops: '["poi_789"]', merchantCostRatio: 60, platformFeeRatio: 10, status: 'pending', syncTime: '' },
  { id: 4, channel: 'xiaohongshu', platformTemplateId: 'xhs_temp_001', templateName: '30元满减券', couponType: 'couponDiscount', faceValue: 30, minConsume: 100, discountRate: 0, totalStock: 800, soldCount: 120, validStartTime: '2024-07-01 00:00:00', validEndTime: '2024-12-31 23:59:59', applicableShops: '["xhs_poi_001"]', merchantCostRatio: 45, platformFeeRatio: 5, status: 'synced', syncTime: '2024-07-01 10:00:00' }
]);

defineModule('channel/redemptions', ['channel', 'channelRedemptionId', 'couponCode', 'platformTemplateId', 'merchantId', 'merchantName', 'shopId', 'shopName', 'platformShopId', 'operator', 'redemptionTime', 'originalAmount', 'discountAmount', 'remainingAmount', 'status', 'revokeStatus', 'revokeReason', 'revokeTime', 'revokeOperator', 'revokeFailureReason', 'deviceId', 'notes'], [
  { id: 1, channel: 'douyin', channelRedemptionId: 'dy_red_001', couponCode: 'DY202407100001', platformTemplateId: 'dy_temp_001', merchantId: 1, merchantName: '星巴克', shopId: 1, shopName: '总店', platformShopId: 'poi_123', operator: '收银员A', redemptionTime: '2024-07-10 14:30:00', originalAmount: 150, discountAmount: 50, remainingAmount: 100, status: 'verified', revokeStatus: 'none', revokeReason: '', revokeTime: '', revokeOperator: '', revokeFailureReason: '', deviceId: 'pad_001', notes: '' },
  { id: 2, channel: 'meituan', channelRedemptionId: 'mt_red_001', couponCode: 'MT202407100001', platformTemplateId: 'mt_temp_001', merchantId: 1, merchantName: '星巴克', shopId: 1, shopName: '总店', platformShopId: 'mt_456', operator: '收银员A', redemptionTime: '2024-07-10 15:45:00', originalAmount: 250, discountAmount: 50, remainingAmount: 200, status: 'verified', revokeStatus: 'none', revokeReason: '', revokeTime: '', revokeOperator: '', revokeFailureReason: '', deviceId: 'pad_001', notes: '' },
  { id: 3, channel: 'douyin', channelRedemptionId: 'dy_red_002', couponCode: 'DY202407100002', platformTemplateId: 'dy_temp_001', merchantId: 2, merchantName: '海底捞', shopId: 2, shopName: '分店', platformShopId: 'poi_789', operator: '收银员B', redemptionTime: '2024-07-10 18:00:00', originalAmount: 300, discountAmount: 50, remainingAmount: 250, status: 'revoked', revokeStatus: 'succeeded', revokeReason: 'refund', revokeTime: '2024-07-10 18:30:00', revokeOperator: '店长', revokeFailureReason: '', deviceId: 'pad_002', notes: '顾客退款' }
]);

defineModule('channel/reconciliation/daily', ['date', 'channel', 'platformVerifyCount', 'platformVerifyAmount', 'shopVerifyCount', 'shopVerifyAmount', 'matchedCount', 'unmatchedCount', 'unmatchedDetails', 'status', 'operator', 'reconcileTime', 'remark'], [
  { id: 1, date: '2024-07-09', channel: 'all', platformVerifyCount: 50, platformVerifyAmount: 5000, shopVerifyCount: 48, shopVerifyAmount: 4900, matchedCount: 48, unmatchedCount: 2, unmatchedDetails: '[{"couponCode":"DY202407090015","reason":"中台有核销银豹无订单"},{"couponCode":"DY202407090028","reason":"银豹有备注中台无核销"}]', status: 'unmatched', operator: '运营A', reconcileTime: '2024-07-10 09:00:00', remark: '待门店确认' },
  { id: 2, date: '2024-07-08', channel: 'all', platformVerifyCount: 35, platformVerifyAmount: 3500, shopVerifyCount: 35, shopVerifyAmount: 3500, matchedCount: 35, unmatchedCount: 0, unmatchedDetails: '[]', status: 'matched', operator: '运营A', reconcileTime: '2024-07-09 09:00:00', remark: '' }
]);

defineModule('channel/settlement/monthly', ['merchantId', 'merchantName', 'channel', 'settlementMonth', 'totalDiscountAmount', 'merchantCostAmount', 'platformFeeAmount', 'daRenCommissionAmount', 'settlementAmount', 'settlementMethod', 'status', 'settlementTime', 'operator', 'documents', 'remark'], [
  { id: 1, merchantId: 1, merchantName: '星巴克', channel: 'all', settlementMonth: '2024-06', totalDiscountAmount: 10000, merchantCostAmount: 5000, platformFeeAmount: 800, daRenCommissionAmount: 500, settlementAmount: 3700, settlementMethod: 'rentDeduct', status: 'completed', settlementTime: '2024-07-05 10:00:00', operator: '财务A', documents: '["抖音结算账单.pdf", "美团结算账单.pdf", "中台核销台账.xlsx", "结算单.pdf"]', remark: '' },
  { id: 2, merchantId: 2, merchantName: '海底捞', channel: 'all', settlementMonth: '2024-06', totalDiscountAmount: 8000, merchantCostAmount: 3200, platformFeeAmount: 640, daRenCommissionAmount: 400, settlementAmount: 3760, settlementMethod: 'bankTransfer', status: 'processing', settlementTime: '', operator: '财务A', documents: '', remark: '待打款' }
]);

defineModule('coupon/code-pool', ['code', 'templateId', 'templateName', 'batchId', 'status', 'issueTime', 'issueChannel', 'issueOrderId', 'verifyTime', 'verifyShopId', 'revokeTime'], [
  { id: 1, code: 'HW20240710000001AB', templateId: 1, templateName: '50元代金券', batchId: 1, status: 'available', issueTime: '', issueChannel: '', issueOrderId: '', verifyTime: '', verifyShopId: '', revokeTime: '' },
  { id: 2, code: 'HW20240710000002CD', templateId: 1, templateName: '50元代金券', batchId: 1, status: 'issued', issueTime: '2024-07-10 14:00:00', issueChannel: 'douyin', issueOrderId: 'dy_order_001', verifyTime: '', verifyShopId: '', revokeTime: '' },
  { id: 3, code: 'HW20240710000003EF', templateId: 2, templateName: '8折优惠券', batchId: 2, status: 'verified', issueTime: '2024-07-10 15:00:00', issueChannel: 'meituan', issueOrderId: 'mt_order_001', verifyTime: '2024-07-10 15:30:00', verifyShopId: 1, revokeTime: '' },
  { id: 4, code: 'HW20240710000004GH', templateId: 1, templateName: '50元代金券', batchId: 1, status: 'revoked', issueTime: '2024-07-09 18:00:00', issueChannel: 'douyin', issueOrderId: 'dy_order_002', verifyTime: '2024-07-09 18:30:00', verifyShopId: 2, revokeTime: '2024-07-09 19:00:00' },
  { id: 5, code: 'HW20240710000005IJ', templateId: 3, templateName: '双人套餐团购券', batchId: 3, status: 'available', issueTime: '', issueChannel: '', issueOrderId: '', verifyTime: '', verifyShopId: '', revokeTime: '' }
]);

defineModule('channel/order-sync', ['channel', 'channelOrderId', 'channelCouponCode', 'internalCouponCode', 'templateId', 'memberId', 'memberName', 'phone', 'openid', 'amount', 'payTime', 'syncStatus', 'syncTime', 'failureReason', 'wechatCardSync'], [
  { id: 1, channel: 'douyin', channelOrderId: 'dy_order_001', channelCouponCode: 'DY1234567890', internalCouponCode: 'HW20240710000002CD', templateId: 1, memberId: 1, memberName: '张三', phone: '13800138001', openid: 'dy_openid_001', amount: 49.9, payTime: '2024-07-10 14:00:00', syncStatus: 'succeeded', syncTime: '2024-07-10 14:01:00', failureReason: '', wechatCardSync: true },
  { id: 2, channel: 'meituan', channelOrderId: 'mt_order_001', channelCouponCode: 'MT9876543210', internalCouponCode: 'HW20240710000003EF', templateId: 2, memberId: 2, memberName: '李四', phone: '13900139002', openid: 'mt_openid_001', amount: 88, payTime: '2024-07-10 15:00:00', syncStatus: 'succeeded', syncTime: '2024-07-10 15:01:00', failureReason: '', wechatCardSync: true },
  { id: 3, channel: 'xiaohongshu', channelOrderId: 'xhs_order_001', channelCouponCode: 'XHS1122334455', internalCouponCode: 'HW20240710000006KL', templateId: 1, memberId: 0, memberName: '', phone: '13700137003', openid: 'xhs_openid_001', amount: 49.9, payTime: '2024-07-10 16:00:00', syncStatus: 'processing', syncTime: '', failureReason: '', wechatCardSync: false }
]);

defineModule('member/oneid', ['memberId', 'phone', 'douyinOpenid', 'xiaohongshuOpenid', 'meituanOpenid', 'wechatOpenid', 'createdAt'], [
  { id: 1, memberId: 1, phone: '13800138001', douyinOpenid: 'dy_openid_001', xiaohongshuOpenid: '', meituanOpenid: '', wechatOpenid: 'wx_openid_001', createdAt: '2024-06-01 10:00:00' },
  { id: 2, memberId: 2, phone: '13900139002', douyinOpenid: '', xiaohongshuOpenid: '', meituanOpenid: 'mt_openid_001', wechatOpenid: 'wx_openid_002', createdAt: '2024-06-05 10:00:00' },
  { id: 3, memberId: 3, phone: '13700137003', douyinOpenid: '', xiaohongshuOpenid: 'xhs_openid_001', meituanOpenid: '', wechatOpenid: '', createdAt: '2024-07-10 16:00:00' }
]);

defineModule('member/join-scenes', ['name', 'channel', 'triggerType', 'priority', 'enabled'], [
  { id: 1, name: '抖音进页入会', channel: 'douyin', triggerType: 'enterPage', priority: 10, enabled: true },
  { id: 2, name: '购券完成入会', channel: 'all', triggerType: 'afterPurchase', priority: 1, enabled: true },
  { id: 3, name: '美团活动前置入会', channel: 'meituan', triggerType: 'beforeActivity', priority: 5, enabled: true },
  { id: 4, name: '小红书下单前置入会', channel: 'xiaohongshu', triggerType: 'beforeOrder', priority: 3, enabled: true }
]);

defineModule('verification/terminals', ['name', 'deviceId', 'type', 'shopId', 'shopName', 'status', 'lastSyncTime', 'offlineRecords'], [
  { id: 1, name: '总店核销平板1', deviceId: 'pad_001', type: 'tablet', shopId: 1, shopName: '总店', status: 'online', lastSyncTime: '2024-07-10 17:00:00', offlineRecords: 0 },
  { id: 2, name: '总店核销平板2', deviceId: 'pad_002', type: 'tablet', shopId: 1, shopName: '总店', status: 'online', lastSyncTime: '2024-07-10 17:00:00', offlineRecords: 0 },
  { id: 3, name: '分店核销平板', deviceId: 'pad_003', type: 'tablet', shopId: 2, shopName: '分店', status: 'offline', lastSyncTime: '2024-07-10 15:30:00', offlineRecords: 3 },
  { id: 4, name: '星巴克商户助手', deviceId: 'mp_001', type: 'miniProgram', shopId: 1, shopName: '总店', status: 'online', lastSyncTime: '2024-07-10 17:00:00', offlineRecords: 0 }
]);

defineModule('route/short-url', ['shortCode', 'originalUrl', 'channel', 'campaignId', 'campaignName', 'activityId', 'noteId', 'videoId', '达人Id', '达人Name', 'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'clickCount', 'conversionCount'], [
  { id: 1, shortCode: 'abc123', originalUrl: 'https://hengwei.com/activity/summer-sale', channel: 'douyin', campaignId: 1, campaignName: '夏日促销活动', activityId: 1, noteId: '', videoId: 'dy_video_001', 达人Id: 'dy_达人_001', 达人Name: '美食达人小王', utmSource: 'douyin', utmMedium: 'video', utmCampaign: 'summer-sale', utmContent: 'video-ad', clickCount: 1500, conversionCount: 120 },
  { id: 2, shortCode: 'def456', originalUrl: 'https://hengwei.com/coupon/50-off', channel: 'xiaohongshu', campaignId: 1, campaignName: '夏日促销活动', activityId: 1, noteId: 'xhs_note_001', videoId: '', 达人Id: 'xhs_达人_001', 达人Name: '探店达人小美', utmSource: 'xiaohongshu', utmMedium: 'note', utmCampaign: 'summer-sale', utmContent: 'note-ad', clickCount: 800, conversionCount: 65 },
  { id: 3, shortCode: 'ghi789', originalUrl: 'https://hengwei.com/shop/hot-pot', channel: 'meituan', campaignId: 2, campaignName: '火锅节活动', activityId: 2, noteId: '', videoId: '', 达人Id: '', 达人Name: '', utmSource: 'meituan', utmMedium: 'activity', utmCampaign: 'hot-pot-festival', utmContent: 'activity-page', clickCount: 2000, conversionCount: 180 }
]);

defineModule('analytics/bi', ['name', 'type', 'period', 'startDate', 'endDate', 'channels', 'generatedAt', 'status'], [
  { id: 1, name: '7月渠道总览', type: 'overview', period: 'month', startDate: '2024-07-01', endDate: '2024-07-31', channels: '["douyin", "xiaohongshu", "meituan"]', generatedAt: '2024-07-10 09:00:00', status: 'generated' },
  { id: 2, name: '7月会员注册分析', type: 'member', period: 'month', startDate: '2024-07-01', endDate: '2024-07-31', channels: '["douyin", "xiaohongshu", "meituan"]', generatedAt: '2024-07-10 09:30:00', status: 'generated' },
  { id: 3, name: '7月交易核销分析', type: 'transaction', period: 'month', startDate: '2024-07-01', endDate: '2024-07-31', channels: '["douyin", "xiaohongshu", "meituan"]', generatedAt: '2024-07-10 10:00:00', status: 'generated' },
  { id: 4, name: 'Q3投放营销复盘', type: 'marketing', period: 'quarter', startDate: '2024-07-01', endDate: '2024-09-30', channels: '["douyin", "xiaohongshu"]', generatedAt: '', status: 'generating' }
]);

// 公域运营
defineModule('public-domain/ads', ['name', 'channel', 'budget', 'leads', 'status'], [
  { name: '618抖音投放', channel: 'douyin', budget: 20000, leads: 1500, status: 'enabled' }
]);

// 地产积分
defineModule('property/points', ['owner', 'property', 'points', 'status'], [
  { owner: '业主王先生', property: 'A栋1001', points: 50000, status: 'enabled' }
]);

// 物品租借
defineModule('rental/items', ['name', 'deposit', 'rent', 'stock', 'status'], [
  { name: '雨伞', deposit: 20, rent: 0, stock: 50, status: 'enabled' },
  { name: '充电宝', deposit: 50, rent: 2, stock: 30, status: 'enabled' }
]);

defineModule('rental/records', ['item', 'member', 'outTime', 'returnTime', 'status'], [
  { item: '雨伞', member: '张三', outTime: '2024-06-01 10:00', returnTime: '2024-06-01 18:00', status: 'returned' }
]);

// 数据中心
defineModule('analytics/reports', ['name', 'type', 'period', 'status'], [
  { name: '月度会员增长报表', type: 'member', period: 'monthly', status: 'enabled' },
  { name: '周销售报表', type: 'sales', period: 'weekly', status: 'enabled' }
]);

// ===== 会员数字化（补充）=====
defineModule('member/benefits', ['name', 'levels', 'type', 'value', 'status'], [
  { name: '金卡免费停车2小时', levels: 'GOLD,DIAMOND', type: 'parking', value: '2小时', status: 'enabled' },
  { name: '会员日双倍积分', levels: 'SILVER,GOLD,DIAMOND', type: 'points', value: '2倍', status: 'enabled' }
]);

defineModule('member/profiles', ['member', 'tags', 'consumeTag', 'brandTag', 'pointsTag', 'lastActive'], [
  { member: '张三', tags: '高消费客户,活跃会员', consumeTag: '偏好餐饮、数码', brandTag: '星巴克、海底捞', pointsTag: '高频兑换', lastActive: '2024-06-05' },
  { member: '李四', tags: '流失预警', consumeTag: '偏好美妆', brandTag: '九木杂物社', pointsTag: '低频兑换', lastActive: '2024-05-01' }
]);

defineModule('member/tag-relations', ['member', 'tag', 'source', 'time'], [
  { member: '张三', tag: '高消费客户', source: 'auto', time: '2024-06-01' },
  { member: '李四', tag: '流失预警', source: 'auto', time: '2024-06-02' }
]);

// ===== 积分中心（补充）=====
defineModule('points/mall-orders', ['orderNo', 'member', 'goods', 'points', 'delivery', 'status'], [
  { orderNo: 'PM20240601001', member: '张三', goods: '星巴克咖啡券', points: 500, delivery: 'self', status: 'done' },
  { orderNo: 'PM20240601002', member: '李四', goods: '电影票2张', points: 1500, delivery: 'express', status: 'pending' }
]);

// ===== 智慧停车（补充）=====
defineModule('parking/lots', ['name', 'project', 'totalSpaces', 'availableSpaces', 'status'], [
  { name: '凯德壹中心停车场', project: '凯德壹中心', totalSpaces: 1800, availableSpaces: 320, status: 'enabled' },
  { name: '碧湘楚巷停车场', project: '碧湘楚巷', totalSpaces: 400, availableSpaces: 80, status: 'enabled' }
]);

defineModule('parking/rules', ['name', 'freeMinutes', 'pricePerHour', 'capAmount', 'status'], [
  { name: '标准计费', freeMinutes: 15, pricePerHour: 5, capAmount: 50, status: 'enabled' },
  { name: '会员优惠计费', freeMinutes: 30, pricePerHour: 4, capAmount: 40, status: 'enabled' }
]);

// ===== 商户营销（补充）=====
defineModule('merchant/verification', ['merchant', 'type', 'count', 'amount', 'date'], [
  { merchant: '海底捞', type: 'coupon', count: 128, amount: 3840, date: '2024-06-01' },
  { merchant: '星巴克', type: 'points', count: 56, amount: 2800, date: '2024-06-01' }
]);

defineModule('merchant/coupon-issue', ['merchant', 'template', 'member', 'count', 'time'], [
  { merchant: '海底捞', template: '满200减30', member: '张三', count: 1, time: '2024-06-01 10:00' }
]);

// ===== 数据中心（补充）=====
defineModule('analytics/overview', ['name', 'value', 'mom', 'period'], [
  { name: '会员总数', value: 12580, mom: '+5.2%', period: '本月' },
  { name: '今日订单', value: 326, mom: '+12.0%', period: '今日' },
  { name: '今日销售额', value: 25800, mom: '+8.5%', period: '今日' },
  { name: '积分发放', value: 156000, mom: '+3.1%', period: '本月' }
]);

// ===== 在线商城（补充）=====
defineModule('shop/home-config', ['name', 'pageType', 'components', 'sort', 'status'], [
  { name: '618商城首页', pageType: 'home', components: '{"banner":["618大促banner"],"categories":["服装","数码","美妆"],"groups":["秒杀","拼团","推荐"]}', sort: 1, status: 'enabled' }
]);

defineModule('shop/bottom-menu', ['name', 'icon', 'link', 'sort', 'status'], [
  { name: '首页', icon: 'home', link: '/pages/home', sort: 1, status: 'enabled' },
  { name: '分类', icon: 'category', link: '/pages/category', sort: 2, status: 'enabled' },
  { name: '购物车', icon: 'cart', link: '/pages/cart', sort: 3, status: 'enabled' },
  { name: '我的', icon: 'user', link: '/pages/member', sort: 4, status: 'enabled' }
]);

defineModule('shop/brands', ['name', 'logo', 'category', 'phone', 'status'], [
  { name: '星巴克', logo: '', category: '餐饮', phone: '400-1234-5678', status: 'enabled' },
  { name: 'Nike', logo: '', category: '运动', phone: '400-8765-4321', status: 'enabled' }
]);

defineModule('shop/returns', ['returnNo', 'orderNo', 'member', 'amount', 'status', 'time'], [
  { returnNo: 'R20240601001', orderNo: 'O20240601001', member: '张三', amount: 99, status: 'pending', time: '2024-06-02 10:00' }
]);

// ===== 营销中心（补充）=====
defineModule('activity/signups', ['name', 'signupTime', 'member', 'count', 'status'], [
  { name: '亲子DIY活动', signupTime: '2024-06-01 09:00', member: '张三', count: 2, status: 'pending' }
]);

defineModule('activity/checkin', ['name', 'rewardType', 'rewardValue', 'period', 'status'], [
  { name: '每日签到', rewardType: 'points', rewardValue: '5', period: 'daily', status: 'enabled' },
  { name: '周末签到送券', rewardType: 'coupon', rewardValue: '停车券1小时', period: 'weekly', status: 'enabled' }
]);

defineModule('marketing/referral', ['name', 'referrerReward', 'inviteeReward', 'status'], [
  { name: '邀请好友得积分', referrerReward: '100积分', inviteeReward: '50积分+新人券', status: 'enabled' }
]);

defineModule('marketing/new-member', ['name', 'rewards', 'validDays', 'status'], [
  { name: '新人礼包', rewards: '停车券1小时+100积分+10元代金券', validDays: 30, status: 'enabled' }
]);

defineModule('marketing/help-coupon', ['name', 'template', 'needHelp', 'helped', 'status'], [
  { name: '邀请3人得奶茶券', template: '奶茶免单券', needHelp: 3, helped: 2, status: 'enabled' }
]);

defineModule('marketing/word-coupon', ['name', 'word', 'template', 'claimed', 'status'], [
  { name: '618社群口令券', word: 'HENGWEI618', template: '满100减20', claimed: 89, status: 'enabled' }
]);

defineModule('marketing/games', ['name', 'type', 'rewards', 'plays', 'status'], [
  { name: '618大转盘', type: 'wheel', rewards: '积分/停车券/代金券', plays: 1250, status: 'enabled' }
]);

defineModule('marketing/surveys', ['title', 'participants', 'reward', 'status'], [
  { title: '会员满意度调查', participants: 320, reward: '20积分', status: 'enabled' }
]);

defineModule('marketing/votes', ['title', 'options', 'totalVotes', 'status'], [
  { title: '最受欢迎餐饮品牌', options: '["海底捞","费大厨","星巴克"]', totalVotes: 580, status: 'enabled' }
]);

defineModule('marketing/countdown', ['name', 'goods', 'price', 'originalPrice', 'startTime', 'endTime', 'status'], [
  { name: '限时购-AirPods', goods: '蓝牙耳机', price: 199, originalPrice: 299, startTime: '2024-06-18 10:00', endTime: '2024-06-18 12:00', status: 'enabled' }
]);

defineModule('marketing/pre-sale', ['goods', 'deposit', 'finalPayment', 'preTime', 'deliveryTime', 'status'], [
  { goods: '新款T恤', deposit: 20, finalPayment: 79, preTime: '2024-06-01~2024-06-10', deliveryTime: '2024-06-15', status: 'enabled' }
]);

defineModule('marketing/bargain', ['name', 'goods', 'originalPrice', 'floorPrice', 'started', 'status'], [
  { name: '砍价免费喝奶茶', goods: '奶茶', originalPrice: 18, floorPrice: 0, started: 45, status: 'enabled' }
]);

defineModule('marketing/lucky-draw', ['name', 'prize', 'participants', 'drawTime', 'status'], [
  { name: '众筹抽iPhone', prize: 'iPhone15', participants: 1280, drawTime: '2024-06-20 20:00', status: 'enabled' }
]);

defineModule('marketing/blind-box', ['name', 'price', 'prizes', 'opened', 'status'], [
  { name: '618惊喜盲盒', price: 9.9, prizes: '咖啡券/代金券/积分', opened: 320, status: 'enabled' }
]);

defineModule('marketing/count-cards', ['name', 'times', 'price', 'merchants', 'status'], [
  { name: '餐饮5次卡', times: 5, price: 199, merchants: '海底捞,费大厨', status: 'enabled' }
]);

defineModule('marketing/checkin-coupon', ['name', 'location', 'template', 'claimed', 'status'], [
  { name: '到店打卡领券', location: '商场L1中庭', template: '满50减10', claimed: 156, status: 'enabled' }
]);

defineModule('marketing/douyin-coupon', ['name', 'douyinCode', 'reward', 'exchanged', 'status'], [
  { name: '抖音99元双人餐', douyinCode: 'DY20240001', reward: '海底捞双人套餐', exchanged: 78, status: 'enabled' }
]);

// ===== 地产积分（补充）=====
defineModule('property/tasks', ['name', 'category', 'points', 'limit', 'status'], [
  { name: '发言建议', category: '建言', points: 50, limit: '20次/月/户', status: 'enabled' },
  { name: '推荐签约', category: '推荐', points: 5000, limit: '以网签为准', status: 'enabled' }
]);

defineModule('property/activities', ['name', 'owner', 'time', 'status'], [
  { name: '业主暖场活动', owner: '业主王先生', time: '2024-06-01 14:00', status: 'approved' }
]);

// ===== 装修管理 =====
defineModule('decoration/pages', ['name', 'pageType', 'components', 'status', 'publishedAt', 'previewToken'], [
  { name: '商城首页', pageType: 'home', components: '[]', status: 'draft', publishedAt: null, previewToken: 'preview_abc123' }
]);

defineModule('decoration/versions', ['pageId', 'version', 'components', 'createdAt', 'operator'], [
  { pageId: 1, version: 'v1.0', components: '[]', createdAt: '2024-06-01 10:00', operator: 'admin' }
]);

defineModule('decoration/templates', ['name', 'pageType', 'components', 'description'], [
  { name: '商城首页模板', pageType: 'home', components: '[{"type":"banner","config":{"items":[]}},{"type":"navGrid","config":{"items":[]}},{"type":"goodsList","config":{}}]', description: '适合商城首页的标准布局模板' }
]);

defineModule('decoration/services', ['name', 'icon', 'link', 'sort', 'status'], [
  { name: '停车缴费', icon: 'parking', link: '/pages/parking', sort: 1, status: 'enabled' },
  { name: '快速积分', icon: 'points', link: '/pages/points', sort: 2, status: 'enabled' },
  { name: '珑珠码', icon: 'code', link: '/pages/code', sort: 3, status: 'enabled' },
  { name: '会员权益', icon: 'member', link: '/pages/member', sort: 4, status: 'enabled' },
  { name: '联系客服', icon: 'service', link: '/pages/service', sort: 5, status: 'enabled' },
  { name: '自助寻车', icon: 'findcar', link: '/pages/findcar', sort: 6, status: 'enabled' },
  { name: '我要打车', icon: 'taxi', link: '/pages/taxi', sort: 7, status: 'enabled' },
  { name: '我要充电', icon: 'charge', link: '/pages/charge', sort: 8, status: 'enabled' },
  { name: '宠物服务', icon: 'pet', link: '/pages/pet', sort: 9, status: 'enabled' }
]);

defineModule('decoration/icons', ['name', 'icon', 'category'], [
  { name: '停车', icon: '🚗', category: 'service' },
  { name: '积分', icon: '⭐', category: 'service' },
  { name: '码', icon: '🔢', category: 'service' },
  { name: '会员', icon: '👤', category: 'service' },
  { name: '客服', icon: '💬', category: 'service' },
  { name: '寻车', icon: '🔍', category: 'service' },
  { name: '打车', icon: '🚕', category: 'service' },
  { name: '充电', icon: '⚡', category: 'service' },
  { name: '宠物', icon: '🐾', category: 'service' },
  { name: '全部', icon: '☰', category: 'service' }
]);

// ===== 千人千面 =====
defineModule('decoration/audience', ['name', 'conditions', 'description'], [
  { name: '金卡会员', conditions: '{"level":["GOLD","DIAMOND"]}', description: '金卡及以上会员' },
  { name: '新用户', conditions: '{"daysSinceRegister":[0,30]}', description: '注册30天内的新用户' },
  { name: '高消费人群', conditions: '{"totalConsume":[10000,"inf"]}', description: '累计消费1万以上' }
]);

defineModule('decoration/personalization', ['pageId', 'audienceId', 'components', 'status'], [
  { pageId: 1, audienceId: 1, components: '[{"type":"banner","config":{"items":[{"image":"","link":"","title":"金卡专享"}]}}]', status: 'enabled' }
]);

// ===== 数据聚合 =====
defineModule('decoration/events', ['name', 'type', 'date', 'location', 'image', 'status'], [
  { name: 'For kids亲子运动会', type: 'activity', date: '2024-07-05', location: 'A区1-3门外广场', image: '', status: 'enabled' },
  { name: '新店开业-魏斯理', type: 'opening', date: '2024-07-01', location: 'L1层', image: '', status: 'enabled' },
  { name: '新店入驻-金粒门', type: 'opening', date: '2024-07-15', location: 'B2层', image: '', status: 'enabled' }
]);

defineModule('decoration/floors', ['name', 'code', 'sort', 'status'], [
  { name: '全部楼层', code: 'ALL', sort: 0, status: 'enabled' },
  { name: '1F', code: '1F', sort: 1, status: 'enabled' },
  { name: '2F', code: '2F', sort: 2, status: 'enabled' },
  { name: '3F', code: '3F', sort: 3, status: 'enabled' },
  { name: '4F', code: '4F', sort: 4, status: 'enabled' },
  { name: '5F', code: '5F', sort: 5, status: 'enabled' },
  { name: 'B1', code: 'B1', sort: 6, status: 'enabled' }
]);

// ===== 系统管理（补充）=====
defineModule('system/logs', ['operator', 'module', 'action', 'ip', 'time'], [
  { operator: 'admin', module: '会员档案', action: '新增', ip: '192.168.1.10', time: '2024-06-01 09:00' },
  { operator: 'li', module: '营销活动', action: '编辑', ip: '192.168.1.11', time: '2024-06-01 10:30' }
]);

defineModule('system/menus', ['name', 'path', 'icon', 'parentId', 'sort', 'status'], [
  { name: '会员数字化', path: '/member', icon: 'user', parentId: 0, sort: 1, status: 'enabled' },
  { name: '会员档案', path: '/crud/member-list', icon: '', parentId: 1, sort: 1, status: 'enabled' }
]);

// AI小票
defineModule('ai/receipt-audit', ['member', 'amount', 'aiAmount', 'aiStatus', 'auditStatus', 'pointsIssued', 'merchant', 'receiptImage', 'submitTime', 'auditRemark'], [
  { member: '张三', amount: 258, aiAmount: 258, aiStatus: 'success', auditStatus: 'approved', pointsIssued: 258, merchant: '星巴克', submitTime: '2024-07-10' },
  { member: '李四', amount: 89, aiAmount: 89, aiStatus: 'success', auditStatus: 'pending', pointsIssued: 0, merchant: '海底捞', submitTime: '2024-07-11' },
  { member: '王五', amount: 1500, aiAmount: 0, aiStatus: 'failed', auditStatus: 'pending', pointsIssued: 0, merchant: '优衣库', submitTime: '2024-07-12' },
]);
defineModule('ai/receipt-rules', ['name', 'pointsPerYuan', 'maxPoints', 'dailyLimit', 'applicableMerchant', 'minAmount', 'status'], [
  { name: '全场通用规则', pointsPerYuan: 1, maxPoints: 500, dailyLimit: 3, applicableMerchant: '', minAmount: 10, status: 'enabled' },
  { name: '餐饮专属规则', pointsPerYuan: 2, maxPoints: 300, dailyLimit: 5, applicableMerchant: '海底捞', minAmount: 50, status: 'enabled' },
]);

// 广告推广
defineModule('ad/config', ['name', 'type', 'position', 'imageUrl', 'linkUrl', 'startTime', 'endTime', 'sort', 'targetGroup', 'status'], [
  { name: '暑期大促Banner', type: 'banner', position: 'home', imageUrl: '/ads/summer-banner.jpg', linkUrl: '/activity/summer', startTime: '2024-07-01', endTime: '2024-08-31', sort: 1, targetGroup: 'all', status: 'enabled' },
  { name: '新会员弹窗', type: 'popup', position: 'home', imageUrl: '/ads/new-member.jpg', linkUrl: '/coupon/new-member', startTime: '2024-07-01', endTime: '2024-12-31', sort: 1, targetGroup: 'new', status: 'enabled' },
  { name: '启动页广告', type: 'splash', position: 'home', imageUrl: '/ads/splash-brand.jpg', linkUrl: '/brand', startTime: '2024-07-01', endTime: '2024-07-31', sort: 1, targetGroup: 'all', status: 'enabled' },
]);
defineModule('ad/precise', ['name', 'adId', 'targetGroup', 'tags', 'impressions', 'clicks', 'startTime', 'endTime', 'status'], [
  { name: '高消费会员定向投放', adId: '暑期大促Banner', targetGroup: 'custom', tags: '高消费,金卡会员', impressions: 5280, clicks: 432, startTime: '2024-07-01', endTime: '2024-08-31', status: 'enabled' },
  { name: '沉睡会员唤醒投放', adId: '新会员弹窗', targetGroup: 'inactive', tags: '', impressions: 3200, clicks: 156, startTime: '2024-07-01', endTime: '2024-08-31', status: 'enabled' },
]);

// 客服管理
defineModule('cs/knowledge', ['category', 'question', 'answer', 'keywords', 'sort', 'status'], [
  { category: 'member', question: '如何注册会员？', answer: '进入小程序点击"我的"即可快速注册成为会员', keywords: '注册,会员,加入', sort: 1, status: 'enabled' },
  { category: 'points', question: '积分怎么获取？', answer: '消费积分、签到积分、活动积分等多种方式', keywords: '积分,获取,赚取', sort: 2, status: 'enabled' },
  { category: 'parking', question: '停车费怎么交？', answer: '小程序"智慧停车"模块可直接缴费', keywords: '停车,缴费,停车费', sort: 3, status: 'enabled' },
]);
defineModule('cs/auto-reply', ['name', 'keyword', 'replyContent', 'matchType', 'priority', 'status'], [
  { name: '营业时间回复', keyword: '营业时间', replyContent: '商场营业时间为10:00-22:00，欢迎光临！', matchType: 'fuzzy', priority: 1, status: 'enabled' },
  { name: 'WiFi回复', keyword: 'WiFi|wifi|无线网', replyContent: '商场免费WiFi：HW-Mall，密码：88888888', matchType: 'regex', priority: 2, status: 'enabled' },
]);
defineModule('cs/ai-training', ['name', 'corpusCount', 'modelVersion', 'trainingParams', 'status', 'accuracy', 'updateTime'], [
  { name: '商业体行业语料训练', corpusCount: 5200, modelVersion: 'v3.2', trainingParams: '{"epochs": 50, "lr": 0.001}', status: 'completed', accuracy: 87.5, updateTime: '2024-07-01' },
  { name: '停车场景语料补充', corpusCount: 800, modelVersion: 'v3.3', trainingParams: '{"epochs": 30, "lr": 0.002}', status: 'pending', accuracy: 0, updateTime: '' },
]);
defineModule('cs/staff', ['name', 'staffNo', 'workTime', 'maxSessions', 'transferRule', 'skillTags', 'onlineStatus', 'status'], [
  { name: '王小美', staffNo: 'CS001', workTime: '09:00-18:00', maxSessions: 8, transferRule: 'idle', skillTags: '会员,积分', onlineStatus: 'online', status: 'enabled' },
  { name: '李大强', staffNo: 'CS002', workTime: '14:00-22:00', maxSessions: 6, transferRule: 'skill', skillTags: '停车,优惠券', onlineStatus: 'offline', status: 'enabled' },
]);

// 搜索管理
defineModule('search/hotwords', ['word', 'searchCount', 'type', 'sort', 'status'], [
  { word: '停车缴费', searchCount: 12580, type: 'auto', sort: 1, status: 'enabled' },
  { word: '积分兑换', searchCount: 8920, type: 'auto', sort: 2, status: 'enabled' },
  { word: '优惠券', searchCount: 6540, type: 'auto', sort: 3, status: 'enabled' },
  { word: '海底捞', searchCount: 4320, type: 'auto', sort: 4, status: 'enabled' },
  { word: '暑期活动', searchCount: 0, type: 'manual', sort: 5, status: 'enabled' },
]);
defineModule('search/scope', ['moduleName', 'searchFields', 'weight', 'status'], [
  { moduleName: 'merchant', searchFields: 'name,category,brand', weight: 10, status: 'enabled' },
  { moduleName: 'goods', searchFields: 'name,category,brand,description', weight: 8, status: 'enabled' },
  { moduleName: 'activity', searchFields: 'name,type,description', weight: 6, status: 'enabled' },
  { moduleName: 'coupon', searchFields: 'name,type,description', weight: 5, status: 'enabled' },
  { moduleName: 'brand', searchFields: 'name,category', weight: 4, status: 'enabled' },
]);

// 停车券管理
defineModule('parking/coupons', ['name', 'type', 'value', 'issueType', 'exchangePoints', 'parkingLot', 'validDays', 'totalQuota', 'usedQuota', 'status'], [
  { name: '1小时停车券', type: 'time', value: 1, issueType: 'auto', exchangePoints: 0, parkingLot: 'B1停车场', validDays: 30, totalQuota: 1000, usedQuota: 356, status: 'enabled' },
  { name: '2小时停车券', type: 'time', value: 2, issueType: 'exchange', exchangePoints: 200, parkingLot: 'B1停车场', validDays: 30, totalQuota: 500, usedQuota: 128, status: 'enabled' },
  { name: '5元停车抵扣券', type: 'amount', value: 5, issueType: 'manual', exchangePoints: 0, parkingLot: 'B2停车场', validDays: 7, totalQuota: 2000, usedQuota: 890, status: 'enabled' },
  { name: 'VIP全免停车券', type: 'free', value: 0, issueType: 'auto', exchangePoints: 0, parkingLot: 'B1停车场', validDays: 1, totalQuota: 100, usedQuota: 23, status: 'enabled' },
]);

// 公域运营增强
defineModule('channel/douyin-member', ['syncType', 'douyinOpenid', 'member', 'syncStatus', 'syncTime', 'remark'], [
  { syncType: 'register', douyinOpenid: 'dy_user_001', member: '张三', syncStatus: 'success', syncTime: '2024-07-10', remark: '抖音引流注册' },
  { syncType: 'verify', douyinOpenid: 'dy_user_002', member: '李四', syncStatus: 'success', syncTime: '2024-07-11', remark: '核销自动积分+50' },
  { syncType: 'info', douyinOpenid: 'dy_user_003', member: '王五', syncStatus: 'pending', syncTime: '', remark: '信息同步待处理' },
]);
defineModule('channel/meituan-config', ['name', 'appId', 'appSecret', 'callbackUrl', 'merchantCount', 'status'], [
  { name: '美团团购配置', appId: 'mt_app_1a2b3c', appSecret: '***', callbackUrl: 'https://api.example.com/meituan/callback', merchantCount: 12, status: 'enabled' },
]);
defineModule('channel/meituan-verify', ['couponCode', 'merchant', 'verifyType', 'verifyStatus', 'benefitIssued', 'verifyTime', 'remark'], [
  { couponCode: 'MT20240710001', merchant: '星巴克', verifyType: 'verify', verifyStatus: 'success', benefitIssued: 'yes', verifyTime: '2024-07-10', remark: '核销后自动发放50积分' },
  { couponCode: 'MT20240710002', merchant: '海底捞', verifyType: 'verify', verifyStatus: 'revoked', benefitIssued: 'no', verifyTime: '2024-07-11', remark: '用户退款已撤销' },
]);
defineModule('channel/meituan-orders', ['meituanOrderNo', 'merchant', 'goodsName', 'amount', 'syncStatus', 'orderStatus', 'syncTime'], [
  { meituanOrderNo: 'MT_ORD_001', merchant: '星巴克', goodsName: '大杯拿铁', amount: 38, syncStatus: 'synced', orderStatus: 'used', syncTime: '2024-07-10' },
  { meituanOrderNo: 'MT_ORD_002', merchant: '海底捞', goodsName: '4人套餐', amount: 298, syncStatus: 'synced', orderStatus: 'paid', syncTime: '2024-07-11' },
  { meituanOrderNo: 'MT_ORD_003', merchant: '优衣库', goodsName: '夏装满减', amount: 0, syncStatus: 'failed', orderStatus: 'unpaid', syncTime: '' },
]);

// ===== 第二阶段 - 多商业体架构 =====
defineModule('system/projects', ['name', 'code', 'type', 'dataIsolated', 'description', 'status'], [
  { name: '恒伟商业广场', code: 'HW-MALL', type: 'mall', dataIsolated: 'yes', description: '总部商业广场项目', status: 'enabled' },
  { name: '恒伟奥特莱斯', code: 'HW-OUTLET', type: 'outlet', dataIsolated: 'yes', description: '奥特莱斯项目', status: 'enabled' },
  { name: '恒伟城市综合体', code: 'HW-MIXED', type: 'mixed', dataIsolated: 'yes', description: '城市综合体项目', status: 'disabled' },
]);
defineModule('points/cross-project', ['member', 'mainProject', 'mergeProject', 'mergePoints', 'status', 'mergeTime'], [
  { member: '张三', mainProject: '恒伟商业广场', mergeProject: '恒伟奥特莱斯', mergePoints: 500, status: 'merged', mergeTime: '2024-07-01' },
  { member: '李四', mainProject: '恒伟商业广场', mergeProject: '恒伟城市综合体', mergePoints: 200, status: 'pending', mergeTime: '' },
]);
defineModule('analytics/cross-project', ['projectA', 'projectB', 'dimension', 'period', 'createTime'], [
  { projectA: '恒伟商业广场', projectB: '恒伟奥特莱斯', dimension: 'member', period: '30d', createTime: '2024-07-10' },
]);

// 地产对接扩展
defineModule('property/auth', ['roleName', 'userName', 'scope', 'status'], [
  { roleName: '地产运营', userName: '张地产', scope: 'content,member,task', status: 'enabled' },
  { roleName: '地产审核员', userName: '李审核', scope: 'task,analytics', status: 'enabled' },
]);
defineModule('property/content', ['type', 'title', 'imageUrl', 'linkUrl', 'sort', 'status', 'updateTime'], [
  { type: 'banner', title: '夏日购房节', imageUrl: '/property/summer-banner.jpg', linkUrl: '/property/summer', sort: 1, status: 'enabled', updateTime: '2024-07-01' },
  { type: 'benefit', title: '业主专享权益', imageUrl: '/property/benefit.jpg', linkUrl: '/property/benefits', sort: 2, status: 'enabled', updateTime: '2024-07-05' },
]);
defineModule('property/owners', ['name', 'phone', 'memberId', 'property', 'community', 'benefits', 'status'], [
  { name: '王业主', phone: '13800001111', memberId: 'M001', property: 'A栋1单元501', community: '恒伟花园', benefits: '专属停车优惠,积分倍率1.5倍', status: 'enabled' },
  { name: '赵业主', phone: '13800002222', memberId: 'M002', property: 'B栋2单元301', community: '恒伟花园', benefits: '专属停车优惠', status: 'enabled' },
]);
defineModule('property/task-audit', ['taskName', 'applicant', 'points', 'evidence', 'auditStatus', 'auditor', 'applyTime', 'auditRemark'], [
  { taskName: '朋友圈转发', applicant: '王业主', points: 50, evidence: '/upload/screenshot1.jpg', auditStatus: 'approved', auditor: '李审核', applyTime: '2024-07-08', auditRemark: '审核通过' },
  { taskName: '推荐到访', applicant: '赵业主', points: 100, evidence: '/upload/screenshot2.jpg', auditStatus: 'pending', auditor: '', applyTime: '2024-07-10', auditRemark: '' },
]);
defineModule('property/notify', ['name', 'trigger', 'channel', 'templateId', 'content', 'status'], [
  { name: '积分审核通过通知', trigger: 'audit_pass', channel: 'wechat,sms', templateId: 'TPL_001', content: '您好{业主名}，您的积分任务"{任务名}"已审核通过，获得{积分}积分', status: 'enabled' },
]);
defineModule('property/goods', ['name', 'points', 'stock', 'community', 'imageUrl', 'description', 'exchangeRule', 'status'], [
  { name: '品牌家电兑换券', points: 5000, stock: 20, community: '恒伟花园', imageUrl: '/goods/appliance.jpg', description: '品牌家电兑换券', exchangeRule: '每户限兑1次', status: 'enabled' },
  { name: '物业费抵扣券', points: 2000, stock: 50, community: '', imageUrl: '/goods/property-fee.jpg', description: '可抵扣100元物业费', exchangeRule: '不限次数', status: 'enabled' },
]);
defineModule('property/community-scope', ['activityName', 'scopeType', 'communities', 'status'], [
  { activityName: '夏日购房节', scopeType: 'all', communities: '', status: 'enabled' },
  { activityName: '恒伟花园专属活动', scopeType: 'specific', communities: '恒伟花园,恒伟名苑', status: 'enabled' },
]);
defineModule('property/multi-bind', ['member', 'phone', 'communities', 'propertyCount', 'status'], [
  { member: '王业主', phone: '13800001111', communities: '恒伟花园,恒伟名苑', propertyCount: 2, status: 'enabled' },
  { member: '赵业主', phone: '13800002222', communities: '恒伟花园', propertyCount: 1, status: 'enabled' },
]);

// 商户导览增强
defineModule('merchant/locations', ['merchant', 'floor', 'positionNo', 'navMap', 'status'], [
  { merchant: '星巴克', floor: '1F', positionNo: '1F-A01', navMap: '/maps/1f.svg', status: 'enabled' },
  { merchant: '海底捞', floor: '3F', positionNo: '3F-B05', navMap: '/maps/3f.svg', status: 'enabled' },
  { merchant: '优衣库', floor: '2F', positionNo: '2F-A03', navMap: '/maps/2f.svg', status: 'enabled' },
]);
defineModule('merchant/floor-maps', ['floor', 'mapUrl', 'markedShops', 'description', 'status'], [
  { floor: '1F', mapUrl: '/maps/1f.svg', markedShops: 15, description: '一楼为精品零售区', status: 'enabled' },
  { floor: '2F', mapUrl: '/maps/2f.svg', markedShops: 12, description: '二楼为服装区', status: 'enabled' },
  { floor: '3F', mapUrl: '/maps/3f.svg', markedShops: 10, description: '三楼为餐饮区', status: 'enabled' },
]);
defineModule('merchant/food-config', ['merchant', 'cuisineType', 'recommendDishes', 'avgCost', 'promo', 'status'], [
  { merchant: '海底捞', cuisineType: 'hotpot', recommendDishes: '番茄锅底,虾滑,毛肚', avgCost: 120, promo: '午市8折', status: 'enabled' },
  { merchant: '星巴克', cuisineType: 'other', recommendDishes: '拿铁,星冰乐', avgCost: 40, promo: '', status: 'enabled' },
]);

// 积分消费比例配置
defineModule('points/consumption-ratio', ['name', 'scene', 'pointsPerYuan', 'maxDeductRate', 'minPoints', 'status'], [
  { name: '商场消费抵扣', scene: 'mall', pointsPerYuan: 10, maxDeductRate: 30, minPoints: 100, status: 'enabled' },
  { name: '地产消费抵扣', scene: 'property', pointsPerYuan: 5, maxDeductRate: 50, minPoints: 50, status: 'enabled' },
  { name: '停车缴费抵扣', scene: 'parking', pointsPerYuan: 10, maxDeductRate: 100, minPoints: 10, status: 'enabled' },
]);

// 商家信息/通知管理
defineModule('merchant/info', ['name', 'industry', 'contractExpiry', 'contact', 'dataSource', 'status'], [
  { name: '星巴克', industry: 'food', contractExpiry: '2025-12-31', contact: '0755-88880001', dataSource: 'liebao', status: 'enabled' },
  { name: '海底捞', industry: 'food', contractExpiry: '2025-06-30', contact: '0755-88880002', dataSource: 'liebao', status: 'enabled' },
  { name: '优衣库', industry: 'clothing', contractExpiry: '2026-03-31', contact: '0755-88880003', dataSource: 'manual', status: 'enabled' },
]);
defineModule('merchant/contracts-mgmt', ['merchant', 'contractNo', 'type', 'startDate', 'endDate', 'remindDays', 'remark'], [
  { merchant: '星巴克', contractNo: 'CT-2024-001', type: 'lease', startDate: '2023-01-01', endDate: '2025-12-31', remindDays: 30, remark: '标准租赁合同' },
  { merchant: '海底捞', contractNo: 'CT-2024-002', type: 'lease', startDate: '2023-07-01', endDate: '2025-06-30', remindDays: 60, remark: '含推广条款' },
]);
defineModule('merchant/notify-template', ['name', 'type', 'channel', 'content', 'status'], [
  { name: '活动通知模板', type: 'activity', channel: 'applet,sms', content: '尊敬的{商家名}，{活动名}即将开始，请做好准备。', status: 'enabled' },
  { name: '系统通知模板', type: 'system', channel: 'applet', content: '系统将于{日期}进行维护，预计影响{时长}。', status: 'enabled' },
]);
defineModule('merchant/notify-logs', ['merchant', 'type', 'channel', 'content', 'sendStatus', 'sendTime'], [
  { merchant: '星巴克', type: 'activity', channel: '小程序消息', content: '暑期促销活动即将开始', sendStatus: 'success', sendTime: '2024-07-01' },
  { merchant: '海底捞', type: 'system', channel: '短信', content: '系统维护通知', sendStatus: 'success', sendTime: '2024-07-05' },
]);

// 小程序装修增强
defineModule('content/decoration-preview', ['pageName', 'previewType', 'decorationId', 'createTime'], [
  { pageName: '首页装修V2', previewType: 'qr', decorationId: 'DEC_001', createTime: '2024-07-10' },
]);
defineModule('content/decoration-templates', ['name', 'pageType', 'switchCondition', 'switchRule', 'status'], [
  { name: '夏日主题模板', pageType: 'home', switchCondition: 'time', switchRule: '7月1日-8月31日', status: 'enabled' },
  { name: '默认模板', pageType: 'home', switchCondition: 'manual', switchRule: '', status: 'disabled' },
]);
defineModule('content/decoration-history', ['pageName', 'version', 'operator', 'publishTime', 'status', 'snapshot'], [
  { pageName: '首页', version: 'v2.3', operator: 'admin', publishTime: '2024-07-10', status: 'current', snapshot: '{}' },
  { pageName: '首页', version: 'v2.2', operator: 'admin', publishTime: '2024-06-15', status: 'archived', snapshot: '{}' },
]);
defineModule('content/decoration-qrcode', ['pageName', 'qrcodeUrl', 'pageLink', 'scene', 'createTime'], [
  { pageName: '首页', qrcodeUrl: '/qrcode/home.png', pageLink: 'pages/index/index', scene: 'from=poster', createTime: '2024-07-10' },
  { pageName: '积分商城', qrcodeUrl: '/qrcode/points.png', pageLink: 'pages/points/index', scene: 'from=share', createTime: '2024-07-10' },
]);
defineModule('points/mall-decoration', ['sectionName', 'sectionType', 'sort', 'displayCount', 'status'], [
  { sectionName: '为您推荐', sectionType: 'recommend', sort: 1, displayCount: 6, status: 'enabled' },
  { sectionName: '热门兑换', sectionType: 'hot', sort: 2, displayCount: 8, status: 'enabled' },
  { sectionName: '浏览轨迹', sectionType: 'history', sort: 3, displayCount: 4, status: 'enabled' },
]);

// 核销增强
defineModule('verification/export', ['name', 'scope', 'merchant', 'startDate', 'endDate', 'verifyType', 'fileFormat', 'recordCount', 'status', 'createTime'], [
  { name: '7月核销报表', scope: 'time', merchant: '', startDate: '2024-07-01', endDate: '2024-07-31', verifyType: '', fileFormat: 'excel', recordCount: 1520, status: 'completed', createTime: '2024-08-01' },
  { name: '星巴克核销明细', scope: 'merchant', merchant: '星巴克', startDate: '', endDate: '', verifyType: 'coupon', fileFormat: 'excel', recordCount: 356, status: 'completed', createTime: '2024-07-15' },
]);
defineModule('verification/points-audit', ['merchant', 'verifyType', 'points', 'member', 'auditStatus', 'verifyTime', 'auditRemark'], [
  { merchant: '星巴克', verifyType: 'coupon', points: 50, member: '张三', auditStatus: 'approved', verifyTime: '2024-07-10', auditRemark: '正常核销' },
  { merchant: '海底捞', verifyType: 'coupon', points: 200, member: '李四', auditStatus: 'pending', verifyTime: '2024-07-12', auditRemark: '' },
  { merchant: '优衣库', verifyType: 'goods', points: 500, member: '王五', auditStatus: 'rejected', verifyTime: '2024-07-11', auditRemark: '异常核销，积分退回' },
]);

// 系统安全
defineModule('security/network', ['name', 'type', 'level', 'rule', 'whiteList', 'status'], [
  { name: 'Web应用防火墙', type: 'firewall', level: 'high', rule: '仅允许HTTPS访问', whiteList: '10.0.0.0/8', status: 'enabled' },
  { name: 'DDoS基础防护', type: 'ddos', level: 'medium', rule: '单IP限流1000QPS', whiteList: '', status: 'enabled' },
  { name: 'IPS入侵防御', type: 'ips', level: 'high', rule: '拦截已知攻击特征', whiteList: '', status: 'enabled' },
]);
defineModule('security/data', ['name', 'type', 'description', 'encryptAlgorithm', 'backupCycle', 'status'], [
  { name: '传输加密策略', type: 'encrypt', description: '全站HTTPS/TLS1.3加密', encryptAlgorithm: '', backupCycle: '', status: 'enabled' },
  { name: '敏感数据加密存储', type: 'storage', description: '手机号、身份证等AES-256加密', encryptAlgorithm: 'aes256', backupCycle: '', status: 'enabled' },
  { name: '数据脱敏规则', type: 'desensitize', description: '手机号中间4位脱敏', encryptAlgorithm: '', backupCycle: '', status: 'enabled' },
  { name: '每日自动备份', type: 'backup', description: '每日凌晨2:00自动备份数据库', encryptAlgorithm: '', backupCycle: 'daily', status: 'enabled' },
]);
defineModule('security/app', ['name', 'type', 'rule', 'blockCount', 'status'], [
  { name: 'WAF防火墙', type: 'waf', rule: '拦截SQL注入、XSS等常见攻击', blockCount: 1520, status: 'enabled' },
  { name: 'SQL注入防护', type: 'sqli', rule: '参数化查询+关键字过滤', blockCount: 856, status: 'enabled' },
  { name: 'XSS防护', type: 'xss', rule: '输出编码+Content-Security-Policy', blockCount: 320, status: 'enabled' },
]);
defineModule('security/api', ['name', 'type', 'authType', 'rateLimit', 'tokenExpire', 'status'], [
  { name: 'API鉴权策略', type: 'auth', authType: 'jwt', rateLimit: 0, tokenExpire: 60, status: 'enabled' },
  { name: '接口限流策略', type: 'rate', authType: '', rateLimit: 500, tokenExpire: 0, status: 'enabled' },
  { name: '签名验证', type: 'sign', authType: '', rateLimit: 0, tokenExpire: 0, status: 'enabled' },
]);
defineModule('security/applet', ['name', 'type', 'description', 'status'], [
  { name: '代码加固策略', type: 'code', description: '小程序代码混淆加固', status: 'enabled' },
  { name: '接口防篡改', type: 'tamper', description: '接口请求签名验证', status: 'enabled' },
  { name: '防反编译', type: 'decompile', description: '代码混淆+关键逻辑加密', status: 'enabled' },
  { name: '防抓包', type: 'capture', description: 'SSL Pinning+证书校验', status: 'enabled' },
]);
defineModule('security/compliance', ['name', 'type', 'description', 'checkResult', 'status'], [
  { name: '隐私政策管理', type: 'privacy', description: '用户隐私政策展示与同意管理', checkResult: 'pass', status: 'enabled' },
  { name: '数据收集范围', type: 'collect', description: '仅收集必要个人信息', checkResult: 'pass', status: 'enabled' },
  { name: '用户数据导出', type: 'export', description: '支持用户申请导出个人数据', checkResult: 'pending', status: 'disabled' },
  { name: '用户数据删除', type: 'delete', description: '支持用户申请删除个人数据', checkResult: 'pending', status: 'disabled' },
]);
defineModule('security/audit', ['type', 'content', 'level', 'operator', 'ip', 'time'], [
  { type: 'operation', content: '管理员修改了系统配置', level: 'info', operator: 'admin', ip: '10.0.1.100', time: '2024-07-10' },
  { type: 'login', content: '异常登录：IP来自境外', level: 'warning', operator: 'unknown', ip: '203.0.113.1', time: '2024-07-11' },
  { type: 'event', content: 'SQL注入攻击被拦截', level: 'critical', operator: 'system', ip: '198.51.100.1', time: '2024-07-12' },
]);

// ===== C端小程序模块 =====
defineModule('capp/home', ['title', 'banner', 'notice', 'status'], []);
defineModule('capp/member-register', ['phone', 'code', 'inviteCode', 'status'], []);
defineModule('capp/member-profile', ['member', 'level', 'points', 'status'], []);
defineModule('capp/search', ['keyword', 'type', 'result', 'status'], []);
defineModule('capp/message', ['title', 'content', 'type', 'status', 'time'], []);
defineModule('capp/points-query', ['member', 'points', 'balance', 'status'], []);
defineModule('capp/shop-list', ['name', 'category', 'floor', 'status'], []);
defineModule('capp/shop-detail', ['name', 'category', 'floor', 'phone', 'status'], []);
defineModule('capp/restaurant-guide', ['name', 'cuisine', 'floor', 'avgCost', 'status'], []);
defineModule('capp/shop-navigation', ['from', 'to', 'route', 'status'], []);
defineModule('capp/banner-ad', ['title', 'image', 'link', 'sort', 'status'], []);
defineModule('capp/popup-ad', ['title', 'image', 'link', 'showCount', 'status'], []);
defineModule('capp/splash-ad', ['title', 'image', 'link', 'duration', 'status'], []);
defineModule('capp/personalized-ad', ['title', 'targetGroup', 'image', 'link', 'status'], []);
defineModule('capp/new-member-gift', ['member', 'giftName', 'claimed', 'status'], []);
defineModule('capp/referral', ['referrer', 'invitee', 'reward', 'status'], []);
defineModule('capp/help-coupon', ['member', 'couponName', 'needHelp', 'helped', 'status'], []);
defineModule('capp/checkin', ['member', 'points', 'continuous', 'time', 'status'], []);
defineModule('capp/game', ['name', 'type', 'reward', 'status'], []);
defineModule('capp/survey', ['title', 'questions', 'reward', 'status'], []);
defineModule('capp/vote', ['title', 'options', 'voted', 'status'], []);
defineModule('capp/activity-signup', ['activity', 'member', 'time', 'status'], []);
defineModule('capp/coupon-display', ['name', 'type', 'value', 'status'], []);
defineModule('capp/coupon-claim', ['coupon', 'member', 'time', 'status'], []);
defineModule('capp/coupon-package', ['name', 'coupons', 'price', 'status'], []);
defineModule('capp/group-buy', ['name', 'price', 'minCount', 'joined', 'status'], []);
defineModule('capp/count-card', ['name', 'times', 'price', 'validity', 'status'], []);
defineModule('capp/points-mall-home', ['title', 'banner', 'categories', 'status'], []);
defineModule('capp/points-goods', ['name', 'points', 'stock', 'status'], []);
defineModule('capp/points-order', ['orderNo', 'member', 'goods', 'points', 'status'], []);
defineModule('capp/mall-home', ['title', 'banner', 'categories', 'status'], []);
defineModule('capp/goods-category', ['name', 'sort', 'status'], []);
defineModule('capp/goods-detail', ['name', 'price', 'stock', 'status'], []);
defineModule('capp/order-manage', ['orderNo', 'member', 'amount', 'status'], []);
defineModule('capp/order-refund', ['orderNo', 'member', 'amount', 'reason', 'status'], []);
defineModule('capp/mall-marketing', ['name', 'type', 'startTime', 'endTime', 'status'], []);
defineModule('capp/photo-points', ['member', 'image', 'points', 'status'], []);
defineModule('capp/ai-points', ['member', 'type', 'points', 'status'], []);
defineModule('capp/pay-points', ['member', 'amount', 'points', 'status'], []);
defineModule('capp/parking-pay', ['plate', 'fee', 'duration', 'status'], []);
defineModule('capp/parking-combo', ['name', 'price', 'hours', 'status'], []);
defineModule('capp/parking-stack', ['plate', 'inTime', 'outTime', 'status'], []);
defineModule('capp/parking-senseless', ['plate', 'fee', 'status'], []);
defineModule('capp/parking-no-plate', ['ticket', 'fee', 'status'], []);
defineModule('capp/parking-exchange', ['member', 'hours', 'points', 'status'], []);
defineModule('capp/online-service', ['member', 'type', 'content', 'status'], []);
defineModule('capp/ai-service', ['member', 'question', 'answer', 'status'], []);
defineModule('capp/rental', ['item', 'member', 'outTime', 'status'], []);
defineModule('capp/rental-deposit', ['member', 'item', 'deposit', 'status'], []);
defineModule('capp/douyin-exchange', ['member', 'code', 'reward', 'status'], []);

// ===== 商家小程序模块 =====
defineModule('bapp/coupon-issue', ['coupon', 'member', 'count', 'time', 'status'], []);
defineModule('bapp/coupon-batch', ['name', 'count', 'issued', 'status'], []);
defineModule('bapp/coupon-verify', ['code', 'member', 'time', 'status'], []);
defineModule('bapp/parking-issue', ['plate', 'hours', 'reason', 'status'], []);
defineModule('bapp/order-verify', ['orderNo', 'member', 'time', 'status'], []);
defineModule('bapp/group-verify', ['code', 'member', 'time', 'status'], []);
defineModule('bapp/activity-verify', ['activity', 'member', 'time', 'status'], []);
defineModule('bapp/points-ledger', ['member', 'points', 'type', 'time', 'status'], []);
defineModule('bapp/verify-stats', ['date', 'count', 'amount', 'status'], []);
defineModule('bapp/sales-stats', ['date', 'revenue', 'orders', 'status'], []);
defineModule('bapp/shop-info', ['name', 'phone', 'address', 'status'], []);
defineModule('bapp/shop-notice', ['title', 'content', 'time', 'status'], []);

// ============ Register CRUD routers ============
const moduleRoutes = [
  'member/level', 'member/list', 'member/tags', 'member/benefits', 'member/profiles', 'member/tag-relations',
  'points/rules', 'points/goods', 'points/logs', 'points/mall-orders',
  'coupon/templates', 'coupon/batches',
  'parking/records', 'parking/benefit', 'parking/lots', 'parking/rules',
  'marketing/campaigns', 'marketing/coupons', 'marketing/groupbuy', 'marketing/seckill',
  'marketing/referral', 'marketing/new-member', 'marketing/help-coupon', 'marketing/word-coupon',
  'marketing/games', 'marketing/surveys', 'marketing/votes', 'marketing/countdown',
  'marketing/pre-sale', 'marketing/bargain', 'marketing/lucky-draw', 'marketing/blind-box',
  'marketing/count-cards', 'marketing/checkin-coupon', 'marketing/douyin-coupon',
  'activity/signups', 'activity/checkin',
  'service/orders',
  'message/templates', 'message/campaigns',
  'wallet/accounts', 'wallet/transactions',
  'merchant/list', 'merchant/verification', 'merchant/coupon-issue',
  'shop/goods', 'shop/orders', 'shop/categories', 'shop/home-config', 'shop/bottom-menu', 'shop/brands', 'shop/returns',
  'analytics/dashboards', 'analytics/reports', 'analytics/overview',
  'config/shops', 'config/terminals',
  'system/users', 'system/roles', 'system/logs', 'system/menus',
  'verification/records', 'verification/staff', 'verification/terminals',
  'public-domain/ads',
  'property/points', 'property/tasks', 'property/activities',
  'rental/items', 'rental/records',
  'decoration/pages', 'decoration/versions', 'decoration/templates', 'decoration/services',
  'decoration/icons', 'decoration/audience', 'decoration/personalization',
  'decoration/events', 'decoration/floors',
  'channel/configs', 'channel/templates', 'channel/redemptions',
  'channel/reconciliation/daily', 'channel/settlement/monthly',
  'channel/order-sync',
  'merchant/contracts', 'merchant/authorizations',
  'coupon/code-pool',
  'member/oneid', 'member/join-scenes',
  'route/short-url',
  'analytics/bi',
  'ai/receipt-audit', 'ai/receipt-rules',
  'ad/config', 'ad/precise',
  'cs/knowledge', 'cs/auto-reply', 'cs/ai-training', 'cs/staff',
  'search/hotwords', 'search/scope',
  'parking/coupons',
  'channel/douyin-member', 'channel/meituan-config', 'channel/meituan-verify', 'channel/meituan-orders',
  'system/projects', 'points/cross-project', 'analytics/cross-project',
  'property/auth', 'property/content', 'property/owners', 'property/task-audit', 'property/notify', 'property/goods', 'property/community-scope', 'property/multi-bind',
  'merchant/locations', 'merchant/floor-maps', 'merchant/food-config',
  'points/consumption-ratio',
  'merchant/info', 'merchant/contracts-mgmt', 'merchant/notify-template', 'merchant/notify-logs',
  'content/decoration-preview', 'content/decoration-templates', 'content/decoration-history', 'content/decoration-qrcode',
  'points/mall-decoration',
  'verification/export', 'verification/points-audit',
  'security/network', 'security/data', 'security/app', 'security/api', 'security/applet', 'security/compliance', 'security/audit',
  // ===== C端小程序路由 =====
  'capp/home', 'capp/member-register', 'capp/member-profile', 'capp/search', 'capp/message', 'capp/points-query',
  'capp/shop-list', 'capp/shop-detail', 'capp/restaurant-guide', 'capp/shop-navigation',
  'capp/banner-ad', 'capp/popup-ad', 'capp/splash-ad', 'capp/personalized-ad',
  'capp/new-member-gift', 'capp/referral', 'capp/help-coupon', 'capp/checkin', 'capp/game', 'capp/survey', 'capp/vote', 'capp/activity-signup',
  'capp/coupon-display', 'capp/coupon-claim', 'capp/coupon-package', 'capp/group-buy', 'capp/count-card',
  'capp/points-mall-home', 'capp/points-goods', 'capp/points-order',
  'capp/mall-home', 'capp/goods-category', 'capp/goods-detail', 'capp/order-manage', 'capp/order-refund', 'capp/mall-marketing',
  'capp/photo-points', 'capp/ai-points', 'capp/pay-points',
  'capp/parking-pay', 'capp/parking-combo', 'capp/parking-stack', 'capp/parking-senseless', 'capp/parking-no-plate', 'capp/parking-exchange',
  'capp/online-service', 'capp/ai-service',
  'capp/rental', 'capp/rental-deposit',
  'capp/douyin-exchange',
  // ===== 商家小程序路由 =====
  'bapp/coupon-issue', 'bapp/coupon-batch', 'bapp/coupon-verify', 'bapp/parking-issue',
  'bapp/order-verify', 'bapp/group-verify', 'bapp/activity-verify', 'bapp/points-ledger',
  'bapp/verify-stats', 'bapp/sales-stats', 'bapp/shop-info', 'bapp/shop-notice',
];

// ============ C端小程序 自定义业务API ============
function miniAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ code: 401, message: '未登录', data: null });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, message: 'token无效', data: null });
  }
}

// C端登录
app.post('/v1/capp/login', (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone) return res.status(400).json({ code: 400, message: '请输入手机号', data: null });
  const token = jwt.sign({ sub: phone, type: 'capp' }, SECRET, { expiresIn: '30d' });
  res.json({
    code: 200, message: 'success',
    data: {
      token, tokenType: 'Bearer', expiresIn: 2592000,
      userInfo: {
        id: 1, phone, name: '张三', avatar: '',
        level: 'GOLD', levelName: '金卡会员',
        points: 6200, balance: 500, growthValue: 6200,
        cardNo: 'VIP20240001'
      }
    }
  });
});

// C端首页数据
app.get('/v1/capp/home', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      notices: ['新会员注册即送100金币', '618活动火热进行中', '金币商城上新好物'],
      banners: [
        { id: 1, image: '', title: '618大促', link: '/pages/promotion' },
        { id: 2, image: '', title: '金币翻倍', link: '/pages/points' },
        { id: 3, image: '', title: '新品上市', link: '/pages/new' }
      ],
      services: [
        { id: 1, name: '停车缴费', icon: 'parking', link: '/parking' },
        { id: 2, name: '快速金币', icon: 'coins', link: '/points' },
        { id: 3, name: '金币码', icon: 'qrcode', link: '/member' },
        { id: 4, name: '会员权益', icon: 'crown', link: '/member' },
        { id: 5, name: '联系客服', icon: 'headphones', link: '/service' },
        { id: 6, name: '自助寻车', icon: 'search', link: '/parking' },
        { id: 7, name: '我要打车', icon: 'car', link: '/taxi' },
        { id: 8, name: '我要充电', icon: 'zap', link: '/charge' },
        { id: 9, name: '金币兑换', icon: 'gift', link: '/mall' },
        { id: 10, name: '餐饮导览', icon: 'utensils', link: '/restaurant' }
      ],
      events: [
        { date: '07.05', title: '亲子运动会', location: 'A区1-3门外广场' },
        { date: '07.07', title: '安全教育讲座', location: 'A区L2南风空间' },
        { date: '07.15', title: '夏日音乐节', location: 'B区中庭广场' },
        { date: '07.20', title: '会员专属日', location: '全馆参与' }
      ],
      merchants: [
        { title: '新店开业', subtitle: '魏斯理汉堡', tag: '开业', image: '' },
        { title: '新店入驻', subtitle: '金粒门餐饮', tag: '入驻', image: '' }
      ],
      categories: [
        { name: '餐饮美食', count: 36 },
        { name: '服饰鞋包', count: 27 },
        { name: '儿童成长', count: 15 },
        { name: '生活服务', count: 20 },
        { name: '数码电器', count: 13 }
      ],
      flashSale: {
        title: '限时秒杀', subtitle: '好物限时抢', endTime: '2026-07-25 10:00',
        goods: [
          { name: '星巴克拿铁', price: 15, originalPrice: 35, image: '' },
          { name: '海底捞代金券', price: 50, originalPrice: 100, image: '' },
          { name: '电影票2张', price: 29, originalPrice: 80, image: '' }
        ]
      }
    }
  });
});

// C端会员信息
app.get('/v1/capp/member', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      id: 1, name: '张三', phone: '138****8001', avatar: '',
      level: 'GOLD', levelName: '金卡会员',
      points: 6200, balance: 500, growthValue: 6200,
      cardNo: 'VIP20240001',
      couponCount: 8, orderCount: 24, totalSpent: 12000,
      benefits: ['金卡免费停车2小时', '生日双倍金币', '金卡专属优惠券'],
      nextLevel: 'DIAMOND', nextLevelPoints: 20000, progress: 31
    }
  });
});

// C端金币明细
app.get('/v1/capp/points', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      total: 6200,
      todayEarn: 5,
      logs: [
        { id: 1, type: '消费', points: 100, balance: 6200, remark: '消费100元', time: '2024-06-15 10:30' },
        { id: 2, type: '签到', points: 5, balance: 6300, remark: '每日签到', time: '2024-06-15 08:00' },
        { id: 3, type: '消费', points: 50, balance: 6295, remark: '消费50元', time: '2024-06-14 15:20' },
        { id: 4, type: '奖励', points: 200, balance: 6345, remark: '活动奖励', time: '2024-06-13 12:00' },
        { id: 5, type: '消费', points: 80, balance: 6145, remark: '餐饮消费80元', time: '2024-06-12 18:30' },
        { id: 6, type: '签到', points: 5, balance: 6065, remark: '每日签到', time: '2024-06-12 08:00' }
      ]
    }
  });
});

// C端卡券
app.get('/v1/capp/coupons', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: [
      { id: 1, name: '满200减30', type: 'fullcut', value: 30, minSpend: 200, status: 'unused', expireDate: '2024-12-31' },
      { id: 2, name: '停车券1小时', type: 'parking', value: 60, minSpend: 0, status: 'unused', expireDate: '2024-09-30' },
      { id: 3, name: '新人立减10', type: 'cash', value: 10, minSpend: 0, status: 'unused', expireDate: '2024-08-31' },
      { id: 4, name: '星巴克咖啡券', type: 'goods', value: 35, minSpend: 0, status: 'used', expireDate: '2024-06-10' },
      { id: 5, name: '满500减100', type: 'fullcut', value: 100, minSpend: 500, status: 'expired', expireDate: '2024-05-31' }
    ]
  });
});

// C端金币商城
app.get('/v1/capp/mall', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      banners: [],
      categories: ['全部', '餐饮美食', '生活服务', '数码电器', '电影演出'],
      goods: [
        { id: 1, name: '星巴克咖啡券', points: 500, originalPrice: 35, stock: 100, image: '', category: '餐饮美食' },
        { id: 2, name: '电影票2张', points: 1500, originalPrice: 80, stock: 50, image: '', category: '电影演出' },
        { id: 3, name: '100元无门槛券', points: 1000, originalPrice: 100, stock: 80, image: '', category: '生活服务' },
        { id: 4, name: '海底捞代金券', points: 800, originalPrice: 50, stock: 60, image: '', category: '餐饮美食' },
        { id: 5, name: '蓝牙耳机', points: 5000, originalPrice: 299, stock: 20, image: '', category: '数码电器' },
        { id: 6, name: '停车券3小时', points: 300, originalPrice: 15, stock: 200, image: '', category: '生活服务' }
      ]
    }
  });
});

// C端停车
app.get('/v1/capp/parking', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      current: {
        plate: '京A12345', inTime: '2024-06-15 10:00', duration: '2小时30分',
        fee: 20, discount: 5, finalFee: 15
      },
      records: [
        { id: 1, plate: '京A12345', inTime: '2024-06-01 10:00', outTime: '2024-06-01 12:00', duration: '2小时', fee: 20, discount: 5 },
        { id: 2, plate: '京A12345', inTime: '2024-05-28 14:00', outTime: '2024-05-28 16:30', duration: '2小时30分', fee: 25, discount: 5 }
      ],
      benefit: { freeHours: 2, pointsRate: 1, level: 'GOLD' }
    }
  });
});

// C端餐饮导览
app.get('/v1/capp/restaurant-guide', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: [
      { id: 1, name: '海底捞', cuisine: '火锅', floor: '4F', avgCost: 120, tag: '热门', image: '' },
      { id: 2, name: '星巴克', cuisine: '咖啡', floor: '1F', avgCost: 35, tag: '推荐', image: '' },
      { id: 3, name: '西贝莜面村', cuisine: '西北菜', floor: '3F', avgCost: 80, tag: '亲子', image: '' },
      { id: 4, name: '喜茶', cuisine: '茶饮', floor: 'B1', avgCost: 25, tag: '网红', image: '' },
      { id: 5, name: '麦当劳', cuisine: '快餐', floor: '1F', avgCost: 30, tag: '便捷', image: '' },
      { id: 6, name: '凑凑火锅', cuisine: '火锅', floor: '5F', avgCost: 150, tag: '新店', image: '' }
    ]
  });
});

// C端订单
app.get('/v1/capp/orders', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: [
      { id: 1, orderNo: 'O20240601001', goods: '纯棉T恤', amount: 99, status: '已完成', time: '2024-06-01 10:00' },
      { id: 2, orderNo: 'O20240520002', goods: '星巴克咖啡券', amount: 35, status: '已完成', time: '2024-05-20 14:30' },
      { id: 3, orderNo: 'O20240515003', goods: '电影票2张', amount: 80, status: '已退款', time: '2024-05-15 19:00' }
    ]
  });
});

// ============ 商户小程序 自定义业务API ============

// 商户登录
app.post('/v1/bapp/login', (req, res) => {
  const { username, password } = req.body || {};
  const merchants = {
    'haidilao': { id: 1, username: 'haidilao', password: '123456', name: '海底捞', category: '餐饮', shopId: 1 },
    'starbucks': { id: 2, username: 'starbucks', password: '123456', name: '星巴克', category: '餐饮', shopId: 2 }
  };
  const m = merchants[username];
  if (!m || m.password !== password) {
    return res.status(401).json({ code: 401, message: '账号或密码错误', data: null });
  }
  const token = jwt.sign({ sub: m.username, type: 'bapp', shopId: m.shopId }, SECRET, { expiresIn: '12h' });
  res.json({
    code: 200, message: 'success',
    data: {
      token, tokenType: 'Bearer', expiresIn: 43200,
      userInfo: { id: m.id, username: m.username, name: m.name, category: m.category, shopId: m.shopId }
    }
  });
});

// 商户工作台
app.get('/v1/bapp/dashboard', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      shopName: '海底捞',
      today: {
        verifyCount: 28, revenue: 3680, newMembers: 5, issuedCoins: 368
      },
      week: {
        verifyCount: 186, revenue: 24500, newMembers: 32, issuedCoins: 2450
      },
      tasks: [
        { id: 1, title: '3张停车券待发放', desc: '请及时处理', level: 'normal' },
        { id: 2, title: '5笔核销待确认', desc: '请核实后确认', level: 'high' }
      ]
    }
  });
});

// 商户核销记录
app.get('/v1/bapp/records', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: [
      { id: 1, orderNo: 'V20240615001', member: '张三', coupon: '满200减30', amount: 30, time: '2024-06-15 12:30', status: 'success' },
      { id: 2, orderNo: 'V20240615002', member: '李四', coupon: '新人立减10', amount: 10, time: '2024-06-15 11:20', status: 'success' },
      { id: 3, orderNo: 'V20240614003', member: '王五', coupon: '停车券1小时', amount: 0, time: '2024-06-14 18:00', status: 'success' },
      { id: 4, orderNo: 'V20240614004', member: '赵六', coupon: '满500减100', amount: 100, time: '2024-06-14 16:45', status: 'success' },
      { id: 5, orderNo: 'V20240613005', member: '张三', coupon: '星巴克咖啡券', amount: 35, time: '2024-06-13 09:15', status: 'success' }
    ]
  });
});

// 商户核销卡券
app.post('/v1/bapp/coupon-verify', miniAuth, (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ code: 400, message: '请输入核销码', data: null });
  res.json({
    code: 200, message: '核销成功',
    data: { code, member: '张三', coupon: '满200减30', amount: 30, time: new Date().toISOString().slice(0, 19).replace('T', ' ') }
  });
});

// 商户发放停车券
app.post('/v1/bapp/parking-issue', miniAuth, (req, res) => {
  const { plate, hours } = req.body || {};
  if (!plate) return res.status(400).json({ code: 400, message: '请输入车牌号', data: null });
  res.json({
    code: 200, message: '停车券发放成功',
    data: { plate, hours: hours || 1, time: new Date().toISOString().slice(0, 19).replace('T', ' ') }
  });
});

// 商户个人信息
app.get('/v1/bapp/profile', miniAuth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      shopName: '海底捞', category: '餐饮', floor: '4F',
      contact: '王经理', phone: '13900139001',
      memberCount: 580, monthRevenue: 98000, monthVerify: 420
    }
  });
});

for (const route of moduleRoutes) {
  app.use(`/v1/${route}`, crudRouter(route));
}

// ============ Decoration special APIs ============

app.post('/v1/decoration/pages/:id/publish', auth, (req, res) => {
  const m = getModule('decoration/pages');
  const idx = m.data.findIndex(x => x.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '页面不存在', data: null });
  const page = m.data[idx];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  const versionModule = getModule('decoration/versions');
  const versions = versionModule.data.filter(v => v.pageId === page.id);
  const nextVersion = `v${versions.length + 1}`;
  versionModule.data.push({
    id: versionModule.nextId++,
    pageId: page.id,
    version: nextVersion,
    components: page.components,
    createdAt: now,
    operator: req.user.sub
  });
  
  m.data[idx] = { ...page, status: 'published', publishedAt: now };
  res.json({ code: 200, message: '发布成功', data: { ...m.data[idx], version: nextVersion } });
});

app.post('/v1/decoration/pages/:id/unpublish', auth, (req, res) => {
  const m = getModule('decoration/pages');
  const idx = m.data.findIndex(x => x.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '页面不存在', data: null });
  m.data[idx] = { ...m.data[idx], status: 'draft', publishedAt: null };
  res.json({ code: 200, message: '下架成功', data: m.data[idx] });
});

app.post('/v1/decoration/pages/:id/preview', auth, (req, res) => {
  const m = getModule('decoration/pages');
  const page = m.data.find(x => x.id === parseInt(req.params.id));
  if (!page) return res.status(404).json({ code: 404, message: '页面不存在', data: null });
  const token = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  page.previewToken = token;
  res.json({ code: 200, message: 'success', data: { token, previewUrl: `https://preview.hengwei.com/${token}` } });
});

app.post('/v1/decoration/pages/:id/rollback', auth, (req, res) => {
  const { version } = req.body;
  const pageModule = getModule('decoration/pages');
  const versionModule = getModule('decoration/versions');
  const page = pageModule.data.find(x => x.id === parseInt(req.params.id));
  if (!page) return res.status(404).json({ code: 404, message: '页面不存在', data: null });
  const targetVersion = versionModule.data.find(v => v.pageId === page.id && v.version === version);
  if (!targetVersion) return res.status(404).json({ code: 404, message: '版本不存在', data: null });
  page.components = targetVersion.components;
  res.json({ code: 200, message: '回滚成功', data: page });
});

app.get('/v1/decoration/pages/:id/versions', auth, (req, res) => {
  const versionModule = getModule('decoration/versions');
  const versions = versionModule.data.filter(v => v.pageId === parseInt(req.params.id));
  res.json(versions);
});

app.get('/v1/decoration/aggregate/events', auth, (req, res) => {
  const m = getModule('decoration/events');
  const { type, limit = 10 } = req.query;
  let list = m.data.filter(e => e.status === 'enabled');
  if (type) list = list.filter(e => e.type === type);
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(list.slice(0, parseInt(limit)));
});

app.get('/v1/decoration/aggregate/merchants', auth, (req, res) => {
  const merchantModule = getModule('merchant/list');
  const brandModule = getModule('shop/brands');
  const merchants = merchantModule.data.filter(m => m.status === 'enabled');
  const brands = brandModule.data.filter(b => b.status === 'enabled');
  const combined = merchants.map(m => ({
    ...m,
    isBrand: false
  })).concat(brands.map(b => ({
    ...b,
    isBrand: true
  })));
  res.json(combined);
});

app.get('/v1/decoration/aggregate/categories', auth, (req, res) => {
  const shopCatModule = getModule('shop/categories');
  const categories = shopCatModule.data.filter(c => c.status === 'enabled');
  const customCategories = [
    { id: 999, name: '餐饮美食', sort: 1, count: 36, status: 'enabled' },
    { id: 998, name: '服饰鞋包', sort: 2, count: 27, status: 'enabled' },
    { id: 997, name: '儿童成长', sort: 3, count: 15, status: 'enabled' },
    { id: 996, name: '生活服务', sort: 4, count: 20, status: 'enabled' },
    { id: 995, name: '数码电器', sort: 5, count: 13, status: 'enabled' }
  ];
  res.json([...customCategories, ...categories]);
});

app.get('/v1/decoration/preview/:token', (req, res) => {
  const m = getModule('decoration/pages');
  const page = m.data.find(p => p.previewToken === req.params.token);
  if (!page) return res.status(404).json({ code: 404, message: '预览链接不存在或已过期', data: null });
  res.json({ code: 200, message: 'success', data: page });
});

app.get('/v1/decoration/render/:pageType', auth, (req, res) => {
  const { pageType } = req.params;
  const { audienceId } = req.query;
  const pageModule = getModule('decoration/pages');
  const personalizationModule = getModule('decoration/personalization');
  
  let page = pageModule.data.find(p => p.pageType === pageType && p.status === 'published');
  if (!page) page = pageModule.data.find(p => p.pageType === pageType);
  if (!page) return res.status(404).json({ code: 404, message: '页面不存在', data: null });
  
  let components = JSON.parse(page.components || '[]');
  
  if (audienceId) {
    const personalization = personalizationModule.data.find(
      p => p.pageId === page.id && p.audienceId === parseInt(audienceId) && p.status === 'enabled'
    );
    if (personalization) {
      const customComponents = JSON.parse(personalization.components || '[]');
      customComponents.forEach((custom) => {
        const idx = components.findIndex((c) => c.type === custom.type);
        if (idx !== -1) {
          components[idx] = custom;
        } else {
          components.push(custom);
        }
      });
    }
  }
  
  res.json({ code: 200, message: 'success', data: { page, components } });
});

// ============ Dashboard summary ============
app.get('/v1/dashboard/summary', auth, (req, res) => {
  res.json({
    code: 200, message: 'success',
    data: {
      memberCount: getModule('member/list').data.length,
      pointsIssued: getModule('points/logs').data.reduce((s, x) => s + x.points, 0),
      couponClaimed: getModule('coupon/templates').data.reduce((s, x) => s + x.claimed, 0),
      orderCount: getModule('shop/orders').data.length,
      todayRevenue: getModule('shop/orders').data.reduce((s, x) => s + x.amount, 0),
      activeCampaigns: getModule('marketing/campaigns').data.filter(x => x.status === 'enabled').length
    }
  });
});

// ============ Health check ============
app.get('/health', (req, res) => res.json({ status: 'ok', modules: Object.keys(modules).length }));

// ============ SPA 路由回退：非 API 请求返回 index.html ============
const INDEX_HTML = fs.existsSync(path.join(DIST_DIR, 'index.html'))
  ? path.join(DIST_DIR, 'index.html')
  : null;
app.use((req, res, next) => {
  // API 请求（/v1 或 /api/v1）未命中则交给后续 404
  if (req.url.startsWith('/v1/') || req.url.startsWith('/api/')) return next();
  // 已存在的静态资源由 express.static 处理，未命中的 GET 文本请求回退到 SPA
  if (req.method === 'GET' && INDEX_HTML) {
    return res.sendFile(INDEX_HTML);
  }
  next();
});

// ============ Fallback ============
app.use((req, res) => {
  res.status(404).json({ code: 404, message: `Not Found: ${req.method} ${req.url}`, data: null });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: err.message, data: null });
});

app.listen(PORT, HOST, () => {
  console.log(`Mock server running on http://${HOST}:${PORT}`);
  console.log(`Modules registered: ${Object.keys(modules).length}`);
  if (INDEX_HTML) console.log(`Frontend dist served from: ${DIST_DIR}`);
});
