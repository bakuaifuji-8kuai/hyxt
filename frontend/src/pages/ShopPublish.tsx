import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Progress, message, Space, Table, Modal, Form, Input, Select, DatePicker, Checkbox, Empty } from 'antd';
import {
  SendOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
  RocketOutlined, MessageOutlined, BookOutlined, CameraOutlined, PhoneOutlined,
  RestOutlined, EyeOutlined, EditOutlined,
} from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData } from '../services/request';
import dayjs from 'dayjs';

interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastPublishTime?: string;
  lastPublishStatus?: string;
  syncStatus?: string;
  config?: Record<string, any>;
}

interface PublishRecord {
  id: number;
  platform: string;
  platformName: string;
  status: 'success' | 'failed' | 'pending' | 'publishing';
  publishTime: string;
  content: string;
  syncCount: number;
  errorMsg?: string;
}

interface ShopConfig {
  id: number;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  status: 'draft' | 'published';
  updatedAt: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'wechat',
    name: '微信小程序',
    icon: <MessageOutlined />,
    color: '#07c160',
    status: 'connected',
    lastPublishTime: '2024-06-18 10:00',
    lastPublishStatus: 'success',
    syncStatus: '已同步',
    config: { appId: 'wx1234567890', version: 'v1.0.0' },
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: <BookOutlined />,
    color: '#ff2442',
    status: 'connected',
    lastPublishTime: '2024-06-17 15:30',
    lastPublishStatus: 'success',
    syncStatus: '已同步',
    config: { account: 'xiaohongshu_official' },
  },
  {
    id: 'kuaishou',
    name: '快手',
    icon: <CameraOutlined />,
    color: '#ff6c35',
    status: 'connected',
    lastPublishTime: '2024-06-16 09:15',
    lastPublishStatus: 'success',
    syncStatus: '已同步',
    config: { account: 'kuaishou_shop' },
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: <PhoneOutlined />,
    color: '#000000',
    status: 'disconnected',
    syncStatus: '未连接',
    config: {},
  },
];

export default function ShopPublish() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(PLATFORMS);
  const [publishRecords, setPublishRecords] = useState<PublishRecord[]>([]);
  const [shopConfig, setShopConfig] = useState<ShopConfig | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPublishRecords();
    fetchShopConfig();
  }, []);

  const fetchPublishRecords = async () => {
    try {
      const res: any = await fetchListData('shop/publish-records', { page: 1, pageSize: 20 });
      const list = res?.list || [
        { id: 1, platform: 'wechat', platformName: '微信小程序', status: 'success', publishTime: '2024-06-18 10:00', content: '商城首页配置更新', syncCount: 156 },
        { id: 2, platform: 'xiaohongshu', platformName: '小红书', status: 'success', publishTime: '2024-06-17 15:30', content: '新品发布', syncCount: 89 },
        { id: 3, platform: 'kuaishou', platformName: '快手', status: 'failed', publishTime: '2024-06-16 09:15', content: '活动页面发布', syncCount: 0, errorMsg: '接口超时，请重试' },
      ];
      setPublishRecords(list);
    } catch {
      setPublishRecords([]);
    }
  };

  const fetchShopConfig = async () => {
    try {
      const res: any = await fetchListData('shop/home-config', { page: 1, pageSize: 1 });
      const config = res?.list?.[0];
      if (config) {
        setShopConfig({
          id: config.id,
          name: config.name || '线上商城',
          description: '商城首页配置',
          logo: '',
          coverImage: '',
          status: 'published',
          updatedAt: config.updatedAt || dayjs().format('YYYY-MM-DD HH:mm'),
        });
      }
    } catch {
      setShopConfig(null);
    }
  };

  const getPlatformById = (id: string) => platforms.find(p => p.id === id);

  const handlePlatformToggle = (platformId: string) => {
    if (publishing) return;
    const platform = getPlatformById(platformId);
    if (!platform || platform.status !== 'connected') {
      message.warning(`${platform?.name}未连接，请先配置`);
      return;
    }
    setSelectedPlatforms(prev =>
      prev.includes(platformId) ? prev.filter(p => p !== platformId) : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      message.warning('请选择要发布的平台');
      return;
    }

    setPublishing(true);
    setPublishProgress(0);

    for (let i = 0; i < selectedPlatforms.length; i++) {
      const platformId = selectedPlatforms[i];
      const platform = getPlatformById(platformId)!;

      try {
        await simulatePublish(platformId);
        const newRecord: PublishRecord = {
          id: Date.now(),
          platform: platformId,
          platformName: platform.name,
          status: 'success',
          publishTime: dayjs().format('YYYY-MM-DD HH:mm'),
          content: form.getFieldValue('content') || '商城内容更新',
          syncCount: Math.floor(Math.random() * 200) + 50,
        };
        setPublishRecords(prev => [newRecord, ...prev]);

        setPlatforms(prev => prev.map(p =>
          p.id === platformId
            ? { ...p, lastPublishTime: newRecord.publishTime, lastPublishStatus: 'success', syncStatus: '已同步' }
            : p
        ));

        message.success(`${platform.name}发布成功`);
      } catch (error: any) {
        const newRecord: PublishRecord = {
          id: Date.now(),
          platform: platformId,
          platformName: platform.name,
          status: 'failed',
          publishTime: dayjs().format('YYYY-MM-DD HH:mm'),
          content: form.getFieldValue('content') || '商城内容更新',
          syncCount: 0,
          errorMsg: error.message || '发布失败',
        };
        setPublishRecords(prev => [newRecord, ...prev]);

        setPlatforms(prev => prev.map(p =>
          p.id === platformId
            ? { ...p, lastPublishTime: newRecord.publishTime, lastPublishStatus: 'failed', syncStatus: '同步失败' }
            : p
        ));

        message.error(`${platform.name}发布失败: ${error.message}`);
      }

      setPublishProgress(((i + 1) / selectedPlatforms.length) * 100);
    }

    setPublishing(false);
    setPublishModalOpen(false);
    setSelectedPlatforms([]);
    form.resetFields();
  };

  const simulatePublish = async (platformId: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (platformId === 'douyin') {
          reject(new Error('平台未连接'));
        } else {
          resolve();
        }
      }, 1500);
    });
  };

  const handleConnectPlatform = (platformId: string) => {
    message.info(`正在跳转到${getPlatformById(platformId)?.name}授权页面...`);
    setTimeout(() => {
      setPlatforms(prev => prev.map(p =>
        p.id === platformId ? { ...p, status: 'connected', syncStatus: '已连接' } : p
      ));
      message.success(`${getPlatformById(platformId)?.name}连接成功`);
    }, 1500);
  };

  const handleSync = async (platformId: string) => {
    const platform = getPlatformById(platformId);
    if (!platform || platform.status !== 'connected') {
      message.warning('请先连接平台');
      return;
    }

    setPlatforms(prev => prev.map(p =>
      p.id === platformId ? { ...p, syncStatus: '同步中...' } : p
    ));

    await new Promise(resolve => setTimeout(resolve, 1000));

    setPlatforms(prev => prev.map(p =>
      p.id === platformId ? { ...p, syncStatus: '已同步', lastPublishTime: dayjs().format('YYYY-MM-DD HH:mm') } : p
    ));

    message.success(`${platform.name}同步成功`);
  };

  const columns = [
    {
      title: '平台',
      dataIndex: 'platformName',
      key: 'platformName',
      render: (text: string, record: PublishRecord) => {
        const platform = getPlatformById(record.platform);
        return (
          <Space>
            <span style={{ color: platform?.color, fontSize: 18 }}>{platform?.icon}</span>
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      title: '发布内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
          success: { text: '成功', color: 'green', icon: <CheckCircleOutlined /> },
          failed: { text: '失败', color: 'red', icon: <CloseCircleOutlined /> },
          pending: { text: '待发布', color: 'orange', icon: <SyncOutlined spin /> },
          publishing: { text: '发布中', color: 'blue', icon: <SyncOutlined spin /> },
        };
        const cfg = statusMap[status];
        return <Tag color={cfg.color} icon={cfg.icon}>{cfg.text}</Tag>;
      },
    },
    {
      title: '同步商品数',
      dataIndex: 'syncCount',
      key: 'syncCount',
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PublishRecord) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
          {record.status === 'failed' && (
            <Button type="link" size="small" icon={<RestOutlined />} onClick={() => {}}>重试</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 顶部概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={18}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>线上商城发布管理</h2>
                <p style={{ margin: '4px 0 0', color: '#999', fontSize: 14 }}>
                  一键发布商城内容到多个平台，实现多渠道同步运营
                </p>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={() => setPublishModalOpen(true)}
                disabled={publishing}
              >
                一键发布
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#1890ff' }}>
              {platforms.filter(p => p.status === 'connected').length}/{platforms.length}
            </div>
            <div style={{ color: '#999', marginTop: 4 }}>已连接平台</div>
          </Card>
        </Col>
      </Row>

      {/* 平台配置区域 */}
      <Card size="small" style={{ marginBottom: 24, borderRadius: 8 }} title="平台配置">
        <Row gutter={[16, 16]}>
          {platforms.map(platform => (
            <Col xs={24} sm={12} lg={6} key={platform.id}>
              <div
                onClick={() => !publishing && platform.status === 'connected' && handlePlatformToggle(platform.id)}
                style={{
                  border: `2px solid ${selectedPlatforms.includes(platform.id) ? platform.color : '#e8e8e8'}`,
                  borderRadius: 8,
                  padding: 16,
                  background: selectedPlatforms.includes(platform.id) ? platform.color + '05' : '#fff',
                  cursor: platform.status === 'connected' && !publishing ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 8, background: platform.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: platform.color }}>
                      {platform.icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{platform.name}</div>
                      <Tag color={platform.status === 'connected' ? 'green' : 'red'} style={{ marginTop: 4, fontSize: 11 }}>
                        {platform.status === 'connected' ? '已连接' : '未连接'}
                      </Tag>
                    </div>
                  </div>
                  {selectedPlatforms.includes(platform.id) && (
                    <CheckCircleOutlined style={{ color: platform.color, fontSize: 20 }} />
                  )}
                </div>

                <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                  {platform.config.appId && <div>AppID: {platform.config.appId}</div>}
                  {platform.config.account && <div>账号: {platform.config.account}</div>}
                  {platform.lastPublishTime && <div>最后发布: {platform.lastPublishTime}</div>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {platform.status === 'connected' ? (
                    <>
                      <Button size="small" icon={<SyncOutlined />} onClick={e => { e.stopPropagation(); handleSync(platform.id); }}>
                        同步
                      </Button>
                      <Button size="small" icon={<EditOutlined />} onClick={e => e.stopPropagation()}>
                        配置
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" size="small" icon={<SendOutlined />} onClick={e => { e.stopPropagation(); handleConnectPlatform(platform.id); }}>
                      连接平台
                    </Button>
                  )}
                </div>

                {platform.syncStatus && (
                  <div style={{ marginTop: 8, fontSize: 12, color: platform.syncStatus === '已同步' ? '#52c41a' : '#faad14' }}>
                    {platform.syncStatus}
                  </div>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 商城配置预览 */}
      <Card size="small" style={{ marginBottom: 24, borderRadius: 8 }} title="商城配置预览">
        {shopConfig ? (
          <Row gutter={16} align="middle">
            <Col span={4}>
              <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneOutlined style={{ fontSize: 32, color: '#999' }} />
              </div>
            </Col>
            <Col span={20}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{shopConfig.name}</div>
              <div style={{ color: '#999', marginTop: 4 }}>{shopConfig.description}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <span style={{ color: '#666', fontSize: 13 }}>状态: <Tag color={shopConfig.status === 'published' ? 'green' : 'orange'}>{shopConfig.status === 'published' ? '已发布' : '草稿'}</Tag></span>
                <span style={{ color: '#666', fontSize: 13 }}>更新时间: {shopConfig.updatedAt}</span>
              </div>
            </Col>
          </Row>
        ) : (
          <Empty description="暂无商城配置" />
        )}
      </Card>

      {/* 发布记录 */}
      <Card size="small" style={{ borderRadius: 8 }} title="发布记录">
        <Table
          columns={columns}
          dataSource={publishRecords}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 发布弹窗 */}
      <Modal
        title="一键发布"
        open={publishModalOpen}
        onOk={handlePublish}
        onCancel={() => { setPublishModalOpen(false); setSelectedPlatforms([]); }}
        width={600}
        confirmLoading={publishing}
        okText={publishing ? '发布中...' : '确认发布'}
      >
        {publishing ? (
          <div>
            <div style={{ marginBottom: 16, fontSize: 14 }}>正在发布到 {selectedPlatforms.length} 个平台...</div>
            <Progress percent={publishProgress} status="active" />
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              label="选择平台"
              required
              validateTrigger={['onChange']}
              rules={[{ required: true, message: '请选择至少一个平台' }]}
            >
              <div>
                {platforms.filter(p => p.status === 'connected').map(platform => (
                  <Checkbox
                    key={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedPlatforms(prev => [...prev, platform.id]);
                      } else {
                        setSelectedPlatforms(prev => prev.filter(p => p !== platform.id));
                      }
                    }}
                    style={{ marginBottom: 8 }}
                  >
                    <span style={{ color: platform.color, marginRight: 4 }}>{platform.icon}</span>
                    {platform.name}
                  </Checkbox>
                ))}
              </div>
            </Form.Item>

            <Form.Item label="发布说明">
              <Input.TextArea
                name="content"
                placeholder="请输入发布说明（选填）"
                rows={3}
              />
            </Form.Item>

            <Form.Item label="发布时间">
              <DatePicker showTime style={{ width: '100%' }} placeholder="立即发布" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}