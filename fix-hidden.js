const fs = require('fs');
let content = fs.readFileSync('/workspace/frontend/src/services/modules.tsx', 'utf8');

function replaceFieldBlock(fieldName, replacer) {
  const regex = new RegExp(`\\{ name: '${fieldName}',[\\s\\S]{0,400}?\\}`, 'g');
  content = content.replace(regex, (match) => {
    if (!match.includes("label:")) return match;
    return replacer(match);
  });
}

// 统计字段（系统自动生成，新增时隐藏）
const hiddenFields = [
  'sentCount', 'readCount', 'usedCount', 'earnedCount',
  'boughtCount', 'joinCount', 'joinedCount', 'participants',
  'playCount', 'visitCount', 'totalSpent', 'totalPoints',
  'totalOrders', 'totalAmount', 'consumeCount', 'consumeAmount',
  'pointBalance', 'couponCount', 'balance',
  'orderCount', 'refundCount', 'stock', 'sold',
  'receivedCount', 'claimedCount', 'checkedCount',
  'successCount', 'failCount', 'totalCount',
  'hitCount', 'showCount', 'clickCount',
  'downloadCount', 'shareCount', 'likeCount',
  'commentCount', 'followCount', 'fansCount',
  'pointsUsed', 'pointsEarned', 'pointsExpired',
  'growthValue', 'accumulatedGrowth', 'availableGrowth',
  'currentLevel', 'historyHighestLevel',
  'memberCount', 'activeMemberCount', 'newMemberCount',
  'totalScore', 'avgScore', 'scoreCount',
  'redemptionCount', 'exchangeCount'
];

hiddenFields.forEach(name => {
  replaceFieldBlock(name, (block) => {
    if (block.includes('hidden:')) return block;
    return block.replace(/\s*\}$/, ", hidden: true }");
  });
});

fs.writeFileSync('/workspace/frontend/src/services/modules.tsx', content);
console.log('Done hidden');
