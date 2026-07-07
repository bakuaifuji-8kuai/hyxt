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
      { title: '升级条件类型', dataIndex: 'upgradeType', render: (v) => ({ points: '积分', spent: '消费金额', growth: '成长值' }[v] || v) },
      { title: '升级所需值', dataIndex: 'minPoints' },
      { title: '折扣率', dataIndex: 'discount', render: (v) => (v != null ? v : '') },
      { title: '等级有效期(天)', dataIndex: 'validDays' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') },
      { title: '创建时间', dataIndex: 'createdAt' }
    ],
    fields: [
      { name: 'name', label: '等级名称', type: 'text', required: true },
      { name: 'code', label: '等级编码', type: 'text', required: true },
      { name: 'icon', label: '等级图标', type: 'text' },
      { name: 'upgradeType', label: '升级条件类型', type: 'select', options: [
        { label: '积分', value: 'points' }, { label: '消费金额', value: 'spent' }, { label: '成长值', value: 'growth' }
      ] },
      { name: 'minPoints', label: '升级所需值', type: 'number' },
      { name: 'keepCondition', label: '保级要求', type: 'text' },
      { name: 'downgradeRule', label: '降级规则', type: 'select', options: [
        { label: '不降级', value: 'none' }, { label: '自动降级', value: 'auto' }, { label: '手动降级', value: 'manual' }
      ] },
      { name: 'validDays', label: '等级有效期(天)', type: 'number' },
      { name: 'discount', label: '折扣率(0-1)', type: 'number' },
      { name: 'upgradeGift', label: '升级礼包', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '管理会员等级体系，配置不同等级的升级条件（积分/消费/成长值）、降级规则、有效期、折扣权益等。会员根据条件自动升级。',
      features: ['新增/编辑/删除会员等级', '配置升级条件类型（积分/消费/成长值）', '配置保级要求和降级规则', '设置等级有效期和升级礼包', '配置等级专属折扣率', '启用/禁用等级'],
      tips: ['等级编码不可重复', '折扣率范围0-1，如0.9表示9折', '保级要求如"年消费满1000元"']
    }
  },
  {
    key: 'member-list', path: 'member/list', name: '会员档案', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name' },
      { title: '手机号', dataIndex: 'phone' },
      { title: '会员卡号', dataIndex: 'cardNo' },
      { title: '会员等级', dataIndex: 'level', render: (v) => ({ NORMAL: '普通', SILVER: '银卡', GOLD: '金卡', DIAMOND: '钻石' }[v] || v) },
      { title: '成长值', dataIndex: 'growthValue' },
      { title: '积分', dataIndex: 'points' },
      { title: '储值余额', dataIndex: 'balance' },
      { title: '消费总额', dataIndex: 'totalSpent' },
      { title: '订单数', dataIndex: 'orderCount' },
      { title: '注册来源', dataIndex: 'source', render: (v) => ({ miniapp: '小程序', wxapp: '微信', shop: '门店', activity: '活动' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'phone', label: '手机号', type: 'text', required: true },
      { name: 'wxNickname', label: '微信昵称', type: 'text' },
      { name: 'avatar', label: '头像', type: 'text' },
      { name: 'openid', label: 'OpenID', type: 'text' },
      { name: 'cardNo', label: '会员卡号', type: 'text' },
      { name: 'gender', label: '性别', type: 'select', options: [
        { label: '男', value: 'male' }, { label: '女', value: 'female' }, { label: '保密', value: 'unknown' }
      ] },
      { name: 'birthday', label: '生日', type: 'text' },
      { name: 'age', label: '年龄', type: 'number' },
      { name: 'address', label: '家庭住址', type: 'text' },
      { name: 'occupation', label: '职业', type: 'text' },
      { name: 'hobby', label: '爱好', type: 'text' },
      { name: 'email', label: '电子邮箱', type: 'text' },
      { name: 'level', label: '会员等级', type: 'select', options: [
        { label: '普通会员', value: 'NORMAL' }, { label: '银卡会员', value: 'SILVER' },
        { label: '金卡会员', value: 'GOLD' }, { label: '钻石会员', value: 'DIAMOND' }
      ] },
      { name: 'growthValue', label: '成长值', type: 'number' },
      { name: 'points', label: '积分', type: 'number' },
      { name: 'balance', label: '储值余额', type: 'number' },
      { name: 'totalSpent', label: '消费总额', type: 'number' },
      { name: 'orderCount', label: '订单数', type: 'number' },
      { name: 'avgAmount', label: '客单价', type: 'number' },
      { name: 'source', label: '注册来源', type: 'select', options: [
        { label: '小程序', value: 'miniapp' }, { label: '微信', value: 'wxapp' }, { label: '门店', value: 'shop' }, { label: '活动', value: 'activity' }
      ] },
      { name: 'registerTime', label: '注册时间', type: 'text' },
      { name: 'lastLogin', label: '最近登录', type: 'text' },
      { name: 'lastConsume', label: '最近消费', type: 'text' },
      { name: 'remark', label: '备注', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '会员档案管理，记录会员基本信息、微信资料、会员卡号、成长值、储值余额、消费统计等，是会员营销和画像的基础数据。',
      features: ['新增/编辑/删除会员', '完善会员资料（含微信资料）', '查看会员成长值、积分、储值余额', '消费统计（总额、订单数、客单价）', '注册来源追踪', '启用/禁用会员'],
      tips: ['手机号作为会员唯一标识', '删除会员不影响历史订单记录', '成长值用于会员等级升级']
    }
  },
  {
    key: 'member-tags', path: 'member/tags', name: '会员标签', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '标签名称', dataIndex: 'name' },
      { title: '标签类型', dataIndex: 'tagType', render: (v) => ({ auto: '自动', manual: '手动', system: '系统' }[v] || v) },
      { title: '分类', dataIndex: 'category' },
      { title: '规则', dataIndex: 'rule' },
      { title: '覆盖人数', dataIndex: 'count' },
      { title: '更新时间', dataIndex: 'updatedAt' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '标签名称', type: 'text', required: true },
      { name: 'tagType', label: '标签类型', type: 'select', options: [
        { label: '自动', value: 'auto' }, { label: '手动', value: 'manual' }, { label: '系统', value: 'system' }
      ] },
      { name: 'category', label: '分类', type: 'select', options: [
        { label: '消费', value: '消费' }, { label: '活跃', value: '活跃' }, { label: '属性', value: '属性' }
      ] },
      { name: 'rule', label: '规则', type: 'text' },
      { name: 'condition', label: '触发条件', type: 'textarea' },
      { name: 'color', label: '标签颜色', type: 'text' },
      { name: 'count', label: '覆盖人数', type: 'number' },
      { name: 'updatedAt', label: '更新时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '会员标签管理，支持自动/手动/系统标签，通过规则自动圈选会员群体，用于精准营销触达。',
      features: ['新增/编辑/删除标签', '配置标签圈选规则和触发条件', '自动/手动/系统标签管理', '标签颜色配置', '查看标签覆盖人数'],
      tips: ['标签用于营销活动的人群定向', '自动标签根据触发条件自动更新人群']
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
      { title: '商品图片', dataIndex: 'mainImage' },
      { title: '商品名称', dataIndex: 'name' },
      { title: '商品编码', dataIndex: 'spuCode' },
      { title: '分类', dataIndex: 'category' },
      { title: '价格', dataIndex: 'price' },
      { title: '原价', dataIndex: 'originalPrice' },
      { title: '库存', dataIndex: 'stock' },
      { title: '销量', dataIndex: 'sales' },
      { title: '浏览量', dataIndex: 'views' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '上架' : '下架') },
      { title: '排序', dataIndex: 'sort' }
    ],
    fields: [
      { name: 'name', label: '商品名称', type: 'text', required: true },
      { name: 'spuCode', label: '商品编码', type: 'text' },
      { name: 'subtitle', label: '副标题', type: 'text' },
      { name: 'mainImage', label: '主图', type: 'text' },
      { name: 'detailImages', label: '详情图', type: 'textarea' },
      { name: 'category', label: '分类', type: 'text' },
      { name: 'specs', label: '商品规格', type: 'textarea', placeholder: '颜色:红色,蓝色;尺寸:S,M,L' },
      { name: 'skuInfo', label: 'SKU信息', type: 'textarea' },
      { name: 'price', label: '价格', type: 'number' },
      { name: 'originalPrice', label: '原价', type: 'number' },
      { name: 'costPrice', label: '成本价', type: 'number' },
      { name: 'stock', label: '库存', type: 'number' },
      { name: 'sales', label: '销量', type: 'number' },
      { name: 'tags', label: '商品标签', type: 'text' },
      { name: 'group', label: '商品分组', type: 'text' },
      { name: 'isVirtual', label: '虚拟商品', type: 'select', options: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' }
      ] },
      { name: 'limitBuy', label: '限购数量', type: 'number' },
      { name: 'minBuy', label: '起售数量', type: 'number' },
      { name: 'weight', label: '重量', type: 'number' },
      { name: 'volume', label: '体积', type: 'number' },
      { name: 'views', label: '浏览量', type: 'number' },
      { name: 'favorites', label: '收藏数', type: 'number' },
      { name: 'sellingPoint', label: '卖点', type: 'text' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '上架', value: 'enabled' }, { label: '下架', value: 'disabled' }
      ] }
    ],
    doc: { overview: '在线商城商品管理，配置小程序商城展示的商品，支持规格、SKU、价格、库存、虚拟商品等。', features: ['新增/编辑/删除商品', '上下架管理', '库存销量管理', '商品规格和SKU配置', '虚拟商品支持', '限购起售设置', '浏览收藏统计'] }
  },
  {
    key: 'shop-orders', path: 'shop/orders', name: '商城订单', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '订单号', dataIndex: 'orderNo' },
      { title: '会员', dataIndex: 'member' },
      { title: '商品', dataIndex: 'goods' },
      { title: '数量', dataIndex: 'quantity' },
      { title: '实付金额', dataIndex: 'actualAmount' },
      { title: '运费', dataIndex: 'freight' },
      { title: '支付方式', dataIndex: 'payMethod', render: (v) => ({ wechat: '微信', alipay: '支付宝', balance: '余额', points: '积分' }[v] || v) },
      { title: '订单状态', dataIndex: 'status', render: (v) => ({ pending: '待付款', paid: '已付款', shipped: '已发货', done: '已完成', cancelled: '已取消' }[v] || v) },
      { title: '售后状态', dataIndex: 'afterSaleStatus', render: (v) => ({ none: '无', applying: '申请中', approved: '已通过', rejected: '已拒绝' }[v] || v) },
      { title: '来源', dataIndex: 'source', render: (v) => ({ miniapp: '小程序', wxapp: '微信', shop: '门店' }[v] || v) },
      { title: '下单时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'orderNo', label: '订单号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'quantity', label: '商品总数', type: 'number' },
      { name: 'items', label: '商品明细', type: 'textarea' },
      { name: 'amount', label: '金额', type: 'number' },
      { name: 'freight', label: '运费', type: 'number' },
      { name: 'actualAmount', label: '实付金额', type: 'number' },
      { name: 'receiverName', label: '收货人', type: 'text' },
      { name: 'receiverPhone', label: '收货电话', type: 'text' },
      { name: 'receiverAddress', label: '收货地址', type: 'text' },
      { name: 'logisticsCompany', label: '物流公司', type: 'text' },
      { name: 'logisticsNo', label: '物流单号', type: 'text' },
      { name: 'payMethod', label: '支付方式', type: 'select', options: [
        { label: '微信', value: 'wechat' }, { label: '支付宝', value: 'alipay' }, { label: '余额', value: 'balance' }, { label: '积分', value: 'points' }
      ] },
      { name: 'payTime', label: '支付时间', type: 'text' },
      { name: 'shipTime', label: '发货时间', type: 'text' },
      { name: 'doneTime', label: '完成时间', type: 'text' },
      { name: 'remark', label: '订单备注', type: 'textarea' },
      { name: 'tags', label: '订单标签', type: 'text' },
      { name: 'source', label: '来源', type: 'select', options: [
        { label: '小程序', value: 'miniapp' }, { label: '微信', value: 'wxapp' }, { label: '门店', value: 'shop' }
      ] },
      { name: 'afterSaleStatus', label: '售后状态', type: 'select', options: [
        { label: '无', value: 'none' }, { label: '申请中', value: 'applying' }, { label: '已通过', value: 'approved' }, { label: '已拒绝', value: 'rejected' }
      ] },
      { name: 'status', label: '订单状态', type: 'select', options: [
        { label: '待付款', value: 'pending' }, { label: '已付款', value: 'paid' }, { label: '已发货', value: 'shipped' }, { label: '已完成', value: 'done' }, { label: '已取消', value: 'cancelled' }
      ] },
      { name: 'time', label: '下单时间', type: 'text' }
    ],
    doc: { overview: '在线商城订单管理，记录会员在商城的购买订单，含收货、物流、支付、售后等信息。', features: ['新增/编辑/删除订单', '订单状态流转', '收货物流管理', '多支付方式', '售后状态追踪'] }
  },
  {
    key: 'shop-categories', path: 'shop/categories', name: '商品分类', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '分类名称', dataIndex: 'name' },
      { title: '父分类', dataIndex: 'parentId' },
      { title: '分类图标', dataIndex: 'icon' },
      { title: '分类图片', dataIndex: 'image' },
      { title: '描述', dataIndex: 'description' },
      { title: '导航显示', dataIndex: 'showInNav', render: (v) => (v === 'yes' ? '是' : '否') },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '分类名称', type: 'text', required: true },
      { name: 'parentId', label: '父分类ID', type: 'number' },
      { name: 'icon', label: '分类图标', type: 'text' },
      { name: 'image', label: '分类图片', type: 'text' },
      { name: 'description', label: '分类描述', type: 'textarea' },
      { name: 'showInNav', label: '是否显示在导航', type: 'select', options: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' }
      ] },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '商城商品分类管理，支持多级分类、图标、图片、导航显示等，用于商品归类展示。', features: ['新增/编辑/删除分类', '多级分类（父分类）', '分类图标和图片', '导航显示控制', '排序管理'] }
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
  },
  {
    key: 'analytics-overview', path: 'analytics/overview', name: '数据总览', category: '数据中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '指标名称', dataIndex: 'name' },
      { title: '指标值', dataIndex: 'value' },
      { title: '环比', dataIndex: 'mom' },
      { title: '统计周期', dataIndex: 'period' }
    ],
    fields: [
      { name: 'name', label: '指标名称', type: 'text', required: true },
      { name: 'value', label: '指标值', type: 'number' },
      { name: 'mom', label: '环比', type: 'text' },
      { name: 'period', label: '统计周期', type: 'text' }
    ],
    doc: { overview: '平台核心运营数据总览，包含会员数、订单数、销售额、积分发放等关键指标。', features: ['新增/编辑/删除指标', '查看核心运营数据'] }
  },
  // ===== 会员数字化（补充）=====
  {
    key: 'member-benefits', path: 'member/benefits', name: '会员权益', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '权益名称', dataIndex: 'name' },
      { title: '适用等级', dataIndex: 'levels' },
      { title: '权益类型', dataIndex: 'type', render: (v) => ({ discount: '折扣', points: '积分倍率', parking: '停车', service: '专属客服', gift: '礼品', birthday: '生日特权', priority: '优先购买', experience: '免费体验', coupon: '专属券' }[v] || v) },
      { title: '权益值', dataIndex: 'value' },
      { title: '适用门店', dataIndex: 'shops' },
      { title: '有效期(天)', dataIndex: 'validDays' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '权益名称', type: 'text', required: true },
      { name: 'levels', label: '适用等级', type: 'text' },
      { name: 'type', label: '权益类型', type: 'select', options: [
        { label: '折扣', value: 'discount' }, { label: '积分倍率', value: 'points' }, { label: '停车', value: 'parking' }, { label: '专属客服', value: 'service' }, { label: '礼品', value: 'gift' }, { label: '生日特权', value: 'birthday' }, { label: '优先购买', value: 'priority' }, { label: '免费体验', value: 'experience' }, { label: '专属券', value: 'coupon' }
      ] },
      { name: 'value', label: '权益值', type: 'text' },
      { name: 'shops', label: '适用门店', type: 'text' },
      { name: 'validDays', label: '有效期(天)', type: 'number' },
      { name: 'description', label: '说明', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '会员权益管理，为不同等级会员配置差异化权益（折扣、积分倍率、停车、专属客服、礼品、生日特权、优先购买、免费体验、专属券等），用于小程序展示。', features: ['新增/编辑/删除权益', '按等级配置权益', '权益类型多样化', '适用门店和有效期配置'] }
  },
  {
    key: 'member-profiles', path: 'member/profiles', name: '会员画像', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '标签', dataIndex: 'tags' },
      { title: '消费偏好', dataIndex: 'consumeTag' },
      { title: '品牌偏好', dataIndex: 'brandTag' },
      { title: '积分偏好', dataIndex: 'pointsTag' },
      { title: '最近活跃', dataIndex: 'lastActive' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'tags', label: '标签', type: 'text' },
      { name: 'consumeTag', label: '消费偏好', type: 'text' },
      { name: 'brandTag', label: '品牌偏好', type: 'text' },
      { name: 'pointsTag', label: '积分偏好', type: 'text' },
      { name: 'lastActive', label: '最近活跃', type: 'text' }
    ],
    doc: { overview: '会员 360 画像，汇总会员消费、互动、品牌、积分等多维标签，为精准营销提供数据支撑。', features: ['新增/编辑/删除画像', '多维标签管理', '消费偏好分析'] }
  },
  {
    key: 'member-tag-relations', path: 'member/tag-relations', name: '会员打标签', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '标签', dataIndex: 'tag' },
      { title: '打标方式', dataIndex: 'source', render: (v) => ({ manual: '手动', auto: '自动' }[v] || v) },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'tag', label: '标签', type: 'text', required: true },
      { name: 'source', label: '打标方式', type: 'select', options: [
        { label: '手动', value: 'manual' }, { label: '自动', value: 'auto' }
      ] },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: { overview: '会员与标签的关联管理，支持手动打标和规则自动打标。', features: ['新增/编辑/删除标签关系', '手动/自动打标'] }
  },
  {
    key: 'member-groups', path: 'member/groups', name: '会员分组', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '分组名称', dataIndex: 'name' },
      { title: '分组类型', dataIndex: 'type', render: (v) => ({ custom: '自定义', smart: '智能' }[v] || v) },
      { title: '条件', dataIndex: 'condition' },
      { title: '人数', dataIndex: 'count' },
      { title: '说明', dataIndex: 'remark' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '分组名称', type: 'text', required: true },
      { name: 'type', label: '分组类型', type: 'select', options: [
        { label: '自定义', value: 'custom' }, { label: '智能', value: 'smart' }
      ] },
      { name: 'condition', label: '条件', type: 'textarea' },
      { name: 'count', label: '人数', type: 'number' },
      { name: 'remark', label: '说明', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '自定义分组和智能分组（基于条件自动圈选），用于精准营销。', features: ['新增/编辑/删除分组', '自定义/智能分组', '条件自动圈选会员'] }
  },
  {
    key: 'member-cards', path: 'member/cards', name: '会员卡管理', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '卡号', dataIndex: 'cardNo' },
      { title: '会员', dataIndex: 'member' },
      { title: '卡类型', dataIndex: 'cardType', render: (v) => ({ entity: '实体卡', electronic: '电子卡', virtual: '虚拟卡' }[v] || v) },
      { title: '卡面样式', dataIndex: 'cardStyle' },
      { title: '余额', dataIndex: 'balance' },
      { title: '积分', dataIndex: 'points' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ normal: '正常', locked: '锁定', loss: '挂失' }[v] || v) },
      { title: '发卡时间', dataIndex: 'issueTime' },
      { title: '有效期', dataIndex: 'validUntil' }
    ],
    fields: [
      { name: 'cardNo', label: '卡号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'cardType', label: '卡类型', type: 'select', options: [
        { label: '实体卡', value: 'entity' }, { label: '电子卡', value: 'electronic' }, { label: '虚拟卡', value: 'virtual' }
      ] },
      { name: 'cardStyle', label: '卡面样式', type: 'text' },
      { name: 'balance', label: '余额', type: 'number' },
      { name: 'points', label: '积分', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '正常', value: 'normal' }, { label: '锁定', value: 'locked' }, { label: '挂失', value: 'loss' }
      ] },
      { name: 'issueTime', label: '发卡时间', type: 'text' },
      { name: 'validUntil', label: '有效期', type: 'text' }
    ],
    doc: { overview: '会员卡管理，支持实体卡、电子卡、虚拟卡，管理卡面样式、余额、状态。', features: ['新增/编辑/删除会员卡', '实体/电子/虚拟卡管理', '卡面样式配置', '卡状态管理（正常/锁定/挂失）'] }
  },
  {
    key: 'member-growth', path: 'member/growth', name: '会员成长值', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '当前成长值', dataIndex: 'currentValue' },
      { title: '等级', dataIndex: 'level' },
      { title: '任务成长', dataIndex: 'taskGrowth' },
      { title: '消费成长', dataIndex: 'spendGrowth' },
      { title: '有效期', dataIndex: 'validUntil' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'currentValue', label: '当前成长值', type: 'number' },
      { name: 'level', label: '等级', type: 'select', options: [
        { label: '普通会员', value: 'NORMAL' }, { label: '银卡会员', value: 'SILVER' },
        { label: '金卡会员', value: 'GOLD' }, { label: '钻石会员', value: 'DIAMOND' }
      ] },
      { name: 'taskGrowth', label: '任务成长', type: 'number' },
      { name: 'spendGrowth', label: '消费成长', type: 'number' },
      { name: 'validUntil', label: '有效期', type: 'text' }
    ],
    doc: { overview: '会员成长值体系，通过消费、任务等行为获取成长值，用于会员等级升级。', features: ['新增/编辑/删除成长值', '消费/任务成长值记录', '成长值有效期管理'] }
  },
  {
    key: 'member-assets', path: 'member/assets', name: '会员资产', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '储值余额', dataIndex: 'balance' },
      { title: '积分', dataIndex: 'points' },
      { title: '优惠券数', dataIndex: 'couponCount' },
      { title: '权益卡数', dataIndex: 'benefitCount' },
      { title: '总价值', dataIndex: 'totalValue' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'balance', label: '储值余额', type: 'number' },
      { name: 'points', label: '积分', type: 'number' },
      { name: 'couponCount', label: '优惠券数', type: 'number' },
      { name: 'benefitCount', label: '权益卡数', type: 'number' },
      { name: 'totalValue', label: '总价值', type: 'number' }
    ],
    doc: { overview: '会员资产汇总，查看会员的储值、积分、券、权益卡等全部资产。', features: ['新增/编辑/删除资产', '储值/积分/券/权益卡汇总', '总价值核算'] }
  },
  {
    key: 'member-referrals', path: 'member/referrals', name: '会员推荐关系', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '推荐人', dataIndex: 'referrer' },
      { title: '被推荐人', dataIndex: 'invitee' },
      { title: '推荐时间', dataIndex: 'time' },
      { title: '推荐渠道', dataIndex: 'channel', render: (v) => ({ share: '分享', qr: '二维码', link: '链接' }[v] || v) },
      { title: '奖励状态', dataIndex: 'rewardStatus', render: (v) => ({ pending: '待发放', done: '已发放' }[v] || v) },
      { title: '推荐人奖励', dataIndex: 'referrerReward' },
      { title: '被推荐人奖励', dataIndex: 'inviteeReward' }
    ],
    fields: [
      { name: 'referrer', label: '推荐人', type: 'text', required: true },
      { name: 'invitee', label: '被推荐人', type: 'text', required: true },
      { name: 'time', label: '推荐时间', type: 'text' },
      { name: 'channel', label: '推荐渠道', type: 'select', options: [
        { label: '分享', value: 'share' }, { label: '二维码', value: 'qr' }, { label: '链接', value: 'link' }
      ] },
      { name: 'rewardStatus', label: '奖励状态', type: 'select', options: [
        { label: '待发放', value: 'pending' }, { label: '已发放', value: 'done' }
      ] },
      { name: 'referrerReward', label: '推荐人奖励', type: 'text' },
      { name: 'inviteeReward', label: '被推荐人奖励', type: 'text' }
    ],
    doc: { overview: '会员推荐关系链，记录推荐人与被推荐人的关系及奖励发放情况。', features: ['新增/编辑/删除推荐关系', '多渠道推荐追踪', '双向奖励发放'] }
  },
  // ===== 积分中心（补充）=====
  {
    key: 'points-mall-orders', path: 'points/mall-orders', name: '积分商城订单', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '订单号', dataIndex: 'orderNo' },
      { title: '会员', dataIndex: 'member' },
      { title: '商品', dataIndex: 'goods' },
      { title: '消耗积分', dataIndex: 'points' },
      { title: '提货方式', dataIndex: 'delivery', render: (v) => ({ self: '自提', express: '邮寄' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待发货', shipped: '已发货', done: '已完成', cancelled: '已取消' }[v] || v) }
    ],
    fields: [
      { name: 'orderNo', label: '订单号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'points', label: '消耗积分', type: 'number' },
      { name: 'delivery', label: '提货方式', type: 'select', options: [
        { label: '自提', value: 'self' }, { label: '邮寄', value: 'express' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待发货', value: 'pending' }, { label: '已发货', value: 'shipped' }, { label: '已完成', value: 'done' }, { label: '已取消', value: 'cancelled' }
      ] }
    ],
    doc: { overview: '积分商城兑换订单管理，支持自提和邮寄两种履约方式。', features: ['新增/编辑/删除积分商城订单', '自提/邮寄管理', '订单状态流转'] }
  },
  // ===== 智慧停车（补充）=====
  {
    key: 'parking-lots', path: 'parking/lots', name: '停车场管理', category: '智慧停车',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '停车场名称', dataIndex: 'name' },
      { title: '所属项目', dataIndex: 'project' },
      { title: '总车位', dataIndex: 'totalSpaces' },
      { title: '空闲车位', dataIndex: 'availableSpaces' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '停车场名称', type: 'text', required: true },
      { name: 'project', label: '所属项目', type: 'text' },
      { name: 'totalSpaces', label: '总车位', type: 'number' },
      { name: 'availableSpaces', label: '空闲车位', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '停车场基础信息管理，配置项目名称、车位数量、空闲车位等。', features: ['新增/编辑/删除停车场', '车位数量管理'] }
  },
  {
    key: 'parking-rules', path: 'parking/rules', name: '停车计费规则', category: '智慧停车',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '免费时长(分)', dataIndex: 'freeMinutes' },
      { title: '单价(元/小时)', dataIndex: 'pricePerHour' },
      { title: '封顶金额', dataIndex: 'capAmount' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'freeMinutes', label: '免费时长(分钟)', type: 'number' },
      { name: 'pricePerHour', label: '单价(元/小时)', type: 'number' },
      { name: 'capAmount', label: '封顶金额', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '停车计费规则配置，支持免费时长、按时计费、封顶金额等策略。', features: ['新增/编辑/删除计费规则', '差异化计费策略'] }
  },
  // ===== 商户营销（补充）=====
  {
    key: 'merchant-verification', path: 'merchant/verification', name: '商户核销统计', category: '商户营销',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商户', dataIndex: 'merchant' },
      { title: '核销类型', dataIndex: 'type' },
      { title: '核销数量', dataIndex: 'count' },
      { title: '核销金额', dataIndex: 'amount' },
      { title: '统计日期', dataIndex: 'date' }
    ],
    fields: [
      { name: 'merchant', label: '商户', type: 'text', required: true },
      { name: 'type', label: '核销类型', type: 'select', options: [
        { label: '优惠券', value: 'coupon' }, { label: '积分商品', value: 'points' }, { label: '商城订单', value: 'shop' }, { label: '活动报名', value: 'activity' }
      ] },
      { name: 'count', label: '核销数量', type: 'number' },
      { name: 'amount', label: '核销金额', type: 'number' },
      { name: 'date', label: '统计日期', type: 'text' }
    ],
    doc: { overview: '商户核销数据统计，汇总各商户的券、积分商品、商城订单等核销情况。', features: ['新增/编辑/删除核销统计', '多类型核销汇总'] }
  },
  {
    key: 'merchant-coupon-issue', path: 'merchant/coupon-issue', name: '商户发券', category: '商户营销',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商户', dataIndex: 'merchant' },
      { title: '券模板', dataIndex: 'template' },
      { title: '发放会员', dataIndex: 'member' },
      { title: '数量', dataIndex: 'count' },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'merchant', label: '商户', type: 'text', required: true },
      { name: 'template', label: '券模板', type: 'text' },
      { name: 'member', label: '发放会员', type: 'text' },
      { name: 'count', label: '数量', type: 'number' },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: { overview: '商户在商户助手小程序上向会员发放优惠券/停车券的记录管理。', features: ['新增/编辑/删除发券记录', '单个/批量发放'] }
  },
  // ===== 在线商城（补充）=====
  {
    key: 'shop-home-config', path: 'shop/home-config', name: '商城首页配置', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '配置名称', dataIndex: 'name' },
      { title: '页面类型', dataIndex: 'pageType', render: (v) => ({ home: '商场首页', category: '分类页', custom: '自定义页' }[v] || v) },
      { title: '组件配置', dataIndex: 'components' },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '配置名称', type: 'text', required: true },
      { name: 'pageType', label: '页面类型', type: 'select', options: [
        { label: '商场首页', value: 'home' }, { label: '分类页', value: 'category' }, { label: '自定义页', value: 'custom' }
      ] },
      { name: 'components', label: '组件配置(JSON)', type: 'textarea' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '小程序线上商城首页配置，支持门店切换、搜索、广告轮播、分类导购、促销活动、推荐商品、底部菜单等组件。', features: ['新增/编辑/删除首页配置', '可视化组件配置', '页面启停管理'] }
  },
  {
    key: 'shop-bottom-menu', path: 'shop/bottom-menu', name: '商城底部菜单', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '菜单名称', dataIndex: 'name' },
      { title: '图标', dataIndex: 'icon' },
      { title: '链接', dataIndex: 'link' },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '菜单名称', type: 'text', required: true },
      { name: 'icon', label: '图标', type: 'text' },
      { name: 'link', label: '链接', type: 'text' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '小程序线上商城底部导航菜单配置，控制小程序底部tab的菜单名称、图标、跳转链接、排序及显隐。', features: ['新增/编辑/删除底部菜单', '配置图标与跳转链接', '排序管理'] }
  },
  {
    key: 'shop-brands', path: 'shop/brands', name: '品牌管理', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '品牌名称', dataIndex: 'name' },
      { title: 'LOGO', dataIndex: 'logo' },
      { title: '分类', dataIndex: 'category' },
      { title: '联系电话', dataIndex: 'phone' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '品牌名称', type: 'text', required: true },
      { name: 'logo', label: 'LOGO地址', type: 'text' },
      { name: 'category', label: '分类', type: 'text' },
      { name: 'phone', label: '联系电话', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '在线商城品牌管理，维护品牌 LOGO、形象、电话、在售商品等信息，用于品牌导览。', features: ['新增/编辑/删除品牌', '品牌分类管理'] }
  },
  {
    key: 'shop-returns', path: 'shop/returns', name: '订单退货', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '退货单号', dataIndex: 'returnNo' },
      { title: '原订单号', dataIndex: 'orderNo' },
      { title: '会员', dataIndex: 'member' },
      { title: '退款金额', dataIndex: 'amount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待审核', approved: '已通过', rejected: '已拒绝', refunded: '已退款' }[v] || v) },
      { title: '申请时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'returnNo', label: '退货单号', type: 'text', required: true },
      { name: 'orderNo', label: '原订单号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'amount', label: '退款金额', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待审核', value: 'pending' }, { label: '已通过', value: 'approved' }, { label: '已拒绝', value: 'rejected' }, { label: '已退款', value: 'refunded' }
      ] },
      { name: 'time', label: '申请时间', type: 'text' }
    ],
    doc: { overview: '线上商城订单退货/退款管理，会员发起退款后，后台审核并原路退回。', features: ['新增/编辑/删除退货单', '退款审核', '状态流转'] }
  },
  {
    key: 'shop-specs', path: 'shop/specs', name: '商品规格', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规格名称', dataIndex: 'name' },
      { title: '规格值', dataIndex: 'values' },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规格名称', type: 'text', required: true, placeholder: '如：颜色' },
      { name: 'values', label: '规格值', type: 'text', required: true, placeholder: '如：红色,蓝色,黄色' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '商品规格管理，统一管理颜色、尺寸、版本等规格属性。', features: ['新增/编辑/删除规格', '规格值管理', '排序与启停'] }
  },
  {
    key: 'shop-reviews', path: 'shop/reviews', name: '商品评价', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商品', dataIndex: 'goods' },
      { title: '会员', dataIndex: 'member' },
      { title: '评分', dataIndex: 'score' },
      { title: '评价内容', dataIndex: 'content' },
      { title: '评价类型', dataIndex: 'type', render: (v) => ({ all: '全部', good: '好评', medium: '中评', bad: '差评' }[v] || v) },
      { title: '匿名', dataIndex: 'anonymous', render: (v) => (v === 'yes' ? '是' : '否') },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待审核', published: '已发布', hidden: '已隐藏' }[v] || v) }
    ],
    fields: [
      { name: 'goods', label: '商品', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'score', label: '评分(1-5)', type: 'number' },
      { name: 'content', label: '评价内容', type: 'textarea' },
      { name: 'images', label: '评价图片', type: 'text' },
      { name: 'reply', label: '回复', type: 'textarea' },
      { name: 'type', label: '评价类型', type: 'select', options: [
        { label: '全部', value: 'all' }, { label: '好评', value: 'good' }, { label: '中评', value: 'medium' }, { label: '差评', value: 'bad' }
      ] },
      { name: 'anonymous', label: '是否匿名', type: 'select', options: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待审核', value: 'pending' }, { label: '已发布', value: 'published' }, { label: '已隐藏', value: 'hidden' }
      ] }
    ],
    doc: { overview: '商品评价管理，支持评分筛选、评价回复、评价审核。', features: ['新增/编辑/删除评价', '评分筛选', '评价回复', '审核与显隐'] }
  },
  {
    key: 'shop-shipping-templates', path: 'shop/shipping-templates', name: '物流模板', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '模板名称', dataIndex: 'name' },
      { title: '计价方式', dataIndex: 'chargeType', render: (v) => ({ piece: '按件', weight: '按重', volume: '按体积' }[v] || v) },
      { title: '首件', dataIndex: 'firstNum' },
      { title: '首费', dataIndex: 'firstPrice' },
      { title: '续件', dataIndex: 'addNum' },
      { title: '续费', dataIndex: 'addPrice' },
      { title: '包邮条件', dataIndex: 'freeCondition' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '模板名称', type: 'text', required: true },
      { name: 'chargeType', label: '计价方式', type: 'select', options: [
        { label: '按件', value: 'piece' }, { label: '按重', value: 'weight' }, { label: '按体积', value: 'volume' }
      ] },
      { name: 'firstNum', label: '首件', type: 'number' },
      { name: 'firstPrice', label: '首费', type: 'number' },
      { name: 'addNum', label: '续件', type: 'number' },
      { name: 'addPrice', label: '续费', type: 'number' },
      { name: 'freeCondition', label: '包邮条件', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '运费模板配置，支持按件/按重/按体积计费，设置首件续件及包邮规则。', features: ['新增/编辑/删除模板', '多种计价方式', '首件续件配置', '包邮条件设置'] }
  },
  {
    key: 'shop-addresses', path: 'shop/addresses', name: '收货地址', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '收货人', dataIndex: 'receiver' },
      { title: '电话', dataIndex: 'phone' },
      { title: '省份', dataIndex: 'province' },
      { title: '城市', dataIndex: 'city' },
      { title: '区县', dataIndex: 'district' },
      { title: '详细地址', dataIndex: 'detail' },
      { title: '默认', dataIndex: 'isDefault', render: (v) => (v === 'yes' ? '是' : '否') },
      { title: '标签', dataIndex: 'label' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'receiver', label: '收货人', type: 'text', required: true },
      { name: 'phone', label: '电话', type: 'text' },
      { name: 'province', label: '省份', type: 'text' },
      { name: 'city', label: '城市', type: 'text' },
      { name: 'district', label: '区县', type: 'text' },
      { name: 'detail', label: '详细地址', type: 'text' },
      { name: 'isDefault', label: '是否默认', type: 'select', options: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' }
      ] },
      { name: 'label', label: '标签', type: 'text' }
    ],
    doc: { overview: '会员收货地址管理，支持多地址及默认地址设置。', features: ['新增/编辑/删除地址', '多地址管理', '默认地址设置', '地址标签'] }
  },
  {
    key: 'shop-delivery', path: 'shop/delivery', name: '配送方式', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '配送方式名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ express: '快递', selfpick: '自提', local: '同城配送' }[v] || v) },
      { title: '描述', dataIndex: 'description' },
      { title: '运费', dataIndex: 'fee' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '配送方式名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '快递', value: 'express' }, { label: '自提', value: 'selfpick' }, { label: '同城配送', value: 'local' }
      ] },
      { name: 'description', label: '描述', type: 'textarea' },
      { name: 'fee', label: '运费', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '配送方式管理，支持快递、自提、同城配送等方式。', features: ['新增/编辑/删除配送方式', '多种配送类型', '运费配置'] }
  },
  {
    key: 'shop-groups', path: 'shop/groups', name: '商品分组', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '分组名称', dataIndex: 'name' },
      { title: '描述', dataIndex: 'description' },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '分组名称', type: 'text', required: true },
      { name: 'description', label: '描述', type: 'textarea' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '商品分组管理，用于商品归类和首页推荐展示。', features: ['新增/编辑/删除分组', '商品归类', '首页推荐'] }
  },
  {
    key: 'shop-aftersale', path: 'shop/aftersale', name: '售后管理', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '售后单号', dataIndex: 'aftersaleNo' },
      { title: '订单号', dataIndex: 'orderNo' },
      { title: '会员', dataIndex: 'member' },
      { title: '商品', dataIndex: 'goods' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ refund: '仅退款', return: '退货退款', exchange: '换货' }[v] || v) },
      { title: '原因', dataIndex: 'reason' },
      { title: '退款金额', dataIndex: 'amount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ applying: '申请中', approved: '已通过', rejected: '已拒绝', refunded: '已退款' }[v] || v) },
      { title: '申请时间', dataIndex: 'applyTime' },
      { title: '处理时间', dataIndex: 'processTime' },
      { title: '处理人', dataIndex: 'handler' }
    ],
    fields: [
      { name: 'aftersaleNo', label: '售后单号', type: 'text', required: true },
      { name: 'orderNo', label: '订单号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '仅退款', value: 'refund' }, { label: '退货退款', value: 'return' }, { label: '换货', value: 'exchange' }
      ] },
      { name: 'reason', label: '原因', type: 'textarea' },
      { name: 'amount', label: '退款金额', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '申请中', value: 'applying' }, { label: '已通过', value: 'approved' }, { label: '已拒绝', value: 'rejected' }, { label: '已退款', value: 'refunded' }
      ] },
      { name: 'applyTime', label: '申请时间', type: 'text' },
      { name: 'processTime', label: '处理时间', type: 'text' },
      { name: 'handler', label: '处理人', type: 'text' },
      { name: 'processRemark', label: '处理备注', type: 'textarea' }
    ],
    doc: { overview: '售后工单管理，处理退款、退货、换货等售后申请。', features: ['新增/编辑/删除售后单', '退款/退货/换货处理', '工单状态流转', '处理记录'] }
  },
  // ===== 营销中心（补充）=====
  {
    key: 'activity-signups', path: 'activity/signups', name: '活动报名', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '报名时间', dataIndex: 'signupTime' },
      { title: '会员', dataIndex: 'member' },
      { title: '人数', dataIndex: 'count' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待签到', checked: '已签到', cancelled: '已取消' }[v] || v) }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'signupTime', label: '报名时间', type: 'text' },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'count', label: '人数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待签到', value: 'pending' }, { label: '已签到', value: 'checked' }, { label: '已取消', value: 'cancelled' }
      ] }
    ],
    doc: { overview: '活动报名管理，会员在小程序报名商场活动，后台管理报名列表和签到。', features: ['新增/编辑/删除报名', '报名签到管理'] }
  },
  {
    key: 'checkin-activities', path: 'activity/checkin', name: '签到活动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '奖励类型', dataIndex: 'rewardType', render: (v) => ({ points: '积分', coupon: '优惠券', parking: '停车券' }[v] || v) },
      { title: '奖励值', dataIndex: 'rewardValue' },
      { title: '周期', dataIndex: 'period', render: (v) => ({ daily: '每日', weekly: '每周', monthly: '每月' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'rewardType', label: '奖励类型', type: 'select', options: [
        { label: '积分', value: 'points' }, { label: '优惠券', value: 'coupon' }, { label: '停车券', value: 'parking' }
      ] },
      { name: 'rewardValue', label: '奖励值', type: 'text' },
      { name: 'period', label: '周期', type: 'select', options: [
        { label: '每日', value: 'daily' }, { label: '每周', value: 'weekly' }, { label: '每月', value: 'monthly' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '会员签到活动配置，支持积分、优惠券、停车券等奖励，培养会员活跃习惯。', features: ['新增/编辑/删除签到活动', '多种奖励配置'] }
  },
  {
    key: 'referral-gifts', path: 'marketing/referral', name: '推荐有礼', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '推荐人奖励', dataIndex: 'referrerReward' },
      { title: '被邀人奖励', dataIndex: 'inviteeReward' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'referrerReward', label: '推荐人奖励', type: 'text' },
      { name: 'inviteeReward', label: '被邀人奖励', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '推荐有礼活动，老会员分享推荐码，新会员注册后双方获得积分、优惠券或实物奖励。', features: ['新增/编辑/删除活动', '双向奖励配置'] }
  },
  {
    key: 'new-member-gifts', path: 'marketing/new-member', name: '新人礼', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '礼包名称', dataIndex: 'name' },
      { title: '奖励内容', dataIndex: 'rewards' },
      { title: '有效期(天)', dataIndex: 'validDays' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '礼包名称', type: 'text', required: true },
      { name: 'rewards', label: '奖励内容', type: 'text' },
      { name: 'validDays', label: '有效期(天)', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '新会员注册礼包，自动发放停车券、积分、优惠券等新人礼。', features: ['新增/编辑/删除新人礼', '配置奖励内容和有效期'] }
  },
  {
    key: 'help-coupons', path: 'marketing/help-coupon', name: '助力领券', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '券模板', dataIndex: 'template' },
      { title: '所需人数', dataIndex: 'needHelp' },
      { title: '已助力', dataIndex: 'helped' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'template', label: '券模板', type: 'text' },
      { name: 'needHelp', label: '所需助力人数', type: 'number' },
      { name: 'helped', label: '已助力', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '助力领券活动，会员邀请好友助力，达到人数后以低价或免费获得优惠券。', features: ['新增/编辑/删除活动', '助力人数配置'] }
  },
  {
    key: 'word-coupons', path: 'marketing/word-coupon', name: '口令领券', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '口令', dataIndex: 'word' },
      { title: '券模板', dataIndex: 'template' },
      { title: '已领取', dataIndex: 'claimed' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'word', label: '口令', type: 'text', required: true },
      { name: 'template', label: '券模板', type: 'text' },
      { name: 'claimed', label: '已领取', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '口令领券活动，会员输入专属口令后领取优惠券，常用于社群运营。', features: ['新增/编辑/删除口令活动', '口令配置'] }
  },
  {
    key: 'games', path: 'marketing/games', name: '游戏互动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '游戏名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ wheel: '大转盘', slot: '老虎机', redpacket: '抢红包', grid: '九宫格' }[v] || v) },
      { title: '奖励', dataIndex: 'rewards' },
      { title: '参与次数', dataIndex: 'plays' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '游戏名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '大转盘', value: 'wheel' }, { label: '老虎机', value: 'slot' }, { label: '抢红包', value: 'redpacket' }, { label: '九宫格', value: 'grid' }
      ] },
      { name: 'rewards', label: '奖励配置', type: 'text' },
      { name: 'plays', label: '参与次数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '游戏互动营销，支持大转盘、老虎机、抢红包、九宫格等，会员参与可获得积分、停车券、代金券。', features: ['新增/编辑/删除游戏', '多种游戏类型', '奖励配置'] }
  },
  {
    key: 'surveys', path: 'marketing/surveys', name: '调查问卷', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '问卷标题', dataIndex: 'title' },
      { title: '参与人数', dataIndex: 'participants' },
      { title: '奖励', dataIndex: 'reward' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'title', label: '问卷标题', type: 'text', required: true },
      { name: 'participants', label: '参与人数', type: 'number' },
      { name: 'reward', label: '奖励', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '调查问卷功能，与会员互动并收集意见，可配置参与奖励。', features: ['新增/编辑/删除问卷', '参与人数统计'] }
  },
  {
    key: 'votes', path: 'marketing/votes', name: '投票活动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '投票标题', dataIndex: 'title' },
      { title: '选项', dataIndex: 'options' },
      { title: '总票数', dataIndex: 'totalVotes' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'title', label: '投票标题', type: 'text', required: true },
      { name: 'options', label: '选项(JSON)', type: 'textarea' },
      { name: 'totalVotes', label: '总票数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '投票活动管理，上传投票素材、发起投票、统计结果，可给参与会员奖励。', features: ['新增/编辑/删除投票', '选项与票数统计'] }
  },
  {
    key: 'countdown-sales', path: 'marketing/countdown', name: '限时购', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '商品', dataIndex: 'goods' },
      { title: '活动价', dataIndex: 'price' },
      { title: '原价', dataIndex: 'originalPrice' },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '结束时间', dataIndex: 'endTime' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'price', label: '活动价', type: 'number' },
      { name: 'originalPrice', label: '原价', type: 'number' },
      { name: 'startTime', label: '开始时间', type: 'text' },
      { name: 'endTime', label: '结束时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '限时购活动，在指定时间段内以特价销售商品，营造紧迫感。', features: ['新增/编辑/删除限时购', '配置活动时间与价格'] }
  },
  {
    key: 'pre-sales', path: 'marketing/pre-sale', name: '预售', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商品', dataIndex: 'goods' },
      { title: '定金', dataIndex: 'deposit' },
      { title: '尾款', dataIndex: 'finalPayment' },
      { title: '预售时间', dataIndex: 'preTime' },
      { title: '发货时间', dataIndex: 'deliveryTime' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'goods', label: '商品', type: 'text', required: true },
      { name: 'deposit', label: '定金', type: 'number' },
      { name: 'finalPayment', label: '尾款', type: 'number' },
      { name: 'preTime', label: '预售时间', type: 'text' },
      { name: 'deliveryTime', label: '发货时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '预售活动管理，支持定金+尾款模式，提前锁定销售。', features: ['新增/编辑/删除预售', '定金尾款配置'] }
  },
  {
    key: 'bargain', path: 'marketing/bargain', name: '帮砍价', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '商品', dataIndex: 'goods' },
      { title: '原价', dataIndex: 'originalPrice' },
      { title: '底价', dataIndex: 'floorPrice' },
      { title: '已发起', dataIndex: 'started' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'originalPrice', label: '原价', type: 'number' },
      { name: 'floorPrice', label: '底价', type: 'number' },
      { name: 'started', label: '已发起', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '帮砍价活动，会员邀请好友帮忙砍价，砍到低价即可购买。', features: ['新增/编辑/删除砍价活动', '底价配置'] }
  },
  {
    key: 'lucky-draws', path: 'marketing/lucky-draw', name: '众筹抽奖', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '奖品', dataIndex: 'prize' },
      { title: '参与人数', dataIndex: 'participants' },
      { title: '开奖时间', dataIndex: 'drawTime' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'prize', label: '奖品', type: 'text' },
      { name: 'participants', label: '参与人数', type: 'number' },
      { name: 'drawTime', label: '开奖时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '众筹抽奖活动，会员参与众筹达到一定人数后开奖。', features: ['新增/编辑/删除抽奖', '奖品与开奖时间配置'] }
  },
  {
    key: 'blind-boxes', path: 'marketing/blind-box', name: '盲盒活动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '价格', dataIndex: 'price' },
      { title: '奖品池', dataIndex: 'prizes' },
      { title: '已开盒', dataIndex: 'opened' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'price', label: '价格', type: 'number' },
      { name: 'prizes', label: '奖品池', type: 'text' },
      { name: 'opened', label: '已开盒', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '盲盒营销活动，会员购买盲盒随机获得奖品，增加趣味性。', features: ['新增/编辑/删除盲盒', '奖品池配置'] }
  },
  {
    key: 'count-cards', path: 'marketing/count-cards', name: '计次卡', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '卡名称', dataIndex: 'name' },
      { title: '可用次数', dataIndex: 'times' },
      { title: '价格', dataIndex: 'price' },
      { title: '适用商户', dataIndex: 'merchants' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '卡名称', type: 'text', required: true },
      { name: 'times', label: '可用次数', type: 'number' },
      { name: 'price', label: '价格', type: 'number' },
      { name: 'merchants', label: '适用商户', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '计次卡管理，会员在线购买计次卡，在指定商户消费享受折扣。', features: ['新增/编辑/删除计次卡', '次数与适用商户配置'] }
  },
  {
    key: 'checkin-coupons', path: 'marketing/checkin-coupon', name: '现场打卡领券', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '打卡位置', dataIndex: 'location' },
      { title: '券模板', dataIndex: 'template' },
      { title: '已领取', dataIndex: 'claimed' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'location', label: '打卡位置', type: 'text' },
      { name: 'template', label: '券模板', type: 'text' },
      { name: 'claimed', label: '已领取', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '现场打卡领券，会员到店扫码打卡后领取优惠券。', features: ['新增/编辑/删除打卡活动', '位置与券模板配置'] }
  },
  {
    key: 'douyin-coupons', path: 'marketing/douyin-coupon', name: '抖音兑换券', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '抖音券码', dataIndex: 'douyinCode' },
      { title: '兑换权益', dataIndex: 'reward' },
      { title: '已兑换', dataIndex: 'exchanged' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'douyinCode', label: '抖音券码', type: 'text' },
      { name: 'reward', label: '兑换权益', type: 'text' },
      { name: 'exchanged', label: '已兑换', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '抖音兑换券管理，顾客在抖音购买的团购券到小程序兑换，系统自动核销并发放权益。', features: ['新增/编辑/删除抖音券活动', '兑换权益配置'] }
  },
  // ===== 地产积分（补充）=====
  {
    key: 'property-tasks', path: 'property/tasks', name: '地产积分任务', category: '地产积分',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '任务名称', dataIndex: 'name' },
      { title: '分类', dataIndex: 'category' },
      { title: '积分', dataIndex: 'points' },
      { title: '限制', dataIndex: 'limit' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '任务名称', type: 'text', required: true },
      { name: 'category', label: '分类', type: 'text' },
      { name: 'points', label: '积分', type: 'number' },
      { name: 'limit', label: '限制', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '地产积分任务管理，包括发言建议、朋友圈转发、关注账号、暖场活动、圈层活动、推荐到访、推荐签约、新房置业等任务。', features: ['新增/编辑/删除任务', '积分与限制配置'] }
  },
  {
    key: 'property-activities', path: 'property/activities', name: '地产活动报名', category: '地产积分',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '业主', dataIndex: 'owner' },
      { title: '报名时间', dataIndex: 'time' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待审核', approved: '已通过', checked: '已打卡' }[v] || v) }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'owner', label: '业主', type: 'text' },
      { name: 'time', label: '报名时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待审核', value: 'pending' }, { label: '已通过', value: 'approved' }, { label: '已打卡', value: 'checked' }
      ] }
    ],
    doc: { overview: '地产活动报名管理，管理业主活动报名、打卡信息。', features: ['新增/编辑/删除报名', '报名审核与打卡'] }
  },
  // ===== 内容管理（补充）=====
  {
    key: 'applet-decorations', path: 'content/applet-decoration', name: '小程序装修', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '页面名称', dataIndex: 'name' },
      { title: '页面标识', dataIndex: 'pageKey' },
      { title: '模板', dataIndex: 'template' },
      { title: '版本', dataIndex: 'version' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '页面名称', type: 'text', required: true },
      { name: 'pageKey', label: '页面标识', type: 'text' },
      { name: 'template', label: '模板配置(JSON)', type: 'textarea' },
      { name: 'version', label: '版本', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '小程序页面装修，支持可视化组件、预览、多模板切换、热图、历史版本恢复、页面码下载等。', features: ['新增/编辑/删除装修页面', '模板与组件配置', '版本管理'] }
  },
  // ===== 系统管理（补充）=====
  {
    key: 'operation-logs', path: 'system/logs', name: '操作日志', category: '系统管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '操作人', dataIndex: 'operator' },
      { title: '模块', dataIndex: 'module' },
      { title: '操作类型', dataIndex: 'action' },
      { title: 'IP', dataIndex: 'ip' },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'operator', label: '操作人', type: 'text', required: true },
      { name: 'module', label: '模块', type: 'text' },
      { name: 'action', label: '操作类型', type: 'text' },
      { name: 'ip', label: 'IP', type: 'text' },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: { overview: '系统操作日志，记录后台用户的增删改查等操作，用于审计和安全追溯。', features: ['新增/编辑/删除日志记录', '操作审计'] }
  },
  {
    key: 'menu-management', path: 'system/menus', name: '菜单管理', category: '系统管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '菜单名称', dataIndex: 'name' },
      { title: '路径', dataIndex: 'path' },
      { title: '图标', dataIndex: 'icon' },
      { title: '父菜单ID', dataIndex: 'parentId' },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '菜单名称', type: 'text', required: true },
      { name: 'path', label: '路径', type: 'text' },
      { name: 'icon', label: '图标', type: 'text' },
      { name: 'parentId', label: '父菜单ID', type: 'number' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: { overview: '后台菜单管理，配置系统菜单层级、路径、图标、排序和启停。', features: ['新增/编辑/删除菜单', '菜单层级与排序'] }
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
