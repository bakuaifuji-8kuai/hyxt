const fs = require('fs');
const content = fs.readFileSync('/workspace/frontend/src/services/modules.tsx', 'utf8');
const lines = content.split('\n');

const modules = [];
let currentModule = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/key:\s*['"]([^'"]+)['"],\s*path:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"]/);
  if (m) {
    currentModule = { key: m[1], path: m[2], name: m[3], fields: [], startLine: i + 1 };
    modules.push(currentModule);
  }
  if (currentModule && /^\s*\{ name:/.test(line)) {
    const fieldName = (line.match(/name:\s*['"]([^'"]+)['"]/) || [])[1];
    const fieldType = (line.match(/type:\s*['"]([^'"]+)['"]/) || [])[1];
    const hasSource = /source:/.test(line);
    const hasOptions = /options:/.test(line);
    const isHidden = /hidden:\s*true/.test(line);
    if (fieldName) {
      currentModule.fields.push({ name: fieldName, type: fieldType || 'text', hasSource, hasOptions, isHidden, line: i + 1 });
    }
  }
}

console.log(`总模块数: ${modules.length}`);

// 关联字段：常见的主数据
const assocList = [
  'project', 'projects', 'member', 'category', 'goods', 'product',
  'template', 'campaign', 'shop', 'service', 'cuisine', 'operator',
  'handler', 'auditor', 'tag', 'tags', 'modelId', 'parkingLot', 'plate',
  'staff', 'department', 'role', 'level', 'coupon', 'couponTemplate',
  'couponTemplates', 'relatedGoods', 'relatedProduct', 'prize', 'reward',
  'prizes', 'rewards', 'merchant', 'merchants', 'venue', 'room', 'brand',
  'supplier', 'area', 'mall', 'store', 'activity', 'task', 'rule',
  'pointsRule', 'parking', 'memberId', 'userId', 'customer', 'customerId',
  'gift', 'couponId', 'goodsId', 'categoryId', 'tagId', 'staffId',
  'levelId', 'shopId', 'projectId', 'templateId', 'model', 'menu',
  'parentCategory', 'serviceType',
];

// 关联到哪个模块的映射
const assocMap = {};
assocList.forEach(n => {
  if (['project', 'projects', 'projectId'].includes(n)) assocMap[n] = 'system/projects';
  else if (['member', 'memberId', 'userId', 'customer', 'customerId'].includes(n)) assocMap[n] = 'member/list';
  else if (['category', 'categoryId', 'parentCategory', 'menu'].includes(n)) assocMap[n] = 'shop/categories';
  else if (['goods', 'product', 'relatedGoods', 'relatedProduct', 'goodsId'].includes(n)) assocMap[n] = 'shop/goods';
  else if (['template', 'coupon', 'couponTemplate', 'couponTemplates', 'templateId', 'couponId'].includes(n)) assocMap[n] = 'coupon/templates';
  else if (['campaign', 'model', 'modelId'].includes(n)) assocMap[n] = 'member/marketing-models';
  else if (['shop', 'shopId', 'store'].includes(n)) assocMap[n] = 'config/shops';
  else if (['service', 'serviceType', 'venue', 'room'].includes(n)) assocMap[n] = 'services/items';
  else if (['cuisine'].includes(n)) assocMap[n] = 'restaurant/cuisine';
  else if (['operator', 'handler', 'auditor', 'staff', 'staffId'].includes(n)) assocMap[n] = 'system/staff';
  else if (['tag', 'tags', 'tagId'].includes(n)) assocMap[n] = 'member/tags';
  else if (['level', 'levelId'].includes(n)) assocMap[n] = 'member/levels';
  else if (['parkingLot', 'parking', 'plate'].includes(n)) assocMap[n] = 'parking/lots';
  else if (['prize', 'prizes', 'reward', 'rewards', 'gift'].includes(n)) assocMap[n] = 'marketing/prizes';
  else if (['merchant', 'merchants'].includes(n)) assocMap[n] = 'system/merchants';
  else if (['brand'].includes(n)) assocMap[n] = 'shop/brands';
  else if (['supplier'].includes(n)) assocMap[n] = 'system/suppliers';
  else if (['mall', 'area'].includes(n)) assocMap[n] = 'system/malls';
  else if (['activity', 'task'].includes(n)) assocMap[n] = 'marketing/campaigns';
  else if (['rule', 'pointsRule'].includes(n)) assocMap[n] = 'points/rules';
  else if (['department'].includes(n)) assocMap[n] = 'system/departments';
  else if (['role'].includes(n)) assocMap[n] = 'system/roles';
});

const issues = [];
modules.forEach(mod => {
  mod.fields.forEach(f => {
    if (f.isHidden) return;
    if (assocMap[f.name] && !f.hasSource && f.type !== 'select' && f.type !== 'date' && f.type !== 'conditionBuilder') {
      issues.push({
        module: mod.name,
        moduleKey: mod.key,
        modulePath: mod.path,
        field: f.name,
        fieldType: f.type,
        problem: '应改为关联下拉',
        targetPath: assocMap[f.name],
        line: f.line,
      });
    }
  });
});

console.log(`\n共发现 ${issues.length} 个问题（关联字段无下拉源）\n`);

const byField = {};
issues.forEach(i => {
  byField[i.field] = (byField[i.field] || 0) + 1;
});
console.log('按字段统计：');
Object.entries(byField).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`  ${k}: ${v} 处 -> ${assocMap[k]}`);
});

console.log('\n详细列表：');
issues.forEach(i => {
  console.log(`  [${i.module}] ${i.field} (line ${i.line}, type=${i.fieldType}) -> ${i.targetPath}`);
});

fs.writeFileSync('/workspace/audit-result.json', JSON.stringify(issues, null, 2));
