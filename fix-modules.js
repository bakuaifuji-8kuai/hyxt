const fs = require('fs');
let content = fs.readFileSync('/workspace/frontend/src/services/modules.tsx', 'utf8');

function replaceFieldBlock(fieldName, replacer) {
  const regex = new RegExp(`\\{ name: '${fieldName}',[\\s\\S]{0,400}?\\}`, 'g');
  content = content.replace(regex, (match) => {
    // 只替换字段定义块（确保在 fields: [...] 区域内）
    if (!match.includes("label:")) return match;
    return replacer(match);
  });
}

function setType(block, newType, extra = '') {
  if (block.includes(`type: '${newType}'`)) return block; // 已经是目标类型
  let replaced = block.replace(/type: 'text'/, `type: '${newType}'`);
  replaced = replaced.replace(/type: 'textarea'/, `type: '${newType}'`);
  if (extra && !replaced.includes(extra)) {
    // 在最后一个 } 之前插入 extra
    replaced = replaced.replace(/\s*\}$/, `, ${extra} }`);
  }
  return replaced;
}

// ===== 1. 日期字段 text -> date =====
const dateFields = [
  'birthday', 'registerTime', 'lastLogin', 'lastConsume',
  'validFrom', 'validTo', 'startTime', 'endTime',
  'payTime', 'shipTime', 'doneTime', 'time',
  'expireDate', 'createdAt', 'updatedAt',
  'inTime', 'outTime', 'promotionExpiry'
];
dateFields.forEach(name => {
  replaceFieldBlock(name, (block) => setType(block, 'date'));
});

// ===== 2. 关联字段增加 source =====
// member -> 会员档案
replaceFieldBlock('member', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'member/archives', labelField: 'name', valueField: 'name' }");
});

// category -> 商品分类（根据上下文可能是 shop/categories 或 points/goods-category）
// 先做通用替换，后续有问题再调整
replaceFieldBlock('category', (block) => {
  if (block.includes('source:')) return block;
  // 如果已经在 select 中，只加 source；否则改为 select
  if (block.includes("type: 'select'")) {
    return block.replace(/\}$/, ", source: { path: 'shop/categories', labelField: 'name', valueField: 'name' } }");
  }
  return setType(block, 'select', "source: { path: 'shop/categories', labelField: 'name', valueField: 'name' }");
});

// template -> 券模板
replaceFieldBlock('template', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'coupons/templates', labelField: 'name', valueField: 'name' }");
});

// campaign -> 营销活动
replaceFieldBlock('campaign', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'marketing/activities', labelField: 'name', valueField: 'name' }");
});

// shop -> 门店
replaceFieldBlock('shop', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'system/shops', labelField: 'name', valueField: 'name' }");
});

// goods -> 商品（商城商品）
replaceFieldBlock('goods', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'shop/goods', labelField: 'name', valueField: 'name' }");
});

// service -> 服务项目（这里简单处理，从预约服务选）
replaceFieldBlock('service', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'services/items', labelField: 'name', valueField: 'name' }");
});

// cuisine -> 餐饮菜系
replaceFieldBlock('cuisine', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'catering/cuisines', labelField: 'name', valueField: 'name' }");
});

// ===== 3. 营销模型 condition -> conditionBuilder =====
replaceFieldBlock('condition', (block) => {
  // 只改营销模型等筛选条件字段，不改其他地方的 condition
  if (block.includes('筛选条件') || block.includes('触发条件') || block.includes('条件说明')) {
    if (block.includes("type: 'conditionBuilder'")) return block;
    return setType(block, 'conditionBuilder');
  }
  return block;
});

// ===== 4. 其他枚举字段 =====
// keepCondition -> select
replaceFieldBlock('keepCondition', (block) => {
  if (block.includes("type: 'select'")) return block;
  return setType(block, 'select', "options: [{ label: '无要求', value: 'none' }, { label: '积分保级', value: 'points' }, { label: '消费保级', value: 'spent' }]");
});

// targetGroup -> select
replaceFieldBlock('targetGroup', (block) => {
  if (block.includes("type: 'select'")) return block;
  return setType(block, 'select', "options: [{ label: '全部会员', value: 'all' }, { label: '新会员', value: 'new' }, { label: '老会员', value: 'old' }, { label: '高价值会员', value: 'vip' }]");
});

// targetTags -> select + source
replaceFieldBlock('targetTags', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'member/tags', labelField: 'name', valueField: 'name' }");
});

// couponTemplates -> select + source
replaceFieldBlock('couponTemplates', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'coupons/templates', labelField: 'name', valueField: 'name' }");
});

// relatedGoods -> select + source
replaceFieldBlock('relatedGoods', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'shop/goods', labelField: 'name', valueField: 'name' }");
});

// rule (会员标签) -> select
replaceFieldBlock('rule', (block) => {
  if (block.includes("type: 'select'")) return block;
  // 只在会员标签模块中改
  if (block.includes('标签') || block.includes('会员')) {
    return setType(block, 'select', "options: [{ label: '消费满额', value: 'spend' }, { label: '登录天数', value: 'loginDays' }, { label: '注册时长', value: 'registerDays' }, { label: '积分余额', value: 'points' }]");
  }
  return block;
});

// operator (操作人) -> select + source（员工）
replaceFieldBlock('operator', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'system/staff', labelField: 'name', valueField: 'name' }");
});

// floor -> select
replaceFieldBlock('floor', (block) => {
  if (block.includes("type: 'select'")) return block;
  return setType(block, 'select', "options: [{ label: 'B1', value: 'B1' }, { label: 'B2', value: 'B2' }, { label: 'F1', value: 'F1' }, { label: 'F2', value: 'F2' }, { label: 'F3', value: 'F3' }, { label: 'F4', value: 'F4' }, { label: 'F5', value: 'F5' }]");
});

// logisticsCompany -> select
replaceFieldBlock('logisticsCompany', (block) => {
  if (block.includes("type: 'select'")) return block;
  return setType(block, 'select', "options: [{ label: '顺丰', value: 'sf' }, { label: '中通', value: 'zto' }, { label: '圆通', value: 'yto' }, { label: '韵达', value: 'yd' }, { label: '申通', value: 'sto' }, { label: 'EMS', value: 'ems' }]");
});

// parentId -> select（分类的父分类）
replaceFieldBlock('parentId', (block) => {
  if (block.includes("type: 'select'")) return block;
  return setType(block, 'select', "source: { path: 'shop/categories', labelField: 'name', valueField: 'id' }");
});

// role (员工角色) -> select + source
replaceFieldBlock('role', (block) => {
  if (block.includes('source:')) return block;
  // 已经有 options 的不改
  if (block.includes('options:')) return block;
  return setType(block, 'select', "source: { path: 'system/roles', labelField: 'name', valueField: 'name' }");
});

fs.writeFileSync('/workspace/frontend/src/services/modules.tsx', content);
console.log('Done');
