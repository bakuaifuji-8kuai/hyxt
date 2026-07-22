import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Tag, Upload, Table, Space, Badge, message, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined, ShoppingCartOutlined, StarOutlined, TagOutlined, BarcodeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData } from '../services/request';

const { TextArea } = Input;

interface GoodsData {
  id: number;
  name: string;
  spuCode: string;
  subtitle: string;
  mainImage: string;
  detailImages: string;
  category: string;
  price: number;
  originalPrice: number;
  costPrice: number;
  stock: number;
  sales: number;
  views: number;
  favorites: number;
  specs: string;
  skuInfo: string;
  tags: string;
  group: string;
  isVirtual: string;
  limitBuy: number;
  minBuy: number;
  weight: number;
  volume: number;
  sellingPoint: string;
  sort: number;
  status: string;
}

interface SKUItem {
  id?: number;
  specs: string;
  price: number;
  originalPrice: number;
  stock: number;
  skuCode: string;
}

export default function ShopGoods() {
  const [goods, setGoods] = useState<GoodsData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGoods, setSelectedGoods] = useState<GoodsData | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [form] = Form.useForm();
  const [skuData, setSkuData] = useState<SKUItem[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchListData('shop/goods').then((res: any) => setGoods(res.list || []));
    fetchListData('shop/categories').then((res: any) => {
      const cats = (res.list || []).map((c: any) => c.name);
      setCategories(cats);
    });
  }, []);

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedGoods(null);
    setActiveTab('basic');
    setSkuData([{ specs: '', price: 0, originalPrice: 0, stock: 0, skuCode: '' }]);
    setPreviewImages([]);
    form.resetFields();
    form.setFieldsValue({ status: 'enabled', isVirtual: 'no', limitBuy: 999, minBuy: 1, sort: 1 });
    setModalOpen(true);
  };

  const handleEdit = (item: GoodsData) => {
    setIsEdit(true);
    setSelectedGoods(item);
    setActiveTab('basic');
    setPreviewImages(item.mainImage ? [item.mainImage] : []);
    form.setFieldsValue(item);
    const skuStr = item.skuInfo || '';
    if (skuStr) {
      try {
        setSkuData(JSON.parse(skuStr));
      } catch {
        setSkuData([{ specs: '', price: 0, originalPrice: 0, stock: 0, skuCode: '' }]);
      }
    } else {
      setSkuData([{ specs: '', price: 0, originalPrice: 0, stock: 0, skuCode: '' }]);
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteItemData('shop/goods', id);
    setGoods(goods.filter(g => g.id !== id));
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    values.skuInfo = JSON.stringify(skuData);
    values.mainImage = previewImages[0] || '';
    values.detailImages = previewImages.slice(1).join(',');
    if (isEdit && selectedGoods) {
      await updateItemData('shop/goods', selectedGoods.id, values);
      setGoods(goods.map(g => g.id === selectedGoods.id ? { ...g, ...values } : g));
    } else {
      await createItemData('shop/goods', values);
      fetchListData('shop/goods').then((res: any) => setGoods(res.list || []));
    }
    setModalOpen(false);
    message.success(isEdit ? '编辑成功' : '新增成功');
  };

  const handleUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewImages([...previewImages, url]);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const removeImage = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const addSKU = () => {
    setSkuData([...skuData, { specs: '', price: 0, originalPrice: 0, stock: 0, skuCode: '' }]);
  };

  const removeSKU = (index: number) => {
    setSkuData(skuData.filter((_, i) => i !== index));
  };

  const updateSKU = (index: number, field: string, value: any) => {
    const newData = [...skuData];
    newData[index] = { ...newData[index], [field]: value };
    setSkuData(newData);
  };

  const skuColumns = [
    { title: '规格', dataIndex: 'specs', render: (text: string) => <Input value={text} onChange={(e) => updateSKU(skuData.findIndex(s => s.specs === text), 'specs', e.target.value)} placeholder="如: 红色/S" /> },
    { title: 'SKU编码', dataIndex: 'skuCode', render: (text: string, record: SKUItem, index: number) => <Input value={text} onChange={(e) => updateSKU(index, 'skuCode', e.target.value)} /> },
    { title: '价格', dataIndex: 'price', render: (text: number, record: SKUItem, index: number) => <InputNumber value={text} onChange={(v) => updateSKU(index, 'price', v)} style={{ width: '100%' }} /> },
    { title: '原价', dataIndex: 'originalPrice', render: (text: number, record: SKUItem, index: number) => <InputNumber value={text} onChange={(v) => updateSKU(index, 'originalPrice', v)} style={{ width: '100%' }} /> },
    { title: '库存', dataIndex: 'stock', render: (text: number, record: SKUItem, index: number) => <InputNumber value={text} onChange={(v) => updateSKU(index, 'stock', v)} style={{ width: '100%' }} /> },
    { title: '操作', render: (_: any, __: any, index: number) => <Button danger size="small" onClick={() => removeSKU(index)}>删除</Button> },
  ];

  const goodsColumns = [
    { title: '商品图片', dataIndex: 'mainImage', width: 80, render: (url: string, record: GoodsData) => url ? <img src={url} alt={record.name || '商品图片'} width={60} height={60} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} /> : <div style={{ width: '60px', height: '60px', background: '#F3F4F6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>无图</div> },
    { title: '商品名称', dataIndex: 'name', render: (text: string, record: GoodsData) => <div><div style={{ fontWeight: '600' }}>{text}</div><div style={{ fontSize: '12px', color: '#6B7280' }}>{record.subtitle || '暂无副标题'}</div></div> },
    { title: '商品编码', dataIndex: 'spuCode', render: (text: string) => <Tag>{text}</Tag> },
    { title: '分类', dataIndex: 'category' },
    { title: '价格', dataIndex: 'price', render: (text: number, record: GoodsData) => <div><span style={{ fontSize: '16px', fontWeight: '700', color: '#EF4444' }}>¥{text}</span><span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '8px', textDecoration: 'line-through' }}>¥{record.originalPrice}</span></div> },
    { title: '库存', dataIndex: 'stock', render: (text: number) => <Badge status={text > 0 ? 'success' : 'error'} text={text} /> },
    { title: '销量', dataIndex: 'sales', render: (text: number) => <span style={{ color: '#3B82F6' }}>{text}</span> },
    { title: '浏览量', dataIndex: 'views' },
    { title: '标签', dataIndex: 'tags', render: (text: string) => text ? text.split(',').map((t, i) => <Tag key={i} color="blue">{t}</Tag>) : '-' },
    { title: '状态', dataIndex: 'status', render: (text: string) => <Badge status={text === 'enabled' ? 'success' : 'default'} text={text === 'enabled' ? '上架' : '下架'} /> },
    { title: '操作', render: (_: any, record: GoodsData) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div style={{ padding: '24px', background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingCartOutlined />
            <span>商品管理</span>
          </div>
        }
        extra={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input.Search
              placeholder="搜索商品名称/编码"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: '240px' }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增商品</Button>
          </div>
        }
      >
        <Table
          rowKey="id"
          dataSource={goods.filter(g => !searchKeyword || g.name.toLowerCase().includes(searchKeyword.toLowerCase()) || g.spuCode.toLowerCase().includes(searchKeyword.toLowerCase()))}
          columns={goodsColumns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={isEdit ? `编辑商品 - ${selectedGoods?.name}` : '新增商品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={900}
        destroyOnClose
        footer={[
          <Button key="back" onClick={() => setModalOpen(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>保存商品</Button>,
        ]}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="基本信息" key="basic">
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
                    <Input placeholder="请输入商品名称" />
                  </Form.Item>
                  <Form.Item name="spuCode" label="商品编码" rules={[{ required: true }]}>
                    <Input placeholder="请输入商品编码" />
                  </Form.Item>
                  <Form.Item name="subtitle" label="副标题">
                    <Input placeholder="请输入商品副标题" />
                  </Form.Item>
                  <Form.Item name="category" label="商品分类">
                    <Select options={categories.map(c => ({ label: c, value: c }))} placeholder="请选择分类" />
                  </Form.Item>
                  <Form.Item name="tags" label="商品标签">
                    <Input placeholder="多个标签用逗号分隔" />
                  </Form.Item>
                  <Form.Item name="group" label="商品分组">
                    <Select options={[{ label: '热销商品', value: '热销' }, { label: '新品推荐', value: '新品' }, { label: '限时特惠', value: '特惠' }]} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="商品图片">
                    <div style={{ marginBottom: '12px' }}>
                      <Upload.Dragger beforeUpload={handleUpload} fileList={[]} accept="image/*">
                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                        <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
                      </Upload.Dragger>
                    </div>
                    {previewImages.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {previewImages.map((url, index) => (
                          <div key={index} style={{ position: 'relative' }}>
                            <img src={url} alt="商品图片" width={100} height={100} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                            <Button size="small" danger aria-label="关闭预览" style={{ position: 'absolute', top: '-8px', right: '-8px' }} onClick={() => removeImage(index)}>×</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="价格库存" key="price">
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item name="price" label="售价" rules={[{ required: true }]}>
                    <InputNumber prefix="¥" style={{ width: '100%' }} placeholder="请输入售价" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="originalPrice" label="原价">
                    <InputNumber prefix="¥" style={{ width: '100%' }} placeholder="请输入原价" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="costPrice" label="成本价">
                    <InputNumber prefix="¥" style={{ width: '100%' }} placeholder="请输入成本价" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="stock" label="库存" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="请输入库存" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="minBuy" label="起售数量">
                    <InputNumber style={{ width: '100%' }} placeholder="最小购买数量" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="limitBuy" label="限购数量">
                    <InputNumber style={{ width: '100%' }} placeholder="最大购买数量" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="weight" label="重量(g)">
                    <InputNumber style={{ width: '100%' }} placeholder="商品重量" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="isVirtual" label="虚拟商品">
                    <Select options={[{ label: '是', value: 'yes' }, { label: '否', value: 'no' }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="status" label="状态">
                    <Select options={[{ label: '上架', value: 'enabled' }, { label: '下架', value: 'disabled' }]} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="SKU规格" key="sku">
            <div style={{ marginBottom: '16px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={addSKU}>添加SKU</Button>
            </div>
            <Table
              rowKey="id"
              dataSource={skuData}
              columns={skuColumns}
              pagination={false}
              bordered
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="商品详情" key="detail">
            <Form form={form} layout="vertical">
              <Form.Item name="specs" label="商品规格">
                <TextArea rows={3} placeholder="如: 颜色:红色,蓝色;尺寸:S,M,L" />
              </Form.Item>
              <Form.Item name="sellingPoint" label="卖点">
                <TextArea rows={3} placeholder="请输入商品卖点" />
              </Form.Item>
              <Form.Item name="sort" label="排序">
                <InputNumber placeholder="排序数字，越小越靠前" />
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
}