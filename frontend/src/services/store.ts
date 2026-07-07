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