import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button, Table, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message,
  Card, Row, Col, Statistic, Badge, Drawer, Descriptions, Image, Upload, Empty, Tag,
  DatePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  EyeOutlined, SwapOutlined, DatabaseOutlined, CheckCircleOutlined,
  StopOutlined, RiseOutlined, InboxOutlined
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData, toggleStatusData } from '../services/request';
import { getModule } from '../services/modules';
import type { FieldConfig } from '../services/modules';
import FeatureDescription from '../components/FeatureDescription';
import dayjs from 'dayjs';

// ============ 工具函数 ============

/** 判断字段名是否为图片字段 */
const isImageField = (name: string): boolean =>
  /image|img|logo|avatar|icon|photo|banner|cover|storePhotos|detailImages/i.test(name);

/** 判断字段名是否为颜色字段 */
const isColorField = (name: string): boolean =>
  /color/i.test(name);

/** 获取状态显示文本 */
const getStatusLabel = (val: any): string => {
  const map: Record<string, string> = {
    enabled: '启用', disabled: '禁用',
    normal: '正常', locked: '锁定', loss: '挂失',
    pending: '待处理', processing: '处理中', finished: '已完成',
    shipped: '已发货', done: '已完成', cancelled: '已取消',
    paid: '已付款', unused: '未核销', verified: '已核销',
    refunded: '已退款', rented: '已借出', returned: '已归还',
    overdue: '逾期', applying: '申请中', approved: '已通过',
    rejected: '已拒绝', issued: '已开', void: '已作废',
    published: '已发布', hidden: '已隐藏',
  };
  if (map[val]) return map[val];
  if (val === 'enabled') return '启用';
  return String(val ?? '');
};

/** 获取状态 Badge 颜色 */
const getStatusColor = (val: any): string => {
  const greenSet = new Set(['enabled', 'normal', 'finished', 'done', 'verified', 'returned', 'paid', 'approved', 'issued', 'published']);
  const redSet = new Set(['disabled', 'locked', 'loss', 'cancelled', 'rejected', 'void', 'hidden', 'overdue']);
  const orangeSet = new Set(['pending', 'unused', 'rented', 'applying']);
  const blueSet = new Set(['processing', 'shipped', 'refunded']);

  if (greenSet.has(val)) return 'success';
  if (redSet.has(val)) return 'error';
  if (orangeSet.has(val)) return 'warning';
  if (blueSet.has(val)) return 'processing';
  return 'default';
};

/** 从指定模块路径拉取数据渲染为下拉选择。配置示例：
 * { path: 'system/projects', labelField: 'name', valueField: 'code' } */
const SourceSelect: React.FC<{ source: { path: string; labelField: string; valueField: string }; placeholder?: string }> = ({ source, placeholder }) => {
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
  return <Select options={options} placeholder={placeholder || '请选择'} showSearch optionFilterProp="label" />;
};

/** 条件构建器：用于营销模型等筛选条件 */
const ConditionBuilder: React.FC<{ value?: string; onChange?: (val: string) => void }> = ({ value, onChange }) => {
  const [conditions, setConditions] = useState<{ field: string; operator: string; value: string }[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]');
      if (Array.isArray(parsed)) setConditions(parsed);
      else setConditions([]);
    } catch {
      setConditions([]);
    }
  }, [value]);

  const triggerChange = (next: { field: string; operator: string; value: string }[]) => {
    setConditions(next);
    onChange?.(JSON.stringify(next));
  };

  const fields = [
    { label: '会员等级', value: 'level' },
    { label: '消费金额', value: 'totalSpent' },
    { label: '注册时间', value: 'registerTime' },
    { label: '最近消费', value: 'lastConsume' },
    { label: '积分余额', value: 'points' },
    { label: '标签', value: 'tags' },
    { label: '性别', value: 'gender' },
    { label: '年龄', value: 'age' },
    { label: '来源渠道', value: 'source' },
    { label: '成长值', value: 'growth' },
  ];

  const operators = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' },
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'notContains' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'notEmpty' },
  ];

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 12, background: '#fafafa' }}>
      {conditions.map((c, idx) => (
        <Row key={idx} gutter={8} style={{ marginBottom: 8 }} align="middle">
          <Col span={7}>
            <Select
              placeholder="选择字段"
              options={fields}
              value={c.field || undefined}
              onChange={(v) => {
                const next = [...conditions];
                next[idx] = { ...next[idx], field: v };
                triggerChange(next);
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="运算符"
              options={operators}
              value={c.operator || undefined}
              onChange={(v) => {
                const next = [...conditions];
                next[idx] = { ...next[idx], operator: v };
                triggerChange(next);
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            {!['empty', 'notEmpty'].includes(c.operator) && (
              <Input
                placeholder="输入值"
                value={c.value}
                onChange={(e) => {
                  const next = [...conditions];
                  next[idx] = { ...next[idx], value: e.target.value };
                  triggerChange(next);
                }}
              />
            )}
          </Col>
          <Col span={3}>
            <Button
              danger
              size="small"
              onClick={() => triggerChange(conditions.filter((_, i) => i !== idx))}
            >
              删除
            </Button>
          </Col>
        </Row>
      ))}
      <Button
        type="dashed"
        size="small"
        onClick={() => triggerChange([...conditions, { field: '', operator: 'eq', value: '' }])}
        style={{ width: '100%' }}
      >
        + 添加条件
      </Button>
    </div>
  );
};

/** 渲染状态 Badge */
const renderStatusBadge = (val: any) => {
  if (val == null) return '-';
  return <Badge status={getStatusColor(val) as any} text={getStatusLabel(val)} />;
};

/** 根据模块数据计算一个额外的统计指标（如总积分/总金额等） */
const calcExtraStat = (data: any[], module: any): { label: string; value: number } | null => {
  // 尝试查找数字型字段作为汇总指标
  const numericFields = module?.fields?.filter(
    (f: FieldConfig) => f.type === 'number' && !['id', 'sort', 'validDays', 'limitBuy', 'minBuy'].includes(f.name)
  );
  if (!numericFields || numericFields.length === 0) return null;
  // 优先选取含 points/balance/amount/price/fee/budget/sales/totalSpent 的字段
  const priorityField = numericFields.find((f: FieldConfig) =>
    /points|balance|amount|price|fee|budget|sales|totalSpent|income|expense|value|deposit|rent/i.test(f.name)
  );
  const target = priorityField || numericFields[0];
  const sum = data.reduce((acc: number, item: any) => acc + (Number(item[target.name]) || 0), 0);
  return { label: `总${target.label}`, value: sum };
};

// ============ 主组件 ============

export default function GenericCRUD({ moduleKey }: { moduleKey: string }) {
  const module = getModule(moduleKey);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const loadData = useCallback(async () => {
    if (!module) return;
    setLoading(true);
    try {
      const res: any = await fetchListData(module.path, { page, pageSize, keyword: searchKeyword || undefined });
      const list = res?.list ?? res ?? [];
      setData(list);
      setTotal(res?.total ?? list.length);
    } catch (e: any) {
      message.error(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [module, page, pageSize, searchKeyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============ 筛选后的数据 ============
  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  // ============ 统计数据 ============
  const stats = useMemo(() => {
    const totalCount = total;
    const enabledCount = data.filter((item) => {
      const s = item.status;
      return s === 'enabled' || s === 'normal';
    }).length;
    const disabledCount = data.filter((item) => {
      const s = item.status;
      return s === 'disabled' || s === 'locked' || s === 'loss';
    }).length;
    const extra = module ? calcExtraStat(data, module) : null;
    return { totalCount, enabledCount, disabledCount, extra };
  }, [data, total, module]);

  if (!module) return <div>模块不存在: {moduleKey}</div>;

  // ============ 操作处理 ============

  const handleAdd = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'enabled' });
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditId(record.id);
    // 对图片字段，转换为 fileList 格式；对日期字段，转换为 dayjs
    const formValues: Record<string, any> = { ...record };
    module.fields.forEach((field) => {
      if (isImageField(field.name) && record[field.name]) {
        formValues[field.name] = [{
          uid: '-1',
          name: field.label,
          status: 'done',
          url: record[field.name],
        }];
      }
      if (field.type === 'date' && record[field.name]) {
        formValues[field.name] = dayjs(record[field.name]);
      }
    });
    form.setFieldsValue(formValues);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItemData(module.path, id);
      message.success('删除成功');
      loadData();
    } catch (e: any) {
      message.error(e.message || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 处理图片字段的 Upload fileList -> 提取 url；日期字段 dayjs -> 字符串
      module.fields.forEach((field) => {
        if (isImageField(field.name) && Array.isArray(values[field.name])) {
          const fileList = values[field.name];
          if (fileList.length > 0) {
            values[field.name] = fileList[0]?.url || fileList[0]?.response?.url || '';
          } else {
            values[field.name] = '';
          }
        }
        if (field.type === 'date' && values[field.name]) {
          const d = values[field.name];
          values[field.name] = dayjs.isDayjs(d) ? d.format(field.name.includes('Time') ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD') : d;
        }
      });
      if (editId != null) {
        await updateItemData(module.path, editId, values);
        message.success('编辑成功');
      } else {
        await createItemData(module.path, values);
        message.success('新增成功');
      }
      setModalOpen(false);
      loadData();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e.message || '操作失败');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleStatusData(module.path, id);
      message.success('状态已切换');
      loadData();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleViewDetail = (record: any) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  // ============ 表单字段渲染 ============

  const renderField = (field: FieldConfig) => {
    if (isImageField(field.name)) {
      return (
        <Upload.Dragger
          listType="picture-card"
          maxCount={1}
          accept="image/*"
          beforeUpload={() => false}
          defaultFileList={form.getFieldValue(field.name) || []}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">点击或拖拽上传图片</p>
        </Upload.Dragger>
      );
    }
    if (isColorField(field.name)) {
      return (
        <Input
          type="color"
          style={{ width: 60, height: 32, padding: 2, cursor: 'pointer' }}
          placeholder={field.placeholder}
        />
      );
    }
    switch (field.type) {
      case 'number':
        return <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} />;
      case 'select':
        if (field.source) {
          return <SourceSelect source={field.source} placeholder={field.placeholder || '请选择'} />;
        }
        return <Select options={field.options} placeholder={field.placeholder || '请选择'} />;
      case 'textarea':
        return <Input.TextArea rows={3} placeholder={field.placeholder} />;
      case 'switch':
        return <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />;
      case 'date':
        return <DatePicker style={{ width: '100%' }} placeholder={field.placeholder || `请选择${field.label}`} showTime={field.name.includes('Time')} />;
      case 'conditionBuilder':
        return <ConditionBuilder />;
      default:
        return <Input placeholder={field.placeholder || `请输入${field.label}`} />;
    }
  };

  // ============ 列定义 ============

  const columns: any[] = [
    ...module.columns.map((c) => ({
      ...c,
      render: c.render
        ? (val: any, record: any) => c.render!(val, record)
        : (val: any) => (val != null ? String(val) : '-'),
      // 覆盖图片列渲染
      ...(isImageField(c.dataIndex)
        ? {
            render: (val: any) =>
              val ? (
                <Image
                  src={val}
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk2iUKYQAAAABJRU5ErkJggg=="
                />
              ) : (
                <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12 }}>暂无</div>
              ),
            width: 80,
          }
        : {}),
      // 覆盖状态列渲染
      ...(c.dataIndex === 'status'
        ? {
            render: (val: any) => renderStatusBadge(val),
          }
        : {}),
    })),
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size={0} wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status !== undefined && (
            <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => handleToggle(record.id)}>
              {record.status === 'enabled' || record.status === 'normal' ? '禁用' : '启用'}
            </Button>
          )}
          <Popconfirm title="确认删除该记录？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ============ 详情抽屉内容 ============

  const renderDetailContent = () => {
    if (!detailRecord) return null;
    return (
      <Descriptions column={2} bordered size="small">
        {module.fields.map((field) => {
          const val = detailRecord[field.name];
          return (
            <Descriptions.Item key={field.name} label={field.label}>
              {field.name === 'status' ? (
                renderStatusBadge(val)
              ) : isImageField(field.name) ? (
                val ? (
                  <Image
                    src={val}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk2iUKYQAAAABJRU5ErkJggg=="
                  />
                ) : '-'
              ) : val != null ? (
                String(val)
              ) : (
                '-'
              )}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
    );
  };

  // ============ 渲染 ============

  return (
    <div style={{ padding: 20, background: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      {/* 统计卡片区 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title="总记录数"
              value={stats.totalCount}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title="启用数"
              value={stats.enabledCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            <Statistic
              title="禁用数"
              value={stats.disabledCount}
              prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 8 }}>
            {stats.extra ? (
              <Statistic
                title={stats.extra.label}
                value={stats.extra.value}
                prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            ) : (
              <Statistic
                title="当前页数据"
                value={data.length}
                prefix={<DatabaseOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 主卡片 */}
      <Card
        title={<span style={{ fontSize: 16, fontWeight: 600 }}>{module.name}</span>}
        extra={<FeatureDescription module={module} />}
        bordered={false}
        styles={{ body: { padding: '16px 0 0 0' } }}
        style={{ borderRadius: 8 }}
      >
        {/* 搜索与筛选 */}
        <div style={{ marginBottom: 16, padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索名称/编码"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={() => { setPage(1); loadData(); }}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              allowClear
              style={{ width: 140 }}
              options={[
                { label: '启用', value: 'enabled' },
                { label: '禁用', value: 'disabled' },
                { label: '正常', value: 'normal' },
                { label: '锁定', value: 'locked' },
                { label: '待处理', value: 'pending' },
                { label: '处理中', value: 'processing' },
                { label: '已完成', value: 'finished' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增{module.name}
          </Button>
        </div>

        {/* 表格 */}
        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredData}
          columns={columns}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <Empty
                description={`暂无${module.name}数据`}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            type: 'checkbox',
          }}
          onRow={(record) => ({
            onClick: () => handleViewDetail(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: page,
            pageSize,
            total: statusFilter ? filteredData.length : total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={
          <span style={{ fontSize: 16 }}>
            {editId != null ? `编辑${module.name}` : `新增${module.name}`}
          </span>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={680}
        destroyOnClose
        okText={editId != null ? '保存' : '创建'}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            {module.fields.filter(f => !f.hidden).map((field) => {
              const isImg = isImageField(field.name);
              const isFullRow = field.type === 'textarea' || isImg || field.type === 'conditionBuilder';
              return (
                <Col span={isFullRow ? 24 : 12} key={field.name}>
                  <Form.Item
                    name={field.name}
                    label={field.label}
                    valuePropName={isImg ? 'fileList' : 'value'}
                    getValueFromEvent={isImg ? (e: any) => (Array.isArray(e) ? e : e?.fileList) : undefined}
                    rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                  >
                    {renderField(field)}
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title={`${module.name} - 详情`}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={640}
        extra={
          detailRecord && (
            <Space>
              <Button icon={<EditOutlined />} onClick={() => { setDetailOpen(false); handleEdit(detailRecord); }}>
                编辑
              </Button>
            </Space>
          )
        }
      >
        {renderDetailContent()}
      </Drawer>
    </div>
  );
}
