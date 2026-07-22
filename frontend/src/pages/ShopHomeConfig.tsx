import { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Tag, message,
  Space, Upload, Radio, Switch, Slider, Divider, Tabs, Empty, Popconfirm, Checkbox
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UpOutlined, DownOutlined,
  PictureOutlined, ShoppingOutlined, AppstoreOutlined, SearchOutlined,
  BellOutlined, GiftOutlined, ThunderboltOutlined, TeamOutlined,
  FileImageOutlined, LayoutOutlined, BgColorsOutlined, CopyOutlined,
  DragOutlined, SaveOutlined, MobileOutlined, DesktopOutlined, UploadOutlined,
  DownloadOutlined, RollbackOutlined, UserOutlined, EnvironmentOutlined, CalendarOutlined,
  BuildOutlined, FilterOutlined, RightOutlined
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData, request } from '../services/request';
import { MiniIcon } from '../components/MiniIcons';

const { TabPane } = Tabs;

interface PageComponent {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
}

interface PageConfig {
  id: number;
  name: string;
  pageType: string;
  components: string;
  sort: number;
  status: string;
  publishedAt?: string;
  previewToken?: string;
}

interface CompTypeDef {
  type: string;
  name: string;
  icon: React.ReactNode;
  group: '基础' | '商品' | '营销' | '服务' | '数据';
  defaultConfig: Record<string, any>;
}

const COMPONENT_TYPES: CompTypeDef[] = [
  {
    type: 'search',
    name: '搜索框',
    icon: <SearchOutlined />,
    group: '基础',
    defaultConfig: { placeholder: '搜索商品', style: 'round', bgColor: '#f5f5f5', showLocation: true, locationText: '长沙洋湖天街' }
  },
  {
    type: 'notice',
    name: '公告栏',
    icon: <BellOutlined />,
    group: '基础',
    defaultConfig: { text: '欢迎来到我们的商城！', color: '#ff4d4f', bgColor: '#fff7e6', icon: 'bell' }
  },
  {
    type: 'banner',
    name: '轮播图',
    icon: <PictureOutlined />,
    group: '基础',
    defaultConfig: {
      items: [
        { image: '', link: '', title: 'banner1' },
        { image: '', link: '', title: 'banner2' }
      ],
      height: 160,
      autoPlay: true,
      interval: 3,
      indicatorStyle: 'dot'
    }
  },
  {
    type: 'navGrid',
    name: '图片导航',
    icon: <AppstoreOutlined />,
    group: '基础',
    defaultConfig: {
      items: [
        { image: '', text: '分类1', link: '' },
        { image: '', text: '分类2', link: '' },
        { image: '', text: '分类3', link: '' },
        { image: '', text: '分类4', link: '' }
      ],
      columns: 4,
      showText: true
    }
  },
  {
    type: 'title',
    name: '标题栏',
    icon: <BgColorsOutlined />,
    group: '基础',
    defaultConfig: { title: '热门推荐', align: 'left', showMore: true, moreText: '查看更多', color: '#333', bgColor: '#fff' }
  },
  {
    type: 'imageSingle',
    name: '单图广告',
    icon: <FileImageOutlined />,
    group: '基础',
    defaultConfig: { image: '', link: '', padding: 12, borderRadius: 8 }
  },
  {
    type: 'richText',
    name: '富文本',
    icon: <EditOutlined />,
    group: '基础',
    defaultConfig: { content: '<p>请输入内容...</p>', padding: 12, bgColor: '#fff' }
  },
  {
    type: 'serviceNav',
    name: '服务导航',
    icon: <AppstoreOutlined />,
    group: '服务',
    defaultConfig: {
      items: [
        { icon: 'parking', text: '停车缴费', link: '/pages/parking' },
        { icon: 'coins', text: '快速金币', link: '/pages/points' },
        { icon: 'qrcode', text: '金币码', link: '/pages/code' },
        { icon: 'crown', text: '会员权益', link: '/pages/member' },
        { icon: 'headphones', text: '联系客服', link: '/pages/service' },
        { icon: 'search', text: '自助寻车', link: '/pages/findcar' },
        { icon: 'car', text: '我要打车', link: '/pages/taxi' },
        { icon: 'zap', text: '我要充电', link: '/pages/charge' },
        { icon: 'gift', text: '金币兑换', link: '/pages/mall' },
        { icon: 'utensils', text: '餐饮导览', link: '/pages/restaurant' }
      ],
      columns: 5
    }
  },
  {
    type: 'eventCard',
    name: '活动预告',
    icon: <CalendarOutlined />,
    group: '服务',
    defaultConfig: {
      title: '07月活动预告',
      subtitle: '天街会员活动等你来',
      year: '2026',
      month: '07',
      events: [
        { date: '07.05', title: '亲子运动会', location: 'A区1-3门外广场' },
        { date: '07.07', title: '安全教育', location: 'A区L2南风空间' }
      ]
    }
  },
  {
    type: 'merchantCard',
    name: '商户卡片',
    icon: <BuildOutlined />,
    group: '服务',
    defaultConfig: {
      items: [
        { image: '', title: '新店开业', subtitle: '魏斯理', tag: '开业' },
        { image: '', title: '新店入驻', subtitle: '金粒门', tag: '入驻' }
      ],
      layout: 'grid2'
    }
  },
  {
    type: 'categoryTabs',
    name: '分类标签',
    icon: <FilterOutlined />,
    group: '商品',
    defaultConfig: {
      categories: [
        { name: '餐饮美食', count: 36 },
        { name: '服饰鞋包', count: 27 },
        { name: '儿童成长', count: 15 },
        { name: '生活服务', count: 20 },
        { name: '数码电器', count: 13 }
      ],
      showCount: true,
      activeColor: '#ff4d4f'
    }
  },
  {
    type: 'floorFilter',
    name: '楼层筛选',
    icon: <EnvironmentOutlined />,
    group: '商品',
    defaultConfig: {
      floors: ['全部楼层', '1F', '2F', '3F', '4F', '5F', 'B1'],
      defaultFloor: '全部楼层',
      showIcon: true
    }
  },
  {
    type: 'goodsList',
    name: '商品列表',
    icon: <ShoppingOutlined />,
    group: '商品',
    defaultConfig: {
      layout: 'grid2',
      source: 'manual',
      goodsIds: [],
      categoryId: '',
      showPrice: true,
      showSales: true,
      showTag: true,
      limit: 6
    }
  },
  {
    type: 'goodsCategory',
    name: '商品分类',
    icon: <AppstoreOutlined />,
    group: '商品',
    defaultConfig: { style: 'tab', categories: [], showIcon: true }
  },
  {
    type: 'flashSale',
    name: '限时秒杀',
    icon: <ThunderboltOutlined />,
    group: '营销',
    defaultConfig: { title: '限时秒杀', subtitle: '好物限时抢', bgColor: '#fff2f0', countdown: true, goodsCount: 3 }
  },
  {
    type: 'groupBuy',
    name: '拼团活动',
    icon: <TeamOutlined />,
    group: '营销',
    defaultConfig: { title: '拼团专区', subtitle: '一起买更划算', bgColor: '#f6ffed', goodsCount: 3 }
  },
  {
    type: 'coupon',
    name: '优惠券',
    icon: <GiftOutlined />,
    group: '营销',
    defaultConfig: { title: '领券中心', style: 'horizontal', couponIds: [], bgColor: '#fff' }
  },
  {
    type: 'memberInfo',
    name: '会员信息',
    icon: <UserOutlined />,
    group: '数据',
    defaultConfig: { showPoints: true, showLevel: true, showBalance: true, showCouponCount: true }
  },
  {
    type: 'parkingInfo',
    name: '停车信息',
    icon: <EnvironmentOutlined />,
    group: '数据',
    defaultConfig: { showDuration: true, showFee: true, showDiscount: true }
  }
];

const getCompTypeDef = (type: string) => COMPONENT_TYPES.find(c => c.type === type);

const ImageUploader: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div>
      <Upload
        listType="picture-card"
        maxCount={1}
        accept="image/*"
        beforeUpload={() => false}
        fileList={value ? [{ uid: '-1', name: 'image', status: 'done', url: value }] : []}
        onChange={(info) => {
          const file = info.fileList[0];
          if (file?.url) {
            onChange?.(file.url);
          } else if (file?.originFileObj) {
            const reader = new FileReader();
            reader.onload = (e) => {
              onChange?.(e.target?.result as string);
            };
            reader.readAsDataURL(file.originFileObj);
          } else {
            onChange?.('');
          }
        }}
      >
        {!value && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 4, fontSize: 12 }}>上传图片</div>
          </div>
        )}
      </Upload>
    </div>
  );
};

const ComponentPreview: React.FC<{ comp: PageComponent; isSelected: boolean; onClick: () => void }> = ({ comp, isSelected, onClick }) => {
  const def = getCompTypeDef(comp.type);
  const cfg = comp.config;

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    border: isSelected ? '2px dashed #1890ff' : '2px solid transparent',
    borderRadius: 4,
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const renderContent = () => {
    switch (comp.type) {
      case 'search':
        return (
          <div style={{ padding: '8px 12px', background: cfg.bgColor || '#f5f5f5' }}>
            <div style={{
              background: '#fff', borderRadius: cfg.style === 'round' ? 20 : 4,
              padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
              color: '#999', fontSize: 13
            }}>
              {cfg.showLocation && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#666' }}>
                  <EnvironmentOutlined style={{ fontSize: 12 }} /> {cfg.locationText}
                  <RightOutlined style={{ fontSize: 10 }} />
                </span>
              )}
              <SearchOutlined /> {cfg.placeholder || '搜索商品'}
            </div>
          </div>
        );

      case 'notice':
        return (
          <div style={{
            padding: '8px 12px', background: cfg.bgColor || '#fff7e6',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12
          }}>
            <span style={{ color: cfg.color || '#ff4d4f', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <MiniIcon name={cfg.icon || 'bell'} size={14} />
            </span>
            <span style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cfg.text || '公告内容'}
            </span>
          </div>
        );

      case 'banner':
        return (
          <div style={{ position: 'relative', height: cfg.height || 160, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
            {cfg.items?.[0]?.image ? (
              <img src={cfg.items[0].image} width="100%" height="100%" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>
                <PictureOutlined style={{ fontSize: 32, marginRight: 8 }} /> 轮播图区域
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
              {(cfg.items || []).map((_: any, i: number) => (
                <div key={i} style={{
                  width: i === 0 ? 16 : 6, height: 6, borderRadius: 3,
                  background: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)'
                }} />
              ))}
            </div>
          </div>
        );

      case 'navGrid':
        return (
          <div style={{ padding: '12px', background: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cfg.columns || 4}, 1fr)`, gap: 8 }}>
              {(cfg.items || []).map((item: any, i: number) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: '#f0f0f0',
                    margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {item.image ? (
                      <img src={item.image} width="100%" height="100%" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <AppstoreOutlined style={{ color: '#ccc', fontSize: 20 }} />
                    )}
                  </div>
                  {cfg.showText !== false && (
                    <div style={{ fontSize: 11, color: '#666' }}>{item.text || `分类${i + 1}`}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'title':
        return (
          <div style={{
            padding: '12px 16px', background: cfg.bgColor || '#fff',
            display: 'flex', alignItems: 'center', justifyContent: cfg.align === 'center' ? 'center' : 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 16, background: '#ff4d4f', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: cfg.color || '#333' }}>{cfg.title || '标题'}</span>
            </div>
            {cfg.showMore && (
              <span style={{ fontSize: 12, color: '#999' }}>{cfg.moreText || '查看更多'} &gt;</span>
            )}
          </div>
        );

      case 'imageSingle':
        return (
          <div style={{ padding: cfg.padding || 12, background: '#fff' }}>
            {cfg.image ? (
              <img src={cfg.image} width="100%" style={{ width: '100%', borderRadius: cfg.borderRadius || 8 }} alt="" />
            ) : (
              <div style={{
                width: '100%', height: 120, background: '#f0f0f0', borderRadius: cfg.borderRadius || 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'
              }}>
                <FileImageOutlined style={{ fontSize: 32 }} />
              </div>
            )}
          </div>
        );

      case 'serviceNav':
        return (
          <div style={{ padding: '12px', background: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cfg.columns || 5}, 1fr)`, gap: 8 }}>
              {(cfg.items || []).slice(0, cfg.columns === 5 ? 10 : 8).map((item: any, i: number) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: '#f5f5f5',
                    margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: '#ff4d4f'
                  }}>
                    <MiniIcon name={item.icon} />
                  </div>
                  <div style={{ fontSize: 11, color: '#333' }}>{item.text || `服务${i + 1}`}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'eventCard':
        return (
          <div style={{ margin: '0 12px', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{cfg.title || '活动预告'}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{cfg.subtitle || ''}</div>
              </div>
              <div style={{ textAlign: 'center', background: '#ff4d4f', color: '#fff', padding: '4px 8px', borderRadius: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{cfg.month || '07'}</div>
                <div style={{ fontSize: 10 }}>{cfg.year || '2026'}</div>
              </div>
            </div>
            <div style={{ padding: '8px 16px' }}>
              {(cfg.events || []).map((event: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: i < (cfg.events.length - 1) ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ width: 48, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>{event.date || '07.01'}</div>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title || '活动名称'}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{event.location || '活动地点'}</div>
                  </div>
                  <RightOutlined style={{ fontSize: 14, color: '#ccc', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'merchantCard':
        return (
          <div style={{ padding: '0 12px' }}>
            <div style={{ display: cfg.layout === 'grid1' ? 'block' : 'flex', gap: 8 }}>
              {(cfg.items || []).slice(0, cfg.layout === 'grid1' ? 1 : 2).map((item: any, i: number) => (
                <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: 100 }}>
                    {item.image ? (
                      <img src={item.image} width="100%" height="100%" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        <BuildOutlined style={{ fontSize: 24 }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 8, left: 8, background: '#ff4d4f', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 2 }}>
                      {item.tag || '推荐'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 12, color: '#999' }}>{item.title || '标题'}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginTop: 2 }}>{item.subtitle || '商户名称'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'categoryTabs':
        return (
          <div style={{ padding: '8px 12px', background: '#fff' }}>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', whiteSpace: 'nowrap', padding: '4px 0' }}>
              {(cfg.categories || []).map((cat: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                  borderRadius: 20, fontSize: 13,
                  background: i === 0 ? cfg.activeColor || '#ff4d4f' : 'transparent',
                  color: i === 0 ? '#fff' : '#666',
                  flexShrink: 0
                }}>
                  <span>{cat.name || '分类'}</span>
                  {cfg.showCount !== false && cat.count && (
                    <span style={{ opacity: 0.8 }}>({cat.count})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'floorFilter':
        return (
          <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {(cfg.floors || []).map((floor: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                  borderRadius: 4, fontSize: 13,
                  background: floor === cfg.defaultFloor ? '#f5f5f5' : 'transparent',
                  color: '#666',
                  flexShrink: 0
                }}>
                  {cfg.showIcon && <EnvironmentOutlined style={{ fontSize: 12 }} />}
                  {floor}
                </div>
              ))}
            </div>
          </div>
        );

      case 'goodsList':
        return (
          <div style={{ padding: '8px 12px', background: '#fff' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: cfg.layout === 'grid1' ? '1fr' : cfg.layout === 'grid3' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
              gap: 8
            }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: cfg.layout === 'grid1' ? 180 : 100, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                    <ShoppingOutlined style={{ fontSize: 24 }} />
                  </div>
                  <div style={{ padding: 6 }}>
                    <div style={{ fontSize: 12, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>商品名称</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>¥99</span>
                      <span style={{ fontSize: 11, color: '#999', textDecoration: 'line-through' }}>¥199</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'flashSale':
        return (
          <div style={{ padding: 12, background: cfg.bgColor || '#fff2f0', borderRadius: 8, margin: '0 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#ff4d4f' }}>{cfg.title || '限时秒杀'}</span>
                <span style={{ fontSize: 12, color: '#999' }}>{cfg.subtitle || ''}</span>
              </div>
              {cfg.countdown && (
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {['02', ':', '18', ':', '30'].map((t, i) => (
                    <span key={i} style={{
                      background: i % 2 === 1 ? 'transparent' : '#ff4d4f',
                      color: i % 2 === 1 ? '#ff4d4f' : '#fff',
                      padding: i % 2 === 1 ? 0 : '2px 4px', borderRadius: 3, fontSize: 12, fontWeight: 600
                    }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 6, padding: 6, textAlign: 'center' }}>
                  <div style={{ width: '100%', height: 60, background: '#eee', borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ff4d4f' }}>¥{(10 + i * 5)}</div>
                  <div style={{ fontSize: 10, color: '#999', textDecoration: 'line-through' }}>¥{(20 + i * 10)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'groupBuy':
        return (
          <div style={{ padding: 12, background: cfg.bgColor || '#f6ffed', borderRadius: 8, margin: '0 12px' }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#52c41a' }}>{cfg.title || '拼团专区'}</span>
              <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{cfg.subtitle || ''}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 6, padding: 8 }}>
                  <div style={{ width: '100%', height: 80, background: '#eee', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ fontSize: 12, color: '#333' }}>商品名称</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>¥59</span>
                    <span style={{ fontSize: 11, color: '#52c41a' }}>3人团</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'coupon':
        return (
          <div style={{ padding: 12, background: cfg.bgColor || '#fff' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, padding: '0 4px' }}>{cfg.title || '领券中心'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  flex: 1, background: `linear-gradient(135deg, #ff4d4f, #ff7875)`,
                  borderRadius: 8, padding: '10px 12px', color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>¥{20 * i}</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>满{100 * i}可用</div>
                  <div style={{
                    position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
                    width: 24, height: 24, background: '#fff', borderRadius: '50%'
                  }} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'memberInfo':
        return (
          <div style={{ padding: '12px', background: '#fff', margin: '0 12px', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserOutlined style={{ fontSize: 24, color: '#999' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>会员昵称</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>金卡会员</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {cfg.showPoints && <div style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>6200 金币</div>}
                {cfg.showCouponCount && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>3张优惠券</div>}
              </div>
            </div>
          </div>
        );

      case 'parkingInfo':
        return (
          <div style={{ padding: '12px', background: '#fff', margin: '0 12px', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EnvironmentOutlined style={{ fontSize: 18, color: '#1890ff' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#333' }}>京A12345</div>
                {cfg.showDuration && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>已停车 2小时30分</div>}
              </div>
              {cfg.showFee && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>¥20</div>
                  {cfg.showDiscount && <div style={{ fontSize: 11, color: '#52c41a' }}>会员已减5元</div>}
                </div>
              )}
            </div>
          </div>
        );

      case 'richText':
        return (
          <div style={{ padding: cfg.padding || 12, background: cfg.bgColor || '#fff' }}>
            <div dangerouslySetInnerHTML={{ __html: cfg.content || '<p>富文本内容</p>' }} />
          </div>
        );

      default:
        return (
          <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
            {def?.icon} {def?.name}
          </div>
        );
    }
  };

  return (
    <div style={wrapperStyle} onClick={onClick}>
      {isSelected && (
        <div style={{
          position: 'absolute', top: -2, left: -2, right: -2, bottom: -2,
          border: '2px dashed #1890ff', borderRadius: 4, pointerEvents: 'none', zIndex: 1
        }} />
      )}
      {renderContent()}
    </div>
  );
};

const ConfigForm: React.FC<{
  comp: PageComponent;
  onChange: (config: Record<string, any>) => void;
}> = ({ comp, onChange }) => {
  const cfg = comp.config;

  const updateConfig = (key: string, value: any) => {
    onChange({ ...cfg, [key]: value });
  };

  const renderField = () => {
    switch (comp.type) {
      case 'search':
        return (
          <>
            <Form.Item label="占位文字"><Input value={cfg.placeholder} onChange={e => updateConfig('placeholder', e.target.value)} /></Form.Item>
            <Form.Item label="样式">
              <Radio.Group value={cfg.style} onChange={e => updateConfig('style', e.target.value)}>
                <Radio value="round">圆角</Radio>
                <Radio value="square">方角</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="显示定位"><Switch checked={cfg.showLocation} onChange={v => updateConfig('showLocation', v)} /></Form.Item>
            {cfg.showLocation && <Form.Item label="定位文字"><Input value={cfg.locationText} onChange={e => updateConfig('locationText', e.target.value)} /></Form.Item>}
            <Form.Item label="背景色"><Input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
          </>
        );

      case 'notice':
        return (
          <>
            <Form.Item label="公告内容"><Input.TextArea value={cfg.text} onChange={e => updateConfig('text', e.target.value)} rows={2} /></Form.Item>
            <Form.Item label="图标"><Input value={cfg.icon} onChange={e => updateConfig('icon', e.target.value)} placeholder="输入emoji或文字" /></Form.Item>
            <Form.Item label="文字颜色"><Input type="color" value={cfg.color} onChange={e => updateConfig('color', e.target.value)} style={{ width: 60 }} /></Form.Item>
            <Form.Item label="背景颜色"><Input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
          </>
        );

      case 'banner':
        return (
          <>
            <Form.Item label="高度(px)"><Slider value={cfg.height} onChange={v => updateConfig('height', v)} min={80} max={300} /></Form.Item>
            <Form.Item label="自动播放"><Switch checked={cfg.autoPlay} onChange={v => updateConfig('autoPlay', v)} /></Form.Item>
            {cfg.autoPlay && <Form.Item label="间隔(秒)"><InputNumber value={cfg.interval} onChange={v => updateConfig('interval', v)} min={1} max={10} /></Form.Item>}
            <Form.Item label="指示器样式">
              <Radio.Group value={cfg.indicatorStyle} onChange={e => updateConfig('indicatorStyle', e.target.value)}>
                <Radio value="dot">圆点</Radio>
                <Radio value="line">线条</Radio>
                <Radio value="number">数字</Radio>
              </Radio.Group>
            </Form.Item>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="轮播图片">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(cfg.items || []).map((item: any, idx: number) => (
                  <Card key={idx} size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0 }}>
                        <ImageUploader value={item.image} onChange={val => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], image: val };
                          updateConfig('items', items);
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Input placeholder="标题" value={item.title} onChange={e => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], title: e.target.value };
                          updateConfig('items', items);
                        }} style={{ marginBottom: 8 }} />
                        <Input placeholder="跳转链接" value={item.link} onChange={e => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], link: e.target.value };
                          updateConfig('items', items);
                        }} />
                      </div>
                      <Button danger size="small" onClick={() => {
                        const items = cfg.items.filter((_: any, i: number) => i !== idx);
                        updateConfig('items', items);
                      }}>删除</Button>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                  updateConfig('items', [...(cfg.items || []), { image: '', link: '', title: '' }]);
                }}>添加图片</Button>
              </div>
            </Form.Item>
          </>
        );

      case 'navGrid':
        return (
          <>
            <Form.Item label="列数">
              <Radio.Group value={cfg.columns} onChange={e => updateConfig('columns', e.target.value)}>
                <Radio.Button value={3}>3列</Radio.Button>
                <Radio.Button value={4}>4列</Radio.Button>
                <Radio.Button value={5}>5列</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="显示文字"><Switch checked={cfg.showText !== false} onChange={v => updateConfig('showText', v)} /></Form.Item>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="导航项">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(cfg.items || []).map((item: any, idx: number) => (
                  <Card key={idx} size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0 }}>
                        <ImageUploader value={item.image} onChange={val => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], image: val };
                          updateConfig('items', items);
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Input placeholder="名称" value={item.text} onChange={e => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], text: e.target.value };
                          updateConfig('items', items);
                        }} style={{ marginBottom: 8 }} />
                        <Input placeholder="跳转链接" value={item.link} onChange={e => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], link: e.target.value };
                          updateConfig('items', items);
                        }} />
                      </div>
                      <Button danger size="small" onClick={() => {
                        const items = cfg.items.filter((_: any, i: number) => i !== idx);
                        updateConfig('items', items);
                      }}>删除</Button>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                  updateConfig('items', [...(cfg.items || []), { image: '', text: '', link: '' }]);
                }}>添加导航项</Button>
              </div>
            </Form.Item>
          </>
        );

      case 'serviceNav':
        return (
          <>
            <Form.Item label="列数">
              <Radio.Group value={cfg.columns} onChange={e => updateConfig('columns', e.target.value)}>
                <Radio.Button value={4}>4列</Radio.Button>
                <Radio.Button value={5}>5列</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="服务项">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(cfg.items || []).map((item: any, idx: number) => (
                  <Card key={idx} size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Select value={item.icon} onChange={v => {
                        const items = [...cfg.items];
                        items[idx] = { ...items[idx], icon: v };
                        updateConfig('items', items);
                      }} style={{ width: 120 }} options={[
                        { label: '停车', value: 'parking' },
                        { label: '金币', value: 'coins' },
                        { label: '二维码', value: 'qrcode' },
                        { label: '皇冠', value: 'crown' },
                        { label: '客服', value: 'headphones' },
                        { label: '搜索', value: 'search' },
                        { label: '汽车', value: 'car' },
                        { label: '充电', value: 'zap' },
                        { label: '礼物', value: 'gift' },
                        { label: '餐具', value: 'utensils' },
                        { label: '商城', value: 'shopping-bag' },
                        { label: '标签', value: 'tag' },
                        { label: '铃铛', value: 'bell' },
                        { label: '用户', value: 'user' },
                        { label: '设置', value: 'settings' },
                      ]} />
                      <Input placeholder="服务名称" value={item.text} onChange={e => {
                        const items = [...cfg.items];
                        items[idx] = { ...items[idx], text: e.target.value };
                        updateConfig('items', items);
                      }} style={{ flex: 1 }} />
                      <Input placeholder="跳转链接" value={item.link} onChange={e => {
                        const items = [...cfg.items];
                        items[idx] = { ...items[idx], link: e.target.value };
                        updateConfig('items', items);
                      }} style={{ width: 120 }} />
                      <Button danger size="small" onClick={() => {
                        const items = cfg.items.filter((_: any, i: number) => i !== idx);
                        updateConfig('items', items);
                      }}>删除</Button>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                  updateConfig('items', [...(cfg.items || []), { icon: 'parking', text: '', link: '' }]);
                }}>添加服务项</Button>
              </div>
            </Form.Item>
          </>
        );

      case 'eventCard':
        return (
          <>
            <Form.Item label="标题"><Input value={cfg.title} onChange={e => updateConfig('title', e.target.value)} /></Form.Item>
            <Form.Item label="副标题"><Input value={cfg.subtitle} onChange={e => updateConfig('subtitle', e.target.value)} /></Form.Item>
            <Form.Item label="年份"><Input value={cfg.year} onChange={e => updateConfig('year', e.target.value)} /></Form.Item>
            <Form.Item label="月份"><Input value={cfg.month} onChange={e => updateConfig('month', e.target.value)} /></Form.Item>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="活动列表">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(cfg.events || []).map((event: any, idx: number) => (
                  <Card key={idx} size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Input placeholder="日期(07.01)" value={event.date} onChange={e => {
                        const events = [...cfg.events];
                        events[idx] = { ...events[idx], date: e.target.value };
                        updateConfig('events', events);
                      }} style={{ width: 80 }} />
                      <Input placeholder="活动标题" value={event.title} onChange={e => {
                        const events = [...cfg.events];
                        events[idx] = { ...events[idx], title: e.target.value };
                        updateConfig('events', events);
                      }} />
                      <Input placeholder="活动地点" value={event.location} onChange={e => {
                        const events = [...cfg.events];
                        events[idx] = { ...events[idx], location: e.target.value };
                        updateConfig('events', events);
                      }} style={{ flex: 1 }} />
                      <Button danger size="small" onClick={() => {
                        const events = cfg.events.filter((_: any, i: number) => i !== idx);
                        updateConfig('events', events);
                      }}>删除</Button>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                  updateConfig('events', [...(cfg.events || []), { date: '', title: '', location: '' }]);
                }}>添加活动</Button>
              </div>
            </Form.Item>
          </>
        );

      case 'merchantCard':
        return (
          <>
            <Form.Item label="布局方式">
              <Radio.Group value={cfg.layout} onChange={e => updateConfig('layout', e.target.value)}>
                <Radio value="grid2">双列</Radio>
                <Radio value="grid1">单列</Radio>
              </Radio.Group>
            </Form.Item>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="商户卡片">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(cfg.items || []).map((item: any, idx: number) => (
                  <Card key={idx} size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0 }}>
                        <ImageUploader value={item.image} onChange={val => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], image: val };
                          updateConfig('items', items);
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Input placeholder="标签(如:开业)" value={item.tag} onChange={e => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], tag: e.target.value };
                          updateConfig('items', items);
                        }} style={{ marginBottom: 8 }} />
                        <Input placeholder="标题" value={item.title} onChange={e => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], title: e.target.value };
                          updateConfig('items', items);
                        }} style={{ marginBottom: 8 }} />
                        <Input placeholder="商户名称" value={item.subtitle} onChange={e => {
                          const items = [...cfg.items];
                          items[idx] = { ...items[idx], subtitle: e.target.value };
                          updateConfig('items', items);
                        }} />
                      </div>
                      <Button danger size="small" onClick={() => {
                        const items = cfg.items.filter((_: any, i: number) => i !== idx);
                        updateConfig('items', items);
                      }}>删除</Button>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                  updateConfig('items', [...(cfg.items || []), { image: '', tag: '', title: '', subtitle: '' }]);
                }}>添加卡片</Button>
              </div>
            </Form.Item>
          </>
        );

      case 'categoryTabs':
        return (
          <>
            <Form.Item label="显示数量"><Switch checked={cfg.showCount !== false} onChange={v => updateConfig('showCount', v)} /></Form.Item>
            <Form.Item label="选中颜色"><Input type="color" value={cfg.activeColor} onChange={e => updateConfig('activeColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="分类列表">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(cfg.categories || []).map((cat: any, idx: number) => (
                  <Card key={idx} size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Input placeholder="分类名称" value={cat.name} onChange={e => {
                        const categories = [...cfg.categories];
                        categories[idx] = { ...categories[idx], name: e.target.value };
                        updateConfig('categories', categories);
                      }} />
                      <InputNumber placeholder="数量" value={cat.count} onChange={v => {
                        const categories = [...cfg.categories];
                        categories[idx] = { ...categories[idx], count: v };
                        updateConfig('categories', categories);
                      }} style={{ width: 100 }} />
                      <Button danger size="small" onClick={() => {
                        const categories = cfg.categories.filter((_: any, i: number) => i !== idx);
                        updateConfig('categories', categories);
                      }}>删除</Button>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                  updateConfig('categories', [...(cfg.categories || []), { name: '', count: 0 }]);
                }}>添加分类</Button>
              </div>
            </Form.Item>
          </>
        );

      case 'floorFilter':
        return (
          <>
            <Form.Item label="显示图标"><Switch checked={cfg.showIcon !== false} onChange={v => updateConfig('showIcon', v)} /></Form.Item>
            <Form.Item label="默认选中">
              <Select value={cfg.defaultFloor} onChange={v => updateConfig('defaultFloor', v)}>
                {(cfg.floors || []).map(f => (
                  <Select.Option key={f} value={f}>{f}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="楼层列表">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(cfg.floors || []).map((floor: any, idx: number) => (
                  <Card key={idx} size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Input placeholder="楼层名称" value={floor} onChange={e => {
                        const floors = [...cfg.floors];
                        floors[idx] = e.target.value;
                        updateConfig('floors', floors);
                      }} />
                      <Button danger size="small" onClick={() => {
                        const floors = cfg.floors.filter((_: any, i: number) => i !== idx);
                        updateConfig('floors', floors);
                      }}>删除</Button>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                  updateConfig('floors', [...(cfg.floors || []), '']);
                }}>添加楼层</Button>
              </div>
            </Form.Item>
          </>
        );

      case 'title':
        return (
          <>
            <Form.Item label="标题"><Input value={cfg.title} onChange={e => updateConfig('title', e.target.value)} /></Form.Item>
            <Form.Item label="对齐方式">
              <Radio.Group value={cfg.align} onChange={e => updateConfig('align', e.target.value)}>
                <Radio value="left">左对齐</Radio>
                <Radio value="center">居中</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="显示更多"><Switch checked={cfg.showMore} onChange={v => updateConfig('showMore', v)} /></Form.Item>
            {cfg.showMore && <Form.Item label="更多文字"><Input value={cfg.moreText} onChange={e => updateConfig('moreText', e.target.value)} /></Form.Item>}
            <Form.Item label="文字颜色"><Input type="color" value={cfg.color} onChange={e => updateConfig('color', e.target.value)} style={{ width: 60 }} /></Form.Item>
            <Form.Item label="背景颜色"><Input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
          </>
        );

      case 'imageSingle':
        return (
          <>
            <Form.Item label="广告图片">
              <ImageUploader value={cfg.image} onChange={val => updateConfig('image', val)} />
            </Form.Item>
            <Form.Item label="跳转链接"><Input value={cfg.link} onChange={e => updateConfig('link', e.target.value)} placeholder="请输入跳转链接" /></Form.Item>
            <Form.Item label="边距"><Slider value={cfg.padding} onChange={v => updateConfig('padding', v)} min={0} max={24} /></Form.Item>
            <Form.Item label="圆角"><Slider value={cfg.borderRadius} onChange={v => updateConfig('borderRadius', v)} min={0} max={24} /></Form.Item>
          </>
        );

      case 'goodsList':
        return (
          <>
            <Form.Item label="布局方式">
              <Radio.Group value={cfg.layout} onChange={e => updateConfig('layout', e.target.value)}>
                <Radio.Button value="grid1">大图</Radio.Button>
                <Radio.Button value="grid2">双列</Radio.Button>
                <Radio.Button value="grid3">三列</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="数据来源">
              <Radio.Group value={cfg.source} onChange={e => updateConfig('source', e.target.value)}>
                <Radio value="manual">手动选择</Radio>
                <Radio value="category">按分类</Radio>
                <Radio value="auto">自动推荐</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="显示数量"><InputNumber value={cfg.limit} onChange={v => updateConfig('limit', v)} min={1} max={20} /></Form.Item>
            <Form.Item label="显示价格"><Switch checked={cfg.showPrice} onChange={v => updateConfig('showPrice', v)} /></Form.Item>
            <Form.Item label="显示销量"><Switch checked={cfg.showSales} onChange={v => updateConfig('showSales', v)} /></Form.Item>
          </>
        );

      case 'flashSale':
        return (
          <>
            <Form.Item label="标题"><Input value={cfg.title} onChange={e => updateConfig('title', e.target.value)} /></Form.Item>
            <Form.Item label="副标题"><Input value={cfg.subtitle} onChange={e => updateConfig('subtitle', e.target.value)} /></Form.Item>
            <Form.Item label="显示倒计时"><Switch checked={cfg.countdown} onChange={v => updateConfig('countdown', v)} /></Form.Item>
            <Form.Item label="商品数量"><InputNumber value={cfg.goodsCount} onChange={v => updateConfig('goodsCount', v)} min={1} max={10} /></Form.Item>
            <Form.Item label="背景颜色"><Input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
          </>
        );

      case 'groupBuy':
        return (
          <>
            <Form.Item label="标题"><Input value={cfg.title} onChange={e => updateConfig('title', e.target.value)} /></Form.Item>
            <Form.Item label="副标题"><Input value={cfg.subtitle} onChange={e => updateConfig('subtitle', e.target.value)} /></Form.Item>
            <Form.Item label="商品数量"><InputNumber value={cfg.goodsCount} onChange={v => updateConfig('goodsCount', v)} min={1} max={10} /></Form.Item>
            <Form.Item label="背景颜色"><Input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
          </>
        );

      case 'coupon':
        return (
          <>
            <Form.Item label="标题"><Input value={cfg.title} onChange={e => updateConfig('title', e.target.value)} /></Form.Item>
            <Form.Item label="展示样式">
              <Radio.Group value={cfg.style} onChange={e => updateConfig('style', e.target.value)}>
                <Radio value="horizontal">横向滑动</Radio>
                <Radio value="grid">网格展示</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="背景颜色"><Input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
          </>
        );

      case 'memberInfo':
        return (
          <>
            <Form.Item label="显示金币"><Switch checked={cfg.showPoints} onChange={v => updateConfig('showPoints', v)} /></Form.Item>
            <Form.Item label="显示等级"><Switch checked={cfg.showLevel} onChange={v => updateConfig('showLevel', v)} /></Form.Item>
            <Form.Item label="显示余额"><Switch checked={cfg.showBalance} onChange={v => updateConfig('showBalance', v)} /></Form.Item>
            <Form.Item label="显示优惠券数量"><Switch checked={cfg.showCouponCount} onChange={v => updateConfig('showCouponCount', v)} /></Form.Item>
          </>
        );

      case 'parkingInfo':
        return (
          <>
            <Form.Item label="显示时长"><Switch checked={cfg.showDuration} onChange={v => updateConfig('showDuration', v)} /></Form.Item>
            <Form.Item label="显示费用"><Switch checked={cfg.showFee} onChange={v => updateConfig('showFee', v)} /></Form.Item>
            <Form.Item label="显示折扣"><Switch checked={cfg.showDiscount} onChange={v => updateConfig('showDiscount', v)} /></Form.Item>
          </>
        );

      case 'richText':
        return (
          <>
            <Form.Item label="内容"><Input.TextArea value={cfg.content} onChange={e => updateConfig('content', e.target.value)} rows={8} /></Form.Item>
            <Form.Item label="内边距"><Slider value={cfg.padding} onChange={v => updateConfig('padding', v)} min={0} max={24} /></Form.Item>
            <Form.Item label="背景颜色"><Input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)} style={{ width: 60 }} /></Form.Item>
          </>
        );

      default:
        return <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>该组件暂无配置项</div>;
    }
  };

  return <Form layout="vertical">{renderField()}</Form>;
};

const AudienceModal: React.FC<{
  open: boolean;
  onClose: () => void;
  pageId: number;
  audiences: any[];
  onConfirm: (audienceId: number) => void;
}> = ({ open, onClose, pageId, audiences, onConfirm }) => {
  const [selectedAudience, setSelectedAudience] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedAudience) {
      onConfirm(selectedAudience);
      setSelectedAudience(null);
      onClose();
    }
  };

  return (
    <Modal
      title="选择目标人群"
      open={open}
      onOk={handleConfirm}
      onCancel={onClose}
      width={520}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {audiences.map(audience => (
          <Card
            key={audience.id}
            size="small"
            style={{
              cursor: 'pointer',
              border: selectedAudience === audience.id ? '2px solid #1890ff' : '1px solid #e8e8e8',
              background: selectedAudience === audience.id ? '#e6f7ff' : '#fff'
            }}
            onClick={() => setSelectedAudience(audience.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{audience.name}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{audience.description}</div>
              </div>
              <Checkbox checked={selectedAudience === audience.id} onChange={() => setSelectedAudience(audience.id)} />
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );
};

export default function ShopHomeConfig() {
  const [configs, setConfigs] = useState<PageConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<PageConfig | null>(null);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [audiences, setAudiences] = useState<any[]>([]);
  const [audienceModalOpen, setAudienceModalOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  useEffect(() => {
    fetchListData('decoration/pages').then((res: any) => {
      const list = res.list || [];
      setConfigs(list);
      if (list.length > 0) {
        selectConfig(list[0]);
      }
    });
    fetchListData('decoration/audience').then((res: any) => {
      setAudiences(res.list || []);
    });
  }, []);

  useEffect(() => {
    if (selectedConfig) {
      fetchListData(`decoration/pages/${selectedConfig.id}/versions`).then((res: any) => {
        setVersions(res.list || []);
      });
    }
  }, [selectedConfig]);

  const selectConfig = (config: PageConfig) => {
    setSelectedConfig(config);
    try {
      setComponents(JSON.parse(config.components || '[]'));
    } catch {
      setComponents([]);
    }
    setSelectedCompId(null);
  };

  const handleAddConfig = () => {
    form.resetFields();
    form.setFieldsValue({ status: 'draft', pageType: 'home' });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEditConfig = () => {
    if (!selectedConfig) return;
    form.setFieldsValue(selectedConfig);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmitConfig = async () => {
    const values = await form.validateFields();
    if (isEditing && selectedConfig) {
      values.components = JSON.stringify(components);
      await updateItemData('decoration/pages', selectedConfig.id, values);
      setConfigs(prev => prev.map(c => c.id === selectedConfig.id ? { ...c, ...values } : c));
      setSelectedConfig({ ...selectedConfig, ...values });
      setModalOpen(false);
      message.success('保存成功');
    } else {
      values.components = '[]';
      const created = await createItemData('decoration/pages', values);
      const newConfig: PageConfig = { ...created, components: '[]' } as PageConfig;
      setConfigs(prev => [...prev, newConfig]);
      setSelectedConfig(newConfig);
      setComponents([]);
      setModalOpen(false);
      message.success('创建成功');
    }
  };

  const handleDeleteConfig = async (id: number) => {
    await deleteItemData('decoration/pages', id);
    setConfigs(prev => prev.filter(c => c.id !== id));
    if (selectedConfig?.id === id) {
      setSelectedConfig(null);
      setComponents([]);
    }
    message.success('删除成功');
  };

  const handleSavePage = async () => {
    if (!selectedConfig) return;
    await updateItemData('decoration/pages', selectedConfig.id, {
      components: JSON.stringify(components)
    });
    setConfigs(prev => prev.map(c =>
      c.id === selectedConfig.id ? { ...c, components: JSON.stringify(components) } : c
    ));
    message.success('页面保存成功');
  };

  const handlePublish = async () => {
    if (!selectedConfig) return;
    await request(`decoration/pages/${selectedConfig.id}/publish`, { method: 'POST' });
    setSelectedConfig(prev => prev ? { ...prev, status: 'published' } : null);
    setConfigs(prev => prev.map(c =>
      c.id === selectedConfig.id ? { ...c, status: 'published' } : c
    ));
    message.success('发布成功');
  };

  const handleUnpublish = async () => {
    if (!selectedConfig) return;
    await request(`decoration/pages/${selectedConfig.id}/unpublish`, { method: 'POST' });
    setSelectedConfig(prev => prev ? { ...prev, status: 'draft' } : null);
    setConfigs(prev => prev.map(c =>
      c.id === selectedConfig.id ? { ...c, status: 'draft' } : c
    ));
    message.success('下架成功');
  };

  const handlePreview = async () => {
    if (!selectedConfig) return;
    const res = await request(`decoration/pages/${selectedConfig.id}/preview`, { method: 'POST' });
    message.info(`预览链接: ${res.data.previewUrl}`);
  };

  const handleRollback = async (version: string) => {
    if (!selectedConfig) return;
    await request(`decoration/pages/${selectedConfig.id}/rollback`, {
      method: 'POST',
      data: { version }
    });
    message.success('回滚成功');
    setVersionModalOpen(false);
    fetchListData('decoration/pages').then((res: any) => {
      const list = res.list || [];
      setConfigs(list);
      const config = list.find((c: any) => c.id === selectedConfig.id);
      if (config) selectConfig(config);
    });
  };

  const handleApplyAudience = async (audienceId: number) => {
    if (!selectedConfig) return;
    const audience = audiences.find(a => a.id === audienceId);
    if (!audience) return;
    const personalizationData = {
      pageId: selectedConfig.id,
      audienceId,
      components: JSON.stringify(components),
      status: 'enabled'
    };
    await createItemData('decoration/personalization', personalizationData);
    message.success(`已为 ${audience.name} 配置差异化页面`);
  };

  const addComponent = (type: string) => {
    const def = getCompTypeDef(type);
    if (!def) return;
    const newComp: PageComponent = {
      id: `comp_${Date.now()}`,
      type,
      name: def.name,
      config: { ...def.defaultConfig }
    };
    const next = [...components, newComp];
    setComponents(next);
    setSelectedCompId(newComp.id);
  };

  const updateComponentConfig = (compId: string, config: Record<string, any>) => {
    setComponents(prev => prev.map(c =>
      c.id === compId ? { ...c, config } : c
    ));
  };

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedCompId === id) setSelectedCompId(null);
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    setComponents(prev => {
      const next = [...prev];
      if (direction === 'up' && index > 0) {
        [next[index], next[index - 1]] = [next[index - 1], next[index]];
      } else if (direction === 'down' && index < next.length - 1) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, comp: PageComponent) => {
    e.dataTransfer.setData('compId', comp.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const compId = e.dataTransfer.getData('compId');
    if (!compId) return;
    const fromIndex = components.findIndex(c => c.id === compId);
    if (fromIndex === -1 || fromIndex === targetIndex) return;
    setComponents(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const selectedComp = components.find(c => c.id === selectedCompId);

  const groupedTypes = COMPONENT_TYPES.reduce((acc, comp) => {
    if (!acc[comp.group]) acc[comp.group] = [];
    acc[comp.group].push(comp);
    return acc;
  }, {} as Record<string, CompTypeDef[]>);

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, padding: '12px 16px', background: '#fff', borderRadius: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LayoutOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>小程序页面装修</span>
          {selectedConfig && (
            <Tag color={selectedConfig.status === 'published' ? 'green' : selectedConfig.status === 'draft' ? 'orange' : 'default'}>
              {selectedConfig.status === 'published' ? '已发布' : '草稿'}
            </Tag>
          )}
        </div>
        <Space>
          <Radio.Group value={previewMode} onChange={e => setPreviewMode(e.target.value)} size="small">
            <Radio.Button value="mobile"><MobileOutlined /> 手机预览</Radio.Button>
            <Radio.Button value="desktop"><DesktopOutlined /> 平板预览</Radio.Button>
          </Radio.Group>
          <Button icon={<EyeOutlined />} onClick={handlePreview}>预览</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSavePage}>保存页面</Button>
          {selectedConfig && selectedConfig.status === 'draft' && (
            <Button type="primary" icon={<UploadOutlined />} onClick={handlePublish}>发布</Button>
          )}
          {selectedConfig && selectedConfig.status === 'published' && (
            <Button icon={<DownloadOutlined />} onClick={handleUnpublish}>下架</Button>
          )}
          <Button icon={<RollbackOutlined />} onClick={() => setVersionModalOpen(true)}>版本管理</Button>
          <Button icon={<UserOutlined />} onClick={() => setAudienceModalOpen(true)}>千人千面</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={5}>
          <Card size="small" title="页面列表" style={{ marginBottom: 16 }}>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
              {configs.map(config => (
                <div
                  key={config.id}
                  onClick={() => selectConfig(config)}
                  style={{
                    padding: '10px 12px', marginBottom: 6, borderRadius: 6, cursor: 'pointer',
                    background: selectedConfig?.id === config.id ? '#e6f7ff' : '#f5f5f5',
                    border: selectedConfig?.id === config.id ? '1px solid #1890ff' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{config.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>
                      {config.pageType === 'home' ? '首页' : config.pageType}
                    </div>
                  </div>
                  <Popconfirm title="确认删除?" onConfirm={() => handleDeleteConfig(config.id)}>
                    <Button size="small" type="text" danger aria-label="删除页面配置" icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
                  </Popconfirm>
                </div>
              ))}
            </div>
            <Space style={{ width: '100%' }}>
              <Button type="primary" block size="small" icon={<PlusOutlined />} onClick={handleAddConfig}>新建页面</Button>
              <Button block size="small" icon={<EditOutlined />} onClick={handleEditConfig}>编辑</Button>
            </Space>
          </Card>

          <Card size="small" title="组件库" style={{ height: 'calc(100vh - 400px)' }}>
            <Tabs size="small" defaultActiveKey="基础">
              {Object.entries(groupedTypes).map(([group, items]) => (
                <TabPane tab={group} key={group}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {items.map(comp => (
                      <div
                        key={comp.type}
                        onClick={() => addComponent(comp.type)}
                        style={{
                          padding: '10px 6px', borderRadius: 6, cursor: 'pointer',
                          border: '1px solid #e8e8e8', textAlign: 'center',
                          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#1890ff';
                          e.currentTarget.style.color = '#1890ff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#e8e8e8';
                          e.currentTarget.style.color = 'inherit';
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{comp.icon}</div>
                        <div style={{ fontSize: 12 }}>{comp.name}</div>
                      </div>
                    ))}
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </Card>
        </Col>

        <Col span={13}>
          <Card
            size="small"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MobileOutlined />
                <span>页面预览（点击组件选中，拖拽可排序）</span>
              </div>
            }
            style={{ height: 'calc(100vh - 120px)' }}
          >
            <div style={{
              background: '#f0f0f0', borderRadius: 8, padding: '16px',
              height: 'calc(100vh - 180px)', overflowY: 'auto', display: 'flex', justifyContent: 'center'
            }}>
              <div style={{
                width: previewMode === 'mobile' ? 375 : 768,
                background: '#f5f5f5', borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden', minHeight: 600,
                position: 'relative'
              }}>
                <div style={{
                  height: 28, background: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#333'
                }}>
                  9:41
                </div>
                <div style={{
                  height: 44, background: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600,
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  {selectedConfig?.name || '商城首页'}
                </div>
                <div style={{ padding: '8px 0', minHeight: 400 }}>
                  {components.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: 60, color: '#999',
                      border: '2px dashed #ddd', borderRadius: 8, margin: 16
                    }}>
                      <PlusOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                      <div>点击左侧组件添加到页面</div>
                    </div>
                  ) : (
                    components.map((comp, idx) => (
                      <div
                        key={comp.id}
                        draggable
                        onDragStart={e => handleDragStart(e, comp)}
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(e, idx)}
                        style={{ position: 'relative' }}
                      >
                        <ComponentPreview
                          comp={comp}
                          isSelected={selectedCompId === comp.id}
                          onClick={() => setSelectedCompId(comp.id)}
                        />
                        {selectedCompId === comp.id && (
                          <div style={{
                            position: 'absolute', right: 4, top: 4, zIndex: 10,
                            display: 'flex', gap: 2
                          }}>
                            <Button size="small" aria-label="上移" icon={<UpOutlined />} onClick={e => { e.stopPropagation(); moveComponent(idx, 'up'); }} />
                            <Button size="small" aria-label="下移" icon={<DownOutlined />} onClick={e => { e.stopPropagation(); moveComponent(idx, 'down'); }} />
                            <Button size="small" aria-label="复制" icon={<CopyOutlined />} onClick={e => e.stopPropagation()} />
                            <Button size="small" danger aria-label="删除" icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); deleteComponent(comp.id); }} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div style={{ height: 50, background: '#fff', borderTop: '1px solid #f0f0f0' }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            size="small"
            title={selectedComp ? `配置: ${selectedComp.name}` : '组件配置'}
            style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}
          >
            {selectedComp ? (
              <ConfigForm
                comp={selectedComp}
                onChange={config => updateComponentConfig(selectedComp.id, config)}
              />
            ) : (
              <Empty description="点击中间画布中的组件进行配置" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={isEditing ? '编辑页面' : '新建页面'}
        open={modalOpen}
        onOk={handleSubmitConfig}
        onCancel={() => setModalOpen(false)}
        width={480}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="页面名称" rules={[{ required: true }]}>
            <Input placeholder="如：商城首页" />
          </Form.Item>
          <Form.Item name="pageType" label="页面类型">
            <Select options={[
              { label: '首页', value: 'home' },
              { label: '商品列表页', value: 'goods' },
              { label: '会员中心', value: 'member' },
              { label: '分类页', value: 'category' },
              { label: '自定义页面', value: 'custom' }
            ]} />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber placeholder="数字越小越靠前" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }, { label: '草稿', value: 'draft' }, { label: '已发布', value: 'published' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <AudienceModal
        open={audienceModalOpen}
        onClose={() => setAudienceModalOpen(false)}
        pageId={selectedConfig?.id || 0}
        audiences={audiences}
        onConfirm={handleApplyAudience}
      />

      <Modal
        title="版本管理"
        open={versionModalOpen}
        onCancel={() => setVersionModalOpen(false)}
        width={600}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {versions.length === 0 ? (
            <Empty description="暂无版本记录" />
          ) : (
            versions.map((v, i) => (
              <Card key={v.id} size="small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>版本 {v.version}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    创建时间: {v.createdAt} | 操作人: {v.operator}
                  </div>
                </div>
                <Button size="small" onClick={() => handleRollback(v.version)}>回滚到此版本</Button>
              </Card>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
