import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Row, Col, Tabs, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, Drawer, Descriptions, Progress, message } from 'antd';
import {
  CarOutlined, DashboardOutlined, DollarOutlined,
  GiftOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  ClockCircleOutlined, UserOutlined, EnvironmentOutlined,
  SafetyCertificateOutlined, CrownOutlined
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData } from '../services/request';

// ---- Types ----
interface ParkingRecord {
  id: number;
  plate: string;
  member: string;
  inTime: string;
  outTime: string;
  duration: number;
  fee: number;
  points: number;
}

interface ParkingLot {
  id: number;
  name: string;
  project: string;
  totalSpaces: number;
  availableSpaces: number;
  status: string;
}

interface ParkingRule {
  id: number;
  name: string;
  freeMinutes: number;
  pricePerHour: number;
  capAmount: number;
  status: string;
}

interface ParkingBenefit {
  id: number;
  name: string;
  level: string;
  freeHours: number;
  pointsRate: number;
  status: string;
}

interface ParkingPlate {
  id: number;
  member: string;
  plateNo: string;
  plateColor: string;
  vehicleType: string;
  bindTime: string;
  status: string;
}

// ---- Stat card config ----
const statCards = [
  { key: 'todayCount', label: '今日停车数', icon: CarOutlined, color: '#3B82F6', bg: '#EFF6FF', suffix: '辆' },
  { key: 'currentIn', label: '当前在场车辆', icon: DashboardOutlined, color: '#F59E0B', bg: '#FFFBEB', suffix: '辆' },
  { key: 'todayRevenue', label: '今日停车收入', icon: DollarOutlined, color: '#10B981', bg: '#ECFDF5', prefix: '¥', suffix: '' },
  { key: 'benefitCount', label: '免费停车权益数', icon: GiftOutlined, color: '#8B5CF6', bg: '#F5F3FF', suffix: '个' },
];

// ---- Level helpers ----
const levelConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  SILVER: { label: '银卡会员', color: '#6B7280', bg: '#F3F4F6', icon: '🥈' },
  GOLD: { label: '金卡会员', color: '#D97706', bg: '#FEF3C7', icon: '🥇' },
  DIAMOND: { label: '钻石会员', color: '#0891B2', bg: '#CFFAFE', icon: '💎' },
};

// ---- Main Component ----
export default function ParkingManage() {
  const location = useLocation();
  const pathMap: Record<string, string> = {
    'parking-records': 'records',
    'parking-lots': 'lots',
    'parking-rules': 'rules',
    'parking-benefit': 'benefit',
    'parking-plates': 'plates',
  };
  const moduleKey = location.pathname.split('/m/')[1] || 'parking-records';
  const [activeTab, setActiveTab] = useState(pathMap[moduleKey] || 'records');

  useEffect(() => {
    const key = location.pathname.split('/m/')[1] || 'parking-records';
    setActiveTab(pathMap[key] || 'records');
  }, [location.pathname]);
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [recordPage, setRecordPage] = useState(1);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [rules, setRules] = useState<ParkingRule[]>([]);
  const [benefits, setBenefits] = useState<ParkingBenefit[]>([]);
  const [plates, setPlates] = useState<ParkingPlate[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);

  // ---- Load data ----
  const loadRecords = useCallback(() => {
    fetchListData('parking/records', { page: recordPage, pageSize: 10 }).then((res: any) => {
      setRecords(res?.list || []);
      setRecordTotal(res?.total || 0);
    });
  }, [recordPage]);

  const loadLots = useCallback(() => {
    fetchListData('parking/lots').then((res: any) => setLots(res?.list || res || []));
  }, []);

  const loadRules = useCallback(() => {
    fetchListData('parking/rules').then((res: any) => setRules(res?.list || res || []));
  }, []);

  const loadBenefits = useCallback(() => {
    fetchListData('parking/benefit').then((res: any) => setBenefits(res?.list || res || []));
  }, []);

  const loadPlates = useCallback(() => {
    fetchListData('parking/plates').then((res: any) => setPlates(res?.list || res || []));
  }, []);

  useEffect(() => {
    loadRecords();
    loadLots();
    loadRules();
    loadBenefits();
    loadPlates();
  }, [loadRecords, loadLots, loadRules, loadBenefits, loadPlates]);

  // ---- Computed stats ----
  const stats = {
    todayCount: records.length,
    currentIn: records.filter(r => !r.outTime).length,
    todayRevenue: records.reduce((s, r) => s + (r.fee || 0), 0),
    benefitCount: benefits.filter(b => b.status === 'enabled').length,
  };

  // ---- CRUD handlers ----
  const handleAdd = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'enabled' });
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (path: string, id: number) => {
    await deleteItemData(path, id);
    message.success('删除成功');
    if (path === 'parking/records') loadRecords();
    else if (path === 'parking/lots') loadLots();
    else if (path === 'parking/rules') loadRules();
    else if (path === 'parking/benefit') loadBenefits();
    else if (path === 'parking/plates') loadPlates();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const pathMap: Record<string, string> = {
      records: 'parking/records',
      lots: 'parking/lots',
      rules: 'parking/rules',
      benefit: 'parking/benefit',
      plates: 'parking/plates',
    };
    const path = pathMap[activeTab] || 'parking/records';
    if (editId != null) {
      await updateItemData(path, editId, values);
      message.success('编辑成功');
    } else {
      await createItemData(path, values);
      message.success('新增成功');
    }
    setModalOpen(false);
    if (activeTab === 'records') loadRecords();
    else if (activeTab === 'lots') loadLots();
    else if (activeTab === 'rules') loadRules();
    else if (activeTab === 'benefit') loadBenefits();
    else if (activeTab === 'plates') loadPlates();
  };

  // ---- Record detail ----
  const showDetail = (record: ParkingRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}小时${m > 0 ? m + '分钟' : ''}` : `${m}分钟`;
  };

  // ---- Record columns ----
  const recordColumns = [
    {
      title: '车牌号', dataIndex: 'plate', width: 120,
      render: (v: string) => <span style={{ fontWeight: 700, color: '#3B82F6', letterSpacing: 1 }}>{v}</span>,
    },
    {
      title: '会员', dataIndex: 'member', width: 100,
      render: (v: string) => v ? <span style={{ color: '#6B7280' }}><UserOutlined style={{ marginRight: 4 }} />{v}</span> : '-',
    },
    { title: '入场时间', dataIndex: 'inTime', width: 150 },
    { title: '出场时间', dataIndex: 'outTime', width: 150, render: (v: string) => v || <Tag color="blue">在场</Tag> },
    { title: '时长', dataIndex: 'duration', width: 100, render: (v: number) => v ? formatDuration(v) : '-' },
    { title: '费用', dataIndex: 'fee', width: 90, render: (v: number) => <span style={{ fontWeight: 700, color: '#EF4444' }}>¥{v}</span> },
    { title: '积分', dataIndex: 'points', width: 80, render: (v: number) => v ? <Tag color="orange">+{v}</Tag> : '-' },
    {
      title: '操作', key: 'action', width: 200, fixed: 'right' as const,
      render: (_: any, record: ParkingRecord) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete('parking/records', record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ---- Form fields by tab ----
  const renderFormFields = () => {
    switch (activeTab) {
      case 'records':
        return (
          <>
            <Form.Item name="plate" label="车牌号" rules={[{ required: true, message: '请输入车牌号' }]}>
              <Input placeholder="如：京A12345" />
            </Form.Item>
            <Form.Item name="member" label="关联会员">
              <Input placeholder="会员姓名" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="inTime" label="入场时间">
                  <Input placeholder="2024-06-01 10:00" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="outTime" label="出场时间">
                  <Input placeholder="2024-06-01 12:00" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="duration" label="时长(分钟)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="fee" label="费用(元)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="points" label="送积分">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          </>
        );
      case 'lots':
        return (
          <>
            <Form.Item name="name" label="停车场名称" rules={[{ required: true }]}>
              <Input placeholder="请输入停车场名称" />
            </Form.Item>
            <Form.Item name="project" label="所属项目">
              <Input placeholder="如：凯德壹中心" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="totalSpaces" label="总车位" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="availableSpaces" label="空闲车位" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="status" label="状态">
              <Select options={[{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }]} />
            </Form.Item>
          </>
        );
      case 'rules':
        return (
          <>
            <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
              <Input placeholder="如：标准计费" />
            </Form.Item>
            <Form.Item name="freeMinutes" label="免费时长(分钟)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="pricePerHour" label="单价(元/小时)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="capAmount" label="封顶金额(元)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select options={[{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }]} />
            </Form.Item>
          </>
        );
      case 'benefit':
        return (
          <>
            <Form.Item name="name" label="权益名称" rules={[{ required: true }]}>
              <Input placeholder="如：金卡停车权益" />
            </Form.Item>
            <Form.Item name="level" label="会员等级" rules={[{ required: true }]}>
              <Select options={[
                { label: '银卡会员', value: 'SILVER' },
                { label: '金卡会员', value: 'GOLD' },
                { label: '钻石会员', value: 'DIAMOND' },
              ]} placeholder="请选择等级" />
            </Form.Item>
            <Form.Item name="freeHours" label="免费时长(小时)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="pointsRate" label="积分倍率">
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select options={[{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }]} />
            </Form.Item>
          </>
        );
      case 'plates':
        return (
          <>
            <Form.Item name="member" label="会员" rules={[{ required: true }]}>
              <Input placeholder="会员姓名" />
            </Form.Item>
            <Form.Item name="plateNo" label="车牌号" rules={[{ required: true }]}>
              <Input placeholder="如：京A12345" />
            </Form.Item>
            <Form.Item name="plateColor" label="车牌颜色">
              <Select options={[
                { label: '蓝牌', value: 'blue' },
                { label: '黄牌', value: 'yellow' },
                { label: '绿牌', value: 'green' },
                { label: '白牌', value: 'white' },
              ]} />
            </Form.Item>
            <Form.Item name="vehicleType" label="车辆类型">
              <Select options={[
                { label: '轿车', value: 'sedan' },
                { label: 'SUV', value: 'suv' },
                { label: '面包车', value: 'van' },
                { label: '新能源', value: 'newEnergy' },
              ]} />
            </Form.Item>
            <Form.Item name="bindTime" label="绑定时间">
              <Input placeholder="2024-06-01" />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select options={[{ label: '正常', value: 'enabled' }, { label: '解绑', value: 'disabled' }]} />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  const modalTitleMap: Record<string, string> = {
    records: '停车记录',
    lots: '停车场',
    rules: '计费规则',
    benefit: '停车权益',
    plates: '车牌绑定',
  };

  return (
    <div style={{ padding: 24, background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map(cfg => {
          const Icon = cfg.icon;
          const val = stats[cfg.key as keyof typeof stats] ?? 0;
          return (
            <Col key={cfg.key} span={6}>
              <Card style={{ borderRadius: 12, border: 'none' }} styles={{ body: { padding: '20px 24px' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{cfg.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1F2937', lineHeight: 1.2 }}>
                      {cfg.prefix || ''}{typeof val === 'number' ? val.toLocaleString() : val}{cfg.suffix}
                    </div>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ fontSize: 24, color: cfg.color }} />
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Tab content */}
      <Card style={{ borderRadius: 12, border: 'none' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增{modalTitleMap[activeTab] || ''}
            </Button>
          }
          items={[
            {
              key: 'records',
              label: '停车记录',
              children: (
                <Table
                  rowKey="id"
                  dataSource={records}
                  columns={recordColumns}
                  scroll={{ x: 'max-content' }}
                  pagination={{
                    current: recordPage,
                    pageSize: 10,
                    total: recordTotal,
                    showTotal: t => `共 ${t} 条`,
                    onChange: p => setRecordPage(p),
                  }}
                />
              ),
            },
            {
              key: 'lots',
              label: '停车场管理',
              children: (
                <Row gutter={[16, 16]}>
                  {lots.map(lot => {
                    const percent = lot.totalSpaces > 0 ? Math.round(((lot.totalSpaces - lot.availableSpaces) / lot.totalSpaces) * 100) : 0;
                    const statusColor = percent > 90 ? '#EF4444' : percent > 70 ? '#F59E0B' : '#10B981';
                    return (
                      <Col key={lot.id} span={8}>
                        <Card
                          style={{ borderRadius: 12, border: '1px solid #E5E7EB' }}
                          styles={{ body: { padding: 20 } }}
                          actions={[
                            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(lot)}>编辑</Button>,
                            <Popconfirm title="确认删除?" onConfirm={() => handleDelete('parking/lots', lot.id)}>
                              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                            </Popconfirm>,
                          ]}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <EnvironmentOutlined style={{ fontSize: 22, color: '#3B82F6' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 15, color: '#1F2937' }}>{lot.name}</div>
                              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{lot.project}</div>
                            </div>
                            <Tag color={lot.status === 'enabled' ? 'green' : 'red'} style={{ marginLeft: 'auto' }}>
                              {lot.status === 'enabled' ? '运营中' : '已停用'}
                            </Tag>
                          </div>
                          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: '#6B7280' }}>车位占用</span>
                            <span style={{ fontSize: 13, color: statusColor, fontWeight: 600 }}>{percent}%</span>
                          </div>
                          <Progress
                            percent={percent}
                            strokeColor={statusColor}
                            showInfo={false}
                            size="small"
                          />
                          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280' }}>
                            <span>空闲 <b style={{ color: '#10B981' }}>{lot.availableSpaces}</b></span>
                            <span>总计 <b>{lot.totalSpaces}</b></span>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ),
            },
            {
              key: 'rules',
              label: '计费规则',
              children: (
                <Row gutter={[16, 16]}>
                  {rules.map(rule => (
                    <Col key={rule.id} span={8}>
                      <Card
                        style={{ borderRadius: 12, border: '1px solid #E5E7EB' }}
                        styles={{ body: { padding: 20 } }}
                        actions={[
                          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(rule)}>编辑</Button>,
                          <Popconfirm title="确认删除?" onConfirm={() => handleDelete('parking/rules', rule.id)}>
                            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                          </Popconfirm>,
                        ]}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SafetyCertificateOutlined style={{ fontSize: 22, color: '#F59E0B' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: '#1F2937' }}>{rule.name}</div>
                            <Tag color={rule.status === 'enabled' ? 'green' : 'red'}>{rule.status === 'enabled' ? '启用' : '禁用'}</Tag>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6B7280' }}>免费时长</span>
                            <span style={{ fontWeight: 500 }}>{rule.freeMinutes} 分钟</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6B7280' }}>单价</span>
                            <span style={{ fontWeight: 500 }}>¥{rule.pricePerHour}/小时</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6B7280' }}>封顶金额</span>
                            <span style={{ fontWeight: 500, color: '#EF4444' }}>¥{rule.capAmount}</span>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ),
            },
            {
              key: 'benefit',
              label: '停车权益',
              children: (
                <Row gutter={[16, 16]}>
                  {benefits.map(benefit => {
                    const lc = levelConfig[benefit.level] || { label: benefit.level, color: '#6B7280', bg: '#F3F4F6', icon: '🎫' };
                    return (
                      <Col key={benefit.id} span={8}>
                        <Card
                          style={{ borderRadius: 12, border: `2px solid ${lc.color}20`, background: lc.bg }}
                          styles={{ body: { padding: 20 } }}
                          actions={[
                            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(benefit)}>编辑</Button>,
                            <Popconfirm title="确认删除?" onConfirm={() => handleDelete('parking/benefit', benefit.id)}>
                              <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                            </Popconfirm>,
                          ]}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                              {lc.icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 15, color: '#1F2937' }}>{benefit.name}</div>
                              <Tag color={lc.color}>{lc.label}</Tag>
                            </div>
                            <Tag color={benefit.status === 'enabled' ? 'green' : 'red'} style={{ marginLeft: 'auto' }}>
                              {benefit.status === 'enabled' ? '启用' : '禁用'}
                            </Tag>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#6B7280' }}><ClockCircleOutlined style={{ marginRight: 4 }} />免费时长</span>
                              <span style={{ fontWeight: 600, color: '#10B981' }}>{benefit.freeHours} 小时</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#6B7280' }}><CrownOutlined style={{ marginRight: 4 }} />积分倍率</span>
                              <span style={{ fontWeight: 600, color: '#3B82F6' }}>x{benefit.pointsRate}</span>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ),
            },
            {
              key: 'plates',
              label: '车牌绑定管理',
              children: (
                <Table
                  rowKey="id"
                  dataSource={plates}
                  columns={[
                    { title: '会员', dataIndex: 'member', width: 120 },
                    { title: '车牌号', dataIndex: 'plateNo', width: 120, render: (v: string) => <span style={{ fontWeight: 600, color: '#3B82F6' }}>{v}</span> },
                    { title: '车牌颜色', dataIndex: 'plateColor', width: 100, render: (v: string) => ({ blue: '蓝牌', yellow: '黄牌', green: '绿牌', white: '白牌' }[v] || v) },
                    { title: '车辆类型', dataIndex: 'vehicleType', width: 100, render: (v: string) => ({ sedan: '轿车', suv: 'SUV', van: '面包车', newEnergy: '新能源' }[v] || v) },
                    { title: '绑定时间', dataIndex: 'bindTime', width: 140 },
                    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'enabled' ? 'green' : 'red'}>{v === 'enabled' ? '正常' : '解绑'}</Tag> },
                    {
                      title: '操作', key: 'action', width: 160,
                      render: (_: any, record: ParkingPlate) => (
                        <Space>
                          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                          <Popconfirm title="确认删除?" onConfirm={() => handleDelete('parking/plates', record.id)}>
                            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Record detail drawer */}
      <Drawer
        title="停车记录详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {selectedRecord && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, background: '#EFF6FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <CarOutlined style={{ fontSize: 36, color: '#3B82F6' }} />
              </div>
              <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700, color: '#3B82F6', letterSpacing: 2 }}>{selectedRecord.plate}</div>
            </div>
            <Descriptions column={1} bordered size="small" labelStyle={{ width: 130, background: '#FAFAFA' }}>
              <Descriptions.Item label="车牌号">
                <span style={{ fontWeight: 600, color: '#3B82F6' }}>{selectedRecord.plate}</span>
              </Descriptions.Item>
              <Descriptions.Item label="关联会员">
                {selectedRecord.member ? (
                  <span><UserOutlined style={{ marginRight: 4 }} />{selectedRecord.member}</span>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="入场时间">{selectedRecord.inTime}</Descriptions.Item>
              <Descriptions.Item label="出场时间">
                {selectedRecord.outTime || <Tag color="blue">仍在场</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="停车时长">
                {selectedRecord.duration ? (
                  <span style={{ fontWeight: 600 }}>{formatDuration(selectedRecord.duration)}</span>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="停车费用">
                <span style={{ fontWeight: 700, fontSize: 18, color: '#EF4444' }}>¥{selectedRecord.fee}</span>
              </Descriptions.Item>
              <Descriptions.Item label="赠送积分">
                {selectedRecord.points ? (
                  <Tag color="orange" style={{ fontSize: 13 }}>+{selectedRecord.points} 积分</Tag>
                ) : '无'}
              </Descriptions.Item>
            </Descriptions>

            {/* Fee breakdown */}
            <Card title="费用明细" size="small" style={{ marginTop: 20 }} styles={{ body: { padding: 16 } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>停车时长</span>
                  <span>{selectedRecord.duration ? formatDuration(selectedRecord.duration) : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>免费时长</span>
                  <span>15分钟</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>计费时长</span>
                  <span>{selectedRecord.duration ? formatDuration(Math.max(0, selectedRecord.duration - 15)) : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>单价</span>
                  <span>¥5/小时</span>
                </div>
                <div style={{ borderTop: '1px dashed #E5E7EB', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>应付金额</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#EF4444' }}>¥{selectedRecord.fee}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Add/Edit modal */}
      <Modal
        title={editId != null ? `编辑${modalTitleMap[activeTab] || ''}` : `新增${modalTitleMap[activeTab] || ''}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {renderFormFields()}
        </Form>
      </Modal>
    </div>
  );
}
