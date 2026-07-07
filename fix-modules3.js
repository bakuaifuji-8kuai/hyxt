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

replaceFieldBlock('updateTime', (block) => setType(block, 'date'));

fs.writeFileSync('/workspace/frontend/src/services/modules.tsx', content);
console.log('Done3');
