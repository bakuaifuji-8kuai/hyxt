import { useState } from 'react';
import { Card, Select, Empty, Typography } from 'antd';
import FeatureDescription from '../components/FeatureDescription';

const { Paragraph } = Typography;

// Business flow definitions. Each flow has an inline SVG diagram (generated via fireworks-tech-graph style).
const FLOWS: { key: string; name: string; desc: string; svg: string }[] = [
  {
    key: 'member-register',
    name: '会员注册流程',
    desc: '顾客通过门店/小程序注册成为会员，系统自动初始化档案、等级、钱包、积分账户。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs>
        <marker id="ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker>
      </defs>
      <rect x="0" y="0" width="960" height="420" fill="#f8fafc"/>
      <text x="480" y="36" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">会员注册流程</text>
      <!-- nodes -->
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
      <!-- arrows -->
      <line x1="190" y1="115" x2="245" y2="115" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="420" y1="115" x2="475" y2="115" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="650" y1="115" x2="670" y2="115" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="770" y1="150" x2="335" y2="220" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar1)"/>
      <text x="540" y="180" font-size="11" fill="#dc2626">否</text>
      <line x1="770" y1="150" x2="565" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#ar1)"/>
      <text x="690" y="180" font-size="11" fill="#16a34a">是</text>
      <line x1="650" y1="250" x2="705" y2="250" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <line x1="565" y1="280" x2="565" y2="325" stroke="#2563eb" stroke-width="2" marker-end="url(#ar1)"/>
      <!-- legend -->
      <rect x="40" y="340" width="180" height="50" fill="#fff" stroke="#cbd5e1"/>
      <text x="50" y="358" font-size="11" fill="#475569">— 主流程</text>
      <text x="50" y="375" font-size="11" fill="#dc2626">- - 异常分支</text>
      <text x="50" y="388" font-size="11" fill="#d97706">◇ 判断节点</text>
    </svg>`
  },
  {
    key: 'points-issue',
    name: '积分发放流程',
    desc: '会员消费/签到/参与活动等场景，按规则计算并发放积分，写入积分流水并更新余额。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 380" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs>
        <marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker>
      </defs>
      <rect width="960" height="380" fill="#f8fafc"/>
      <text x="480" y="34" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">积分发放流程</text>
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
      <rect x="430" y="300" width="160" height="50" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="510" y="331" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">发放完成</text>
      <line x1="170" y1="102" x2="215" y2="102" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="380" y1="102" x2="425" y2="102" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="590" y1="102" x2="655" y2="102" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="760" y1="134" x2="300" y2="200" stroke="#16a34a" stroke-width="2" marker-end="url(#ar2)"/>
      <text x="520" y="170" font-size="11" fill="#16a34a">计算最终积分</text>
      <line x1="380" y1="232" x2="425" y2="232" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="590" y1="232" x2="635" y2="232" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
      <line x1="510" y1="264" x2="510" y2="295" stroke="#2563eb" stroke-width="2" marker-end="url(#ar2)"/>
    </svg>`
  },
  {
    key: 'coupon-campaign',
    name: '礼券发放流程',
    desc: '创建券模板→活动配置发券→会员领取→核销，全链路数据流转。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 360" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="360" fill="#f8fafc"/>
      <text x="480" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">礼券发放与核销流程</text>
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
      <rect x="430" y="280" width="150" height="50" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="505" y="311" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">核销完成</text>
      <line x1="180" y1="100" x2="225" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="380" y1="100" x2="425" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="580" y1="100" x2="625" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="780" y1="100" x2="825" y2="100" stroke="#2563eb" stroke-width="2" marker-end="url(#ar3)"/>
      <line x1="505" y1="130" x2="505" y2="185" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar3)"/>
      <text x="515" y="160" font-size="11" fill="#dc2626">超期</text>
      <line x1="885" y1="130" x2="885" y2="305" stroke="#16a34a" stroke-width="2"/>
      <path d="M885,305 Q885,330 855,330 L580,330" fill="none" stroke="#16a34a" stroke-width="2" marker-end="url(#ar3)"/>
      <text x="720" y="324" font-size="11" fill="#16a34a">回写核销状态</text>
    </svg>`
  },
  {
    key: 'order-flow',
    name: '商城订单流程',
    desc: '会员下单→支付→发货→完成，金额入钱包，积分入账户。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 340" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="340" fill="#f8fafc"/>
      <text x="480" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">商城订单流程</text>
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
      <line x1="160" y1="112" x2="170" y2="112" stroke="#2563eb" stroke-width="2" marker-end="url(#ar4)"/>
      <line x1="270" y1="144" x2="90" y2="200" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar4)"/>
      <text x="160" y="178" font-size="11" fill="#dc2626">否</text>
      <line x1="370" y1="112" x2="415" y2="112" stroke="#16a34a" stroke-width="2" marker-end="url(#ar4)"/>
      <text x="385" y="104" font-size="11" fill="#16a34a">是</text>
      <line x1="570" y1="112" x2="615" y2="112" stroke="#2563eb" stroke-width="2" marker-end="url(#ar4)"/>
      <line x1="770" y1="112" x2="815" y2="112" stroke="#2563eb" stroke-width="2" marker-end="url(#ar4)"/>
      <line x1="495" y1="144" x2="495" y2="195" stroke="#0891b2" stroke-width="2" marker-end="url(#ar4)"/>
      <text x="445" y="172" font-size="11" fill="#0891b2">支付触发联动</text>
    </svg>`
  },
  {
    key: 'parking-flow',
    name: '停车积分流程',
    desc: '车辆入场→出场结算→会员自动识别→按等级权益免费时长/积分奖励。',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 320" font-family="-apple-system,Segoe UI,Roboto,sans-serif">
      <defs><marker id="ar5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs>
      <rect width="960" height="320" fill="#f8fafc"/>
      <text x="480" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">停车积分流程</text>
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
      <rect x="440" y="270" width="380" height="40" rx="10" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
      <text x="630" y="296" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">停车记录入库 parking/records</text>
      <line x1="170" y1="110" x2="215" y2="110" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="380" y1="110" x2="435" y2="110" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="620" y1="110" x2="665" y2="110" stroke="#16a34a" stroke-width="2" marker-end="url(#ar5)"/>
      <text x="640" y="100" font-size="11" fill="#16a34a">是</text>
      <line x1="530" y1="140" x2="530" y2="185" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#ar5)"/>
      <text x="540" y="165" font-size="11" fill="#dc2626">否</text>
      <line x1="745" y1="140" x2="745" y2="185" stroke="#0891b2" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="630" y1="248" x2="630" y2="265" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
      <line x1="745" y1="248" x2="745" y2="265" stroke="#2563eb" stroke-width="2" marker-end="url(#ar5)"/>
    </svg>`
  }
];

export default function BusinessFlow() {
  const [selected, setSelected] = useState(FLOWS[0].key);
  const flow = FLOWS.find((f) => f.key === selected)!;

  const moduleStub = {
    key: 'business-flow', path: 'business/flow', name: '业务流程', category: '系统',
    columns: [], fields: [],
    doc: { overview: '业务流程图展示页，下拉切换查看各核心业务的完整流转过程。', features: ['多业务流程切换', '可视化流程节点', '说明各环节联动关系'] }
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title="业务流程图"
        extra={<FeatureDescription module={moduleStub as any} />}
      >
        <div style={{ marginBottom: 16 }}>
          <Select
            value={selected}
            onChange={setSelected}
            style={{ width: 280 }}
            options={FLOWS.map((f) => ({ label: f.name, value: f.key }))}
          />
        </div>
        <Paragraph type="secondary">{flow.desc}</Paragraph>
        {flow.svg ? (
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: flow.svg }} />
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
}
