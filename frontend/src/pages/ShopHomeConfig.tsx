import { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Tag, message,
  Space, Upload, Radio, Switch, Slider, Divider, Tabs, Empty, Popconfirm
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UpOutlined, DownOutlined,
  PictureOutlined, ShoppingOutlined, AppstoreOutlined, SearchOutlined,
  BellOutlined, GiftOutlined, ThunderboltOutlined, TeamOutlined,
  FileImageOutlined, LayoutOutlined, BgColorsOutlined, CopyOutlined,
  DragOutlined, SaveOutlined, MobileOutlined, DesktopOutlined
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData } from '../services/request';

const { TabPane } = Tabs;

// ===================== 类型定义 =====================

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
}

interface CompTypeDef {
  type: string;
  name: string;
  icon: React.ReactNode;
  group: '基础' | '商品' | '营销';
  defaultConfig: Record<string, any>;
}

// ===================== 组件库定义 =====================

const COMPONENT_TYPES: CompTypeDef[] = [
  {
    type: 'search',
    name: '搜索框',
    icon: <SearchOutlined />,
    group: '基础',
    defaultConfig: { placeholder: '搜索商品', style: 'round', bgColor: '#f5f5f5' }
  },
  {
    type: 'notice',
    name: '公告栏',
    icon: <BellOutlined />,
    group: '基础',
    defaultConfig: { text: '欢迎来到我们的商城！', color: '#ff4d4f', bgColor: '#fff7e6', icon: '🔊' }
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
    type: 'richText',
    name: '富文本',
    icon: <EditOutlined />,
    group: '基础',
    defaultConfig: { content: '<p>请输入内容...</p>', padding: 12, bgColor: '#fff' }
  },
];

// ===================== 工具函数 =====================

const getCompTypeDef = (type: string) => COMPONENT_TYPES.find(c => c.type === type);

// ===================== 图片上传组件 =====================

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

// ===================== 组件预览渲染 =====================

const ComponentPreview: React.FC<{ comp: PageComponent; isSelected: boolean; onClick: () => void }> = ({ comp, isSelected, onClick }) => {
  const def = getCompTypeDef(comp.type);
  const cfg = comp.config;

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    border: isSelected ? '2px dashed #1890ff' : '2px solid transparent',
    borderRadius: 4,
    transition: 'all 0.2s',
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
            <span style={{ color: cfg.color || '#ff4d4f', flexShrink: 0 }}>{cfg.icon || '🔊'}</span>
            <span style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cfg.text || '公告内容'}
            </span>
          </div>
        );

      case 'banner':
        return (
          <div style={{ position: 'relative', height: cfg.height || 160, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
            {cfg.items?.[0]?.image ? (
              <img src={cfg.items[0].image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
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
                      <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
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
              <img src={cfg.image} style={{ width: '100%', borderRadius: cfg.borderRadius || 8 }} alt="" />
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

// ===================== 配置表单渲染 =====================

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

// ===================== 主组件 =====================

export default function ShopHomeConfig() {
  const [configs, setConfigs] = useState<PageConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<PageConfig | null>(null);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  useEffect(() => {
    fetchListData('shop/home-config').then((res: any) => {
      const list = res.list || [];
      setConfigs(list);
      if (list.length > 0) {
        selectConfig(list[0]);
      }
    });
  }, []);

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
    form.setFieldsValue({ status: 'enabled', pageType: 'home' });
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
      await updateItemData('shop/home-config', selectedConfig.id, values);
      setConfigs(prev => prev.map(c => c.id === selectedConfig.id ? { ...c, ...values } : c));
      setSelectedConfig({ ...selectedConfig, ...values });
      setModalOpen(false);
      message.success('保存成功');
    } else {
      values.components = '[]';
      const created = await createItemData('shop/home-config', values);
      const newConfig: PageConfig = { ...created, components: '[]' } as PageConfig;
      setConfigs(prev => [...prev, newConfig]);
      setSelectedConfig(newConfig);
      setComponents([]);
      setModalOpen(false);
      message.success('创建成功');
    }
  };

  const handleDeleteConfig = async (id: number) => {
    await deleteItemData('shop/home-config', id);
    setConfigs(prev => prev.filter(c => c.id !== id));
    if (selectedConfig?.id === id) {
      setSelectedConfig(null);
      setComponents([]);
    }
    message.success('删除成功');
  };

  const handleSavePage = async () => {
    if (!selectedConfig) return;
    await updateItemData('shop/home-config', selectedConfig.id, {
      components: JSON.stringify(components)
    });
    setConfigs(prev => prev.map(c =>
      c.id === selectedConfig.id ? { ...c, components: JSON.stringify(components) } : c
    ));
    message.success('页面保存成功');
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

  // 拖拽
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

  // 按分组组织组件
  const groupedTypes = COMPONENT_TYPES.reduce((acc, comp) => {
    if (!acc[comp.group]) acc[comp.group] = [];
    acc[comp.group].push(comp);
    return acc;
  }, {} as Record<string, CompTypeDef[]>);

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, padding: '12px 16px', background: '#fff', borderRadius: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LayoutOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>小程序页面装修</span>
          {selectedConfig && (
            <Tag color={selectedConfig.status === 'enabled' ? 'green' : 'orange'}>
              {selectedConfig.name}
            </Tag>
          )}
        </div>
        <Space>
          <Radio.Group value={previewMode} onChange={e => setPreviewMode(e.target.value)} size="small">
            <Radio.Button value="mobile"><MobileOutlined /> 手机预览</Radio.Button>
            <Radio.Button value="desktop"><DesktopOutlined /> 平板预览</Radio.Button>
          </Radio.Group>
          <Button icon={<EyeOutlined />}>预览</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSavePage}>保存页面</Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* 左侧：页面列表 + 组件库 */}
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
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
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
                          transition: 'all 0.2s',
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

        {/* 中间：手机预览画布 */}
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
                {/* 手机状态栏 */}
                <div style={{
                  height: 28, background: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#333'
                }}>
                  9:41
                </div>
                {/* 页面标题 */}
                <div style={{
                  height: 44, background: '#fff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600,
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  {selectedConfig?.name || '商城首页'}
                </div>
                {/* 组件画布 */}
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
                        {/* 悬浮操作按钮 */}
                        {selectedCompId === comp.id && (
                          <div style={{
                            position: 'absolute', right: 4, top: 4, zIndex: 10,
                            display: 'flex', gap: 2
                          }}>
                            <Button size="small" icon={<UpOutlined />} onClick={e => { e.stopPropagation(); moveComponent(idx, 'up'); }} />
                            <Button size="small" icon={<DownOutlined />} onClick={e => { e.stopPropagation(); moveComponent(idx, 'down'); }} />
                            <Button size="small" icon={<CopyOutlined />} onClick={e => e.stopPropagation()} />
                            <Button size="small" danger icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); deleteComponent(comp.id); }} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {/* 底部tabbar占位 */}
                <div style={{ height: 50, background: '#fff', borderTop: '1px solid #f0f0f0' }} />
              </div>
            </div>
          </Card>
        </Col>

        {/* 右侧：组件配置 */}
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

      {/* 页面配置弹窗 */}
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
            <Select options={[{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
