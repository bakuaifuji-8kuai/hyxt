import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select,
  Progress, Badge, Space, Statistic, Tag, message, Popconfirm, DatePicker, Radio,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined,
  TagOutlined as TicketOutlined, SwapOutlined,
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData, toggleStatusData } from '../services/request';

const { RangePicker } = DatePicker;

interface CouponData {
  id: number;
  name: string;
  type: 'fullcut' | 'cash' | 'discount' | 'groupbuy';
  value: number;
  minSpend: number;
  quantity: number;
  claimed: number;
  status: 'enabled' | 'disabled';
  groupPrice?: number;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; gradient: string; unit: string; valueLabel: string }> = {
  fullcut: {
    label: '满减券',
    color: '#FA541C',
    bg: '#FFF2E8',
    gradient: 'linear-gradient(135deg, #FF7A45 0%, #FA541C 100%)',
    unit: '元',
    valueLabel: '减免金额',
  },
  cash: {
    label: '代金券',
    color: '#F5222D',
    bg: '#FFF1F0',
    gradient: 'linear-gradient(135deg, #FF4D4F 0%, #F5222D 100%)',
    unit: '元',
    valueLabel: '面值',
  },
  discount: {
    label: '折扣券',
    color: '#722ED1',
    bg: '#F9F0FF',
    gradient: 'linear-gradient(135deg, #9254DE 0%, #722ED1 100%)',
    unit: '折',
    valueLabel: '折扣',
  },
  groupbuy: {
    label: '团购券',
    color: '#13C2C2',
    bg: '#E6FFFB',
    gradient: 'linear-gradient(135deg, #36CFC9 0%, #13C2C2 100%)',
    unit: '元',
    valueLabel: '抵扣金额',
  },
};

export default function CouponManage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponData | null>(null);
  const [form] = Form.useForm();
  const [currentType, setCurrentType] = useState<string>('fullcut');
  const [validityType, setValidityType] = useState<'fixed' | 'days'>('fixed');

  const loadData = async () => {
    const params: Record<string, any> = { page, pageSize, keyword };
    const res: any = await fetchListData('coupon/templates', params);
    let list: CouponData[] = res.list || [];
    if (filterType) {
      list = list.filter((c: CouponData) => c.type === filterType);
    }
    if (filterStatus) {
      list = list.filter((c: CouponData) => c.status === filterStatus);
    }
    setCoupons(list);
    setTotal(res.total || list.length);
  };

  useEffect(() => { loadData(); }, [page, pageSize]);

  const stats = {
    total: total,
    enabled: coupons.filter(c => c.status === 'enabled').length,
    claimedOut: coupons.filter(c => c.claimed >= c.quantity).length,
    disabled: coupons.filter(c => c.status === 'disabled').length,
  };

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedCoupon(null);
    setCurrentType('fullcut');
    setValidityType('fixed');
    form.resetFields();
    form.setFieldsValue({ type: 'fullcut', status: 'enabled', quantity: 100, minSpend: 0, value: 10, validityDays: 7 });
    setModalOpen(true);
  };

  const handleEdit = (item: CouponData) => {
    setIsEdit(true);
    setSelectedCoupon(item);
    setCurrentType(item.type);
    setValidityType('fixed');
    form.setFieldsValue({
      name: item.name,
      type: item.type,
      value: item.value,
      minSpend: item.minSpend,
      groupPrice: item.groupPrice,
      quantity: item.quantity,
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteItemData('coupon/templates', id);
    message.success('删除成功');
    loadData();
  };

  const handleToggleStatus = async (id: number) => {
    await toggleStatusData('coupon/templates', id);
    message.success('状态切换成功');
    loadData();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (isEdit && selectedCoupon) {
      await updateItemData('coupon/templates', selectedCoupon.id, values);
    } else {
      await createItemData('coupon/templates', values);
    }
    setModalOpen(false);
    message.success(isEdit ? '编辑成功' : '新增成功');
    loadData();
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
    loadData();
  };

  const renderCouponFace = (coupon: CouponData) => {
    const cfg = TYPE_CONFIG[coupon.type] || TYPE_CONFIG.fullcut;
    return (
      <div
        style={{
          width: '160px',
          minWidth: '160px',
          height: '100%',
          minHeight: '180px',
          background: cfg.gradient,
          borderRadius: '12px 0 0 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰圆 */}
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15px', left: '-15px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />

        <Tag
          style={{
            background: 'rgba(255,255,255,0.25)',
            color: '#fff',
            border: 'none',
            marginBottom: '8px',
            fontSize: '12px',
          }}
        >
          {cfg.label}
        </Tag>

        <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1.1 }}>
          {coupon.type === 'discount' ? (
            <>
              <span style={{ fontSize: '28px' }}>{coupon.value}</span>
              <span style={{ fontSize: '16px' }}>{cfg.unit}</span>
            </>
          ) : coupon.type === 'groupbuy' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                团¥{coupon.groupPrice || 0}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>
                <span style={{ fontSize: '16px' }}>抵扣¥</span>{coupon.value}
              </div>
            </div>
          ) : (
            <>
              <span style={{ fontSize: '18px' }}>¥</span>
              {coupon.value}
            </>
          )}
        </div>

        <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '6px' }}>
          {coupon.type === 'groupbuy' ? '团购专享' : (coupon.minSpend > 0 ? `满${coupon.minSpend}可用` : '无门槛')}
        </div>

        {/* 锯齿线模拟 */}
        <div style={{
          position: 'absolute', right: '-1px', top: 0, bottom: 0,
          width: '1px',
          background: 'repeating-linear-gradient(to bottom, #fff 0, #fff 6px, transparent 6px, transparent 12px)',
          opacity: 0.3,
        }} />
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 顶部统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: '8px' }}>
            <Statistic
              title="券模板总数"
              value={stats.total}
              prefix={<TicketOutlined style={{ color: '#1890FF' }} />}
              valueStyle={{ color: '#1890FF' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: '8px' }}>
            <Statistic
              title="进行中"
              value={stats.enabled}
              prefix={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: '8px' }}>
            <Statistic
              title="已领完"
              value={stats.claimedOut}
              prefix={<ExclamationCircleOutlined style={{ color: '#FAAD14' }} />}
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: '8px' }}>
            <Statistic
              title="已停用"
              value={stats.disabled}
              prefix={<CloseCircleOutlined style={{ color: '#FF4D4F' }} />}
              valueStyle={{ color: '#FF4D4F' }}
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
            <Input.Search
              placeholder="搜索券名称"
              allowClear
              onSearch={handleSearch}
              style={{ width: '220px' }}
            />
            <Select
              placeholder="券类型"
              allowClear
              value={filterType}
              onChange={(v) => { setFilterType(v); loadData(); }}
              style={{ width: '120px' }}
              options={[
                { label: '满减券', value: 'fullcut' },
                { label: '代金券', value: 'cash' },
                { label: '折扣券', value: 'discount' },
                { label: '团购券', value: 'groupbuy' },
              ]}
            />
            <Select
              placeholder="状态"
              allowClear
              value={filterStatus}
              onChange={(v) => { setFilterStatus(v); loadData(); }}
              style={{ width: '120px' }}
              options={[
                { label: '进行中', value: 'enabled' },
                { label: '已停用', value: 'disabled' },
              ]}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增券模板
          </Button>
        </div>
      </Card>

      {/* 优惠券卡片网格 */}
      <Row gutter={[16, 16]}>
        {coupons.map((coupon) => {
          const cfg = TYPE_CONFIG[coupon.type] || TYPE_CONFIG.fullcut;
          const claimPercent = coupon.quantity > 0 ? Math.round((coupon.claimed / coupon.quantity) * 100) : 0;
          const isClaimedOut = coupon.claimed >= coupon.quantity;

          return (
            <Col key={coupon.id} xs={24} sm={12} md={12} lg={8} xl={6}>
              <Card
                bodyStyle={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}
                style={{ borderRadius: '12px', overflow: 'hidden' }}
                hoverable
              >
                <div style={{ display: 'flex', minHeight: '180px' }}>
                  {/* 左侧券面 */}
                  {renderCouponFace(coupon)}

                  {/* 右侧信息 */}
                  <div style={{
                    flex: 1,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {coupon.name}
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#8C8C8C' }}>
                          发行 {coupon.quantity} / 已领 {coupon.claimed}
                        </span>
                      </div>

                      <Progress
                        percent={claimPercent}
                        size="small"
                        strokeColor={isClaimedOut ? '#FF4D4F' : cfg.color}
                        format={() => `${claimPercent}%`}
                      />

                      <div style={{ marginTop: '8px' }}>
                        {coupon.status === 'enabled' ? (
                          <Badge status="success" text="进行中" />
                        ) : (
                          <Badge status="default" text="已停用" />
                        )}
                        {isClaimedOut && (
                          <Tag color="red" style={{ marginLeft: '8px', fontSize: '11px' }}>已领完</Tag>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(coupon)}
                      >
                        编辑
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={coupon.status === 'enabled' ? <StopOutlined /> : <CheckCircleOutlined />}
                        onClick={() => handleToggleStatus(coupon.id)}
                      >
                        {coupon.status === 'enabled' ? '停用' : '启用'}
                      </Button>
                      <Popconfirm
                        title="确认删除此券模板?"
                        onConfirm={() => handleDelete(coupon.id)}
                      >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}

        {coupons.length === 0 && (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '60px', color: '#BFBFBF' }}>
                <TicketOutlined style={{ fontSize: '48px', marginBottom: '12px' }} />
                <div>暂无券模板数据</div>
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
        title={isEdit ? `编辑券模板 - ${selectedCoupon?.name}` : '新增券模板'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          {/* 基本信息 */}
          <div style={{ fontWeight: 600, marginBottom: '16px', color: '#1890FF' }}>
            <SwapOutlined style={{ marginRight: '8px' }} />基本信息
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="券名称" rules={[{ required: true, message: '请输入券名称' }]}>
                <Input placeholder="如: 满200减30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="券类型" rules={[{ required: true, message: '请选择券类型' }]}>
                <Select
                  onChange={(v) => { setCurrentType(v); form.setFieldsValue({ value: undefined, groupPrice: undefined }); }}
                  options={[
                    { label: '满减券', value: 'fullcut' },
                    { label: '代金券', value: 'cash' },
                    { label: '折扣券', value: 'discount' },
                    { label: '团购券', value: 'groupbuy' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 规则配置 */}
          <div style={{ fontWeight: 600, marginBottom: '16px', color: '#1890FF', marginTop: '8px' }}>
            <CheckCircleOutlined style={{ marginRight: '8px' }} />规则配置
          </div>
          <Row gutter={16}>
            {currentType === 'groupbuy' && (
              <Col span={8}>
                <Form.Item
                  name="groupPrice"
                  label="团购价"
                  rules={[{ required: true, message: '请输入团购价' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    step={1}
                    addonBefore="团"
                    addonAfter="元"
                    placeholder="如: 50"
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={currentType === 'groupbuy' ? 8 : 8}>
              <Form.Item
                name="value"
                label={TYPE_CONFIG[currentType]?.valueLabel || '面值'}
                rules={[{ required: true, message: `请输入${TYPE_CONFIG[currentType]?.valueLabel || '面值'}` }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={currentType === 'discount' ? 0.1 : 1}
                  max={currentType === 'discount' ? 9.9 : undefined}
                  step={currentType === 'discount' ? 0.1 : 1}
                  addonAfter={TYPE_CONFIG[currentType]?.unit || '元'}
                  placeholder={currentType === 'discount' ? '如: 8.5' : '如: 30'}
                />
              </Form.Item>
            </Col>
            {currentType !== 'groupbuy' && (
              <Col span={8}>
                <Form.Item name="minSpend" label="使用门槛">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    addonAfter="元"
                    placeholder="0表示无门槛"
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={8}>
              <Form.Item name="quantity" label="发行总量" rules={[{ required: true, message: '请输入发行总量' }]}>
                <InputNumber style={{ width: '100%' }} min={1} placeholder="如: 500" />
              </Form.Item>
            </Col>
          </Row>

          {/* 有效期配置 */}
          <div style={{ fontWeight: 600, marginBottom: '16px', color: '#1890FF', marginTop: '8px' }}>
            <ExclamationCircleOutlined style={{ marginRight: '8px' }} />有效期配置
          </div>
          <Form.Item label="有效期类型">
            <Radio.Group value={validityType} onChange={(e) => setValidityType(e.target.value)}>
              <Radio value="fixed">固定日期</Radio>
              <Radio value="days">领取后N天有效</Radio>
            </Radio.Group>
          </Form.Item>
          {validityType === 'fixed' ? (
            <Form.Item label="有效日期范围">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          ) : (
            <Form.Item name="validityDays" label="领取后有效天数">
              <InputNumber style={{ width: '200px' }} min={1} addonAfter="天" placeholder="如: 7" />
            </Form.Item>
          )}

          {/* 状态 */}
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={[
              { label: '启用', value: 'enabled' },
              { label: '停用', value: 'disabled' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
