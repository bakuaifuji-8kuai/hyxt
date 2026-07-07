import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Statistic, Input, Select, Button, Badge, Drawer, Modal,
  Form, InputNumber, DatePicker, Space, Popconfirm, message, Tag, Empty, Spin,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ReloadOutlined,
  FireOutlined, TeamOutlined, TrophyOutlined, CrownOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined, PauseCircleOutlined,
  TagOutlined, GiftOutlined, ThunderboltOutlined, ClockCircleOutlined,
  ScissorOutlined, InboxOutlined as BoxOutlined, IdcardOutlined,
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData } from '../services/request';
import dayjs from 'dayjs';

// ======================== 类型定义 ========================

interface ModuleConfig {
  key: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  group: string;
  fields: FieldDef[];
}

interface FieldDef {
  name: string;
  label: string;
  type: 'input' | 'number' | 'select' | 'date' | 'daterange' | 'text' | 'goods-select';
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  multiple?: boolean;
  selectMode?: 'goods' | 'category' | 'both';
  source?: {
    path: string;
    labelField: string;
    valueField: string;
  };
}

interface ActivityItem {
  id: number;
  [key: string]: any;
}

type ActivityGroup = 'promotion' | 'social' | 'game' | 'member';

// ======================== 常量配置 ========================

const GROUP_MAP: Record<ActivityGroup, { label: string; color: string; icon: React.ReactNode }> = {
  promotion: { label: '促销活动', color: '#f5222d', icon: <FireOutlined /> },
  social: { label: '社交互动', color: '#1890ff', icon: <TeamOutlined /> },
  game: { label: '互动游戏', color: '#722ed1', icon: <TrophyOutlined /> },
  member: { label: '会员运营', color: '#52c41a', icon: <CrownOutlined /> },
};

const MODULE_CONFIGS: ModuleConfig[] = [
  {
    key: 'campaigns', path: 'marketing/campaigns', label: '营销活动', icon: <TagOutlined />, group: 'promotion',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'type', label: '活动类型', type: 'select', required: true, options: [
        { label: '促销', value: 'promotion' }, { label: '会员日', value: 'memberday' }, { label: '节日', value: 'festival' },
      ] },
      { name: 'goods', label: '适用商品', type: 'goods-select', required: true, selectMode: 'both', multiple: true },
      { name: 'startTime', label: '开始时间', type: 'date', required: true },
      { name: 'endTime', label: '结束时间', type: 'date', required: true },
      { name: 'budget', label: '预算(元)', type: 'number', required: true },
    ],
  },
  {
    key: 'countdown', path: 'marketing/countdown', label: '限时购', icon: <ClockCircleOutlined />, group: 'promotion',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'goods', label: '活动商品', type: 'goods-select', required: true, selectMode: 'goods', multiple: true },
      { name: 'price', label: '活动价', type: 'number', required: true },
      { name: 'originalPrice', label: '原价', type: 'number', required: true },
      { name: 'startTime', label: '开始时间', type: 'date', required: true },
      { name: 'endTime', label: '结束时间', type: 'date', required: true },
    ],
  },
  {
    key: 'seckill', path: 'marketing/seckill', label: '秒杀活动', icon: <ThunderboltOutlined />, group: 'promotion',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'goods', label: '秒杀商品', type: 'goods-select', required: true, selectMode: 'goods', multiple: true },
      { name: 'price', label: '秒杀价', type: 'number', required: true },
      { name: 'originalPrice', label: '原价', type: 'number', required: true },
      { name: 'stock', label: '库存', type: 'number', required: true },
      { name: 'startTime', label: '开始时间', type: 'date', required: true },
    ],
  },
  {
    key: 'groupbuy', path: 'marketing/groupbuy', label: '拼团活动', icon: <TeamOutlined />, group: 'social',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'goods', label: '拼团商品', type: 'goods-select', required: true, selectMode: 'goods', multiple: true },
      { name: 'price', label: '拼团价', type: 'number', required: true },
      { name: 'originalPrice', label: '原价', type: 'number', required: true },
      { name: 'minCount', label: '成团人数', type: 'number', required: true },
    ],
  },
  {
    key: 'bargain', path: 'marketing/bargain', label: '帮砍价', icon: <ScissorOutlined />, group: 'social',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'goods', label: '砍价商品', type: 'goods-select', required: true, selectMode: 'goods', multiple: true },
      { name: 'originalPrice', label: '原价', type: 'number', required: true },
      { name: 'floorPrice', label: '底价', type: 'number', required: true },
    ],
  },
  {
    key: 'checkin-coupon', path: 'marketing/checkin-coupon', label: '助力领券', icon: <GiftOutlined />, group: 'social',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'location', label: '地点', type: 'input' },
      { name: 'template', label: '券模板', type: 'input' },
    ],
  },
  {
    key: 'referral', path: 'marketing/referral', label: '推荐有礼', icon: <TeamOutlined />, group: 'social',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'referrerReward', label: '推荐人奖励', type: 'input', required: true },
      { name: 'inviteeReward', label: '被邀请人奖励', type: 'input', required: true },
    ],
  },
  {
    key: 'games', path: 'marketing/games', label: '游戏互动', icon: <TrophyOutlined />, group: 'game',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'type', label: '游戏类型', type: 'select', required: true, options: [
        { label: '大转盘', value: 'wheel' }, { label: '老虎机', value: 'slot' },
        { label: '红包', value: 'redpacket' }, { label: '九宫格', value: 'grid' },
      ] },
      { name: 'rewards', label: '奖品', type: 'select', required: true, source: { path: 'marketing/prizes', labelField: 'name', valueField: 'name' } },
    ],
  },
  {
    key: 'blind-box', path: 'marketing/blind-box', label: '盲盒活动', icon: <BoxOutlined />, group: 'game',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'price', label: '价格', type: 'number', required: true },
      { name: 'prizes', label: '奖品', type: 'select', required: true, source: { path: 'marketing/prizes', labelField: 'name', valueField: 'name' } },
    ],
  },
  {
    key: 'lucky-draw', path: 'marketing/lucky-draw', label: '众筹抽奖', icon: <TrophyOutlined />, group: 'game',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'prize', label: '奖品', type: 'select', required: true, source: { path: 'marketing/prizes', labelField: 'name', valueField: 'name' } },
    ],
  },
  {
    key: 'checkin', path: 'activity/checkin', label: '签到活动', icon: <CheckCircleOutlined />, group: 'member',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'rewardType', label: '奖励类型', type: 'select', required: true, options: [
        { label: '积分', value: 'points' }, { label: '优惠券', value: 'coupon' }, { label: '停车券', value: 'parking' },
      ] },
      { name: 'rewardValue', label: '奖励值', type: 'input', required: true },
      { name: 'period', label: '周期', type: 'select', required: true, options: [
        { label: '每日', value: 'daily' }, { label: '每周', value: 'weekly' }, { label: '每月', value: 'monthly' },
      ] },
    ],
  },
  {
    key: 'new-member', path: 'marketing/new-member', label: '新人礼', icon: <GiftOutlined />, group: 'member',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'rewards', label: '奖励内容', type: 'select', required: true, source: { path: 'marketing/prizes', labelField: 'name', valueField: 'name' } },
      { name: 'validDays', label: '有效天数', type: 'number', required: true },
    ],
  },
  {
    key: 'count-cards', path: 'marketing/count-cards', label: '计次卡', icon: <IdcardOutlined />, group: 'member',
    fields: [
      { name: 'name', label: '名称', type: 'input', required: true },
      { name: 'times', label: '次数', type: 'number', required: true },
      { name: 'price', label: '价格', type: 'number', required: true },
      { name: 'merchants', label: '适用商户', type: 'select', source: { path: 'system/merchants', labelField: 'name', valueField: 'name' } },
    ],
  },
  {
    key: 'signups', path: 'activity/signups', label: '活动报名', icon: <TeamOutlined />, group: 'member',
    fields: [
      { name: 'name', label: '活动名称', type: 'input', required: true },
      { name: 'signupTime', label: '报名时间', type: 'date', required: true },
      { name: 'member', label: '报名会员', type: 'select', source: { path: 'member/list', labelField: 'name', valueField: 'name' } },
      { name: 'count', label: '报名人数', type: 'number' },
    ],
  },
];

const GROUP_ORDER: ActivityGroup[] = ['promotion', 'social', 'game', 'member'];

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  enabled: { text: '进行中', color: 'green' },
  disabled: { text: '已停用', color: 'red' },
  pending: { text: '待审核', color: 'orange' },
  checked: { text: '已审核', color: 'green' },
  cancelled: { text: '已取消', color: 'default' },
  finished: { text: '已结束', color: 'default' },
};

// ======================== 辅助函数 ========================

/** 从指定模块路径拉取数据渲染为下拉选择 */
const SourceSelect: React.FC<{ source: { path: string; labelField: string; valueField: string }; placeholder?: string; multiple?: boolean }> = ({ source, placeholder, multiple }) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    let alive = true;
    fetchListData(source.path).then((res: any) => {
      if (!alive) return;
      const list = res?.list || res || [];
      setOptions(
        list.map((item: any) => ({
          label: String(item[source.labelField] ?? ''),
          value: String(item[source.valueField] ?? ''),
        })).filter((o: any) => o.label && o.value)
      );
    }).catch(() => {});
    return () => { alive = false; };
  }, [source.path, source.labelField, source.valueField]);
  return <Select options={options} placeholder={placeholder || '请选择'} showSearch optionFilterProp="label" mode={multiple ? 'multiple' : undefined} />;
};

/** 商品选择器组件 - 支持选择商品或分类 */
const GoodsSelector: React.FC<{ 
  mode?: 'goods' | 'category' | 'both'; 
  multiple?: boolean; 
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
}> = ({ mode = 'goods', multiple = true, placeholder = '请选择商品或分类', value, onChange }) => {
  const [goods, setGoods] = useState<{ id: number; name: string; category: string; price: number; stock: number }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; icon?: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'goods' | 'category'>('goods');
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    let alive = true;
    fetchListData('shop/goods', { page: 1, pageSize: 999 }).then((res: any) => {
      if (!alive) return;
      setGoods(res?.list || []);
    }).catch(() => {});
    fetchListData('shop/categories', { page: 1, pageSize: 999 }).then((res: any) => {
      if (!alive) return;
      setCategories(res?.list || []);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (value) {
      const arr = Array.isArray(value) ? value : [value];
      const goodsIds = arr.filter(v => v.startsWith('goods_'));
      const catIds = arr.filter(v => v.startsWith('cat_'));
      setSelectedGoods(goodsIds);
      setSelectedCategories(catIds);
    } else {
      setSelectedGoods([]);
      setSelectedCategories([]);
    }
  }, [value]);

  const handleGoodsToggle = (id: number) => {
    const goodsId = `goods_${id}`;
    if (multiple) {
      const newSelected = selectedGoods.includes(goodsId) 
        ? selectedGoods.filter(g => g !== goodsId)
        : [...selectedGoods, goodsId];
      setSelectedGoods(newSelected);
      onChange?.([...newSelected, ...selectedCategories]);
    } else {
      setSelectedGoods([goodsId]);
      onChange?.([goodsId]);
    }
  };

  const handleCategoryToggle = (id: number) => {
    const catId = `cat_${id}`;
    if (multiple) {
      const newSelected = selectedCategories.includes(catId)
        ? selectedCategories.filter(c => c !== catId)
        : [...selectedCategories, catId];
      setSelectedCategories(newSelected);
      onChange?.([...selectedGoods, ...newSelected]);
    } else {
      setSelectedCategories([catId]);
      onChange?.([catId]);
    }
  };

  const handleSelectAll = () => {
    if (activeTab === 'goods') {
      const filteredGoods = goods.filter(g => 
        (!searchKeyword || g.name.toLowerCase().includes(searchKeyword.toLowerCase())) &&
        (!categoryFilter || g.category === categoryFilter)
      );
      const ids = filteredGoods.map(g => `goods_${g.id}`);
      setSelectedGoods(ids);
      onChange?.([...ids, ...selectedCategories]);
    } else {
      const ids = categories.map(c => `cat_${c.id}`);
      setSelectedCategories(ids);
      onChange?.([...selectedGoods, ...ids]);
    }
  };

  const handleClearAll = () => {
    if (activeTab === 'goods') {
      setSelectedGoods([]);
      onChange?.(selectedCategories);
    } else {
      setSelectedCategories([]);
      onChange?.(selectedGoods);
    }
  };

  const filteredGoods = goods.filter(g => 
    (!searchKeyword || g.name.toLowerCase().includes(searchKeyword.toLowerCase())) &&
    (!categoryFilter || g.category === categoryFilter)
  );

  const canShowCategory = mode === 'both' || mode === 'category';
  const canShowGoods = mode === 'both' || mode === 'goods';

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      {mode === 'both' && (
        <div style={{ display: 'flex', borderBottom: '1px solid #d9d9d9' }}>
          <button
            onClick={() => setActiveTab('goods')}
            style={{
              flex: 1, padding: '8px', background: activeTab === 'goods' ? '#e6f7ff' : 'transparent',
              border: 'none', cursor: 'pointer', color: activeTab === 'goods' ? '#1890ff' : '#666',
              fontWeight: activeTab === 'goods' ? 600 : 400,
            }}
          >商品选择</button>
          <button
            onClick={() => setActiveTab('category')}
            style={{
              flex: 1, padding: '8px', background: activeTab === 'category' ? '#e6f7ff' : 'transparent',
              border: 'none', cursor: 'pointer', color: activeTab === 'category' ? '#1890ff' : '#666',
              fontWeight: activeTab === 'category' ? 600 : 400,
            }}
          >分类选择</button>
        </div>
      )}

      <div style={{ padding: 12 }}>
        {activeTab === 'goods' && canShowGoods && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Input
                placeholder="搜索商品"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ flex: 1 }}
                size="small"
              />
              <Select
                placeholder="筛选分类"
                value={categoryFilter}
                onChange={v => setCategoryFilter(v)}
                style={{ width: 140 }}
                size="small"
                allowClear
                options={[...new Set(goods.map(g => g.category))].map(c => ({ label: c, value: c }))}
              />
              <Button size="small" onClick={handleSelectAll}>全选</Button>
              <Button size="small" onClick={handleClearAll}>清空</Button>
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {filteredGoods.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>暂无商品</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {filteredGoods.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleGoodsToggle(item.id)}
                      style={{
                        padding: '8px 12px', border: `2px solid ${selectedGoods.includes(`goods_${item.id}`) ? '#1890ff' : '#e8e8e8'}`,
                        borderRadius: 6, cursor: 'pointer',
                        background: selectedGoods.includes(`goods_${item.id}`) ? '#e6f7ff' : '#fff',
                        display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ fontSize: 12, color: '#999' }}>
                        ¥{item.price} | 库存:{item.stock} | {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              已选择 {selectedGoods.length} 件商品
            </div>
          </div>
        )}

        {activeTab === 'category' && canShowCategory && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Button size="small" onClick={handleSelectAll}>全选</Button>
              <Button size="small" onClick={handleClearAll}>清空</Button>
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>暂无分类</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryToggle(cat.id)}
                      style={{
                        padding: '8px 16px', border: `2px solid ${selectedCategories.includes(`cat_${cat.id}`) ? '#1890ff' : '#e8e8e8'}`,
                        borderRadius: 6, cursor: 'pointer',
                        background: selectedCategories.includes(`cat_${cat.id}`) ? '#e6f7ff' : '#fff',
                        fontSize: 14,
                      }}
                    >
                      {cat.icon} {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              已选择 {selectedCategories.length} 个分类（选择分类将包含该分类下所有商品）
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getStatusBadge(status: string) {
  const cfg = STATUS_MAP[status] || { text: status, color: 'default' };
  return <Badge status={cfg.color as any} text={cfg.text} />;
}

function getModuleConfig(key: string): ModuleConfig | undefined {
  return MODULE_CONFIGS.find(m => m.key === key);
}

function getGroupOfModule(key: string): ActivityGroup {
  const cfg = MODULE_CONFIGS.find(m => m.key === key);
  return (cfg?.group || 'promotion') as ActivityGroup;
}

/** 根据模块配置提取卡片展示的关键指标 */
function extractMetrics(config: ModuleConfig, item: ActivityItem): { label: string; value: string }[] {
  const m: { label: string; value: string }[] = [];
  
  const formatGoods = (goods: any) => {
    if (!goods) return '';
    if (Array.isArray(goods)) {
      const goodsCount = goods.filter(g => g.startsWith('goods_')).length;
      const catCount = goods.filter(g => g.startsWith('cat_')).length;
      if (goodsCount > 0 && catCount > 0) return `${goodsCount}件商品 + ${catCount}个分类`;
      if (goodsCount > 0) return `${goodsCount}件商品`;
      if (catCount > 0) return `${catCount}个分类`;
      return '';
    }
    return String(goods);
  };

  switch (config.key) {
    case 'campaigns':
      if (item.budget != null) m.push({ label: '预算', value: `¥${item.budget}` });
      if (item.goods) {
        const goodsStr = formatGoods(item.goods);
        if (goodsStr) m.push({ label: '商品', value: goodsStr });
      }
      break;
    case 'groupbuy':
      if (item.price != null) m.push({ label: '拼团价', value: `¥${item.price}` });
      if (item.minCount != null) m.push({ label: '成团人数', value: String(item.minCount) });
      if (item.joined != null) m.push({ label: '已参与', value: String(item.joined) });
      if (item.goods) {
        const goodsStr = formatGoods(item.goods);
        if (goodsStr) m.push({ label: '商品', value: goodsStr });
      }
      break;
    case 'seckill':
      if (item.price != null) m.push({ label: '秒杀价', value: `¥${item.price}` });
      if (item.stock != null) m.push({ label: '库存', value: String(item.stock) });
      if (item.sold != null) m.push({ label: '已售', value: String(item.sold) });
      if (item.goods) {
        const goodsStr = formatGoods(item.goods);
        if (goodsStr) m.push({ label: '商品', value: goodsStr });
      }
      break;
    case 'countdown':
      if (item.price != null) m.push({ label: '活动价', value: `¥${item.price}` });
      if (item.goods) {
        const goodsStr = formatGoods(item.goods);
        if (goodsStr) m.push({ label: '商品', value: goodsStr });
      }
      break;
    case 'bargain':
      if (item.floorPrice != null) m.push({ label: '底价', value: `¥${item.floorPrice}` });
      if (item.started != null) m.push({ label: '参与人次', value: String(item.started) });
      if (item.goods) {
        const goodsStr = formatGoods(item.goods);
        if (goodsStr) m.push({ label: '商品', value: goodsStr });
      }
      break;
    case 'referral':
      if (item.referrerReward) m.push({ label: '推荐人奖励', value: String(item.referrerReward) });
      if (item.inviteeReward) m.push({ label: '被邀请人奖励', value: String(item.inviteeReward) });
      break;
    case 'games':
      if (item.plays != null) m.push({ label: '参与人次', value: String(item.plays) });
      if (item.rewards) m.push({ label: '奖品', value: String(item.rewards) });
      break;
    case 'new-member':
      if (item.validDays != null) m.push({ label: '有效天数', value: `${item.validDays}天` });
      if (item.rewards) m.push({ label: '奖励', value: String(item.rewards) });
      break;
    case 'blind-box':
      if (item.price != null) m.push({ label: '价格', value: `¥${item.price}` });
      if (item.opened != null) m.push({ label: '已开', value: String(item.opened) });
      break;
    case 'count-cards':
      if (item.times != null) m.push({ label: '次数', value: `${item.times}次` });
      if (item.price != null) m.push({ label: '价格', value: `¥${item.price}` });
      break;
    case 'checkin':
      if (item.rewardValue) m.push({ label: '奖励值', value: String(item.rewardValue) });
      if (item.period) m.push({ label: '周期', value: item.period === 'daily' ? '每日' : item.period === 'weekly' ? '每周' : '每月' });
      break;
    case 'signups':
      if (item.count != null) m.push({ label: '报名人数', value: String(item.count) });
      break;
    case 'checkin-coupon':
      if (item.claimed != null) m.push({ label: '已领取', value: String(item.claimed) });
      break;
    case 'lucky-draw':
      if (item.participants != null) m.push({ label: '参与人次', value: String(item.participants) });
      break;
    default:
      break;
  }
  return m;
}

function getTimeRange(item: ActivityItem): string {
  const s = item.startTime || item.signupTime;
  const e = item.endTime;
  if (s && e) return `${s} ~ ${e}`;
  if (s) return `${s} 起`;
  return '-';
}

// ======================== 主组件 ========================

const URL_KEY_TO_MODULE: Record<string, string> = {
  'marketing-campaigns': 'campaigns',
  'marketing-coupons': 'coupons',
  'marketing-groupbuy': 'groupbuy',
  'marketing-seckill': 'seckill',
  'activity-signups': 'signups',
  'checkin-activities': 'checkin',
  'referral-gifts': 'referral',
  'new-member-gifts': 'new-member',
  'help-coupons': 'checkin-coupon',
  'word-coupons': 'word-coupon',
  'games': 'games',
  'surveys': 'surveys',
  'votes': 'votes',
  'countdown-sales': 'countdown',
  'pre-sales': 'pre-sale',
  'bargain': 'bargain',
  'lucky-draws': 'lucky-draw',
  'blind-boxes': 'blind-box',
  'count-cards': 'count-cards',
  'checkin-coupons': 'checkin-coupon',
};

export default function MarketingCenter() {
  const location = useLocation();
  const navigate = useNavigate();

  const urlKey = location.pathname.split('/m/')[1] || '';
  const targetModule = URL_KEY_TO_MODULE[urlKey] || 'campaigns';

  const initialGroup = useMemo(() => getGroupOfModule(targetModule), [targetModule]);

  const [activeGroup, setActiveGroup] = useState<ActivityGroup | 'all'>(initialGroup);
  const [activeModule, setActiveModule] = useState<string | 'all'>(targetModule);
  const [loading, setLoading] = useState(false);
  const [dataMap, setDataMap] = useState<Record<string, ActivityItem[]>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ActivityItem | null>(null);
  const [currentModuleKey, setCurrentModuleKey] = useState<string>('campaigns');
  const [form] = Form.useForm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ActivityItem | null>(null);
  const [detailModuleKey, setDetailModuleKey] = useState<string>('campaigns');

  // ---------- 数据加载 ----------
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const targets = activeModule === 'all'
        ? MODULE_CONFIGS.filter(m => activeGroup === 'all' || m.group === activeGroup)
        : MODULE_CONFIGS.filter(m => m.key === activeModule);
      const results = await Promise.all(
        targets.map(async (mod) => {
          try {
            const res: any = await fetchListData(mod.path, { page: 1, pageSize: 999, keyword: searchKeyword || undefined });
            return { key: mod.key, list: res?.list ?? [] };
          } catch {
            return { key: mod.key, list: [] };
          }
        })
      );
      const map: Record<string, ActivityItem[]> = {};
      results.forEach(r => { map[r.key] = r.list; });
      setDataMap(map);
    } catch (e: any) {
      message.error(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [activeGroup, activeModule, searchKeyword]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    const key = location.pathname.split('/m/')[1] || '';
    const mod = URL_KEY_TO_MODULE[key];
    if (mod) {
      const g = getGroupOfModule(mod);
      setActiveGroup(g);
      setActiveModule(mod);
    }
  }, [location.pathname]);

  // ---------- 统计 ----------
  const allItems = Object.values(dataMap).flat();
  const stats = {
    total: allItems.length,
    running: allItems.filter(i => i.status === 'enabled').length,
    finished: allItems.filter(i => i.status === 'disabled' || i.status === 'finished' || i.status === 'cancelled').length,
    participants: allItems.reduce((s, i) => s + (Number(i.joined) || Number(i.sold) || Number(i.plays) || Number(i.opened) || Number(i.started) || Number(i.participants) || 0), 0),
  };

  // ---------- 筛选后数据 ----------
  const getFilteredItems = (modKey: string): ActivityItem[] => {
    let items = dataMap[modKey] || [];
    if (statusFilter) {
      items = items.filter(i => i.status === statusFilter);
    }
    return items;
  };

  // ---------- CRUD 操作 ----------
  const handleCreate = (modKey: string) => {
    setCurrentModuleKey(modKey);
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: ActivityItem, modKey: string) => {
    setCurrentModuleKey(modKey);
    setEditRecord(record);
    const config = getModuleConfig(modKey);
    const formValues: Record<string, any> = { ...record };
    config?.fields.forEach(f => {
      if (f.type === 'date' && record[f.name]) {
        formValues[f.name] = dayjs(record[f.name]);
      }
    });
    form.setFieldsValue(formValues);
    setModalOpen(true);
  };

  const handleDelete = async (record: ActivityItem, modKey: string) => {
    const config = getModuleConfig(modKey);
    if (!config) return;
    try {
      await deleteItemData(config.path, record.id);
      message.success('删除成功');
      loadAll();
    } catch (e: any) {
      message.error(e.message || '删除失败');
    }
  };

  const handleToggleStatus = async (record: ActivityItem, modKey: string) => {
    const config = getModuleConfig(modKey);
    if (!config) return;
    try {
      const newStatus = record.status === 'enabled' ? 'disabled' : 'enabled';
      await updateItemData(config.path, record.id, { status: newStatus });
      message.success('状态已切换');
      loadAll();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const config = getModuleConfig(currentModuleKey);
      if (!config) return;
      // 日期字段转字符串
      config.fields.forEach(f => {
        if (f.type === 'date' && values[f.name]) {
          values[f.name] = values[f.name].format?.('YYYY-MM-DD') ?? values[f.name];
        }
      });
      if (editRecord) {
        await updateItemData(config.path, editRecord.id, values);
        message.success('编辑成功');
      } else {
        values.status = values.status || 'enabled';
        await createItemData(config.path, values);
        message.success('新增成功');
      }
      setModalOpen(false);
      loadAll();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e.message || '操作失败');
    }
  };

  const handleViewDetail = (record: ActivityItem, modKey: string) => {
    setDetailRecord(record);
    setDetailModuleKey(modKey);
    setDrawerOpen(true);
  };

  // ---------- 渲染表单字段 ----------
  const renderFormField = (field: FieldDef) => {
    if (field.type === 'goods-select') {
      return (
        <GoodsSelector
          mode={field.selectMode || 'goods'}
          multiple={field.multiple}
          placeholder={`请选择${field.label}`}
        />
      );
    }
    if (field.source) {
      return <SourceSelect source={field.source} placeholder={`请选择${field.label}`} multiple={field.multiple} />;
    }
    switch (field.type) {
      case 'number':
        return <InputNumber style={{ width: '100%' }} placeholder={`请输入${field.label}`} />;
      case 'select':
        return <Select options={field.options} placeholder={`请选择${field.label}`} mode={field.multiple ? 'multiple' : undefined} />;
      case 'date':
        return <DatePicker style={{ width: '100%' }} placeholder={`请选择${field.label}`} />;
      default:
        return <Input placeholder={`请输入${field.label}`} />;
    }
  };

  // ---------- 渲染活动卡片 ----------
  const renderActivityCard = (item: ActivityItem, modKey: string) => {
    const config = getModuleConfig(modKey);
    if (!config) return null;
    const groupInfo = GROUP_MAP[config.group as ActivityGroup];
    const metrics = extractMetrics(config, item);
    const timeRange = getTimeRange(item);

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={`${modKey}-${item.id}`}>
        <Card
          hoverable
          size="small"
          style={{ borderRadius: 8, overflow: 'hidden' }}
          styles={{ body: { padding: 16 } }}
          onClick={() => handleViewDetail(item, modKey)}
        >
          {/* 顶部类型标识 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6,
              background: groupInfo.color + '15', color: groupInfo.color,
              fontSize: 14, flexShrink: 0,
            }}>
              {config.icon}
            </span>
            <Tag color={groupInfo.color} style={{ margin: 0, fontSize: 12 }}>{config.label}</Tag>
            <span style={{ marginLeft: 'auto' }}>{getStatusBadge(item.status)}</span>
          </div>

          {/* 活动名称 */}
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
            {item.name}
          </div>

          {/* 关键指标 */}
          {metrics.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 8, color: '#666', fontSize: 13 }}>
              {metrics.map((m, idx) => (
                <span key={idx}>{m.label}: <b style={{ color: '#333' }}>{m.value}</b></span>
              ))}
            </div>
          )}

          {/* 时间范围 */}
          {timeRange !== '-' && (
            <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />{timeRange}
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 4 }} onClick={e => e.stopPropagation()}>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(item, modKey)}>编辑</Button>
            <Button type="link" size="small" onClick={() => handleToggleStatus(item, modKey)}>
              {item.status === 'enabled' ? '停用' : '启用'}
            </Button>
            <Popconfirm title="确认删除?" onConfirm={() => handleDelete(item, modKey)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          </div>
        </Card>
      </Col>
    );
  };

  // ---------- 渲染详情 Drawer ----------
  const renderDetailDrawer = () => {
    if (!detailRecord) return null;
    const config = getModuleConfig(detailModuleKey);
    const groupInfo = config ? GROUP_MAP[config.group as ActivityGroup] : GROUP_MAP.promotion;

    return (
      <Drawer
        title={detailRecord.name}
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); handleEdit(detailRecord, detailModuleKey); }}>编辑</Button>
            <Button size="small" onClick={() => handleToggleStatus(detailRecord, detailModuleKey)}>
              {detailRecord.status === 'enabled' ? '停用' : '启用'}
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Tag color={groupInfo.color} style={{ fontSize: 14, padding: '4px 12px' }}>{config?.label}</Tag>
          {getStatusBadge(detailRecord.status)}
        </div>

        {config?.fields.map(field => (
          <div key={field.name} style={{ marginBottom: 12, display: 'flex' }}>
            <span style={{ color: '#999', width: 100, flexShrink: 0 }}>{field.label}</span>
            <span style={{ color: '#333', fontWeight: 500 }}>{detailRecord[field.name] ?? '-'}</span>
          </div>
        ))}
      </Drawer>
    );
  };

  // ---------- 渲染新增弹窗 ----------
  const renderCreateModal = () => {
    const config = getModuleConfig(currentModuleKey);
    if (!config) return null;

    return (
      <Modal
        title={editRecord ? `编辑${config.label}` : `新增${config.label}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {config.fields.map(field => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.required ? [{ required: true, message: `请${field.type === 'select' || field.type === 'date' ? '选择' : '输入'}${field.label}` }] : []}
            >
              {renderFormField(field)}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    );
  };

  // ---------- 需要展示的模块列表 ----------
  const visibleModules = activeModule === 'all'
    ? MODULE_CONFIGS.filter(m => activeGroup === 'all' || m.group === activeGroup)
    : MODULE_CONFIGS.filter(m => m.key === activeModule);

  // 按 group 分组展示
  const groupedModules: Record<string, ModuleConfig[]> = {};
  visibleModules.forEach(m => {
    const g = m.group;
    if (!groupedModules[g]) groupedModules[g] = [];
    groupedModules[g].push(m);
  });

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* ====== 顶部统计卡片 ====== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic title="活动总数" value={stats.total} valueStyle={{ color: '#333' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic title="进行中" value={stats.running} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic title="已结束" value={stats.finished} valueStyle={{ color: '#999' }} prefix={<PauseCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic title="参与总人次" value={stats.participants} valueStyle={{ color: '#1890ff' }} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* ====== 筛选栏 ====== */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space size={16} wrap>
              <Input.Search
                placeholder="搜索活动名称"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                onSearch={() => loadAll()}
                style={{ width: 220 }}
                allowClear
                prefix={<SearchOutlined />}
              />
              <Select
                placeholder="状态筛选"
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 140 }}
                allowClear
                options={[
                  { label: '进行中', value: 'enabled' },
                  { label: '已停用', value: 'disabled' },
                  { label: '待审核', value: 'pending' },
                  { label: '已审核', value: 'checked' },
                  { label: '已取消', value: 'cancelled' },
                ]}
              />
              <Button icon={<ReloadOutlined />} onClick={loadAll}>刷新</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ====== 活动类型导航 + 卡片区域 ====== */}
      <Row gutter={16}>
        {/* 左侧导航 */}
        <Col span={5}>
          <Card size="small" style={{ borderRadius: 8 }} styles={{ body: { padding: '8px 0' } }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', padding: '8px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
              营销活动导航
            </div>

            <div
              onClick={() => { setActiveGroup('all'); setActiveModule('all'); }}
              style={{
                padding: '12px 16px', cursor: 'pointer', fontWeight: activeGroup === 'all' && activeModule === 'all' ? 600 : 400,
                color: activeGroup === 'all' && activeModule === 'all' ? '#1890ff' : '#333',
                background: activeGroup === 'all' && activeModule === 'all' ? '#e6f7ff' : 'transparent',
                borderRight: activeGroup === 'all' && activeModule === 'all' ? '3px solid #1890ff' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ width: 24, height: 24, borderRadius: 6, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#1890ff' }}>📊</span>
              全部活动
            </div>

            {GROUP_ORDER.map(groupKey => {
              const g = GROUP_MAP[groupKey];
              const mods = MODULE_CONFIGS.filter(m => m.group === groupKey);
              const groupCount = mods.reduce((sum, m) => sum + (dataMap[m.key]?.length || 0), 0);
              
              return (
                <div key={groupKey}>
                  <div
                    onClick={() => { setActiveGroup(groupKey); setActiveModule('all'); }}
                    style={{
                      padding: '12px 16px', cursor: 'pointer', fontWeight: activeGroup === groupKey && activeModule === 'all' ? 600 : 400,
                      color: g.color, display: 'flex', alignItems: 'center', gap: 8,
                      background: activeGroup === groupKey ? g.color + '10' : 'transparent',
                      borderRight: activeGroup === groupKey && activeModule === 'all' ? `3px solid ${g.color}` : '3px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: g.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                      {g.icon}
                    </span>
                    <span>{g.label}</span>
                    <span style={{ marginLeft: 'auto', background: g.color + '20', color: g.color, padding: '2px 6px', borderRadius: 10, fontSize: 11 }}>
                      {groupCount}
                    </span>
                  </div>
                  
                  <div style={{ background: activeGroup === groupKey ? g.color + '05' : 'transparent' }}>
                    {mods.map(mod => (
                      <div
                        key={mod.key}
                        onClick={() => { setActiveGroup(groupKey); setActiveModule(mod.key); }}
                        style={{
                          padding: '10px 16px 10px 56px', cursor: 'pointer', fontSize: 13,
                          color: activeModule === mod.key ? g.color : '#666',
                          background: activeModule === mod.key ? g.color + '15' : 'transparent',
                          borderRight: activeModule === mod.key ? `3px solid ${g.color}` : '3px solid transparent',
                          display: 'flex', alignItems: 'center', gap: 6,
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 12, opacity: 0.6 }}>{mod.icon}</span>
                        <span>{mod.label}</span>
                        {dataMap[mod.key]?.length > 0 && (
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#999' }}>
                            ({dataMap[mod.key].length})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>
        </Col>

        {/* 右侧卡片区域 */}
        <Col span={19}>
          <Spin spinning={loading}>
            {visibleModules.length === 0 ? (
              <Empty description="暂无活动" />
            ) : (
              GROUP_ORDER.filter(gk => activeGroup === 'all' || gk === activeGroup).map(groupKey => {
                const g = GROUP_MAP[groupKey];
                const mods = groupedModules[groupKey];
                if (!mods || mods.length === 0) return null;
                return (
                  <div key={groupKey} style={{ marginBottom: 24 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                      fontSize: 15, fontWeight: 600, color: g.color,
                      borderBottom: `2px solid ${g.color}20`, paddingBottom: 8,
                    }}>
                      {g.icon} {g.label}
                      <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>
                        ({mods.reduce((s, m) => s + getFilteredItems(m.key).length, 0)})
                      </span>
                      <Button
                        type="link"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreate(mods[0].key)}
                      >
                        新增
                      </Button>
                    </div>
                    {mods.map(mod => {
                      const items = getFilteredItems(mod.key);
                      if (items.length === 0) {
                        return (
                          <div key={mod.key} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#555' }}>
                              {mod.icon} {mod.label}
                            </div>
                            <Card size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`暂无${mod.label}`}>
                                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleCreate(mod.key)}>
                                  创建活动
                                </Button>
                              </Empty>
                            </Card>
                          </div>
                        );
                      }
                      return (
                        <div key={mod.key} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {mod.icon} {mod.label}
                            <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>({items.length})</span>
                            <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleCreate(mod.key)} style={{ marginLeft: 'auto' }}>
                              新增
                            </Button>
                          </div>
                          <Row gutter={[12, 12]}>
                            {items.map(item => renderActivityCard(item, mod.key))}
                          </Row>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </Spin>
        </Col>
      </Row>

      {/* 弹窗 & 抽屉 */}
      {renderCreateModal()}
      {renderDetailDrawer()}
    </div>
  );
}
