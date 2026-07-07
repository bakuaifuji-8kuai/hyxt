const fs = require('fs');
let content = fs.readFileSync('/workspace/frontend/src/services/modules.tsx', 'utf8');

function replaceFieldBlock(fieldName, replacer) {
  const regex = new RegExp(`\\{ name: '${fieldName}',[\\s\\S]{0,400}?\\}`, 'g');
  content = content.replace(regex, (match) => {
    if (!match.includes("label:")) return match;
    return replacer(match);
  });
}

function setType(block, newType, extra = '') {
  if (block.includes(`type: '${newType}'`)) return block;
  let replaced = block.replace(/type: 'text'/, `type: '${newType}'`);
  replaced = replaced.replace(/type: 'textarea'/, `type: '${newType}'`);
  if (extra && !replaced.includes(extra)) {
    replaced = replaced.replace(/\s*\}$/, `, ${extra} }`);
  }
  return replaced;
}

// 遗漏的日期字段
const dateFields = [
  'returnTime', 'issueTime', 'validUntil', 'clearDate',
  'bindTime', 'applyTime', 'processTime', 'signupTime',
  'preTime', 'deliveryTime', 'drawTime', 'sendTime',
  'addTime', 'settleDate', 'createTime', 'submitTime',
  'auditTime', 'depositStartTime', 'finalPayTime',
  'reportDate', 'publishTime', 'trainingTime'
];
dateFields.forEach(name => {
  replaceFieldBlock(name, (block) => setType(block, 'date'));
});

// 处理人 -> 员工
replaceFieldBlock('handler', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'system/staff', labelField: 'name', valueField: 'name' }");
});

// 审核人 -> 员工
replaceFieldBlock('auditor', (block) => {
  if (block.includes('source:')) return block;
  return setType(block, 'select', "source: { path: 'system/staff', labelField: 'name', valueField: 'name' }");
});

// 活动关联 -> 营销活动
replaceFieldBlock('activity', (block) => {
  if (block.includes('source:')) return block;
  // 避免把已经有 select options 的活动类型改了
  if (block.includes('options:')) return block;
  return setType(block, 'select', "source: { path: 'marketing/activities', labelField: 'name', valueField: 'name' }");
});

fs.writeFileSync('/workspace/frontend/src/services/modules.tsx', content);
console.log('Done2');
