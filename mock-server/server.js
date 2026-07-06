const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 8080;
const SECRET = 'hengwei-mock-secret-2024';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

defineModule('member/list', ['name', 'phone', 'level', 'points', 'status'], [
  { name: '张三', phone: '13800138001', level: 'GOLD', points: 6200, status: 'enabled' },
  { name: '李四', phone: '13800138002', level: 'SILVER', points: 1500, status: 'enabled' },
  { name: '王五', phone: '13800138003', level: 'NORMAL', points: 200, status: 'enabled' }
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
defineModule('coupon/templates', ['name', 'type', 'value', 'minSpend', 'quantity', 'claimed', 'status'], [
  { name: '满200减30', type: 'fullcut', value: 30, minSpend: 200, quantity: 1000, claimed: 320, status: 'enabled' },
  { name: '新人立减10', type: 'cash', value: 10, minSpend: 0, quantity: 5000, claimed: 1200, status: 'enabled' }
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

// 营销中心
defineModule('marketing/campaigns', ['name', 'type', 'startTime', 'endTime', 'status', 'budget'], [
  { name: '618大促', type: 'promotion', startTime: '2024-06-01', endTime: '2024-06-18', status: 'enabled', budget: 100000 },
  { name: '会员日', type: 'memberday', startTime: '2024-06-20', endTime: '2024-06-20', status: 'enabled', budget: 20000 }
]);

defineModule('marketing/coupons', ['name', 'campaign', 'template', 'count', 'claimed'], [
  { name: '618主券', campaign: '618大促', template: '满200减30', count: 500, claimed: 120 }
]);

defineModule('marketing/groupbuy', ['name', 'price', 'originalPrice', 'minCount', 'joined', 'status'], [
  { name: '海底捞双人套餐', price: 199, originalPrice: 299, minCount: 10, joined: 8, status: 'enabled' }
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

// 私域运营
defineModule('private-domain/groups', ['name', 'type', 'memberCount', 'owner', 'status'], [
  { name: '金卡VIP群', type: 'wechat', memberCount: 200, owner: '客服小王', status: 'enabled' }
]);

// 企微社群
defineModule('wecom/accounts', ['name', 'userid', 'department', 'status'], [
  { name: '客服小王', userid: 'wang01', department: '客服部', status: 'enabled' }
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

// 开票管理
defineModule('invoice/records', ['title', 'member', 'amount', 'type', 'status'], [
  { title: '北京XX公司', member: '张三', amount: 500, type: 'normal', status: 'issued' },
  { title: '个人', member: '李四', amount: 100, type: 'electronic', status: 'pending' }
]);

// 财务凭证
defineModule('finance/vouchers', ['voucherNo', 'subject', 'income', 'expense', 'summary', 'time'], [
  { voucherNo: 'FV20240601', subject: '会员充值', income: 500, expense: 0, summary: '张三充值', time: '2024-06-01' },
  { voucherNo: 'FV20240602', subject: '积分兑换成本', income: 0, expense: 50, summary: '星巴克券兑换', time: '2024-06-01' }
]);

// 内容管理
defineModule('content/banners', ['title', 'position', 'sort', 'status'], [
  { title: '618大促首页banner', position: 'home_top', sort: 1, status: 'enabled' },
  { title: '商城新上品', position: 'shop_home', sort: 1, status: 'enabled' }
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

// ============ Register CRUD routers ============
const moduleRoutes = [
  'member/level', 'member/list', 'member/tags',
  'points/rules', 'points/goods', 'points/logs',
  'coupon/templates', 'coupon/batches',
  'parking/records', 'parking/benefit',
  'marketing/campaigns', 'marketing/coupons', 'marketing/groupbuy', 'marketing/seckill',
  'service/orders',
  'message/templates', 'message/campaigns',
  'private-domain/groups',
  'wecom/accounts',
  'wallet/accounts', 'wallet/transactions',
  'merchant/list',
  'shop/goods', 'shop/orders', 'shop/categories',
  'analytics/dashboards', 'analytics/reports',
  'config/shops', 'config/terminals',
  'system/users', 'system/roles',
  'verification/records', 'verification/staff',
  'invoice/records',
  'finance/vouchers',
  'content/banners',
  'public-domain/ads',
  'property/points',
  'rental/items', 'rental/records'
];

for (const route of moduleRoutes) {
  app.use(`/v1/${route}`, crudRouter(route));
}

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

// ============ Fallback ============
app.use((req, res) => {
  res.status(404).json({ code: 404, message: `Not Found: ${req.method} ${req.url}`, data: null });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: err.message, data: null });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`Modules registered: ${Object.keys(modules).length}`);
});
