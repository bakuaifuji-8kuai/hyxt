import { useState } from 'react';
import { Card, Typography, Badge, Tag } from 'antd';
import FeatureDescription from '../components/FeatureDescription';

const { Paragraph, Title, Text } = Typography;

interface BusinessFlow {
  key: string;
  name: string;
  desc: string;
  category: string;
  svg: string;
}

const CATEGORIES = [
  { key: 'member', name: '会员类', icon: '👤', color: '#2563eb' },
  { key: 'points', name: '积分类', icon: '⭐', color: '#16a34a' },
  { key: 'marketing', name: '营销类', icon: '📣', color: '#d97706' },
  { key: 'mall', name: '商城类', icon: '🛒', color: '#dc2626' },
  { key: 'service', name: '服务类', icon: '🔧', color: '#0891b2' },
];

const FLOWS: BusinessFlow[] = [
  {
    key: 'member-register',
    name: '会员注册流程',
    category: 'member',
    desc: '顾客通过门店/小程序注册成为会员，系统自动初始化档案、等级、钱包、积分账户。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs>
        <marker id="ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker>
      </defs>
      <rect x="0" y="0" width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">会员注册流程</text>
      <rect x="40" y="80" width="150" height="70" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="115" y="110" text-anchor="middle" font-size="14" fill="#1e3a8a" font-weight="600">顾客</text>
      <text x="115" y="132" text-anchor="middle" font-size="12" fill="#475569">扫码/到店</text>
      <rect x="250" y="80" width="170" height="70" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="335" y="110" text-anchor="middle" font-size="14" fill="#0f172a" font-weight="600">填写资料</text>
      <text x="335" y="132" text-anchor="middle" font-size="12" fill="#475569">手机号/姓名/性别</text>
      <rect x="480" y="80" width="170" height="70" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="565" y="110" text-anchor="middle" font-size="14" fill="#0f172a" font-weight="600">系统校验</text>
      <text x="565" y="132" text-anchor="middle" font-size="12" fill="#475569">手机号唯一性</text>
      <polygon points="770,80 870,115 770,150 670,115" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="770" y="120" text-anchor="middle" font-size="13" fill="#7c2d12" font-weight="600">是否已注册?</text>
      <rect x="250" y="220" width="170" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="335" y="256" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">提示已注册,去登录</text>
      <rect x="480" y="220" width="170" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="565" y="245" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">初始化账户</text>
      <text x="565" y="265" text-anchor="middle" font-size="11" fill="#475569">档案+等级+钱包+积分</text>
      <rect x="710" y="220" width="170" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="795" y="245" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">发放新人大礼包</text>
      <text x="795" y="265" text-anchor="middle" font-size="11" fill="#475569">新人券+积分</text>
      <rect x="480" y="330" width="170" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="565" y="365" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">注册成功</text>
      <line x1="190" y1="115" x2="245" y2="115" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="420" y1="115" x2="475" y2="115" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="650" y1="115" x2="670" y2="115" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="770" y1="150" x2="335" y2="220" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar1)"/>
      <text x="540" y="180" font-size="11" fill="#dc2626">否</text>
      <line x1="770" y1="150" x2="565" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#ar1)"/>
      <text x="690" y="180" font-size="11" fill="#16a34a">是</text>
      <line x1="650" y1="250" x2="705" y2="250" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="565" y1="280" x2="565" y2="325" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <rect x="40" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="50" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="50" y="375" font-size="11" fill="#dc2626">- - 异常分支</text>
      <text x="50" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'member-level-upgrade',
    name: '会员等级升级流程',
    category: 'member',
    desc: '消费/签到累计成长值，达到升级条件后自动升级，发放升级礼包并通知会员。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_lv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">会员等级升级流程</text>
      <rect x="30" y="70" width="160" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="110" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">累计成长值</text>
      <text x="110" y="120" text-anchor="middle" font-size="11" fill="#475569">消费/签到/活动</text>
      <rect x="240" y="70" width="160" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="320" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">更新成长值</text>
      <text x="320" y="120" text-anchor="middle" font-size="11" fill="#475569">member/growth</text>
      <polygon points="530,70 630,103 530,136 430,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="530" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">达升级条件?</text>
      <text x="530" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">银卡→金卡</text>
      <rect x="240" y="190" width="160" height="60" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="320" y="226" text-anchor="middle" font-size="13" fill="#475569" font-weight="600">保持当前等级</text>
      <rect x="430" y="190" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="510" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">自动升级</text>
      <text x="510" y="235" text-anchor="middle" font-size="11" fill="#475569">level=gold</text>
      <rect x="640" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="720" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">发放升级礼包</text>
      <text x="720" y="235" text-anchor="middle" font-size="11" fill="#475569">升级券+积分</text>
      <rect x="430" y="300" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="510" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">发送通知</text>
      <text x="510" y="345" text-anchor="middle" font-size="11" fill="#475569">短信/小程序/APP</text>
      <rect x="640" y="300" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="720" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">升级完成</text>
      <line x1="190" y1="103" x2="235" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_lv)"/>
      <line x1="400" y1="103" x2="425" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_lv)"/>
      <line x1="530" y1="136" x2="320" y2="190" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_lv)"/>
      <text x="400" y="166" font-size="11" fill="#64748b">否</text>
      <line x1="630" y1="103" x2="425" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_lv)"/>
      <text x="560" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="590" y1="220" x2="635" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_lv)"/>
      <line x1="510" y1="250" x2="510" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_lv)"/>
      <line x1="590" y1="330" x2="635" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_lv)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#64748b">- - 不升级</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'referral-reward',
    name: '推荐有礼流程',
    category: 'member',
    desc: '老会员分享邀请链接，新会员注册后系统识别推荐关系，双方发放奖励并记录。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_ref" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">推荐有礼流程</text>
      <rect x="30" y="70" width="160" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="110" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">老会员分享</text>
      <text x="110" y="120" text-anchor="middle" font-size="11" fill="#475569">生成专属邀请码</text>
      <rect x="240" y="70" width="160" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="320" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">新会员注册</text>
      <text x="320" y="120" text-anchor="middle" font-size="11" fill="#475569">通过邀请链接</text>
      <polygon points="530,70 630,103 530,136 430,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="530" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">有推荐关系?</text>
      <text x="530" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">referrer_id</text>
      <rect x="240" y="190" width="160" height="60" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="320" y="226" text-anchor="middle" font-size="13" fill="#475569" font-weight="600">普通注册</text>
      <text x="320" y="244" text-anchor="middle" font-size="11" fill="#475569">无推荐奖励</text>
      <rect x="430" y="190" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="510" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">识别推荐关系</text>
      <text x="510" y="235" text-anchor="middle" font-size="11" fill="#475569">绑定推荐人</text>
      <rect x="640" y="190" width="140" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="710" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">老会员发奖</text>
      <text x="710" y="235" text-anchor="middle" font-size="11" fill="#475569">积分+券</text>
      <rect x="820" y="190" width="120" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="880" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">新会员发奖</text>
      <text x="880" y="235" text-anchor="middle" font-size="11" fill="#475569">新人礼包</text>
      <rect x="430" y="300" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="510" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">奖励记录</text>
      <text x="510" y="345" text-anchor="middle" font-size="11" fill="#475569">referral/logs</text>
      <rect x="640" y="300" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="720" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">推荐完成</text>
      <line x1="190" y1="103" x2="235" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ref)"/>
      <line x1="400" y1="103" x2="425" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ref)"/>
      <line x1="530" y1="136" x2="320" y2="190" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_ref)"/>
      <text x="400" y="166" font-size="11" fill="#64748b">否</text>
      <line x1="630" y1="103" x2="505" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_ref)"/>
      <text x="580" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="590" y1="220" x2="635" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ref)"/>
      <line x1="780" y1="220" x2="815" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ref)"/>
      <line x1="510" y1="250" x2="510" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ref)"/>
      <line x1="590" y1="330" x2="635" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ref)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#64748b">- - 无推荐</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'points-issue',
    name: '积分发放流程',
    category: 'points',
    desc: '会员消费/签到/参与活动等场景，按规则计算并发放积分，写入积分流水并更新余额。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">积分发放流程</text>
      <rect x="30" y="70" width="140" height="64" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="100" y="98" text-anchor="middle" font-size="13" fill="#1e3a8a" font-weight="600">触发场景</text>
      <text x="100" y="118" text-anchor="middle" font-size="11" fill="#475569">消费/签到/生日</text>
      <rect x="220" y="70" width="160" height="64" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="300" y="98" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">匹配积分规则</text>
      <text x="300" y="118" text-anchor="middle" font-size="11" fill="#475569">查 points/rules</text>
      <rect x="430" y="70" width="160" height="64" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="510" y="98" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">计算积分值</text>
      <text x="510" y="118" text-anchor="middle" font-size="11" fill="#475569">金额×倍率+权益</text>
      <polygon points="760,70 860,102 760,134 660,102" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="760" y="100" text-anchor="middle" font-size="12" fill="#7c2d12" font-weight="600">会员等级</text>
      <text x="760" y="118" text-anchor="middle" font-size="11" fill="#7c2d12">倍率生效?</text>
      <rect x="220" y="200" width="160" height="64" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="300" y="228" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">写入积分流水</text>
      <text x="300" y="248" text-anchor="middle" font-size="11" fill="#475569">points/logs</text>
      <rect x="430" y="200" width="160" height="64" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="510" y="228" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">更新会员余额</text>
      <text x="510" y="248" text-anchor="middle" font-size="11" fill="#475569">member/list.points</text>
      <rect x="640" y="200" width="180" height="64" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="730" y="228" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">触发等级升级检查</text>
      <text x="730" y="248" text-anchor="middle" font-size="11" fill="#475569">达金卡→升级</text>
      <rect x="430" y="320" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="510" y="355" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">发放完成</text>
      <line x1="170" y1="102" x2="215" y2="102" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="380" y1="102" x2="425" y2="102" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="590" y1="102" x2="655" y2="102" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="760" y1="134" x2="300" y2="200" stroke="#16a34a" stroke-width="2" marker-end="url(#ar2)"/>
      <text x="520" y="170" font-size="11" fill="#16a34a">计算最终积分</text>
      <line x1="380" y1="232" x2="425" y2="232" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="590" y1="232" x2="635" y2="232" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="510" y1="264" x2="510" y2="315" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#16a34a">— 计算分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'parking-flow',
    name: '停车积分流程',
    category: 'points',
    desc: '车辆入场→出场结算→会员自动识别→按等级权益免费时长/积分奖励。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">停车积分流程</text>
      <rect x="30" y="80" width="140" height="60" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="100" y="106" text-anchor="middle" font-size="13" font-weight="600" fill="#1e3a8a">车辆入场</text>
      <text x="100" y="124" text-anchor="middle" font-size="11" fill="#475569">车牌识别</text>
      <rect x="220" y="80" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="300" y="106" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">车辆出场</text>
      <text x="300" y="124" text-anchor="middle" font-size="11" fill="#475569">计算时长/费用</text>
      <polygon points="530,80 620,110 530,140 440,110" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="530" y="106" text-anchor="middle" font-size="12" font-weight="600" fill="#7c2d12">是否会员?</text>
      <text x="530" y="124" text-anchor="middle" font-size="11" fill="#7c2d12">车牌匹配</text>
      <rect x="670" y="80" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="745" y="106" text-anchor="middle" font-size="13" font-weight="600" fill="#14532d">应用会员权益</text>
      <text x="745" y="124" text-anchor="middle" font-size="11" fill="#475569">免费时长/折扣</text>
      <rect x="670" y="190" width="150" height="56" rx="10" fill="#ecfeff" stroke="#0891b2" stroke-width="2"/>
      <text x="745" y="214" text-anchor="middle" font-size="13" font-weight="600" fill="#155e75">送停车积分</text>
      <text x="745" y="232" text-anchor="middle" font-size="11" fill="#475569">points/logs +1</text>
      <rect x="440" y="190" width="180" height="56" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="530" y="214" text-anchor="middle" font-size="13" font-weight="600" fill="#7f1d1d">全额收费</text>
      <text x="530" y="232" text-anchor="middle" font-size="11" fill="#7f1d1d">无权益</text>
      <rect x="440" y="290" width="380" height="50" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="630" y="321" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">停车记录入库 parking/records</text>
      <line x1="170" y1="110" x2="215" y2="110" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="380" y1="110" x2="435" y2="110" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="620" y1="110" x2="665" y2="110" stroke="#16a34a" stroke-width="2" marker-end="url(#ar5)"/>
      <text x="640" y="100" font-size="11" fill="#16a34a">是</text>
      <line x1="530" y1="140" x2="530" y2="185" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar5)"/>
      <text x="540" y="165" font-size="11" fill="#dc2626">否</text>
      <line x1="745" y1="140" x2="745" y2="185" stroke="#0891b2" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="630" y1="248" x2="630" y2="285" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="745" y1="248" x2="745" y2="285" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 非会员</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'photo-points-audit',
    name: '拍照积分审核流程',
    category: 'points',
    desc: '会员拍照上传小票，AI识别初审后人工审核，审核通过积分到账并通知会员。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_photo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">拍照积分审核流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">会员拍照上传</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">消费小票/发票</text>
      <rect x="230" y="70" width="160" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="310" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">AI识别初审</text>
      <text x="310" y="120" text-anchor="middle" font-size="11" fill="#475569">OCR+金额识别</text>
      <polygon points="520,70 620,103 520,136 420,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="520" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">AI审核通过?</text>
      <text x="520" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">置信度≥90%</text>
      <rect x="230" y="190" width="160" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="310" y="216" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">AI驳回</text>
      <text x="310" y="236" text-anchor="middle" font-size="11" fill="#7f1d1d">模糊/不清晰</text>
      <rect x="420" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="500" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">人工审核</text>
      <text x="500" y="235" text-anchor="middle" font-size="11" fill="#475569">后台运营审核</text>
      <polygon points="750,190 850,220 750,250 650,220" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="750" y="218" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">人工通过?</text>
      <rect x="650" y="290" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="730" y="315" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">积分到账</text>
      <text x="730" y="335" text-anchor="middle" font-size="11" fill="#475569">points/logs</text>
      <rect x="830" y="290" width="110" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="885" y="325" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">通知会员</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_photo)"/>
      <line x1="390" y1="103" x2="415" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_photo)"/>
      <line x1="520" y1="136" x2="310" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_photo)"/>
      <text x="395" y="166" font-size="11" fill="#dc2626">否</text>
      <line x1="620" y1="103" x2="495" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_photo)"/>
      <text x="570" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="580" y1="220" x2="645" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_photo)"/>
      <line x1="750" y1="250" x2="730" y2="290" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_photo)"/>
      <text x="710" y="278" font-size="11" fill="#16a34a">是</text>
      <line x1="810" y1="320" x2="825" y2="320" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_photo)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 驳回分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'estate-points-task',
    name: '地产积分任务流程',
    category: 'points',
    desc: '业主完成地产任务后提交证明，后台审核通过后发放积分并通知业主。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_estate" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">地产积分任务流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">业主完成任务</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">看房/签约/推荐</text>
      <rect x="230" y="70" width="160" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="310" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">提交证明材料</text>
      <text x="310" y="120" text-anchor="middle" font-size="11" fill="#475569">照片/截图/凭证</text>
      <rect x="440" y="70" width="160" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="520" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">后台审核</text>
      <text x="520" y="120" text-anchor="middle" font-size="11" fill="#475569">运营人员审核</text>
      <polygon points="750,70 850,103 750,136 650,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="750" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">审核通过?</text>
      <text x="750" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">材料真实有效</text>
      <rect x="230" y="190" width="160" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="310" y="216" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">审核拒绝</text>
      <text x="310" y="236" text-anchor="middle" font-size="11" fill="#7f1d1d">通知补充材料</text>
      <rect x="440" y="190" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="520" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">积分发放</text>
      <text x="520" y="235" text-anchor="middle" font-size="11" fill="#475569">按任务分值发放</text>
      <rect x="650" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="730" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">写入积分流水</text>
      <text x="730" y="235" text-anchor="middle" font-size="11" fill="#475569">points/logs</text>
      <rect x="440" y="300" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="520" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">发送通知</text>
      <text x="520" y="345" text-anchor="middle" font-size="11" fill="#475569">短信/APP推送</text>
      <rect x="650" y="300" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="730" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">任务完成</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_estate)"/>
      <line x1="390" y1="103" x2="435" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_estate)"/>
      <line x1="600" y1="103" x2="645" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_estate)"/>
      <line x1="750" y1="136" x2="310" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_estate)"/>
      <text x="500" y="170" font-size="11" fill="#dc2626">否</text>
      <line x1="850" y1="103" x2="505" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_estate)"/>
      <text x="700" y="160" font-size="11" fill="#16a34a">是</text>
      <line x1="600" y1="220" x2="645" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_estate)"/>
      <line x1="520" y1="250" x2="520" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_estate)"/>
      <line x1="600" y1="330" x2="645" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_estate)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 拒绝分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'checkin-activity',
    name: '签到活动流程',
    category: 'points',
    desc: '活动配置后，会员每日签到，连续签到获得额外奖励，支持补签，积分/券自动到账。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_checkin" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">签到活动流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">活动配置</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">签到规则/奖励设置</text>
      <rect x="230" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">每日签到</text>
      <text x="305" y="120" text-anchor="middle" font-size="11" fill="#475569">会员点击签到</text>
      <polygon points="500,70 600,103 500,136 400,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="500" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">连续签到?</text>
      <text x="500" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">第N天</text>
      <rect x="230" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="305" y="216" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">基础签到奖励</text>
      <text x="305" y="236" text-anchor="middle" font-size="11" fill="#475569">10积分/天</text>
      <rect x="400" y="190" width="180" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="490" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">连续签到额外奖励</text>
      <text x="490" y="235" text-anchor="middle" font-size="11" fill="#475569">7天送券/30天大奖</text>
      <polygon points="730,190 830,220 730,250 630,220" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="730" y="218" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">需要补签?</text>
      <rect x="630" y="290" width="150" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="705" y="315" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">补签(消耗积分)</text>
      <text x="705" y="335" text-anchor="middle" font-size="11" fill="#7f1d1d">50积分/次</text>
      <rect x="810" y="290" width="130" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="875" y="315" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">积分/券到账</text>
      <text x="875" y="335" text-anchor="middle" font-size="11" fill="#dbeafe">完成签到</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <line x1="380" y1="103" x2="395" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <line x1="500" y1="136" x2="305" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <text x="380" y="166" font-size="11" fill="#16a34a">否(第1天)</text>
      <line x1="600" y1="103" x2="485" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <text x="570" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="380" y1="220" x2="395" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <line x1="580" y1="220" x2="625" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <line x1="730" y1="250" x2="705" y2="290" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_checkin)"/>
      <text x="670" y="278" font-size="11" fill="#dc2626">是</text>
      <line x1="830" y1="220" x2="875" y2="290" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <text x="850" y="260" font-size="11" fill="#2563eb">否</text>
      <line x1="780" y1="320" x2="805" y2="320" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_checkin)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 补签分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'coupon-campaign',
    name: '礼券发放流程',
    category: 'marketing',
    desc: '创建券模板→活动配置发券→会员领取→核销，全链路数据流转。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">礼券发放与核销流程</text>
      <rect x="30" y="70" width="150" height="60" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="96" text-anchor="middle" font-size="13" font-weight="600" fill="#1e3a8a">创建券模板</text>
      <text x="105" y="116" text-anchor="middle" font-size="11" fill="#475569">coupon/templates</text>
      <rect x="230" y="70" width="150" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="96" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">营销活动发券</text>
      <text x="305" y="116" text-anchor="middle" font-size="11" fill="#475569">marketing/coupons</text>
      <rect x="430" y="70" width="150" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="505" y="96" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">会员领取</text>
      <text x="505" y="116" text-anchor="middle" font-size="11" fill="#475569">claimed+1</text>
      <rect x="630" y="70" width="150" height="60" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="705" y="96" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">到店消费</text>
      <text x="705" y="116" text-anchor="middle" font-size="11" fill="#7c2d12">使用该券</text>
      <rect x="830" y="70" width="110" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="885" y="96" text-anchor="middle" font-size="13" font-weight="600" fill="#14532d">核销</text>
      <text x="885" y="116" text-anchor="middle" font-size="11" fill="#475569">核销中心</text>
      <rect x="430" y="190" width="150" height="56" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="505" y="214" text-anchor="middle" font-size="12" fill="#7f1d1d" font-weight="600">过期未用</text>
      <text x="505" y="232" text-anchor="middle" font-size="11" fill="#7f1d1d">自动失效回收</text>
      <rect x="430" y="300" width="150" height="50" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="505" y="331" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">核销完成</text>
      <line x1="180" y1="100" x2="225" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="380" y1="100" x2="425" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="580" y1="100" x2="625" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="780" y1="100" x2="825" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="505" y1="130" x2="505" y2="185" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar3)"/>
      <text x="515" y="160" font-size="11" fill="#dc2626">超期</text>
      <line x1="885" y1="130" x2="885" y2="295" stroke="#16a34a" stroke-width="2"/>
      <path d="M885,295 Q885,330 855,330 L580,330" fill="none" stroke="#16a34a" stroke-width="2" marker-end="url(#ar3)"/>
      <text x="720" y="324" font-size="11" fill="#16a34a">回写核销状态</text>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 过期分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'precision-marketing',
    name: '精准营销流程',
    category: 'marketing',
    desc: '基于营销模型圈选目标人群，配置消息模板，定时或手动发送，追踪送达效果并分析。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_marketing" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">精准营销流程</text>
      <rect x="20" y="70" width="140" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="90" y="98" text-anchor="middle" font-size="13" font-weight="600" fill="#1e3a8a">营销模型</text>
      <text x="90" y="120" text-anchor="middle" font-size="11" fill="#475569">RFM/标签模型</text>
      <rect x="200" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="275" y="98" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">人群圈选</text>
      <text x="275" y="120" text-anchor="middle" font-size="11" fill="#475569">条件筛选</text>
      <rect x="390" y="70" width="170" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="475" y="98" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">消息模板配置</text>
      <text x="475" y="120" text-anchor="middle" font-size="11" fill="#475569">短信/推送/小程序</text>
      <polygon points="700,70 800,103 700,136 600,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="700" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">发送方式</text>
      <text x="700" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">定时/手动?</text>
      <rect x="200" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="275" y="216" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">定时发送</text>
      <text x="275" y="236" text-anchor="middle" font-size="11" fill="#475569">设置发送时间</text>
      <rect x="400" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="475" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">手动发送</text>
      <text x="475" y="235" text-anchor="middle" font-size="11" fill="#475569">立即执行</text>
      <rect x="600" y="190" width="180" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="690" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">送达追踪</text>
      <text x="690" y="235" text-anchor="middle" font-size="11" fill="#475569">送达率/打开率</text>
      <rect x="300" y="300" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="380" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">效果分析</text>
      <text x="380" y="345" text-anchor="middle" font-size="11" fill="#475569">转化率/ROI</text>
      <rect x="500" y="300" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="580" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">营销完成</text>
      <line x1="160" y1="103" x2="195" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <line x1="350" y1="103" x2="385" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <line x1="560" y1="103" x2="595" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <line x1="700" y1="136" x2="275" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <text x="460" y="166" font-size="11" fill="#16a34a">定时</text>
      <line x1="800" y1="103" x2="470" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <text x="680" y="150" font-size="11" fill="#16a34a">手动</text>
      <line x1="350" y1="220" x2="395" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <line x1="550" y1="220" x2="595" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <line x1="690" y1="250" x2="380" y2="300" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <line x1="460" y1="330" x2="495" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_marketing)"/>
      <rect x="20" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="30" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="30" y="375" font-size="11" fill="#16a34a">— 发送分支</text>
      <text x="30" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'coupon-pack-purchase',
    name: '券包购买流程',
    category: 'marketing',
    desc: '会员选择券包，支持积分或现金支付，支付成功后券包到账，单券可核销，到期自动失效。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_couponpack" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">券包购买流程</text>
      <rect x="30" y="70" width="140" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="100" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">选择券包</text>
      <text x="100" y="120" text-anchor="middle" font-size="11" fill="#475569">浏览券包列表</text>
      <polygon points="290,70 390,103 290,136 190,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="290" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">支付方式</text>
      <text x="290" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">积分/现金?</text>
      <rect x="30" y="190" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="110" y="216" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">积分支付</text>
      <text x="110" y="236" text-anchor="middle" font-size="11" fill="#475569">扣减积分余额</text>
      <rect x="230" y="190" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="310" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">现金支付</text>
      <text x="310" y="235" text-anchor="middle" font-size="11" fill="#475569">微信/支付宝</text>
      <rect x="430" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="510" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">券包到账</text>
      <text x="510" y="235" text-anchor="middle" font-size="11" fill="#475569">多张券同时发放</text>
      <rect x="630" y="190" width="150" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="705" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">单券核销</text>
      <text x="705" y="235" text-anchor="middle" font-size="11" fill="#475569">到店消费使用</text>
      <rect x="430" y="300" width="160" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="510" y="325" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">到期自动失效</text>
      <text x="510" y="345" text-anchor="middle" font-size="11" fill="#7f1d1d">未使用券回收</text>
      <rect x="630" y="300" width="150" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="705" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">购买完成</text>
      <line x1="170" y1="103" x2="185" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_couponpack)"/>
      <line x1="290" y1="136" x2="110" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_couponpack)"/>
      <text x="180" y="166" font-size="11" fill="#16a34a">积分</text>
      <line x1="390" y1="103" x2="305" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_couponpack)"/>
      <text x="370" y="150" font-size="11" fill="#16a34a">现金</text>
      <line x1="190" y1="220" x2="225" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_couponpack)"/>
      <line x1="390" y1="220" x2="425" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_couponpack)"/>
      <line x1="590" y1="220" x2="625" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_couponpack)"/>
      <line x1="510" y1="250" x2="510" y2="295" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_couponpack)"/>
      <text x="520" y="278" font-size="11" fill="#dc2626">过期</text>
      <line x1="705" y1="250" x2="705" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_couponpack)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 过期分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'group-buying',
    name: '拼团流程',
    category: 'marketing',
    desc: '会员开团后分享邀请好友参团，人数达成则拼团成功，超时失败则退款。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_group" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">拼团流程</text>
      <rect x="30" y="70" width="130" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="95" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">开团</text>
      <text x="95" y="120" text-anchor="middle" font-size="11" fill="#475569">选择商品支付</text>
      <rect x="200" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="275" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">分享邀请</text>
      <text x="275" y="120" text-anchor="middle" font-size="11" fill="#475569">微信/朋友圈</text>
      <rect x="390" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="465" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">好友参团</text>
      <text x="465" y="120" text-anchor="middle" font-size="11" fill="#475569">支付加入</text>
      <polygon points="680,70 780,103 680,136 580,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="680" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">人数达成?</text>
      <text x="680" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">3人团/5人团</text>
      <rect x="580" y="190" width="180" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="670" y="216" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">拼团成功</text>
      <text x="670" y="236" text-anchor="middle" font-size="11" fill="#475569">生成订单发货</text>
      <rect x="200" y="190" width="150" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="275" y="215" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">超时失败</text>
      <text x="275" y="235" text-anchor="middle" font-size="11" fill="#7f1d1d">24小时未达成</text>
      <rect x="390" y="190" width="150" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="465" y="215" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">原路退款</text>
      <text x="465" y="235" text-anchor="middle" font-size="11" fill="#7f1d1d">全员退款</text>
      <rect x="580" y="300" width="180" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="670" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">拼团完成</text>
      <line x1="160" y1="103" x2="195" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_group)"/>
      <line x1="350" y1="103" x2="385" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_group)"/>
      <line x1="540" y1="103" x2="575" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_group)"/>
      <line x1="680" y1="136" x2="670" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_group)"/>
      <text x="640" y="166" font-size="11" fill="#16a34a">是</text>
      <line x1="780" y1="103" x2="460" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_group)"/>
      <text x="650" y="150" font-size="11" fill="#dc2626">否(超时)</text>
      <line x1="350" y1="220" x2="385" y2="220" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_group)"/>
      <line x1="670" y1="250" x2="670" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_group)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 失败退款</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'bargain',
    name: '砍价流程',
    category: 'marketing',
    desc: '会员发起砍价后分享给好友，好友助力砍价，达到底价后可下单购买。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_bargain" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">砍价流程</text>
      <rect x="30" y="70" width="140" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="100" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">发起砍价</text>
      <text x="100" y="120" text-anchor="middle" font-size="11" fill="#475569">选择砍价商品</text>
      <rect x="210" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="285" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">分享好友</text>
      <text x="285" y="120" text-anchor="middle" font-size="11" fill="#475569">微信/群聊</text>
      <rect x="400" y="70" width="170" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="485" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">好友助力砍价</text>
      <text x="485" y="120" text-anchor="middle" font-size="11" fill="#475569">随机砍减金额</text>
      <polygon points="710,70 810,103 710,136 610,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="710" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">达到底价?</text>
      <text x="710" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">底价≥¥9.9</text>
      <rect x="400" y="190" width="170" height="60" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="485" y="216" text-anchor="middle" font-size="13" fill="#7c2d12" font-weight="600">继续邀请好友</text>
      <text x="485" y="236" text-anchor="middle" font-size="11" fill="#7c2d12">循环砍价</text>
      <rect x="610" y="190" width="180" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="700" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">达到底价</text>
      <text x="700" y="235" text-anchor="middle" font-size="11" fill="#475569">可以购买</text>
      <polygon points="700,290 800,320 700,350 600,320" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="700" y="318" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">是否购买?</text>
      <text x="700" y="336" text-anchor="middle" font-size="11" fill="#7c2d12">48小时内</text>
      <rect x="200" y="290" width="160" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="280" y="315" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">超时/放弃</text>
      <text x="280" y="335" text-anchor="middle" font-size="11" fill="#7f1d1d">砍价失效</text>
      <rect x="400" y="290" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="480" y="325" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">下单购买</text>
      <text x="480" y="345" text-anchor="middle" font-size="11" fill="#dbeafe">砍价完成</text>
      <line x1="170" y1="103" x2="205" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_bargain)"/>
      <line x1="360" y1="103" x2="395" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_bargain)"/>
      <line x1="570" y1="103" x2="605" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_bargain)"/>
      <line x1="710" y1="136" x2="485" y2="190" stroke="#d97706" stroke-width="2" marker-end="url(#ar_bargain)"/>
      <text x="580" y="166" font-size="11" fill="#d97706">否(继续)</text>
      <line x1="810" y1="103" x2="695" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_bargain)"/>
      <text x="780" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="485" y1="130" x2="485" y2="185" stroke="#d97706" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_bargain)"/>
      <line x1="700" y1="250" x2="700" y2="285" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_bargain)"/>
      <line x1="700" y1="350" x2="280" y2="290" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_bargain)"/>
      <text x="460" y="340" font-size="11" fill="#dc2626">否</text>
      <line x1="800" y1="320" x2="560" y2="320" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_bargain)"/>
      <text x="680" y="310" font-size="11" fill="#2563eb">是</text>
      <rect x="30" y="365" width="180" height="45" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="383" font-size="11" fill="#475569">— 主流程 - - 异常 ◇ 判断</text>
    </svg>`
  },
  {
    key: 'order-flow',
    name: '商城订单流程',
    category: 'mall',
    desc: '会员下单→支付→发货→完成，金额入钱包，积分入账户。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">商城订单流程</text>
      <rect x="20" y="80" width="140" height="64" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="90" y="108" text-anchor="middle" font-size="13" font-weight="600" fill="#1e3a8a">下单</text>
      <text x="90" y="128" text-anchor="middle" font-size="11" fill="#475569">shop/orders pending</text>
      <polygon points="270,80 370,112 270,144 170,112" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="270" y="108" text-anchor="middle" font-size="12" font-weight="600" fill="#7c2d12">是否支付?</text>
      <text x="270" y="126" text-anchor="middle" font-size="11" fill="#7c2d12">15分钟内</text>
      <rect x="20" y="200" width="140" height="56" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="90" y="224" text-anchor="middle" font-size="12" font-weight="600" fill="#7f1d1d">超时关闭</text>
      <text x="90" y="242" text-anchor="middle" font-size="11" fill="#7f1d1d">取消订单</text>
      <rect x="420" y="80" width="150" height="64" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="495" y="108" text-anchor="middle" font-size="13" font-weight="600" fill="#14532d">支付成功</text>
      <text x="495" y="128" text-anchor="middle" font-size="11" fill="#475569">status=paid</text>
      <rect x="620" y="80" width="150" height="64" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="695" y="108" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">发货</text>
      <text x="695" y="128" text-anchor="middle" font-size="11" fill="#475569">status=shipped</text>
      <rect x="820" y="80" width="130" height="64" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="885" y="108" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">完成</text>
      <text x="885" y="128" text-anchor="middle" font-size="11" fill="#dbeafe">status=done</text>
      <rect x="420" y="200" width="320" height="56" rx="10" fill="#ecfeff" stroke="#0891b2" stroke-width="2"/>
      <text x="580" y="224" text-anchor="middle" font-size="12" font-weight="600" fill="#155e75">联动: 钱包扣款 + 发放积分 + 销量+1</text>
      <text x="580" y="242" text-anchor="middle" font-size="11" fill="#475569">wallet/transactions + points/logs + shop/goods.sales</text>
      <rect x="420" y="310" width="320" height="50" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <text x="580" y="340" text-anchor="middle" font-size="12" fill="#475569">订单全链路完成</text>
      <line x1="160" y1="112" x2="170" y2="112" stroke="#2563eb" stroke-width="2" marker-end="url(#ar4)"/>
      <line x1="270" y1="144" x2="90" y2="200" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar4)"/>
      <text x="160" y="178" font-size="11" fill="#dc2626">否</text>
      <line x1="370" y1="112" x2="415" y2="112" stroke="#16a34a" stroke-width="2" marker-end="url(#ar4)"/>
      <text x="385" y="104" font-size="11" fill="#16a34a">是</text>
      <line x1="570" y1="112" x2="615" y2="112" stroke="#2563eb" stroke-width="2" marker-end="url(#ar4)"/>
      <line x1="770" y1="112" x2="815" y2="112" stroke="#2563eb" stroke-width="2" marker-end="url(#ar4)"/>
      <line x1="495" y1="144" x2="495" y2="195" stroke="#0891b2" stroke-width="2" marker-end="url(#ar4)"/>
      <text x="445" y="172" font-size="11" fill="#0891b2">支付触发联动</text>
      <line x1="580" y1="256" x2="580" y2="305" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#ar4)"/>
      <rect x="20" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="30" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="30" y="375" font-size="11" fill="#dc2626">- - 超时关闭</text>
      <text x="30" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'aftersale-refund',
    name: '售后退款流程',
    category: 'mall',
    desc: '会员申请退款，商家审核通过后商品退回，退款原路返回，积分同步退回。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_refund" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">售后退款流程</text>
      <rect x="30" y="70" width="160" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="110" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">会员申请退款</text>
      <text x="110" y="120" text-anchor="middle" font-size="11" fill="#475569">选择订单/原因</text>
      <rect x="230" y="70" width="160" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="310" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">商家审核</text>
      <text x="310" y="120" text-anchor="middle" font-size="11" fill="#475569">同意/拒绝</text>
      <polygon points="520,70 620,103 520,136 420,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="520" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">审核通过?</text>
      <text x="520" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">符合退款条件</text>
      <rect x="230" y="190" width="160" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="310" y="216" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">审核拒绝</text>
      <text x="310" y="236" text-anchor="middle" font-size="11" fill="#7f1d1d">通知会员原因</text>
      <rect x="420" y="190" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="500" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">商品退回</text>
      <text x="500" y="235" text-anchor="middle" font-size="11" fill="#475569">会员寄回/上门取</text>
      <rect x="620" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="700" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">退款到原路</text>
      <text x="700" y="235" text-anchor="middle" font-size="11" fill="#475569">微信/支付宝/钱包</text>
      <rect x="420" y="300" width="160" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="500" y="325" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">积分退回</text>
      <text x="500" y="345" text-anchor="middle" font-size="11" fill="#7f1d1d">扣减已发积分</text>
      <rect x="620" y="300" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="700" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">退款完成</text>
      <line x1="190" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_refund)"/>
      <line x1="390" y1="103" x2="415" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_refund)"/>
      <line x1="520" y1="136" x2="310" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_refund)"/>
      <text x="395" y="166" font-size="11" fill="#dc2626">否</text>
      <line x1="620" y1="103" x2="495" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_refund)"/>
      <text x="570" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="580" y1="220" x2="615" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_refund)"/>
      <line x1="500" y1="250" x2="500" y2="295" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_refund)"/>
      <text x="510" y="278" font-size="11" fill="#dc2626">有积分</text>
      <line x1="700" y1="250" x2="700" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_refund)"/>
      <line x1="580" y1="330" x2="615" y2="330" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_refund)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 拒绝/退回</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'verification',
    name: '核销流程',
    category: 'mall',
    desc: '会员出示核销码，商户扫码校验有效性，核销成功后记录流水，支持券/积分/订单核销。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_ver" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">核销流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">会员出示码</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">二维码/条形码</text>
      <rect x="230" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">商户扫码</text>
      <text x="305" y="120" text-anchor="middle" font-size="11" fill="#475569">POS/小程序</text>
      <polygon points="510,70 610,103 510,136 410,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="510" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">校验有效性</text>
      <text x="510" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">状态/时间/额度</text>
      <rect x="230" y="190" width="150" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="305" y="216" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">核销失败</text>
      <text x="305" y="236" text-anchor="middle" font-size="11" fill="#7f1d1d">已用/过期/无效</text>
      <rect x="410" y="190" width="180" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="500" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">核销成功</text>
      <text x="500" y="235" text-anchor="middle" font-size="11" fill="#475569">更新状态为已核销</text>
      <rect x="630" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="710" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">记录核销流水</text>
      <text x="710" y="235" text-anchor="middle" font-size="11" fill="#475569">verification/logs</text>
      <rect x="410" y="300" width="180" height="60" rx="10" fill="#ecfeff" stroke="#0891b2" stroke-width="2"/>
      <text x="500" y="325" text-anchor="middle" font-size="13" fill="#155e75" font-weight="600">联动业务</text>
      <text x="500" y="345" text-anchor="middle" font-size="11" fill="#475569">扣积分/销券/订单完成</text>
      <rect x="630" y="300" width="160" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="710" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">核销完成</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ver)"/>
      <line x1="380" y1="103" x2="405" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ver)"/>
      <line x1="510" y1="136" x2="305" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_ver)"/>
      <text x="390" y="166" font-size="11" fill="#dc2626">否</text>
      <line x1="610" y1="103" x2="485" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_ver)"/>
      <text x="560" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="590" y1="220" x2="625" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ver)"/>
      <line x1="500" y1="250" x2="500" y2="295" stroke="#0891b2" stroke-width="2" marker-end="url(#ar_ver)"/>
      <line x1="590" y1="330" x2="625" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ver)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 失败分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'customer-service',
    name: '客服工单流程',
    category: 'service',
    desc: '会员提交工单，客服受理并处理，处理完成后通知会员，支持评价满意度。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_cs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">客服工单流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">会员提交工单</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">问题描述/截图</text>
      <rect x="230" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">客服受理</text>
      <text x="305" y="120" text-anchor="middle" font-size="11" fill="#475569">分配工单</text>
      <polygon points="500,70 600,103 500,136 400,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="500" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">需升级处理?</text>
      <text x="500" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">复杂问题</text>
      <rect x="230" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="305" y="216" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">客服直接处理</text>
      <text x="305" y="236" text-anchor="middle" font-size="11" fill="#475569">一线客服解决</text>
      <rect x="400" y="190" width="180" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="490" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">升级主管/技术</text>
      <text x="490" y="235" text-anchor="middle" font-size="11" fill="#475569">二线跟进处理</text>
      <rect x="620" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="700" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">处理完成</text>
      <text x="700" y="235" text-anchor="middle" font-size="11" fill="#475569">更新工单状态</text>
      <rect x="400" y="300" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="480" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">通知会员</text>
      <text x="480" y="345" text-anchor="middle" font-size="11" fill="#475569">短信/站内信</text>
      <rect x="600" y="300" width="180" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="690" y="325" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">会员评价满意度</text>
      <text x="690" y="345" text-anchor="middle" font-size="11" fill="#dbeafe">工单关闭</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cs)"/>
      <line x1="380" y1="103" x2="395" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cs)"/>
      <line x1="500" y1="136" x2="305" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_cs)"/>
      <text x="380" y="166" font-size="11" fill="#16a34a">否</text>
      <line x1="600" y1="103" x2="485" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_cs)"/>
      <text x="560" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="380" y1="220" x2="395" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_cs)"/>
      <line x1="580" y1="220" x2="615" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cs)"/>
      <line x1="700" y1="250" x2="480" y2="300" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cs)"/>
      <line x1="560" y1="330" x2="595" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cs)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#16a34a">— 处理分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'points-mall-exchange',
    name: '积分商城兑换流程',
    category: 'points',
    desc: '会员浏览积分商品，使用积分兑换，系统扣减积分并生成积分商城订单，实物发货或到店自提完成履约。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_pex" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">积分商城兑换流程</text>
      <rect x="30" y="70" width="140" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="100" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">浏览积分商品</text>
      <text x="100" y="120" text-anchor="middle" font-size="11" fill="#475569">points/goods</text>
      <rect x="220" y="70" width="140" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="290" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">提交兑换</text>
      <text x="290" y="120" text-anchor="middle" font-size="11" fill="#475569">选择规格/数量</text>
      <polygon points="500,70 600,103 500,136 400,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="500" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">积分/库存充足?</text>
      <text x="500" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">检查余额</text>
      <rect x="220" y="190" width="140" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="290" y="216" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">兑换失败</text>
      <text x="290" y="236" text-anchor="middle" font-size="11" fill="#7f1d1d">积分不足/售罄</text>
      <rect x="400" y="190" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="480" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">扣减积分</text>
      <text x="480" y="235" text-anchor="middle" font-size="11" fill="#475569">points/logs -N</text>
      <rect x="600" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="680" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">生成积分订单</text>
      <text x="680" y="235" text-anchor="middle" font-size="11" fill="#475569">points/mall-orders</text>
      <polygon points="820,190 920,220 820,250 720,220" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="820" y="218" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">提货方式</text>
      <text x="820" y="236" text-anchor="middle" font-size="11" fill="#7c2d12">自提/邮寄?</text>
      <rect x="600" y="290" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="680" y="315" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">门店自提</text>
      <text x="680" y="335" text-anchor="middle" font-size="11" fill="#475569">核销后完成</text>
      <rect x="790" y="290" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="870" y="315" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">快递发货</text>
      <text x="870" y="335" text-anchor="middle" font-size="11" fill="#475569">物流签收完成</text>
      <rect x="680" y="360" width="160" height="50" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="760" y="390" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">兑换完成</text>
      <line x1="170" y1="103" x2="215" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pex)"/>
      <line x1="360" y1="103" x2="395" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pex)"/>
      <line x1="500" y1="136" x2="290" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_pex)"/>
      <text x="380" y="166" font-size="11" fill="#dc2626">否</text>
      <line x1="600" y1="103" x2="475" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_pex)"/>
      <text x="550" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="560" y1="220" x2="595" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pex)"/>
      <line x1="760" y1="220" x2="715" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pex)"/>
      <line x1="820" y1="250" x2="680" y2="290" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_pex)"/>
      <text x="720" y="278" font-size="11" fill="#16a34a">自提</text>
      <line x1="920" y1="220" x2="870" y2="290" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_pex)"/>
      <text x="910" y="278" font-size="11" fill="#16a34a">邮寄</text>
      <line x1="680" y1="350" x2="720" y2="360" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pex)"/>
      <line x1="870" y1="350" x2="800" y2="360" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pex)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 失败分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'self-help-points',
    name: '自助积分流程',
    category: 'points',
    desc: '会员上传消费小票，OCR识别消费信息，匹配积分规则计算积分，人工/AI审核后发放到账。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_shp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">自助积分流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">会员上传小票</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">拍照/PDF导入</text>
      <rect x="230" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">OCR识别</text>
      <text x="305" y="120" text-anchor="middle" font-size="11" fill="#475569">金额/商户/时间</text>
      <rect x="430" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="505" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">匹配积分规则</text>
      <text x="505" y="120" text-anchor="middle" font-size="11" fill="#475569">业态/门店/倍率</text>
      <rect x="630" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="705" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">计算应得积分</text>
      <text x="705" y="120" text-anchor="middle" font-size="11" fill="#475569">金额×倍率</text>
      <polygon points="855,70 930,103 855,136 780,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="855" y="100" text-anchor="middle" font-size="12" font-weight="600" fill="#7c2d12">进入审核?</text>
      <text x="855" y="118" text-anchor="middle" font-size="11" fill="#7c2d12">命中风控/低置信</text>
      <rect x="430" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="505" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">AI自动审核</text>
      <text x="505" y="235" text-anchor="middle" font-size="11" fill="#475569">高置信度通过</text>
      <rect x="630" y="190" width="150" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="705" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">人工审核</text>
      <text x="705" y="235" text-anchor="middle" font-size="11" fill="#475569">运营复核</text>
      <polygon points="855,190 930,220 855,250 780,220" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="855" y="218" text-anchor="middle" font-size="12" font-weight="600" fill="#7c2d12">审核通过?</text>
      <rect x="630" y="290" width="150" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="705" y="315" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">审核拒绝</text>
      <text x="705" y="335" text-anchor="middle" font-size="11" fill="#7f1d1d">通知补充材料</text>
      <rect x="830" y="290" width="120" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="890" y="325" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">积分到账</text>
      <text x="890" y="345" text-anchor="middle" font-size="11" fill="#dbeafe">通知会员</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_shp)"/>
      <line x1="380" y1="103" x2="425" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_shp)"/>
      <line x1="580" y1="103" x2="625" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_shp)"/>
      <line x1="780" y1="103" x2="775" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_shp)"/>
      <line x1="855" y1="136" x2="505" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_shp)"/>
      <text x="700" y="170" font-size="11" fill="#16a34a">自动</text>
      <line x1="930" y1="103" x2="775" y2="190" stroke="#d97706" stroke-width="2" marker-end="url(#ar_shp)"/>
      <text x="870" y="150" font-size="11" fill="#d97706">人工</text>
      <line x1="580" y1="220" x2="625" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_shp)"/>
      <line x1="780" y1="220" x2="775" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_shp)"/>
      <line x1="855" y1="250" x2="705" y2="290" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_shp)"/>
      <text x="760" y="278" font-size="11" fill="#dc2626">否</text>
      <line x1="930" y1="220" x2="830" y2="290" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_shp)"/>
      <text x="900" y="260" font-size="11" fill="#16a34a">是</text>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 拒绝分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'points-settlement',
    name: '积分结算流程',
    category: 'points',
    desc: '按项目、业态、商户汇总积分发放数据，根据结算规则生成结算单，平台与商户完成积分成本清算。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_ps" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">积分结算流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">汇总积分流水</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">周期内所有发放</text>
      <rect x="230" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">按项目/业态分组</text>
      <text x="305" y="120" text-anchor="middle" font-size="11" fill="#475569">points/logs分类</text>
      <rect x="430" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="505" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">匹配结算规则</text>
      <text x="505" y="120" text-anchor="middle" font-size="11" fill="#475569">settle-rule优先级</text>
      <rect x="630" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="705" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">计算结算金额</text>
      <text x="705" y="120" text-anchor="middle" font-size="11" fill="#475569">积分×结算比例</text>
      <polygon points="880,70 955,103 880,136 805,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="880" y="100" text-anchor="middle" font-size="12" font-weight="600" fill="#7c2d12">金额调整?</text>
      <rect x="630" y="190" width="150" height="60" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="705" y="215" text-anchor="middle" font-size="13" fill="#475569" font-weight="600">人工调整</text>
      <text x="705" y="235" text-anchor="middle" font-size="11" fill="#475569">运营复核修正</text>
      <rect x="820" y="190" width="140" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="890" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">生成结算单</text>
      <text x="890" y="235" text-anchor="middle" font-size="11" fill="#475569">points/settle-bill</text>
      <rect x="430" y="300" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="510" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">财务审批</text>
      <text x="510" y="345" text-anchor="middle" font-size="11" fill="#475569">审批通过</text>
      <rect x="630" y="300" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="710" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">商户确认</text>
      <text x="710" y="345" text-anchor="middle" font-size="11" fill="#475569">在线确认/盖章</text>
      <rect x="830" y="300" width="130" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="895" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">打款结算</text>
      <text x="895" y="355" text-anchor="middle" font-size="11" fill="#dbeafe">结算完成</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <line x1="380" y1="103" x2="425" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <line x1="580" y1="103" x2="625" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <line x1="780" y1="103" x2="800" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <line x1="880" y1="136" x2="705" y2="190" stroke="#d97706" stroke-width="2" marker-end="url(#ar_ps)"/>
      <text x="760" y="170" font-size="11" fill="#d97706">是</text>
      <line x1="955" y1="103" x2="890" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_ps)"/>
      <text x="930" y="150" font-size="11" fill="#16a34a">否</text>
      <line x1="760" y1="250" x2="800" y2="250" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <line x1="890" y1="250" x2="890" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <line x1="890" y1="360" x2="710" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <text x="810" y="350" font-size="11" fill="#2563eb">←</text>
      <line x1="590" y1="330" x2="625" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <line x1="790" y1="330" x2="825" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_ps)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#64748b">- - 调整分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'seckill-flow',
    name: '秒杀活动流程',
    category: 'marketing',
    desc: '运营配置秒杀商品、库存和价格，活动开始时会员抢购，支付成功锁定库存，超时未支付自动释放。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_sk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">秒杀活动流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">创建秒杀活动</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">配置商品/价/库存</text>
      <rect x="230" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">活动开始</text>
      <text x="305" y="120" text-anchor="middle" font-size="11" fill="#475569">倒计时结束</text>
      <rect x="430" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="505" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">会员抢购下单</text>
      <text x="505" y="120" text-anchor="middle" font-size="11" fill="#475569">锁定库存</text>
      <polygon points="710,70 810,103 710,136 610,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="710" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">是否支付?</text>
      <text x="710" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">5分钟内</text>
      <rect x="430" y="190" width="150" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="505" y="215" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">超时未支付</text>
      <text x="505" y="235" text-anchor="middle" font-size="11" fill="#7f1d1d">库存自动释放</text>
      <rect x="630" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="705" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">支付成功</text>
      <text x="705" y="235" text-anchor="middle" font-size="11" fill="#475569">扣减库存生成订单</text>
      <rect x="830" y="190" width="110" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="885" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">发货/自提</text>
      <text x="885" y="235" text-anchor="middle" font-size="11" fill="#475569">履约完成</text>
      <rect x="630" y="300" width="150" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="705" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">秒杀完成</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_sk)"/>
      <line x1="380" y1="103" x2="425" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_sk)"/>
      <line x1="580" y1="103" x2="605" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_sk)"/>
      <line x1="710" y1="136" x2="505" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_sk)"/>
      <text x="590" y="170" font-size="11" fill="#dc2626">否</text>
      <line x1="810" y1="103" x2="700" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_sk)"/>
      <text x="770" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="780" y1="220" x2="825" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_sk)"/>
      <line x1="705" y1="250" x2="705" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_sk)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 超时释放</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'countdown-sale-flow',
    name: '限时购流程',
    category: 'marketing',
    desc: '在指定时间段内以活动价销售商品，会员在活动期内下单享受特价，活动结束后价格恢复原价。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_cd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">限时购流程</text>
      <rect x="30" y="70" width="150" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="105" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">配置限时购</text>
      <text x="105" y="120" text-anchor="middle" font-size="11" fill="#475569">商品/活动价/时间</text>
      <rect x="230" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="305" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">活动预热</text>
      <text x="305" y="120" text-anchor="middle" font-size="11" fill="#475569">首页/Banner曝光</text>
      <rect x="430" y="70" width="150" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="505" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">活动开始</text>
      <text x="505" y="120" text-anchor="middle" font-size="11" fill="#475569">价格切换为活动价</text>
      <polygon points="710,70 810,103 710,136 610,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="710" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">活动期间?</text>
      <text x="710" y="120" text-anchor="middle" font-size="11" fill="#7c2d12"> startTime&lt;=now&lt;=endTime </text>
      <rect x="430" y="190" width="150" height="60" rx="10" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="505" y="215" text-anchor="middle" font-size="13" fill="#475569" font-weight="600">活动未开始/已结束</text>
      <text x="505" y="235" text-anchor="middle" font-size="11" fill="#475569">显示原价</text>
      <rect x="630" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="705" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">按活动价下单</text>
      <text x="705" y="235" text-anchor="middle" font-size="11" fill="#475569">库存正常扣减</text>
      <rect x="630" y="300" width="150" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="705" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">支付发货</text>
      <text x="705" y="345" text-anchor="middle" font-size="11" fill="#475569">标准订单履约</text>
      <rect x="830" y="300" width="110" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="885" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">限时购完成</text>
      <line x1="180" y1="103" x2="225" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cd)"/>
      <line x1="380" y1="103" x2="425" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cd)"/>
      <line x1="580" y1="103" x2="605" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cd)"/>
      <line x1="710" y1="136" x2="505" y2="190" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_cd)"/>
      <text x="590" y="170" font-size="11" fill="#64748b">否</text>
      <line x1="810" y1="103" x2="700" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_cd)"/>
      <text x="770" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="705" y1="250" x2="705" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cd)"/>
      <line x1="780" y1="330" x2="825" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_cd)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#64748b">- - 非活动期</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'pre-sale-flow',
    name: '预售流程',
    category: 'marketing',
    desc: '会员在活动期内支付定金锁定商品，尾款期支付尾款后商家按预售量备货发货，未付尾款定金不退。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_pre" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">预售流程</text>
      <rect x="30" y="70" width="140" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="100" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">创建预售</text>
      <text x="100" y="120" text-anchor="middle" font-size="11" fill="#475569">定金/尾款/发货时间</text>
      <rect x="220" y="70" width="140" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="290" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">支付定金</text>
      <text x="290" y="120" text-anchor="middle" font-size="11" fill="#475569">锁定库存/生成订单</text>
      <rect x="410" y="70" width="140" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="480" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">进入尾款期</text>
      <text x="480" y="120" text-anchor="middle" font-size="11" fill="#475569">消息提醒</text>
      <polygon points="710,70 810,103 710,136 610,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="710" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">支付尾款?</text>
      <text x="710" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">7天内</text>
      <rect x="430" y="190" width="150" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="505" y="215" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">未付尾款</text>
      <text x="505" y="235" text-anchor="middle" font-size="11" fill="#7f1d1d">定金不退/释放库存</text>
      <rect x="630" y="190" width="150" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="705" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">支付尾款成功</text>
      <text x="705" y="235" text-anchor="middle" font-size="11" fill="#475569">按预售量备货</text>
      <rect x="630" y="300" width="150" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="705" y="325" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">发货履约</text>
      <text x="705" y="345" text-anchor="middle" font-size="11" fill="#475569">物流/自提</text>
      <rect x="830" y="300" width="110" height="60" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="885" y="335" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">预售完成</text>
      <line x1="170" y1="103" x2="215" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pre)"/>
      <line x1="360" y1="103" x2="405" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pre)"/>
      <line x1="550" y1="103" x2="605" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pre)"/>
      <line x1="710" y1="136" x2="505" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_pre)"/>
      <text x="590" y="170" font-size="11" fill="#dc2626">否</text>
      <line x1="810" y1="103" x2="700" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_pre)"/>
      <text x="770" y="150" font-size="11" fill="#16a34a">是</text>
      <line x1="705" y1="250" x2="705" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pre)"/>
      <line x1="780" y1="330" x2="825" y2="330" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_pre)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 违约分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'review-audit-flow',
    name: '商品评价审核流程',
    category: 'mall',
    desc: '会员提交商品评价后，系统按敏感词和规则自动审核，异常评价进入人工复核，审核通过后展示在商品详情。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar_rv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">商品评价审核流程</text>
      <rect x="30" y="70" width="140" height="66" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="100" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#1e3a8a">提交评价</text>
      <text x="100" y="120" text-anchor="middle" font-size="11" fill="#475569">评分/文字/图片</text>
      <rect x="220" y="70" width="140" height="66" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="290" y="98" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">系统预审</text>
      <text x="290" y="120" text-anchor="middle" font-size="11" fill="#475569">敏感词/图片合规</text>
      <polygon points="510,70 610,103 510,136 410,103" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="510" y="100" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">命中敏感?</text>
      <text x="510" y="120" text-anchor="middle" font-size="11" fill="#7c2d12">风险内容</text>
      <rect x="220" y="190" width="140" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="290" y="215" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">自动通过</text>
      <text x="290" y="235" text-anchor="middle" font-size="11" fill="#475569">直接展示</text>
      <rect x="410" y="190" width="160" height="60" rx="10" fill="#fff" stroke="#2563eb" stroke-width="2"/>
      <text x="490" y="215" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">人工复核</text>
      <text x="490" y="235" text-anchor="middle" font-size="11" fill="#475569">运营审核</text>
      <polygon points="710,190 810,220 710,250 610,220" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="710" y="218" text-anchor="middle" font-size="13" font-weight="600" fill="#7c2d12">人工通过?</text>
      <rect x="410" y="290" width="160" height="60" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="490" y="315" text-anchor="middle" font-size="13" fill="#7f1d1d" font-weight="600">隐藏/驳回</text>
      <text x="490" y="335" text-anchor="middle" font-size="11" fill="#7f1d1d">通知会员原因</text>
      <rect x="610" y="290" width="160" height="60" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="690" y="315" text-anchor="middle" font-size="13" fill="#14532d" font-weight="600">展示评价</text>
      <text x="690" y="335" text-anchor="middle" font-size="11" fill="#475569">商品详情可见</text>
      <rect x="610" y="360" width="160" height="50" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="690" y="390" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">评价流程完成</text>
      <line x1="170" y1="103" x2="215" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_rv)"/>
      <line x1="360" y1="103" x2="405" y2="103" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_rv)"/>
      <line x1="510" y1="136" x2="290" y2="190" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_rv)"/>
      <text x="380" y="166" font-size="11" fill="#16a34a">否</text>
      <line x1="610" y1="103" x2="485" y2="190" stroke="#d97706" stroke-width="2" marker-end="url(#ar_rv)"/>
      <text x="570" y="150" font-size="11" fill="#d97706">是</text>
      <line x1="360" y1="220" x2="405" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_rv)"/>
      <line x1="570" y1="220" x2="605" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_rv)"/>
      <line x1="710" y1="250" x2="490" y2="290" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar_rv)"/>
      <text x="590" y="278" font-size="11" fill="#dc2626">否</text>
      <line x1="810" y1="220" x2="690" y2="290" stroke="#16a34a" stroke-width="2" marker-end="url(#ar_rv)"/>
      <text x="760" y="260" font-size="11" fill="#16a34a">是</text>
      <line x1="690" y1="350" x2="690" y2="360" stroke="#2563eb" stroke-width="2" marker-end="url(#ar_rv)"/>
      <rect x="30" y="340" width="180" height="60" fill="#fff" stroke="#cbd5e1" rx="6"/>
      <text x="40" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="40" y="375" font-size="11" fill="#dc2626">- - 隐藏分支</text>
      <text x="40" y="392" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
];

export default function BusinessFlow() {
  const [selected, setSelected] = useState(FLOWS[0].key);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const flow = FLOWS.find((f) => f.key === selected)!;

  const moduleStub = {
    key: 'business-flow', path: 'business/flow', name: '业务流程', category: '系统',
    columns: [], fields: [],
    doc: { overview: '业务流程图展示页，左侧分类导航切换查看各核心业务的完整流转过程。', features: ['24个核心业务流程', '可视化流程节点', '分类导航快速定位', '说明各环节联动关系'] }
  };

  const filteredFlows = activeCategory === 'all'
    ? FLOWS
    : FLOWS.filter(f => f.category === activeCategory);

  const getCategoryCount = (catKey: string) =>
    FLOWS.filter(f => f.category === catKey).length;

  const getCategoryColor = (catKey: string) =>
    CATEGORIES.find(c => c.key === catKey)?.color || '#2563eb';

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Title level={4} style={{ margin: 0 }}>业务流程图</Title>
            <Badge count={`共 ${FLOWS.length} 个流程`} style={{ backgroundColor: '#2563eb' }} />
          </div>
        }
        extra={<FeatureDescription module={moduleStub as any} />}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', minHeight: 600 }}>
          <div style={{
            width: 260,
            borderRight: '1px solid #f0f0f0',
            background: '#fafafa',
            padding: '16px 0',
          }}>
            <div style={{ padding: '0 16px 12px', fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
              流程分类
            </div>

            <div
              role="button"
              tabIndex={0}
              aria-label="全部流程"
              onClick={() => setActiveCategory('all')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveCategory('all'); } }}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: activeCategory === 'all' ? '#eff6ff' : 'transparent',
                borderLeft: activeCategory === 'all' ? '3px solid #2563eb' : '3px solid transparent',
                transition: 'background-color 0.2s, color 0.2s',
                fontWeight: activeCategory === 'all' ? 600 : 400,
                color: activeCategory === 'all' ? '#2563eb' : '#334155',
                fontSize: 13,
              }}
            >
              <span>📋 全部流程</span>
              <Tag color="default" style={{ margin: 0 }}>{FLOWS.length}</Tag>
            </div>

            {CATEGORIES.map(cat => (
              <div key={cat.key}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={cat.name}
                  onClick={() => setActiveCategory(cat.key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveCategory(cat.key); } }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: activeCategory === cat.key ? '#eff6ff' : 'transparent',
                    borderLeft: activeCategory === cat.key ? `3px solid ${cat.color}` : '3px solid transparent',
                    transition: 'background-color 0.2s, color 0.2s',
                    fontWeight: activeCategory === cat.key ? 600 : 400,
                    color: activeCategory === cat.key ? cat.color : '#334155',
                    fontSize: 13,
                  }}
                >
                  <span>{cat.icon} {cat.name}</span>
                  <Tag color={cat.key === 'member' ? 'blue' : cat.key === 'points' ? 'green' : cat.key === 'marketing' ? 'orange' : cat.key === 'mall' ? 'red' : 'cyan'} style={{ margin: 0 }}>
                    {getCategoryCount(cat.key)}
                  </Tag>
                </div>
              </div>
            ))}

            <div style={{ padding: '16px 16px 8px', fontWeight: 600, color: '#0f172a', fontSize: 14, marginTop: 8 }}>
              流程列表
            </div>

            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {filteredFlows.map(f => (
                <div
                  key={f.key}
                  role="button"
                  tabIndex={0}
                  aria-label={f.name}
                  onClick={() => setSelected(f.key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(f.key); } }}
                  style={{
                    padding: '10px 16px 10px 28px',
                    cursor: 'pointer',
                    fontSize: 13,
                    borderLeft: selected === f.key ? `3px solid ${getCategoryColor(f.category)}` : '3px solid transparent',
                    background: selected === f.key ? '#fff' : 'transparent',
                    color: selected === f.key ? '#0f172a' : '#475569',
                    fontWeight: selected === f.key ? 600 : 400,
                    transition: 'background-color 0.2s, color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: getCategoryColor(f.category),
                    flexShrink: 0,
                  }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0 }}>{flow.name}</Title>
                <Tag color={
                  flow.category === 'member' ? 'blue' :
                  flow.category === 'points' ? 'green' :
                  flow.category === 'marketing' ? 'orange' :
                  flow.category === 'mall' ? 'red' : 'cyan'
                }>
                  {CATEGORIES.find(c => c.key === flow.category)?.name}
                </Tag>
              </div>
              <Paragraph type="secondary" style={{ margin: 0 }}>{flow.desc}</Paragraph>
            </div>

            {flow.svg ? (
              <div
                style={{
                  background: '#fff',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  overflow: 'auto',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
                dangerouslySetInnerHTML={{ __html: flow.svg }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                暂无流程图
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <Card size="small" title="流程说明" style={{ borderRadius: 8 }}>
                <Paragraph style={{ marginBottom: 8 }}>
                  <Text strong>流程名称：</Text>{flow.name}
                </Paragraph>
                <Paragraph style={{ marginBottom: 8 }}>
                  <Text strong>所属分类：</Text>
                  <Tag color={
                    flow.category === 'member' ? 'blue' :
                    flow.category === 'points' ? 'green' :
                    flow.category === 'marketing' ? 'orange' :
                    flow.category === 'mall' ? 'red' : 'cyan'
                  }>
                    {CATEGORIES.find(c => c.key === flow.category)?.name}
                  </Tag>
                </Paragraph>
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text strong>详细描述：</Text>{flow.desc}
                </Paragraph>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
