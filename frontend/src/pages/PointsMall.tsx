import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select,
  Progress, Badge, Space, Statistic, Image, Upload, message, Popconfirm,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined,
  CheckCircleOutlined, GiftOutlined, ShoppingOutlined,
  InboxOutlined, UploadOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData, toggleStatusData } from '../services/request';

const { TextArea } = Input;

interface PointsGoodsData {
  id: number;
  name: string;
  points: number;
  stock: number;
  status: 'enabled' | 'disabled';
  image?: string;
  description?: string;
}

// 商品占位图渐变色块列表
const GRADIENT_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

export default function PointsMall() {
  const [goods, setGoods] = useState<PointsGoodsData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGoods, setSelectedGoods] = useState<PointsGoodsData | null>(null);
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string>('');

  const loadData = async () => {
    const params: Record<string, any> = { page, pageSize };
    const res: any = await fetchListData('points/goods', params);
    let list: PointsGoodsData[] = res.list || [];
    if (filterStatus) {
      list = list.filter((g: PointsGoodsData) => g.status === filterStatus);
    }
    setGoods(list);
    setTotal(res.total || list.length);
  };

  useEffect(() => { loadData(); }, [page, pageSize]);

  const stats = {
    total: total,
    enabled: goods.filter(g => g.status === 'enabled').length,
    totalStock: goods.reduce((s, g) => s + (g.stock || 0), 0),
  };

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedGoods(null);
    setPreviewImage('');
    form.resetFields();
    form.setFieldsValue({ status: 'enabled', stock: 50, points: 100 });
    setModalOpen(true);
  };

  const handleEdit = (item: PointsGoodsData) => {
    setIsEdit(true);
    setSelectedGoods(item);
    setPreviewImage(item.image || '');
    form.setFieldsValue({
      name: item.name,
      points: item.points,
      stock: item.stock,
      status: item.status,
      description: (item as any).description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteItemData('points/goods', id);
    message.success('删除成功');
    loadData();
  };

  const handleToggleStatus = async (id: number) => {
    await toggleStatusData('points/goods', id);
    message.success('状态切换成功');
    loadData();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    values.image = previewImage;
    if (isEdit && selectedGoods) {
      await updateItemData('points/goods', selectedGoods.id, values);
    } else {
      await createItemData('points/goods', values);
    }
    setModalOpen(false);
    message.success(isEdit ? '编辑成功' : '新增成功');
    loadData();
  };

  const handleUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div style={{ padding: '24px', background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 顶部统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: '8px' }}>
            <Statistic
              title="商品总数"
              value={stats.total}
              prefix={<GiftOutlined style={{ color: '#1890FF' }} />}
              valueStyle={{ color: '#1890FF' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: '8px' }}>
            <Statistic
              title="上架中"
              value={stats.enabled}
              prefix={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: '8px' }}>
            <Statistic
              title="总库存"
              value={stats.totalStock}
              prefix={<InboxOutlined style={{ color: '#722ED1' }} />}
              valueStyle={{ color: '#722ED1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选与操作栏 */}
      <Card
        size="small"
        style={{ marginBottom: '16px', borderRadius: '8px' }}
        bodyStyle={{ padding: '12px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="middle">
            <Select
              placeholder="商品状态"
              allowClear
              value={filterStatus}
              onChange={(v) => { setFilterStatus(v); loadData(); }}
              style={{ width: '120px' }}
              options={[
                { label: '上架中', value: 'enabled' },
                { label: '已下架', value: 'disabled' },
              ]}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增商品
          </Button>
        </div>
      </Card>

      {/* 商品卡片网格 */}
      <Row gutter={[16, 16]}>
        {goods.map((item, index) => {
          const stockPercent = item.stock > 0 ? Math.min(100, Math.round((item.stock / Math.max(item.stock, 100)) * 100)) : 0;
          const gradientBg = GRADIENT_COLORS[index % GRADIENT_COLORS.length];

          return (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{ borderRadius: '12px', overflow: 'hidden' }}
                bodyStyle={{ padding: 0 }}
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(item)}
                  >
                    编辑
                  </Button>,
                  <Button
                    type="text"
                    size="small"
                    icon={item.status === 'enabled' ? <StopOutlined /> : <CheckCircleOutlined />}
                    onClick={() => handleToggleStatus(item.id)}
                  >
                    {item.status === 'enabled' ? '下架' : '上架'}
                  </Button>,
                  <Popconfirm
                    title="确认删除此商品?"
                    onConfirm={() => handleDelete(item.id)}
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                {/* 商品图片 */}
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      preview={false}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1RjVGNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQ0NDIiBmb250LXNpemU9IjE0Ij7ml6DnvKnnlaSHpcu1PC90ZXh0Pjwvc3ZnPg=="
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '180px',
                        background: gradientBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShoppingOutlined style={{ fontSize: '48px', color: 'rgba(255,255,255,0.6)' }} />
                    </div>
                  )}

                  {/* 状态Badge覆盖在右上角 */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <Badge
                      status={item.status === 'enabled' ? 'success' : 'default'}
                      text={item.status === 'enabled' ? '上架' : '下架'}
                      style={{
                        background: item.status === 'enabled' ? 'rgba(82,196,26,0.9)' : 'rgba(0,0,0,0.45)',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </div>

                {/* 商品信息 */}
                <div style={{ padding: '16px' }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.name}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}>
                    <TrophyOutlined style={{ color: '#FAAD14', fontSize: '16px', marginRight: '6px' }} />
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#FA541C',
                      lineHeight: 1,
                    }}>
                      {item.points}
                    </span>
                    <span style={{ fontSize: '12px', color: '#8C8C8C', marginLeft: '4px' }}>积分</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#8C8C8C' }}>库存</span>
                      <span style={{ fontSize: '12px', color: '#595959' }}>{item.stock}</span>
                    </div>
                    <Progress
                      percent={item.stock > 100 ? 100 : item.stock}
                      size="small"
                      strokeColor={item.stock < 10 ? '#FF4D4F' : '#1890FF'}
                      showInfo={false}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}

        {goods.length === 0 && (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '60px', color: '#BFBFBF' }}>
                <GiftOutlined style={{ fontSize: '48px', marginBottom: '12px' }} />
                <div>暂无积分商品数据</div>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* 分页 */}
      {total > pageSize && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Space>
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
            <span>{page} / {Math.ceil(total / pageSize)}</span>
            <Button disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(page + 1)}>下一页</Button>
          </Space>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      <Modal
        title={isEdit ? `编辑商品 - ${selectedGoods?.name}` : '新增积分商品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          {/* 商品图片上传 */}
          <Form.Item label="商品图片">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Upload.Dragger
                beforeUpload={handleUpload}
                fileList={[]}
                accept="image/*"
                showUploadList={false}
                style={{ width: '200px' }}
              >
                {previewImage ? (
                  <img src={previewImage} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <div style={{ padding: '20px 0' }}>
                    <p className="ant-upload-drag-icon" style={{ marginBottom: '8px' }}>
                      <UploadOutlined style={{ fontSize: '32px', color: '#1890FF' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: '13px', color: '#8C8C8C' }}>
                      点击或拖拽上传
                    </p>
                  </div>
                )}
              </Upload.Dragger>
              {previewImage && (
                <Button
                  danger
                  size="small"
                  onClick={() => setPreviewImage('')}
                  style={{ marginTop: '4px' }}
                >
                  移除图片
                </Button>
              )}
            </div>
          </Form.Item>

          {/* 基本信息 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="points" label="所需积分" rules={[{ required: true, message: '请输入所需积分' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="如: 500"
                  addonAfter="积分"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="如: 100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                <Select options={[
                  { label: '上架', value: 'enabled' },
                  { label: '下架', value: 'disabled' },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="商品描述">
            <TextArea rows={4} placeholder="请输入商品描述" showCount maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
