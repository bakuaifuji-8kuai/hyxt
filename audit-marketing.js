const fs = require('fs');
const content = fs.readFileSync('/workspace/frontend/src/pages/MarketingCenter.tsx', 'utf8');
const lines = content.split('\n');

const issues = [];

// 找出所有 fields 块
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/\{ name: '(\w+)', label: '([^']+)', type: '(\w+)'/);
  if (m) {
    const fieldName = m[1];
    const fieldLabel = m[2];
    const fieldType = m[3];
    // 看后面几行是否有 options 或 source
    let hasOptions = /options:/.test(line);
    let hasSource = /source:/.test(line);
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (/^\s*\}/.test(lines[j])) break;
      if (/options:/.test(lines[j])) hasOptions = true;
      if (/source:/.test(lines[j])) hasSource = true;
    }
    issues.push({
      line: i + 1,
      field: fieldName,
      label: fieldLabel,
      type: fieldType,
      hasOptions,
      hasSource,
    });
  }
}

console.log(`共 ${issues.length} 个字段`);

// 应该是下拉的字段（关联）
const assocMap = {
  'goods': 'shop/goods',
  'product': 'shop/goods',
  'coupon': 'coupon/templates',
  'couponTemplate': 'coupon/templates',
  'couponTemplates': 'coupon/templates',
  'shop': 'config/shops',
  'service': 'services/items',
  'member': 'member/list',
  'merchant': 'system/merchants',
  'merchants': 'system/merchants',
  'prize': 'marketing/prizes',
  'prizes': 'marketing/prizes',
  'reward': 'marketing/prizes',
  'rewards': 'marketing/prizes',
  'category': 'shop/categories',
  'tag': 'member/tags',
  'tags': 'member/tags',
  'level': 'member/levels',
  'model': 'member/marketing-models',
};

const needFix = [];
issues.forEach(i => {
  if (i.type === 'input' || i.type === 'text' || i.type === 'number') {
    if (assocMap[i.field] && !i.hasSource) {
      needFix.push({ ...i, target: assocMap[i.field], reason: '应为关联下拉' });
    }
  }
});

console.log(`\n需要修复的字段（关联下拉）: ${needFix.length} 个\n`);
needFix.forEach(i => {
  console.log(`  line ${i.line}: [${i.label}] ${i.field} (type=${i.type}) -> ${i.target}`);
});

// 识别应该是固定枚举的字段
const enumMap = {
  'type': 'input/select -> 活动类型',
  'rewardType': 'rewardType -> select',
  'period': 'period -> select (daily/weekly/monthly)',
  'mode': 'mode -> select',
  'status': 'status -> select',
};

const enumIssues = [];
issues.forEach(i => {
  if (i.type === 'input' && enumMap[i.field] && !i.hasOptions) {
    enumIssues.push({ ...i, reason: '应改为固定枚举select' });
  }
});

console.log(`\n应改为固定枚举select的字段: ${enumIssues.length} 个\n`);
enumIssues.forEach(i => {
  console.log(`  line ${i.line}: [${i.label}] ${i.field} (type=${i.type})`);
});
