// Module registry: defines columns + form fields + feature docs for each CRUD module.
// A single GenericCRUD page renders all of these from this config.

export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'switch' | 'date';
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface ColumnConfig {
  title: string;
  dataIndex: string;
  width?: number;
  render?: (val: any, record?: any) => string;
}

export interface ModuleConfig {
  key: string;        // unique key, also used as route param
  path: string;       // API path after /v1
  name: string;       // display name
  category: string;   // menu group
  columns: ColumnConfig[];
  fields: FieldConfig[];
  doc: {
    overview: string;
    features: string[];
    tips?: string[];
  };
}

const STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' }
];

export const MODULES: ModuleConfig[] = [
  // ===== 会员数字化 =====
  {
    key: 'member-level', path: 'member/level', name: '会员等级', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '等级名称', dataIndex: 'name' },
      { title: '等级编码', dataIndex: 'code' },
      { title: '升级所需积分', dataIndex: 'minPoints' },
      { title: '折扣率', dataIndex: 'discount', render: (v) => (v != null ? v : '') },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') },
      { title: '创建时间', dataIndex: 'createdAt' }
    ],
    fields: [
      { name: 'name', label: '等级名称', type: 'text', required: true },
      { name: 'code', label: '等级编码', type: 'text', required: true },
      { name: 'minPoints', label: '升级所需积分', type: 'number' },
      { name: 'discount', label: '折扣率(0-1)', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '管理会员等级体系，配置不同等级的升级条件、折扣权益等。会员根据积分自动升级。',
      features: ['新增/编辑/删除会员等级', '配置升级所需积分门槛', '配置等级专属折扣率', '启用/禁用等级'],
      tips: ['等级编码不可重复', '折扣率范围0-1，如0.9表示9折']
    }
  },
  {
    key: 'member-list', path: 'member/list', name: '会员档案', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name' },
      { title: '手机号', dataIndex: 'phone' },
      { title: '会员等级', dataIndex: 'level', render: (v) => ({ NORMAL: '普通', SILVER: '银卡', GOLD: '金卡', DIAMOND: '钻石' }[v] || v) },
      { title: '积分', dataIndex: 'points' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'phone', label: '手机号', type: 'text', required: true },
      { name: 'level', label: '会员等级', type: 'select', options: [
        { label: '普通会员', value: 'NORMAL' }, { label: '银卡会员', value: 'SILVER' },
        { label: '金卡会员', value: 'GOLD' }, { label: '钻石会员', value: 'DIAMOND' }
      ] },
      { name: 'points', label: '积分', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '会员档案管理，记录会员基本信息、等级、积分等。是会员营销的基础数据。',
      features: ['新增/编辑/删除会员', '查看会员积分余额', '管理会员等级', '启用/禁用会员'],
      tips: ['手机号作为会员唯一标识', '删除会员不影响历史订单记录']
    }
  },
  {
    key: 'member-tags', path: 'member/tags', name: '会员标签', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '标签名称', dataIndex: 'name' },
      { title: '分类', dataIndex: 'category' },
      { title: '规则', dataIndex: 'rule' },
      { title: '覆盖人数', dataIndex: 'count' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '标签名称', type: 'text', required: true },
      { name: 'category', label: '分类', type: 'select', options: [
        { label: '消费', value: '消费' }, { label: '活跃', value: '活跃' }, { label: '属性', value: '属性' }
      ] },
      { name: 'rule', label: '规则', type: 'text' },
      { name: 'count', label: '覆盖人数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '会员标签管理，通过规则自动圈选会员群体，用于精准营销触达。',
      features: ['新增/编辑/删除标签', '配置标签圈选规则', '查看标签覆盖人数'],
      tips: ['标签用于营销活动的人群定向']
    }
  },
  // ===== 积分中心 =====
  {
    key: 'points-rules', path: 'points/rules', name: '积分规则', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ consume: '消费', signin: '签到', birthday: '生日' }[v] || v) },
      { title: '积分值', dataIndex: 'points' },
      { title: '条件说明', dataIndex: 'condition' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '消费送积分', value: 'consume' }, { label: '签到积分', value: 'signin' }, { label: '生日积分', value: 'birthday' }
      ] },
      { name: 'points', label: '积分值', type: 'number' },
      { name: 'condition', label: '条件说明', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '配置积分获取规则，定义会员在何种场景下获得积分。', features: ['新增/编辑/删除积分规则', '配置不同场景的积分奖励'] }
  },
  {
    key: 'points-goods', path: 'points/goods', name: '积分商品', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商品名称', dataIndex: 'name' },
      { title: '所需积分', dataIndex: 'points' },
      { title: '库存', dataIndex: 'stock' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '商品名称', type: 'text', required: true },
      { name: 'points', label: '所需积分', type: 'number' },
      { name: 'stock', label: '库存', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '积分商城商品管理，会员可用积分兑换这些商品。', features: ['新增/编辑/删除积分商品', '配置兑换积分和库存'] }
  },
  {
    key: 'points-logs', path: 'points/logs', name: '积分流水', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '类型', dataIndex: 'type' },
      { title: '积分变动', dataIndex: 'points', render: (v) => (v > 0 ? `+${v}` : `${v}`) },
      { title: '余额', dataIndex: 'balance' },
      { title: '备注', dataIndex: 'remark' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '消费', value: 'consume' }, { label: '签到', value: 'signin' }, { label: '兑换', value: 'exchange' }
      ] },
      { name: 'points', label: '积分变动', type: 'number' },
      { name: 'balance', label: '余额', type: 'number' },
      { name: 'remark', label: '备注', type: 'text' }
    ],
    doc: { overview: '积分变动流水记录，记录会员每一次积分获取和消耗。', features: ['新增/编辑/删除积分流水', '查看积分余额变动'] }
  },
  // ===== 礼券中心 =====
  {
    key: 'coupon-templates', path: 'coupon/templates', name: '礼券模板', category: '礼券中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ fullcut: '满减', cash: '代金', discount: '折扣' }[v] || v) },
      { title: '面值', dataIndex: 'value' },
      { title: '门槛', dataIndex: 'minSpend' },
      { title: '已领/总量', dataIndex: 'claimed', render: (v, r) => `${r?.claimed}/${r?.quantity}` },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '券名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '满减券', value: 'fullcut' }, { label: '代金券', value: 'cash' }, { label: '折扣券', value: 'discount' }
      ] },
      { name: 'value', label: '面值/折扣', type: 'number' },
      { name: 'minSpend', label: '使用门槛', type: 'number' },
      { name: 'quantity', label: '发行总量', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '礼券模板管理，创建可复用的券模板，用于营销活动发放。', features: ['新增/编辑/删除券模板', '配置面值、门槛、发行量'] }
  },
  {
    key: 'coupon-batches', path: 'coupon/batches', name: '礼券批次', category: '礼券中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '批次名称', dataIndex: 'name' },
      { title: '模板', dataIndex: 'template' },
      { title: '发行量', dataIndex: 'count' },
      { title: '已领取', dataIndex: 'claimed' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '批次名称', type: 'text', required: true },
      { name: 'template', label: '券模板', type: 'text' },
      { name: 'count', label: '发行量', type: 'number' },
      { name: 'claimed', label: '已领取', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '礼券批次管理，基于模板生成具体批次的券，用于营销活动。', features: ['新增/编辑/删除券批次', '查看领取进度'] }
  },
  // ===== 智慧停车 =====
  {
    key: 'parking-records', path: 'parking/records', name: '停车记录', category: '智慧停车',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '车牌号', dataIndex: 'plate' },
      { title: '会员', dataIndex: 'member' },
      { title: '入场时间', dataIndex: 'inTime' },
      { title: '出场时间', dataIndex: 'outTime' },
      { title: '时长(分)', dataIndex: 'duration' },
      { title: '费用', dataIndex: 'fee' },
      { title: '积分', dataIndex: 'points' }
    ],
    fields: [
      { name: 'plate', label: '车牌号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'inTime', label: '入场时间', type: 'text' },
      { name: 'outTime', label: '出场时间', type: 'text' },
      { name: 'duration', label: '时长(分钟)', type: 'number' },
      { name: 'fee', label: '费用', type: 'number' },
      { name: 'points', label: '送积分', type: 'number' }
    ],
    doc: { overview: '停车记录管理，记录车辆进出停车场信息，并可关联会员送积分。', features: ['新增/编辑/删除停车记录', '会员停车积分联动'] }
  },
  {
    key: 'parking-benefit', path: 'parking/benefit', name: '停车权益', category: '智慧停车',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '权益名称', dataIndex: 'name' },
      { title: '会员等级', dataIndex: 'level' },
      { title: '免费时长(小时)', dataIndex: 'freeHours' },
      { title: '积分倍率', dataIndex: 'pointsRate' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '权益名称', type: 'text', required: true },
      { name: 'level', label: '会员等级', type: 'select', options: [
        { label: '银卡', value: 'SILVER' }, { label: '金卡', value: 'GOLD' }, { label: '钻石', value: 'DIAMOND' }
      ] },
      { name: 'freeHours', label: '免费时长(小时)', type: 'number' },
      { name: 'pointsRate', label: '积分倍率', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '停车权益配置，为不同等级会员配置免费停车时长和积分倍率。', features: ['新增/编辑/删除停车权益', '按等级差异化配置'] }
  },
  // ===== 营销中心 =====
  {
    key: 'marketing-campaigns', path: 'marketing/campaigns', name: '营销活动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type' },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '结束时间', dataIndex: 'endTime' },
      { title: '预算', dataIndex: 'budget' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '进行中' : '已停用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '促销', value: 'promotion' }, { label: '会员日', value: 'memberday' }, { label: '节日', value: 'festival' }
      ] },
      { name: 'startTime', label: '开始时间', type: 'text' },
      { name: 'endTime', label: '结束时间', type: 'text' },
      { name: 'budget', label: '预算', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '营销活动管理，创建和管理各类营销活动，关联券、商品等资源。', features: ['新增/编辑/删除活动', '配置活动时间、预算', '关联营销资源'] }
  },
  {
    key: 'marketing-coupons', path: 'marketing/coupons', name: '活动发券', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '名称', dataIndex: 'name' },
      { title: '所属活动', dataIndex: 'campaign' },
      { title: '券模板', dataIndex: 'template' },
      { title: '发行量', dataIndex: 'count' },
      { title: '已领取', dataIndex: 'claimed' }
    ],
    fields: [
      { name: 'name', label: '名称', type: 'text', required: true },
      { name: 'campaign', label: '所属活动', type: 'text' },
      { name: 'template', label: '券模板', type: 'text' },
      { name: 'count', label: '发行量', type: 'number' },
      { name: 'claimed', label: '已领取', type: 'number' }
    ],
    doc: { overview: '营销活动中的发券配置，关联活动与券模板。', features: ['新增/编辑/删除活动发券', '查看领取进度'] }
  },
  {
    key: 'marketing-groupbuy', path: 'marketing/groupbuy', name: '拼团活动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '拼团价', dataIndex: 'price' },
      { title: '原价', dataIndex: 'originalPrice' },
      { title: '成团人数', dataIndex: 'minCount' },
      { title: '已参团', dataIndex: 'joined' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'price', label: '拼团价', type: 'number' },
      { name: 'originalPrice', label: '原价', type: 'number' },
      { name: 'minCount', label: '成团人数', type: 'number' },
      { name: 'joined', label: '已参团', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '拼团活动管理，会员可发起拼团，达到人数后成团享受优惠价。', features: ['新增/编辑/删除拼团活动', '配置拼团价和成团人数'] }
  },
  {
    key: 'marketing-seckill', path: 'marketing/seckill', name: '秒杀活动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商品名称', dataIndex: 'name' },
      { title: '秒杀价', dataIndex: 'price' },
      { title: '原价', dataIndex: 'originalPrice' },
      { title: '库存', dataIndex: 'stock' },
      { title: '已售', dataIndex: 'sold' },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '商品名称', type: 'text', required: true },
      { name: 'price', label: '秒杀价', type: 'number' },
      { name: 'originalPrice', label: '原价', type: 'number' },
      { name: 'stock', label: '库存', type: 'number' },
      { name: 'sold', label: '已售', type: 'number' },
      { name: 'startTime', label: '开始时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '秒杀活动管理，限时限量特价销售，制造抢购氛围。', features: ['新增/编辑/删除秒杀活动', '配置秒杀价、库存、时间'] }
  },
  // ===== 服务中心 =====
  {
    key: 'service-orders', path: 'service/orders', name: '服务订单', category: '服务中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '订单号', dataIndex: 'orderNo' },
      { title: '会员', dataIndex: 'member' },
      { title: '服务', dataIndex: 'service' },
      { title: '金额', dataIndex: 'amount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待处理', processing: '处理中', finished: '已完成' }[v] || v) },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'orderNo', label: '订单号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'service', label: '服务项目', type: 'text' },
      { name: 'amount', label: '金额', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待处理', value: 'pending' }, { label: '处理中', value: 'processing' }, { label: '已完成', value: 'finished' }
      ] },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: { overview: '服务中心订单管理，记录会员购买的各种增值服务。', features: ['新增/编辑/删除服务订单', '订单状态流转'] }
  },
  // ===== 营销触达 =====
  {
    key: 'message-templates', path: 'message/templates', name: '消息模板', category: '营销触达',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '模板名称', dataIndex: 'name' },
      { title: '渠道', dataIndex: 'channel', render: (v) => ({ sms: '短信', wechat: '微信', email: '邮件' }[v] || v) },
      { title: '类型', dataIndex: 'type' },
      { title: '内容', dataIndex: 'content' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '模板名称', type: 'text', required: true },
      { name: 'channel', label: '渠道', type: 'select', options: [
        { label: '短信', value: 'sms' }, { label: '微信', value: 'wechat' }, { label: '邮件', value: 'email' }
      ] },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '生日', value: 'birthday' }, { label: '优惠券', value: 'coupon' }, { label: '活动', value: 'campaign' }
      ] },
      { name: 'content', label: '内容', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '消息模板管理，配置各渠道的消息模板，用于营销触达。', features: ['新增/编辑/删除消息模板', '多渠道支持'] }
  },
  {
    key: 'message-campaigns', path: 'message/campaigns', name: '推送任务', category: '营销触达',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '任务名称', dataIndex: 'name' },
      { title: '模板', dataIndex: 'template' },
      { title: '渠道', dataIndex: 'channel' },
      { title: '目标人数', dataIndex: 'audience' },
      { title: '已发送', dataIndex: 'sent' },
      { title: '已读', dataIndex: 'read' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '进行中' : '已完成') }
    ],
    fields: [
      { name: 'name', label: '任务名称', type: 'text', required: true },
      { name: 'template', label: '消息模板', type: 'text' },
      { name: 'channel', label: '渠道', type: 'select', options: [
        { label: '短信', value: 'sms' }, { label: '微信', value: 'wechat' }
      ] },
      { name: 'audience', label: '目标人数', type: 'number' },
      { name: 'sent', label: '已发送', type: 'number' },
      { name: 'read', label: '已读', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '营销推送任务管理，基于模板向目标人群发送消息。', features: ['新增/编辑/删除推送任务', '追踪送达和阅读'] }
  },
  // ===== 私域运营 =====
  {
    key: 'private-domain-groups', path: 'private-domain/groups', name: '社群管理', category: '私域运营',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '群名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type' },
      { title: '人数', dataIndex: 'memberCount' },
      { title: '群主', dataIndex: 'owner' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '群名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '微信群', value: 'wechat' }, { label: '企微群', value: 'wecom' }
      ] },
      { name: 'memberCount', label: '人数', type: 'number' },
      { name: 'owner', label: '群主', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '私域社群管理，管理会员社群，进行精细化运营。', features: ['新增/编辑/删除社群', '查看社群人数'] }
  },
  // ===== 企微社群 =====
  {
    key: 'wecom-accounts', path: 'wecom/accounts', name: '企微账号', category: '企微社群',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name' },
      { title: '账号', dataIndex: 'userid' },
      { title: '部门', dataIndex: 'department' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'userid', label: '企微账号', type: 'text', required: true },
      { name: 'department', label: '部门', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '企业微信员工账号管理，用于社群运营和客户服务。', features: ['新增/编辑/删除企微账号', '部门归属管理'] }
  },
  // ===== 电子钱包 =====
  {
    key: 'wallet-accounts', path: 'wallet/accounts', name: '钱包账户', category: '电子钱包',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '余额', dataIndex: 'balance' },
      { title: '积分', dataIndex: 'points' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'balance', label: '余额', type: 'number' },
      { name: 'points', label: '积分', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '电子钱包账户管理，记录会员储值余额和积分。', features: ['新增/编辑/删除钱包账户', '余额和积分管理'] }
  },
  {
    key: 'wallet-transactions', path: 'wallet/transactions', name: '钱包流水', category: '电子钱包',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ recharge: '充值', consume: '消费', refund: '退款' }[v] || v) },
      { title: '金额', dataIndex: 'amount', render: (v) => (v >= 0 ? `+${v}` : `${v}`) },
      { title: '余额', dataIndex: 'balance' },
      { title: '备注', dataIndex: 'remark' },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '充值', value: 'recharge' }, { label: '消费', value: 'consume' }, { label: '退款', value: 'refund' }
      ] },
      { name: 'amount', label: '金额(正为入账)', type: 'number' },
      { name: 'balance', label: '余额', type: 'number' },
      { name: 'remark', label: '备注', type: 'text' },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: { overview: '电子钱包交易流水，记录每一笔充值、消费、退款。', features: ['新增/编辑/删除流水', '余额变动追踪'] }
  },
  // ===== 商户营销 =====
  {
    key: 'merchant-list', path: 'merchant/list', name: '商户管理', category: '商户营销',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商户名称', dataIndex: 'name' },
      { title: '分类', dataIndex: 'category' },
      { title: '联系人', dataIndex: 'contact' },
      { title: '电话', dataIndex: 'phone' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '商户名称', type: 'text', required: true },
      { name: 'category', label: '分类', type: 'select', options: [
        { label: '餐饮', value: '餐饮' }, { label: '零售', value: '零售' }, { label: '服务', value: '服务' }
      ] },
      { name: 'contact', label: '联系人', type: 'text' },
      { name: 'phone', label: '电话', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '入驻商户管理，管理商场内的商户信息。', features: ['新增/编辑/删除商户', '商户分类管理'] }
  },
  // ===== 在线商城 =====
  {
    key: 'shop-goods', path: 'shop/goods', name: '商城商品', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商品名称', dataIndex: 'name' },
      { title: '分类', dataIndex: 'category' },
      { title: '价格', dataIndex: 'price' },
      { title: '库存', dataIndex: 'stock' },
      { title: '销量', dataIndex: 'sales' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '上架' : '下架') }
    ],
    fields: [
      { name: 'name', label: '商品名称', type: 'text', required: true },
      { name: 'category', label: '分类', type: 'text' },
      { name: 'price', label: '价格', type: 'number' },
      { name: 'stock', label: '库存', type: 'number' },
      { name: 'sales', label: '销量', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '上架', value: 'enabled' }, { label: '下架', value: 'disabled' }
      ] }
    ],
    doc: { overview: '在线商城商品管理，配置小程序商城展示的商品。', features: ['新增/编辑/删除商品', '上下架管理', '库存销量管理'] }
  },
  {
    key: 'shop-orders', path: 'shop/orders', name: '商城订单', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '订单号', dataIndex: 'orderNo' },
      { title: '会员', dataIndex: 'member' },
      { title: '商品', dataIndex: 'goods' },
      { title: '金额', dataIndex: 'amount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待付款', paid: '已付款', shipped: '已发货', done: '已完成' }[v] || v) },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'orderNo', label: '订单号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'amount', label: '金额', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待付款', value: 'pending' }, { label: '已付款', value: 'paid' }, { label: '已发货', value: 'shipped' }, { label: '已完成', value: 'done' }
      ] },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: { overview: '在线商城订单管理，记录会员在商城的购买订单。', features: ['新增/编辑/删除订单', '订单状态流转'] }
  },
  {
    key: 'shop-categories', path: 'shop/categories', name: '商品分类', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '分类名称', dataIndex: 'name' },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '分类名称', type: 'text', required: true },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '商城商品分类管理，用于商品归类展示。', features: ['新增/编辑/删除分类', '排序管理'] }
  },
  // ===== 配置中心 =====
  {
    key: 'config-shops', path: 'config/shops', name: '门店管理', category: '配置中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '门店名称', dataIndex: 'name' },
      { title: '地址', dataIndex: 'address' },
      { title: '电话', dataIndex: 'phone' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '门店名称', type: 'text', required: true },
      { name: 'address', label: '地址', type: 'text' },
      { name: 'phone', label: '电话', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '门店信息管理，配置商场各门店基础信息。', features: ['新增/编辑/删除门店', '门店启停管理'] }
  },
  {
    key: 'config-terminals', path: 'config/terminals', name: '终端管理', category: '配置中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '终端名称', dataIndex: 'name' },
      { title: '所属门店', dataIndex: 'shop' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ cashier: '收银机', kiosk: '自助机', pad: '平板' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '终端名称', type: 'text', required: true },
      { name: 'shop', label: '所属门店', type: 'text' },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '收银机', value: 'cashier' }, { label: '自助机', value: 'kiosk' }, { label: '平板', value: 'pad' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '终端设备管理，管理门店内的收银机、自助机等设备。', features: ['新增/编辑/删除终端', '设备类型和归属管理'] }
  },
  // ===== 系统管理 =====
  {
    key: 'system-users', path: 'system/users', name: '系统用户', category: '系统管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name' },
      { title: '用户名', dataIndex: 'username' },
      { title: '角色', dataIndex: 'role' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'username', label: '用户名', type: 'text', required: true },
      { name: 'role', label: '角色', type: 'select', options: [
        { label: '管理员', value: 'admin' }, { label: '运营', value: 'operator' }, { label: '客服', value: 'service' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '系统用户管理，管理后台管理系统的登录账号。', features: ['新增/编辑/删除系统用户', '角色分配'] }
  },
  {
    key: 'system-roles', path: 'system/roles', name: '角色管理', category: '系统管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '角色名称', dataIndex: 'name' },
      { title: '编码', dataIndex: 'code' },
      { title: '权限', dataIndex: 'permissions' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '角色名称', type: 'text', required: true },
      { name: 'code', label: '角色编码', type: 'text', required: true },
      { name: 'permissions', label: '权限(JSON)', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '系统角色管理，配置不同角色的操作权限。', features: ['新增/编辑/删除角色', '权限配置'] }
  },
  // ===== 核销中心 =====
  {
    key: 'verification-records', path: 'verification/records', name: '核销记录', category: '核销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '核销码', dataIndex: 'code' },
      { title: '会员', dataIndex: 'member' },
      { title: '券/商品', dataIndex: 'target' },
      { title: '核销门店', dataIndex: 'shop' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ unused: '未核销', verified: '已核销', refunded: '已退' }[v] || v) },
      { title: '核销时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'code', label: '核销码', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'target', label: '券/商品', type: 'text' },
      { name: 'shop', label: '核销门店', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '未核销', value: 'unused' }, { label: '已核销', value: 'verified' }, { label: '已退', value: 'refunded' }
      ] },
      { name: 'time', label: '核销时间', type: 'text' }
    ],
    doc: { overview: '核销记录管理，会员到店核销礼券/积分商品时记录。', features: ['新增/编辑/删除核销记录', '核销状态流转'] }
  },
  {
    key: 'verification-staff', path: 'verification/staff', name: '核销员', category: '核销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name' },
      { title: '所属门店', dataIndex: 'shop' },
      { title: '核销次数', dataIndex: 'count' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'shop', label: '所属门店', type: 'text' },
      { name: 'count', label: '核销次数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '核销员管理，记录各门店可核销的员工。', features: ['新增/编辑/删除核销员', '核销统计'] }
  },
  // ===== 开票管理 =====
  {
    key: 'invoice-records', path: 'invoice/records', name: '开票记录', category: '开票管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '发票抬头', dataIndex: 'title' },
      { title: '会员', dataIndex: 'member' },
      { title: '金额', dataIndex: 'amount' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ normal: '普票', special: '专票', electronic: '电子' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待开', issued: '已开', void: '已作废' }[v] || v) }
    ],
    fields: [
      { name: 'title', label: '发票抬头', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'amount', label: '金额', type: 'number' },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '普票', value: 'normal' }, { label: '专票', value: 'special' }, { label: '电子发票', value: 'electronic' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待开', value: 'pending' }, { label: '已开', value: 'issued' }, { label: '已作废', value: 'void' }
      ] }
    ],
    doc: { overview: '开票记录管理，会员消费后申请开票的记录。', features: ['新增/编辑/删除开票记录', '开票状态管理'] }
  },
  // ===== 财务凭证 =====
  {
    key: 'finance-vouchers', path: 'finance/vouchers', name: '财务凭证', category: '财务凭证',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '凭证号', dataIndex: 'voucherNo' },
      { title: '科目', dataIndex: 'subject' },
      { title: '收入', dataIndex: 'income' },
      { title: '支出', dataIndex: 'expense' },
      { title: '摘要', dataIndex: 'summary' },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'voucherNo', label: '凭证号', type: 'text', required: true },
      { name: 'subject', label: '科目', type: 'text' },
      { name: 'income', label: '收入', type: 'number' },
      { name: 'expense', label: '支出', type: 'number' },
      { name: 'summary', label: '摘要', type: 'text' },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: { overview: '财务凭证管理，记录平台收支流水凭证。', features: ['新增/编辑/删除凭证', '收支记录'] }
  },
  // ===== 内容管理 =====
  {
    key: 'content-banners', path: 'content/banners', name: 'Banner管理', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '标题', dataIndex: 'title' },
      { title: '位置', dataIndex: 'position' },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '显示' : '隐藏') }
    ],
    fields: [
      { name: 'title', label: '标题', type: 'text', required: true },
      { name: 'position', label: '位置', type: 'select', options: [
        { label: '首页顶部', value: 'home_top' }, { label: '商城首页', value: 'shop_home' }, { label: '弹窗', value: 'popup' }
      ] },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: 'Banner广告位管理，配置小程序各页面轮播图。', features: ['新增/编辑/删除Banner', '排序与显隐'] }
  },
  // ===== 公域运营 =====
  {
    key: 'public-domain-ads', path: 'public-domain/ads', name: '公域投放', category: '公域运营',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '渠道', dataIndex: 'channel' },
      { title: '预算', dataIndex: 'budget' },
      { title: '引流人数', dataIndex: 'leads' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '进行中' : '已停') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'channel', label: '渠道', type: 'select', options: [
        { label: '抖音', value: 'douyin' }, { label: '小红书', value: 'xhs' }, { label: '美团', value: 'meituan' }, { label: '大众点评', value: 'dianping' }
      ] },
      { name: 'budget', label: '预算', type: 'number' },
      { name: 'leads', label: '引流人数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '公域投放管理，管理外部平台引流投放及效果。', features: ['新增/编辑/删除投放', '引流效果统计'] }
  },
  // ===== 地产积分 =====
  {
    key: 'property-points', path: 'property/points', name: '地产积分', category: '地产积分',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '业主', dataIndex: 'owner' },
      { title: '房产', dataIndex: 'property' },
      { title: '积分', dataIndex: 'points' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'owner', label: '业主', type: 'text', required: true },
      { name: 'property', label: '房产', type: 'text' },
      { name: 'points', label: '积分', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '地产积分管理，业主购房/缴费累计地产积分，可兑换物业权益。', features: ['新增/编辑/删除地产积分', '房产关联'] }
  },
  // ===== 物品租借 =====
  {
    key: 'rental-items', path: 'rental/items', name: '租借物品', category: '物品租借',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '物品名称', dataIndex: 'name' },
      { title: '押金', dataIndex: 'deposit' },
      { title: '租金', dataIndex: 'rent' },
      { title: '库存', dataIndex: 'stock' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '可借' : '下架') }
    ],
    fields: [
      { name: 'name', label: '物品名称', type: 'text', required: true },
      { name: 'deposit', label: '押金', type: 'number' },
      { name: 'rent', label: '租金', type: 'number' },
      { name: 'stock', label: '库存', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '租借物品管理，会员可租借雨伞、充电宝等物品。', features: ['新增/编辑/删除物品', '押金租金库存'] }
  },
  {
    key: 'rental-records', path: 'rental/records', name: '租借记录', category: '物品租借',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '物品', dataIndex: 'item' },
      { title: '会员', dataIndex: 'member' },
      { title: '借出时间', dataIndex: 'outTime' },
      { title: '归还时间', dataIndex: 'returnTime' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ rented: '已借出', returned: '已归还', overdue: '逾期' }[v] || v) }
    ],
    fields: [
      { name: 'item', label: '物品', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'outTime', label: '借出时间', type: 'text' },
      { name: 'returnTime', label: '归还时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '已借出', value: 'rented' }, { label: '已归还', value: 'returned' }, { label: '逾期', value: 'overdue' }
      ] }
    ],
    doc: { overview: '租借记录管理，记录会员租借物品的借还。', features: ['新增/编辑/删除记录', '借还状态流转'] }
  },
  // ===== 数据中心 =====
  {
    key: 'analytics-reports', path: 'analytics/reports', name: '分析报表', category: '数据中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '报表名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type' },
      { title: '周期', dataIndex: 'period' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '报表名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '会员分析', value: 'member' }, { label: '销售分析', value: 'sales' }, { label: '积分分析', value: 'points' }, { label: '活动分析', value: 'campaign' }
      ] },
      { name: 'period', label: '周期', type: 'select', options: [
        { label: '日', value: 'daily' }, { label: '周', value: 'weekly' }, { label: '月', value: 'monthly' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '分析报表管理，配置各类经营分析报表。', features: ['新增/编辑/删除报表', '多维度分析'] }
  }
];

export function getModule(key: string): ModuleConfig | undefined {
  return MODULES.find((m) => m.key === key);
}

// Build menu tree grouped by category
export function getMenuTree() {
  const groups: Record<string, ModuleConfig[]> = {};
  for (const m of MODULES) {
    if (!groups[m.category]) groups[m.category] = [];
    groups[m.category].push(m);
  }
  return Object.entries(groups).map(([category, items]) => ({ category, items }));
}
