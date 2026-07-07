import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Tag, message, Space, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UpOutlined, DownOutlined, LayoutOutlined, PictureOutlined, ShoppingCartOutlined, TagOutlined, GifOutlined, ClockCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData } from '../services/request';

const { useBreakpoint } = Grid;

interface ComponentItem {
  id: string;
  type: string;
  name: string;
  config: any;
  sort: number;
}

interface HomeConfig {
  id: number;
  name: string;
  pageType: string;
  components: string;
  sort: number;
  status: string;
}

const componentTypes = [
  { type: 'banner', name: '轮播图', icon: <PictureOutlined />, color: '#FF6B6B' },
  { type: 'category', name: '分类导航', icon: <LayoutOutlined />, color: '#4ECDC4' },
  { type: 'hotGoods', name: '热销商品', icon: <ShoppingCartOutlined />, color: '#45B7D1' },
  { type: 'newGoods', name: '新品推荐', icon: <TagOutlined />, color: '#96CEB4' },
  { type: 'coupon', name: '优惠券', icon: <HeartOutlined />, color: '#FFEAA7' },
  { type: 'flashSale', name: '限时秒杀', icon: <ClockCircleOutlined />, color: '#DDA0DD' },
  { type: 'bannerGrid', name: '宫格海报', icon: <LayoutOutlined />, color: '#98D8C8' },
  { type: 'brand', name: '品牌展示', icon: <TagOutlined />, color: '#F7DC6F' },
];

export default function ShopHomeConfig() {
  const [configs, setConfigs] = useState<HomeConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<HomeConfig | null>(null);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [componentModalOpen, setComponentModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);
  const [form] = Form.useForm();
  const [componentForm] = Form.useForm();
  const screens = useBreakpoint();

  useEffect(() => {
    fetchListData('shop/home-config').then((res: any) => {
      setConfigs(res.list || []);
      if ((res.list || []).length > 0) {
        selectConfig(res.list[0]);
      }
    });
  }, []);

  const selectConfig = (config: HomeConfig) => {
    setSelectedConfig(config);
    try {
      setComponents(JSON.parse(config.components || '[]'));
    } catch {
      setComponents([]);
    }
  };

  const handleAddConfig = () => {
    form.resetFields();
    form.setFieldsValue({ status: 'enabled', pageType: 'home' });
    setSelectedConfig(null);
    setComponents([]);
    setIsEditingConfig(false);
    setModalOpen(true);
  };

  const handleSubmitConfig = async () => {
    const values = await form.validateFields();
    if (isEditingConfig && selectedConfig) {
      values.components = JSON.stringify(components);
      await updateItemData('shop/home-config', selectedConfig.id, values);
      setConfigs(prev => prev.map(c => c.id === selectedConfig.id ? { ...c, ...values } : c));
      setSelectedConfig({ ...selectedConfig, ...values });
      setModalOpen(false);
      message.success('编辑成功');
    } else {
      values.components = '[]';
      const created = await createItemData('shop/home-config', values);
      const newConfig: HomeConfig = { ...created, components: '[]' } as HomeConfig;
      setConfigs(prev => [...prev, newConfig]);
      setSelectedConfig(newConfig);
      setComponents([]);
      setModalOpen(false);
      message.success('新增成功');
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

  const handleAddComponent = (type: string) => {
    const compType = componentTypes.find(t => t.type === type);
    const newComponent: ComponentItem = {
      id: `comp-${Date.now()}`,
      type,
      name: compType?.name || type,
      config: {},
      sort: components.length + 1,
    };
    setComponents([...components, newComponent]);
    setEditingComponent(newComponent);
    componentForm.setFieldsValue(newComponent.config);
    setComponentModalOpen(true);
  };

  // ===== 拖拽支持 =====
  // 拖拽源（组件库）：写入 dataTransfer
  const handleLibraryDragStart = (e: React.DragEvent<HTMLDivElement>, type: string) => {
    e.dataTransfer.setData('text/plain', `new:${type}`);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // 拖拽源（已有组件）：拖动排序，写入 id
  const handleComponentDragStart = (e: React.DragEvent<HTMLDivElement>, comp: ComponentItem) => {
    e.dataTransfer.setData('text/plain', `existing:${comp.id}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 画布上的 drop：根据鼠标 Y 坐标找到插入位置
  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const [mode, value] = data.split(':');
    const dropY = e.clientY;
    let insertIndex = components.length;
    const cardEls = e.currentTarget.querySelectorAll('[data-comp-id]');
    for (let i = 0; i < cardEls.length; i++) {
      const rect = cardEls[i].getBoundingClientRect();
      if (dropY < rect.top + rect.height / 2) {
        insertIndex = i;
        break;
      }
    }
    if (mode === 'new') {
      const compType = componentTypes.find(t => t.type === value);
      const newComponent: ComponentItem = {
        id: `comp-${Date.now()}`,
        type: value,
        name: compType?.name || value,
        config: {},
        sort: insertIndex + 1,
      };
      const newList = [...components];
      newList.splice(insertIndex, 0, newComponent);
      setComponents(newList.map((c, i) => ({ ...c, sort: i + 1 })));
      message.success(`已添加 ${newComponent.name}`);
    } else if (mode === 'existing') {
      const fromIndex = components.findIndex(c => c.id === value);
      if (fromIndex < 0) return;
      let toIndex = insertIndex;
      if (toIndex > fromIndex) toIndex -= 1;
      if (toIndex === fromIndex) return;
      const newList = [...components];
      const [moved] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, moved);
      setComponents(newList.map((c, i) => ({ ...c, sort: i + 1 })));
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEditComponent = (comp: ComponentItem) => {
    setEditingComponent(comp);
    componentForm.setFieldsValue(comp.config);
    setComponentModalOpen(true);
  };

  const handleSaveComponent = async () => {
    if (!editingComponent) return;
    const values = await componentForm.validateFields();
    setComponents(prev => {
      const idx = prev.findIndex(c => c.id === editingComponent.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], config: values };
      return next;
    });
    setComponentModalOpen(false);
    message.success('保存成功');
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    message.success('删除成功');
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    setComponents(prev => {
      const next = [...prev];
      if (direction === 'up' && index > 0) {
        [next[index], next[index - 1]] = [next[index - 1], next[index]];
      } else if (direction === 'down' && index < next.length - 1) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
      return next.map((c, i) => ({ ...c, sort: i + 1 }));
    });
  };

  const renderComponentPreview = (comp: ComponentItem) => {
    const compType = componentTypes.find(t => t.type === comp.type);
    const bgColors: Record<string, string> = {
      banner: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      category: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      hotGoods: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      newGoods: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      coupon: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      flashSale: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      bannerGrid: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      brand: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    };

    return (
      <div
        key={comp.id}
        data-comp-id={comp.id}
        draggable
        onDragStart={(e) => handleComponentDragStart(e, comp)}
        style={{
          background: bgColors[comp.type] || '#F3F4F6',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '16px',
          minHeight: '100px',
          position: 'relative',
          cursor: 'grab',
        }}
        onClick={() => handleEditComponent(comp)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
          {compType?.icon}
          <span style={{ fontWeight: '600' }}>{comp.name}</span>
        </div>
        <div style={{ position: 'absolute', right: '8px', top: '8px', display: 'flex', gap: '4px' }}>
          <Button size="small" icon={<UpOutlined />} onClick={(e) => { e.stopPropagation(); moveComponent(components.findIndex(c => c.id === comp.id), 'up'); }} />
          <Button size="small" icon={<DownOutlined />} onClick={(e) => { e.stopPropagation(); moveComponent(components.findIndex(c => c.id === comp.id), 'down'); }} />
          <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditComponent(comp); }} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteComponent(comp.id); }} />
        </div>
        {comp.type === 'banner' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '80px', height: '60px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
            ))}
          </div>
        )}
        {comp.type === 'category' && (
          <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {['服饰', '数码', '家居', '美食', '运动'].map((cat, i) => (
              <div key={cat} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.3)', margin: '0 auto 4px', borderRadius: '50%' }} />
                <span style={{ fontSize: '12px', color: 'white' }}>{cat}</span>
              </div>
            ))}
          </div>
        )}
        {comp.type === 'hotGoods' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '4px', padding: '8px' }}>
                <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', marginBottom: '4px' }} />
                <div style={{ fontSize: '12px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>商品名称 {i}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFD700' }}>¥99</div>
              </div>
            ))}
          </div>
        )}
        {comp.type === 'coupon' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'center', borderRight: '2px dashed #E5E7EB', paddingRight: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>¥{20 + i * 10}</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>满{100 + i * 50}可用</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>限时优惠券</div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>有效期至 2024-12-31</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {comp.type === 'flashSale' && (
          <div style={{ marginTop: '12px', background: '#EF4444', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <ClockCircleOutlined />
                <span style={{ fontWeight: '700' }}>限时秒杀</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['02', '18', '30'].map((t, i) => (
                  <span key={i} style={{ background: '#1F2937', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: '700' }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, background: 'white', borderRadius: '4px', padding: '8px' }}>
                  <div style={{ width: '100%', height: '60px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '4px' }} />
                  <div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>秒杀商品 {i}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#EF4444' }}>¥{10 + i * 5}</span>
                    <span style={{ fontSize: '10px', color: '#9CA3AF', textDecoration: 'line-through' }}>¥{20 + i * 10}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
      <Row gutter={[16, 16]}>
        <Col span={5}>
          <Card title="页面配置" style={{ height: 'calc(100vh - 112px)' }}>
            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', marginBottom: '16px' }}>
              {configs.map((config) => (
                <div
                  key={config.id}
                  onClick={() => selectConfig(config)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedConfig?.id === config.id ? '#EBF5FF' : '#FFFFFF',
                    border: selectedConfig?.id === config.id ? '1px solid #3B82F6' : '1px solid #E5E7EB',
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{config.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{config.pageType === 'home' ? '首页' : config.pageType}</div>
                  <div style={{ fontSize: '12px', color: config.status === 'enabled' ? '#10B981' : '#9CA3AF' }}>{config.status === 'enabled' ? '已启用' : '未启用'}</div>
                  <Space style={{ marginTop: 4 }}>
                    <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); selectConfig(config); form.setFieldsValue(config); setIsEditingConfig(true); setModalOpen(true); }}>编辑</Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteConfig(config.id); }}>删除</Button>
                  </Space>
                </div>
              ))}
            </div>
            <Button type="primary" block icon={<PlusOutlined />} onClick={handleAddConfig}>新增配置</Button>
          </Card>
        </Col>

        <Col span={13}>
          <Card title="页面预览（可拖动组件到此处，可拖动现有组件调整顺序）" style={{ height: 'calc(100vh - 112px)' }}>
            <div
              style={{ background: '#FAFAFA', borderRadius: '8px', padding: '16px', minHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
            >
              <div style={{ maxWidth: screens.sm ? '100%' : '375px', margin: '0 auto' }}>
                <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700' }}>{selectedConfig?.name || '力唯商城'}</div>
                  </div>
                  {components.length > 0 ? (
                    components.map(renderComponentPreview)
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', border: '2px dashed #E5E7EB', borderRadius: '8px' }}>
                      <LayoutOutlined style={{ fontSize: '48px', marginBottom: '12px' }} />
                      <div>暂无组件，请从右侧拖入或点击添加</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card title="组件库（可拖拽到中间画布）">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {componentTypes.map((comp) => (
                <div
                  key={comp.type}
                  draggable
                  onDragStart={(e) => handleLibraryDragStart(e, comp.type)}
                  onClick={() => handleAddComponent(comp.type)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${comp.color}`,
                    color: comp.color,
                    cursor: 'grab',
                    textAlign: 'center',
                    background: '#fff',
                    userSelect: 'none',
                  }}
                  title="按住拖动到左侧画布，也可点击直接添加"
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{comp.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{comp.name}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={isEditingConfig ? '编辑页面配置' : '新增页面配置'}
        open={modalOpen}
        onOk={handleSubmitConfig}
        onCancel={() => setModalOpen(false)}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="配置名称" rules={[{ required: true }]}>
            <Input placeholder="请输入配置名称" />
          </Form.Item>
          <Form.Item name="pageType" label="页面类型">
            <Select options={[{ label: '首页', value: 'home' }, { label: '商品列表', value: 'goodsList' }, { label: '会员中心', value: 'member' }]} />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingComponent ? `编辑组件 - ${editingComponent.name}` : '组件配置'}
        open={componentModalOpen}
        onOk={handleSaveComponent}
        onCancel={() => setComponentModalOpen(false)}
        width={520}
      >
        <Form form={componentForm} layout="vertical">
          <Form.Item name="title" label="组件标题">
            <Input placeholder="请输入组件标题" />
          </Form.Item>
          <Form.Item name="count" label="展示数量">
            <InputNumber min={1} max={20} />
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="请输入跳转链接" />
          </Form.Item>
          <Form.Item name="autoPlay" label="自动播放">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="interval" label="播放间隔(秒)">
            <InputNumber min={2} max={30} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}