import { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Tag, Table, Space,
  Badge, message, Tabs, Drawer, Timeline, Descriptions, Steps, DatePicker, Image,
} from 'antd';
import {
  ShoppingCartOutlined, ClockCircleOutlined, CarOutlined, CheckCircleOutlined,
  FileTextOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined,
  DollarOutlined, PhoneOutlined, EnvironmentOutlined, InfoCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData } from '../services/request';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

// ==================== 类型定义 ====================
interface OrderItem {
  id?: number;
  orderNo: string;
  member: string;
  goods: string;
  quantity: number;
  amount: number;
  freight: number;
  actualAmount: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  logisticsCompany: string;
  logisticsNo: string;
  payMethod: 'wechat' | 'alipay' | 'balance' | 'points';
  payTime: string;
  shipTime: string;
  doneTime: string;
  status: 'pending' | 'paid' | 'shipped' | 'done' | 'cancelled';
  afterSaleStatus: 'none' | 'applying' | 'approved' | 'rejected';
  source: 'miniapp' | 'wxapp' | 'shop';
  time: string;
  remark: string;
  tags: string;
  items: string;
}

// ==================== 常量映射 ====================
const STATUS_MAP: Record<string, { label: string; color: string; badgeStatus: 'warning' | 'processing' | 'cyan' | 'success' | 'default' }> = {
  pending: { label: '待付款', color: '#fa8c16', badgeStatus: 'warning' },
  paid: { label: '已付款', color: '#1890ff', badgeStatus: 'processing' },
  shipped: { label: '已发货', color: '#13c2c2', badgeStatus: 'cyan' },
  done: { label: '已完成', color: '#52c41a', badgeStatus: 'success' },
  cancelled: { label: '已取消', color: '#d9d9d9', badgeStatus: 'default' },
};

const PAY_METHOD_MAP: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  balance: '余额支付',
  points: '积分支付',
};

const SOURCE_MAP: Record<string, string> = {
  miniapp: '小程序',
  wxapp: '微信',
  shop: '门店',
};

const AFTER_SALE_MAP: Record<string, { label: string; color: string }> = {
  none: { label: '无', color: 'default' },
  applying: { label: '申请中', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已拒绝', color: 'error' },
};

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '已付款' },
  { key: 'shipped', label: '已发货' },
  { key: 'done', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const API_PATH = 'shop/orders';

// ==================== 组件 ====================
export default function OrderManage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // 筛选
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [filterPayMethod, setFilterPayMethod] = useState<string | undefined>(undefined);
  const [filterSource, setFilterSource] = useState<string | undefined>(undefined);
  const [filterDateRange, setFilterDateRange] = useState<any>(null);

  // 统计
  const [stats, setStats] = useState({ all: 0, pending: 0, paid: 0, shipped: 0, done: 0, cancelled: 0 });

  // 抽屉
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderItem | null>(null);

  // 编辑
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);

  // 新增
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [createForm] = Form.useForm();

  // ---------- 数据获取 ----------
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, pageSize, keyword };
      if (activeTab !== 'all') params.status = activeTab;
      if (filterPayMethod) params.payMethod = filterPayMethod;
      if (filterSource) params.source = filterSource;
      if (filterDateRange && filterDateRange.length === 2) {
        params.startTime = filterDateRange[0]?.format('YYYY-MM-DD');
        params.endTime = filterDateRange[1]?.format('YYYY-MM-DD');
      }
      const res: any = await fetchListData(API_PATH, params);
      const list: OrderItem[] = res.list || [];
      setOrders(list);
      setTotal(res.total || list.length);
      // 统计
      const allRes: any = await fetchListData(API_PATH, { pageSize: 9999 });
      const allList: OrderItem[] = allRes.list || [];
      setStats({
        all: allList.length,
        pending: allList.filter(o => o.status === 'pending').length,
        paid: allList.filter(o => o.status === 'paid').length,
        shipped: allList.filter(o => o.status === 'shipped').length,
        done: allList.filter(o => o.status === 'done').length,
        cancelled: allList.filter(o => o.status === 'cancelled').length,
      });
    } catch {
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, activeTab, filterPayMethod, filterSource, filterDateRange]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ---------- 操作 ----------
  const handleViewDetail = (record: OrderItem) => {
    setCurrentOrder(record);
    setDrawerOpen(true);
  };

  const handleEdit = (record: OrderItem) => {
    setEditingOrder(record);
    editForm.setFieldsValue(record);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    const values = await editForm.validateFields();
    if (editingOrder?.id) {
      await updateItemData(API_PATH, editingOrder.id, values);
      message.success('编辑成功');
      setEditModalOpen(false);
      loadOrders();
    }
  };

  const handleDelete = async (id: number) => {
    await deleteItemData(API_PATH, id);
    message.success('删除成功');
    loadOrders();
  };

  // ---------- 新增订单 ----------
  const openCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({ status: 'pending', payMethod: 'wechat', source: 'miniapp', quantity: 1, amount: 0, freight: 0, actualAmount: 0 });
    setCreateStep(0);
    setCreateModalOpen(true);
  };

  const handleCreateNext = async () => {
    try {
      await createForm.validateFields();
      setCreateStep(createStep + 1);
    } catch { /* validation failed */ }
  };

  const handleCreatePrev = () => setCreateStep(createStep - 1);

  const handleCreateSubmit = async () => {
    const values = await createForm.validateFields();
    await createItemData(API_PATH, values);
    message.success('新增订单成功');
    setCreateModalOpen(false);
    loadOrders();
  };

  // ---------- 解析商品明细 ----------
  const parseItems = (itemsStr: string): { name: string; image?: string; price?: number; quantity?: number }[] => {
    if (!itemsStr) return [];
    try {
      return JSON.parse(itemsStr);
    } catch {
      return itemsStr.split(',').map(s => ({ name: s.trim() }));
    }
  };

  // ---------- 渲染状态 Badge ----------
  const renderStatusBadge = (status: string) => {
    const info = STATUS_MAP[status];
    if (!info) return <Badge status="default" text={status} />;
    // antd Badge 不原生支持 cyan，用 Tag 替代
    if (info.badgeStatus === 'cyan') {
      return <Tag color="cyan">{info.label}</Tag>;
    }
    return <Badge status={info.badgeStatus} text={info.label} />;
  };

  // ---------- 渲染售后状态 Tag ----------
  const renderAfterSaleTag = (status: string) => {
    const info = AFTER_SALE_MAP[status];
    if (!info) return <Tag>{status}</Tag>;
    return <Tag color={info.color}>{info.label}</Tag>;
  };

  // ==================== 统计卡片 ====================
  const statCards = [
    { title: '全部订单', value: stats.all, icon: <ShoppingCartOutlined style={{ fontSize: 28 }} />, color: '#1890ff', bg: '#e6f7ff' },
    { title: '待付款', value: stats.pending, icon: <ClockCircleOutlined style={{ fontSize: 28 }} />, color: '#fa8c16', bg: '#fff7e6' },
    { title: '待发货', value: stats.paid, icon: <FileTextOutlined style={{ fontSize: 28 }} />, color: '#1890ff', bg: '#e6f7ff' },
    { title: '已完成', value: stats.done, icon: <CheckCircleOutlined style={{ fontSize: 28 }} />, color: '#52c41a', bg: '#f6ffed' },
  ];

  // ==================== 订单列表列定义 ====================
  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 180,
      render: (text: string, record: OrderItem) => (
        <div>
          <a onClick={() => handleViewDetail(record)} style={{ fontWeight: 600 }}>{text}</a>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{record.time}</div>
        </div>
      ),
    },
    {
      title: '商品信息',
      dataIndex: 'goods',
      width: 220,
      render: (text: string, record: OrderItem) => {
        const items = parseItems(record.items || '');
        const firstItem = items[0];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {firstItem?.image ? (
              <Image
                src={firstItem.image}
                width={40}
                height={40}
                style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                preview={{ mask: '查看' }}
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMjAiIHk9IjI0IiBmb250LXNpemU9IjEwIiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7ml6DnuqI8L3RleHQ+PC9zdmc+"
              />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: 4, background: '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontSize: 12, color: '#ccc',
              }}>
                暂无
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>
              {items.length > 1 && <div style={{ fontSize: 12, color: '#999' }}>等{items.length}件商品</div>}
            </div>
          </div>
        );
      },
    },
    {
      title: '会员',
      dataIndex: 'member',
      width: 100,
    },
    {
      title: '实付金额',
      dataIndex: 'actualAmount',
      width: 120,
      sorter: (a: OrderItem, b: OrderItem) => a.actualAmount - b.actualAmount,
      render: (val: number) => (
        <span style={{ fontSize: 18, fontWeight: 700, color: '#f5222d' }}>¥{val?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: '售后',
      dataIndex: 'afterSaleStatus',
      width: 80,
      render: (status: string) => renderAfterSaleTag(status),
    },
    {
      title: '支付方式',
      dataIndex: 'payMethod',
      width: 100,
      render: (val: string) => PAY_METHOD_MAP[val] || val,
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 80,
      render: (val: string) => SOURCE_MAP[val] || val,
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: OrderItem) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => {
            Modal.confirm({
              title: '确认删除',
              icon: <ExclamationCircleOutlined />,
              content: `确定要删除订单 ${record.orderNo} 吗？`,
              okText: '确认',
              cancelText: '取消',
              onOk: () => record.id && handleDelete(record.id),
            });
          }}>删除</Button>
        </Space>
      ),
    },
  ];

  // ==================== 抽屉内容 ====================
  const renderDrawerContent = () => {
    if (!currentOrder) return null;
    const items = parseItems(currentOrder.items || '');
    const statusInfo = STATUS_MAP[currentOrder.status];

    return (
      <div style={{ padding: '0 8px' }}>
        {/* 状态流转时间线 */}
        <Card size="small" title={<><InfoCircleOutlined /> 订单状态</>} style={{ marginBottom: 16 }}>
          <Steps
            current={
              currentOrder.status === 'cancelled' ? -1 :
              currentOrder.status === 'pending' ? 0 :
              currentOrder.status === 'paid' ? 1 :
              currentOrder.status === 'shipped' ? 2 :
              currentOrder.status === 'done' ? 3 : 0
            }
            status={currentOrder.status === 'cancelled' ? 'error' : 'process'}
            items={[
              { title: '下单', description: currentOrder.time },
              { title: '付款', description: currentOrder.payTime || '-' },
              { title: '发货', description: currentOrder.shipTime || '-' },
              { title: '完成', description: currentOrder.doneTime || '-' },
            ]}
          />
          {currentOrder.status === 'cancelled' && (
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>订单已取消</div>
          )}
        </Card>

        {/* 时间线 */}
        <Card size="small" title={<><ClockCircleOutlined /> 状态流转</>} style={{ marginBottom: 16 }}>
          <Timeline
            items={[
              ...(currentOrder.time ? [{ color: 'green' as const, children: `下单：${currentOrder.time}` }] : []),
              ...(currentOrder.payTime ? [{ color: 'blue' as const, children: `付款：${currentOrder.payTime}（${PAY_METHOD_MAP[currentOrder.payMethod] || currentOrder.payMethod}）` }] : []),
              ...(currentOrder.shipTime ? [{ color: 'cyan' as const, children: `发货：${currentOrder.shipTime}（${currentOrder.logisticsCompany || '-'} ${currentOrder.logisticsNo || '-'}）` }] : []),
              ...(currentOrder.doneTime ? [{ color: 'green' as const, children: `完成：${currentOrder.doneTime}` }] : []),
              ...(currentOrder.status === 'cancelled' ? [{ color: 'gray' as const, children: '订单已取消' }] : []),
            ]}
          />
        </Card>

        {/* 订单基本信息 */}
        <Card size="small" title={<><FileTextOutlined /> 订单信息</>} style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
            <Descriptions.Item label="订单状态">{statusInfo?.label || currentOrder.status}
              {renderAfterSaleTag(currentOrder.afterSaleStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="会员">{currentOrder.member}</Descriptions.Item>
            <Descriptions.Item label="来源">{SOURCE_MAP[currentOrder.source] || currentOrder.source}</Descriptions.Item>
            <Descriptions.Item label="商品金额">¥{currentOrder.amount?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="运费">¥{currentOrder.freight?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="实付金额">
              <span style={{ color: '#f5222d', fontWeight: 700, fontSize: 16 }}>¥{currentOrder.actualAmount?.toFixed(2)}</span>
            </Descriptions.Item>
            <Descriptions.Item label="支付方式">{PAY_METHOD_MAP[currentOrder.payMethod] || currentOrder.payMethod}</Descriptions.Item>
            <Descriptions.Item label="标签">{currentOrder.tags ? currentOrder.tags.split(',').map((t, i) => <Tag key={i} color="blue">{t}</Tag>) : '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 收货信息 */}
        <Card size="small" title={<><EnvironmentOutlined /> 收货信息</>} style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="收货人">{currentOrder.receiverName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentOrder.receiverPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="收货地址" span={2}>{currentOrder.receiverAddress || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 物流信息 */}
        <Card size="small" title={<><CarOutlined /> 物流信息</>} style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="物流公司">{currentOrder.logisticsCompany || '-'}</Descriptions.Item>
            <Descriptions.Item label="物流单号">{currentOrder.logisticsNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="发货时间">{currentOrder.shipTime || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 商品明细 */}
        <Card size="small" title={<><ShoppingCartOutlined /> 商品明细</>} style={{ marginBottom: 16 }}>
          {items.length > 0 ? (
            <Table
              size="small"
              pagination={false}
              dataSource={items.map((it, idx) => ({ ...it, _key: idx }))}
              rowKey="_key"
              columns={[
                {
                  title: '商品图片', dataIndex: 'image', width: 60,
                  render: (url: string) => url ? (
                    <Image src={url} width={40} height={40} style={{ borderRadius: 4, objectFit: 'cover' }} preview={{ mask: '查看' }}
                      fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMjAiIHk9IjI0IiBmb250LXNpemU9IjEwIiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7ml6DnuqI8L3RleHQ+PC9zdmc+"
                    />
                  ) : <div style={{ width: 40, height: 40, borderRadius: 4, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#ccc' }}>暂无</div>,
                },
                { title: '商品名称', dataIndex: 'name' },
                { title: '单价', dataIndex: 'price', render: (v: number) => v != null ? `¥${v.toFixed(2)}` : '-' },
                { title: '数量', dataIndex: 'quantity', render: (v: number) => v ?? '-' },
              ]}
            />
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: 16 }}>{currentOrder.goods || '暂无商品明细'}</div>
          )}
        </Card>

        {/* 备注 */}
        <Card size="small" title={<><FileTextOutlined /> 备注信息</>}>
          {currentOrder.remark || <span style={{ color: '#999' }}>无备注</span>}
        </Card>
      </div>
    );
  };

  // ==================== 新增订单步骤内容 ====================
  const renderCreateStepContent = () => {
    if (createStep === 0) {
      return (
        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orderNo" label="订单号" rules={[{ required: true, message: '请输入订单号' }]}>
                <Input placeholder="请输入订单号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="member" label="会员" rules={[{ required: true, message: '请输入会员' }]}>
                <Input placeholder="请输入会员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="goods" label="商品" rules={[{ required: true, message: '请输入商品' }]}>
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入数量" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
                <InputNumber min={0} prefix="¥" style={{ width: '100%' }} placeholder="商品金额" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="freight" label="运费">
                <InputNumber min={0} prefix="¥" style={{ width: '100%' }} placeholder="运费" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="actualAmount" label="实付金额" rules={[{ required: true }]}>
                <InputNumber min={0} prefix="¥" style={{ width: '100%' }} placeholder="实付金额" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="payMethod" label="支付方式" rules={[{ required: true }]}>
                <Select options={[
                  { label: '微信支付', value: 'wechat' },
                  { label: '支付宝', value: 'alipay' },
                  { label: '余额支付', value: 'balance' },
                  { label: '积分支付', value: 'points' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="source" label="来源" rules={[{ required: true }]}>
                <Select options={[
                  { label: '小程序', value: 'miniapp' },
                  { label: '微信', value: 'wxapp' },
                  { label: '门店', value: 'shop' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="订单状态" rules={[{ required: true }]}>
                <Select options={[
                  { label: '待付款', value: 'pending' },
                  { label: '已付款', value: 'paid' },
                  { label: '已发货', value: 'shipped' },
                  { label: '已完成', value: 'done' },
                  { label: '已取消', value: 'cancelled' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      );
    }
    if (createStep === 1) {
      return (
        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="receiverName" label="收货人" rules={[{ required: true, message: '请输入收货人' }]}>
                <Input prefix={<EnvironmentOutlined />} placeholder="请输入收货人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="receiverPhone" label="收货电话" rules={[{ required: true, message: '请输入收货电话' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="请输入收货电话" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="receiverAddress" label="收货地址" rules={[{ required: true, message: '请输入收货地址' }]}>
                <Input.TextArea rows={2} placeholder="请输入详细收货地址" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      );
    }
    // step 2: 商品明细
    return (
      <Form form={createForm} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="items" label="商品明细（JSON格式）" extra='示例: [{"name":"商品A","price":99.9,"quantity":2,"image":""}]'>
              <TextArea rows={4} placeholder='[{"name":"商品名称","price":0,"quantity":1,"image":""}]' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tags" label="订单标签">
              <Input placeholder="多个标签用逗号分隔" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="remark" label="订单备注">
              <TextArea rows={2} placeholder="请输入订单备注" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  // ==================== 页面渲染 ====================
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statCards.map((card) => (
          <Col span={6} key={card.title}>
            <Card
              size="small"
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden' }}
              bodyStyle={{ padding: '16px 20px' }}
              onClick={() => {
                if (card.title === '全部订单') setActiveTab('all');
                else if (card.title === '待付款') setActiveTab('pending');
                else if (card.title === '待发货') setActiveTab('paid');
                else if (card.title === '已完成') setActiveTab('done');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
                </div>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: card.color,
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 主卡片 */}
      <Card
        style={{ borderRadius: 8 }}
        bodyStyle={{ padding: 0 }}
      >
        {/* 标签页 + 操作栏 */}
        <div style={{ padding: '16px 24px 0' }}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => { setActiveTab(key); setPage(1); }}
            items={STATUS_TABS.map(tab => ({
              key: tab.key,
              label: (
                <span>
                  {tab.label}
                  {tab.key !== 'all' && stats[tab.key as keyof typeof stats] > 0 && (
                    <Tag color={STATUS_MAP[tab.key]?.color || '#999'} style={{ marginLeft: 6, fontSize: 11 }}>
                      {stats[tab.key as keyof typeof stats]}
                    </Tag>
                  )}
                </span>
              ),
            }))}
          />
        </div>

        {/* 搜索筛选栏 */}
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input.Search
            placeholder="搜索订单号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={(val) => { setKeyword(val); setPage(1); }}
            style={{ width: 220 }}
            allowClear
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="支付方式"
            value={filterPayMethod}
            onChange={(val) => { setFilterPayMethod(val); setPage(1); }}
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '微信支付', value: 'wechat' },
              { label: '支付宝', value: 'alipay' },
              { label: '余额支付', value: 'balance' },
              { label: '积分支付', value: 'points' },
            ]}
          />
          <Select
            placeholder="订单来源"
            value={filterSource}
            onChange={(val) => { setFilterSource(val); setPage(1); }}
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '小程序', value: 'miniapp' },
              { label: '微信', value: 'wxapp' },
              { label: '门店', value: 'shop' },
            ]}
          />
          <RangePicker
            value={filterDateRange}
            onChange={(dates) => { setFilterDateRange(dates); setPage(1); }}
            placeholder={['开始日期', '结束日期']}
            style={{ width: 260 }}
          />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>新增订单</Button>
        </div>

        {/* 订单列表 */}
        <div style={{ padding: '0 24px 24px' }}>
          <Table
            rowKey="id"
            dataSource={orders}
            columns={columns}
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </div>
      </Card>

      {/* 订单详情抽屉 */}
      <Drawer
        title={<><InfoCircleOutlined /> 订单详情 - {currentOrder?.orderNo}</>}
        placement="right"
        width={680}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          currentOrder && (
            <Space>
              <Button type="primary" icon={<EditOutlined />} onClick={() => {
                setDrawerOpen(false);
                handleEdit(currentOrder);
              }}>编辑</Button>
            </Space>
          )
        }
      >
        {renderDrawerContent()}
      </Drawer>

      {/* 编辑弹窗 */}
      <Modal
        title={`编辑订单 - ${editingOrder?.orderNo || ''}`}
        open={editModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Card size="small" title="订单状态" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="订单状态">
                  <Select options={[
                    { label: '待付款', value: 'pending' },
                    { label: '已付款', value: 'paid' },
                    { label: '已发货', value: 'shipped' },
                    { label: '已完成', value: 'done' },
                    { label: '已取消', value: 'cancelled' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="afterSaleStatus" label="售后状态">
                  <Select options={[
                    { label: '无', value: 'none' },
                    { label: '申请中', value: 'applying' },
                    { label: '已通过', value: 'approved' },
                    { label: '已拒绝', value: 'rejected' },
                  ]} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="物流信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="logisticsCompany" label="物流公司">
                  <Input placeholder="如：顺丰速运" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="logisticsNo" label="物流单号">
                  <Input placeholder="请输入物流单号" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="其他信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="payMethod" label="支付方式">
                  <Select options={[
                    { label: '微信支付', value: 'wechat' },
                    { label: '支付宝', value: 'alipay' },
                    { label: '余额支付', value: 'balance' },
                    { label: '积分支付', value: 'points' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="actualAmount" label="实付金额">
                  <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="remark" label="订单备注">
                  <TextArea rows={3} placeholder="请输入订单备注" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="tags" label="订单标签">
                  <Input placeholder="多个标签用逗号分隔" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* 新增订单弹窗 */}
      <Modal
        title="新增订单"
        open={createModalOpen}
        width={720}
        destroyOnClose
        footer={null}
        onCancel={() => setCreateModalOpen(false)}
      >
        <Steps
          current={createStep}
          style={{ marginBottom: 24 }}
          items={[
            { title: '基本信息' },
            { title: '收货信息' },
            { title: '商品信息' },
          ]}
        />
        {renderCreateStepContent()}
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            {createStep > 0 && <Button onClick={handleCreatePrev}>上一步</Button>}
            {createStep < 2 ? (
              <Button type="primary" onClick={handleCreateNext}>下一步</Button>
            ) : (
              <Button type="primary" onClick={handleCreateSubmit}>提交订单</Button>
            )}
          </Space>
        </div>
      </Modal>
    </div>
  );
}
