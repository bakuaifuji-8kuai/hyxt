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

// ===== 内容管理（补充）=====
defineModule('content/applet-decoration', ['name', 'pageKey', 'template', 'version', 'status'], [
  { name: '会员中心页', pageKey: 'member-center', template: '{"components":["banner","user-card","menu-grid"]}', version: 'v1.0', status: 'enabled' }
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
  'private-domain/groups',
  'wecom/accounts',
  'wallet/accounts', 'wallet/transactions',
  'merchant/list', 'merchant/verification', 'merchant/coupon-issue',
  'shop/goods', 'shop/orders', 'shop/categories', 'shop/home-config', 'shop/bottom-menu', 'shop/brands', 'shop/returns',
  'analytics/dashboards', 'analytics/reports', 'analytics/overview',
  'config/shops', 'config/terminals',
  'system/users', 'system/roles', 'system/logs', 'system/menus',
  'verification/records', 'verification/staff',
  'invoice/records',
  'finance/vouchers',
  'content/banners', 'content/applet-decoration',
  'public-domain/ads',
  'property/points', 'property/tasks', 'property/activities',
  'rental/items', 'rental/records',
  'decoration/pages', 'decoration/versions', 'decoration/templates', 'decoration/services',
  'decoration/icons', 'decoration/audience', 'decoration/personalization',
  'decoration/events', 'decoration/floors'
];

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
