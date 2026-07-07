const fs = require('fs');
let content = fs.readFileSync('/workspace/frontend/src/services/modules.tsx', 'utf8');

function replaceFieldBlock(fieldName, replacer) {
  const regex = new RegExp(`\\{ name: '${fieldName}',[\\s\\S]{0,400}?\\}`, 'g');
  content = content.replace(regex, (match) => {
    if (!match.includes("label:")) return match;
    return replacer(match);
  });
}

function setSelectWithSource(block, sourcePath, multiple = false) {
  let replaced = block;
  // 改 type 为 select
  replaced = replaced.replace(/type:\s*'text'/, "type: 'select'");
  replaced = replaced.replace(/type:\s*'textarea'/, "type: 'select'");
  // 添加 source
  if (!replaced.includes('source:')) {
    const sourceStr = `source: { path: '${sourcePath}', labelField: 'name', valueField: 'name' }`;
    if (multiple) {
      replaced = replaced.replace(/\s*\}$/, `, ${sourceStr}, multiple: true }`);
    } else {
      replaced = replaced.replace(/\s*\}$/, `, ${sourceStr} }`);
    }
  }
  return replaced;
}

function setSelectWithOptions(block, options) {
  let replaced = block;
  replaced = replaced.replace(/type:\s*'text'/, "type: 'select'");
  if (!replaced.includes('options:')) {
    replaced = replaced.replace(/\s*\}$/, `, options: ${JSON.stringify(options)} }`);
  }
  return replaced;
}

// ===== 18 处关联字段 =====
// 1. tags: 3 处，textarea/text -> select+source (多选)
replaceFieldBlock('tags', (block) => setSelectWithSource(block, 'member/tags', true));
// 2. rule: 1 处
replaceFieldBlock('rule', (block) => setSelectWithSource(block, 'points/rules'));
// 3. plate: 1 处
replaceFieldBlock('plate', (block) => setSelectWithSource(block, 'parking/plates'));
// 4. department: 1 处
replaceFieldBlock('department', (block) => setSelectWithSource(block, 'system/departments'));
// 5. merchant: 4 处
replaceFieldBlock('merchant', (block) => setSelectWithSource(block, 'system/merchants'));
// 6. merchants: 1 处
replaceFieldBlock('merchants', (block) => setSelectWithSource(block, 'system/merchants'));
// 7. rewards: 2 处
replaceFieldBlock('rewards', (block) => setSelectWithSource(block, 'marketing/prizes'));
// 8. reward: 2 处
replaceFieldBlock('reward', (block) => setSelectWithSource(block, 'marketing/prizes'));
// 9. prize: 1 处
replaceFieldBlock('prize', (block) => setSelectWithSource(block, 'marketing/prizes'));
// 10. prizes: 1 处
replaceFieldBlock('prizes', (block) => setSelectWithSource(block, 'marketing/prizes'));
// 11. couponTemplate: 1 处
replaceFieldBlock('couponTemplate', (block) => setSelectWithSource(block, 'coupon/templates'));

// ===== OCR 识别规则特殊处理 =====
// shopType: text -> select + 固定枚举
replaceFieldBlock('shopType', (block) => {
  return setSelectWithOptions(block, [
    { label: '餐饮', value: 'catering' },
    { label: '零售', value: 'retail' },
    { label: '娱乐', value: 'entertainment' },
    { label: '服务', value: 'service' },
    { label: '其他', value: 'other' }
  ]);
});
// fields: text -> select + 多选 + 固定枚举
replaceFieldBlock('fields', (block) => {
  let replaced = block;
  replaced = replaced.replace(/type:\s*'text'/, "type: 'select'");
  if (!replaced.includes('options:')) {
    const options = [
      { label: '金额', value: 'amount' },
      { label: '日期', value: 'date' },
      { label: '小票号', value: 'receiptNo' },
      { label: '商户名', value: 'merchantName' },
      { label: '数量', value: 'quantity' },
      { label: '单价', value: 'unitPrice' }
    ];
    replaced = replaced.replace(/\s*\}$/, `, options: ${JSON.stringify(options)}, multiple: true }`);
  }
  return replaced;
});

fs.writeFileSync('/workspace/frontend/src/services/modules.tsx', content);
console.log('Done batch1');
