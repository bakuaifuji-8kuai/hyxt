import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Tabs, Table, Tag, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, message } from 'antd';
import {
  UserOutlined, WalletOutlined, ShoppingCartOutlined,
  ThunderboltOutlined, GiftOutlined, FlagOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined,
  RiseOutlined, FallOutlined, CalendarOutlined
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData, fetchDashboardSummary } from '../services/request';

const { RangePicker } = DatePicker;

// ---- Types ----
interface OverviewItem {
  id: number;
  name: string;
  value: number;
  mom: string;
  period: string;
}

interface ReportItem {
  id: number;
  name: string;
  type: string;
  period: string;
  status: string;
}

// ---- Mock trend data ----
const memberTrend7 = [
  { date: '07-01', value: 11200 }, { date: '07-02', value: 11450 },
  { date: '07-03', value: 11680 }, { date: '07-04', value: 11900 },
  { date: '07-05', value: 12150 }, { date: '07-06', value: 12380 },
  { date: '07-07', value: 12580 },
];
const memberTrend30 = [
  { date: '06-08', value: 9200 }, { date: '06-11', value: 9600 },
  { date: '06-14', value: 10000 }, { date: '06-17', value: 10400 },
  { date: '06-20', value: 10800 }, { date: '06-23', value: 11200 },
  { date: '06-26', value: 11800 }, { date: '06-29', value: 12200 },
  { date: '07-02', value: 12580 },
];
const revenueTrend = [
  { date: '07-01', value: 28000 }, { date: '07-02', value: 32000 },
  { date: '07-03', value: 26000 }, { date: '07-04', value: 41000 },
  { date: '07-05', value: 35000 }, { date: '07-06', value: 38000 },
  { date: '07-07', value: 42000 },
];

const levelDistribution = [
  { name: '普通会员', value: 5800, color: '#A5B4FC' },
  { name: '银卡会员', value: 3200, color: '#9CA3AF' },
  { name: '金卡会员', value: 2600, color: '#FCD34D' },
  { name: '钻石会员', value: 980, color: '#67E8F9' },
];

const orderSource = [
  { name: '小程序', value: 45, color: '#3B82F6' },
  { name: '公众号', value: 25, color: '#10B981' },
  { name: '门店', value: 20, color: '#F59E0B' },
  { name: '活动', value: 10, color: '#EF4444' },
];

const categorySales = [
  { name: '服装', value: 860 },
  { name: '餐饮', value: 720 },
  { name: '数码', value: 540 },
  { name: '服务', value: 380 },
  { name: '虚拟商品', value: 260 },
];

// ---- KPI card config ----
const kpiConfig = [
  { key: 'memberCount', label: '会员总数', icon: UserOutlined, color: '#3B82F6', bg: '#EFF6FF', prefix: '', suffix: '' },
  { key: 'todayRevenue', label: '今日营收', icon: WalletOutlined, color: '#10B981', bg: '#ECFDF5', prefix: '¥', suffix: '' },
  { key: 'orderCount', label: '订单数量', icon: ShoppingCartOutlined, color: '#F59E0B', bg: '#FFFBEB', prefix: '', suffix: '单' },
  { key: 'pointsIssued', label: '积分发放', icon: ThunderboltOutlined, color: '#8B5CF6', bg: '#F5F3FF', prefix: '', suffix: '' },
  { key: 'couponClaimed', label: '券领取数', icon: GiftOutlined, color: '#EF4444', bg: '#FEF2F2', prefix: '', suffix: '张' },
  { key: 'activeCampaigns', label: '活动数', icon: FlagOutlined, color: '#06B6D4', bg: '#ECFEFF', prefix: '', suffix: '个' },
];

// ---- SVG Line Chart ----
function SvgLineChart({ data, color = '#3B82F6', height = 200 }: { data: { date: string; value: number }[]; color?: string; height?: number }) {
  const width = 600;
  const padL = 50, padR = 20, padT = 20, padB = 30;
  const cw = width - padL - padR;
  const ch = height - padT - padB;
  const maxV = Math.max(...data.map(d => d.value)) * 1.1;
  const minV = 0;
  const rangeV = maxV - minV || 1;

  const pts = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * cw,
    y: padT + ch - ((d.value - minV) / rangeV) * ch,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = linePath + ` L${pts[pts.length - 1].x},${padT + ch} L${pts[0].x},${padT + ch} Z`;

  // y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => {
    const v = minV + rangeV * r;
    const y = padT + ch - r * ch;
    return { v: Math.round(v), y };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="#F3F4F6" strokeWidth="1" />
          <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">{t.v}</text>
        </g>
      ))}
      <path d={areaPath} fill={color} fillOpacity="0.08" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pts[i].x} y={height - 4} textAnchor="middle" fontSize="10" fill="#9CA3AF">{d.date}</text>
      ))}
    </svg>
  );
}

// ---- SVG Bar Chart ----
function SvgBarChart({ data, color = '#3B82F6', height = 200 }: { data: { date: string; value: number }[]; color?: string; height?: number }) {
  const width = 600;
  const padL = 55, padR = 20, padT = 20, padB = 30;
  const cw = width - padL - padR;
  const ch = height - padT - padB;
  const maxV = Math.max(...data.map(d => d.value)) * 1.1;
  const barW = Math.min(40, cw / data.length * 0.5);
  const gap = cw / data.length;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => {
    const v = maxV * r;
    const y = padT + ch - r * ch;
    return { v: Math.round(v), y };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="#F3F4F6" strokeWidth="1" />
          <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">{t.v}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const barH = (d.value / maxV) * ch;
        const x = padL + gap * i + (gap - barW) / 2;
        const y = padT + ch - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} opacity="0.85" />
            <text x={padL + gap * i + gap / 2} y={height - 4} textAnchor="middle" fontSize="10" fill="#9CA3AF">{d.date}</text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#6B7280">{d.value >= 10000 ? `${(d.value / 10000).toFixed(1)}万` : d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---- SVG Pie Chart ----
function SvgPieChart({ data, size = 180 }: { data: { name: string; value: number; color: string }[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let curAngle = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = curAngle;
    curAngle += angle;
    const endAngle = curAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const dStr = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    const pct = ((d.value / total) * 100).toFixed(1);
    const midAngle = (startAngle + endAngle) / 2;
    const labelR = r * 0.65;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    return { dStr, color: d.color, name: d.name, pct, lx, ly };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <g key={i}>
            <path d={s.dStr} fill={s.color} stroke="#fff" strokeWidth="2" />
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#fff" fontWeight="600">{s.pct}%</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: d.color }} />
            <span style={{ fontSize: 13, color: '#374151' }}>{d.name}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- SVG Horizontal Bar Chart ----
function SvgHBarChart({ data }: { data: { name: string; value: number }[] }) {
  const maxV = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: 70, fontSize: 13, color: '#374151', textAlign: 'right', flexShrink: 0 }}>{d.name}</span>
          <div style={{ flex: 1, height: 20, background: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / maxV) * 100}%`, height: '100%', background: `linear-gradient(90deg, #3B82F6, #60A5FA)`, borderRadius: 10, transition: 'width 0.5s' }} />
          </div>
          <span style={{ width: 48, fontSize: 13, color: '#6B7280', textAlign: 'right' }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Main Component ----
export default function AnalyticsCenter() {
  const [dashboardData, setDashboardData] = useState<Record<string, number>>({});
  const [overviewData, setOverviewData] = useState<OverviewItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportTotal, setReportTotal] = useState(0);
  const [reportPage, setReportPage] = useState(1);
  const [trendRange, setTrendRange] = useState<'7' | '30'>('7');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<string>('7');

  useEffect(() => {
    fetchDashboardSummary().then((res: any) => setDashboardData(res || {}));
    fetchListData('analytics/overview').then((res: any) => setOverviewData(res?.list || res || []));
  }, []);

  const loadReports = () => {
    fetchListData('analytics/reports', { page: reportPage, pageSize: 10 }).then((res: any) => {
      setReports(res?.list || []);
      setReportTotal(res?.total || 0);
    });
  };

  useEffect(() => { loadReports(); }, [reportPage]);

  // ---- MoM helpers ----
  const momMap = useMemo(() => {
    const map: Record<string, string> = {};
    overviewData.forEach(item => { map[item.name] = item.mom; });
    return map;
  }, [overviewData]);

  const getMom = (key: string) => {
    const label = kpiConfig.find(c => c.key === key)?.label || '';
    return momMap[label] || '';
  };

  // ---- Report CRUD ----
  const handleAddReport = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'enabled' });
    setModalOpen(true);
  };

  const handleEditReport = (record: ReportItem) => {
    setEditId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDeleteReport = async (id: number) => {
    await deleteItemData('analytics/reports', id);
    message.success('删除成功');
    loadReports();
  };

  const handleSubmitReport = async () => {
    const values = await form.validateFields();
    if (editId != null) {
      await updateItemData('analytics/reports', editId, values);
      message.success('编辑成功');
    } else {
      await createItemData('analytics/reports', values);
      message.success('新增成功');
    }
    setModalOpen(false);
    loadReports();
  };

  const reportColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '报表名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type', render: (v: string) => ({ member: '会员分析', sales: '销售分析', points: '积分分析', campaign: '活动分析' }[v] || v) },
    { title: '周期', dataIndex: 'period', render: (v: string) => ({ daily: '日', weekly: '周', monthly: '月' }[v] || v) },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'enabled' ? 'green' : 'red'}>{v === 'enabled' ? '启用' : '禁用'}</Tag> },
    {
      title: '操作', key: 'action', width: 160,
      render: (_: any, record: ReportItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditReport(record)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDeleteReport(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const trendData = trendRange === '7' ? memberTrend7 : memberTrend30;

  const quickRanges: { label: string; value: string }[] = [
    { label: '近7天', value: '7' },
    { label: '近30天', value: '30' },
    { label: '近90天', value: '90' },
  ];

  return (
    <div style={{ padding: 24, background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Time filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <CalendarOutlined style={{ color: '#6B7280' }} />
          <span style={{ fontWeight: 500, marginRight: 8 }}>时间范围：</span>
          {quickRanges.map(r => (
            <Button key={r.value} size="small" type={dateRange === r.value ? 'primary' : 'default'} onClick={() => setDateRange(r.value)}>
              {r.label}
            </Button>
          ))}
          <RangePicker size="small" />
        </Space>
      </Card>

      {/* KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {kpiConfig.map(cfg => {
          const Icon = cfg.icon;
          const val = dashboardData[cfg.key] ?? 0;
          const momStr = getMom(cfg.key);
          const isUp = momStr.startsWith('+');
          return (
            <Col key={cfg.key} span={4}>
              <Card
                style={{ borderRadius: 12, border: 'none' }}
                styles={{ body: { padding: '20px 20px 16px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{cfg.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1F2937', lineHeight: 1.2 }}>
                      {cfg.prefix}{typeof val === 'number' ? val.toLocaleString() : val}{cfg.suffix}
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ fontSize: 22, color: cfg.color }} />
                  </div>
                </div>
                {momStr && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isUp ? <RiseOutlined style={{ color: '#10B981' }} /> : <FallOutlined style={{ color: '#EF4444' }} />}
                    <span style={{ fontSize: 13, color: isUp ? '#10B981' : '#EF4444', fontWeight: 500 }}>{momStr}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>环比</span>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Trend charts */}
      <Card style={{ marginBottom: 16, borderRadius: 12, border: 'none' }}>
        <Tabs
          defaultActiveKey="member"
          tabBarExtraContent={
            <Space>
              <Button size="small" type={trendRange === '7' ? 'primary' : 'default'} onClick={() => setTrendRange('7')}>近7天</Button>
              <Button size="small" type={trendRange === '30' ? 'primary' : 'default'} onClick={() => setTrendRange('30')}>近30天</Button>
            </Space>
          }
          items={[
            {
              key: 'member',
              label: '会员增长趋势',
              children: (
                <div style={{ padding: '8px 0' }}>
                  <SvgLineChart data={trendData} color="#3B82F6" height={220} />
                  <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#6B7280' }}>会员数量增长趋势</div>
                </div>
              ),
            },
            {
              key: 'revenue',
              label: '营收趋势',
              children: (
                <div style={{ padding: '8px 0' }}>
                  <SvgBarChart data={revenueTrend} color="#10B981" height={220} />
                  <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#6B7280' }}>每日营收趋势（元）</div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Dimensional analysis */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card title="会员等级分布" style={{ borderRadius: 12, border: 'none', height: '100%' }}>
            <SvgPieChart data={levelDistribution} size={170} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="订单来源分布" style={{ borderRadius: 12, border: 'none', height: '100%' }}>
            <SvgPieChart data={orderSource} size={170} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="商品分类销量排行" style={{ borderRadius: 12, border: 'none', height: '100%' }}>
            <SvgHBarChart data={categorySales} />
          </Card>
        </Col>
      </Row>

      {/* Reports list */}
      <Card
        title="分析报表"
        style={{ borderRadius: 12, border: 'none' }}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAddReport}>新增报表</Button>}
      >
        <Table
          rowKey="id"
          dataSource={reports}
          columns={reportColumns}
          pagination={{
            current: reportPage,
            pageSize: 10,
            total: reportTotal,
            showTotal: t => `共 ${t} 条`,
            onChange: p => setReportPage(p),
          }}
        />
      </Card>

      {/* Report modal */}
      <Modal
        title={editId != null ? '编辑报表' : '新增报表'}
        open={modalOpen}
        onOk={handleSubmitReport}
        onCancel={() => setModalOpen(false)}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="报表名称" rules={[{ required: true, message: '请输入报表名称' }]}>
            <Input placeholder="请输入报表名称" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[
              { label: '会员分析', value: 'member' }, { label: '销售分析', value: 'sales' },
              { label: '积分分析', value: 'points' }, { label: '活动分析', value: 'campaign' },
            ]} placeholder="请选择类型" />
          </Form.Item>
          <Form.Item name="period" label="周期" rules={[{ required: true }]}>
            <Select options={[
              { label: '日', value: 'daily' }, { label: '周', value: 'weekly' }, { label: '月', value: 'monthly' },
            ]} placeholder="请选择周期" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '启用', value: 'enabled' }, { label: '禁用', value: 'disabled' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
