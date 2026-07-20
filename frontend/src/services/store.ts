const STORAGE_KEY = 'hengwei-mock-data';
const TOKEN_KEY = 'hengwei-token';

interface ModuleData {
  fields: string[];
  data: any[];
  nextId: number;
}

const modules: Record<string, ModuleData> = {};

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
}

function loadFromStorage(): Record<string, ModuleData> | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function initModule(name: string, fields: string[], seedData: any[] = []) {
  const stored = loadFromStorage();
  if (stored && stored[name]) {
    modules[name] = stored[name];
    return;
  }
  const data = seedData.map((item, idx) => ({ id: idx + 1, ...item }));
  modules[name] = { fields, data, nextId: data.length + 1 };
}

initModule('member/level', ['name', 'code', 'icon', 'upgradeType', 'minPoints', 'keepCondition', 'downgradeRule', 'validDays', 'discount', 'upgradeGift', 'status'], [
  { name: '普通会员', code: 'NORMAL', icon: '🥉', upgradeType: 'points', minPoints: 0, keepCondition: '无', downgradeRule: 'none', validDays: 0, discount: 1, upgradeGift: '新人券', status: 'enabled' },
  { name: '银卡会员', code: 'SILVER', icon: '🥈', upgradeType: 'points', minPoints: 1000, keepCondition: '年消费满1000元', downgradeRule: 'auto', validDays: 365, discount: 0.95, upgradeGift: '银卡礼包', status: 'enabled' },
  { name: '金卡会员', code: 'GOLD', icon: '🥇', upgradeType: 'growth', minPoints: 5000, keepCondition: '年消费满5000元', downgradeRule: 'auto', validDays: 365, discount: 0.9, upgradeGift: '金卡礼包', status: 'enabled' },
  { name: '钻石会员', code: 'DIAMOND', icon: '💎', upgradeType: 'spent', minPoints: 20000, keepCondition: '年消费满20000元', downgradeRule: 'manual', validDays: 730, discount: 0.85, upgradeGift: '钻石礼包', status: 'enabled' }
]);

initModule('member/list', ['name', 'phone', 'wxNickname', 'avatar', 'openid', 'cardNo', 'gender', 'birthday', 'age', 'address', 'occupation', 'hobby', 'email', 'level', 'growthValue', 'points', 'balance', 'totalSpent', 'orderCount', 'avgAmount', 'source', 'registerTime', 'lastLogin', 'lastConsume', 'remark', 'status'], [
  { name: '张三', phone: '13800138001', wxNickname: '张三的微信', avatar: '', openid: 'oX123456789', cardNo: 'VIP20240001', gender: 'male', birthday: '1990-01-01', age: 34, address: '北京市朝阳区', occupation: '工程师', hobby: '旅游', email: 'zhangsan@example.com', level: 'GOLD', growthValue: 6200, points: 6200, balance: 500, totalSpent: 12000, orderCount: 24, avgAmount: 500, source: 'miniapp', registerTime: '2023-01-15', lastLogin: '2024-06-05', lastConsume: '2024-06-01', remark: '高价值会员', status: 'enabled' },
  { name: '李四', phone: '13900139002', wxNickname: '李四', avatar: '', openid: 'oX987654321', cardNo: 'VIP20240002', gender: 'female', birthday: '1992-05-20', age: 32, address: '上海市浦东新区', occupation: '设计师', hobby: '购物', email: 'lisi@example.com', level: 'SILVER', growthValue: 1500, points: 1500, balance: 100, totalSpent: 3000, orderCount: 8, avgAmount: 375, source: 'wxapp', registerTime: '2023-05-10', lastLogin: '2024-06-04', lastConsume: '2024-05-28', remark: '', status: 'enabled' },
  { name: '王五', phone: '13700137003', wxNickname: '王五同学', avatar: '', openid: 'oX555555555', cardNo: 'VIP20240003', gender: 'male', birthday: '1995-09-15', age: 28, address: '广州市天河区', occupation: '学生', hobby: '游戏', email: 'wangwu@example.com', level: 'NORMAL', growthValue: 500, points: 500, balance: 0, totalSpent: 800, orderCount: 3, avgAmount: 267, source: 'activity', registerTime: '2023-11-20', lastLogin: '2024-06-03', lastConsume: '2024-05-20', remark: '新会员', status: 'enabled' }
]);

initModule('member/tags', ['name', 'tagType', 'category', 'rule', 'condition', 'color', 'count', 'updatedAt', 'status'], [
  { name: '高消费客户', tagType: 'auto', category: '消费', rule: '消费金额>5000', condition: '累计消费金额大于5000元，自动打标', color: '#FF5722', count: 120, updatedAt: '2024-06-01', status: 'enabled' },
  { name: '活跃会员', tagType: 'auto', category: '活跃', rule: '30天内有消费', condition: '近30天内有任意一笔消费记录', color: '#4CAF50', count: 580, updatedAt: '2024-06-02', status: 'enabled' },
  { name: '流失预警', tagType: 'system', category: '活跃', rule: '90天未消费', condition: '近90天无消费记录的会员', color: '#F44336', count: 86, updatedAt: '2024-06-03', status: 'enabled' },
  { name: 'VIP手工标记', tagType: 'manual', category: '属性', rule: '人工标记', condition: '运营人员手工添加的VIP标记', color: '#9C27B0', count: 15, updatedAt: '2024-06-04', status: 'enabled' }
]);

initModule('member/benefits', ['name', 'levels', 'type', 'value', 'shops', 'validDays', 'description', 'status'], [
  { name: '金卡免费停车2小时', levels: 'GOLD,DIAMOND', type: 'parking', value: '2小时', shops: '全部门店', validDays: 365, description: '金卡及以上会员每日免费停车2小时', status: 'enabled' },
  { name: '生日双倍积分', levels: 'NORMAL,SILVER,GOLD,DIAMOND', type: 'birthday', value: '2倍', shops: '全部门店', validDays: 30, description: '生日当月消费享双倍积分', status: 'enabled' },
  { name: '钻石专属客服', levels: 'DIAMOND', type: 'service', value: '专属客服', shops: '全部门店', validDays: 730, description: '钻石会员专属客服一对一服务', status: 'enabled' },
  { name: '金卡专属优惠券', levels: 'GOLD,DIAMOND', type: 'coupon', value: '满200减50', shops: '总店,分店A', validDays: 60, description: '每月发放专属优惠券', status: 'enabled' }
]);

initModule('member/profiles', ['member', 'tags', 'consumeTag', 'brandTag', 'pointsTag', 'lastActive'], [
  { member: '张三', tags: '高消费客户,活跃会员', consumeTag: '偏好餐饮、数码', brandTag: '星巴克、海底捞', pointsTag: '高频兑换', lastActive: '2024-06-05' }
]);

initModule('member/tag-relations', ['member', 'tag', 'source', 'time'], [
  { member: '张三', tag: '高消费客户', source: 'auto', time: '2024-06-01' }
]);

initModule('member/groups', ['name', 'type', 'condition', 'count', 'remark', 'status'], [
  { name: '高价值会员', type: 'smart', condition: '消费总额>5000且订单数>10', count: 86, remark: '用于精准营销推送', status: 'enabled' },
  { name: '待唤醒会员', type: 'smart', condition: '90天未消费且等级>=SILVER', count: 42, remark: '发送唤醒优惠券', status: 'enabled' },
  { name: '试用新品名单', type: 'custom', condition: '手工选择', count: 20, remark: '新品试用活动名单', status: 'enabled' }
]);

initModule('member/cards', ['cardNo', 'member', 'cardType', 'cardStyle', 'balance', 'points', 'status', 'issueTime', 'validUntil'], [
  { cardNo: 'VIP20240001', member: '张三', cardType: 'entity', cardStyle: '金卡样式', balance: 500, points: 6200, status: 'normal', issueTime: '2023-01-15', validUntil: '2026-01-15' },
  { cardNo: 'VIP20240002', member: '李四', cardType: 'electronic', cardStyle: '银卡样式', balance: 100, points: 1500, status: 'normal', issueTime: '2023-05-10', validUntil: '2026-05-10' },
  { cardNo: 'VIP20240003', member: '王五', cardType: 'virtual', cardStyle: '普通样式', balance: 0, points: 500, status: 'normal', issueTime: '2023-11-20', validUntil: '2026-11-20' },
  { cardNo: 'VIP20239999', member: '赵六', cardType: 'entity', cardStyle: '老版金卡', balance: 200, points: 3200, status: 'locked', issueTime: '2022-03-01', validUntil: '2025-03-01' }
]);

initModule('member/growth', ['member', 'currentValue', 'level', 'taskGrowth', 'spendGrowth', 'validUntil'], [
  { member: '张三', currentValue: 6200, level: 'GOLD', taskGrowth: 1200, spendGrowth: 5000, validUntil: '2025-12-31' },
  { member: '李四', currentValue: 1500, level: 'SILVER', taskGrowth: 300, spendGrowth: 1200, validUntil: '2025-12-31' },
  { member: '王五', currentValue: 500, level: 'NORMAL', taskGrowth: 100, spendGrowth: 400, validUntil: '2025-12-31' }
]);

initModule('member/assets', ['member', 'balance', 'points', 'couponCount', 'benefitCount', 'totalValue'], [
  { member: '张三', balance: 500, points: 6200, couponCount: 8, benefitCount: 3, totalValue: 1500 },
  { member: '李四', balance: 100, points: 1500, couponCount: 3, benefitCount: 1, totalValue: 320 },
  { member: '王五', balance: 0, points: 500, couponCount: 1, benefitCount: 0, totalValue: 50 }
]);

initModule('member/referrals', ['referrer', 'invitee', 'time', 'channel', 'rewardStatus', 'referrerReward', 'inviteeReward'], [
  { referrer: '张三', invitee: '李四', time: '2023-05-10', channel: 'share', rewardStatus: 'done', referrerReward: '100积分', inviteeReward: '50积分' },
  { referrer: '张三', invitee: '王五', time: '2023-11-20', channel: 'qr', rewardStatus: 'done', referrerReward: '100积分', inviteeReward: '50积分' },
  { referrer: '李四', invitee: '赵六', time: '2024-03-15', channel: 'link', rewardStatus: 'pending', referrerReward: '100积分', inviteeReward: '50积分' }
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

initModule('marketing/campaigns', ['name', 'type', 'startTime', 'endTime', 'status', 'budget', 'usedBudget', 'groupbuyRules'], [
  { name: '618大促', type: 'promotion', startTime: '2024-06-18', endTime: '2024-06-20', status: 'enabled', budget: 50000, usedBudget: 0 },
  { name: '三人拼团活动', type: 'groupbuy', startTime: '2024-07-15', endTime: '2024-07-30', status: 'enabled', budget: 10000, usedBudget: 3500, groupbuyRules: [{ payAmount: 50, deductAmount: 100 }, { payAmount: 200, deductAmount: 450 }] }
]);

initModule('marketing/coupons', ['name', 'campaign', 'template', 'count', 'claimed'], [
  { name: '618发券', campaign: '618大促', template: '满200减30', count: 100, claimed: 45 }
]);

initModule('marketing/groupbuy', ['name', 'payAmount', 'deductAmount', 'minCount', 'joined', 'status'], [
  { name: '三人拼团', payAmount: 50, deductAmount: 100, minCount: 3, joined: 15, status: 'enabled' }
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

initModule('marketing/douyin-coupon', ['name', 'douyinCode', 'douyinTemplateId', 'reward', 'couponTemplate', 'totalIssued', 'exchanged', 'verifiedCount', 'douyinVerifyAmount', 'platformVerifyAmount', 'diffAmount', 'reconcileStatus', 'lastReconcileTime', 'reconcileOperator', 'reconcileRemark', 'validFrom', 'validTo', 'status'], [
  { name: '抖音团购券活动', douyinCode: 'DY2024001', douyinTemplateId: 'dy_temp_001', reward: '双人套餐', couponTemplate: '满200减50', totalIssued: 500, exchanged: 45, verifiedCount: 32, douyinVerifyAmount: 6400, platformVerifyAmount: 6400, diffAmount: 0, reconcileStatus: 'matched', lastReconcileTime: '2024-07-19 09:00:00', reconcileOperator: '运营A', reconcileRemark: '', validFrom: '2024-07-01', validTo: '2024-07-31', status: 'enabled' },
  { name: '抖音新客专享', douyinCode: 'DY2024002', douyinTemplateId: 'dy_temp_002', reward: '50元代金券', couponTemplate: '50元代金券', totalIssued: 1000, exchanged: 156, verifiedCount: 89, douyinVerifyAmount: 4450, platformVerifyAmount: 4400, diffAmount: 50, reconcileStatus: 'unmatched', lastReconcileTime: '2024-07-19 09:00:00', reconcileOperator: '运营A', reconcileRemark: '有1单差异待核实', validFrom: '2024-07-10', validTo: '2024-08-10', status: 'enabled' }
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

initModule('shop/goods', ['name', 'spuCode', 'subtitle', 'mainImage', 'detailImages', 'category', 'specs', 'skuInfo', 'price', 'originalPrice', 'costPrice', 'stock', 'sales', 'tags', 'group', 'isVirtual', 'limitBuy', 'minBuy', 'weight', 'volume', 'views', 'favorites', 'sellingPoint', 'sort', 'status'], [
  { name: '纯棉T恤', spuCode: 'SPU20240001', subtitle: '夏季纯棉透气T恤', mainImage: 'https://example.com/tshirt.jpg', detailImages: 'https://example.com/detail1.jpg', category: '服装', specs: '颜色:白色,黑色;尺寸:S,M,L', skuInfo: '白色/S:100;白色/M:50', price: 99, originalPrice: 129, costPrice: 40, stock: 200, sales: 50, tags: '新品,热销', group: '夏季新品', isVirtual: 'no', limitBuy: 5, minBuy: 1, weight: 0.3, volume: 0.01, views: 1200, favorites: 86, sellingPoint: '100%纯棉透气舒适', sort: 1, status: 'enabled' },
  { name: '蓝牙耳机', spuCode: 'SPU20240002', subtitle: '无线降噪蓝牙耳机', mainImage: 'https://example.com/earphone.jpg', detailImages: 'https://example.com/detail2.jpg', category: '数码', specs: '颜色:白色,黑色', skuInfo: '白色:60;黑色:40', price: 299, originalPrice: 399, costPrice: 120, stock: 100, sales: 30, tags: '数码,降噪', group: '数码热卖', isVirtual: 'no', limitBuy: 2, minBuy: 1, weight: 0.2, volume: 0.005, views: 2300, favorites: 152, sellingPoint: '主动降噪长续航', sort: 2, status: 'enabled' },
  { name: '视频会员月卡', spuCode: 'SPU20240003', subtitle: '视频网站月度会员', mainImage: 'https://example.com/vip.jpg', detailImages: '', category: '虚拟商品', specs: '', skuInfo: '默认', price: 25, originalPrice: 30, costPrice: 15, stock: 9999, sales: 120, tags: '虚拟', group: '虚拟商品', isVirtual: 'yes', limitBuy: 1, minBuy: 1, weight: 0, volume: 0, views: 580, favorites: 30, sellingPoint: '自动发货即时开通', sort: 3, status: 'enabled' }
]);

initModule('shop/orders', ['orderNo', 'member', 'goods', 'quantity', 'items', 'amount', 'freight', 'actualAmount', 'receiverName', 'receiverPhone', 'receiverAddress', 'logisticsCompany', 'logisticsNo', 'payMethod', 'payTime', 'shipTime', 'doneTime', 'remark', 'tags', 'source', 'afterSaleStatus', 'status', 'time'], [
  { orderNo: 'O20240601001', member: '张三', goods: '纯棉T恤', quantity: 1, items: '纯棉T恤 x1', amount: 99, freight: 0, actualAmount: 99, receiverName: '张三', receiverPhone: '13800138001', receiverAddress: '北京市朝阳区xx路xx号', logisticsCompany: '顺丰', logisticsNo: 'SF1234567890', payMethod: 'wechat', payTime: '2024-06-01 10:05', shipTime: '2024-06-01 15:00', doneTime: '2024-06-03 12:00', remark: '', tags: '正常订单', source: 'miniapp', afterSaleStatus: 'none', status: 'done', time: '2024-06-01 10:00' },
  { orderNo: 'O20240601002', member: '李四', goods: '蓝牙耳机', quantity: 1, items: '蓝牙耳机 x1', amount: 299, freight: 10, actualAmount: 309, receiverName: '李四', receiverPhone: '13900139002', receiverAddress: '上海市浦东新区xx路xx号', logisticsCompany: '中通', logisticsNo: 'ZT9876543210', payMethod: 'alipay', payTime: '2024-06-01 11:00', shipTime: '2024-06-02 09:00', doneTime: '', remark: '请尽快发货', tags: 'VIP客户', source: 'wxapp', afterSaleStatus: 'none', status: 'shipped', time: '2024-06-01 10:55' },
  { orderNo: 'O20240601003', member: '王五', goods: '视频会员月卡', quantity: 1, items: '视频会员月卡 x1', amount: 25, freight: 0, actualAmount: 25, receiverName: '王五', receiverPhone: '13700137003', receiverAddress: '', logisticsCompany: '', logisticsNo: '', payMethod: 'balance', payTime: '2024-06-01 12:00', shipTime: '', doneTime: '2024-06-01 12:00', remark: '虚拟商品自动发货', tags: '虚拟', source: 'miniapp', afterSaleStatus: 'none', status: 'done', time: '2024-06-01 11:55' }
]);

initModule('shop/categories', ['name', 'parentId', 'icon', 'image', 'description', 'showInNav', 'sort', 'status'], [
  { name: '服装', parentId: 0, icon: '👕', image: 'https://example.com/cat-clothing.png', description: '各类服装商品', showInNav: 'yes', sort: 1, status: 'enabled' },
  { name: '数码', parentId: 0, icon: '📱', image: 'https://example.com/cat-digital.png', description: '数码电子产品', showInNav: 'yes', sort: 2, status: 'enabled' },
  { name: '男装', parentId: 1, icon: '👨', image: 'https://example.com/cat-men.png', description: '男士服装', showInNav: 'no', sort: 1, status: 'enabled' },
  { name: '女装', parentId: 1, icon: '👩', image: 'https://example.com/cat-women.png', description: '女士服装', showInNav: 'no', sort: 2, status: 'enabled' }
]);

initModule('shop/home-config', ['name', 'pageType', 'components', 'sort', 'status'], [
  { name: '首页配置', pageType: 'home', components: '[{"id":"comp_1","type":"search","name":"搜索框","config":{"placeholder":"搜索商品","style":"round","bgColor":"#f5f5f5"}},{"id":"comp_2","type":"banner","name":"轮播图","config":{"items":[{"image":"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=e-commerce%20promotion%20banner%20with%20sale%20discount%20modern%20design&image_size=landscape_16_9","link":"","title":"限时特惠"},{"image":"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20product%20showcase%20banner%20fashion%20shopping&image_size=landscape_16_9","link":"","title":"新品上市"}],"height":160,"autoPlay":true,"interval":3,"indicatorStyle":"dot"}},{"id":"comp_3","type":"navGrid","name":"图片导航","config":{"items":[{"image":"","text":"服装","link":""},{"image":"","text":"数码","link":""},{"image":"","text":"家居","link":""},{"image":"","text":"美食","link":""},{"image":"","text":"美妆","link":""},{"image":"","text":"运动","link":""},{"image":"","text":"母婴","link":""},{"image":"","text":"更多","link":""}],"columns":4,"showText":true}},{"id":"comp_4","type":"title","name":"标题栏","config":{"title":"限时秒杀","align":"left","showMore":true,"moreText":"查看更多","color":"#333","bgColor":"#fff"}},{"id":"comp_5","type":"flashSale","name":"限时秒杀","config":{"title":"限时秒杀","subtitle":"好物限时抢","bgColor":"#fff2f0","countdown":true,"goodsCount":3}}]', sort: 1, status: 'enabled' }
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

initModule('shop/specs', ['name', 'values', 'sort', 'status'], [
  { name: '颜色', values: '红色,蓝色,白色,黑色', sort: 1, status: 'enabled' },
  { name: '尺寸', values: 'S,M,L,XL,XXL', sort: 2, status: 'enabled' },
  { name: '版本', values: '标准版,豪华版,尊享版', sort: 3, status: 'enabled' }
]);

initModule('shop/reviews', ['goods', 'member', 'score', 'content', 'images', 'reply', 'type', 'anonymous', 'status'], [
  { goods: '纯棉T恤', member: '张三', score: 5, content: '质量很好，面料舒服，会回购！', images: 'https://example.com/r1.jpg', reply: '感谢支持！', type: 'good', anonymous: 'no', status: 'published' },
  { goods: '蓝牙耳机', member: '李四', score: 4, content: '音质不错，降噪效果好，但续航一般。', images: '', reply: '', type: 'good', anonymous: 'no', status: 'published' },
  { goods: '纯棉T恤', member: '王五', score: 2, content: '尺码偏小，颜色与图片有色差。', images: 'https://example.com/r2.jpg', reply: '已联系客服处理', type: 'bad', anonymous: 'yes', status: 'pending' }
]);

initModule('shop/shipping-templates', ['name', 'chargeType', 'firstNum', 'firstPrice', 'addNum', 'addPrice', 'freeCondition', 'status'], [
  { name: '标准运费模板', chargeType: 'piece', firstNum: 1, firstPrice: 8, addNum: 1, addPrice: 2, freeCondition: '满99包邮', status: 'enabled' },
  { name: '按重计费模板', chargeType: 'weight', firstNum: 1, firstPrice: 10, addNum: 1, addPrice: 3, freeCondition: '满199包邮', status: 'enabled' },
  { name: '大件物流模板', chargeType: 'volume', firstNum: 1, firstPrice: 30, addNum: 1, addPrice: 10, freeCondition: '不包邮', status: 'enabled' }
]);

initModule('shop/addresses', ['member', 'receiver', 'phone', 'province', 'city', 'district', 'detail', 'isDefault', 'label'], [
  { member: '张三', receiver: '张三', phone: '13800138001', province: '北京市', city: '北京市', district: '朝阳区', detail: '建国路88号SOHO现代城A座1001', isDefault: 'yes', label: '家' },
  { member: '张三', receiver: '张三', phone: '13800138001', province: '北京市', city: '北京市', district: '海淀区', detail: '中关村大街1号', isDefault: 'no', label: '公司' },
  { member: '李四', receiver: '李四', phone: '13900139002', province: '上海市', city: '上海市', district: '浦东新区', detail: '张江高科技园区博云路2号', isDefault: 'yes', label: '公司' }
]);

initModule('shop/delivery', ['name', 'type', 'description', 'fee', 'status'], [
  { name: '快递配送', type: 'express', description: '全国快递配送，3-5天到达', fee: 8, status: 'enabled' },
  { name: '门店自提', type: 'selfpick', description: '下单后到指定门店自提', fee: 0, status: 'enabled' },
  { name: '同城配送', type: 'local', description: '同城2小时送达', fee: 15, status: 'enabled' }
]);

initModule('shop/groups', ['name', 'description', 'sort', 'status'], [
  { name: '夏季新品', description: '夏季新品推荐分组', sort: 1, status: 'enabled' },
  { name: '数码热卖', description: '数码热销商品分组', sort: 2, status: 'enabled' },
  { name: '虚拟商品', description: '虚拟商品自动发货分组', sort: 3, status: 'enabled' }
]);

initModule('shop/aftersale', ['aftersaleNo', 'orderNo', 'member', 'goods', 'type', 'reason', 'amount', 'status', 'applyTime', 'processTime', 'handler', 'processRemark'], [
  { aftersaleNo: 'AS20240601001', orderNo: 'O20240601001', member: '张三', goods: '纯棉T恤', type: 'return', reason: '尺码偏小，希望换大一号', amount: 99, status: 'approved', applyTime: '2024-06-03', processTime: '2024-06-04', handler: '客服小王', processRemark: '同意换货，已通知仓库发货' },
  { aftersaleNo: 'AS20240601002', orderNo: 'O20240601002', member: '李四', goods: '蓝牙耳机', type: 'refund', reason: '收到商品有划痕', amount: 309, status: 'applying', applyTime: '2024-06-05', processTime: '', handler: '', processRemark: '' },
  { aftersaleNo: 'AS20240601003', orderNo: 'O20240601003', member: '王五', goods: '视频会员月卡', type: 'refund', reason: '不需要了', amount: 25, status: 'refunded', applyTime: '2024-06-02', processTime: '2024-06-02', handler: '系统自动', processRemark: '虚拟商品自动退款' }
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

initModule('system/users', ['name', 'username', 'password', 'role', 'phone', 'email', 'department', 'lastLogin', 'passwordStatus', 'passwordResetTime', 'passwordExpireDays', 'needChangePassword', 'status'], [
  { name: '超级管理员', username: 'admin', password: 'admin123', role: 'admin', phone: '13800138000', email: 'admin@example.com', department: '技术部', lastLogin: '2024-07-15 09:30:00', passwordStatus: 'normal', passwordResetTime: '2024-06-01', passwordExpireDays: 90, needChangePassword: 'no', status: 'enabled' },
  { name: '运营小李', username: 'li', password: 'li123456', role: 'operator', phone: '13800138011', email: 'li@example.com', department: '运营部', lastLogin: '2024-07-18 14:20:00', passwordStatus: 'normal', passwordResetTime: '2024-06-15', passwordExpireDays: 90, needChangePassword: 'no', status: 'enabled' },
  { name: '客服小王', username: 'wang', password: 'wang123', role: 'service', phone: '13800138010', email: 'wang@example.com', department: '客服部', lastLogin: '2024-07-10 16:45:00', passwordStatus: 'needReset', passwordResetTime: '2024-04-01', passwordExpireDays: 90, needChangePassword: 'yes', status: 'enabled' }
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

initModule('property/points', ['owner', 'phone', 'property', 'buildingNo', 'roomNo', 'area', 'points', 'businessPoints', 'exchangeRatio', 'benefitInterconnect', 'memberLevel', 'memberBindTime', 'verifyStatus', 'verifyTime', 'verifyRemark', 'idCard', 'purchaseContract', 'ownerType', 'remark', 'status'], [
  { owner: '业主王先生', phone: '13900139001', property: '凯德壹中心住宅', buildingNo: 'A栋', roomNo: '1001', area: 120, points: 50000, businessPoints: 5000, exchangeRatio: '10:1', benefitInterconnect: 'enabled', memberLevel: 'GOLD', memberBindTime: '2024-01-15', verifyStatus: 'approved', verifyTime: '2024-01-10', verifyRemark: '资料齐全，审核通过', idCard: '430101********0001', purchaseContract: 'HT20230001', ownerType: 'residential', remark: 'VIP业主', status: 'enabled' },
  { owner: '业主李女士', phone: '13900139002', property: '凯德壹中心住宅', buildingNo: 'B栋', roomNo: '1502', area: 95, points: 32000, businessPoints: 3200, exchangeRatio: '10:1', benefitInterconnect: 'enabled', memberLevel: 'SILVER', memberBindTime: '2024-02-20', verifyStatus: 'approved', verifyTime: '2024-02-18', verifyRemark: '', idCard: '430101********0002', purchaseContract: 'HT20230002', ownerType: 'residential', remark: '', status: 'enabled' },
  { owner: '业主张先生', phone: '13900139003', property: '碧湘楚巷商铺', buildingNo: 'S1栋', roomNo: '105', area: 80, points: 80000, businessPoints: 0, exchangeRatio: '10:1', benefitInterconnect: 'disabled', memberLevel: '', memberBindTime: '', verifyStatus: 'pending', verifyTime: '', verifyRemark: '', idCard: '', purchaseContract: 'HT20230003', ownerType: 'commercial', remark: '待认证', status: 'enabled' }
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

// ===== 新增模块初始化 =====
initModule('member/points', ['member', 'points', 'historyPoints', 'expiringPoints', 'frozenPoints', 'expireDate', 'clearDate', 'totalEarned', 'totalUsed', 'status'], [
  { member: '张三', points: 6200, historyPoints: 0, expiringPoints: 200, frozenPoints: 0, expireDate: '2025-12-31', clearDate: '2025-12-31', totalEarned: 10000, totalUsed: 3800, status: 'enabled' },
  { member: '李四', points: 1500, historyPoints: 0, expiringPoints: 0, frozenPoints: 0, expireDate: '2025-12-31', clearDate: '2025-12-31', totalEarned: 3000, totalUsed: 1500, status: 'enabled' }
]);
initModule('parking/plates', ['member', 'plateNo', 'plateColor', 'vehicleType', 'bindTime', 'status'], [
  { member: '张三', plateNo: '京A12345', plateColor: 'blue', vehicleType: 'sedan', bindTime: '2024-01-15', status: 'enabled' },
  { member: '李四', plateNo: '沪B67890', plateColor: 'green', vehicleType: 'newEnergy', bindTime: '2024-03-20', status: 'enabled' }
]);
initModule('marketing/help-coupon', ['name', 'template', 'needHelp', 'helped', 'status'], [
  { name: '助力领券活动', template: '满50减10', needHelp: 3, helped: 156, status: 'enabled' }
]);
initModule('marketing/word-coupon', ['name', 'word', 'template', 'claimed', 'status'], [
  { name: '口令领券', word: '618狂欢', template: '满100减20', claimed: 89, status: 'enabled' }
]);
initModule('member/marketing-models', ['name', 'type', 'condition', 'audienceCount', 'status'], [
  { name: '高价值会员模型', type: 'smart', condition: '消费总额>5000', audienceCount: 86, status: 'enabled' },
  { name: '流失预警模型', type: 'smart', condition: '90天未消费', audienceCount: 42, status: 'enabled' }
]);
initModule('member/marketing-tasks', ['name', 'modelId', 'channel', 'template', 'sendTime', 'targetCount', 'sentCount', 'readCount', 'status'], [
  { name: '618促销推送', modelId: '高价值会员模型', channel: 'sms', template: '促销模板', sendTime: '2024-06-18 10:00', targetCount: 5000, sentCount: 5000, readCount: 2100, status: 'finished' }
]);
initModule('points/adjust', ['member', 'type', 'points', 'reason', 'operator', 'status', 'time'], [
  { member: '张三', type: 'add', points: 100, reason: '客服补偿', operator: 'admin', status: 'done', time: '2024-06-01' }
]);
initModule('points/transfer', ['fromMember', 'toMember', 'points', 'status', 'operator', 'time', 'remark'], [
  { fromMember: '张三', toMember: '李四', points: 500, status: 'done', operator: 'admin', time: '2024-06-01', remark: '活动奖励转移' }
]);
initModule('points/blacklist', ['member', 'phone', 'reason', 'type', 'operator', 'status', 'addTime'], [
  { member: '赵六', phone: '13600136006', reason: '恶意刷单', type: 'cheat', operator: 'admin', status: 'enabled', addTime: '2024-05-01' }
]);
initModule('points/cash-rule', ['name', 'project', 'channel', 'maxRatio', 'maxAmount', 'minAmount', 'maxTimesPerDay', 'validFrom', 'validTo', 'status'], [
  { name: '积分抵现规则', project: '凯德壹中心', channel: 'wechat', maxRatio: 0.3, maxAmount: 50, minAmount: 1, maxTimesPerDay: 3, validFrom: '2024-01-01', validTo: '2024-12-31', status: 'enabled' }
]);
initModule('points/risk', ['name', 'ruleType', 'threshold', 'action', 'status'], [
  { name: '异常积分监控', ruleType: 'frequency', threshold: 1000, action: 'freeze', status: 'enabled' }
]);
initModule('points/settle-rule', ['name', 'project', 'businessType', 'settleRatio', 'settleDate', 'period', 'priority', 'status'], [
  { name: '餐饮积分结算', project: '凯德壹中心', businessType: '餐饮', settleRatio: 0.05, settleDate: '每月5日', period: 'monthly', priority: 1, status: 'enabled' }
]);
initModule('points/settle-bill', ['billNo', 'project', 'merchant', 'period', 'totalPoints', 'settleAmount', 'status', 'createTime'], [
  { billNo: 'SB20240601', project: '凯德壹中心', merchant: '海底捞', period: '2024-05', totalPoints: 50000, settleAmount: 2500, status: 'pending', createTime: '2024-06-01' }
]);
initModule('points/photo', ['member', 'image', 'amount', 'points', 'shop', 'status', 'auditor', 'submitTime', 'auditTime'], [
  { member: '张三', image: 'https://example.com/receipt.jpg', amount: 200, points: 200, shop: '海底捞', status: 'approved', auditor: 'admin', submitTime: '2024-06-01', auditTime: '2024-06-02' }
]);
initModule('points/ocr-rule', ['name', 'shopType', 'fields', 'template', 'status'], [
  { name: '小票识别规则', shopType: '餐饮', fields: '金额,时间,商户', template: '标准模板', status: 'enabled' }
]);
initModule('coupon/packs', ['name', 'coupons', 'totalValue', 'sellPrice', 'pointsPrice', 'quantity', 'sold', 'validDays', 'status'], [
  { name: '新人券包', coupons: '满50减10,停车券1小时', totalValue: 60, sellPrice: 0, pointsPrice: 0, quantity: 1000, sold: 856, validDays: 30, status: 'enabled' }
]);
initModule('selfpoints/config', ['name', 'type', 'project', 'enabled', 'wechatMallId', 'alipayMallId', 'status'], [
  { name: '自助积分配置', type: 'mall', project: '凯德壹中心', enabled: 'yes', wechatMallId: 'wx123', alipayMallId: 'ali456', status: 'enabled' }
]);
initModule('shop/fullcut', ['name', 'rules', 'startTime', 'endTime', 'applyRange', 'status'], [
  { name: '满减活动', rules: '满100减20;满200减50', startTime: '2024-06-18', endTime: '2024-06-20', applyRange: '全店', status: 'enabled' }
]);
initModule('shop/presale', ['name', 'goods', 'depositAmount', 'finalAmount', 'depositStartTime', 'finalPayTime', 'stock', 'sold', 'status'], [
  { name: '预售活动', goods: '新款T恤', depositAmount: 20, finalAmount: 79, depositStartTime: '2024-06-01', finalPayTime: '2024-06-15', stock: 100, sold: 45, status: 'enabled' }
]);
initModule('shop/bargain', ['name', 'goods', 'originalPrice', 'floorPrice', 'helpCount', 'startedCount', 'startTime', 'endTime', 'status'], [
  { name: '砍价活动', goods: '奶茶', originalPrice: 18, floorPrice: 0, helpCount: 5, startedCount: 20, startTime: '2024-06-18', endTime: '2024-06-20', status: 'enabled' }
]);
initModule('merchant/sales-report', ['merchant', 'reportDate', 'amount', 'orderCount', 'points', 'reporter', 'status'], [
  { merchant: '海底捞', reportDate: '2024-06-01', amount: 5000, orderCount: 120, points: 5000, reporter: '王经理', status: 'submitted' }
]);
initModule('service/chats', ['member', 'memberNickname', 'questionType', 'lastMessage', 'status', 'agent', 'startTime', 'endTime', 'replyContent'], [
  { member: '张三', memberNickname: '张三', questionType: '积分咨询', lastMessage: '我的积分怎么少了', status: 'open', agent: '客服小王', startTime: '2024-06-01 10:00', endTime: '', replyContent: '' }
]);
initModule('service/ai-kb', ['title', 'category', 'answer', 'similarQuestions', 'keywords', 'usedCount', 'status'], [
  { title: '如何查询积分', category: '积分', answer: '在小程序个人中心查看积分余额', similarQuestions: '积分在哪看', keywords: '积分,查询', usedCount: 150, status: 'enabled' }
]);
initModule('shop/carts', ['member', 'goods', 'specs', 'quantity', 'price', 'discount', 'addTime', 'status'], [
  { member: '张三', goods: '纯棉T恤', specs: '白色/M', quantity: 1, price: 99, discount: 0, addTime: '2024-06-01', status: 'enabled' }
]);
initModule('property/points-approval', ['member', 'taskType', 'taskName', 'points', 'submitTime', 'status', 'auditor', 'auditTime', 'remark'], [
  { member: '业主王先生', taskType: '建言', taskName: '小区绿化建议', points: 50, submitTime: '2024-06-01', status: 'approved', auditor: 'admin', auditTime: '2024-06-02', remark: '建议采纳' }
]);
initModule('public-domain/douyin-pass', ['douyinUser', 'member', 'bindTime', 'syncStatus', 'verificationPoints', 'promotion', 'remark'], [
  { douyinUser: 'dy123456', member: '张三', bindTime: '2024-05-01', syncStatus: 'synced', verificationPoints: 100, promotion: '抖音新会员', remark: '' }
]);
initModule('public-domain/xhs', ['name', 'type', 'publishTime', 'participantCount', 'registerCount', 'verificationCount', 'status', 'couponTemplate', 'remark'], [
  { name: '小红书引流', type: 'post', publishTime: '2024-06-01', participantCount: 500, registerCount: 120, verificationCount: 80, status: 'enabled', couponTemplate: '满50减10', remark: '' }
]);
initModule('merchant/notifications', ['title', 'type', 'content', 'targetMerchant', 'sendTime', 'channel', 'readStatus'], [
  { title: '系统维护通知', type: 'system', content: '今晚22点系统维护', targetMerchant: '全部门店', sendTime: '2024-06-01', channel: 'sms', readStatus: 'unread' }
]);
initModule('merchant/training', ['title', 'category', 'format', 'content', 'trainingTime', 'materials', 'participantCount', 'completionRate', 'status'], [
  { title: '新系统培训', category: '系统操作', format: 'video', content: '系统操作指南', trainingTime: '2024-06-01', materials: '培训手册.pdf', participantCount: 20, completionRate: 0.85, status: 'enabled' }
]);
initModule('content/articles', ['title', 'category', 'coverImage', 'content', 'publishTime', 'readCount', 'status'], [
  { title: '商场活动预告', category: '活动', coverImage: '', content: '本周六有精彩演出', publishTime: '2024-06-01', readCount: 1200, status: 'published' }
]);
initModule('content/posters', ['name', 'category', 'image', 'activity', 'createTime', 'usedCount', 'status'], [
  { name: '618海报', category: '促销', image: '', activity: '618大促', createTime: '2024-06-01', usedCount: 50, status: 'enabled' }
]);
initModule('applet/search', ['keyword', 'type', 'target', 'weight', 'clickCount', 'status'], [
  { keyword: '海底捞', type: 'merchant', target: '海底捞', weight: 10, clickCount: 500, status: 'enabled' }
]);
initModule('applet/audience', ['name', 'type', 'conditions', 'size', 'createTime', 'updateTime', 'status'], [
  { name: '高消费人群', type: 'tag', conditions: '消费>5000', size: 86, createTime: '2024-06-01', updateTime: '2024-06-01', status: 'enabled' }
]);
initModule('system/staff', ['name', 'phone', 'role', 'shop', 'status'], [
  { name: '客服小王', phone: '13800138010', role: '客服', shop: '总店', status: 'enabled' },
  { name: '运营小李', phone: '13800138011', role: '运营', shop: '总店', status: 'enabled' },
  { name: 'admin', phone: '13800138012', role: '管理员', shop: '总店', status: 'enabled' }
]);
initModule('services/items', ['name', 'price', 'duration', 'shop', 'status'], [
  { name: '面部护理', price: 298, duration: 60, shop: '总店', status: 'enabled' },
  { name: '按摩理疗', price: 188, duration: 45, shop: '总店', status: 'enabled' },
  { name: '健身私教', price: 500, duration: 60, shop: '总店', status: 'enabled' }
]);

// AI小票
initModule('ai/receipt-audit', ['member', 'amount', 'aiAmount', 'aiStatus', 'auditStatus', 'pointsIssued', 'merchant', 'receiptImage', 'submitTime', 'auditRemark'], [
  { member: '张三', amount: 258, aiAmount: 258, aiStatus: 'success', auditStatus: 'approved', pointsIssued: 258, merchant: '星巴克', submitTime: '2024-07-10' },
  { member: '李四', amount: 89, aiAmount: 89, aiStatus: 'success', auditStatus: 'pending', pointsIssued: 0, merchant: '海底捞', submitTime: '2024-07-11' },
  { member: '王五', amount: 1500, aiAmount: 0, aiStatus: 'failed', auditStatus: 'pending', pointsIssued: 0, merchant: '优衣库', submitTime: '2024-07-12' },
]);
initModule('ai/receipt-rules', ['name', 'pointsPerYuan', 'maxPoints', 'dailyLimit', 'applicableMerchant', 'minAmount', 'status'], [
  { name: '全场通用规则', pointsPerYuan: 1, maxPoints: 500, dailyLimit: 3, applicableMerchant: '', minAmount: 10, status: 'enabled' },
  { name: '餐饮专属规则', pointsPerYuan: 2, maxPoints: 300, dailyLimit: 5, applicableMerchant: '海底捞', minAmount: 50, status: 'enabled' },
]);

// 广告推广
initModule('ad/config', ['name', 'type', 'position', 'imageUrl', 'linkUrl', 'startTime', 'endTime', 'sort', 'targetGroup', 'status'], [
  { name: '暑期大促Banner', type: 'banner', position: 'home', imageUrl: '/ads/summer-banner.jpg', linkUrl: '/activity/summer', startTime: '2024-07-01', endTime: '2024-08-31', sort: 1, targetGroup: 'all', status: 'enabled' },
  { name: '新会员弹窗', type: 'popup', position: 'home', imageUrl: '/ads/new-member.jpg', linkUrl: '/coupon/new-member', startTime: '2024-07-01', endTime: '2024-12-31', sort: 1, targetGroup: 'new', status: 'enabled' },
  { name: '启动页广告', type: 'splash', position: 'home', imageUrl: '/ads/splash-brand.jpg', linkUrl: '/brand', startTime: '2024-07-01', endTime: '2024-07-31', sort: 1, targetGroup: 'all', status: 'enabled' },
]);
initModule('ad/precise', ['name', 'adId', 'targetGroup', 'tags', 'impressions', 'clicks', 'startTime', 'endTime', 'status'], [
  { name: '高消费会员定向投放', adId: '暑期大促Banner', targetGroup: 'custom', tags: '高消费,金卡会员', impressions: 5280, clicks: 432, startTime: '2024-07-01', endTime: '2024-08-31', status: 'enabled' },
  { name: '沉睡会员唤醒投放', adId: '新会员弹窗', targetGroup: 'inactive', tags: '', impressions: 3200, clicks: 156, startTime: '2024-07-01', endTime: '2024-08-31', status: 'enabled' },
]);

// 客服管理
initModule('cs/knowledge', ['category', 'question', 'answer', 'keywords', 'sort', 'status'], [
  { category: 'member', question: '如何注册会员？', answer: '进入小程序点击"我的"即可快速注册成为会员', keywords: '注册,会员,加入', sort: 1, status: 'enabled' },
  { category: 'points', question: '积分怎么获取？', answer: '消费积分、签到积分、活动积分等多种方式', keywords: '积分,获取,赚取', sort: 2, status: 'enabled' },
  { category: 'parking', question: '停车费怎么交？', answer: '小程序"智慧停车"模块可直接缴费', keywords: '停车,缴费,停车费', sort: 3, status: 'enabled' },
]);
initModule('cs/auto-reply', ['name', 'keyword', 'replyContent', 'matchType', 'priority', 'status'], [
  { name: '营业时间回复', keyword: '营业时间', replyContent: '商场营业时间为10:00-22:00，欢迎光临！', matchType: 'fuzzy', priority: 1, status: 'enabled' },
  { name: 'WiFi回复', keyword: 'WiFi|wifi|无线网', replyContent: '商场免费WiFi：HW-Mall，密码：88888888', matchType: 'regex', priority: 2, status: 'enabled' },
]);
initModule('cs/ai-training', ['name', 'corpusCount', 'modelVersion', 'trainingParams', 'status', 'accuracy', 'updateTime'], [
  { name: '商业体行业语料训练', corpusCount: 5200, modelVersion: 'v3.2', trainingParams: '{"epochs": 50, "lr": 0.001}', status: 'completed', accuracy: 87.5, updateTime: '2024-07-01' },
  { name: '停车场景语料补充', corpusCount: 800, modelVersion: 'v3.3', trainingParams: '{"epochs": 30, "lr": 0.002}', status: 'pending', accuracy: 0, updateTime: '' },
]);
initModule('cs/staff', ['name', 'staffNo', 'workTime', 'maxSessions', 'transferRule', 'skillTags', 'onlineStatus', 'status'], [
  { name: '王小美', staffNo: 'CS001', workTime: '09:00-18:00', maxSessions: 8, transferRule: 'idle', skillTags: '会员,积分', onlineStatus: 'online', status: 'enabled' },
  { name: '李大强', staffNo: 'CS002', workTime: '14:00-22:00', maxSessions: 6, transferRule: 'skill', skillTags: '停车,优惠券', onlineStatus: 'offline', status: 'enabled' },
]);

// 搜索管理
initModule('search/hotwords', ['word', 'searchCount', 'type', 'sort', 'status'], [
  { word: '停车缴费', searchCount: 12580, type: 'auto', sort: 1, status: 'enabled' },
  { word: '积分兑换', searchCount: 8920, type: 'auto', sort: 2, status: 'enabled' },
  { word: '优惠券', searchCount: 6540, type: 'auto', sort: 3, status: 'enabled' },
  { word: '海底捞', searchCount: 4320, type: 'auto', sort: 4, status: 'enabled' },
  { word: '暑期活动', searchCount: 0, type: 'manual', sort: 5, status: 'enabled' },
]);
initModule('search/scope', ['moduleName', 'searchFields', 'weight', 'status'], [
  { moduleName: 'merchant', searchFields: 'name,category,brand', weight: 10, status: 'enabled' },
  { moduleName: 'goods', searchFields: 'name,category,brand,description', weight: 8, status: 'enabled' },
  { moduleName: 'activity', searchFields: 'name,type,description', weight: 6, status: 'enabled' },
  { moduleName: 'coupon', searchFields: 'name,type,description', weight: 5, status: 'enabled' },
  { moduleName: 'brand', searchFields: 'name,category', weight: 4, status: 'enabled' },
]);

// 停车券管理
initModule('parking/coupons', ['name', 'type', 'value', 'issueType', 'exchangePoints', 'parkingLot', 'validDays', 'totalQuota', 'usedQuota', 'status'], [
  { name: '1小时停车券', type: 'time', value: 1, issueType: 'auto', exchangePoints: 0, parkingLot: 'B1停车场', validDays: 30, totalQuota: 1000, usedQuota: 356, status: 'enabled' },
  { name: '2小时停车券', type: 'time', value: 2, issueType: 'exchange', exchangePoints: 200, parkingLot: 'B1停车场', validDays: 30, totalQuota: 500, usedQuota: 128, status: 'enabled' },
  { name: '5元停车抵扣券', type: 'amount', value: 5, issueType: 'manual', exchangePoints: 0, parkingLot: 'B2停车场', validDays: 7, totalQuota: 2000, usedQuota: 890, status: 'enabled' },
  { name: 'VIP全免停车券', type: 'free', value: 0, issueType: 'auto', exchangePoints: 0, parkingLot: 'B1停车场', validDays: 1, totalQuota: 100, usedQuota: 23, status: 'enabled' },
]);

// 公域运营增强
initModule('channel/douyin-member', ['syncType', 'douyinOpenid', 'member', 'syncStatus', 'syncTime', 'remark'], [
  { syncType: 'register', douyinOpenid: 'dy_user_001', member: '张三', syncStatus: 'success', syncTime: '2024-07-10', remark: '抖音引流注册' },
  { syncType: 'verify', douyinOpenid: 'dy_user_002', member: '李四', syncStatus: 'success', syncTime: '2024-07-11', remark: '核销自动积分+50' },
  { syncType: 'info', douyinOpenid: 'dy_user_003', member: '王五', syncStatus: 'pending', syncTime: '', remark: '信息同步待处理' },
]);
initModule('channel/meituan-config', ['name', 'appId', 'appSecret', 'callbackUrl', 'merchantCount', 'status'], [
  { name: '美团团购配置', appId: 'mt_app_1a2b3c', appSecret: '***', callbackUrl: 'https://api.example.com/meituan/callback', merchantCount: 12, status: 'enabled' },
]);
initModule('channel/meituan-verify', ['couponCode', 'merchant', 'verifyType', 'verifyStatus', 'benefitIssued', 'verifyTime', 'remark'], [
  { couponCode: 'MT20240710001', merchant: '星巴克', verifyType: 'verify', verifyStatus: 'success', benefitIssued: 'yes', verifyTime: '2024-07-10', remark: '核销后自动发放50积分' },
  { couponCode: 'MT20240710002', merchant: '海底捞', verifyType: 'verify', verifyStatus: 'revoked', benefitIssued: 'no', verifyTime: '2024-07-11', remark: '用户退款已撤销' },
]);
initModule('channel/meituan-orders', ['meituanOrderNo', 'merchant', 'goodsName', 'amount', 'syncStatus', 'orderStatus', 'syncTime'], [
  { meituanOrderNo: 'MT_ORD_001', merchant: '星巴克', goodsName: '大杯拿铁', amount: 38, syncStatus: 'synced', orderStatus: 'used', syncTime: '2024-07-10' },
  { meituanOrderNo: 'MT_ORD_002', merchant: '海底捞', goodsName: '4人套餐', amount: 298, syncStatus: 'synced', orderStatus: 'paid', syncTime: '2024-07-11' },
  { meituanOrderNo: 'MT_ORD_003', merchant: '优衣库', goodsName: '夏装满减', amount: 0, syncStatus: 'failed', orderStatus: 'unpaid', syncTime: '' },
]);
initModule('marketing/prizes', ['name', 'type', 'value', 'stock', 'used', 'status'], [
  { name: '100积分', type: 'points', value: 100, stock: 9999, used: 0, status: 'enabled' },
  { name: '500积分', type: 'points', value: 500, stock: 9999, used: 0, status: 'enabled' },
  { name: '10元停车券', type: 'parking', value: 10, stock: 500, used: 0, status: 'enabled' },
  { name: '满100减10券', type: 'coupon', value: 10, stock: 9999, used: 0, status: 'enabled' },
  { name: '满200减30券', type: 'coupon', value: 30, stock: 9999, used: 0, status: 'enabled' },
  { name: '5元红包', type: 'redpacket', value: 5, stock: 9999, used: 0, status: 'enabled' },
  { name: '蓝牙耳机', type: 'goods', value: 199, stock: 100, used: 0, status: 'enabled' },
  { name: '电影票', type: 'goods', value: 80, stock: 200, used: 0, status: 'enabled' }
]);
initModule('system/merchants', ['name', 'category', 'floor', 'phone', 'businessHours', 'status'], [
  { name: '肯德基', category: '餐饮', floor: 'F1', phone: '0731-88888001', businessHours: '07:00-23:00', status: 'enabled' },
  { name: '星巴克', category: '餐饮', floor: 'F1', phone: '0731-88888002', businessHours: '08:00-22:00', status: 'enabled' },
  { name: '优衣库', category: '零售', floor: 'F2', phone: '0731-88888003', businessHours: '10:00-22:00', status: 'enabled' },
  { name: '屈臣氏', category: '零售', floor: 'F2', phone: '0731-88888004', businessHours: '10:00-22:00', status: 'enabled' },
  { name: '万达影城', category: '娱乐', floor: 'F3', phone: '0731-88888005', businessHours: '10:00-24:00', status: 'enabled' },
  { name: '美甲店', category: '服务', floor: 'F4', phone: '0731-88888006', businessHours: '10:00-22:00', status: 'enabled' }
]);
initModule('system/departments', ['name', 'manager', 'memberCount', 'status'], [
  { name: '运营部', manager: '张三', memberCount: 12, status: 'enabled' },
  { name: '市场部', manager: '李四', memberCount: 8, status: 'enabled' },
  { name: '客服部', manager: '王五', memberCount: 20, status: 'enabled' },
  { name: '技术部', manager: '赵六', memberCount: 15, status: 'enabled' }
]);
initModule('system/projects', ['name', 'code', 'businessType', 'address', 'cooperationParty', 'contactPerson', 'contactPhone', 'adminName', 'adminAccount', 'memberCount', 'maxMembers', 'dataIsolation', 'isolationRule', 'billingMode', 'billingConfig', 'enabledModules', 'resourceQuota', 'contractPeriod', 'remark', 'status', 'createdAt'], [
  { name: '凯德壹中心', code: 'KDYZX', businessType: 'shopping', address: '长沙市岳麓区', cooperationParty: '凯德集团', contactPerson: '李总', contactPhone: '13800138001', adminName: 'admin', adminAccount: 'admin', memberCount: 12580, maxMembers: 50000, dataIsolation: 'no', isolationRule: '按项目隔离', billingMode: 'full', billingConfig: '全功能计费', enabledModules: '全部', resourceQuota: '无限', contractPeriod: '2024-2026', remark: '', status: 'enabled', createdAt: '2024-01-01' },
  { name: '碧湘楚巷', code: 'BXCX', businessType: 'scenic', address: '长沙市天心区', cooperationParty: '碧湘集团', contactPerson: '王总', contactPhone: '13900139002', adminName: 'admin2', adminAccount: 'admin2', memberCount: 3200, maxMembers: 30000, dataIsolation: 'no', isolationRule: '按项目隔离', billingMode: 'basic', billingConfig: '基础版计费', enabledModules: '基础模块', resourceQuota: '有限', contractPeriod: '2024-2025', remark: '', status: 'enabled', createdAt: '2024-03-01' }
]);
initModule('restaurant/cuisine', ['name', 'icon', 'description', 'sort', 'shopCount', 'status'], [
  { name: '湘菜', icon: '', description: '湖南特色菜系', sort: 1, shopCount: 15, status: 'enabled' },
  { name: '川菜', icon: '', description: '四川麻辣风味', sort: 2, shopCount: 8, status: 'enabled' }
]);
initModule('restaurant/dishes', ['name', 'shopName', 'cuisine', 'mainImage', 'price', 'description', 'ingredients', 'taste', 'isRecommend', 'sort', 'status'], [
  { name: '剁椒鱼头', shopName: '湘阁里辣', cuisine: '湘菜', mainImage: '', price: 88, description: '经典湘菜', ingredients: '鱼头,剁椒', taste: 'spicy', isRecommend: 'yes', sort: 1, status: 'enabled' }
]);
initModule('member/merge', ['mainAccount', 'mergedAccount', 'reason', 'pointsBefore', 'pointsAfter', 'remark', 'operator', 'mergedAt', 'status'], [
  { mainAccount: '13800138001', mergedAccount: '13800138002', reason: 'duplicate', pointsBefore: 5000, pointsAfter: 7000, remark: '重复注册合并', operator: 'admin', mergedAt: '2024-06-01', status: 'done' }
]);

initModule('member/upgrade-gift-log', ['member', 'phone', 'fromLevel', 'toLevel', 'points', 'coupons', 'parkingHours', 'triggerType', 'status', 'failReason', 'operator', 'remark', 'createdAt'], [
  { member: '张三', phone: '13800138001', fromLevel: '普通会员', toLevel: '银卡会员', points: 200, coupons: '满50减10元券', parkingHours: 2, triggerType: 'auto', status: 'success', failReason: '', operator: 'system', remark: '成长值达标自动升级', createdAt: '2024-05-15 14:30' },
  { member: '李四', phone: '13800138002', fromLevel: '银卡会员', toLevel: '金卡会员', points: 500, coupons: '满100减30元券,生日券', parkingHours: 4, triggerType: 'auto', status: 'success', failReason: '', operator: 'system', remark: '消费金额达标自动升级', createdAt: '2024-06-01 10:00' },
  { member: '王五', phone: '13800138003', fromLevel: '金卡会员', toLevel: '钻石会员', points: 1000, coupons: '满200减50元券,专属权益券', parkingHours: 8, triggerType: 'manual', status: 'success', failReason: '', operator: 'admin', remark: '手动补发升级礼包', createdAt: '2024-06-05 16:20' }
]);

initModule('channel/redemptions', ['channel', 'channelRedemptionId', 'couponCode', 'platformTemplateId', 'merchantId', 'merchantName', 'shopId', 'shopName', 'platformShopId', 'operator', 'redemptionTime', 'originalAmount', 'discountAmount', 'remainingAmount', 'status', 'revokeStatus', 'revokeReason', 'revokeTime', 'revokeOperator', 'revokeFailureReason', 'deviceId', 'notes'], [
  { channel: 'douyin', channelRedemptionId: 'dy_red_001', couponCode: 'DY202407100001', platformTemplateId: 'dy_temp_001', merchantId: 1, merchantName: '星巴克', shopId: 1, shopName: '总店', platformShopId: 'poi_123', operator: '收银员A', redemptionTime: '2024-07-10 14:30:00', originalAmount: 150, discountAmount: 50, remainingAmount: 100, status: 'verified', revokeStatus: 'none', revokeReason: '', revokeTime: '', revokeOperator: '', revokeFailureReason: '', deviceId: 'pad_001', notes: '' },
  { channel: 'meituan', channelRedemptionId: 'mt_red_001', couponCode: 'MT202407100001', platformTemplateId: 'mt_temp_001', merchantId: 1, merchantName: '星巴克', shopId: 1, shopName: '总店', platformShopId: 'mt_456', operator: '收银员A', redemptionTime: '2024-07-10 15:45:00', originalAmount: 250, discountAmount: 50, remainingAmount: 200, status: 'verified', revokeStatus: 'none', revokeReason: '', revokeTime: '', revokeOperator: '', revokeFailureReason: '', deviceId: 'pad_001', notes: '' },
  { channel: 'douyin', channelRedemptionId: 'dy_red_002', couponCode: 'DY202407100002', platformTemplateId: 'dy_temp_001', merchantId: 2, merchantName: '海底捞', shopId: 2, shopName: '分店', platformShopId: 'poi_789', operator: '收银员B', redemptionTime: '2024-07-10 18:00:00', originalAmount: 300, discountAmount: 50, remainingAmount: 250, status: 'revoked', revokeStatus: 'succeeded', revokeReason: 'refund', revokeTime: '2024-07-10 18:30:00', revokeOperator: '店长', revokeFailureReason: '', deviceId: 'pad_002', notes: '顾客退款' }
]);

initModule('channel/reconciliation/daily', ['date', 'channel', 'platformVerifyCount', 'platformVerifyAmount', 'shopVerifyCount', 'shopVerifyAmount', 'matchedCount', 'unmatchedCount', 'unmatchedDetails', 'status', 'operator', 'reconcileTime', 'remark'], [
  { date: '2024-07-09', channel: 'all', platformVerifyCount: 50, platformVerifyAmount: 5000, shopVerifyCount: 48, shopVerifyAmount: 4900, matchedCount: 48, unmatchedCount: 2, unmatchedDetails: '[{"couponCode":"DY202407090015","reason":"中台有核销银豹无订单"},{"couponCode":"DY202407090028","reason":"银豹有备注中台无核销"}]', status: 'unmatched', operator: '运营A', reconcileTime: '2024-07-10 09:00:00', remark: '待门店确认' },
  { date: '2024-07-08', channel: 'all', platformVerifyCount: 35, platformVerifyAmount: 3500, shopVerifyCount: 35, shopVerifyAmount: 3500, matchedCount: 35, unmatchedCount: 0, unmatchedDetails: '[]', status: 'matched', operator: '运营A', reconcileTime: '2024-07-09 09:00:00', remark: '' }
]);

initModule('channel/settlement/monthly', ['merchantId', 'merchantName', 'channel', 'settlementMonth', 'totalDiscountAmount', 'merchantCostAmount', 'platformFeeAmount', 'daRenCommissionAmount', 'settlementAmount', 'settlementMethod', 'status', 'settlementTime', 'operator', 'documents', 'remark'], [
  { merchantId: 1, merchantName: '星巴克', channel: 'all', settlementMonth: '2024-06', totalDiscountAmount: 10000, merchantCostAmount: 5000, platformFeeAmount: 800, daRenCommissionAmount: 500, settlementAmount: 3700, settlementMethod: 'rentDeduct', status: 'completed', settlementTime: '2024-07-05 10:00:00', operator: '财务A', documents: '["抖音结算账单.pdf", "美团结算账单.pdf", "中台核销台账.xlsx", "结算单.pdf"]', remark: '' },
  { merchantId: 2, merchantName: '海底捞', channel: 'all', settlementMonth: '2024-06', totalDiscountAmount: 8000, merchantCostAmount: 3200, platformFeeAmount: 640, daRenCommissionAmount: 400, settlementAmount: 3760, settlementMethod: 'bankTransfer', status: 'processing', settlementTime: '', operator: '财务A', documents: '', remark: '待打款' }
]);

// 系统安全
initModule('security/network', ['name', 'type', 'level', 'rule', 'whiteList', 'status'], [
  { name: 'Web应用防火墙', type: 'firewall', level: 'high', rule: '仅允许HTTPS访问', whiteList: '10.0.0.0/8', status: 'enabled' },
  { name: 'DDoS基础防护', type: 'ddos', level: 'medium', rule: '单IP限流1000QPS', whiteList: '', status: 'enabled' },
  { name: 'IPS入侵防御', type: 'ips', level: 'high', rule: '拦截已知攻击特征', whiteList: '', status: 'enabled' },
]);
initModule('security/data', ['name', 'type', 'description', 'encryptAlgorithm', 'backupCycle', 'status'], [
  { name: '传输加密策略', type: 'encrypt', description: '全站HTTPS/TLS1.3加密', encryptAlgorithm: '', backupCycle: '', status: 'enabled' },
  { name: '敏感数据加密存储', type: 'storage', description: '手机号、身份证等AES-256加密', encryptAlgorithm: 'aes256', backupCycle: '', status: 'enabled' },
  { name: '数据脱敏规则', type: 'desensitize', description: '手机号中间4位脱敏', encryptAlgorithm: '', backupCycle: '', status: 'enabled' },
  { name: '每日自动备份', type: 'backup', description: '每日凌晨2:00自动备份数据库', encryptAlgorithm: '', backupCycle: 'daily', status: 'enabled' },
]);
initModule('security/app', ['name', 'type', 'rule', 'blockCount', 'status'], [
  { name: 'WAF防火墙', type: 'waf', rule: '拦截SQL注入、XSS等常见攻击', blockCount: 1520, status: 'enabled' },
  { name: 'SQL注入防护', type: 'sqli', rule: '参数化查询+关键字过滤', blockCount: 856, status: 'enabled' },
  { name: 'XSS防护', type: 'xss', rule: '输出编码+Content-Security-Policy', blockCount: 320, status: 'enabled' },
]);
initModule('security/api', ['name', 'type', 'authType', 'rateLimit', 'tokenExpire', 'status'], [
  { name: 'API鉴权策略', type: 'auth', authType: 'jwt', rateLimit: 0, tokenExpire: 60, status: 'enabled' },
  { name: '接口限流策略', type: 'rate', authType: '', rateLimit: 500, tokenExpire: 0, status: 'enabled' },
  { name: '签名验证', type: 'sign', authType: '', rateLimit: 0, tokenExpire: 0, status: 'enabled' },
]);
initModule('security/applet', ['name', 'type', 'description', 'status'], [
  { name: '代码加固策略', type: 'code', description: '小程序代码混淆加固', status: 'enabled' },
  { name: '接口防篡改', type: 'tamper', description: '接口请求签名验证', status: 'enabled' },
  { name: '防反编译', type: 'decompile', description: '代码混淆+关键逻辑加密', status: 'enabled' },
  { name: '防抓包', type: 'capture', description: 'SSL Pinning+证书校验', status: 'enabled' },
]);
initModule('security/compliance', ['name', 'type', 'description', 'checkResult', 'status'], [
  { name: '隐私政策管理', type: 'privacy', description: '用户隐私政策展示与同意管理', checkResult: 'pass', status: 'enabled' },
  { name: '数据收集范围', type: 'collect', description: '仅收集必要个人信息', checkResult: 'pass', status: 'enabled' },
  { name: '用户数据导出', type: 'export', description: '支持用户申请导出个人数据', checkResult: 'pending', status: 'disabled' },
  { name: '用户数据删除', type: 'delete', description: '支持用户申请删除个人数据', checkResult: 'pending', status: 'disabled' },
]);
initModule('security/audit', ['type', 'content', 'level', 'operator', 'ip', 'time'], [
  { type: 'operation', content: '管理员修改了系统配置', level: 'info', operator: 'admin', ip: '10.0.1.100', time: '2024-07-10' },
  { type: 'login', content: '异常登录：IP来自境外', level: 'warning', operator: 'unknown', ip: '203.0.113.1', time: '2024-07-11' },
  { type: 'event', content: 'SQL注入攻击被拦截', level: 'critical', operator: 'system', ip: '198.51.100.1', time: '2024-07-12' },
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
  saveToStorage();
  return newItem;
}

export function updateItem(module: string, id: number, body: Record<string, any>) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const idx = mod.data.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('数据不存在');
  mod.data[idx] = { ...mod.data[idx], ...body };
  saveToStorage();
  return mod.data[idx];
}

export function deleteItem(module: string, id: number) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const idx = mod.data.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('数据不存在');
  mod.data.splice(idx, 1);
  saveToStorage();
}

export function toggleStatus(module: string, id: number) {
  const mod = modules[module];
  if (!mod) throw new Error(`模块不存在: ${module}`);
  const idx = mod.data.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('数据不存在');
  mod.data[idx].status = mod.data[idx].status === 'enabled' ? 'disabled' : 'enabled';
  saveToStorage();
  return mod.data[idx];
}

// ============================================
// 新增模块 - 商业体自研全域公域中台
// ============================================

// 渠道配置
initModule('channel/configs', ['channel', 'channelName', 'appId', 'appSecret', 'callbackUrl', 'spiCallbackUrl', 'depositAmount', 'qualificationStatus', 'accountType', 'poiStatus', 'annualReviewDate', 'noteMountPermission', 'status', 'createdAt'], [
  { channel: 'douyin', channelName: '抖音生活服务-商场官方号', appId: 'dy_app_7x8y9z', appSecret: 'dy_secret_xxxx', callbackUrl: 'https://api.hengwei.com/callback/douyin', spiCallbackUrl: 'https://api.hengwei.com/spi/douyin', depositAmount: 200000, qualificationStatus: 'approved', accountType: 'enterprise', poiStatus: 'approved', annualReviewDate: '2025-03-15', noteMountPermission: false, status: 'enabled', createdAt: '2024-03-01 10:00' },
  { channel: 'meituan', channelName: '美团点评-商场官方店', appId: 'mt_client_abc123', appSecret: 'mt_secret_xxxx', callbackUrl: 'https://api.hengwei.com/callback/meituan', spiCallbackUrl: 'https://api.hengwei.com/spi/meituan', depositAmount: 100000, qualificationStatus: 'approved', accountType: 'enterprise', poiStatus: '-', annualReviewDate: '', noteMountPermission: false, status: 'enabled', createdAt: '2024-03-15 11:00' },
  { channel: 'xiaohongshu', channelName: '小红书-商场企业号', appId: 'xhs_app_5t6y7u', appSecret: 'xhs_secret_xxxx', callbackUrl: 'https://api.hengwei.com/callback/xhs', spiCallbackUrl: 'https://api.hengwei.com/spi/xhs', depositAmount: 50000, qualificationStatus: 'approved', accountType: 'enterprise', poiStatus: 'approved', annualReviewDate: '2025-06-20', noteMountPermission: true, status: 'enabled', createdAt: '2024-04-10 12:00' },
  { channel: 'xiaohongshu', channelName: '小红书-美妆探店号', appId: 'xhs_app_8i9o0p', appSecret: 'xhs_secret_yyyy', callbackUrl: 'https://api.hengwei.com/callback/xhs2', spiCallbackUrl: '', depositAmount: 0, qualificationStatus: 'pending', accountType: 'personal', poiStatus: 'pending', annualReviewDate: '', noteMountPermission: true, status: 'disabled', createdAt: '2024-07-01 14:00' }
]);

// 线上授权管理
initModule('merchant/authorizations', ['merchantName', 'channel', 'platformShopName', 'authorizationType', 'authorizationStatus', 'authorizationTime'], [
  { merchantName: '海底捞(商场店)', channel: 'douyin', platformShopName: '海底捞-商场店', authorizationType: 'serviceProvider', authorizationStatus: 'completed', authorizationTime: '2024-04-01 10:00' },
  { merchantName: '海底捞(商场店)', channel: 'meituan', platformShopName: '海底捞-商场店', authorizationType: 'oauth', authorizationStatus: 'completed', authorizationTime: '2024-04-05 11:00' },
  { merchantName: '丝芙兰(商场店)', channel: 'douyin', platformShopName: '丝芙兰-商场店', authorizationType: 'serviceProvider', authorizationStatus: 'completed', authorizationTime: '2024-04-10 14:00' },
  { merchantName: '丝芙兰(商场店)', channel: 'meituan', platformShopName: '丝芙兰-商场店', authorizationType: 'oauth', authorizationStatus: 'processing', authorizationTime: '2024-07-10 16:00' },
  { merchantName: '永辉超市(B1店)', channel: 'meituan', platformShopName: '永辉超市-B1店', authorizationType: 'oauth', authorizationStatus: 'completed', authorizationTime: '2024-05-15 10:00' },
  { merchantName: '玩具反斗城', channel: 'douyin', platformShopName: '玩具反斗城-商场店', authorizationType: 'serviceProvider', authorizationStatus: 'pending', authorizationTime: '2024-07-10 17:00' },
  { merchantName: '优衣库', channel: 'meituan', platformShopName: '优衣库-商场店', authorizationType: 'oauth', authorizationStatus: 'failed', authorizationTime: '2024-07-08 15:00' }
]);

// 券模板管理
initModule('channel/templates', ['channel', 'templateName', 'couponType', 'faceValue', 'minConsume', 'totalStock', 'soldCount', 'validStartTime', 'validEndTime', 'status'], [
  { channel: 'douyin', templateName: '50元代金券', couponType: 'voucher', faceValue: 50, minConsume: 100, totalStock: 5000, soldCount: 3200, validStartTime: '2024-07-01', validEndTime: '2024-12-31', status: 'synced' },
  { channel: 'douyin', templateName: '满200减80券', couponType: 'couponDiscount', faceValue: 80, minConsume: 200, totalStock: 3000, soldCount: 1850, validStartTime: '2024-07-01', validEndTime: '2024-12-31', status: 'synced' },
  { channel: 'douyin', templateName: '8.5折通用券', couponType: 'couponPercent', faceValue: 0, minConsume: 0, totalStock: 2000, soldCount: 950, validStartTime: '2024-06-01', validEndTime: '2024-08-31', status: 'synced' },
  { channel: 'meituan', templateName: '美团50元代金券', couponType: 'voucher', faceValue: 50, minConsume: 100, totalStock: 5000, soldCount: 2800, validStartTime: '2024-07-01', validEndTime: '2024-12-31', status: 'synced' },
  { channel: 'meituan', templateName: '美团满200减80', couponType: 'couponDiscount', faceValue: 80, minConsume: 200, totalStock: 3000, soldCount: 1620, validStartTime: '2024-07-01', validEndTime: '2024-12-31', status: 'synced' },
  { channel: 'douyin', templateName: '暑期大促团购', couponType: 'groupbuy', faceValue: 188, minConsume: 0, totalStock: 1000, soldCount: 0, validStartTime: '2024-07-15', validEndTime: '2024-08-31', status: 'pending' },
  { channel: 'meituan', templateName: '春节礼品套餐', couponType: 'package', faceValue: 298, minConsume: 0, totalStock: 500, soldCount: 500, validStartTime: '2024-01-01', validEndTime: '2024-02-29', status: 'expired' }
]);

// 券码池管理
initModule('coupon/code-pool', ['code', 'templateId', 'templateName', 'batchId', 'status', 'issueTime', 'issueChannel', 'issueOrderId', 'verifyTime', 'verifyShopId', 'revokeTime'], [
  { code: 'HW20240710000001AB', templateId: 1, templateName: '50元代金券', batchId: 1, status: 'available', issueTime: '', issueChannel: '', issueOrderId: '', verifyTime: '', verifyShopId: 0, revokeTime: '' },
  { code: 'HW20240710000002CD', templateId: 1, templateName: '50元代金券', batchId: 1, status: 'issued', issueTime: '2024-07-10 10:30', issueChannel: 'douyin', issueOrderId: 'DY2024071000001', verifyTime: '', verifyShopId: 0, revokeTime: '' },
  { code: 'HW20240710000003EF', templateId: 2, templateName: '满200减80券', batchId: 1, status: 'verified', issueTime: '2024-07-10 11:00', issueChannel: 'meituan', issueOrderId: 'MT2024071000002', verifyTime: '2024-07-10 14:30', verifyShopId: 1, revokeTime: '' },
  { code: 'HW20240710000004GH', templateId: 2, templateName: '满200减80券', batchId: 1, status: 'verified', issueTime: '2024-07-10 11:15', issueChannel: 'xiaohongshu', issueOrderId: 'XHS2024071000003', verifyTime: '2024-07-10 16:00', verifyShopId: 2, revokeTime: '' },
  { code: 'HW20240710000005IJ', templateId: 3, templateName: '新人见面礼券', batchId: 2, status: 'available', issueTime: '', issueChannel: '', issueOrderId: '', verifyTime: '', verifyShopId: 0, revokeTime: '' },
  { code: 'HW20240710000006KL', templateId: 1, templateName: '50元代金券', batchId: 1, status: 'revoked', issueTime: '2024-07-10 12:00', issueChannel: 'douyin', issueOrderId: 'DY2024071000004', verifyTime: '', verifyShopId: 0, revokeTime: '2024-07-10 13:00' },
  { code: 'HW20240710000007MN', templateId: 2, templateName: '满200减80券', batchId: 1, status: 'expired', issueTime: '2024-06-01 10:00', issueChannel: 'meituan', issueOrderId: 'MT2024060100001', verifyTime: '', verifyShopId: 0, revokeTime: '' },
  { code: 'HW20240710000008OP', templateId: 3, templateName: '新人见面礼券', batchId: 2, status: 'issued', issueTime: '2024-07-10 15:00', issueChannel: 'wechat', issueOrderId: 'WX2024071000005', verifyTime: '', verifyShopId: 0, revokeTime: '' }
]);

// 订单同步记录
initModule('channel/order-sync', ['channel', 'channelOrderId', 'channelCouponCode', 'internalCouponCode', 'memberName', 'amount', 'syncStatus', 'wechatCardSync', 'syncTime', 'failReason'], [
  { channel: 'douyin', channelOrderId: 'DY2024071000001', channelCouponCode: 'DYABCD1234', internalCouponCode: 'HW20240710000002CD', memberName: '张三', amount: 50, syncStatus: 'succeeded', wechatCardSync: true, syncTime: '2024-07-10 10:35', failReason: '' },
  { channel: 'meituan', channelOrderId: 'MT2024071000002', channelCouponCode: 'MT5678EFGH', internalCouponCode: 'HW20240710000003EF', memberName: '李四', amount: 80, syncStatus: 'succeeded', wechatCardSync: true, syncTime: '2024-07-10 11:05', failReason: '' },
  { channel: 'xiaohongshu', channelOrderId: 'XHS2024071000003', channelCouponCode: 'XHS9012IJKL', internalCouponCode: 'HW20240710000004GH', memberName: '王五', amount: 80, syncStatus: 'succeeded', wechatCardSync: false, syncTime: '2024-07-10 11:20', failReason: '' },
  { channel: 'douyin', channelOrderId: 'DY2024071000006', channelCouponCode: 'DYMNOP3456', internalCouponCode: '', memberName: '赵六', amount: 100, syncStatus: 'pending', wechatCardSync: false, syncTime: '2024-07-10 16:00', failReason: '' },
  { channel: 'meituan', channelOrderId: 'MT2024071000007', channelCouponCode: 'MTQRST7890', internalCouponCode: '', memberName: '钱七', amount: 60, syncStatus: 'processing', wechatCardSync: false, syncTime: '2024-07-10 16:30', failReason: '' },
  { channel: 'douyin', channelOrderId: 'DY2024071000008', channelCouponCode: 'DYUVWX1112', internalCouponCode: '', memberName: '孙八', amount: 200, syncStatus: 'failed', wechatCardSync: false, syncTime: '2024-07-10 17:00', failReason: '渠道订单超时未返回' }
]);

// OneID 会员映射
initModule('member/oneid', ['memberId', 'phone', 'douyinOpenid', 'xiaohongshuOpenid', 'meituanOpenid', 'wechatOpenid', 'createdAt', 'lastSyncTime'], [
  { memberId: 'M001', phone: '13800138001', douyinOpenid: 'dy_open_001', xiaohongshuOpenid: 'xhs_open_001', meituanOpenid: 'mt_open_001', wechatOpenid: 'wx_open_001', createdAt: '2024-01-15 10:00', lastSyncTime: '2024-07-10 14:30' },
  { memberId: 'M002', phone: '13900139002', douyinOpenid: 'dy_open_002', xiaohongshuOpenid: '', meituanOpenid: 'mt_open_002', wechatOpenid: 'wx_open_002', createdAt: '2024-03-10 11:00', lastSyncTime: '2024-07-10 15:00' },
  { memberId: 'M003', phone: '13700137003', douyinOpenid: 'dy_open_003', xiaohongshuOpenid: 'xhs_open_003', meituanOpenid: '', wechatOpenid: 'wx_open_003', createdAt: '2024-05-20 12:00', lastSyncTime: '2024-07-10 16:00' },
  { memberId: 'M004', phone: '13600136004', douyinOpenid: '', xiaohongshuOpenid: '', meituanOpenid: 'mt_open_004', wechatOpenid: 'wx_open_004', createdAt: '2024-06-01 13:00', lastSyncTime: '2024-07-10 17:00' },
  { memberId: 'M005', phone: '13500135005', douyinOpenid: 'dy_open_005', xiaohongshuOpenid: 'xhs_open_005', meituanOpenid: 'mt_open_005', wechatOpenid: 'wx_open_005', createdAt: '2024-07-01 14:00', lastSyncTime: '2024-07-10 18:00' }
]);

// 入会场景配置
initModule('member/join-scenes', ['name', 'channel', 'triggerType', 'priority', 'enabled', 'welcomeCoupon', 'welcomePoints', 'createdAt'], [
  { name: '抖音POI入会', channel: 'douyin', triggerType: 'enterPage', priority: 1, enabled: true, welcomeCoupon: '新人见面礼券', welcomePoints: 100, createdAt: '2024-05-01 10:00' },
  { name: '美团店铺入会', channel: 'meituan', triggerType: 'enterPage', priority: 2, enabled: true, welcomeCoupon: '50元代金券', welcomePoints: 50, createdAt: '2024-05-15 11:00' },
  { name: '小红书笔记入会', channel: 'xiaohongshu', triggerType: 'beforeOrder', priority: 3, enabled: true, welcomeCoupon: '满200减80券', welcomePoints: 80, createdAt: '2024-06-01 12:00' },
  { name: '微信扫码入会', channel: 'wechat', triggerType: 'enterPage', priority: 4, enabled: true, welcomeCoupon: '新人见面礼券', welcomePoints: 100, createdAt: '2024-04-01 09:00' },
  { name: '抖音直播间入会', channel: 'douyin', triggerType: 'beforeActivity', priority: 5, enabled: false, welcomeCoupon: '50元代金券', welcomePoints: 50, createdAt: '2024-06-15 14:00' },
  { name: '购券完成后入会', channel: 'all', triggerType: 'afterPurchase', priority: 0, enabled: true, welcomeCoupon: '新人见面礼券', welcomePoints: 200, createdAt: '2024-07-01 10:00' }
]);

// 核销终端管理
initModule('verification/terminals', ['name', 'deviceId', 'type', 'shopId', 'shopName', 'status', 'offlineRecords', 'lastSyncTime'], [
  { name: '一楼服务台核销平板', deviceId: 'VT-AAB001', type: 'tablet', shopId: 1, shopName: '总服务台', status: 'online', offlineRecords: 0, lastSyncTime: '2024-07-10 18:00:00' },
  { name: '餐饮区核销终端', deviceId: 'VT-AAB002', type: 'tablet', shopId: 2, shopName: '海底捞', status: 'online', offlineRecords: 0, lastSyncTime: '2024-07-10 18:00:30' },
  { name: '美妆区商户助手', deviceId: 'MP-AAB003', type: 'miniProgram', shopId: 3, shopName: '丝芙兰', status: 'online', offlineRecords: 0, lastSyncTime: '2024-07-10 18:01:00' },
  { name: '儿童区核销平板', deviceId: 'VT-AAB004', type: 'tablet', shopId: 4, shopName: '玩具反斗城', status: 'offline', offlineRecords: 12, lastSyncTime: '2024-07-10 12:00:00' },
  { name: 'B1层核销终端', deviceId: 'VT-AAB005', type: 'tablet', shopId: 5, shopName: '永辉超市', status: 'disabled', offlineRecords: 0, lastSyncTime: '2024-07-09 22:00:00' }
]);

// 自研路由短链
initModule('route/short-url', ['shortCode', 'originalUrl', 'channel', 'campaignName', '达人Name', 'clickCount', 'conversionCount', 'status', 'createdAt', 'expireTime'], [
  { shortCode: 'aB3xY1', originalUrl: '/m/coupon-templates?tpl=50cash', channel: 'douyin', campaignName: '7月新人发券', 达人Name: '探店达人-小王', clickCount: 1280, conversionCount: 320, status: 'enabled', createdAt: '2024-06-01 10:00', expireTime: '2024-12-31 23:59' },
  { shortCode: 'cD5zW2', originalUrl: '/m/marketing-campaigns?cid=202407', channel: 'meituan', campaignName: '暑期大促', 达人Name: '美团官方', clickCount: 856, conversionCount: 198, status: 'enabled', createdAt: '2024-07-01 11:00', expireTime: '2024-08-31 23:59' },
  { shortCode: 'eF7uV3', originalUrl: '/m/coupon-templates?tpl=meet80', channel: 'xiaohongshu', campaignName: '探店笔记挂载', 达人Name: '小红薯_Lynn', clickCount: 642, conversionCount: 156, status: 'enabled', createdAt: '2024-07-05 12:00', expireTime: '2024-09-30 23:59' },
  { shortCode: 'gH9tS4', originalUrl: '/m/member-list?src=qr', channel: 'meituan', campaignName: '扫码入会', 达人Name: '商场官方', clickCount: 432, conversionCount: 89, status: 'enabled', createdAt: '2024-05-15 13:00', expireTime: '2025-05-14 23:59' },
  { shortCode: 'iJ1rQ5', originalUrl: '/m/marketing-campaigns?cid=oldsale', channel: 'douyin', campaignName: '直播预约', 达人Name: '探店达人-小王', clickCount: 215, conversionCount: 48, status: 'disabled', createdAt: '2024-07-08 14:00', expireTime: '2024-07-20 23:59' }
]);

// BI 报表分析
initModule('analytics/bi', ['name', 'type', 'period', 'startDate', 'endDate', 'channels', 'generatedAt', 'status'], [
  { name: '渠道总览日报', type: 'overview', period: 'day', startDate: '2024-07-10', endDate: '2024-07-10', channels: 'douyin,xiaohongshu,meituan', generatedAt: '2024-07-10 08:00', status: 'generated' },
  { name: '会员注册趋势周报', type: 'member', period: 'week', startDate: '2024-07-04', endDate: '2024-07-10', channels: 'all', generatedAt: '2024-07-10 09:00', status: 'generated' },
  { name: '用户行为漏斗月报', type: 'behavior', period: 'month', startDate: '2024-06-01', endDate: '2024-06-30', channels: 'douyin,meituan', generatedAt: '2024-07-01 10:00', status: 'generated' },
  { name: '交易核销月报', type: 'transaction', period: 'month', startDate: '2024-06-01', endDate: '2024-06-30', channels: 'all', generatedAt: '2024-07-01 11:00', status: 'generated' },
  { name: '投放营销复盘季报', type: 'marketing', period: 'quarter', startDate: '2024-04-01', endDate: '2024-06-30', channels: 'douyin,xiaohongshu', generatedAt: '2024-07-01 12:00', status: 'generating' }
]);

// ===== 第二阶段 - 多商业体架构 =====
initModule('system/projects', ['name', 'code', 'type', 'dataIsolated', 'description', 'status'], [
  { name: '恒伟商业广场', code: 'HW-MALL', type: 'mall', dataIsolated: 'yes', description: '总部商业广场项目', status: 'enabled' },
  { name: '恒伟奥特莱斯', code: 'HW-OUTLET', type: 'outlet', dataIsolated: 'yes', description: '奥特莱斯项目', status: 'enabled' },
  { name: '恒伟城市综合体', code: 'HW-MIXED', type: 'mixed', dataIsolated: 'yes', description: '城市综合体项目', status: 'disabled' },
]);
initModule('points/cross-project', ['member', 'mainProject', 'mergeProject', 'mergePoints', 'status', 'mergeTime'], [
  { member: '张三', mainProject: '恒伟商业广场', mergeProject: '恒伟奥特莱斯', mergePoints: 500, status: 'merged', mergeTime: '2024-07-01' },
  { member: '李四', mainProject: '恒伟商业广场', mergeProject: '恒伟城市综合体', mergePoints: 200, status: 'pending', mergeTime: '' },
]);
initModule('analytics/cross-project', ['projectA', 'projectB', 'dimension', 'period', 'createTime'], [
  { projectA: '恒伟商业广场', projectB: '恒伟奥特莱斯', dimension: 'member', period: '30d', createTime: '2024-07-10' },
]);

// 地产对接扩展
initModule('property/auth', ['roleName', 'userName', 'scope', 'status'], [
  { roleName: '地产运营', userName: '张地产', scope: 'content,member,task', status: 'enabled' },
  { roleName: '地产审核员', userName: '李审核', scope: 'task,analytics', status: 'enabled' },
]);
initModule('property/content', ['type', 'title', 'imageUrl', 'linkUrl', 'sort', 'status', 'updateTime'], [
  { type: 'banner', title: '夏日购房节', imageUrl: '/property/summer-banner.jpg', linkUrl: '/property/summer', sort: 1, status: 'enabled', updateTime: '2024-07-01' },
  { type: 'benefit', title: '业主专享权益', imageUrl: '/property/benefit.jpg', linkUrl: '/property/benefits', sort: 2, status: 'enabled', updateTime: '2024-07-05' },
]);
initModule('property/owners', ['name', 'phone', 'memberId', 'property', 'community', 'benefits', 'status'], [
  { name: '王业主', phone: '13800001111', memberId: 'M001', property: 'A栋1单元501', community: '恒伟花园', benefits: '专属停车优惠,积分倍率1.5倍', status: 'enabled' },
  { name: '赵业主', phone: '13800002222', memberId: 'M002', property: 'B栋2单元301', community: '恒伟花园', benefits: '专属停车优惠', status: 'enabled' },
]);
initModule('property/task-audit', ['taskName', 'applicant', 'points', 'evidence', 'auditStatus', 'auditor', 'applyTime', 'auditRemark'], [
  { taskName: '朋友圈转发', applicant: '王业主', points: 50, evidence: '/upload/screenshot1.jpg', auditStatus: 'approved', auditor: '李审核', applyTime: '2024-07-08', auditRemark: '审核通过' },
  { taskName: '推荐到访', applicant: '赵业主', points: 100, evidence: '/upload/screenshot2.jpg', auditStatus: 'pending', auditor: '', applyTime: '2024-07-10', auditRemark: '' },
]);
initModule('property/notify', ['name', 'trigger', 'channel', 'templateId', 'content', 'status'], [
  { name: '积分审核通过通知', trigger: 'audit_pass', channel: 'wechat,sms', templateId: 'TPL_001', content: '您好{业主名}，您的积分任务"{任务名}"已审核通过，获得{积分}积分', status: 'enabled' },
]);
initModule('property/goods', ['name', 'points', 'stock', 'community', 'imageUrl', 'description', 'exchangeRule', 'status'], [
  { name: '品牌家电兑换券', points: 5000, stock: 20, community: '恒伟花园', imageUrl: '/goods/appliance.jpg', description: '品牌家电兑换券', exchangeRule: '每户限兑1次', status: 'enabled' },
  { name: '物业费抵扣券', points: 2000, stock: 50, community: '', imageUrl: '/goods/property-fee.jpg', description: '可抵扣100元物业费', exchangeRule: '不限次数', status: 'enabled' },
]);
initModule('property/community-scope', ['activityName', 'scopeType', 'communities', 'status'], [
  { activityName: '夏日购房节', scopeType: 'all', communities: '', status: 'enabled' },
  { activityName: '恒伟花园专属活动', scopeType: 'specific', communities: '恒伟花园,恒伟名苑', status: 'enabled' },
]);
initModule('property/multi-bind', ['member', 'phone', 'communities', 'propertyCount', 'status'], [
  { member: '王业主', phone: '13800001111', communities: '恒伟花园,恒伟名苑', propertyCount: 2, status: 'enabled' },
  { member: '赵业主', phone: '13800002222', communities: '恒伟花园', propertyCount: 1, status: 'enabled' },
]);

// 商户导览增强
initModule('merchant/locations', ['merchant', 'floor', 'positionNo', 'navMap', 'status'], [
  { merchant: '星巴克', floor: '1F', positionNo: '1F-A01', navMap: '/maps/1f.svg', status: 'enabled' },
  { merchant: '海底捞', floor: '3F', positionNo: '3F-B05', navMap: '/maps/3f.svg', status: 'enabled' },
  { merchant: '优衣库', floor: '2F', positionNo: '2F-A03', navMap: '/maps/2f.svg', status: 'enabled' },
]);
initModule('merchant/floor-maps', ['floor', 'mapUrl', 'markedShops', 'description', 'status'], [
  { floor: '1F', mapUrl: '/maps/1f.svg', markedShops: 15, description: '一楼为精品零售区', status: 'enabled' },
  { floor: '2F', mapUrl: '/maps/2f.svg', markedShops: 12, description: '二楼为服装区', status: 'enabled' },
  { floor: '3F', mapUrl: '/maps/3f.svg', markedShops: 10, description: '三楼为餐饮区', status: 'enabled' },
]);
initModule('merchant/food-config', ['merchant', 'cuisineType', 'recommendDishes', 'avgCost', 'promo', 'status'], [
  { merchant: '海底捞', cuisineType: 'hotpot', recommendDishes: '番茄锅底,虾滑,毛肚', avgCost: 120, promo: '午市8折', status: 'enabled' },
  { merchant: '星巴克', cuisineType: 'other', recommendDishes: '拿铁,星冰乐', avgCost: 40, promo: '', status: 'enabled' },
]);

// 积分消费比例配置
initModule('points/consumption-ratio', ['name', 'scene', 'pointsPerYuan', 'maxDeductRate', 'minPoints', 'status'], [
  { name: '商场消费抵扣', scene: 'mall', pointsPerYuan: 10, maxDeductRate: 30, minPoints: 100, status: 'enabled' },
  { name: '地产消费抵扣', scene: 'property', pointsPerYuan: 5, maxDeductRate: 50, minPoints: 50, status: 'enabled' },
  { name: '停车缴费抵扣', scene: 'parking', pointsPerYuan: 10, maxDeductRate: 100, minPoints: 10, status: 'enabled' },
]);

// 商家信息/通知管理
initModule('merchant/info', ['name', 'industry', 'contractExpiry', 'contact', 'dataSource', 'status'], [
  { name: '星巴克', industry: 'food', contractExpiry: '2025-12-31', contact: '0755-88880001', dataSource: 'liebao', status: 'enabled' },
  { name: '海底捞', industry: 'food', contractExpiry: '2025-06-30', contact: '0755-88880002', dataSource: 'liebao', status: 'enabled' },
  { name: '优衣库', industry: 'clothing', contractExpiry: '2026-03-31', contact: '0755-88880003', dataSource: 'manual', status: 'enabled' },
]);
initModule('merchant/contracts-mgmt', ['merchant', 'contractNo', 'type', 'startDate', 'endDate', 'remindDays', 'remark'], [
  { merchant: '星巴克', contractNo: 'CT-2024-001', type: 'lease', startDate: '2023-01-01', endDate: '2025-12-31', remindDays: 30, remark: '标准租赁合同' },
  { merchant: '海底捞', contractNo: 'CT-2024-002', type: 'lease', startDate: '2023-07-01', endDate: '2025-06-30', remindDays: 60, remark: '含推广条款' },
]);
initModule('merchant/notify-template', ['name', 'type', 'channel', 'content', 'status'], [
  { name: '活动通知模板', type: 'activity', channel: 'applet,sms', content: '尊敬的{商家名}，{活动名}即将开始，请做好准备。', status: 'enabled' },
  { name: '系统通知模板', type: 'system', channel: 'applet', content: '系统将于{日期}进行维护，预计影响{时长}。', status: 'enabled' },
]);
initModule('merchant/notify-logs', ['merchant', 'type', 'channel', 'content', 'sendStatus', 'sendTime'], [
  { merchant: '星巴克', type: 'activity', channel: '小程序消息', content: '暑期促销活动即将开始', sendStatus: 'success', sendTime: '2024-07-01' },
  { merchant: '海底捞', type: 'system', channel: '短信', content: '系统维护通知', sendStatus: 'success', sendTime: '2024-07-05' },
]);

// 小程序装修增强
initModule('content/decoration-preview', ['pageName', 'previewType', 'decorationId', 'createTime'], [
  { pageName: '首页装修V2', previewType: 'qr', decorationId: 'DEC_001', createTime: '2024-07-10' },
]);
initModule('content/decoration-templates', ['name', 'pageType', 'switchCondition', 'switchRule', 'status'], [
  { name: '夏日主题模板', pageType: 'home', switchCondition: 'time', switchRule: '7月1日-8月31日', status: 'enabled' },
  { name: '默认模板', pageType: 'home', switchCondition: 'manual', switchRule: '', status: 'disabled' },
]);
initModule('content/decoration-history', ['pageName', 'version', 'operator', 'publishTime', 'status', 'snapshot'], [
  { pageName: '首页', version: 'v2.3', operator: 'admin', publishTime: '2024-07-10', status: 'current', snapshot: '{}' },
  { pageName: '首页', version: 'v2.2', operator: 'admin', publishTime: '2024-06-15', status: 'archived', snapshot: '{}' },
]);
initModule('content/decoration-qrcode', ['pageName', 'qrcodeUrl', 'pageLink', 'scene', 'createTime'], [
  { pageName: '首页', qrcodeUrl: '/qrcode/home.png', pageLink: 'pages/index/index', scene: 'from=poster', createTime: '2024-07-10' },
  { pageName: '积分商城', qrcodeUrl: '/qrcode/points.png', pageLink: 'pages/points/index', scene: 'from=share', createTime: '2024-07-10' },
]);
initModule('points/mall-decoration', ['sectionName', 'sectionType', 'sort', 'displayCount', 'status'], [
  { sectionName: '为您推荐', sectionType: 'recommend', sort: 1, displayCount: 6, status: 'enabled' },
  { sectionName: '热门兑换', sectionType: 'hot', sort: 2, displayCount: 8, status: 'enabled' },
  { sectionName: '浏览轨迹', sectionType: 'history', sort: 3, displayCount: 4, status: 'enabled' },
]);

// 核销增强
initModule('verification/export', ['name', 'scope', 'merchant', 'startDate', 'endDate', 'verifyType', 'fileFormat', 'recordCount', 'status', 'createTime'], [
  { name: '7月核销报表', scope: 'time', merchant: '', startDate: '2024-07-01', endDate: '2024-07-31', verifyType: '', fileFormat: 'excel', recordCount: 1520, status: 'completed', createTime: '2024-08-01' },
  { name: '星巴克核销明细', scope: 'merchant', merchant: '星巴克', startDate: '', endDate: '', verifyType: 'coupon', fileFormat: 'excel', recordCount: 356, status: 'completed', createTime: '2024-07-15' },
]);
initModule('verification/points-audit', ['merchant', 'verifyType', 'points', 'member', 'auditStatus', 'verifyTime', 'auditRemark'], [
  { merchant: '星巴克', verifyType: 'coupon', points: 50, member: '张三', auditStatus: 'approved', verifyTime: '2024-07-10', auditRemark: '正常核销' },
  { merchant: '海底捞', verifyType: 'coupon', points: 200, member: '李四', auditStatus: 'pending', verifyTime: '2024-07-12', auditRemark: '' },
  { merchant: '优衣库', verifyType: 'goods', points: 500, member: '王五', auditStatus: 'rejected', verifyTime: '2024-07-11', auditRemark: '异常核销，积分退回' },
]);

// ============================================
// 商家小程序模块
// ============================================

// 商家-优惠券发放
initModule('bapp/coupon-issue', ['shop', 'couponName', 'couponType', 'issueCount', 'issueTime'], [
  { shop: '海底捞', couponName: '满200减50券', couponType: 'discount', issueCount: 156, issueTime: '2024-07-10 10:30' },
  { shop: '星巴克', couponName: '买一送一券', couponType: 'gift', issueCount: 89, issueTime: '2024-07-11 14:00' },
  { shop: '优衣库', couponName: '满300减100券', couponType: 'discount', issueCount: 45, issueTime: '2024-07-12 09:15' },
]);

// 商家-批量发放
initModule('bapp/coupon-batch', ['shop', 'couponName', 'targets', 'issueCount', 'status'], [
  { shop: '海底捞', couponName: '新客专享券', targets: '新注册会员', issueCount: 200, status: 'completed' },
  { shop: '星巴克', couponName: '会员生日券', targets: '本月生日会员', issueCount: 58, status: 'processing' },
  { shop: '优衣库', couponName: 'VIP专属券', targets: '金卡及以上会员', issueCount: 32, status: 'pending' },
]);

// 商家-优惠券核销
initModule('bapp/coupon-verify', ['shop', 'couponCode', 'member', 'verifyTime', 'status'], [
  { shop: '海底捞', couponCode: 'CP20240710001', member: '张三', verifyTime: '2024-07-10 12:30', status: 'verified' },
  { shop: '星巴克', couponCode: 'CP20240710002', member: '李四', verifyTime: '2024-07-11 15:45', status: 'verified' },
  { shop: '优衣库', couponCode: 'CP20240710003', member: '王五', verifyTime: '2024-07-12 10:20', status: 'revoked' },
]);

// 商家-停车券发放
initModule('bapp/parking-issue', ['shop', 'member', 'parkingHours', 'issueTime', 'status'], [
  { shop: '海底捞', member: '张三', parkingHours: 2, issueTime: '2024-07-10 13:00', status: 'issued' },
  { shop: '星巴克', member: '李四', parkingHours: 1, issueTime: '2024-07-11 16:30', status: 'issued' },
  { shop: '优衣库', member: '王五', parkingHours: 3, issueTime: '2024-07-12 11:00', status: 'used' },
]);

// 商家-商城订单核销
initModule('bapp/order-verify', ['shop', 'orderNo', 'member', 'goods', 'verifyTime', 'status'], [
  { shop: '优衣库', orderNo: 'O20240710001', member: '张三', goods: '纯棉T恤 x2', verifyTime: '2024-07-10 14:00', status: 'verified' },
  { shop: '海底捞', orderNo: 'O20240710002', member: '李四', goods: '火锅套餐 x1', verifyTime: '2024-07-11 18:30', status: 'verified' },
  { shop: '星巴克', orderNo: 'O20240710003', member: '王五', goods: '咖啡礼盒 x1', verifyTime: '2024-07-12 09:45', status: 'pending' },
]);

// 商家-团购秒杀核销
initModule('bapp/group-verify', ['shop', 'activityName', 'member', 'verifyTime', 'status'], [
  { shop: '海底捞', activityName: '三人拼团火锅套餐', member: '张三', verifyTime: '2024-07-10 19:00', status: 'verified' },
  { shop: '星巴克', activityName: '咖啡秒杀活动', member: '李四', verifyTime: '2024-07-11 10:00', status: 'verified' },
]);

// 商家-活动核销
initModule('bapp/activity-verify', ['shop', 'activityName', 'member', 'verifyTime', 'status'], [
  { shop: '海底捞', activityName: '周年庆活动', member: '张三', verifyTime: '2024-07-10 20:00', status: 'verified' },
  { shop: '星巴克', activityName: '新品品鉴会', member: '李四', verifyTime: '2024-07-11 15:00', status: 'verified' },
  { shop: '优衣库', activityName: '会员日专场', member: '王五', verifyTime: '2024-07-12 14:00', status: 'pending' },
]);

// 商家-核销积分台账
initModule('bapp/points-ledger', ['shop', 'verifyType', 'member', 'points', 'verifyTime'], [
  { shop: '海底捞', verifyType: 'coupon', member: '张三', points: 50, verifyTime: '2024-07-10 12:30' },
  { shop: '星巴克', verifyType: 'order', member: '李四', points: 30, verifyTime: '2024-07-11 15:45' },
  { shop: '优衣库', verifyType: 'activity', member: '王五', points: 100, verifyTime: '2024-07-12 10:20' },
]);

// 商家-核销数据统计
initModule('bapp/verify-stats', ['shop', 'date', 'couponCount', 'orderCount', 'activityCount', 'totalPoints'], [
  { shop: '海底捞', date: '2024-07-10', couponCount: 45, orderCount: 12, activityCount: 3, totalPoints: 580 },
  { shop: '星巴克', date: '2024-07-10', couponCount: 32, orderCount: 8, activityCount: 2, totalPoints: 320 },
  { shop: '优衣库', date: '2024-07-10', couponCount: 18, orderCount: 5, activityCount: 1, totalPoints: 150 },
]);

// 商家-销售数据统计
initModule('bapp/sales-stats', ['shop', 'date', 'orderCount', 'salesAmount', 'memberAmount', 'nonMemberAmount'], [
  { shop: '海底捞', date: '2024-07-10', orderCount: 156, salesAmount: 28500, memberAmount: 22800, nonMemberAmount: 5700 },
  { shop: '星巴克', date: '2024-07-10', orderCount: 89, salesAmount: 5340, memberAmount: 4272, nonMemberAmount: 1068 },
  { shop: '优衣库', date: '2024-07-10', orderCount: 45, salesAmount: 13500, memberAmount: 10800, nonMemberAmount: 2700 },
]);

// 商家-基础信息
initModule('bapp/shop-info', ['name', 'category', 'contractExpiry', 'phone', 'status'], [
  { name: '海底捞', category: '餐饮', contractExpiry: '2025-12-31', phone: '0731-88888001', status: 'enabled' },
  { name: '星巴克', category: '餐饮', contractExpiry: '2025-06-30', phone: '0731-88888002', status: 'enabled' },
  { name: '优衣库', category: '服装', contractExpiry: '2026-03-31', phone: '0731-88888003', status: 'enabled' },
]);

// 商家-通知管理
initModule('bapp/shop-notice', ['title', 'type', 'content', 'sendTime', 'readStatus'], [
  { title: '暑期促销活动通知', type: 'activity', content: '暑期促销活动将于7月15日启动，请各门店做好准备。', sendTime: '2024-07-10 09:00', readStatus: 'read' },
  { title: '系统升级维护通知', type: 'system', content: '系统将于7月15日凌晨2:00-4:00进行升级维护。', sendTime: '2024-07-12 18:00', readStatus: 'unread' },
  { title: '合同到期提醒', type: 'contract', content: '您的合同将于下月到期，请及时续签。', sendTime: '2024-07-13 10:00', readStatus: 'unread' },
]);

// ============================================
// C端小程序模块初始化数据
// ============================================

// C端-首页配置
initModule('capp/home', ['name', 'type', 'content', 'sort', 'status'], [
  { name: '首页轮播区', type: 'banner', content: '{"autoPlay":true,"interval":3000}', sort: 1, status: 'enabled' },
  { name: '快捷入口', type: 'navGrid', content: '{"columns":4,"items":8}', sort: 2, status: 'enabled' },
  { name: '限时秒杀', type: 'flashSale', content: '{"countdown":true,"goodsCount":3}', sort: 3, status: 'enabled' },
]);

// C端-会员注册登录
initModule('capp/member-register', ['name', 'scene', 'source', 'status'], [
  { name: '微信一键注册', scene: 'wechat', source: 'miniapp', status: 'enabled' },
  { name: '手机号注册', scene: 'phone', source: 'h5', status: 'enabled' },
  { name: '抖音扫码注册', scene: 'douyin', source: 'douyin', status: 'enabled' },
]);

// C端-完善资料
initModule('capp/member-profile', ['fieldName', 'fieldType', 'required', 'rewardPoints', 'status'], [
  { fieldName: '真实姓名', fieldType: 'text', required: 'yes', rewardPoints: 10, status: 'enabled' },
  { fieldName: '生日', fieldType: 'date', required: 'yes', rewardPoints: 20, status: 'enabled' },
  { fieldName: '性别', fieldType: 'select', required: 'no', rewardPoints: 5, status: 'enabled' },
]);

// C端-搜索配置
initModule('capp/search', ['name', 'hotWords', 'type', 'status'], [
  { name: '默认热搜词', hotWords: '停车缴费,积分兑换,海底捞,星巴克', type: 'auto', status: 'enabled' },
  { name: '活动热搜词', hotWords: '暑期大促,新人福利,限时秒杀', type: 'manual', status: 'enabled' },
]);

// C端-消息通知
initModule('capp/message', ['title', 'type', 'content', 'receiver', 'sendTime', 'status'], [
  { title: '生日祝福', type: 'birthday', content: '尊敬的会员，祝您生日快乐！', receiver: '张三', sendTime: '2024-07-15', status: 'sent' },
  { title: '积分到账通知', type: 'points', content: '您消费获得100积分已到账', receiver: '李四', sendTime: '2024-07-10', status: 'sent' },
  { title: '优惠券即将过期', type: 'coupon', content: '您有1张优惠券即将过期，请尽快使用', receiver: '王五', sendTime: '2024-07-12', status: 'pending' },
]);

// C端-积分查询
initModule('capp/points-query', ['member', 'totalPoints', 'availablePoints', 'frozenPoints', 'updateTime'], [
  { member: '张三', totalPoints: 10000, availablePoints: 6200, frozenPoints: 0, updateTime: '2024-07-10' },
  { member: '李四', totalPoints: 3000, availablePoints: 1500, frozenPoints: 100, updateTime: '2024-07-11' },
  { member: '王五', totalPoints: 500, availablePoints: 500, frozenPoints: 0, updateTime: '2024-07-12' },
]);

// C端-商户列表
initModule('capp/shop-list', ['name', 'category', 'floor', 'logo', 'status'], [
  { name: '海底捞', category: '餐饮', floor: 'F3', logo: '/logo/haidilao.png', status: 'enabled' },
  { name: '星巴克', category: '餐饮', floor: 'F1', logo: '/logo/starbucks.png', status: 'enabled' },
  { name: '优衣库', category: '零售', floor: 'F2', logo: '/logo/uniqlo.png', status: 'enabled' },
]);

// C端-商户详情
initModule('capp/shop-detail', ['name', 'story', 'phone', 'location', 'businessHours'], [
  { name: '海底捞', story: '以川味火锅为主，服务贴心周到', phone: '0731-88888001', location: 'F3-A05', businessHours: '11:00-22:00' },
  { name: '星巴克', story: '全球知名咖啡连锁品牌', phone: '0731-88888002', location: 'F1-B01', businessHours: '08:00-22:00' },
  { name: '优衣库', story: '日本快时尚品牌，简约舒适', phone: '0731-88888003', location: 'F2-A03', businessHours: '10:00-22:00' },
]);

// C端-餐饮导览
initModule('capp/restaurant-guide', ['name', 'cuisine', 'avgPrice', 'recommendDishes', 'status'], [
  { name: '海底捞', cuisine: '火锅', avgPrice: 120, recommendDishes: '番茄锅,虾滑,毛肚', status: 'enabled' },
  { name: '外婆家', cuisine: '杭帮菜', avgPrice: 80, recommendDishes: '茶香鸡,东坡肉', status: 'enabled' },
  { name: '太二酸菜鱼', cuisine: '川菜', avgPrice: 70, recommendDishes: '酸菜鱼,手工豆腐', status: 'enabled' },
]);

// C端-店铺导航
initModule('capp/shop-navigation', ['shop', 'floor', 'location', 'floorMap', 'status'], [
  { shop: '海底捞', floor: 'F3', location: 'A区05号', floorMap: '/maps/f3.svg', status: 'enabled' },
  { shop: '星巴克', floor: 'F1', location: 'B区01号', floorMap: '/maps/f1.svg', status: 'enabled' },
  { shop: '优衣库', floor: 'F2', location: 'A区03号', floorMap: '/maps/f2.svg', status: 'enabled' },
]);

// C端-Banner广告
initModule('capp/banner-ad', ['name', 'position', 'image', 'linkUrl', 'clickCount', 'status'], [
  { name: '暑期大促Banner', position: 'home_top', image: '/ads/summer-banner.jpg', linkUrl: '/activity/summer', clickCount: 1280, status: 'enabled' },
  { name: '会员日Banner', position: 'home_middle', image: '/ads/member-day.jpg', linkUrl: '/member/day', clickCount: 856, status: 'enabled' },
  { name: '新人专享Banner', position: 'home_bottom', image: '/ads/new-member.jpg', linkUrl: '/coupon/new', clickCount: 520, status: 'enabled' },
]);

// C端-弹窗广告
initModule('capp/popup-ad', ['name', 'page', 'image', 'linkUrl', 'showRule', 'status'], [
  { name: '新人弹窗', page: 'home', image: '/ads/new-popup.jpg', linkUrl: '/coupon/new', showRule: '首次进入', status: 'enabled' },
  { name: '活动弹窗', page: 'home', image: '/ads/activity-popup.jpg', linkUrl: '/activity/summer', showRule: '每日首次', status: 'enabled' },
]);

// C端-启动页广告
initModule('capp/splash-ad', ['name', 'image', 'duration', 'linkUrl', 'startTime', 'endTime', 'status'], [
  { name: '暑期启动页', image: '/ads/splash-summer.jpg', duration: 3, linkUrl: '/activity/summer', startTime: '2024-07-01', endTime: '2024-08-31', status: 'enabled' },
  { name: '周年庆启动页', image: '/ads/splash-anniversary.jpg', duration: 5, linkUrl: '/activity/anniversary', startTime: '2024-09-01', endTime: '2024-09-07', status: 'disabled' },
  { name: '双11启动页', image: '/ads/splash-1111.jpg', duration: 3, linkUrl: '/activity/1111', startTime: '2024-11-01', endTime: '2024-11-11', status: 'disabled' },
]);

// C端-千人千面广告
initModule('capp/personalized-ad', ['name', 'tags', 'content', 'priority', 'status'], [
  { name: '高消费会员推荐', tags: '高消费,金卡会员', content: 'VIP专属优惠', priority: 10, status: 'enabled' },
  { name: '新会员引导', tags: '新注册,首单未购', content: '新人专享礼包', priority: 8, status: 'enabled' },
  { name: '沉睡唤醒', tags: '90天未消费', content: '回归礼遇', priority: 5, status: 'enabled' },
]);

// C端-新人礼
initModule('capp/new-member-gift', ['name', 'giftContent', 'points', 'coupons', 'parkingHours', 'claimed', 'status'], [
  { name: '新人见面礼', giftContent: '积分+优惠券+停车券', points: 100, coupons: '满50减10券', parkingHours: 1, claimed: 856, status: 'enabled' },
  { name: '首单礼包', giftContent: '首单积分双倍', points: 200, coupons: '满100减30券', parkingHours: 2, claimed: 520, status: 'enabled' },
]);

// C端-推荐有礼
initModule('capp/referral', ['name', 'referrerReward', 'refereeReward', 'maxReferrals', 'status'], [
  { name: '邀请好友得积分', referrerReward: '100积分', refereeReward: '50积分', maxReferrals: 10, status: 'enabled' },
  { name: '推荐新人双倍礼', referrerReward: '200积分', refereeReward: '100积分', maxReferrals: 5, status: 'disabled' },
]);

// C端-助力领券
initModule('capp/help-coupon', ['name', 'requiredHelps', 'couponTemplate', 'discountPrice', 'status'], [
  { name: '助力领50元券', requiredHelps: 3, couponTemplate: '50元代金券', discountPrice: 50, status: 'enabled' },
  { name: '好友助力免费停车', requiredHelps: 5, couponTemplate: '2小时停车券', discountPrice: 0, status: 'enabled' },
]);

// C端-会员签到
initModule('capp/checkin', ['days', 'rewardType', 'reward', 'status'], [
  { days: 1, rewardType: 'points', reward: '5积分', status: 'enabled' },
  { days: 7, rewardType: 'coupon', reward: '满50减10券', status: 'enabled' },
  { days: 30, rewardType: 'gift', reward: '神秘礼品', status: 'enabled' },
]);

// C端-游戏互动
initModule('capp/game', ['name', 'type', 'playLimit', 'rewardConfig', 'status'], [
  { name: '大转盘', type: 'wheel', playLimit: '每日1次', rewardConfig: '积分/优惠券/实物', status: 'enabled' },
  { name: '刮刮乐', type: 'scratch', playLimit: '每日3次', rewardConfig: '积分为主', status: 'enabled' },
  { name: '砸金蛋', type: 'hammer', playLimit: '活动期间1次', rewardConfig: '大奖+参与奖', status: 'enabled' },
]);

// C端-调查问卷
initModule('capp/survey', ['name', 'questions', 'rewardPoints', 'startTime', 'endTime', 'status'], [
  { name: '会员满意度调查', questions: '10题', rewardPoints: 50, startTime: '2024-07-01', endTime: '2024-07-31', status: 'enabled' },
  { name: '餐饮体验调查', questions: '8题', rewardPoints: 30, startTime: '2024-07-15', endTime: '2024-08-15', status: 'enabled' },
]);

// C端-投票活动
initModule('capp/vote', ['name', 'options', 'rewardPoints', 'voteLimit', 'status'], [
  { name: '最受欢迎餐厅评选', options: '海底捞,星巴克,外婆家', rewardPoints: 20, voteLimit: '每日1次', status: 'enabled' },
  { name: '最佳服务商户', options: '优衣库,屈臣氏,丝芙兰', rewardPoints: 15, voteLimit: '活动期间1次', status: 'enabled' },
]);

// C端-活动报名
initModule('capp/activity-signup', ['name', 'type', 'maxParticipants', 'location', 'activityTime', 'status'], [
  { name: '亲子手工活动', type: 'offline', maxParticipants: 30, location: 'F1中庭', activityTime: '2024-07-20 14:00', status: 'enabled' },
  { name: '美妆课堂', type: 'offline', maxParticipants: 20, location: 'F2丝芙兰', activityTime: '2024-07-25 15:00', status: 'enabled' },
  { name: '线上秒杀活动', type: 'online', maxParticipants: 500, location: '小程序', activityTime: '2024-07-18 10:00', status: 'enabled' },
]);

export function fetchDashboard() {
  const memberCount = modules['member/list']?.data.length || 0;
  const pointsIssued = (modules['points/logs']?.data.reduce((s, x) => s + (x.points || 0), 0)) || 0;
  const couponClaimed = (modules['coupon/templates']?.data.reduce((s, x) => s + (x.claimed || 0), 0)) || 0;
  const orderCount = modules['shop/orders']?.data.length || 0;
  const todayRevenue = (modules['shop/orders']?.data.reduce((s, x) => s + (x.amount || 0), 0)) || 0;
  const activeCampaigns = (modules['marketing/campaigns']?.data.filter(x => x.status === 'enabled').length) || 0;
  
  return { memberCount, pointsIssued, couponClaimed, orderCount, todayRevenue, activeCampaigns };
}