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
      { title: '升级积分', dataIndex: 'upgradePoints' },
      { title: '升级券包', dataIndex: 'upgradeCoupons' },
      { title: '停车券', dataIndex: 'upgradeParkingCount' },
      { title: '折扣率', dataIndex: 'discount', render: (v) => (v != null ? v : '') },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
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
      { name: 'upgradePoints', label: '升级积分奖励', type: 'number' },
      { name: 'upgradeCoupons', label: '升级券包(关联券模板)', type: 'textarea' },
      { name: 'upgradeParkingCount', label: '升级停车券数量(小时)', type: 'number' },
      { name: 'giftValidDays', label: '礼包有效期(天)', type: 'number' },
      { name: 'upgradeGiftDesc', label: '升级礼包说明', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '会员等级体系是会员运营的核心框架，通过设置多级会员身份（普通、银卡、金卡、钻石等），为不同价值的会员提供差异化权益和服务体验。系统支持基于积分、消费金额或成长值的多种升级条件，配合保级规则、降级机制和等级有效期，构建完整的会员成长激励闭环。会员等级与会员权益、积分倍率、停车优惠、专属客服等模块深度联动，直接影响会员在各场景下的权益享受。升级礼包采用结构化配置，支持升级积分、关联券模板、停车券等多维度奖励，会员升级时系统自动触发发放并记录发放日志，是精细化运营和提升会员忠诚度的关键基础设施。',
      features: ['支持新增、编辑、删除会员等级，灵活构建多级会员体系', '提供三种升级条件类型：积分累计、消费金额、成长值，满足不同运营策略', '配置保级要求和降级规则（不降级/自动降级/手动降级），维持会员活跃度', '设置等级有效期（天），支持周期性等级评定和刷新', '配置等级专属折扣率（0-1），消费时自动享受对应折扣', '升级积分奖励：设置升级时自动发放的积分数量', '升级券包：关联优惠券模板，可多选，升级时自动发放到会员券包', '升级停车券：设置升级时赠送的停车券小时数', '礼包有效期：设置升级礼包发放后的有效天数，过期失效', '升级礼包自动触发：会员达到升级条件后系统自动发放所有奖励', '升级礼包手动补发：运营人员可在会员详情手动触发补发', '升级礼包发放日志：完整记录每次发放的明细和状态，支持追溯', '等级图标和视觉样式配置，提升会员身份荣誉感', '等级启用/禁用控制，支持灵活调整等级体系结构', '与会员权益模块联动，按等级配置差异化权益组合', '与积分模块联动，支持等级积分倍率设置', '与停车权益模块联动，按等级配置免费停车时长', '支持等级排序和显示优先级配置'],
      tips: ['等级编码为系统唯一标识，创建后不建议修改，避免关联数据错乱', '折扣率取值范围为0-1，例如0.9表示9折优惠，设置前请测试计算逻辑', '保级要求建议采用自然语言描述，如"年消费满1000元"，便于会员理解', '升级条件值建议逐级递增，形成合理的成长阶梯，避免跨度过大或过小', '升级礼包配置后请测试自动发放逻辑，确保积分、券、停车券正确到账', '礼包有效期需合理设置，避免会员升级后无法及时使用导致过期', '启用新等级前请检查权益配置是否完整，避免会员升级后无法享受对应权益']
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
      overview: '会员档案是会员数字化运营的核心基础数据，集中管理所有会员的完整信息档案，包括个人基本信息、微信社交账号资料、会员卡号、等级身份、资产数据和消费行为统计。系统支持多渠道会员注册（小程序、微信、门店、活动等），并自动记录会员的成长轨迹和消费偏好。会员档案与会员标签、会员画像、积分中心、礼券中心、电子钱包等模块深度关联，是精准营销、个性化服务和会员价值分层的数据基石。通过持续完善会员信息，可逐步构建360度会员视图，支撑精细化运营决策。',
      features: ['支持新增、编辑、删除会员档案，完整管理会员全生命周期', '记录会员基本信息：姓名、手机号、性别、生日、年龄、地址、职业、爱好、邮箱等', '管理微信资料：微信昵称、头像、OpenID，支持微信快捷登录绑定', '维护会员卡号信息，支持实体卡、电子卡、虚拟卡多种卡类型', '实时展示会员等级、成长值、积分余额、储值余额等核心资产数据', '自动统计消费数据：消费总额、订单数量、客单价，掌握会员消费能力', '追踪注册来源（小程序/微信/门店/活动），评估渠道获客效果', '记录最近登录时间、最近消费时间，识别会员活跃状态', '支持会员状态管理：启用/禁用，有效控制异常会员', '提供会员备注功能，记录客服沟通要点和特殊需求', '支持批量导入导出会员数据，便于数据迁移和分析', '与会员标签联动，查看会员所拥有的全部标签和人群归属'],
      tips: ['手机号是会员的唯一标识，建议注册时进行短信验证确保真实性', '删除会员操作不可逆，且不影响历史订单和消费记录，操作前请确认', '成长值是会员等级升级的重要依据，需配合积分规则和等级体系配置', '会员信息涉及个人隐私，操作时请遵守数据安全和隐私保护规定', '建议定期清理无效会员档案，保持数据准确性，提升营销触达效率']
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
      overview: '会员标签体系是实现精准营销和用户分层的核心工具，通过为会员打上多维度标签，将庞大的会员群体划分为具有共同特征的细分人群。系统支持自动标签、手动标签和系统标签三种类型，覆盖消费行为、活跃程度、属性特征等多个分类维度。自动标签可基于预设规则和触发条件实时计算并自动圈选人群，无需人工干预；手动标签支持运营人员根据业务需求灵活打标；系统标签由平台预设维护。会员标签与营销活动、推送任务、会员画像等模块深度联动，是实现千人千面精准触达和个性化运营的关键能力。',
      features: ['支持新增、编辑、删除会员标签，灵活构建标签体系', '提供三种标签类型：自动标签（规则触发）、手动标签（人工打标）、系统标签（平台预设）', '支持标签分类管理：消费类、活跃类、属性类等多维度分类', '配置自动标签圈选规则和触发条件，系统自动计算更新人群', '支持标签颜色配置，在列表和会员详情中直观区分标签类型', '实时统计标签覆盖人数，直观掌握各人群规模', '记录标签更新时间，追踪人群变化趋势', '支持标签启用/禁用，临时停用不影响历史数据', '与会员档案联动，可查看会员身上的全部标签', '与营销活动联动，支持按标签人群定向发券和推送', '与推送任务联动，实现精准人群消息触达', '支持标签组合筛选，实现多维度复杂人群圈选'],
      tips: ['自动标签的规则配置需要结合实际业务场景，建议先小范围测试验证', '标签命名应清晰规范，便于运营团队理解和使用，避免歧义', '标签数量不宜过多，建议控制在合理范围，重点关注高价值标签', '自动标签会定期刷新人群，注意设置合理的计算频率避免性能问题', '删除标签前请检查是否有营销活动或推送任务正在使用，避免影响运行']
    }
  },
  // ===== 积分中心 =====
  {
    key: 'points-rules', path: 'points/rules', name: '积分规则', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ consume: '消费', signin: '签到', birthday: '生日' }[v] || v) },
      { title: '消费门槛(元)', dataIndex: 'minConsumeAmount' },
      { title: '积分比例', dataIndex: 'pointsRatio', render: (v) => v ? `${v}积分/${v ? 10 : ''}元` : '' },
      { title: '单笔封顶', dataIndex: 'maxPointsPerOrder' },
      { title: '积分值', dataIndex: 'points', render: (v) => v || '-' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '消费送积分', value: 'consume' }, { label: '签到积分', value: 'signin' }, { label: '生日积分', value: 'birthday' }
      ] },
      { name: 'minConsumeAmount', label: '消费门槛(元)', type: 'number', placeholder: '满多少元起送' },
      { name: 'pointsRatio', label: '积分比例(积分/元)', type: 'number', placeholder: '如0.1表示每10元送1积分' },
      { name: 'maxPointsPerOrder', label: '单笔封顶(积分)', type: 'number', placeholder: '每笔订单最多送多少积分' },
      { name: 'points', label: '固定积分值', type: 'number', placeholder: '签到/生日等固定积分规则使用' },
      { name: 'condition', label: '条件说明', type: 'textarea' },
      { name: 'validFrom', label: '生效日期', type: 'text' },
      { name: 'validTo', label: '截止日期', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '积分规则是积分体系的核心配置模块，定义会员在各种业务场景下获取积分的方式和数量标准。通过配置消费送积分、签到奖励、生日礼遇等多种积分获取规则，构建完整的积分激励体系，引导会员行为，提升会员活跃度和忠诚度。消费送积分支持按消费金额比例计算，可设置最低起送门槛和单笔封顶。积分规则与会员档案、积分流水、会员等级等模块深度联动，积分获取后实时计入会员账户，并可用于后续的积分商城兑换、抵现消费等场景，是会员运营闭环中不可或缺的重要环节。',
      features: ['支持新增、编辑、删除积分规则，灵活配置多种积分获取场景', '提供多种规则类型：消费送积分、签到积分、生日积分等，覆盖核心运营场景', '消费送积分规则支持设置消费门槛（满多少元起送）', '消费送积分支持按消费金额比例计算（如每10元送1积分）', '消费送积分支持设置单笔封顶（每笔订单最多送多少积分）', '签到/生日积分支持固定积分值配置', '设置规则条件说明，清晰描述积分获取的前置条件和适用范围', '支持规则有效期设置（生效日期/截止日期）', '支持规则启用/禁用，灵活控制积分发放策略', '签到积分支持连续签到递增奖励，培养会员登录习惯', '生日积分支持生日当月/当日自动发放，增强会员关怀', '与积分流水模块联动，每笔积分发放自动生成流水记录', '与会员等级联动，支持等级积分倍率加成配置', '支持规则排序和优先级配置，避免多规则叠加冲突'],
      tips: ['配置消费积分规则时注意设置合理的积分比例，避免积分通胀', '消费门槛建议设置合理，既要激励消费又要控制成本', '单笔封顶可有效控制大额订单的积分发放成本', '签到建议设置连续签到阶梯奖励，如连续7天额外奖励，提升粘性', '生日积分建议提前测试发放时机，确保在会员生日当天准时到账', '修改积分规则后，建议同步检查积分商城商品定价是否合理', '积分规则启用前请进行小范围测试，验证计算逻辑正确性']
    }
  },
  {
    key: 'points-goods', path: 'points/goods', name: '积分商品', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商品图片', dataIndex: 'mainImage' },
      { title: '商品名称', dataIndex: 'name' },
      { title: '分类', dataIndex: 'category' },
      { title: '商品类型', dataIndex: 'goodsType', render: (v) => ({ physical: '实物', virtual: '虚拟', coupon: '优惠券', service: '服务权益' }[v] || v) },
      { title: '所需积分', dataIndex: 'points' },
      { title: '库存', dataIndex: 'stock' },
      { title: '每人限兑', dataIndex: 'limitPerUser' },
      { title: '兑换方式', dataIndex: 'deliveryType', render: (v) => ({ self: '自提', express: '邮寄', auto: '自动到账' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '上架' : '下架') }
    ],
    fields: [
      { name: 'name', label: '商品名称', type: 'text', required: true },
      { name: 'mainImage', label: '商品主图', type: 'text' },
      { name: 'detailImages', label: '商品详情图', type: 'textarea' },
      { name: 'category', label: '商品分类', type: 'text' },
      { name: 'goodsType', label: '商品类型', type: 'select', options: [
        { label: '实物商品', value: 'physical' }, { label: '虚拟商品', value: 'virtual' },
        { label: '优惠券', value: 'coupon' }, { label: '服务权益', value: 'service' }
      ] },
      { name: 'points', label: '所需积分', type: 'number' },
      { name: 'stock', label: '库存', type: 'number' },
      { name: 'limitPerUser', label: '每人限兑数量', type: 'number' },
      { name: 'deliveryType', label: '兑换方式', type: 'select', options: [
        { label: '门店自提', value: 'self' }, { label: '快递邮寄', value: 'express' }, { label: '自动到账', value: 'auto' }
      ] },
      { name: 'description', label: '商品详情', type: 'textarea' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'ownerOnly', label: '业主专属', type: 'select', options: [
        { label: '仅业主可兑换', value: 'yes' }, { label: '所有会员', value: 'no' }
      ] },
      { name: 'exchangeMode', label: '兑换模式', type: 'select', options: [
        { label: '纯积分兑换', value: 'pointsOnly' }, { label: '积分+现金兑换', value: 'pointsAndCash' }
      ] },
      { name: 'cashAmount', label: '加价金额(元)', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '上架', value: 'enabled' }, { label: '下架', value: 'disabled' }
      ] }
    ],
    doc: {
      overview: '积分商品是积分商城的核心商品库，管理所有可用积分兑换的商品和权益。通过将实物商品、虚拟权益、优惠券、服务项目等配置为积分商品，为会员提供丰富的积分消耗出口，提升积分价值感知和会员活跃度。积分商品支持配置商品图片、分类、类型、兑换方式、每人限兑数量等丰富属性，支持纯积分兑换和积分+现金组合兑换两种模式，支持设置业主专属商品。积分商品与积分流水、会员档案、核销记录、积分商城订单等模块深度联动，会员兑换后自动扣减积分并生成兑换订单，实物商品可走物流配送，虚拟商品和权益可直接到账或到店核销，形成完整的积分消费闭环。',
      features: ['支持新增、编辑、删除积分商品，构建丰富的积分兑换商品库', '配置商品基础信息：名称、主图、详情图、分类等，提升商品展示效果', '支持多种商品类型：实物商品、虚拟商品、优惠券、服务权益', '设置商品所需兑换积分，合理定价确保积分价值体系平衡', '管理商品库存数量，支持库存预警和售殃自动下架', '配置每人限兑数量，防止热门商品被少数会员集中兑换', '支持三种兑换方式：门店自提、快递邮寄、自动到账', '支持纯积分兑换和积分+现金组合兑换两种模式', '支持设置业主专属商品，仅地产业主可兑换', '商品上下架管理，灵活控制可兑换商品', '商品排序和推荐位配置，引导会员兑换高价值商品', '与积分流水模块联动，兑换时自动扣减积分并生成流水记录', '与积分商城订单联动，兑换后自动生成订单并跟踪履约', '与会员档案联动，查看会员已兑换的商品记录', '与核销记录联动，支持到店核销类积分商品的验证', '提供兑换数据统计，掌握热门商品和库存周转情况'],
      tips: ['积分商品定价需结合积分获取成本，确保积分价值体系健康', '热门商品建议设置合理的库存和每人限兑数量，避免积分过度消耗', '实物商品需配置物流配送能力，确保兑换后能及时送达', '虚拟商品兑换后应自动到账，提升会员兑换体验', '商品主图和详情图建议使用高清图片，提升展示效果和兑换意愿', '业主专属商品需在业主端积分商城单独展示', '定期更新积分商品库，保持新鲜感，提升会员兑换意愿']
    }
  },
  {
    key: 'points-logs', path: 'points/logs', name: '积分流水', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '业务类型', dataIndex: 'bizType', render: (v) => ({ consume: '消费奖励', signin: '签到奖励', birthday: '生日积分', exchange: '积分兑换', recharge: '积分充值', deduct: '积分扣减', clear: '年度清零', expire: '过期清零', activity: '活动奖励', referral: '推荐奖励', manual: '人工调整' }[v] || v) },
      { title: '积分变动', dataIndex: 'points', render: (v) => (v > 0 ? `+${v}` : `${v}`) },
      { title: '变动前余额', dataIndex: 'beforeBalance' },
      { title: '变动后余额', dataIndex: 'balance' },
      { title: '有效期至', dataIndex: 'expireDate' },
      { title: '是否历史积分', dataIndex: 'isHistory', render: (v) => (v === 'yes' ? '是' : '否') },
      { title: '关联单号', dataIndex: 'bizNo' },
      { title: '操作人', dataIndex: 'operator' },
      { title: '时间', dataIndex: 'createdAt' },
      { title: '备注', dataIndex: 'remark' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'bizType', label: '业务类型', type: 'select', options: [
        { label: '消费奖励', value: 'consume' }, { label: '签到奖励', value: 'signin' }, { label: '生日积分', value: 'birthday' },
        { label: '积分兑换', value: 'exchange' }, { label: '积分充值', value: 'recharge' }, { label: '积分扣减', value: 'deduct' },
        { label: '年度清零', value: 'clear' }, { label: '过期清零', value: 'expire' }, { label: '活动奖励', value: 'activity' },
        { label: '推荐奖励', value: 'referral' }, { label: '人工调整', value: 'manual' }
      ] },
      { name: 'points', label: '积分变动', type: 'number' },
      { name: 'beforeBalance', label: '变动前余额', type: 'number' },
      { name: 'balance', label: '变动后余额', type: 'number' },
      { name: 'expireDate', label: '有效期至', type: 'text' },
      { name: 'isHistory', label: '是否历史积分', type: 'select', options: [
        { label: '是', value: 'yes' }, { label: '否', value: 'no' }
      ] },
      { name: 'bizNo', label: '关联业务单号', type: 'text' },
      { name: 'operator', label: '操作人', type: 'text' },
      { name: 'source', label: '积分来源', type: 'select', options: [
        { label: '系统发放', value: 'system' }, { label: '人工充值', value: 'manual' }, { label: '消费返积', value: 'consume' }, { label: '活动赠送', value: 'activity' }
      ] },
      { name: 'createdAt', label: '时间', type: 'text' },
      { name: 'remark', label: '备注', type: 'textarea' }
    ],
    doc: {
      overview: '积分流水是会员积分账户的完整交易记录，详细记录每一笔积分的获取和消耗，是积分体系的账务核心。系统自动记录所有积分变动，包括消费奖励、签到赠送、生日礼遇、商城兑换、活动奖励、年度清零、过期清零等场景，每笔流水都关联具体的会员、业务类型、变动金额、有效期和操作人。积分流水支持区分当前积分与历史积分，年度即将过期积分可转为历史积分并优先使用。积分流水与会员档案、积分规则、积分商品、积分账户等模块深度联动，为积分对账、会员查询、财务核算和数据分析提供完整的数据支撑，是确保积分体系透明可信、运营合规的重要基础。',
      features: ['完整记录所有积分变动流水，支持查询每一笔积分的来龙去脉', '细化的业务类型：消费奖励、签到奖励、生日积分、积分兑换、积分充值、积分扣减、年度清零、过期清零、活动奖励、推荐奖励、人工调整', '记录变动前余额和变动后余额，确保账务可追溯', '支持积分有效期管理，记录每笔积分的过期时间', '区分当前积分与历史积分，即将过期积分自动转为历史积分', '关联业务单号，可追溯积分变动的具体业务来源', '记录操作人信息，明确积分变动的责任主体', '支持积分来源分类：系统发放、人工充值、消费返积、活动赠送', '与积分规则模块联动，规则触发的积分发放自动生成流水', '与积分商品模块联动，积分兑换自动扣减并生成消耗流水', '与会员积分账户联动，实时更新会员可用积分和历史积分', '与会员档案联动，可从会员详情查看个人积分流水', '支持按时间范围、类型、会员、有效期等多维度筛选查询', '提供积分收支统计，分析积分发放和消耗趋势', '支持流水导出，便于财务对账和数据分析'],
      tips: ['积分流水为账务记录，创建后不建议修改和删除，确保数据完整性', '查询流水时建议结合会员和时间范围，快速定位目标记录', '积分余额为每笔流水计算得出，如发现异常请检查流水记录', '定期进行积分账务核对，确保系统积分与财务数据一致', '涉及大量积分调整时，建议通过后台批量操作并生成对应流水记录', '历史积分优先使用，配置清零规则时请注意会员体验']
    }
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
    doc: {
      overview: '礼券模板是营销发券的基础配置库，通过创建可复用的券模板，为各类营销活动提供标准化的券产品。系统支持满减券、代金券、折扣券等多种券类型，可灵活配置券面值、使用门槛、发行总量、有效期等核心参数。礼券模板与营销活动、推送任务、会员标签等模块深度联动，可通过活动发券、定向推送、新人礼包、签到奖励等多种方式发放给会员，是提升转化率、拉动复购、激活沉睡会员的核心营销工具。',
      features: ['支持新增、编辑、删除礼券模板，构建丰富的券产品库', '提供多种券类型：满减券、代金券、折扣券，满足不同营销场景', '配置券面值/折扣率，支持固定金额减免或按比例折扣', '设置使用门槛（最低消费金额），控制营销成本', '管理发行总量，限制券的发放数量，制造稀缺感', '实时统计已领取数量，掌握发放进度和剩余库存', '支持券模板启用/禁用，灵活控制券的发放状态', '与营销活动联动，活动发券可直接关联券模板', '与礼券批次联动，基于模板生成具体发券批次', '支持券有效期配置，控制券的使用时间窗口', '提供券使用说明和注意事项配置，提升会员体验', '支持券适用范围配置（适用商品/商户/门店）'],
      tips: ['券面值和使用门槛需合理设置，确保营销效果和成本平衡', '发行总量建议根据活动目标和预算合理规划，避免超发', '满减券门槛设置建议略高于客单价，有效提升客单价', '折扣券注意设置折扣范围，避免与其他优惠叠加导致亏损', '券模板创建后建议先小范围测试，验证核销流程是否顺畅']
    }
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
    doc: {
      overview: '礼券批次是基于券模板生成的具体发券批次，用于管理某次发放的券，记录发行量和领取进度。是券从模板到会员手中的中间环节，便于分批次管理和统计。',
      features: ['支持新增、编辑、删除券批次', '关联券模板，继承模板的面值、门槛等属性', '管理发行总量，控制批次发放规模', '实时统计已领取数量，掌握发放进度', '批次状态管理：启用/禁用', '与礼券模板联动，基于模板快速生成批次'],
      tips: ['券批次创建后，券类型和面值等核心属性不可修改', '建议按活动或时间命名批次，便于后续查询和统计', '禁用批次后，未领取的券将无法继续被领取']
    }
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
    doc: {
      overview: '停车记录是智慧停车系统的核心数据模块，完整记录所有车辆的进出停车场信息，包括车牌号、入场时间、出场时间、停车时长、停车费用等关键数据。系统支持车牌自动识别和手动录入两种方式，可关联会员账号实现会员停车权益自动匹配和积分赠送。停车记录与停车权益、会员档案、积分中心等模块深度联动，会员停车可自动享受等级对应的免费时长和积分倍率优惠，并可通过积分抵扣停车费，是提升会员满意度和停车场运营效率的重要基础设施。',
      features: ['支持新增、编辑、删除停车记录，完整管理停车全流程数据', '记录车牌号信息，支持车牌识别快速录入', '关联会员账号，实现会员停车权益自动识别', '记录入场时间和出场时间，精确计算停车时长', '自动计算停车费用，支持多种计费规则', '支持停车送积分，提升会员停车体验', '与停车权益联动，会员等级自动匹配免费时长和积分倍率', '与会员档案联动，可查看会员历史停车记录', '与积分中心联动，停车积分自动发放到会员账户', '支持按车牌号、会员、时间范围等多维度查询', '提供停车数据统计，分析停车场运营分析和高峰时段分析', '支持停车记录导出，便于财务对账和数据分析'],
      tips: ['车牌识别录入时请仔细核对车牌号，避免录错会影响会员权益匹配', '停车费用计算依赖计费规则配置，修改规则变更前请充分测试', '会员停车送积分需配置对应积分规则，确保积分按时到账', '建议定期备份停车数据，避免设备故障导致数据丢失', '高峰期建议设置停车记录保留期限，定期归档历史数据提升查询性能']
    }
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
    doc: {
      overview: '停车权益是为不同等级会员提供差异化停车服务的配置模块，通过设置免费停车时长、积分倍率等专属权益，提升高等级会员的尊享感和停车体验。系统支持按会员等级（银卡、金卡、钻石等）配置不同的停车权益，实现分级服务体系。停车权益与会员等级、停车记录、积分中心等模块深度联动，会员进场时自动识别身份并匹配对应权益，离场时自动计算免费时长和积分奖励，是提升会员价值感知和忠诚度的重要手段。',
      features: ['支持新增、编辑、删除停车权益，灵活构建分级停车服务体系', '配置权益名称和说明，清晰描述权益内容', '按会员等级配置差异化权益（银卡/金卡/钻石等）', '设置免费停车时长（小时），高等级会员享受更长免费时间', '配置停车积分倍率，提升高等级会员积分获取速度', '权益状态管理：启用/禁用，灵活控制权益生效状态', '与会员等级联动，等级变更自动调整停车权益', '与停车记录联动，进出场时自动匹配计算权益', '与积分中心联动，停车积分按倍率自动发放', '支持适用门店配置，不同门店可执行不同权益策略', '提供权益预览功能，验证各等级权益配置是否正确', '支持权益排序，管理多权益的优先级和展示顺序'],
      tips: ['免费时长设置需结合商场定位和运营策略，不宜过长或过短', '积分倍率建议与等级匹配，等级越高倍率越高，体现价值差异', '权益配置变更后建议及时测试验证，避免会员权益享受异常', '注意不同停车场可能有不同权益，需分别配置测试', '建议定期分析权益使用数据，优化权益配置提升投入产出比']
    }
  },
  // ===== 营销中心 =====
  {
    key: 'marketing-campaigns', path: 'marketing/campaigns', name: '营销活动', category: '营销中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ promotion: '促销活动', memberday: '会员日', festival: '节日营销', flash: '限时抢购', group: '拼团', seckill: '秒杀', preSale: '预售', bargain: '砍价', lottery: '抽奖', vote: '投票', survey: '问卷', checkin: '签到', game: '游戏', referral: '推荐有礼', newMember: '新人礼', helpCoupon: '助力领券', wordCoupon: '口令领券', blindBox: '盲盒', countCard: '计次卡', douyin: '抖音券', checkinCoupon: '打卡领券' }[v] || v) },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '结束时间', dataIndex: 'endTime' },
      { title: '预算', dataIndex: 'budget' },
      { title: '参与人群', dataIndex: 'targetGroup' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '进行中' : '已停用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'cover', label: '活动封面', type: 'text' },
      { name: 'type', label: '活动类型', type: 'select', options: [
        { label: '促销活动', value: 'promotion' }, { label: '会员日', value: 'memberday' }, { label: '节日营销', value: 'festival' },
        { label: '限时抢购', value: 'flash' }, { label: '拼团', value: 'group' }, { label: '秒杀', value: 'seckill' },
        { label: '预售', value: 'preSale' }, { label: '砍价', value: 'bargain' }, { label: '抽奖', value: 'lottery' },
        { label: '投票', value: 'vote' }, { label: '问卷', value: 'survey' }, { label: '签到', value: 'checkin' },
        { label: '游戏', value: 'game' }, { label: '推荐有礼', value: 'referral' }, { label: '新人礼', value: 'newMember' },
        { label: '助力领券', value: 'helpCoupon' }, { label: '口令领券', value: 'wordCoupon' },
        { label: '盲盒', value: 'blindBox' }, { label: '计次卡', value: 'countCard' }, { label: '抖音券', value: 'douyin' },
        { label: '打卡领券', value: 'checkinCoupon' }
      ] },
      { name: 'description', label: '活动描述', type: 'textarea' },
      { name: 'rules', label: '活动规则', type: 'textarea' },
      { name: 'startTime', label: '开始时间', type: 'text' },
      { name: 'endTime', label: '结束时间', type: 'text' },
      { name: 'budget', label: '预算(元)', type: 'number' },
      { name: 'targetGroup', label: '参与人群', type: 'text' },
      { name: 'targetTags', label: '目标标签', type: 'text' },
      { name: 'threshold', label: '参与门槛', type: 'textarea' },
      { name: 'couponTemplates', label: '关联券模板', type: 'textarea' },
      { name: 'relatedGoods', label: '关联商品', type: 'textarea' },
      { name: 'maxParticipants', label: '最大参与人数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '进行中', value: 'enabled' }, { label: '已停用', value: 'disabled' }, { label: '待开始', value: 'pending' }
      ] }
    ],
    doc: {
      overview: '营销活动是整合各类营销资源的统一管理平台，通过创建不同类型的营销活动，集中管理活动时间、预算、关联资源、参与人群和执行效果。系统支持促销活动、会员日、节日营销、限时抢购、拼团、秒杀、预售、砍价、抽奖、投票、问卷、签到、游戏、推荐有礼、新人礼、助力领券、口令领券、盲盒、计次卡、抖音券、打卡领券等20余种活动类型，可灵活配置活动时间、预算规模、参与门槛、目标人群和关联的券、商品、积分等营销资源。营销活动与礼券中心、会员标签、会员画像、推送任务、数据报表等模块深度联动，形成从活动策划、资源配置、人群定向、消息触达到效果追踪的完整营销闭环，是运营团队开展精细化营销、提升会员转化和复购的核心工具。',
      features: ['支持新增、编辑、删除营销活动，全生命周期管理营销活动', '提供20余种活动类型：促销、会员日、节日营销、限时抢购、拼团、秒杀、预售、砍价、抽奖、投票、问卷、签到、游戏、推荐有礼、新人礼、助力领券、口令领券、盲盒、计次卡、抖音券、打卡领券', '配置活动名称、描述和规则，清晰传达活动主题和利益点', '上传活动封面图，提升活动视觉效果和吸引力', '设置活动开始时间和结束时间，精确控制活动周期', '管理活动预算，合理规划营销费用投入', '配置参与人群和目标标签，支持按会员画像精准定向', '设置参与门槛，如最低消费、会员等级、积分要求等', '关联券模板和商品，实现活动与营销资源的联动', '配置最大参与人数，控制活动成本和资源消耗', '三种活动状态：进行中、已停用、待开始', '与活动发券联动，可在活动中配置多种券的发放', '与会员标签联动，支持按标签人群定向开展活动', '与会员画像联动，基于画像特征精准圈选目标人群', '与推送任务联动，通过消息渠道触达目标会员', '与数据报表联动，追踪活动效果和ROI分析', '支持活动排序和优先级配置，管理多活动并行', '提供活动模板功能，快速复用成功活动配置'],
      tips: ['活动开始前请检查所有关联资源（券、商品、推送）是否配置完整', '活动预算建议根据历史数据和目标转化率合理估算', '多活动并行时注意避免优惠叠加导致成本超支', '参与门槛设置要合理，过高会降低参与度，过低会浪费资源', '重要活动建议设置AB测试，对比不同方案效果', '活动结束后及时分析数据，总结经验优化后续活动']
    }
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
    doc: {
      overview: '活动发券是营销活动中发券配置的管理模块，将活动与券模板关联，配置活动期间发放的券种和数量。是营销活动与礼券体系联动的桥梁，确保活动发券有序可控。',
      features: ['支持新增、编辑、删除活动发券配置', '关联营销活动，属于活动的一部分', '关联券模板，指定发放的券类型', '管理发放数量，控制活动发券规模', '实时统计已领取数量，掌握发放进度', '与营销活动联动，活动开始后可领取券'],
      tips: ['活动发券数量建议根据活动目标和预算合理设置', '活动结束后未领取的券建议及时回收或作废', '多券种活动建议配置不同的券，满足不同人群需求']
    }
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
    doc: {
      overview: '拼团活动是基于社交裂变的营销玩法，通过会员发起拼团、邀请好友参团的方式，以成团优惠价吸引更多用户参与购买。拼团活动充分利用会员的社交关系链，实现低成本获客和销售增长，同时通过限时成团机制营造紧迫感，提升转化率。拼团活动与商城商品、会员档案、订单系统等模块深度联动，拼团成功后自动生成商城订单，支持自提或配送，是微信生态下非常有效的社交电商营销工具。',
      features: ['支持新增、编辑、删除拼团活动，灵活创建各类拼团营销', '配置活动商品名称和展示信息，吸引会员参与', '设置拼团价格和原价对比，突出优惠力度', '配置成团人数要求，控制裂变规模和难度', '实时统计已参团人数，掌握活动热度和进度', '活动状态管理：启用/禁用，灵活控制活动开关', '与商城商品联动，拼团商品关联商品库信息', '与会员档案联动，记录参团会员信息', '与商城订单联动，拼团成功后自动生成订单', '支持拼团倒计时显示，营造紧迫感促进转化', '支持团长优惠配置，激励会员主动发起拼团', '提供拼团数据统计，分析活动效果和裂变效率'],
      tips: ['成团人数建议设置为2-5人，门槛太低裂变效果差，太高容易放弃', '拼团价格建议设置为原价的5-7折，既有吸引力又控制成本', '拼团商品建议选择受众广、性价比高的爆款，提升分享意愿', '建议设置拼团有效期（如24小时），超时未成团自动退款', '拼团活动开始前请确保库存充足，避免超卖影响体验']
    }
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
    doc: {
      overview: '秒杀活动是限时限量的特价促销营销玩法，通过在短时间内以极具吸引力的低价销售限量商品，制造抢购氛围和稀缺感，快速拉动流量和销售。秒杀活动常用于清库存、推新品、节日大促等场景，能有效提升会员活跃度和平台访问量。秒杀活动与商城商品、会员档案、订单系统、数据报表等模块深度联动，支持商品秒杀价配置、库存管理、限时抢购、订单生成和效果分析的完整闭环，是电商运营中非常重要的促销工具。',
      features: ['支持新增、编辑、删除秒杀活动，灵活创建各类限时促销', '配置秒杀商品名称和展示信息，突出活动卖点', '设置秒杀价格和原价对比，展现超强优惠力度', '管理秒杀商品库存，限量销售制造稀缺感', '实时统计已售数量，掌握销售进度和库存剩余', '设置秒杀开始时间，精确控制活动启动时机', '活动状态管理：启用/禁用，灵活控制活动状态', '与商城商品联动，秒杀商品关联商品库详情', '与会员档案联动，记录参与秒杀的会员信息', '与商城订单联动，秒杀下单自动生成订单', '支持秒杀倒计时显示，营造紧迫感促进下单', '提供秒杀数据统计，分析活动效果和ROI'],
      tips: ['秒杀价格建议设置为原价的3-5折，足够吸引才能激发抢购热情', '秒杀库存建议限量，制造稀缺感，避免库存过大失去抢购氛围', '秒杀时长建议控制在1-2小时，时间过长紧迫感不足', '热门秒杀建议提前预热宣传，确保活动开始即有大量流量', '秒杀活动开始前请充分测试系统性能，避免高并发导致系统故障']
    }
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
    doc: {
      overview: '服务订单是服务中心的订单管理模块，记录会员购买的各种增值服务订单，跟踪服务进度和状态流转。是服务类商品从购买到完成的全流程管理工具。',
      features: ['支持新增、编辑、删除服务订单', '记录订单基本信息：订单号、会员、服务项目、金额', '订单状态流转：待处理、处理中、已完成', '记录下单时间，跟踪服务时效', '与会员档案联动，查看会员服务购买记录', '服务完成后可关联评价和反馈'],
      tips: ['服务订单状态变更需及时更新，便于会员查看进度', '服务完成后建议邀请会员评价，提升服务质量', '异常订单建议及时跟进处理，避免会员投诉']
    }
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
    doc: {
      overview: '消息模板是营销触达的内容配置工具，管理短信、微信、邮件等各渠道的消息模板。标准化的模板确保消息触达的一致性和效率，是营销自动化的基础。',
      features: ['支持新增、编辑、删除消息模板', '多渠道支持：短信、微信、邮件', '多种模板类型：生日、优惠券、活动通知', '模板内容配置，支持变量替换', '模板状态管理：启用/禁用', '与推送任务联动，发送时调用模板'],
      tips: ['模板内容建议简洁明了，突出重点信息', '短信模板注意字数限制，避免拆条增加成本', '重要消息模板建议先测试再正式使用']
    }
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
    doc: {
      overview: '推送任务是营销触达的执行管理工具，基于消息模板向目标人群发送消息，追踪送达和阅读数据。是精准触达会员、提升活动参与度的重要营销工具。',
      features: ['支持新增、编辑、删除推送任务', '关联消息模板，使用标准化模板内容', '多渠道推送：短信、微信', '目标人群配置，定向发送给指定人群', '数据统计：发送数、已读数、转化率', '推送状态管理：进行中、已完成'],
      tips: ['推送时间建议选择会员活跃时段，提升打开率', '推送频次不宜过高，避免引起用户反感退订', '重要推送建议先小范围测试，确认效果再全量发送']
    }
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
    doc: {
      overview: '社群管理是私域运营的基础工具，管理会员社群信息，进行精细化社群运营。通过社群运营提升会员粘性和活跃度，是私域流量运营的重要载体。',
      features: ['支持新增、编辑、删除社群', '多社群类型：微信群、企微群', '社群人数统计，掌握社群规模', '群主管理，指定社群负责人', '社群状态管理：启用/禁用', '与会员档案联动，查看会员所在社群'],
      tips: ['社群建议按兴趣或等级分类，便于精准运营', '社群人数建议控制在合理范围，保证活跃度', '建议设置社群规则，保持良好社群氛围']
    }
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
    doc: {
      overview: '企微账号是企业微信员工账号的管理工具，管理用于社群运营和客户服务的企微账号。企微是私域运营和客户服务的重要渠道。',
      features: ['支持新增、编辑、删除企微账号', '账号基本信息：姓名、企微账号', '部门归属管理，组织架构清晰', '账号状态管理：启用/禁用', '与社群管理联动，企微账号可担任群主', '客户服务记录，跟踪服务情况'],
      tips: ['企微账号建议使用真实员工信息，增强信任感', '离职员工账号请及时禁用或交接，避免客户流失', '建议定期培训员工企微运营技巧，提升服务质量']
    }
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
    doc: {
      overview: '钱包账户是电子钱包的账户管理工具，管理会员的储值余额和积分账户。电子钱包是会员储值消费和积分管理的核心载体。',
      features: ['支持新增、编辑、删除钱包账户', '储值余额管理，记录会员储值金额', '积分账户管理，记录会员积分余额', '账户状态管理：启用/禁用', '与会员档案联动，一个会员对应一个钱包账户', '与钱包流水联动，余额变动自动生成流水'],
      tips: ['钱包余额为会员资产，操作需谨慎，确保数据安全', '储值功能建议设置密码或验证，保障资金安全', '建议定期核对钱包余额和流水，确保账务准确']
    }
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
    doc: {
      overview: '钱包流水是电子钱包的交易记录工具，记录会员的充值、消费、退款等所有资金变动明细。完整的流水记录是财务核对和会员查询的重要依据。',
      features: ['支持新增、编辑、删除钱包流水记录', '多种交易类型：充值、消费、退款', '交易金额和交易后余额记录', '交易时间记录，精确到秒', '与钱包账户联动，余额变动自动生成流水', '支持按时间、类型筛选查询'],
      tips: ['流水记录为财务凭证，请勿随意删除或修改', '建议定期导出流水进行财务核对', '会员查询流水时，注意保护会员隐私信息']
    }
  },
  // ===== 商户营销 =====
  {
    key: 'merchant-list', path: 'merchant/list', name: '商户管理', category: '商户营销',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商户名称', dataIndex: 'name' },
      { title: '业态', dataIndex: 'category' },
      { title: '楼层', dataIndex: 'floor' },
      { title: '菜系', dataIndex: 'cuisine' },
      { title: '联系人', dataIndex: 'contact' },
      { title: '电话', dataIndex: 'phone' },
      { title: '券额度', dataIndex: 'couponQuota' },
      { title: '停车券额度', dataIndex: 'parkingQuota' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '商户名称', type: 'text', required: true },
      { name: 'category', label: '业态', type: 'select', options: [
        { label: '餐饮', value: '餐饮' }, { label: '零售', value: '零售' }, { label: '服务', value: '服务' }, { label: '娱乐', value: '娱乐' }, { label: '教育', value: '教育' }
      ] },
      { name: 'floor', label: '所在楼层', type: 'text' },
      { name: 'location', label: '店铺位置', type: 'text' },
      { name: 'cuisine', label: '餐饮菜系', type: 'text' },
      { name: 'logo', label: '商户Logo', type: 'text' },
      { name: 'storePhotos', label: '门店照片', type: 'textarea' },
      { name: 'brandStory', label: '品牌故事', type: 'textarea' },
      { name: 'contact', label: '联系人', type: 'text' },
      { name: 'phone', label: '联系电话', type: 'text' },
      { name: 'couponQuota', label: '代金券月发放额度', type: 'number' },
      { name: 'couponUsed', label: '已使用券额度', type: 'number' },
      { name: 'parkingQuota', label: '停车券月发放额度', type: 'number' },
      { name: 'parkingUsed', label: '已使用停车券额度', type: 'number' },
      { name: 'storePromotion', label: '门店优惠活动', type: 'textarea' },
      { name: 'promotionExpiry', label: '优惠活动有效期', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '商户管理是平台商户运营的基础数据模块，集中管理所有入驻商户的完整信息，是商户营销和商户服务的数据基础。系统支持商户分类管理（餐饮、零售、服务等），维护商户基本信息、联系方式、经营品类等核心数据。商户管理与核销记录、礼券中心、营销活动、数据报表等模块深度联动，商户可参与平台统一营销活动，核销平台发放的券和积分商品，同时平台可统计各商户的经营数据和核销情况，是连接平台与商户、实现商业生态共赢的重要基础设施。',
      features: ['支持新增、编辑、删除商户信息，完整管理商户全生命周期', '记录商户基本信息：商户名称、联系人、联系电话等', '支持商户分类管理：餐饮、零售、服务等多种业态分类', '商户状态管理：启用/禁用，灵活控制商户合作状态', '与核销记录联动，统计各商户的券和商品核销数据', '与礼券中心联动，支持商户专属券和商户通用券配置', '与营销活动联动，商户可参与平台统一营销活动', '与商户核销统计联动，查看商户经营数据和业绩分析', '支持商户排序和推荐，在小程序展示推荐商户', '提供商户详情展示，包含商户介绍、图片、营业时间等', '支持多门店管理，连锁品牌可统一管理多家门店', '支持商户标签管理，便于按特征筛选和运营商户'],
      tips: ['商户信息建议尽量完善，便于会员了解和选择商户', '禁用商户前请检查是否有未完成的活动和订单，避免影响会员体验', '商户分类建议结合商场实际业态设置，便于会员按品类查找', '重要商户建议配置专人对接，及时响应商户需求', '定期分析商户经营数据，识别优质商户并给予更多资源支持']
    }
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
    doc: {
      overview: '商城商品是在线商城的核心商品库，管理小程序商城展示销售的所有商品信息，是电商运营的基础数据模块。系统支持丰富的商品配置，包括商品基础信息、规格SKU、价格体系、库存管理、虚拟商品、限购策略等，满足各类商品销售场景。商城商品与商品分类、订单系统、营销活动、数据报表等模块深度联动，商品上架后可在小程序展示销售，支持参与秒杀、拼团、限时购等多种营销活动，是构建完整电商交易闭环的核心基石。',
      features: ['支持新增、编辑、删除商品，完整管理商品全生命周期', '配置商品基础信息：名称、编码、副标题、主图、详情图等', '支持商品规格和SKU管理，满足多规格商品销售需求', '完善的价格体系：销售价、原价、成本价，支持灵活定价', '库存管理功能，实时掌握库存数量，支持库存预警', '商品上下架管理，灵活控制商品销售状态', '支持虚拟商品类型，满足电子券、服务类商品销售', '限购和起售设置，支持单用户限购和最低购买数量', '浏览量、收藏量、销量等数据统计，分析商品热度', '商品标签和分组管理，便于商品归类和推荐', '与商品分类联动，支持多级分类展示和筛选', '与营销活动联动，支持商品参与秒杀、拼团、限时购等活动'],
      tips: ['商品主图和详情图建议使用高清图片，提升商品展示效果和转化率', 'SKU配置需确保价格和库存准确，避免出现超卖或价格错误', '商品上架前请检查所有信息是否完整，包括价格、库存、规格等', '虚拟商品注意设置自动发货或核销机制，提升购买体验', '建议定期整理商品库，及时下架滞销商品，保持商城活力']
    }
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
    doc: {
      overview: '商城订单是在线商城的核心交易模块，记录和管理会员在商城购买商品的所有订单信息，贯穿从下单、支付、发货到完成的完整交易流程。系统支持多种支付方式、配送方式和订单状态流转，为会员提供顺畅的购物体验，同时为运营团队提供全面的订单管理能力。商城订单与商品管理、会员档案、支付系统、物流系统、售后管理等模块深度联动，形成完整的电商交易闭环，是衡量商城运营效果和销售业绩的核心数据来源。',
      features: ['支持新增、编辑、删除订单，完整管理订单全生命周期', '记录订单基本信息：订单号、会员、商品、数量、金额等', '管理收货信息：收货人、联系电话、收货地址', '支持多种支付方式：微信、支付宝、余额、积分', '订单状态流转：待付款、已付款、已发货、已完成、已取消', '售后状态管理：无、申请中、已通过、已拒绝', '物流信息管理：物流公司、物流单号、发货时间', '多订单来源追踪：小程序、微信、门店等', '订单备注和标签功能，记录特殊需求和分类标记', '与会员档案联动，查看会员历史订单和消费情况', '与商城商品联动，关联商品详情和库存扣减', '与售后管理联动，处理退货退款等售后申请'],
      tips: ['订单状态变更需谨慎操作，建议按标准流程进行，避免状态错乱', '发货前请仔细核对收货地址和商品信息，减少错发漏发', '订单取消和退款操作不可逆，操作前请与会员确认', '建议定期导出订单数据进行财务核对和数据分析', '异常订单（如支付失败、物流异常）建议及时处理，提升会员体验']
    }
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
    doc: {
      overview: '商品分类是商城商品的归类管理工具，支持多级分类结构，配置分类图标和图片，用于商品归类和前端展示导航。清晰的分类结构有助于会员快速找到目标商品，提升购物体验和转化。',
      features: ['支持新增、编辑、删除商品分类', '多级分类结构，支持父子分类层级', '分类图标和图片配置，提升展示效果', '导航显示控制，设置是否在导航栏展示', '分类排序管理，灵活调整展示顺序', '分类状态管理：启用/禁用'],
      tips: ['分类层级建议控制在2-3级，过深会增加查找难度', '分类名称建议简洁易懂，符合用户认知习惯', '建议定期分析各分类浏览和销售数据，优化分类结构']
    }
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
    doc: {
      overview: '门店管理是商场门店信息的配置工具，管理各门店的基础信息如名称、地址、电话等。是商场运营的基础配置，为其他模块提供门店维度的数据支撑。',
      features: ['支持新增、编辑、删除门店信息', '门店基础信息：名称、地址、联系电话', '门店状态管理：启用/禁用', '与终端管理联动，门店下可配置多个终端', '与商户管理联动，门店可关联商户', '门店排序管理，灵活调整展示顺序'],
      tips: ['门店信息建议尽量完善，便于会员查找和联系', '禁用门店前请检查是否有未完成的业务，避免影响运营', '门店地址建议填写详细地址，便于导航和定位']
    }
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
    doc: {
      overview: '终端管理是门店终端设备的配置工具，管理门店内的收银机、自助机、平板等设备。是线下运营的基础配置，终端数据是核销和收银的重要来源。',
      features: ['支持新增、编辑、删除终端设备', '多种终端类型：收银机、自助机、平板', '所属门店配置，明确终端归属', '终端状态管理：启用/禁用', '与门店管理联动，终端归属于门店', '与核销记录联动，记录核销终端信息'],
      tips: ['终端名称建议包含位置信息，便于快速识别', '终端设备请定期维护，确保正常运行', '禁用终端前请确认无未完成的交易，避免数据丢失']
    }
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
    doc: {
      overview: '系统用户是后台管理系统的账号管理工具，管理管理员、运营、客服等不同岗位的登录账号。是系统权限控制的基础，确保不同角色只能访问授权范围内的功能。',
      features: ['支持新增、编辑、删除系统用户', '用户基本信息：姓名、用户名', '角色分配，赋予用户相应权限', '用户状态管理：启用/禁用', '与角色管理联动，继承角色的权限配置', '密码管理，保障账号安全'],
      tips: ['用户账号建议一人一号，避免共用账号导致责任不清', '离职员工账号请及时禁用，防止数据泄露', '建议定期检查用户权限，确保权限与岗位匹配']
    }
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
    doc: {
      overview: '角色管理是系统权限的配置工具，通过角色定义不同岗位的操作权限范围。是系统权限控制的核心，采用RBAC模型实现灵活的权限管理。',
      features: ['支持新增、编辑、删除系统角色', '角色基本信息：名称、编码', '权限配置，精细化控制菜单和操作权限', '角色状态管理：启用/禁用', '与系统用户联动，用户可分配角色获得权限', '权限JSON配置，支持灵活的权限定义'],
      tips: ['角色权限建议遵循最小权限原则，只授予必要的权限', '角色编码为系统唯一标识，创建后请勿随意修改', '建议定期审计角色权限，确保权限配置合理']
    }
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
    doc: {
      overview: '核销记录是线上权益到店使用的核心验证数据模块，完整记录所有券、积分商品、活动权益等的核销过程，确保交易真实可追溯。系统支持多种核销类型，包括优惠券核销、积分商品核销、商城订单核销、活动报名核销等，覆盖平台主要的线下使用场景。核销记录与礼券中心、积分商城、商城订单、商户管理等模块深度联动，会员到店出示核销码后，商户扫码验证完成核销，系统自动更新权益状态并记录核销信息，是连接线上营销和线下消费的关键枢纽。',
      features: ['完整记录所有核销流水，支持查询每一笔核销的详细信息', '记录核销码，支持扫码验证和手动输入两种核销方式', '关联会员信息，可查询会员的历史核销记录', '支持多种核销类型：优惠券、积分商品、商城订单、活动报名等', '记录核销门店/商户，统计各商户的核销数据', '核销状态管理：未核销、已核销、已退，完整覆盖核销生命周期', '记录核销时间，精确跟踪核销时机', '与礼券中心联动，券核销后自动更新券状态为已使用', '与积分商城联动，积分商品核销后自动扣减库存', '与商户管理联动，统计商户核销业绩和排名', '支持按时间范围、核销类型、商户等多维度筛选查询', '支持核销数据导出，便于财务对账和业绩核算'],
      tips: ['核销是权益兑现的关键环节，确保核销操作准确无误', '核销码建议设置有效期，过期未核销自动失效避免成本失控', '建议每日核对核销记录与财务数据，确保数据一致', '异常核销（如重复核销、超额核销）需建立预警和处理机制', '核销员操作需有明确的权限管理，防止误操作和欺诈风险']
    }
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
    doc: {
      overview: '核销员是门店核销人员的管理工具，管理各门店可执行核销操作的员工账号。是线下核销的权限控制入口，确保核销操作的安全性和可追溯性。',
      features: ['支持新增、编辑、删除核销员', '核销员基本信息：姓名、所属门店', '核销次数统计，记录核销业绩', '核销员状态管理：启用/禁用', '与门店管理联动，核销员归属于门店', '与核销记录联动，记录核销操作人'],
      tips: ['核销员账号建议一人一号，确保操作可追溯', '离职核销员账号请及时禁用，防止违规操作', '建议定期统计核销员业绩，作为绩效考核参考']
    }
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
    doc: {
      overview: '开票记录是会员消费开票的管理工具，管理会员的发票申请和开具记录。是财务管理的重要组成部分，也是会员服务的重要环节。',
      features: ['支持新增、编辑、删除开票记录', '发票抬头管理，支持企业和个人抬头', '多种发票类型：普票、专票、电子发票', '开票状态流转：待开、已开、已作废', '开票金额记录，确保金额准确', '与会员档案联动，记录开票会员信息'],
      tips: ['开票信息请仔细核对，避免开错发票导致作废', '专用发票请收集完整的开票信息，确保合规', '建议及时处理开票申请，提升会员满意度']
    }
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
    doc: {
      overview: '财务凭证是平台收支的账务记录工具，记录平台所有收入和支出的凭证信息。是财务核算和审计的重要依据，确保平台资金账目清晰可查。',
      features: ['支持新增、编辑、删除财务凭证', '凭证号管理，确保凭证唯一可查', '会计科目管理，规范财务核算', '收支金额记录，清晰反映资金流向', '摘要说明，记录业务背景', '凭证时间记录，精确到具体时间'],
      tips: ['财务凭证为重要财务资料，请谨慎操作，确保数据准确', '凭证号建议按规则自动生成，避免重号或断号', '建议定期核对凭证与银行流水，确保账实相符']
    }
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
    doc: {
      overview: 'Banner管理是小程序广告位的配置工具，管理首页顶部、商城首页、弹窗等位置的轮播图广告。是重要的营销展示入口，直接影响活动曝光和转化效果。',
      features: ['支持新增、编辑、删除Banner广告', '多种展示位置：首页顶部、商城首页、弹窗', 'Banner排序管理，灵活调整展示顺序', '状态管理：显示/隐藏', 'Banner图片配置，支持跳转链接', '与小程序装修联动，配合页面整体设计'],
      tips: ['Banner图片建议使用高清素材，尺寸符合各位置要求', '重要活动Banner建议放在靠前位置，提升曝光', '建议定期更新Banner内容，保持新鲜感和吸引力']
    }
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
    doc: {
      overview: '公域投放是外部平台引流的管理工具，管理抖音、小红书、美团、大众点评等公域渠道的投放活动。是公域获客和品牌推广的重要手段，可追踪各渠道引流效果。',
      features: ['支持新增、编辑、删除投放活动', '多渠道投放：抖音、小红书、美团、大众点评', '投放预算管理，控制营销成本', '引流人数统计，评估投放效果', '投放状态管理：进行中、已停止', 'ROI分析，评估各渠道投入产出比'],
      tips: ['投放前建议明确目标人群和投放策略，提升转化效果', '建议定期分析各渠道ROI，优化投放预算分配', '投放素材建议定期更新，保持广告新鲜感']
    }
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
    doc: {
      overview: '地产积分是地产行业的业主积分管理工具，业主购房、缴费可累计地产积分，积分可兑换物业权益或其他服务。是地产项目提升业主满意度和粘性的重要运营手段。',
      features: ['支持新增、编辑、删除地产积分账户', '业主和房产信息关联，明确积分归属', '积分余额管理，记录业主积分数量', '账户状态管理：启用/禁用', '与地产积分任务联动，完成任务自动发放积分', '与物业权益联动，积分可兑换物业相关服务'],
      tips: ['地产积分发放规则建议提前公示，避免产生纠纷', '积分有效期建议明确告知业主，定期提醒即将过期积分', '建议设置丰富的积分兑换商品，提升积分价值感知']
    }
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
    doc: {
      overview: '租借物品是便民服务的物品管理工具，管理雨伞、充电宝、推车等可租借物品。是提升会员服务体验和商场服务能力的重要便民功能。',
      features: ['支持新增、编辑、删除租借物品', '物品基本信息：名称、押金、租金', '库存管理，控制可租借数量', '物品状态管理：可借、下架', '与租借记录联动，借出后自动扣减库存', '支持多种物品类型，满足不同便民需求'],
      tips: ['租借物品建议定期检查维护，确保物品完好可用', '押金金额建议合理设置，降低坏账风险', '热门租借物品建议备足库存，满足会员需求']
    }
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
    doc: {
      overview: '租借记录是物品租借的流水记录工具，记录会员租借物品的借出、归还和逾期情况。是物品租借服务的核心数据记录，确保租借业务规范有序。',
      features: ['支持新增、编辑、删除租借记录', '记录租借物品和租借会员信息', '借出时间和归还时间记录', '租借状态流转：已借出、已归还、逾期', '与租借物品联动，借出扣库存归还加库存', '逾期提醒，及时催还逾期物品'],
      tips: ['租借时请仔细核对物品状况，避免归还时产生纠纷', '逾期物品建议及时提醒会员归还，减少损失', '建议定期盘点租借物品，确保账实相符']
    }
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
    doc: {
      overview: '分析报表是平台的深度数据分析工具，提供多维度、多周期的经营分析报表，帮助运营团队和管理层深入洞察业务状况，发现问题和机会，支撑数据驱动决策。系统支持会员分析、销售分析、积分分析、活动分析等多种报表类型，覆盖核心业务场景，并可按日、周、月等不同统计周期灵活查看。分析报表与会员档案、商城订单、积分中心、营销活动等各业务模块深度联动，基于全量业务数据进行多维度交叉分析，是从粗放运营向精细化运营升级的必备工具。',
      features: ['支持新增、编辑、删除报表配置，灵活构建各类分析报表', '多种报表类型：会员分析、销售分析、积分分析、活动分析等', '多统计周期支持：日报、周报、月报，满足不同时间粒度分析需求', '会员分析：新增会员、活跃会员、会员留存、会员等级分布等', '销售分析：销售趋势、商品销售排行、门店销售对比、客单价分析等', '积分分析：积分发放趋势、积分消耗分析、积分余额分布等', '活动分析：活动参与人数、转化率、ROI、券核销率等效果分析', '支持多维度数据钻取，从汇总数据下钻到明细数据', '支持数据可视化图表展示，直观呈现数据趋势和对比', '报表状态管理：启用/禁用，灵活控制报表可用状态', '支持报表导出，便于线下进一步分析和汇报', '与数据总览联动，从总览指标可跳转到对应详细报表'],
      tips: ['报表数据通常为T+1更新，实时数据请以业务模块为准', '分析数据时建议结合多个维度交叉分析，避免单一维度得出片面结论', '定期关注核心指标的趋势变化，及时发现异常和机会', '建议建立报表阅读机制，定期复盘数据，持续优化运营策略', '复杂的定制化分析需求，建议导出原始数据后使用专业分析工具']
    }
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
    doc: {
      overview: '数据总览是平台运营的核心数据看板，集中展示企业经营最关键的核心指标，为管理层和运营团队提供一目了然的经营概览。系统涵盖会员增长、销售业绩、订单交易、积分运营、营销效果等多维度核心数据，并通过环比增长趋势分析，直观呈现业务发展态势。数据总览与分析报表、会员档案、订单系统、积分中心等各业务模块深度联动，实时汇聚各业务线的关键数据，是监控运营状况、发现问题机会、支撑决策判断的重要数据入口，也是日常运营管理的第一站。',
      features: ['核心运营指标集中展示，一站式掌握平台整体经营状况', '会员数据指标：会员总数、新增会员、活跃会员、会员增长率', '销售业绩指标：销售总额、订单总数、客单价、销售环比增长', '订单数据指标：待付款、已付款、已发货、已完成等各状态订单数', '积分运营指标：积分发放总量、积分消耗总量、积分余额', '营销效果指标：活动参与数、券核销率、转化率等', '支持环比增长（MoM）数据展示，直观了解趋势变化', '支持多统计周期切换：日、周、月、季、年', '与会员档案联动，可钻取查看会员详细数据', '与商城订单联动，可钻取查看订单详细数据', '与积分中心联动，可钻取查看积分流水明细', '支持指标自定义配置，不同角色关注不同核心指标'],
      tips: ['数据总览数据通常有计算延迟，实时数据以业务模块为准', '环比数据受节假日、活动等因素影响较大，需结合实际情况分析', '关注核心指标的同时，也需关注结构指标的变化，发现深层问题', '建议每天查看数据总览，及时发现异常波动并跟进处理', '可通过分析报表模块进行更深入的多维度数据分析']
    }
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
    doc: {
      overview: '会员权益是会员价值感和忠诚度的核心驱动力，通过为不同等级会员配置差异化的专属权益，构建阶梯式的会员成长激励体系。系统支持丰富的权益类型，包括消费折扣、积分倍率、停车优惠、专属客服、生日礼品、优先购买、免费体验、专属券等，全方位满足高价值会员的尊贵体验需求。会员权益与会员等级、积分中心、停车系统、礼券中心等模块深度联动，会员升级后自动解锁对应等级的全部权益，在消费、停车、活动等各场景自动享受相应优惠，是提升会员满意度和提升复购的关键运营工具。',
      features: ['支持新增、编辑、删除会员权益，灵活构建权益体系', '九大专属权益类型：折扣、积分倍率、停车、专属客服、礼品、生日特权、优先购买、免费体验、专属券', '按会员等级配置差异化权益，等级越高权益越丰富', '配置权益具体数值和规则，如折扣率、积分倍率、免费时长等', '支持适用门店配置，不同门店可执行差异化权益策略', '设置权益有效期，支持长期有效或固定期限权益', '权益详细说明配置，清晰展示权益内容和使用规则', '权益状态管理：启用/禁用，灵活控制权益生效', '与会员等级联动，等级变更自动调整享受的权益', '与积分中心联动，消费时自动计算积分倍率加成', '与停车系统联动，停车时自动匹配免费时长权益', '与礼券中心联动，自动发放专属券权益'],
      tips: ['权益配置建议逐级递增，体现高等级会员的价值感和尊贵感', '权益设置前请评估成本，确保权益投入与会员价值匹配', '重要权益建议配合运营活动宣传，提升会员升级动力', '权益变更后建议通知受影响会员，避免产生投诉', '建议定期分析权益使用率，优化权益结构提升投入产出比']
    }
  },
  {
    key: 'member-profiles', path: 'member/profiles', name: '会员画像', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '动态标签', dataIndex: 'tags' },
      { title: '消费喜好', dataIndex: 'consumeTag' },
      { title: '品牌喜好', dataIndex: 'brandTag' },
      { title: '积分偏好', dataIndex: 'pointsTag' },
      { title: '兑礼偏好', dataIndex: 'redeemTag' },
      { title: '线上互动', dataIndex: 'onlineTag' },
      { title: '最近活跃', dataIndex: 'lastActive' },
      { title: '画像更新时间', dataIndex: 'updatedAt' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'tags', label: '动态标签', type: 'textarea' },
      { name: 'consumeTag', label: '消费喜好', type: 'textarea' },
      { name: 'brandTag', label: '品牌喜好', type: 'textarea' },
      { name: 'pointsTag', label: '积分偏好', type: 'textarea' },
      { name: 'redeemTag', label: '兑礼偏好', type: 'textarea' },
      { name: 'onlineTag', label: '线上互动', type: 'textarea' },
      { name: 'lastActive', label: '最近活跃', type: 'text' },
      { name: 'updatedAt', label: '画像更新时间', type: 'text' }
    ],
    doc: {
      overview: '会员画像是基于会员全量行为数据构建的360度用户画像，通过多维度标签体系立体呈现每个会员的特征和偏好，是实现精准营销和个性化服务的数据基础。系统整合消费喜好、品牌喜好、积分偏好、兑礼偏好、线上互动、动态标签等多个维度数据，自动生成和更新会员画像。会员画像与会员标签、会员档案、营销活动、推送任务等模块深度联动，为人群定向、商品推荐、精准触达提供数据支撑，帮助运营团队从千人一面升级为千人千面的精细化运营，显著提升营销转化率和会员满意度。',
      features: ['构建会员360度全景画像，多维度呈现会员特征', '整合会员动态标签，直观展示会员人群归属和实时特征', '消费喜好分析：识别会员的消费品类、价格区间、消费频次、消费时段等偏好', '品牌喜好分析：挖掘会员喜爱的品牌和商户，指导品牌招商和合作策略', '积分偏好分析：了解会员对积分的获取习惯、使用频率和兑换偏好', '兑礼偏好分析：掌握会员在积分商城的兑换品类、兑换频次、兑换价值偏好', '线上互动分析：统计会员在小程序的浏览、点击、分享、评论等互动行为', '记录最近活跃时间和画像更新时间，识别会员活跃状态和生命周期阶段', '与会员档案联动，可从会员详情查看完整画像', '与会员标签联动，画像标签自动同步更新', '与营销活动联动，支持按画像特征定向营销', '与推送任务联动，实现个性化消息和内容推荐', '支持画像数据导出，便于进一步的数据分析和挖掘', '提供画像标签统计，掌握整体会员的特征分布'],
      tips: ['会员画像基于行为数据自动生成，数据积累越丰富画像越准确', '画像标签仅供运营参考，重要营销活动建议结合人工判断', '建议定期评估画像标签的准确性，持续优化标签算法', '画像涉及会员隐私数据，请注意数据安全和合规使用', '可结合会员分群功能，将相似画像会员分组运营']
    }
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
    doc: {
      overview: '会员打标签是会员与标签关联关系的管理模块，支持手动打标和规则自动打标两种方式，是标签体系落地执行的关键环节。运营人员可手动为指定会员打上标签，也可通过自动标签规则系统自动计算并关联。',
      features: ['支持新增、删除会员标签关系，灵活管理会员标签', '两种打标方式：手动打标（运营操作）和自动打标（规则触发）', '记录打标时间，追踪标签关联时机', '与会员档案联动，可从会员详情查看和管理标签', '与会员标签联动，自动标签根据规则自动更新', '支持批量打标和批量取消，提升运营效率'],
      tips: ['手动打标前请确认会员身份，避免打错标签', '自动标签由系统规则计算，不建议手动修改其关联关系', '标签变更可能影响营销活动人群，请谨慎操作']
    }
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
    doc: {
      overview: '会员分组是将会员按特定条件或规则划分为不同群体的管理工具，支持自定义分组和智能分组两种类型，是精准营销的重要基础。自定义分组由运营人员手动圈选，智能分组基于设定条件自动计算。',
      features: ['支持新增、编辑、删除会员分组，灵活构建人群分群', '两种分组类型：自定义分组（手动圈选）和智能分组（条件自动圈选）', '配置智能分组条件，系统自动计算更新分组成员', '实时统计分组人数，掌握人群规模', '分组备注说明，记录分组用途和业务背景', '分组状态管理：启用/禁用，灵活控制分组可用状态'],
      tips: ['智能分组条件设置后会自动刷新人群，注意观察人数变化是否符合预期', '分组名称建议清晰描述人群特征，便于后续营销活动使用', '删除分组前请确认是否有营销活动正在使用该分组']
    }
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
    doc: {
      overview: '会员卡管理是会员身份凭证的管理模块，支持实体卡、电子卡、虚拟卡三种卡类型，管理会员卡的发放、余额、状态等全生命周期。会员卡是会员享受权益和服务的身份标识，关联储值、积分等核心资产。',
      features: ['支持新增、编辑、删除会员卡，管理会员卡全生命周期', '三种卡类型：实体卡、电子卡、虚拟卡，满足不同场景需求', '卡面样式配置，支持自定义卡面设计', '余额和积分管理，关联会员账户资产', '卡状态管理：正常、锁定、挂失，保障卡安全', '记录发卡时间和有效期，管理卡的有效周期'],
      tips: ['实体卡发放时建议与会员手机号绑定，避免丢失后无法找回', '会员卡挂失后请及时锁定，防止被盗刷', '卡面样式建议统一设计，提升品牌形象']
    }
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
    doc: {
      overview: '会员成长值是衡量会员活跃度和贡献度的核心指标，通过消费、任务等行为获取成长值，达到门槛即可升级会员等级。成长值体系是激励会员持续活跃、提升会员忠诚度的重要机制。',
      features: ['记录会员当前成长值，实时掌握会员成长进度', '成长值来源分类：任务成长值、消费成长值等', '关联会员等级，成长值达标自动升级', '成长值有效期管理，避免沉睡会员保持高等级', '与会员等级联动，等级变化自动同步成长值要求', '成长值明细记录，支持查询每一笔成长值来源'],
      tips: ['成长值获取规则建议公开透明，让会员清晰了解升级路径', '成长值有效期建议设置为1年，激励会员持续活跃保级', '消费成长值比例建议与积分区分，避免体系混淆']
    }
  },
  {
    key: 'member-points', path: 'member/points', name: '会员积分账户', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '可用积分', dataIndex: 'points' },
      { title: '历史积分', dataIndex: 'historyPoints' },
      { title: '即将过期', dataIndex: 'expiringPoints' },
      { title: '冻结积分', dataIndex: 'frozenPoints' },
      { title: '积分有效期', dataIndex: 'expireDate' },
      { title: '年度清零日期', dataIndex: 'clearDate' },
      { title: '累计获取', dataIndex: 'totalEarned' },
      { title: '累计消耗', dataIndex: 'totalUsed' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '正常' : '冻结') }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'points', label: '可用积分', type: 'number' },
      { name: 'historyPoints', label: '历史积分', type: 'number' },
      { name: 'expiringPoints', label: '即将过期积分', type: 'number' },
      { name: 'frozenPoints', label: '冻结积分', type: 'number' },
      { name: 'expireDate', label: '积分有效期至', type: 'text' },
      { name: 'clearDate', label: '年度清零日期', type: 'text' },
      { name: 'totalEarned', label: '累计获取积分', type: 'number' },
      { name: 'totalUsed', label: '累计消耗积分', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '正常', value: 'enabled' }, { label: '冻结', value: 'frozen' }
      ] }
    ],
    doc: {
      overview: '会员积分账户是管理会员积分资产的核心模块，集中展示每位会员的可用积分、历史积分、即将过期积分、冻结积分等多维度积分数据。系统支持积分有效期管理和年度清零规则，即将过期的积分可自动转为历史积分并优先使用。运营人员可通过本模块进行积分充值、扣减等人工调整操作，满足客服补偿、活动补发等运营需求。会员积分账户与积分流水、积分规则、积分商城、会员档案等模块深度联动，是积分体系运营和财务管理的重要基础。',
      features: ['集中管理会员积分账户，展示可用积分、历史积分、即将过期积分、冻结积分', '支持积分充值操作，满足客服补偿和活动补发等场景', '支持积分扣减操作，处理异常积分回收和退款场景', '积分有效期管理，记录积分过期时间并提前预警', '年度清零规则配置，支持按自然年或会员周期清零', '即将过期积分自动转为历史积分，历史积分优先使用', '累计获取和累计消耗统计，掌握会员积分全生命周期', '账户状态管理：正常/冻结，控制异常账户的积分使用', '与积分流水联动，每笔变动自动生成流水记录', '与积分规则联动，自动计算和发放规则积分', '与积分商城联动，兑换时实时扣减可用积分', '与会员档案联动，查看会员积分资产概况', '支持积分账户数据导出，便于财务核对和审计'],
      tips: ['积分充值和扣减操作会生成积分流水，请填写清晰的备注说明原因', '年度清零前建议提前通知会员，避免引发投诉', '历史积分优先使用，确保会员权益不受影响', '冻结积分账户后，会员将无法进行积分兑换和使用', '建议定期核对积分账户数据，确保与积分流水一致']
    }
  },
  {
    key: 'member-assets', path: 'member/assets', name: '会员资产', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '储值余额', dataIndex: 'balance' },
      { title: '可用积分', dataIndex: 'points' },
      { title: '历史积分', dataIndex: 'historyPoints' },
      { title: '即将过期积分', dataIndex: 'expiringPoints' },
      { title: '优惠券数', dataIndex: 'couponCount' },
      { title: '权益卡数', dataIndex: 'benefitCount' },
      { title: '总价值', dataIndex: 'totalValue' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'balance', label: '储值余额', type: 'number' },
      { name: 'points', label: '可用积分', type: 'number' },
      { name: 'historyPoints', label: '历史积分', type: 'number' },
      { name: 'expiringPoints', label: '即将过期积分', type: 'number' },
      { name: 'couponCount', label: '优惠券数', type: 'number' },
      { name: 'benefitCount', label: '权益卡数', type: 'number' },
      { name: 'totalValue', label: '总价值', type: 'number' }
    ],
    doc: {
      overview: '会员资产是会员在平台拥有的全部资产的汇总视图，集中展示储值余额、可用积分、历史积分、即将过期积分、优惠券、权益卡等资产情况，并估算总价值。是会员了解自身权益、运营评估会员价值的重要数据。',
      features: ['储值余额汇总，展示会员储值账户余额', '可用积分汇总，展示会员当前可使用的积分数量', '历史积分统计，展示已转为历史积分的数量', '即将过期积分预警，提前掌握即将失效的积分', '优惠券数量统计，统计会员持有的有效券数量', '权益卡数量统计，统计会员拥有的权益卡数量', '总价值估算，量化会员资产的货币价值', '与各资产模块联动，数据实时同步更新'],
      tips: ['总价值为估算值，仅供参考，实际价值以各模块明细为准', '会员资产数据由各业务模块自动汇总，不建议直接修改', '建议定期检查资产数据一致性，确保各模块数据同步', '即将过期积分建议及时提醒会员使用，提升会员体验']
    }
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
    doc: {
      overview: '会员推荐关系是社交裂变获客的核心数据模块，记录推荐人与被推荐人的关系链，追踪推荐渠道和奖励发放情况。是老带新、口碑营销的重要数据支撑，可有效降低获客成本。',
      features: ['记录推荐关系链：推荐人、被推荐人、推荐时间', '多推荐渠道追踪：分享、二维码、链接', '双向奖励管理：推荐人奖励和被推荐人奖励', '奖励状态管理：待发放、已发放', '与会员档案联动，查看会员推荐关系网络', '推荐数据统计，分析各渠道推荐效果'],
      tips: ['推荐奖励建议设置合理的发放条件，如被推荐人首单后发放', '推荐关系建议设置有效期，避免无限期追溯', '注意识别和防范恶意刷推荐奖励的行为']
    }
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
      { title: '提货方式', dataIndex: 'delivery', render: (v) => ({ self: '自提', express: '邮寄', auto: '自动到账' }[v] || v) },
      { title: '收货人', dataIndex: 'receiverName' },
      { title: '收货电话', dataIndex: 'receiverPhone' },
      { title: '物流单号', dataIndex: 'logisticsNo' },
      { title: '核销码', dataIndex: 'verifyCode' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待发货', shipped: '已发货', done: '已完成', cancelled: '已取消' }[v] || v) },
      { title: '下单时间', dataIndex: 'createdAt' }
    ],
    fields: [
      { name: 'orderNo', label: '订单号', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'points', label: '消耗积分', type: 'number' },
      { name: 'delivery', label: '提货方式', type: 'select', options: [
        { label: '自提', value: 'self' }, { label: '邮寄', value: 'express' }, { label: '自动到账', value: 'auto' }
      ] },
      { name: 'receiverName', label: '收货人', type: 'text' },
      { name: 'receiverPhone', label: '收货电话', type: 'text' },
      { name: 'receiverAddress', label: '收货地址', type: 'text' },
      { name: 'logisticsCompany', label: '物流公司', type: 'text' },
      { name: 'logisticsNo', label: '物流单号', type: 'text' },
      { name: 'verifyCode', label: '核销码', type: 'text' },
      { name: 'createdAt', label: '下单时间', type: 'text' },
      { name: 'doneTime', label: '完成时间', type: 'text' },
      { name: 'cancelReason', label: '取消原因', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待发货', value: 'pending' }, { label: '已发货', value: 'shipped' }, { label: '已完成', value: 'done' }, { label: '已取消', value: 'cancelled' }
      ] }
    ],
    doc: {
      overview: '积分商城订单是会员兑换积分商品的订单管理模块，记录所有积分兑换订单的完整履约流程，支持自提、邮寄和自动到账三种履约方式。系统详细记录订单信息、收货地址、物流跟踪、核销验证等全链路数据，是积分消费闭环的重要环节。积分商城订单与积分商品、积分流水、会员档案、核销记录等模块深度联动，确保积分兑换从下单到履约的全程可追溯。',
      features: ['记录积分兑换订单，包含订单号、会员、商品、消耗积分等核心信息', '支持三种提货方式：门店自提、快递邮寄、自动到账', '管理收货信息：收货人、联系电话、收货地址', '物流跟踪：记录物流公司和物流单号', '自提订单生成核销码，到店扫码核销完成履约', '订单状态流转：待发货、已发货、已完成、已取消', '记录下单时间和完成时间，跟踪订单履约时效', '支持取消原因记录，便于分析订单取消原因', '与积分商品联动，兑换后自动扣减商品库存', '与积分流水联动，兑换时自动扣减积分并生成流水', '与核销记录联动，自提商品核销后订单完成', '与会员档案联动，查看会员积分兑换历史'],
      tips: ['积分兑换订单一旦确认，积分一般不予退还，请谨慎操作', '邮寄订单请及时填写物流信息，便于会员查询跟踪', '自提订单请设置合理的提货有效期，避免长期未提货', '自动到账类虚拟商品请确保系统自动化发放链路正常']
    }
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
    doc: {
      overview: '停车场管理是智慧停车系统的基础配置模块，管理各停车场的基本信息，包括停车场名称、所属项目、车位数量等。是停车记录、停车权益、计费规则等模块的数据基础。',
      features: ['支持新增、编辑、删除停车场信息', '记录停车场基础信息：名称、所属项目', '车位数量管理：总车位、空闲车位实时统计', '停车场状态管理：启用/禁用', '与停车记录联动，记录各停车场的进出车辆', '与计费规则联动，不同停车场可执行不同计费标准'],
      tips: ['空闲车位数建议实时对接停车系统，确保数据准确', '停车场配置变更可能影响计费和权益，需同步检查相关配置', '多停车场项目建议统一命名规范，便于管理和区分']
    }
  },
  {
    key: 'parking-rules', path: 'parking/rules', name: '停车计费规则', category: '智慧停车',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '免费时长(分)', dataIndex: 'freeMinutes' },
      { title: '单价(元/小时)', dataIndex: 'pricePerHour' },
      { title: '封顶金额', dataIndex: 'capAmount' },
      { title: '无感支付', dataIndex: 'autoPay', render: (v) => (v === 'enabled' ? '已开启' : '未开启') },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'freeMinutes', label: '免费时长(分钟)', type: 'number' },
      { name: 'pricePerHour', label: '单价(元/小时)', type: 'number' },
      { name: 'capAmount', label: '封顶金额(元)', type: 'number' },
      { name: 'autoPay', label: '无感支付', type: 'select', options: [
        { label: '已开启', value: 'enabled' }, { label: '未开启', value: 'disabled' }
      ] },
      { name: 'autoPayLimit', label: '免密支付额度(元)', type: 'number' },
      { name: 'autoPayRule', label: '自动扣费规则说明', type: 'textarea' },
      { name: 'pointsDeductEnabled', label: '积分抵扣停车费', type: 'select', options: [
        { label: '已开启', value: 'enabled' }, { label: '未开启', value: 'disabled' }
      ] },
      { name: 'pointsDeductRate', label: '积分抵扣比例(积分/元)', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '停车计费规则是停车场收费的核心配置模块，支持免费时长、按时计费、封顶金额等多种计费策略组合。同时支持无感支付（自动扣费）、积分抵扣停车费等高级功能配置。灵活的计费规则可满足不同停车场的定价需求，是停车收费准确计算的基础。',
      features: ['支持新增、编辑、删除计费规则', '免费时长配置，设置入场后免费停车时间', '按时计费，设置每小时收费标准', '封顶金额设置，每日最高收费限额', '无感支付开关配置，开启后用户离场自动从微信账户扣费', '免密支付额度配置，设置自动扣费的单次最高金额', '积分抵扣停车费开关，支持使用积分抵扣停车费', '积分抵扣比例配置，设置每元停车费所需积分数量', '规则状态管理：启用/禁用', '与停车场联动，不同停车场可应用不同计费规则'],
      tips: ['计费规则修改前请充分测试，避免收费错误引发投诉', '免费时长建议设置合理，既要吸引客流又要控制成本', '封顶金额可有效提升长时停车用户的满意度', '无感支付需对接微信支付免密支付接口', '积分抵扣比例需结合积分获取成本合理设置']
    }
  },
  {
    key: 'parking-plates', path: 'parking/plates', name: '车牌绑定管理', category: '智慧停车',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '车牌号', dataIndex: 'plateNo' },
      { title: '车牌颜色', dataIndex: 'plateColor', render: (v) => ({ blue: '蓝牌', yellow: '黄牌', green: '绿牌', white: '白牌' }[v] || v) },
      { title: '车辆类型', dataIndex: 'vehicleType', render: (v) => ({ sedan: '轿车', suv: 'SUV', van: '面包车', newEnergy: '新能源' }[v] || v) },
      { title: '绑定时间', dataIndex: 'bindTime' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '正常' : '解绑') }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'plateNo', label: '车牌号', type: 'text', required: true },
      { name: 'plateColor', label: '车牌颜色', type: 'select', options: [
        { label: '蓝牌', value: 'blue' }, { label: '黄牌', value: 'yellow' }, { label: '绿牌', value: 'green' }, { label: '白牌', value: 'white' }
      ] },
      { name: 'vehicleType', label: '车辆类型', type: 'select', options: [
        { label: '轿车', value: 'sedan' }, { label: 'SUV', value: 'suv' }, { label: '面包车', value: 'van' }, { label: '新能源', value: 'newEnergy' }
      ] },
      { name: 'bindTime', label: '绑定时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '正常', value: 'enabled' }, { label: '解绑', value: 'disabled' }
      ] }
    ],
    doc: {
      overview: '车牌绑定管理是会员车辆信息的维护模块，支持会员在线绑定车牌号码，支持多车牌绑定。绑定车牌后可使用无感支付、停车券自动抵扣、积分抵扣停车费等智慧停车功能。运营人员可在后台查看、新增、编辑、删除会员车牌绑定关系，处理会员车牌绑定异常问题。',
      features: ['支持查看全平台会员车牌绑定关系', '支持新增、编辑、删除车牌绑定记录', '支持多车牌绑定，一个会员可绑定多个车牌', '区分车牌颜色：蓝牌、黄牌、绿牌、白牌', '记录车辆类型：轿车、SUV、面包车、新能源', '绑定状态管理：正常/解绑', '与停车记录联动，根据车牌匹配会员停车数据', '与停车权益联动，绑定车牌的会员享受会员停车优惠', '与无感支付联动，绑定车牌后可使用自动扣费功能'],
      tips: ['车牌号格式需校验，避免绑定错误车牌', '同一车牌不可重复绑定不同会员', '解绑车牌前请确认无未完成的停车订单', '新能源车牌需特别注意号牌格式校验']
    }
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
    doc: {
      overview: '商户核销统计是商户核销数据的汇总分析工具，汇总各商户的券、积分商品、商城订单等核销情况。是评估商户经营状况和结算的重要数据依据。',
      features: ['支持新增、编辑、删除核销统计记录', '多类型核销汇总：优惠券、积分商品、商城订单、活动报名', '核销数量和核销金额统计', '按日统计，支持时间维度分析', '按商户维度汇总，掌握各商户核销情况', '与核销记录联动，数据来源真实可靠'],
      tips: ['核销统计为财务结算依据，请确保数据准确', '建议定期导出统计数据进行财务核对', '可结合商户经营情况，针对性给予资源支持']
    }
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
    doc: {
      overview: '商户发券是商户端优惠券发放的管理工具，商户可在商户助手小程序上向会员发放优惠券或停车券。是商户自主营销和会员维护的重要手段。',
      features: ['支持新增、编辑、删除发券记录', '单个发放和批量发放两种模式', '关联券模板，确保发放的券符合规则', '记录发放会员和发放数量', '发放时间记录，追踪发放时效', '与礼券模板联动，使用平台统一定义的券模板'],
      tips: ['发券前请确认券模板库存充足，避免发放失败', '建议引导商户精准发券，提升核销率', '发券记录可作为商户营销效果评估的依据']
    }
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
    doc: {
      overview: '商城首页配置是小程序商城首页的专属装修工具，针对商城首页场景提供专门的组件和配置能力，是商城流量分发和转化提升的关键入口。系统支持多种页面类型（商场首页、分类页、自定义页），可配置门店切换、搜索框、广告轮播、分类导航、促销活动、商品推荐、底部菜单等核心组件。商城首页配置与商品管理、营销活动、会员体系等模块深度联动，运营人员可根据节日、活动、季节等不同场景快速调整首页内容和布局，将流量精准引导至高价值商品和活动，提升首页转化率和GMV。',
      features: ['支持新增、编辑、删除首页配置，灵活管理多个首页版本', '多种页面类型：商场首页、分类页、自定义页，满足不同场景', '组件化配置，支持门店切换、搜索、广告轮播、分类导购等组件', '促销活动组件，展示限时折扣、秒杀、拼团等营销活动入口', '推荐商品组件，支持热门推荐、新品上架、猜你喜欢等多种推荐位', '底部菜单组件，配置小程序底部导航栏', '组件排序管理，灵活调整页面模块顺序', '页面状态管理：启用/禁用，控制页面是否生效', '与商城商品联动，商品组件自动关联商品库数据', '与营销活动联动，活动组件自动展示进行中的活动', '与小程序装修联动，可调用通用装修组件能力', '支持多套首页方案，根据不同人群展示不同首页'],
      tips: ['首页是流量最高的页面，重要活动和爆款商品建议放在首屏位置', '首页布局建议定期更新，保持新鲜感，提升回访率', '大促活动前建议提前配置好首页，测试确认后再上线', '注意不同手机型号的适配，确保各种屏幕都有良好展示效果', '建议通过热图数据分析首页各模块点击情况，持续优化布局']
    }
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
    doc: {
      overview: '商城底部菜单是小程序底部导航栏的配置工具，管理底部Tab的菜单名称、图标、跳转链接等。是小程序最重要的导航入口，直接影响用户体验和页面流转。',
      features: ['支持新增、编辑、删除底部菜单项', '配置菜单名称和图标，提升视觉体验', '设置跳转链接，控制点击后跳转页面', '菜单排序管理，灵活调整Tab顺序', '菜单状态管理：启用/禁用', '支持图标选中态和未选中态配置'],
      tips: ['底部菜单建议控制在3-5个，过多会显得拥挤', '重要功能入口建议放在中间或两侧，符合用户点击习惯', '图标建议统一设计风格，保持视觉一致性']
    }
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
    doc: {
      overview: '品牌管理是商城品牌信息的维护工具，管理品牌LOGO、形象、电话、分类等信息，用于品牌展示和导览。完善的品牌信息有助于提升品牌认知和会员信任。',
      features: ['支持新增、编辑、删除品牌信息', '品牌LOGO和形象展示', '品牌分类管理，便于归类查找', '品牌联系电话配置', '品牌状态管理：启用/禁用', '与商品管理联动，商品关联品牌信息'],
      tips: ['品牌LOGO建议使用高清透明背景图片，提升展示效果', '品牌信息建议尽量完善，增强会员信任感', '品牌排序建议按热度或字母排序，便于查找']
    }
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
    doc: {
      overview: '订单退货是商城退货退款的管理工具，处理会员的退货申请，审核通过后原路退回货款。是售后体系的重要组成部分，直接影响会员购物体验和满意度。',
      features: ['支持新增、编辑、删除退货单', '记录退货单号和原订单号关联', '管理退款金额和退货原因', '退货状态流转：待审核、已通过、已拒绝、已退款', '记录申请时间，跟踪处理时效', '与商城订单联动，关联原订单信息'],
      tips: ['退货审核建议在24小时内处理，提升会员满意度', '退款前请确认商品已退回且完好无损', '建议定期分析退货原因，针对性改进商品和服务']
    }
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
    doc: {
      overview: '商品规格是商城商品属性的统一管理工具，管理颜色、尺寸、版本等规格属性和规格值。统一的规格体系便于商品SKU管理和前端筛选，提升商品管理效率。',
      features: ['支持新增、编辑、删除规格', '规格值管理，维护规格的可选值', '规格排序管理，灵活调整展示顺序', '规格状态管理：启用/禁用', '与商品管理联动，商品可关联规格创建SKU', '支持多规格组合，满足复杂商品需求'],
      tips: ['规格名称建议简洁规范，如颜色、尺寸等', '规格值建议按常用程度排序，方便快速选择', '删除规格前请确认没有商品正在使用，避免影响商品展示']
    }
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
    doc: {
      overview: '商品评价是商城商品的用户评价管理工具，管理会员的商品评分和评价内容，支持评价审核和回复。真实的用户评价是提升商品转化率的重要因素，也是了解用户反馈的重要渠道。',
      features: ['支持新增、编辑、删除商品评价', '评分系统，1-5星评分体系', '评价类型分类：好评、中评、差评', '支持匿名评价，保护会员隐私', '评价审核机制：待审核、已发布、已隐藏', '商家回复功能，与会员互动沟通'],
      tips: ['评价审核建议及时处理，优质评价及时展示，不良评价及时处理', '差评建议主动回复沟通，展现积极的服务态度', '建议引导会员上传实物图片评价，提升参考价值']
    }
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
    doc: {
      overview: '物流模板是商城运费配置的管理工具，支持按件、按重、按体积等多种计价方式，设置首件续件和包邮条件。灵活的运费配置是提升下单转化率的重要因素。',
      features: ['支持新增、编辑、删除物流模板', '多种计价方式：按件、按重、按体积', '首件/首重和续件/续重配置', '包邮条件设置，满额或满件包邮', '模板状态管理：启用/禁用', '与商品管理联动，商品可关联物流模板'],
      tips: ['包邮门槛建议设置略高于客单价，有效提升客单价', '不同地区建议设置差异化运费，偏远地区可适当提高运费', '模板名称建议清晰描述适用范围，便于选择']
    }
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
    doc: {
      overview: '收货地址是会员收货信息的管理工具，管理会员的多个收货地址，支持默认地址设置和地址标签。完善的地址管理有助于提升下单体验和配送准确率。',
      features: ['支持新增、编辑、删除收货地址', '管理详细地址：省市区和详细地址', '收货人信息：姓名和联系电话', '默认地址设置，下单时自动填充', '地址标签功能：家、公司、学校等', '与会员档案联动，查看会员所有收货地址'],
      tips: ['建议引导会员填写完整的地址信息，确保配送准确', '收货电话建议填写常用手机号，便于快递联系', '建议提醒会员及时更新变更的地址信息']
    }
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
    doc: {
      overview: '配送方式是商城配送服务的配置工具，支持快递、自提、同城配送等多种配送方式，满足不同场景的配送需求。丰富的配送选择有助于提升会员下单体验。',
      features: ['支持新增、编辑、删除配送方式', '多种配送类型：快递、自提、同城配送', '配送说明配置，描述配送规则和时效', '运费配置，设置配送费用', '配送状态管理：启用/禁用', '与商城订单联动，下单时可选择配送方式'],
      tips: ['配送方式建议根据实际运营能力设置，避免承诺无法兑现的服务', '自提模式建议配置详细的自提点信息和营业时间', '配送费用建议设置合理，过高会影响下单转化']
    }
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
    doc: {
      overview: '商品分组是商品归类和运营的工具，用于将商品按运营需求分组，如热销推荐、新品上架、节日特惠等，便于在首页和活动页展示。灵活的分组是提升商品曝光和转化的重要手段。',
      features: ['支持新增、编辑、删除商品分组', '分组描述，说明分组用途和特点', '分组排序管理，灵活调整展示顺序', '分组状态管理：启用/禁用', '与商品管理联动，商品可加入多个分组', '与首页装修联动，分组商品可在首页展示'],
      tips: ['分组名称建议简洁有吸引力，提升点击欲望', '建议定期更新分组商品，保持新鲜感', '重要分组建议放在首页显眼位置，提升曝光']
    }
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
    doc: {
      overview: '售后管理是商城售后服务的工单管理工具，处理仅退款、退货退款、换货等售后申请，跟踪处理进度和状态流转。完善的售后体系是提升会员满意度和复购的重要保障。',
      features: ['支持新增、编辑、删除售后工单', '多种售后类型：仅退款、退货退款、换货', '售后原因记录，分析问题根源', '状态流转：申请中、已通过、已拒绝、已退款', '处理记录和处理备注，跟踪处理过程', '与商城订单联动，关联原始订单信息'],
      tips: ['售后工单建议在24小时内响应处理，提升会员体验', '处理售后时建议先了解具体情况，再给出解决方案', '定期分析售后原因，针对性改进商品和服务质量']
    }
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
    doc: {
      overview: '活动报名是线下活动的报名管理模块，记录会员在小程序报名的商场活动，管理报名名单和签到状态。是线下活动从报名到参与的全流程管理工具。',
      features: ['记录活动报名信息：活动名称、会员、报名人数', '报名状态管理：待签到、已签到、已取消', '记录报名时间，跟踪报名时效', '支持报名人数统计，掌握活动热度', '与会员档案联动，查看会员活动参与记录', '活动签到管理，验证会员到场情况'],
      tips: ['报名人数建议设置上限，避免人数过多超出场地承载', '活动开始前可通过消息推送提醒已报名会员', '建议签到时核对会员身份，避免冒名顶替']
    }
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
    doc: {
      overview: '签到活动是培养会员日常活跃习惯的营销工具，通过每日/每周/每月签到获得积分、优惠券、停车券等奖励，提升会员粘性和打开频次。是低成本提升会员活跃度的有效方式。',
      features: ['支持新增、编辑、删除签到活动', '多种奖励类型：积分、优惠券、停车券', '多周期支持：每日、每周、每月签到', '配置奖励具体数值和内容', '活动状态管理：启用/禁用', '连续签到奖励，培养用户习惯'],
      tips: ['签到奖励不宜过高，控制成本的同时保持吸引力', '建议设置连续签到额外奖励，提升留存率', '签到活动建议长期运行，培养会员稳定使用习惯']
    }
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
    doc: {
      overview: '推荐有礼是社交裂变获客的营销工具，老会员分享推荐码邀请新会员注册，双方都可获得积分、优惠券或实物奖励。通过老带新实现低成本获客，利用社交信任提升转化率。',
      features: ['支持新增、编辑、删除推荐有礼活动', '双向奖励配置：推荐人奖励和被邀人奖励', '奖励类型丰富：积分、优惠券、实物奖品', '活动状态管理：启用/禁用', '与会员推荐关系联动，自动追踪推荐关系链', '推荐效果统计，分析获客成本和转化率'],
      tips: ['推荐奖励建议设置阶梯，推荐越多奖励越丰厚', '新会员首单后再发放奖励，防止恶意刷奖励', '建议配合分享海报和专属二维码，提升分享转化率']
    }
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
    doc: {
      overview: '新人礼是新会员注册的激励工具，新会员注册后自动发放礼包，包含停车券、积分、优惠券等，提升新会员首单转化和留存。是新会员转化的第一道门槛，对会员生命周期价值提升至关重要。',
      features: ['支持新增、编辑、删除新人礼包', '配置丰富的奖励内容：券、积分、停车券等', '设置礼包有效期，促进尽快使用', '活动状态管理：启用/禁用', '与会员档案联动，新会员注册自动触发发放', '与礼券中心联动，自动关联券模板发放'],
      tips: ['新人礼建议设置领取有效期，一般7-15天为宜', '礼包内容建议包含高吸引力的券，提升首单转化', '建议定期优化新人礼内容，测试不同礼包的转化效果']
    }
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
    doc: {
      overview: '助力领券是社交裂变营销工具，会员邀请好友助力，达到指定人数后即可低价或免费获得优惠券。利用社交传播扩大活动覆盖面，同时保证券的精准发放。',
      features: ['支持新增、编辑、删除助力领券活动', '关联券模板，指定助力获得的券', '设置所需助力人数，控制裂变难度', '实时统计已助力人数，掌握活动进度', '活动状态管理：启用/禁用', '与礼券中心联动，助力成功自动发券'],
      tips: ['助力人数建议设置为3-5人，门槛太高容易放弃', '助力券面值建议设置有足够吸引力，提升参与动力', '建议设置助力有效期，超时未完成自动失效']
    }
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
    doc: {
      overview: '口令领券是私域营销的常用工具，会员输入专属口令即可领取优惠券，常用于社群运营、直播带货等场景。通过口令控制发放范围，精准触达目标人群。',
      features: ['支持新增、编辑、删除口令领券活动', '设置专属口令，支持自定义口令内容', '关联券模板，指定口令可领取的券', '实时统计已领取数量，掌握发放进度', '活动状态管理：启用/禁用', '与礼券中心联动，口令验证后自动发券'],
      tips: ['口令建议设置为易记且与活动相关的词语，提升传播效果', '口令券建议设置每人限领1次，防止重复领取', '口令活动建议配合社群运营推广，效果更佳']
    }
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
    doc: {
      overview: '游戏互动是趣味营销工具，提供大转盘、老虎机、抢红包、九宫格等多种互动游戏，会员参与游戏可获得积分、停车券、代金券等奖励。通过游戏化方式提升会员活跃度和停留时长。',
      features: ['支持新增、编辑、删除互动游戏', '多种游戏类型：大转盘、老虎机、抢红包、九宫格', '配置游戏奖励池：积分、券、实物奖品等', '统计参与次数，掌握游戏热度', '活动状态管理：启用/禁用', '中奖概率配置，控制营销成本'],
      tips: ['游戏中奖概率建议合理设置，平衡体验和成本', '游戏入口建议放在首页显眼位置，提升参与率', '建议定期更换游戏类型，保持新鲜感']
    }
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
    doc: {
      overview: '调查问卷是会员调研和意见收集的工具，通过问卷与会员互动，收集会员需求和反馈，为产品和运营优化提供数据支撑。可设置参与奖励提升问卷完成率。',
      features: ['支持新增、编辑、删除调查问卷', '配置问卷题目和选项，支持多种题型', '设置参与奖励，提升问卷完成率', '统计参与人数，掌握调研覆盖度', '活动状态管理：启用/禁用', '问卷结果统计分析，提取有效信息'],
      tips: ['问卷题目不宜过多，建议控制在10题以内，提升完成率', '奖励设置与问卷时长匹配，提升参与意愿', '问卷结果建议定期分析，及时应用到运营优化中']
    }
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
    doc: {
      overview: '投票活动是会员互动和意见征集的工具，发起投票让会员参与选择，增强会员参与感和归属感。可用于新品选择、活动评选、满意度调研等场景，收集会员偏好数据。',
      features: ['支持新增、编辑、删除投票活动', '配置投票选项，支持多选或单选', '统计总票数，实时展示投票结果', '活动状态管理：启用/禁用', '投票结果可视化展示', '与会员档案联动，记录参与会员'],
      tips: ['投票选项建议设置全面，避免遗漏重要选项', '建议设置每人投票次数限制，防止刷票', '投票结果建议及时公布，提升会员参与感']
    }
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
    doc: {
      overview: '限时购是短周期促销营销工具，在指定时间段内以特价销售商品，通过倒计时营造紧迫感，刺激会员快速决策下单。常用于清库存、推新品、节日促销等场景。',
      features: ['支持新增、编辑、删除限时购活动', '关联商品，设置活动价和原价对比', '配置活动开始和结束时间，精确控制周期', '活动状态管理：启用/禁用', '与商城商品联动，自动同步商品信息', '倒计时展示，营造紧迫感促进转化'],
      tips: ['限时购时长建议控制在1-3天，过长则紧迫感不足', '活动价建议有足够力度，才能吸引快速下单', '建议提前预热预告，活动开始时集中流量效果更好']
    }
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
    doc: {
      overview: '预售是提前销售的营销工具，采用定金+尾款模式，提前锁定销售，降低库存风险。常用于新品上市、限量发售、节日预定等场景，可有效预测销量和安排备货。',
      features: ['支持新增、编辑、删除预售活动', '定金+尾款模式，分阶段收款', '配置预售时间和发货时间', '活动状态管理：启用/禁用', '与商城商品联动，关联商品详情', '预售数据统计，预测销量指导备货'],
      tips: ['定金比例建议设置为20%-30%，既锁定订单又不过高', '发货时间建议预留缓冲，避免延迟发货投诉', '预售结束前建议通过消息提醒付尾款，提升转化']
    }
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
    doc: {
      overview: '帮砍价是社交裂变营销工具，会员发起砍价后邀请好友帮忙砍价，砍到低价或底价后可购买。利用社交传播吸引流量，同时通过砍价过程增加互动和转化。',
      features: ['支持新增、编辑、删除砍价活动', '关联商品，设置原价和底价', '统计已发起砍价数，掌握活动热度', '活动状态管理：启用/禁用', '与商城商品联动，砍价成功自动下单', '砍价进度展示，激励分享传播'],
      tips: ['底价建议设置为原价的3-5折，既有吸引力又控制成本', '砍价次数建议设置10-20次完成，既促进分享又不过于繁琐', '砍价活动建议设置有效期，增加紧迫感']
    }
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
    doc: {
      overview: '众筹抽奖是社交裂变营销工具，会员支付小额费用参与众筹，达到指定人数后开奖，幸运者获得大奖。通过低门槛高回报的方式吸引大量参与，快速聚集人气和流量。',
      features: ['支持新增、编辑、删除众筹抽奖活动', '配置奖品信息和开奖时间', '统计参与人数，掌握活动热度', '活动状态管理：启用/禁用', '与会员档案联动，记录参与会员', '开奖结果公示，保证活动公平透明'],
      tips: ['奖品建议设置高价值商品，提升参与吸引力', '参与人数阈值建议合理设置，确保活动有足够参与', '开奖过程建议公开透明，提升会员信任感']
    }
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
    doc: {
      overview: '盲盒活动是趣味营销工具，会员购买盲盒后随机获得奖品池中的奖品，利用不确定性和惊喜感提升参与度和复购。是近年来非常流行的营销玩法，尤其受年轻用户喜爱。',
      features: ['支持新增、编辑、删除盲盒活动', '配置盲盒价格和奖品池', '统计已开盒数量，掌握活动热度', '活动状态管理：启用/禁用', '奖品概率配置，控制营销成本', '与会员档案联动，记录购买会员'],
      tips: ['奖品池建议设置不同价值档次的奖品，既有惊喜又控成本', '盲盒价格建议适中，降低尝试门槛提升参与率', '建议定期更新奖品池，保持新鲜感提升复购']
    }
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
    doc: {
      overview: '计次卡是预付费类营销工具，会员购买计次卡后可在指定商户消费指定次数，通常享受折扣优惠。既能提前锁定客户和收入，又能提升会员到店频次和忠诚度。',
      features: ['支持新增、编辑、删除计次卡', '配置可用次数和价格', '设置适用商户范围', '活动状态管理：启用/禁用', '与商户管理联动，指定可用商户', '计次卡使用记录和核销管理'],
      tips: ['计次卡价格建议比单次购买优惠10%-30%，提升吸引力', '使用期限建议设置合理，避免长期未使用的卡带来的服务压力', '适用商户建议选择口碑好的商户，保证会员体验']
    }
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
    doc: {
      overview: '现场打卡领券是线下引流营销工具，会员到店扫码打卡后可领取优惠券，引导会员到店消费。通过地理位置打卡验证，确保券精准发放给到店用户，提升到店转化。',
      features: ['支持新增、编辑、删除打卡领券活动', '设置打卡位置，确保到店才能领取', '关联券模板，指定打卡可领取的券', '实时统计已领取数量，掌握活动效果', '活动状态管理：启用/禁用', '与礼券中心联动，打卡成功自动发券'],
      tips: ['打卡位置建议设置在门店入口或服务台，方便会员操作', '打卡券建议设置当日有效，促进即时消费', '建议配合门店物料宣传，引导会员参与打卡']
    }
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
    doc: {
      overview: '抖音兑换券是公域引流工具，顾客在抖音购买的团购券可到小程序兑换为平台权益，实现抖音公域流量向私域会员的转化。是打通公域获客和私域运营的重要桥梁。',
      features: ['支持新增、编辑、删除抖音兑换券活动', '配置抖音券码，验证抖音团购券', '设置兑换权益，抖音券可兑换为平台券或积分', '统计已兑换数量，掌握引流效果', '活动状态管理：启用/禁用', '与会员档案联动，兑换后自动绑定会员'],
      tips: ['抖音券码建议与抖音后台实时同步，确保验证准确', '兑换权益建议设置有吸引力的权益，提升抖音用户转化意愿', '建议定期分析抖音引流数据，优化投放策略']
    }
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
    doc: {
      overview: '地产积分任务是地产项目积分获取的配置工具，管理发言建议、朋友圈转发、推荐到访、推荐签约等各类积分任务。是激励业主参与社区活动、促进老带新的重要运营手段。',
      features: ['支持新增、编辑、删除积分任务', '多种任务类型：发言建议、朋友圈转发、关注账号、暖场活动等', '积分奖励配置，设置完成任务获得的积分', '任务限制配置，设置每日/总共可完成次数', '任务状态管理：启用/禁用', '与地产积分联动，完成任务自动发放积分'],
      tips: ['任务积分奖励建议设置合理，避免积分通胀', '推荐类任务建议设置多级奖励，提升推荐积极性', '建议定期更新任务类型，保持业主新鲜感和参与度']
    }
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
    doc: {
      overview: '地产活动报名是地产项目业主活动的报名管理工具，管理业主活动报名和打卡信息。是组织业主活动、提升社区活跃度和业主满意度的重要运营工具。',
      features: ['支持新增、编辑、删除活动报名记录', '记录活动名称和报名业主信息', '报名状态流转：待审核、已通过、已打卡', '报名时间记录，跟踪报名时效', '与地产积分联动，活动打卡后可发放积分奖励', '活动数据统计，分析活动参与情况'],
      tips: ['活动报名建议设置合理的报名截止时间，便于提前准备', '重要活动建议设置报名审核，确保参与人员符合要求', '活动结束后建议及时发放积分奖励，提升业主满意度']
    }
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
    doc: {
      overview: '小程序装修是可视化搭建小程序页面的强大工具，通过拖拽式组件化配置，运营人员无需代码即可快速搭建和修改小程序页面，大幅提升运营效率和灵活性。系统支持丰富的页面组件（Banner、搜索、分类导航、商品推荐、活动入口等），提供多模板切换、实时预览、历史版本管理、热图分析等高级功能。小程序装修与商城商品、营销活动、内容管理等模块深度联动，可在页面中直接配置商品列表、活动入口、优惠券等业务组件，实现内容与业务的无缝融合，是快速响应运营需求、提升页面转化的核心工具。',
      features: ['支持新增、编辑、删除装修页面，灵活搭建各类小程序页面', '可视化组件配置，支持拖拽式操作，无需代码即可搭建页面', '丰富的组件库：Banner轮播、搜索框、分类导航、商品列表、活动入口、优惠券等', '多模板管理，支持不同场景使用不同页面模板', '版本管理，支持保存历史版本和一键回滚', '实时预览功能，装修过程中可随时查看页面效果', '热图分析，统计页面各区域点击热度，指导页面优化', '页面码下载，支持生成页面分享二维码', '页面状态管理：启用/禁用，控制页面是否生效', '与商城商品联动，支持配置商品列表和推荐商品', '与营销活动联动，支持配置活动入口和营销区块', '与内容管理联动，支持配置文章和资讯内容展示'],
      tips: ['页面装修前建议先规划页面结构和核心模块，避免反复调整', '重要页面修改建议先在预览环境确认效果后再发布上线', '建议保留历史版本，出现问题可快速回滚到稳定版本', '定期分析热图数据，优化页面布局，提升关键区域点击率', '首页等核心页面建议进行AB测试，数据驱动选择最优方案']
    }
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
    doc: {
      overview: '操作日志是系统操作的审计记录工具，记录后台用户的增删改查等所有操作，用于安全审计和问题追溯。是保障系统安全和数据安全的重要机制。',
      features: ['记录所有系统操作，支持查询操作日志', '记录操作人，明确操作责任', '记录操作模块和操作类型，快速定位操作内容', '记录操作IP地址，安全审计可追溯', '记录操作时间，精确到秒级', '支持按操作人、模块、时间等多维度筛选查询'],
      tips: ['操作日志为安全审计依据，请勿随意删除或修改', '建议定期备份操作日志，确保数据安全', '异常操作建议及时告警和处理，防范安全风险']
    }
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
    doc: {
      overview: '菜单管理是后台系统菜单的配置工具，配置系统菜单的层级、路径、图标、排序和启停状态。是系统导航和权限控制的基础配置。',
      features: ['支持新增、编辑、删除系统菜单', '多级菜单结构，支持父子菜单层级', '菜单路径和图标配置', '菜单排序管理，灵活调整展示顺序', '菜单状态管理：启用/禁用', '与角色管理联动，菜单可作为权限控制维度'],
      tips: ['菜单路径需与前端路由严格对应，避免页面无法访问', '菜单层级建议控制在3级以内，过深会增加查找难度', '新增菜单后请配置对应角色权限，确保用户可访问']
    }
  },
  // ===== 会员数字化（补充）=====
  {
    key: 'member-marketing-models', path: 'member/marketing-models', name: '营销模型', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '模型名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ lifecycle: '生命周期', value: '价值分层', level: '等级', anniversary: '纪念日', rmf: 'RFM' }[v] || v) },
      { title: '筛选条件', dataIndex: 'condition' },
      { title: '目标人数', dataIndex: 'audienceCount' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '模型名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '生命周期', value: 'lifecycle' }, { label: '价值分层', value: 'value' },
        { label: '等级', value: 'level' }, { label: '纪念日', value: 'anniversary' }, { label: 'RFM', value: 'rmf' }
      ] },
      { name: 'condition', label: '筛选条件', type: 'textarea' },
      { name: 'audienceCount', label: '目标人数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '基于会员维度创建营销模型，通过多种维度（生命周期、价值分层、等级、纪念日、RFM等）筛选目标人群，用于精准营销触达，提升营销转化率。',
      features: ['新增/编辑/删除营销模型', '支持生命周期模型', '支持价值分层模型', '支持会员等级模型', '支持纪念日模型', '支持RFM分析模型', '可视化筛选条件配置', '预估目标人群数量', '模型启停管理', '模型复制复用'],
      tips: ['RFM模型基于最近消费、消费频率、消费金额三维度', '目标人数为预估数据，实际以执行时为准', '建议先小范围测试模型效果']
    }
  },
  {
    key: 'member-marketing-tasks', path: 'member/marketing-tasks', name: '精准营销任务', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '任务名称', dataIndex: 'name' },
      { title: '关联模型', dataIndex: 'modelId' },
      { title: '渠道', dataIndex: 'channel', render: (v) => ({ sms: '短信', wechat: '微信', subscribe: '订阅消息' }[v] || v) },
      { title: '发送时间', dataIndex: 'sendTime' },
      { title: '目标人数', dataIndex: 'targetCount' },
      { title: '已发送', dataIndex: 'sentCount' },
      { title: '已读', dataIndex: 'readCount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ draft: '草稿', running: '进行中', finished: '已完成', paused: '已暂停' }[v] || v) }
    ],
    fields: [
      { name: 'name', label: '任务名称', type: 'text', required: true },
      { name: 'modelId', label: '关联模型', type: 'text' },
      { name: 'channel', label: '渠道', type: 'select', options: [
        { label: '短信', value: 'sms' }, { label: '微信', value: 'wechat' }, { label: '订阅消息', value: 'subscribe' }
      ] },
      { name: 'template', label: '消息模板', type: 'text' },
      { name: 'sendTime', label: '发送时间', type: 'text' },
      { name: 'targetCount', label: '目标人数', type: 'number' },
      { name: 'sentCount', label: '已发送', type: 'number' },
      { name: 'readCount', label: '已读', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '草稿', value: 'draft' }, { label: '进行中', value: 'running' },
        { label: '已完成', value: 'finished' }, { label: '已暂停', value: 'paused' }
      ] }
    ],
    doc: {
      overview: '根据营销模型创建营销任务，支持多渠道（短信、微信、订阅消息）主动或自动触达用户，追踪发送和阅读效果，实现精准营销闭环。',
      features: ['新增/编辑/删除营销任务', '关联营销模型筛选人群', '支持短信渠道发送', '支持微信模板消息', '支持订阅消息推送', '消息模板配置', '定时/即时发送', '发送进度实时追踪', '已读数据统计', '任务暂停/恢复', '草稿状态管理', '营销效果分析'],
      tips: ['建议在非工作时间发送营销短信避免打扰', '微信模板消息需用户主动触发后才能发送', '订阅消息需用户订阅后才能推送']
    }
  },
  // ===== 积分中心（补充）=====
  {
    key: 'points-adjust', path: 'points/adjust', name: '积分调整', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ manual: '手动', batch: '批量', reset: '清零' }[v] || v) },
      { title: '调整积分', dataIndex: 'points', render: (v) => (v > 0 ? `+${v}` : `${v}`) },
      { title: '调整原因', dataIndex: 'reason' },
      { title: '操作人', dataIndex: 'operator' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待审核', approved: '已通过', rejected: '已拒绝' }[v] || v) },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '手动', value: 'manual' }, { label: '批量', value: 'batch' }, { label: '清零', value: 'reset' }
      ] },
      { name: 'points', label: '调整积分', type: 'number' },
      { name: 'reason', label: '调整原因', type: 'textarea' },
      { name: 'operator', label: '操作人', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待审核', value: 'pending' }, { label: '已通过', value: 'approved' }, { label: '已拒绝', value: 'rejected' }
      ] },
      { name: 'time', label: '时间', type: 'text' }
    ],
    doc: {
      overview: '手动或批量调整会员积分，支持积分清零操作，支持审核流程控制，确保积分变动安全可控，所有操作留痕可追溯。',
      features: ['手动调整单个会员积分', '批量调整会员积分', '积分清零操作', '调整原因记录', '多级审核流程', '操作人记录', '调整时间记录', '待审核/已通过/已拒绝状态', '积分变动流水联动', '操作日志留痕'],
      tips: ['积分调整需谨慎，建议开启审核流程', '批量调整前请导出名单核对', '清零操作不可恢复，请确认后执行']
    }
  },
  {
    key: 'points-transfer', path: 'points/transfer', name: '积分转移', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '转出会员', dataIndex: 'fromMember' },
      { title: '转入会员', dataIndex: 'toMember' },
      { title: '转移积分', dataIndex: 'points' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ processing: '处理中', success: '成功', failed: '失败' }[v] || v) },
      { title: '操作人', dataIndex: 'operator' },
      { title: '时间', dataIndex: 'time' }
    ],
    fields: [
      { name: 'fromMember', label: '转出会员', type: 'text', required: true },
      { name: 'toMember', label: '转入会员', type: 'text', required: true },
      { name: 'points', label: '转移积分', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '处理中', value: 'processing' }, { label: '成功', value: 'success' }, { label: '失败', value: 'failed' }
      ] },
      { name: 'operator', label: '操作人', type: 'text' },
      { name: 'time', label: '时间', type: 'text' },
      { name: 'remark', label: '备注', type: 'textarea' }
    ],
    doc: {
      overview: '会员积分从A账户转移到B账户，支持手机号/卡号验证，确保转移安全，所有转移记录留痕，支持处理中/成功/失败状态追踪。',
      features: ['会员间积分转移', '手机号验证转入账户', '会员卡号验证', '转移积分数量设置', '处理状态追踪', '操作人记录', '转移时间记录', '备注信息', '失败原因记录', '转移流水联动'],
      tips: ['转移前请核实转入会员身份', '积分转移后不可撤销', '建议设置单日转移上限']
    }
  },
  {
    key: 'points-blacklist', path: 'points/blacklist', name: '积分黑名单', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '手机号', dataIndex: 'phone' },
      { title: '原因', dataIndex: 'reason' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ manual: '手动', auto: '自动风控' }[v] || v) },
      { title: '操作人', dataIndex: 'operator' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ enabled: '已加入', disabled: '已移出' }[v] || v) },
      { title: '加入时间', dataIndex: 'addTime' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'phone', label: '手机号', type: 'text' },
      { name: 'reason', label: '原因', type: 'textarea' },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '手动', value: 'manual' }, { label: '自动风控', value: 'auto' }
      ] },
      { name: 'operator', label: '操作人', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '已加入', value: 'enabled' }, { label: '已移出', value: 'disabled' }
      ] },
      { name: 'addTime', label: '加入时间', type: 'text' }
    ],
    doc: {
      overview: '管理积分黑名单，风控系统自动记录异常会员，支持手动加入和移出，批量导入黑名单，防止刷单作弊等恶意行为。',
      features: ['手动加入黑名单', '自动风控记录', '黑名单移出操作', '加入原因记录', '操作人记录', '加入时间记录', '手机号标记', '批量导入黑名单', '批量移出黑名单', '黑名单状态查询'],
      tips: ['黑名单会员无法获取和使用积分', '自动风控由系统规则触发', '移出黑名单需谨慎核实']
    }
  },
  {
    key: 'points-cash-rule', path: 'points/cash-rule', name: '抵现规则', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '所属项目', dataIndex: 'project' },
      { title: '渠道', dataIndex: 'channel', render: (v) => ({ pos: 'POS', online: '线上商城' }[v] || v) },
      { title: '最大抵现比例', dataIndex: 'maxRatio' },
      { title: '最大抵现金额', dataIndex: 'maxAmount' },
      { title: '最小参与金额', dataIndex: 'minAmount' },
      { title: '每日最大抵现次数', dataIndex: 'maxTimesPerDay' },
      { title: '有效期起', dataIndex: 'validFrom' },
      { title: '有效期止', dataIndex: 'validTo' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'project', label: '所属项目', type: 'text' },
      { name: 'channel', label: '渠道', type: 'select', options: [
        { label: 'POS', value: 'pos' }, { label: '线上商城', value: 'online' }
      ] },
      { name: 'maxRatio', label: '最大抵现比例', type: 'number' },
      { name: 'maxAmount', label: '最大抵现金额', type: 'number' },
      { name: 'minAmount', label: '最小参与金额', type: 'number' },
      { name: 'maxTimesPerDay', label: '每日最大抵现次数', type: 'number' },
      { name: 'validFrom', label: '有效期起', type: 'text' },
      { name: 'validTo', label: '有效期止', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '积分抵现规则配置，支持POS和线上商城多渠道，配置最大抵现比例、金额、最小参与金额、每日次数限制等多维度规则，灵活控制积分抵现成本。',
      features: ['新增/编辑/删除抵现规则', '多项目支持', 'POS渠道抵现', '线上商城抵现', '最大抵现比例配置', '最大抵现金额配置', '最小参与金额门槛', '每日抵现次数限制', '有效期设置', '规则启停管理'],
      tips: ['抵现比例为积分可抵扣订单金额的百分比', '建议设置最小参与金额避免小额订单滥用', '同一渠道可配置多条规则按优先级生效']
    }
  },
  {
    key: 'points-risk', path: 'points/risk', name: '积分风控规则', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '规则类型', dataIndex: 'ruleType', render: (v) => ({ singleMax: '单笔最大', shopDailyTimes: '同店每日次数', dailyTotal: '每日总次数', dailyMaxAmount: '每日最大金额', sameAmount: '同金额连续', consecutiveDays: '连续消费天数' }[v] || v) },
      { title: '阈值', dataIndex: 'threshold' },
      { title: '处理方式', dataIndex: 'action', render: (v) => ({ none: '不处理', reject: '拒绝', audit: '审核', memberReject: '会员拉黑' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'ruleType', label: '规则类型', type: 'select', options: [
        { label: '单笔最大', value: 'singleMax' }, { label: '同店每日次数', value: 'shopDailyTimes' },
        { label: '每日总次数', value: 'dailyTotal' }, { label: '每日最大金额', value: 'dailyMaxAmount' },
        { label: '同金额连续', value: 'sameAmount' }, { label: '连续消费天数', value: 'consecutiveDays' }
      ] },
      { name: 'threshold', label: '阈值', type: 'number' },
      { name: 'action', label: '处理方式', type: 'select', options: [
        { label: '不处理', value: 'none' }, { label: '拒绝', value: 'reject' },
        { label: '审核', value: 'audit' }, { label: '会员拉黑', value: 'memberReject' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '积分风控规则配置，通过多种风控维度（单笔最大、同店每日次数、每日总次数、每日最大金额、同金额连续、连续消费天数）识别异常积分行为，防止刷单作弊。',
      features: ['新增/编辑/删除风控规则', '单笔最大金额风控', '同店每日次数风控', '每日总次数风控', '每日最大金额风控', '同金额连续交易风控', '连续消费天数风控', '多种处理方式配置', '规则启停管理', '风控阈值灵活配置'],
      tips: ['风控规则建议逐步收紧，避免误杀正常用户', '审核模式下可疑交易需人工复核', '会员拉黑为最严厉处罚，谨慎使用']
    }
  },
  {
    key: 'points-settle-rule', path: 'points/settle-rule', name: '结算规则', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '项目', dataIndex: 'project' },
      { title: '业态', dataIndex: 'businessType' },
      { title: '结算比例', dataIndex: 'settleRatio' },
      { title: '结算日期', dataIndex: 'settleDate' },
      { title: '周期', dataIndex: 'period', render: (v) => ({ weekly: '周结', monthly: '月结' }[v] || v) },
      { title: '优先级', dataIndex: 'priority' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'project', label: '项目', type: 'text' },
      { name: 'businessType', label: '业态', type: 'text' },
      { name: 'settleRatio', label: '结算比例', type: 'number' },
      { name: 'settleDate', label: '结算日期', type: 'text' },
      { name: 'period', label: '周期', type: 'select', options: [
        { label: '周结', value: 'weekly' }, { label: '月结', value: 'monthly' }
      ] },
      { name: 'priority', label: '优先级', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '积分成本结算规则配置，按项目和业态设置不同的结算比例，支持周结和月结两种周期，优先级控制规则生效顺序，实现精细化成本核算。',
      features: ['新增/编辑/删除结算规则', '多项目支持', '多业态配置', '结算比例设置', '周结周期', '月结周期', '结算日期配置', '规则优先级', '规则启停管理', '成本核算支持'],
      tips: ['结算比例为平台与商户间的积分成本分摊比例', '高优先级规则先生效', '结算日期遇节假日自动顺延']
    }
  },
  {
    key: 'points-settle-bill', path: 'points/settle-bill', name: '积分结算单', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '结算单号', dataIndex: 'billNo' },
      { title: '项目', dataIndex: 'project' },
      { title: '商户', dataIndex: 'merchant' },
      { title: '结算周期', dataIndex: 'period' },
      { title: '总积分', dataIndex: 'totalPoints' },
      { title: '结算金额', dataIndex: 'settleAmount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ unsettled: '未结算', settled: '已结算', void: '已作废' }[v] || v) },
      { title: '创建时间', dataIndex: 'createTime' }
    ],
    fields: [
      { name: 'billNo', label: '结算单号', type: 'text', required: true },
      { name: 'project', label: '项目', type: 'text' },
      { name: 'merchant', label: '商户', type: 'text' },
      { name: 'period', label: '结算周期', type: 'text' },
      { name: 'totalPoints', label: '总积分', type: 'number' },
      { name: 'settleAmount', label: '结算金额', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '未结算', value: 'unsettled' }, { label: '已结算', value: 'settled' }, { label: '已作废', value: 'void' }
      ] },
      { name: 'createTime', label: '创建时间', type: 'text' }
    ],
    doc: {
      overview: '按结算规则自动生成积分结算单，可查看积分明细和调整结算金额，支持未结算/已结算/已作废状态，实现平台与商户间的积分成本结算。',
      features: ['自动生成结算单', '按项目和商户结算', '结算周期管理', '总积分统计', '结算金额计算', '结算明细查看', '金额调整功能', '未结算状态', '已结算确认', '作废结算单', '创建时间记录'],
      tips: ['结算单生成后请仔细核对明细', '已结算单不可修改', '作废结算单需重新生成']
    }
  },
  {
    key: 'points-photo', path: 'points/photo', name: '拍照积分记录', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '小票图片', dataIndex: 'image' },
      { title: '消费金额', dataIndex: 'amount' },
      { title: '应得积分', dataIndex: 'points' },
      { title: '门店', dataIndex: 'shop' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待审核', approved: '已通过', rejected: '已拒绝', ai: 'AI已审' }[v] || v) },
      { title: '审核人', dataIndex: 'auditor' },
      { title: '提交时间', dataIndex: 'submitTime' },
      { title: '审核时间', dataIndex: 'auditTime' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'image', label: '小票图片', type: 'text' },
      { name: 'amount', label: '消费金额', type: 'number' },
      { name: 'points', label: '应得积分', type: 'number' },
      { name: 'shop', label: '门店', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待审核', value: 'pending' }, { label: '已通过', value: 'approved' },
        { label: '已拒绝', value: 'rejected' }, { label: 'AI已审', value: 'ai' }
      ] },
      { name: 'auditor', label: '审核人', type: 'text' },
      { name: 'submitTime', label: '提交时间', type: 'text' },
      { name: 'auditTime', label: '审核时间', type: 'text' }
    ],
    doc: {
      overview: '查询客户拍照积分记录，支持后台人工审核和AI智能审核，审核通过后自动发放积分，实现小票拍照积分的全流程管理。',
      features: ['拍照积分记录查询', '小票图片查看', '消费金额识别', '应得积分计算', '门店信息关联', '待审核状态', '人工审核通过', '人工审核拒绝', 'AI智能审核', '审核人记录', '提交时间记录', '审核时间记录'],
      tips: ['AI审核可大幅提升审核效率', '人工审核为最终结果', '拒绝审核需填写拒绝原因']
    }
  },
  {
    key: 'points-ocr-rule', path: 'points/ocr-rule', name: 'OCR识别规则', category: '积分中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '规则名称', dataIndex: 'name' },
      { title: '商户类型', dataIndex: 'shopType' },
      { title: '识别字段', dataIndex: 'fields' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '规则名称', type: 'text', required: true },
      { name: 'shopType', label: '商户类型', type: 'text' },
      { name: 'fields', label: '识别字段', type: 'text' },
      { name: 'template', label: '模板配置', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '灵活配置小票OCR识别规则，针对不同商户类型设置不同的识别字段（金额、日期、小票号、商户名等）和模板，提升识别准确率。',
      features: ['新增/编辑/删除OCR规则', '按商户类型配置', '金额字段识别', '日期字段识别', '小票号字段识别', '商户名字段识别', '模板配置', '规则启停管理', '多规则支持', '识别准确率优化'],
      tips: ['不同商户小票格式不同，需分别配置规则', '模板越精确识别准确率越高', '建议先小范围测试再全面启用']
    }
  },
  // ===== 礼券中心（补充）=====
  {
    key: 'coupon-packs', path: 'coupon/packs', name: '券包管理', category: '礼券中心',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '券包名称', dataIndex: 'name' },
      { title: '总价值', dataIndex: 'totalValue' },
      { title: '售价', dataIndex: 'sellPrice' },
      { title: '积分价', dataIndex: 'pointsPrice' },
      { title: '发行总量', dataIndex: 'quantity' },
      { title: '已售', dataIndex: 'sold' },
      { title: '有效期(天)', dataIndex: 'validDays' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '券包名称', type: 'text', required: true },
      { name: 'coupons', label: '包含券', type: 'textarea' },
      { name: 'totalValue', label: '总价值', type: 'number' },
      { name: 'sellPrice', label: '售价', type: 'number' },
      { name: 'pointsPrice', label: '积分价', type: 'number' },
      { name: 'quantity', label: '发行总量', type: 'number' },
      { name: 'sold', label: '已售', type: 'number' },
      { name: 'validDays', label: '有效期(天)', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '券包管理，支持多张券组合打包售卖或积分兑换，配置券包内容、售价、积分价、发行量和有效期，提升客单价和用户粘性。',
      features: ['新增/编辑/删除券包', '多张券组合打包', '券模板ID列表配置', '每张券数量配置', '总价值计算', '售价设置', '积分兑换价设置', '发行总量控制', '已售数量统计', '有效期天数设置', '券包启停管理', '售卖/兑换两种模式'],
      tips: ['券包内的券在购买后自动发放到账户', '建议设置有吸引力的折扣提升购买意愿', '积分+现金混合模式可灵活配置']
    }
  },
  // ===== 自助积分 =====
  {
    key: 'selfpoints-config', path: 'selfpoints/config', name: '自助积分配置', category: '自助积分',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '配置名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v) => ({ photo: '拍照', ai: 'AI', pay: '支付即积分' }[v] || v) },
      { title: '项目', dataIndex: 'project' },
      { title: '是否开启', dataIndex: 'enabled', render: (v) => (v === 'yes' ? '开启' : '关闭') },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '配置名称', type: 'text', required: true },
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '拍照', value: 'photo' }, { label: 'AI', value: 'ai' }, { label: '支付即积分', value: 'pay' }
      ] },
      { name: 'project', label: '项目', type: 'text' },
      { name: 'enabled', label: '是否开启', type: 'select', options: [
        { label: '开启', value: 'yes' }, { label: '关闭', value: 'no' }
      ] },
      { name: 'wechatMallId', label: '微信商圈ID', type: 'text' },
      { name: 'alipayMallId', label: '支付宝商圈ID', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '自助积分各渠道开关配置，支持拍照积分、AI识别积分、支付即积分三种自助积分方式，按项目配置微信商圈和支付宝商圈ID，实现多渠道自助积分管理。',
      features: ['新增/编辑/删除配置', '拍照积分开关', 'AI识别积分开关', '支付即积分开关', '按项目配置', '微信商圈ID配置', '支付宝商圈ID配置', '渠道启停控制', '多项目支持', '配置状态管理'],
      tips: ['支付即积分需对接微信/支付宝商圈', 'AI识别需配置OCR规则', '建议逐步开启各渠道测试稳定性']
    }
  },
  // ===== 在线商城（补充）=====
  {
    key: 'shop-fullcut', path: 'shop/fullcut', name: '满减活动', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '满减规则', dataIndex: 'rules' },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '结束时间', dataIndex: 'endTime' },
      { title: '适用范围', dataIndex: 'applyRange', render: (v) => ({ all: '全部', category: '分类', goods: '指定商品' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'rules', label: '满减规则', type: 'textarea' },
      { name: 'startTime', label: '开始时间', type: 'text' },
      { name: 'endTime', label: '结束时间', type: 'text' },
      { name: 'applyRange', label: '适用范围', type: 'select', options: [
        { label: '全部', value: 'all' }, { label: '分类', value: 'category' }, { label: '指定商品', value: 'goods' }
      ] },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '商城满减活动配置，支持多门槛满减规则（满X减Y），可设置活动时间和适用范围（全部商品、分类、指定商品），刺激消费提升客单价。',
      features: ['新增/编辑/删除满减活动', '多门槛满减规则配置', '活动开始时间设置', '活动结束时间设置', '全部商品适用', '按分类适用', '指定商品适用', '活动启停管理', '优惠叠加控制', '活动效果统计'],
      tips: ['满减规则支持多阶梯，如满100减10、满200减30', '建议与其他活动错开避免亏损', '适用范围越精确活动效果越可控']
    }
  },
  {
    key: 'shop-presale', path: 'shop/presale', name: '预售活动', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '关联商品', dataIndex: 'goods' },
      { title: '定金', dataIndex: 'depositAmount' },
      { title: '尾款', dataIndex: 'finalAmount' },
      { title: '库存', dataIndex: 'stock' },
      { title: '已售', dataIndex: 'sold' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'goods', label: '关联商品', type: 'text' },
      { name: 'depositAmount', label: '定金', type: 'number' },
      { name: 'finalAmount', label: '尾款', type: 'number' },
      { name: 'depositStartTime', label: '定金开始时间', type: 'text' },
      { name: 'finalPayTime', label: '尾款支付时间', type: 'text' },
      { name: 'stock', label: '库存', type: 'number' },
      { name: 'sold', label: '已售', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '商城预售活动，支持定金+尾款模式，提前锁定销售和备货，配置定金金额、尾款金额、定金支付时间和尾款支付时间，缓解库存压力。',
      features: ['新增/编辑/删除预售活动', '关联预售商品', '定金金额设置', '尾款金额设置', '定金支付开始时间', '尾款支付时间段', '预售库存管理', '已售数量统计', '活动启停管理', '定金膨胀支持', '预售提醒功能'],
      tips: ['预售商品需在尾款支付前备好货', '定金通常不可退还，需明确告知用户', '建议设置定金膨胀优惠提升吸引力']
    }
  },
  {
    key: 'shop-bargain', path: 'shop/bargain', name: '砍价活动', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '商品', dataIndex: 'goods' },
      { title: '原价', dataIndex: 'originalPrice' },
      { title: '底价', dataIndex: 'floorPrice' },
      { title: '助力次数', dataIndex: 'helpCount' },
      { title: '发起次数', dataIndex: 'startedCount' },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '结束时间', dataIndex: 'endTime' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'goods', label: '商品', type: 'text' },
      { name: 'originalPrice', label: '原价', type: 'number' },
      { name: 'floorPrice', label: '底价', type: 'number' },
      { name: 'helpCount', label: '助力次数', type: 'number' },
      { name: 'startedCount', label: '发起次数', type: 'number' },
      { name: 'startTime', label: '开始时间', type: 'text' },
      { name: 'endTime', label: '结束时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '商城砍价活动，会员发起砍价后邀请好友助力砍价，砍到底价后可以优惠价格购买商品，通过社交裂变实现用户增长和销量提升。',
      features: ['新增/编辑/删除砍价活动', '关联活动商品', '商品原价设置', '砍价底价设置', '所需助力次数', '发起次数统计', '活动开始时间', '活动结束时间', '活动启停管理', '砍价进度追踪', '社交分享支持', '防作弊机制'],
      tips: ['底价建议设置在成本线以上', '助力次数设置要合理，太多容易放弃太少没乐趣', '砍价活动有传播效应，建议配合推广资源']
    }
  },
  // ===== 商户营销（补充）=====
  {
    key: 'merchant-sales-report', path: 'merchant/sales-report', name: '销售上报', category: '商户营销',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商户', dataIndex: 'merchant' },
      { title: '上报日期', dataIndex: 'reportDate' },
      { title: '销售金额', dataIndex: 'amount' },
      { title: '订单数', dataIndex: 'orderCount' },
      { title: '产生积分', dataIndex: 'points' },
      { title: '上报人', dataIndex: 'reporter' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ submitted: '已提交', verified: '已核实' }[v] || v) }
    ],
    fields: [
      { name: 'merchant', label: '商户', type: 'text', required: true },
      { name: 'reportDate', label: '上报日期', type: 'text' },
      { name: 'amount', label: '销售金额', type: 'number' },
      { name: 'orderCount', label: '订单数', type: 'number' },
      { name: 'points', label: '产生积分', type: 'number' },
      { name: 'reporter', label: '上报人', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '已提交', value: 'submitted' }, { label: '已核实', value: 'verified' }
      ] }
    ],
    doc: {
      overview: '商户销售数据上报，商户在商户助手端每日上报销售金额、订单数和产生积分，运营后台进行核实确认，为积分结算和销售统计提供数据支撑。',
      features: ['销售数据上报记录', '商户信息关联', '上报日期管理', '销售金额统计', '订单数量统计', '产生积分统计', '上报人记录', '已提交状态', '已核实状态', '数据核实功能', '历史数据查询', '数据导出支持'],
      tips: ['商户应每日按时上报销售数据', '核实后的数据作为结算依据', '建议定期与POS数据对账确保准确性']
    }
  },
  // ===== 在线客服（新增）=====
  {
    key: 'customer-service-chats', path: 'service/chats', name: '在线客服会话', category: '在线客服',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '会员昵称', dataIndex: 'memberNickname' },
      { title: '问题类型', dataIndex: 'questionType' },
      { title: '最新消息', dataIndex: 'lastMessage' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '等待中', processing: '处理中', resolved: '已解决', closed: '已关闭' }[v] || v) },
      { title: '客服人员', dataIndex: 'agent' },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '结束时间', dataIndex: 'endTime' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'memberNickname', label: '会员昵称', type: 'text' },
      { name: 'questionType', label: '问题类型', type: 'select', options: [
        { label: '积分问题', value: 'points' }, { label: '优惠券问题', value: 'coupon' }, { label: '订单问题', value: 'order' },
        { label: '商品问题', value: 'goods' }, { label: '停车问题', value: 'parking' }, { label: '其他', value: 'other' }
      ] },
      { name: 'lastMessage', label: '最新消息', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '等待中', value: 'pending' }, { label: '处理中', value: 'processing' },
        { label: '已解决', value: 'resolved' }, { label: '已关闭', value: 'closed' }
      ] },
      { name: 'agent', label: '客服人员', type: 'text' },
      { name: 'startTime', label: '开始时间', type: 'text' },
      { name: 'endTime', label: '结束时间', type: 'text' },
      { name: 'replyContent', label: '回复内容', type: 'textarea' }
    ],
    doc: {
      overview: '在线客服会话管理是客服团队处理会员咨询的核心工作台，支持查看所有会话列表、实时响应会员问题、调用快捷回复、转接人工客服，以及管理会话生命周期。参考有赞客服管理设计，左侧会话列表、右侧聊天窗口的经典布局。',
      features: ['会话列表实时刷新', '会员信息快速查看', '问题类型分类', '快捷回复调用', '人工客服转接', '会话状态管理', '聊天记录保存', '消息已读标记', '会话结束评价', '客服工作量统计', '会话标签管理', '敏感词过滤'],
      tips: ['优先处理等待中的会话，提升会员体验', '使用快捷回复提高响应效率', '及时关闭已解决的会话', '定期统计客服工作量优化排班']
    }
  },
  {
    key: 'ai-knowledge-base', path: 'service/ai-kb', name: 'AI知识库', category: '在线客服',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '问题标题', dataIndex: 'title' },
      { title: '问题分类', dataIndex: 'category' },
      { title: '标准回答', dataIndex: 'answer', render: (v) => String(v).substring(0, 30) + '...' },
      { title: '相似问法数量', dataIndex: 'similarCount' },
      { title: '使用次数', dataIndex: 'usedCount' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'title', label: '问题标题', type: 'text', required: true },
      { name: 'category', label: '问题分类', type: 'select', options: [
        { label: '积分相关', value: 'points' }, { label: '优惠券相关', value: 'coupon' }, { label: '订单相关', value: 'order' },
        { label: '商品相关', value: 'goods' }, { label: '停车相关', value: 'parking' }, { label: '会员相关', value: 'member' }
      ] },
      { name: 'answer', label: '标准回答', type: 'textarea', required: true },
      { name: 'similarQuestions', label: '相似问法', type: 'textarea' },
      { name: 'keywords', label: '关键词', type: 'text' },
      { name: 'usedCount', label: '使用次数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: 'AI知识库是智能客服的核心组件，用于管理常见问题的标准回答和相似问法。通过训练大模型，让AI客服能够理解会员的自然语言提问，并匹配到最相关的知识条目进行自动回复。参考有赞智能客服知识库设计，支持问题分类、关键词匹配、相似问法扩展。',
      features: ['问题分类管理', '标准回答配置', '相似问法扩展', '关键词标签', '知识条目搜索', '使用次数统计', '版本管理', 'AI训练触发', '回答效果评估', '批量导入导出', '知识推荐', '智能联想'],
      tips: ['标准回答要简洁明了，避免冗长', '相似问法要覆盖常见表达方式', '定期根据实际对话补充新问题', '关注使用次数低的知识，优化回答质量']
    }
  },
  // ===== 线上商城（新增）=====
  {
    key: 'shop-carts', path: 'shop/carts', name: '购物车管理', category: '在线商城',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '商品', dataIndex: 'goods' },
      { title: '规格', dataIndex: 'specs' },
      { title: '数量', dataIndex: 'quantity' },
      { title: '单价', dataIndex: 'price' },
      { title: '优惠信息', dataIndex: 'discount' },
      { title: '添加时间', dataIndex: 'addTime' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ active: '有效', expired: '已失效', deleted: '已删除' }[v] || v) }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'goods', label: '商品', type: 'text', required: true },
      { name: 'specs', label: '规格', type: 'text' },
      { name: 'quantity', label: '数量', type: 'number', required: true },
      { name: 'price', label: '单价', type: 'number' },
      { name: 'discount', label: '优惠信息', type: 'text' },
      { name: 'addTime', label: '添加时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '有效', value: 'active' }, { label: '已失效', value: 'expired' }, { label: '已删除', value: 'deleted' }
      ] }
    ],
    doc: {
      overview: '购物车管理是在线商城的核心功能，支持会员将商品加入购物车、管理购物车商品数量、查看优惠信息、批量结算。参考有赞商城购物车设计，支持商品失效处理、促销信息实时更新、多商品合并结算。',
      features: ['商品加入购物车', '数量增减调整', '商品规格选择', '优惠信息展示', '失效商品处理', '批量结算', '购物车清空', '价格实时计算', '促销活动关联', '多门店购物车', '购物车有效期', '购物车营销'],
      tips: ['购物车商品价格会实时同步商品最新价格', '商品下架或库存不足会自动标记为失效', '建议定期清理长时间未结算的购物车']
    }
  },
  // ===== 地产积分（新增）=====
  {
    key: 'points-approval', path: 'property/points-approval', name: '积分审批', category: '地产积分',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '任务类型', dataIndex: 'taskType' },
      { title: '任务名称', dataIndex: 'taskName' },
      { title: '申请积分', dataIndex: 'points' },
      { title: '提交时间', dataIndex: 'submitTime' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待审核', approved: '已通过', rejected: '已驳回' }[v] || v) },
      { title: '审核人', dataIndex: 'auditor' },
      { title: '审核时间', dataIndex: 'auditTime' },
      { title: '审核备注', dataIndex: 'remark' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'taskType', label: '任务类型', type: 'select', options: [
        { label: '发言建议', value: 'suggestion' }, { label: '朋友圈转发', value: 'share' }, { label: '关注官号', value: 'follow' },
        { label: '暖场活动', value: 'warmup' }, { label: '圈层活动', value: 'circle' }, { label: '推荐到访', value: 'visit' },
        { label: '推荐签约', value: 'sign' }, { label: '新房置业', value: 'purchase' }
      ] },
      { name: 'taskName', label: '任务名称', type: 'text' },
      { name: 'points', label: '申请积分', type: 'number', required: true },
      { name: 'submitTime', label: '提交时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待审核', value: 'pending' }, { label: '已通过', value: 'approved' }, { label: '已驳回', value: 'rejected' }
      ] },
      { name: 'auditor', label: '审核人', type: 'text' },
      { name: 'auditTime', label: '审核时间', type: 'text' },
      { name: 'remark', label: '审核备注', type: 'textarea' }
    ],
    doc: {
      overview: '积分审批是地产积分系统的核心功能，用于审核需要人工确认的积分任务申请，包括发言建议、朋友圈转发、暖场活动参与等8类任务。审批通过后积分自动发放，并通过微信公众号通知会员。',
      features: ['任务类型分类', '积分申请列表', '审核流程管理', '批量审核', '审核备注', '审批日志', '公众号通知', '积分发放记录', '任务证明查看', '驳回原因记录', '审批统计', '超时提醒'],
      tips: ['审核前请查看会员提交的任务证明材料', '驳回时请填写明确的驳回原因', '注意积分任务的上限规则', '建议设置审核时限避免会员等待']
    }
  },
  // ===== 公域运营（新增）=====
  {
    key: 'douyin-member-pass', path: 'public-domain/douyin-pass', name: '抖音会员通', category: '公域运营',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '抖音用户', dataIndex: 'douyinUser' },
      { title: '会员', dataIndex: 'member' },
      { title: '绑定时间', dataIndex: 'bindTime' },
      { title: '同步状态', dataIndex: 'syncStatus', render: (v) => ({ synced: '已同步', pending: '待同步', failed: '同步失败' }[v] || v) },
      { title: '核销积分', dataIndex: 'verificationPoints' },
      { title: '场景促销', dataIndex: 'promotion' },
      { title: '操作', dataIndex: 'actions' }
    ],
    fields: [
      { name: 'douyinUser', label: '抖音用户', type: 'text', required: true },
      { name: 'member', label: '会员', type: 'text' },
      { name: 'bindTime', label: '绑定时间', type: 'text' },
      { name: 'syncStatus', label: '同步状态', type: 'select', options: [
        { label: '已同步', value: 'synced' }, { label: '待同步', value: 'pending' }, { label: '同步失败', value: 'failed' }
      ] },
      { name: 'verificationPoints', label: '核销积分', type: 'number' },
      { name: 'promotion', label: '场景促销', type: 'text' },
      { name: 'remark', label: '备注', type: 'textarea' }
    ],
    doc: {
      overview: '抖音会员通实现抖音平台与会员系统的打通，支持抖音用户注册成为会员、会员信息同步、抖音优惠券核销自动积分、场景促销活动推送。参考有赞抖音小程序设计，实现公域私域联动运营。',
      features: ['抖音用户绑定', '会员信息同步', '券核销自动积分', '场景促销推送', '绑定记录管理', '同步状态监控', '数据统计分析', '解绑操作', '批量导入', '异常处理', '接口日志', '权限控制'],
      tips: ['确保抖音开放平台配置正确', '关注同步状态及时处理失败记录', '核销积分规则需与抖音活动匹配']
    }
  },
  {
    key: 'xiaohongshu-operations', path: 'public-domain/xhs', name: '小红书运营', category: '公域运营',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '活动类型', dataIndex: 'type', render: (v) => ({ register: '注册引流', coupon: '本地生活券', transaction: '交易打通' }[v] || v) },
      { title: '发布时间', dataIndex: 'publishTime' },
      { title: '参与人数', dataIndex: 'participantCount' },
      { title: '引流注册数', dataIndex: 'registerCount' },
      { title: '券核销数', dataIndex: 'verificationCount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ active: '进行中', ended: '已结束', draft: '草稿' }[v] || v) }
    ],
    fields: [
      { name: 'name', label: '活动名称', type: 'text', required: true },
      { name: 'type', label: '活动类型', type: 'select', options: [
        { label: '注册引流', value: 'register' }, { label: '本地生活券', value: 'coupon' }, { label: '交易打通', value: 'transaction' }
      ] },
      { name: 'publishTime', label: '发布时间', type: 'text' },
      { name: 'participantCount', label: '参与人数', type: 'number' },
      { name: 'registerCount', label: '引流注册数', type: 'number' },
      { name: 'verificationCount', label: '券核销数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '进行中', value: 'active' }, { label: '已结束', value: 'ended' }, { label: '草稿', value: 'draft' }
      ] },
      { name: 'couponTemplate', label: '关联券模板', type: 'text' },
      { name: 'remark', label: '备注', type: 'textarea' }
    ],
    doc: {
      overview: '小红书运营管理实现小红书平台会员引流、本地生活券管理、交易系统打通，支持多入口卖券、商户端闭环核销。参考有赞小红书小程序设计，实现内容种草到交易转化的完整链路。',
      features: ['注册引流活动', '本地生活券管理', '交易系统打通', '多入口卖券', '商户闭环核销', '活动数据统计', '引流效果分析', '内容同步', '粉丝运营', '数据报表', '对账管理', '异常处理'],
      tips: ['活动名称要吸引眼球，便于传播', '券核销数据要及时核对', '关注引流注册转化率']
    }
  },
  // ===== 商户营销（新增）=====
  {
    key: 'merchant-notifications', path: 'merchant/notifications', name: '商户通知', category: '商户营销',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '通知标题', dataIndex: 'title' },
      { title: '通知类型', dataIndex: 'type', render: (v) => ({ system: '系统通知', activity: '活动通知', settlement: '结算通知', training: '培训通知' }[v] || v) },
      { title: '目标商户', dataIndex: 'targetMerchant' },
      { title: '发送时间', dataIndex: 'sendTime' },
      { title: '阅读状态', dataIndex: 'readStatus', render: (v) => (v === 'read' ? '已读' : '未读') },
      { title: '发送渠道', dataIndex: 'channel', render: (v) => ({ wechat: '微信', sms: '短信', app: '商户助手' }[v] || v) }
    ],
    fields: [
      { name: 'title', label: '通知标题', type: 'text', required: true },
      { name: 'type', label: '通知类型', type: 'select', options: [
        { label: '系统通知', value: 'system' }, { label: '活动通知', value: 'activity' },
        { label: '结算通知', value: 'settlement' }, { label: '培训通知', value: 'training' }
      ] },
      { name: 'content', label: '通知内容', type: 'textarea', required: true },
      { name: 'targetMerchant', label: '目标商户', type: 'text' },
      { name: 'sendTime', label: '发送时间', type: 'text' },
      { name: 'channel', label: '发送渠道', type: 'select', options: [
        { label: '微信', value: 'wechat' }, { label: '短信', value: 'sms' }, { label: '商户助手', value: 'app' }
      ] },
      { name: 'readStatus', label: '阅读状态', type: 'select', options: [
        { label: '已读', value: 'read' }, { label: '未读', value: 'unread' }
      ] }
    ],
    doc: {
      overview: '商户通知管理用于向商户发送各类通知消息，包括系统公告、活动通知、结算通知、培训通知等，支持微信、短信、商户助手APP多渠道发送，并跟踪阅读状态。参考有赞店铺消息设计，实现商户信息触达闭环。',
      features: ['通知模板管理', '多渠道发送', '商户定向发送', '阅读状态跟踪', '发送记录管理', '通知统计', '批量发送', '定时发送', '撤回功能', '附件支持', '消息分类', '权限控制'],
      tips: ['重要通知建议多渠道发送', '发送前检查目标商户范围', '关注阅读率及时跟进未读商户']
    }
  },
  {
    key: 'merchant-training', path: 'merchant/training', name: '商户培训', category: '商户营销',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '培训标题', dataIndex: 'title' },
      { title: '培训分类', dataIndex: 'category', render: (v) => ({ operation: '操作培训', policy: '政策解读', marketing: '营销培训', system: '系统培训' }[v] || v) },
      { title: '培训形式', dataIndex: 'format', render: (v) => ({ online: '线上', offline: '线下', video: '视频' }[v] || v) },
      { title: '培训时间', dataIndex: 'trainingTime' },
      { title: '参与商户数', dataIndex: 'participantCount' },
      { title: '完成率', dataIndex: 'completionRate', render: (v) => v + '%' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ pending: '待发布', published: '已发布', ended: '已结束' }[v] || v) }
    ],
    fields: [
      { name: 'title', label: '培训标题', type: 'text', required: true },
      { name: 'category', label: '培训分类', type: 'select', options: [
        { label: '操作培训', value: 'operation' }, { label: '政策解读', value: 'policy' },
        { label: '营销培训', value: 'marketing' }, { label: '系统培训', value: 'system' }
      ] },
      { name: 'format', label: '培训形式', type: 'select', options: [
        { label: '线上', value: 'online' }, { label: '线下', value: 'offline' }, { label: '视频', value: 'video' }
      ] },
      { name: 'content', label: '培训内容', type: 'textarea', required: true },
      { name: 'trainingTime', label: '培训时间', type: 'text' },
      { name: 'materials', label: '培训资料', type: 'text' },
      { name: 'participantCount', label: '参与商户数', type: 'number' },
      { name: 'completionRate', label: '完成率', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '待发布', value: 'pending' }, { label: '已发布', value: 'published' }, { label: '已结束', value: 'ended' }
      ] }
    ],
    doc: {
      overview: '商户培训管理用于创建和管理面向商户的培训内容，支持线上、线下、视频等多种培训形式，跟踪商户参与情况和完成率。参考有赞商家学院设计，帮助商户提升运营能力。',
      features: ['培训内容管理', '培训分类', '多种培训形式', '培训资料上传', '商户报名', '参与统计', '完成率跟踪', '培训评价', '培训证书', '签到管理', '数据报表', '培训计划'],
      tips: ['培训内容要实用，贴近商户实际操作', '定期开展培训提升商户能力', '关注完成率优化培训形式']
    }
  },
  // ===== 内容管理（新增）=====
  {
    key: 'content-articles', path: 'content/articles', name: '图文资讯', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '资讯标题', dataIndex: 'title' },
      { title: '资讯分类', dataIndex: 'category', render: (v) => ({ news: '商场资讯', activity: '活动预告', brand: '品牌动态', life: '生活方式' }[v] || v) },
      { title: '封面图片', dataIndex: 'coverImage', render: (v) => v ? <img src={v} style={{ width: 50, height: 50 }} /> : '-' },
      { title: '发布时间', dataIndex: 'publishTime' },
      { title: '阅读量', dataIndex: 'readCount' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ draft: '草稿', published: '已发布', offline: '已下线' }[v] || v) }
    ],
    fields: [
      { name: 'title', label: '资讯标题', type: 'text', required: true },
      { name: 'category', label: '资讯分类', type: 'select', options: [
        { label: '商场资讯', value: 'news' }, { label: '活动预告', value: 'activity' },
        { label: '品牌动态', value: 'brand' }, { label: '生活方式', value: 'life' }
      ] },
      { name: 'coverImage', label: '封面图片', type: 'text' },
      { name: 'content', label: '资讯内容', type: 'textarea', required: true },
      { name: 'publishTime', label: '发布时间', type: 'text' },
      { name: 'readCount', label: '阅读量', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '草稿', value: 'draft' }, { label: '已发布', value: 'published' }, { label: '已下线', value: 'offline' }
      ] }
    ],
    doc: {
      overview: '图文资讯管理用于发布和管理商场的资讯内容，包括商场动态、活动预告、品牌资讯、生活方式等，支持富文本编辑、封面图上传、分类管理。参考有赞微页面设计，打造优质内容运营能力。',
      features: ['资讯分类管理', '富文本编辑', '封面图上传', '发布时间设置', '阅读量统计', '状态管理', '内容审核', '版本管理', '分享功能', '数据统计', '批量操作', 'SEO优化'],
      tips: ['封面图要吸引人，提高点击率', '资讯内容要优质，提升阅读体验', '定期更新保持内容新鲜感']
    }
  },
  {
    key: 'content-posters', path: 'content/posters', name: '海报管理', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '海报名称', dataIndex: 'name' },
      { title: '海报分类', dataIndex: 'category', render: (v) => ({ activity: '活动海报', promotion: '促销海报', brand: '品牌海报', member: '会员海报' }[v] || v) },
      { title: '海报图片', dataIndex: 'image', render: (v) => v ? <img src={v} style={{ width: 50, height: 50 }} /> : '-' },
      { title: '关联活动', dataIndex: 'activity' },
      { title: '创建时间', dataIndex: 'createTime' },
      { title: '使用次数', dataIndex: 'usedCount' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '海报名称', type: 'text', required: true },
      { name: 'category', label: '海报分类', type: 'select', options: [
        { label: '活动海报', value: 'activity' }, { label: '促销海报', value: 'promotion' },
        { label: '品牌海报', value: 'brand' }, { label: '会员海报', value: 'member' }
      ] },
      { name: 'image', label: '海报图片', type: 'text', required: true },
      { name: 'activity', label: '关联活动', type: 'text' },
      { name: 'createTime', label: '创建时间', type: 'text' },
      { name: 'usedCount', label: '使用次数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '海报管理用于管理活动海报、促销海报、品牌海报、会员海报等视觉物料，支持图片上传、分类管理、关联活动、使用统计。参考有赞海报中心设计，为营销活动提供专业视觉支持。',
      features: ['海报模板库', '自定义设计', '图片上传', '分类管理', '活动关联', '使用统计', '海报下载', '二维码生成', '分享功能', '版本管理', '批量操作', '权限控制'],
      tips: ['海报设计要符合品牌调性', '关联活动便于数据追踪', '定期清理过期海报']
    }
  },
  // ===== 小程序运营（新增）=====
  {
    key: 'search-config', path: 'applet/search', name: '搜索管理', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '搜索关键词', dataIndex: 'keyword' },
      { title: '搜索类型', dataIndex: 'type', render: (v) => ({ hot: '热门搜索', recommend: '推荐搜索', custom: '自定义' }[v] || v) },
      { title: '关联内容', dataIndex: 'target' },
      { title: '排序权重', dataIndex: 'weight' },
      { title: '点击次数', dataIndex: 'clickCount' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'keyword', label: '搜索关键词', type: 'text', required: true },
      { name: 'type', label: '搜索类型', type: 'select', options: [
        { label: '热门搜索', value: 'hot' }, { label: '推荐搜索', value: 'recommend' }, { label: '自定义', value: 'custom' }
      ] },
      { name: 'target', label: '关联内容', type: 'text' },
      { name: 'weight', label: '排序权重', type: 'number' },
      { name: 'clickCount', label: '点击次数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '搜索管理用于配置小程序的搜索功能，包括热门搜索词、推荐搜索词、自定义搜索词，支持排序权重设置和点击数据统计。参考有赞搜索管理设计，提升会员搜索体验和内容发现效率。',
      features: ['关键词管理', '搜索类型分类', '关联内容配置', '排序权重', '点击数据统计', '热门词自动生成', '搜索联想', '搜索历史', '搜索统计', '批量导入', '权限控制', '数据导出'],
      tips: ['定期更新热门搜索词', '设置合理的排序权重', '关注搜索转化率']
    }
  },
  {
    key: 'audience-segment', path: 'applet/audience', name: '人群定向', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '人群名称', dataIndex: 'name' },
      { title: '人群类型', dataIndex: 'type', render: (v) => ({ tag: '标签人群', behavior: '行为人群', value: '价值人群', custom: '自定义人群' }[v] || v) },
      { title: '人群规模', dataIndex: 'size' },
      { title: '创建时间', dataIndex: 'createTime' },
      { title: '更新时间', dataIndex: 'updateTime' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '人群名称', type: 'text', required: true },
      { name: 'type', label: '人群类型', type: 'select', options: [
        { label: '标签人群', value: 'tag' }, { label: '行为人群', value: 'behavior' },
        { label: '价值人群', value: 'value' }, { label: '自定义人群', value: 'custom' }
      ] },
      { name: 'conditions', label: '筛选条件', type: 'textarea', required: true },
      { name: 'size', label: '人群规模', type: 'number' },
      { name: 'createTime', label: '创建时间', type: 'text' },
      { name: 'updateTime', label: '更新时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '人群定向管理用于创建和管理不同类型的会员人群，支持标签人群、行为人群、价值人群、自定义人群，为广告推广、精准营销提供人群基础。参考有赞广告投放人群定向设计，实现千人千面的个性化运营。',
      features: ['人群类型分类', '多维度筛选', '人群规模预估', '人群包管理', '人群交集并集', '人群更新', '人群导出', '人群标签', '行为分析', '价值分层', '自定义规则', '数据统计'],
      tips: ['人群定义要清晰，便于运营使用', '定期更新人群数据', '结合营销活动使用人群定向']
    }
  },
  {
    key: 'project-management', path: 'system/projects', name: '项目管理', category: '系统管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '项目名称', dataIndex: 'name' },
      { title: '项目编码', dataIndex: 'code' },
      { title: '业态', dataIndex: 'businessType', render: (v) => ({ shopping: '购物中心', scenic: '景区街区', mixed: '综合体', property: '地产' }[v] || v) },
      { title: '地址', dataIndex: 'address' },
      { title: '管理员', dataIndex: 'adminName' },
      { title: '会员数', dataIndex: 'memberCount' },
      { title: '数据隔离', dataIndex: 'dataIsolation', render: (v) => (v === 'enabled' ? '已启用' : '未启用') },
      { title: '计费模式', dataIndex: 'billingMode', render: (v) => ({ full: '全功能计费', basic: '基础版计费', custom: '自定义计费' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => ({ enabled: '启用', disabled: '禁用', trial: '试用中' }[v] || v) },
      { title: '创建时间', dataIndex: 'createdAt' }
    ],
    fields: [
      { name: 'name', label: '项目名称', type: 'text', required: true },
      { name: 'code', label: '项目编码', type: 'text', required: true },
      { name: 'businessType', label: '业态类型', type: 'select', options: [
        { label: '购物中心', value: 'shopping' }, { label: '景区街区', value: 'scenic' },
        { label: '综合体', value: 'mixed' }, { label: '地产', value: 'property' }
      ] },
      { name: 'address', label: '项目地址', type: 'text' },
      { name: 'cooperationParty', label: '合作方', type: 'text' },
      { name: 'contactPerson', label: '联系人', type: 'text' },
      { name: 'contactPhone', label: '联系电话', type: 'text' },
      { name: 'adminName', label: '项目管理员', type: 'text' },
      { name: 'adminAccount', label: '管理员账号', type: 'text' },
      { name: 'memberCount', label: '当前会员数', type: 'number' },
      { name: 'maxMembers', label: '会员上限', type: 'number' },
      { name: 'dataIsolation', label: '数据隔离', type: 'select', options: [
        { label: '已启用', value: 'enabled' }, { label: '未启用', value: 'disabled' }
      ] },
      { name: 'isolationRule', label: '隔离规则说明', type: 'textarea' },
      { name: 'billingMode', label: '计费模式', type: 'select', options: [
        { label: '全功能计费', value: 'full' }, { label: '基础版计费', value: 'basic' }, { label: '自定义计费', value: 'custom' }
      ] },
      { name: 'billingConfig', label: '计费配置说明', type: 'textarea' },
      { name: 'enabledModules', label: '启用功能模块', type: 'textarea' },
      { name: 'resourceQuota', label: '资源配额', type: 'textarea' },
      { name: 'contractPeriod', label: '合同期限', type: 'text' },
      { name: 'remark', label: '备注', type: 'textarea' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }, { label: '试用中', value: 'trial' }
      ] },
      { name: 'createdAt', label: '创建时间', type: 'text' }
    ],
    doc: {
      overview: '项目管理是集团多项目运营的核心管理模块，支持新增、编辑、禁用商业项目，为每个项目配置独立的数据隔离规则、管理权限、计费模式和功能模块。系统支持壹中心、碧湘楚巷等多个商业项目同时运营，各项目数据互不干扰、权限独立管控。项目管理与系统用户、角色权限、数据分析等模块深度联动，确保集团级多项目运营的规范性和安全性。',
      features: ['支持新增商业项目，填写项目名称、编码、业态、地址、合作方等基础信息，生成独立项目租户', '支持对已创建项目的基础信息进行修改、更新，同步更新前端展示内容', '支持对项目进行启停控制，禁用后项目相关前端功能全部关闭，数据保留', '配置不同项目的数据隔离规则，确保壹中心、碧湘楚巷等项目数据互不干扰', '为不同项目分配独立的管理员账号，配置仅可查看本项目数据的权限', '跨项目汇总全平台核心运营数据，生成集团级总览报表', '为不同项目配置独立的功能计费、资源配额规则，适配不同项目合作模式', '支持按业态类型分类：购物中心、景区街区、综合体、地产', '管理项目合同期限和资源配额，控制各项目的功能模块开通情况', '与系统用户模块联动，项目管理员仅可查看和管理本项目数据', '与角色权限模块联动，支持按项目维度配置菜单和数据权限', '与数据分析模块联动，支持单项目报表和跨项目汇总报表'],
      tips: ['新增项目前请确认项目编码唯一性，编码创建后不可修改', '数据隔离规则启用后不可随意关闭，关闭可能导致数据混淆', '禁用项目前请确认无正在进行的营销活动和待处理订单', '计费模式变更需与商务确认，避免产生计费争议', '建议为每个项目指定至少一名管理员，确保项目运营正常', '资源配额设置需根据项目规模合理规划，避免资源浪费或不足']
    }
  },
  {
    key: 'restaurant-cuisine', path: 'restaurant/cuisine', name: '餐饮菜系管理', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '菜系名称', dataIndex: 'name' },
      { title: '图标', dataIndex: 'icon' },
      { title: '排序', dataIndex: 'sort' },
      { title: '关联商户数', dataIndex: 'shopCount' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '启用' : '禁用') }
    ],
    fields: [
      { name: 'name', label: '菜系名称', type: 'text', required: true },
      { name: 'icon', label: '菜系图标', type: 'text' },
      { name: 'description', label: '菜系描述', type: 'textarea' },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'shopCount', label: '关联商户数', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS }
    ],
    doc: {
      overview: '餐饮菜系管理用于维护商场餐饮商户的菜系分类体系，支持新增、编辑、删除菜系分类，为餐饮商户绑定对应菜系。菜系分类在小程序餐饮美食专区展示，帮助用户快速按菜系筛选餐厅。与商户管理、小程序餐饮导览深度联动，是餐饮美食导览功能的数据基础。',
      features: ['支持新增、编辑、删除餐饮菜系分类', '配置菜系名称、图标、描述，提升小程序展示效果', '支持菜系排序，控制小程序端展示顺序', '统计关联商户数，掌握各菜系下的商户规模', '菜系启用/禁用管理，禁用后前端不再展示', '与商户管理联动，商户绑定菜系后自动更新统计', '与小程序餐饮导览联动，按菜系筛选展示餐厅'],
      tips: ['菜系名称建议使用通用分类如湘菜、川菜、粤菜、日料等', '图标建议使用统一风格的SVG或PNG图片', '排序值越小越靠前展示']
    }
  },
  {
    key: 'restaurant-dishes', path: 'restaurant/dishes', name: '餐饮菜品管理', category: '内容管理',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '菜品名称', dataIndex: 'name' },
      { title: '所属商户', dataIndex: 'shopName' },
      { title: '菜系', dataIndex: 'cuisine' },
      { title: '价格(元)', dataIndex: 'price' },
      { title: '推荐', dataIndex: 'isRecommend', render: (v) => (v === 'yes' ? '推荐' : '普通') },
      { title: '排序', dataIndex: 'sort' },
      { title: '状态', dataIndex: 'status', render: (v) => (v === 'enabled' ? '上架' : '下架') }
    ],
    fields: [
      { name: 'name', label: '菜品名称', type: 'text', required: true },
      { name: 'shopName', label: '所属商户', type: 'text', required: true },
      { name: 'cuisine', label: '所属菜系', type: 'text' },
      { name: 'mainImage', label: '菜品主图', type: 'text' },
      { name: 'price', label: '价格(元)', type: 'number' },
      { name: 'description', label: '菜品介绍', type: 'textarea' },
      { name: 'ingredients', label: '主要食材', type: 'text' },
      { name: 'taste', label: '口味', type: 'select', options: [
        { label: '不辣', value: 'mild' }, { label: '微辣', value: 'spicy' }, { label: '中辣', value: 'medium' }, { label: '特辣', value: 'hot' }
      ] },
      { name: 'isRecommend', label: '是否推荐', type: 'select', options: [
        { label: '推荐', value: 'yes' }, { label: '普通', value: 'no' }
      ] },
      { name: 'sort', label: '排序', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '上架', value: 'enabled' }, { label: '下架', value: 'disabled' }
      ] }
    ],
    doc: {
      overview: '餐饮菜品管理用于维护商场餐饮商户的推荐菜品信息，为每个商户配置推荐菜品、菜品图片、价格、介绍等内容。菜品信息在小程序商户详情页和餐饮美食专区展示，帮助用户了解商户特色和推荐菜。与商户管理、餐饮菜系管理深度联动，是餐饮美食导览功能的重要组成部分。',
      features: ['支持新增、编辑、删除餐饮菜品信息', '配置菜品名称、主图、价格、介绍，提升展示效果', '关联所属商户和菜系，便于按商户和菜系分类展示', '支持口味标签：不辣、微辣、中辣、特辣', '支持推荐标记，推荐菜品在小程序端优先展示', '菜品上架/下架管理，灵活控制展示状态', '排序管理，控制同商户下菜品展示顺序', '与商户管理联动，从商户详情可查看和管理菜品', '与餐饮菜系联动，按菜系筛选展示菜品'],
      tips: ['菜品主图建议使用高清实拍图片，提升展示效果和用户食欲', '推荐菜品建议选择商户招牌菜和人气菜', '价格建议标注实际售价，避免与线下价格不一致', '定期更新菜品信息，确保与商户实际菜单同步']
    }
  },
  {
    key: 'member-merge', path: 'member/merge', name: '会员合并', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '主账号', dataIndex: 'mainAccount' },
      { title: '被合并账号', dataIndex: 'mergedAccount' },
      { title: '合并原因', dataIndex: 'reason' },
      { title: '合并前积分', dataIndex: 'pointsBefore' },
      { title: '合并后积分', dataIndex: 'pointsAfter' },
      { title: '操作人', dataIndex: 'operator' },
      { title: '合并时间', dataIndex: 'mergedAt' },
      { title: '状态', dataIndex: 'status', render: (v) => ({ done: '已完成', pending: '待确认', cancelled: '已取消' }[v] || v) }
    ],
    fields: [
      { name: 'mainAccount', label: '主账号(手机号)', type: 'text', required: true },
      { name: 'mergedAccount', label: '被合并账号(手机号)', type: 'text', required: true },
      { name: 'reason', label: '合并原因', type: 'select', options: [
        { label: '重复注册', value: 'duplicate' }, { label: '换号合并', value: 'phoneChange' }, { label: '人工申请', value: 'manual' }
      ] },
      { name: 'pointsBefore', label: '主账号合并前积分', type: 'number' },
      { name: 'pointsAfter', label: '合并后积分', type: 'number' },
      { name: 'remark', label: '备注', type: 'textarea' },
      { name: 'operator', label: '操作人', type: 'text' },
      { name: 'mergedAt', label: '合并时间', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '已完成', value: 'done' }, { label: '待确认', value: 'pending' }, { label: '已取消', value: 'cancelled' }
      ] }
    ],
    doc: {
      overview: '会员合并用于处理会员重复注册的场景，支持将多个会员账号合并为一个主账号，整合全量数据（积分、消费记录、优惠券等），保留主账号并归集被合并账号的所有资产。系统记录完整的合并日志，包括合并前后积分变动、操作人和合并原因，确保数据可追溯。会员合并与会员档案、会员积分账户、会员资产等模块深度联动，合并后自动更新相关数据。',
      features: ['支持将重复注册的会员账号合并为主账号', '自动整合被合并账号的积分、消费记录、优惠券等全量数据', '合并原因分类：重复注册、换号合并、人工申请', '记录合并前后积分变动，确保资产数据准确', '记录操作人信息，明确合并操作的责任主体', '支持待确认状态，重要合并操作需二次确认', '完整的合并日志记录，便于审计和数据追溯', '与会员档案联动，合并后自动更新会员档案信息', '与会员积分账户联动，合并后自动汇总积分余额', '与会员资产联动，合并后自动整合优惠券等资产'],
      tips: ['合并操作不可逆，执行前请仔细核对主账号和被合并账号', '建议先备份数据再执行合并操作', '合并后被合并账号将无法登录，请提前通知会员', '大额积分合并建议由主管审批后执行']
    }
  },
  {
    key: 'upgrade-gift-log', path: 'member/upgrade-gift-log', name: '升级礼包发放记录', category: '会员数字化',
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '会员', dataIndex: 'member' },
      { title: '手机号', dataIndex: 'phone' },
      { title: '原等级', dataIndex: 'fromLevel' },
      { title: '新等级', dataIndex: 'toLevel' },
      { title: '发放积分', dataIndex: 'points' },
      { title: '发放优惠券', dataIndex: 'coupons' },
      { title: '停车券(小时)', dataIndex: 'parkingHours' },
      { title: '触发方式', dataIndex: 'triggerType', render: (v) => ({ auto: '自动升级', manual: '手动补发' }[v] || v) },
      { title: '状态', dataIndex: 'status', render: (v) => ({ success: '发放成功', failed: '发放失败', partial: '部分成功' }[v] || v) },
      { title: '操作人', dataIndex: 'operator' },
      { title: '发放时间', dataIndex: 'createdAt' }
    ],
    fields: [
      { name: 'member', label: '会员', type: 'text', required: true },
      { name: 'phone', label: '手机号', type: 'text', required: true },
      { name: 'fromLevel', label: '原等级', type: 'text' },
      { name: 'toLevel', label: '新等级', type: 'text' },
      { name: 'points', label: '发放积分', type: 'number' },
      { name: 'coupons', label: '发放优惠券', type: 'textarea' },
      { name: 'parkingHours', label: '停车券(小时)', type: 'number' },
      { name: 'triggerType', label: '触发方式', type: 'select', options: [
        { label: '自动升级', value: 'auto' }, { label: '手动补发', value: 'manual' }
      ] },
      { name: 'status', label: '发放状态', type: 'select', options: [
        { label: '发放成功', value: 'success' }, { label: '发放失败', value: 'failed' }, { label: '部分成功', value: 'partial' }
      ] },
      { name: 'failReason', label: '失败原因', type: 'textarea' },
      { name: 'operator', label: '操作人', type: 'text' },
      { name: 'remark', label: '备注', type: 'textarea' },
      { name: 'createdAt', label: '发放时间', type: 'text' }
    ],
    doc: {
      overview: '升级礼包发放记录是会员等级升级时奖励发放的全程追溯模块，记录每次会员升级时发放的积分、优惠券、停车券等礼包明细，以及发放状态、触发方式和操作人信息。支持自动升级触发和手动补发两种触发方式，可按会员、等级、状态、时间等多维度筛选查询。与会员等级、积分流水、会员券包、停车券等模块深度联动，确保升级奖励准确发放且全程可追溯，是会员成长体系公平性和透明度的重要保障。',
      features: ['完整记录每次升级礼包发放的全量信息', '记录会员信息：会员姓名、手机号，便于快速定位', '记录等级变动：原等级、新等级，明确升级跨度', '记录发放礼包明细：积分数量、优惠券明细、停车券小时数', '支持两种触发方式：自动升级（系统自动触发）、手动补发（运营手动触发）', '支持三种发放状态：发放成功、发放失败、部分成功', '记录失败原因，便于排查和重试发放', '记录操作人信息，明确发放责任主体', '支持按会员、等级、状态、触发方式、时间范围等多维度筛选查询', '与会员等级联动，升级礼包配置变更后自动同步发放逻辑', '与积分流水联动，发放积分时自动生成积分流水记录', '与会员券包联动，发放优惠券时自动写入会员券包', '与停车券模块联动，发放停车券时自动写入停车券账户', '提供发放成功率统计，评估升级礼包系统稳定性'],
      tips: ['自动升级发放失败时，建议先检查等级配置的礼包是否完整，再手动补发', '手动补发前请确认会员确实符合升级条件，避免重复发放', '发放记录不可删除，仅可查看，确保审计追溯的完整性', '部分成功状态表示部分奖励发放成功，需检查失败项并处理', '升级礼包发放日志需定期备份，防止数据丢失']
    }
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
