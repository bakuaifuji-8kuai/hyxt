const STORAGE_KEY = 'hengwei-mock-data';
const TOKEN_KEY = 'hengwei-token';

interface ModuleData {
  fields: string[];
  data: any[];
  nextId: number;
}

const modules: Record<string, ModuleData> = {};

function initModule(name: string, fields: string[], seedData: any[] = []) {
  const data = seedData.map((item, idx) => ({ id: idx + 1, ...item }));
  modules[name] = { fields, data, nextId: data.length + 1 };
}

initModule('member/level', ['name', 'code', 'minPoints', 'discount', 'status'], [
  { name: '普通会员', code: 'NORMAL', minPoints: 0, discount: 1, status: 'enabled' },
  { name: '银卡会员', code: 'SILVER', minPoints: 1000, discount: 0.95, status: 'enabled' },
  { name: '金卡会员', code: 'GOLD', minPoints: 5000, discount: 0.9, status: 'enabled' },
  { name: '钻石会员', code: 'DIAMOND', minPoints: 20000, discount: 0.85, status: 'enabled' }
]);

initModule('member/list', ['name', 'phone', 'level', 'points', 'status'], [
  { name: '张三', phone: '13800138001', level: 'GOLD', points: 6200, status: 'enabled' },
  { name: '李四', phone: '13900139002', level: 'SILVER', points: 1500, status: 'enabled' },
  { name: '王五', phone: '13700137003', level: 'NORMAL', points: 500, status: 'enabled' }
]);

initModule('member/tags', ['name', 'category', 'rule', 'count', 'status'], [
  { name: '高消费客户', category: '消费', rule: '消费金额>5000', count: 120, status: 'enabled' },
  { name: '活跃会员', category: '活跃', rule: '30天内有消费', count: 580, status: 'enabled' }
]);

initModule('member/benefits', ['name', 'levels', 'type', 'value', 'status'], [
  { name: '金卡免费停车2小时', levels: 'GOLD,DIAMOND', type: 'parking', value: '2小时', status: 'enabled' }
]);

initModule('member/profiles', ['member', 'tags', 'consumeTag', 'brandTag', 'pointsTag', 'lastActive'], [
  { member: '张三', tags: '高消费客户,活跃会员', consumeTag: '偏好餐饮、数码', brandTag: '星巴克、海底捞', pointsTag: '高频兑换', lastActive: '2024-06-05' }
]);

initModule('member/tag-relations', ['member', 'tag', 'source', 'time'], [
  { member: '张三', tag: '高消费客户', source: 'auto', time: '2024-06-01' }
]);

initModule('points/rules', ['name', 'type', 'points', 'condition', 'status'], [
  { name: '消费积分规则', type: 'consume', points: 1, condition: '每消费1元送1积分', status: 'enabled' },
  { name: '签到送积分', type: 'checkin', points: 5, condition: '每日签到', status: 'enabled' }
]);

initModule('points/goods', ['name', 'points', 'stock', 'status'], [
  { name: '星巴克咖啡券', points: 500, stock: 100, status: 'enabled' },
  { name: '电影票', points: 1500, stock: 50, status: 'enabled' }
]);

initModule('points/logs', ['member', 'type', 'points', 'balance', 'remark'], [
  { member: '张三', type: 'consume', points: 100, balance: 6200, remark: '消费送积分' }
]);

initModule('points/mall-orders', ['orderNo', 'member', 'goods', 'points', 'delivery', 'status'], [
  { orderNo: 'PM20240601001', member: '张三', goods: '星巴克咖啡券', points: 500, delivery: 'self', status: 'done' }
]);

initModule('coupon/templates', ['name', 'type', 'value', 'minSpend', 'quantity', 'claimed', 'status'], [
  { name: '满200减30', type: 'fullcut', value: 30, minSpend: 200, quantity: 500, claimed: 128, status: 'enabled' },
  { name: '停车券1小时', type: 'parking', value: 60, minSpend: 0, quantity: 1000, claimed: 356, status: 'enabled' }
]);

initModule('coupon/batches', ['name', 'template', 'count', 'claimed', 'status'], [
  { name: '618发券批次', template: '满200减30', count: 200, claimed: 56, status: 'enabled' }
]);

initModule('parking/records', ['plate', 'member', 'inTime', 'outTime', 'duration', 'fee', 'points'], [
  { plate: '京A12345', member: '张三', inTime: '2024-06-01 10:00', outTime: '2024-06-01 12:00', duration: 120, fee: 20, points: 20 }
]);

initModule('parking/benefit', ['name', 'level', 'freeHours', 'pointsRate', 'status'], [
  { name: '金卡停车权益', level: 'GOLD', freeHours: 2, pointsRate: 1, status: 'enabled' }
]);

initModule('parking/lots', ['name', 'project', 'totalSpaces', 'availableSpaces', 'status'], [
  { name: '凯德壹中心停车场', project: '凯德壹中心', totalSpaces: 1800, availableSpaces: 320, status: 'enabled' }
]);

initModule('parking/rules', ['name', 'freeMinutes', 'pricePerHour', 'capAmount', 'status'], [
  { name: '标准计费', freeMinutes: 15, pricePerHour: 5, capAmount: 50, status: 'enabled' }
]);

initModule('marketing/campaigns', ['name', 'type', 'startTime', 'endTime', 'status', 'budget'], [
  { name: '618大促', type: 'promotion', startTime: '2024-06-18', endTime: '2024-06-20', status: 'enabled', budget: 50000 }
]);

initModule('marketing/coupons', ['name', 'campaign', 'template', 'count', 'claimed'], [
  { name: '618发券', campaign: '618大促', template: '满200减30', count: 100, claimed: 45 }
]);

initModule('marketing/groupbuy', ['name', 'price', 'originalPrice', 'minCount', 'joined', 'status'], [
  { name: '三人拼团', price: 99, originalPrice: 199, minCount: 3, joined: 15, status: 'enabled' }
]);

initModule('marketing/seckill', ['name', 'price', 'originalPrice', 'stock', 'sold', 'startTime', 'status'], [
  { name: '限量秒杀', price: 1, originalPrice: 100, stock: 50, sold: 30, startTime: '2024-06-18 10:00', status: 'enabled' }
]);

initModule('marketing/referral', ['name', 'referrerReward', 'inviteeReward', 'status'], [
  { name: '邀请好友得积分', referrerReward: '100积分', inviteeReward: '50积分', status: 'enabled' }
]);

initModule('marketing/new-member', ['name', 'rewards', 'validDays', 'status'], [
  { name: '新人礼包', rewards: '停车券1小时+100积分', validDays: 30, status: 'enabled' }
]);

initModule('marketing/games', ['name', 'type', 'rewards', 'plays', 'status'], [
  { name: '大转盘', type: 'wheel', rewards: '积分/停车券', plays: 500, status: 'enabled' }
]);

initModule('marketing/surveys', ['title', 'participants', 'reward', 'status'], [
  { title: '会员满意度调查', participants: 280, reward: '20积分', status: 'enabled' }
]);

initModule('marketing/votes', ['title', 'options', 'totalVotes', 'status'], [
  { title: '最受欢迎品牌', options: '["海底捞","星巴克"]', totalVotes: 520, status: 'enabled' }
]);

initModule('marketing/countdown', ['name', 'goods', 'price', 'originalPrice', 'startTime', 'endTime', 'status'], [
  { name: '限时购', goods: '蓝牙耳机', price: 199, originalPrice: 299, startTime: '2024-06-18', endTime: '2024-06-18', status: 'enabled' }
]);

initModule('marketing/pre-sale', ['goods', 'deposit', 'finalPayment', 'preTime', 'deliveryTime', 'status'], [
  { goods: '新款T恤', deposit: 20, finalPayment: 79, preTime: '2024-06-01', deliveryTime: '2024-06-15', status: 'enabled' }
]);

initModule('marketing/bargain', ['name', 'goods', 'originalPrice', 'floorPrice', 'started', 'status'], [
  { name: '砍价活动', goods: '奶茶', originalPrice: 18, floorPrice: 0, started: 20, status: 'enabled' }
]);

initModule('marketing/lucky-draw', ['name', 'prize', 'participants', 'drawTime', 'status'], [
  { name: '众筹抽奖', prize: 'iPhone15', participants: 800, drawTime: '2024-06-20', status: 'enabled' }
]);

initModule('marketing/blind-box', ['name', 'price', 'prizes', 'opened', 'status'], [
  { name: '惊喜盲盒', price: 9.9, prizes: '咖啡券/代金券', opened: 150, status: 'enabled' }
]);

initModule('marketing/count-cards', ['name', 'times', 'price', 'merchants', 'status'], [
  { name: '餐饮5次卡', times: 5, price: 199, merchants: '海底捞', status: 'enabled' }
]);

initModule('marketing/checkin-coupon', ['name', 'location', 'template', 'claimed', 'status'], [
  { name: '打卡领券', location: 'L1中庭', template: '满50减10', claimed: 89, status: 'enabled' }
]);

initModule('marketing/douyin-coupon', ['name', 'douyinCode', 'reward', 'exchanged', 'status'], [
  { name: '抖音团购券', douyinCode: 'DY2024001', reward: '双人套餐', exchanged: 45, status: 'enabled' }
]);

initModule('activity/signups', ['name', 'signupTime', 'member', 'count', 'status'], [
  { name: '亲子活动', signupTime: '2024-06-01', member: '张三', count: 2, status: 'pending' }
]);

initModule('activity/checkin', ['name', 'rewardType', 'rewardValue', 'period', 'status'], [
  { name: '每日签到', rewardType: 'points', rewardValue: '5', period: 'daily', status: 'enabled' }
]);

initModule('service/orders', ['orderNo', 'member', 'service', 'amount', 'status', 'time'], [
  { orderNo: 'SRV20240601', member: '张三', service: '干洗服务', amount: 50, status: 'finished', time: '2024-06-01' }
]);

initModule('message/templates', ['name', 'channel', 'type', 'content', 'status'], [
  { name: '生日祝福', channel: 'sms', type: 'birthday', content: '生日快乐！', status: 'enabled' }
]);

initModule('message/campaigns', ['name', 'template', 'channel', 'audience', 'sent', 'read', 'status'], [
  { name: '促销推送', template: '生日祝福', channel: 'wechat', audience: 5000, sent: 5000, read: 2100, status: 'finished' }
]);

initModule('private-domain/groups', ['name', 'type', 'memberCount', 'owner', 'status'], [
  { name: '金卡VIP群', type: 'wechat', memberCount: 200, owner: '客服小王', status: 'enabled' }
]);

initModule('wecom/accounts', ['name', 'userid', 'department', 'status'], [
  { name: '客服小王', userid: 'wang01', department: '客服部', status: 'enabled' }
]);

initModule('wallet/accounts', ['member', 'balance', 'points', 'status'], [
  { member: '张三', balance: 500, points: 6200, status: 'enabled' },
  { member: '李四', balance: 100, points: 1500, status: 'enabled' }
]);

initModule('wallet/transactions', ['member', 'type', 'amount', 'balance', 'remark', 'time'], [
  { member: '张三', type: 'recharge', amount: 500, balance: 500, remark: '充值', time: '2024-06-01' }
]);

initModule('merchant/list', ['name', 'category', 'contact', 'phone', 'status'], [
  { name: '海底捞', category: '餐饮', contact: '王经理', phone: '13900139001', status: 'enabled' },
  { name: '星巴克', category: '餐饮', contact: '李经理', phone: '13900139002', status: 'enabled' }
]);

initModule('merchant/verification', ['merchant', 'type', 'count', 'amount', 'date'], [
  { merchant: '海底捞', type: 'coupon', count: 128, amount: 3840, date: '2024-06-01' }
]);

initModule('merchant/coupon-issue', ['merchant', 'template', 'member', 'count', 'time'], [
  { merchant: '海底捞', template: '满200减30', member: '张三', count: 1, time: '2024-06-01' }
]);

initModule('shop/goods', ['name', 'category', 'price', 'stock', 'sales', 'status'], [
  { name: '纯棉T恤', category: '服装', price: 99, stock: 200, sales: 50, status: 'enabled' },
  { name: '蓝牙耳机', category: '数码', price: 299, stock: 100, sales: 30, status: 'enabled' }
]);

initModule('shop/orders', ['orderNo', 'member', 'goods', 'amount', 'status', 'time'], [
  { orderNo: 'O20240601001', member: '张三', goods: '纯棉T恤', amount: 99, status: 'paid', time: '2024-06-01' }
]);

initModule('shop/categories', ['name', 'sort', 'status'], [
  { name: '服装', sort: 1, status: 'enabled' },
  { name: '数码', sort: 2, status: 'enabled' }
]);

initModule('shop/home-config', ['name', 'pageType', 'components', 'sort', 'status'], [
  { name: '首页配置', pageType: 'home', components: '{}', sort: 1, status: 'enabled' }
]);

initModule('shop/bottom-menu', ['name', 'icon', 'link', 'sort', 'status'], [
  { name: '首页', icon: 'home', link: '/pages/home', sort: 1, status: 'enabled' }
]);

initModule('shop/brands', ['name', 'logo', 'category', 'phone', 'status'], [
  { name: '星巴克', logo: '', category: '餐饮', phone: '400-12345678', status: 'enabled' }
]);

initModule('shop/returns', ['returnNo', 'orderNo', 'member', 'amount', 'status', 'time'], [
  { returnNo: 'R20240601001', orderNo: 'O20240601001', member: '张三', amount: 99, status: 'pending', time: '2024-06-02' }
]);

initModule('analytics/dashboards', ['name', 'type', 'config', 'status'], [
  { name: '会员看板', type: 'member', config: '{}', status: 'enabled' }
]);

initModule('analytics/reports', ['name', 'type', 'period', 'status'], [
  { name: '月度报表', type: 'member', period: 'monthly', status: 'enabled' }
]);

initModule('analytics/overview', ['name', 'value', 'mom', 'period'], [
  { name: '会员总数', value: 12580, mom: '+5.2%', period: '本月' },
  { name: '今日订单', value: 326, mom: '+12.0%', period: '今日' }
]);

initModule('config/shops', ['name', 'address', 'phone', 'status'], [
  { name: '总店', address: '北京市朝阳区', phone: '010-12345678', status: 'enabled' }
]);

initModule('config/terminals', ['name', 'shop', 'type', 'status'], [
  { name: '收银机1', shop: '总店', type: 'cashier', status: 'enabled' }
]);

initModule('system/users', ['name', 'username', 'role', 'status'], [
  { name: '超级管理员', username: 'admin', role: 'admin', status: 'enabled' },
  { name: '运营小李', username: 'li', role: 'operator', status: 'enabled' }
]);

initModule('system/roles', ['name', 'code', 'permissions', 'status'], [
  { name: '管理员', code: 'admin', permissions: '["*"]', status: 'enabled' }
]);

initModule('system/logs', ['operator', 'module', 'action', 'ip', 'time'], [
  { operator: 'admin', module: '会员档案', action: '新增', ip: '192.168.1.10', time: '2024-06-01' }
]);

initModule('system/menus', ['name', 'path', 'icon', 'parentId', 'sort', 'status'], [
  { name: '会员数字化', path: '/member', icon: 'user', parentId: 0, sort: 1, status: 'enabled' }
]);

initModule('verification/records', ['code', 'member', 'target', 'shop', 'status', 'time'], [
  { code: 'HX20240001', member: '张三', target: '满200减30', shop: '总店', status: 'verified', time: '2024-06-01' }
]);

initModule('verification/staff', ['name', 'shop', 'count', 'status'], [
  { name: '收银员A', shop: '总店', count: 128, status: 'enabled' }
]);

initModule('invoice/records', ['title', 'member', 'amount', 'type', 'status'], [
  { title: '北京XX公司', member: '张三', amount: 500, type: 'normal', status: 'issued' }
]);

initModule('finance/vouchers', ['voucherNo', 'subject', 'income', 'expense', 'summary', 'time'], [
  { voucherNo: 'FV20240601', subject: '会员充值', income: 500, expense: 0, summary: '张三充值', time: '2024-06-01' }
]);

initModule('content/banners', ['title', 'position', 'sort', 'status'], [
  { title: '618大促', position: 'home_top', sort: 1, status: 'enabled' }
]);

initModule('content/applet-decoration', ['name', 'pageKey', 'template', 'version', 'status'], [
  { name: '会员中心', pageKey: 'member-center', template: '{}', version: 'v1.0', status: 'enabled' }
]);

initModule('public-domain/ads', ['name', 'channel', 'budget', 'leads', 'status'], [
  { name: '抖音投放', channel: 'douyin', budget: 20000, leads: 1500, status: 'enabled' }
]);

initModule('property/points', ['owner', 'property', 'points', 'status'], [
  { owner: '业主王先生', property: 'A栋1001', points: 50000, status: 'enabled' }
]);

initModule('property/tasks', ['name', 'category', 'points', 'limit', 'status'], [
  { name: '发言建议', category: '建言', points: 50, limit: '20次/月', status: 'enabled' }
]);

initModule('property/activities', ['name', 'owner', 'time', 'status'], [
  { name: '暖场活动', owner: '业主王先生', time: '2024-06-01', status: 'approved' }
]);

initModule('rental/items', ['name', 'deposit', 'rent', 'stock', 'status'], [
  { name: '雨伞', deposit: 20, rent: 0, stock: 50, status: 'enabled' },
  { name: '充电宝', deposit: 50, rent: 2, stock: 30, status: 'enabled' }
]);

initModule('rental/records', ['item', 'member', 'outTime', 'returnTime', 'status'], [
  { item: '雨伞', member: '张三', outTime: '2024-06-01', returnTime: '2024-06-01', status: 'returned' }
]);

export function login(username: string, password: string) {
  if ((username === 'admin' && password === 'admin') || (username === 'admin' && password === 'admin')) {
    const token = 'mock-token-' + Date.now();
    localStorage.setItem(TOKEN_KEY, token);
    return { token, userInfo: { id: 1, username, name: '超级管理员', role: 'admin' } };
  }
  throw new Error('用户名或密码错误');
}

export function checkAuth() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function fetchList(module: string, params: Record<string, any> = {}) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  
  let data = [...mod.data];
  
  if (params.keyword) {
    const kw = String(params.keyword).toLowerCase();
    data = data.filter(item => 
      Object.values(item).some(v => String(v).toLowerCase().includes(kw))
    );
  }
  
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const total = data.length;
  const start = (page - 1) * pageSize;
  const list = data.slice(start, start + pageSize);
  
  return { list, total, page, pageSize };
}

export function fetchOne(module: string, id: number) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const item = mod.data.find(d => d.id === id);
  if (!item) throw new Error('数据不存在');
  return item;
}

export function createItem(module: string, body: Record<string, any>) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const newItem = { id: mod.nextId++, ...body };
  mod.data.push(newItem);
  return newItem;
}

export function updateItem(module: string, id: number, body: Record<string, any>) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const idx = mod.data.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('数据不存在');
  mod.data[idx] = { ...mod.data[idx], ...body };
  return mod.data[idx];
}

export function deleteItem(module: string, id: number) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const idx = mod.data.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('数据不存在');
  mod.data.splice(idx, 1);
}

export function toggleStatus(module: string, id: number) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const idx = mod.data.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('数据不存在');
  mod.data[idx].status = mod.data[idx].status === 'enabled' ? 'disabled' : 'enabled';
  return mod.data[idx];
}

export function fetchDashboard() {
  const memberCount = modules['member/list']?.data.length || 0;
  const pointsIssued = (modules['points/logs']?.data.reduce((s, x) => s + (x.points || 0), 0)) || 0;
  const couponClaimed = (modules['coupon/templates']?.data.reduce((s, x) => s + (x.claimed || 0), 0)) || 0;
  const orderCount = modules['shop/orders']?.data.length || 0;
  const todayRevenue = (modules['shop/orders']?.data.reduce((s, x) => s + (x.amount || 0), 0)) || 0;
  const activeCampaigns = (modules['marketing/campaigns']?.data.filter(x => x.status === 'enabled').length) || 0;
  
  return { memberCount, pointsIssued, couponClaimed, orderCount, todayRevenue, activeCampaigns };
}