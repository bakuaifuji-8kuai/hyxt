import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Modal, Form, Input, InputNumber, Select, Avatar, Divider, Progress, Timeline, Badge } from 'antd';
import { UserOutlined, ShoppingCartOutlined, GiftOutlined, ClockCircleOutlined, StarOutlined, CreditCardOutlined, CalendarOutlined, PhoneOutlined } from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData } from '../services/request';
import { getModule } from '../services/modules';

const { TextArea } = Input;

interface MemberData {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  level: string;
  cardNo: string;
  growthValue: number;
  points: number;
  balance: number;
  totalSpent: number;
  orderCount: number;
  avgAmount: number;
  source: string;
  registerTime: string;
  lastLogin: string;
  lastConsume: string;
  wxNickname: string;
  gender: string;
  birthday: string;
  age: number;
  address: string;
}

interface ProfileData {
  id: number;
  member: string;
  tags: string;
  consumeTag: string;
  brandTag: string;
  pointsTag: string;
  lastActive: string;
}

export default function MemberProfile() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchListData('member/list').then((res: any) => setMembers(res.list || []));
    fetchListData('member/profiles').then((res: any) => setProfiles(res.list || []));
  }, []);

  const handleSelectMember = (member: MemberData) => {
    setSelectedMember(member);
    const profile = profiles.find(p => p.member === member.name);
    setSelectedProfile(profile || null);
  };

  const handleAdd = () => {
    setIsEdit(false);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedMember) return;
    setIsEdit(true);
    form.setFieldsValue(selectedMember);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    await deleteItemData('member/list', selectedMember.id);
    setMembers(members.filter(m => m.id !== selectedMember.id));
    setSelectedMember(null);
    setSelectedProfile(null);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (isEdit && selectedMember) {
      await updateItemData('member/list', selectedMember.id, values);
      setMembers(members.map(m => m.id === selectedMember.id ? { ...m, ...values } : m));
      setSelectedMember({ ...selectedMember, ...values });
    } else {
      await createItemData('member/list', values);
      fetchListData('member/list').then((res: any) => setMembers(res.list || []));
    }
    setModalOpen(false);
  };

  const levelColors: Record<string, string> = {
    DIAMOND: 'linear-gradient(135deg, #B9F2FF 0%, #67E8F9 100%)',
    GOLD: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%)',
    SILVER: 'linear-gradient(135deg, #F3F4F6 0%, #9CA3AF 100%)',
    NORMAL: 'linear-gradient(135deg, #E0E7FF 0%, #A5B4FC 100%)',
  };

  const levelNames: Record<string, string> = {
    DIAMOND: '钻石会员',
    GOLD: '金卡会员',
    SILVER: '银卡会员',
    NORMAL: '普通会员',
  };

  const levelIcons: Record<string, string> = {
    DIAMOND: '💎',
    GOLD: '👑',
    SILVER: '⭐',
    NORMAL: '🎫',
  };

  const radarData = selectedMember ? [
    { name: '消费能力', value: Math.min(100, Math.round(selectedMember.totalSpent / 100)) },
    { name: '活跃度', value: selectedMember.orderCount > 10 ? 80 : selectedMember.orderCount > 5 ? 60 : 40 },
    { name: '忠诚度', value: selectedMember.points > 5000 ? 90 : selectedMember.points > 2000 ? 70 : 50 },
    { name: '互动参与', value: 65 },
    { name: '优惠券使用', value: 70 },
  ] : [];

  const consumptionTrend = [
    { month: '1月', value: 1200 },
    { month: '2月', value: 800 },
    { month: '3月', value: 1500 },
    { month: '4月', value: 900 },
    { month: '5月', value: 2000 },
    { month: '6月', value: 1800 },
  ];

  const tagColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  const renderRadar = () => {
    if (!selectedMember) return null;
    const center = 100;
    const radius = 80;
    const points = radarData.map((item, i) => {
      const angle = (i * 2 * Math.PI) / radarData.length - Math.PI / 2;
      const r = (item.value / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const axes = radarData.map((item, i) => {
      const angle = (i * 2 * Math.PI) / radarData.length - Math.PI / 2;
      const x2 = center + radius * Math.cos(angle);
      const y2 = center + radius * Math.sin(angle);
      return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="#E5E7EB" strokeWidth="1" />;
    });

    const labels = radarData.map((item, i) => {
      const angle = (i * 2 * Math.PI) / radarData.length - Math.PI / 2;
      const r = radius + 25;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#6B7280">{item.name}</text>;
    });

    const rings = [20, 40, 60, 80, 100].map(r => (
      <circle key={r} cx={center} cy={center} r={(r / 100) * radius} fill="none" stroke="#E5E7EB" strokeWidth="1" />
    ));

    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <svg width="220" height="220" viewBox="0 0 200 200">
          {rings}
          {axes}
          {labels}
          <polygon points={points} fill="rgba(59, 130, 246, 0.2)" stroke="#3B82F6" strokeWidth="2" />
          {radarData.map((item, i) => {
            const angle = (i * 2 * Math.PI) / radarData.length - Math.PI / 2;
            const r = (item.value / 100) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" />;
          })}
        </svg>
      </div>
    );
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...consumptionTrend.map(t => t.value));
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '120px', padding: '10px' }}>
        {consumptionTrend.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
            <div style={{ width: '30px', height: `${(item.value / maxValue) * 100}px`, backgroundColor: '#3B82F6', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }}></div>
            <span style={{ fontSize: '10px', marginTop: '5px', color: '#6B7280' }}>{item.month}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
      <Row gutter={[16, 16]}>
        <Col span={5}>
          <Card title="会员列表" style={{ height: 'calc(100vh - 112px)' }}>
            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`选择会员${member.name}`}
                  onClick={() => handleSelectMember(member)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectMember(member); } }}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedMember?.id === member.id ? '#EBF5FF' : '#FFFFFF',
                    border: selectedMember?.id === member.id ? '1px solid #3B82F6' : '1px solid #E5E7EB',
                    transition: 'background-color 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar size={40} icon={<UserOutlined />} src={member.avatar || undefined} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{member.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{levelNames[member.level] || member.level}</div>
                    </div>
                    <span style={{ fontSize: '18px' }}>{levelIcons[member.level] || '🎫'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Button type="primary" block onClick={handleAdd}>新增会员</Button>
              {selectedMember && (
                <>
                  <Button block onClick={handleEdit}>编辑</Button>
                  <Button danger block onClick={handleDelete}>删除</Button>
                </>
              )}
            </div>
          </Card>
        </Col>

        <Col span={19}>
          {selectedMember ? (
            <>
              <Card>
                <div style={{ background: levelColors[selectedMember.level] || '#F3F4F6', padding: '24px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Avatar size={100} icon={<UserOutlined />} src={selectedMember.avatar || undefined} style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{selectedMember.name}</h2>
                        <Badge status="processing" text={levelNames[selectedMember.level] || selectedMember.level} />
                        <span style={{ fontSize: '16px' }}>{levelIcons[selectedMember.level]}</span>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '24px', fontSize: '14px', color: '#4B5563' }}>
                        <span><PhoneOutlined /> {selectedMember.phone}</span>
                        <span><CreditCardOutlined /> {selectedMember.cardNo}</span>
                        <span><CalendarOutlined /> {selectedMember.registerTime}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div style={{ textAlign: 'center', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>{selectedMember.points}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>积分</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{selectedMember.balance}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>储值余额</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>{selectedMember.growthValue}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>成长值</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="会员画像分析">
                    {renderRadar()}
                    <div style={{ textAlign: 'center', marginTop: '-10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#3B82F6' }}>综合评分 85</span>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="消费趋势">
                    {renderBarChart()}
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>近6个月消费金额（元）</span>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="会员标签">
                    {selectedProfile?.tags ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedProfile.tags.split(',').map((tag, i) => (
                          <Tag key={i} color={tagColors[i % tagColors.length]}>{tag}</Tag>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>暂无标签</div>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="消费偏好">
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>消费偏好</span>
                        <span style={{ fontWeight: '600' }}>{selectedProfile?.consumeTag || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>品牌偏好</span>
                        <span style={{ fontWeight: '600' }}>{selectedProfile?.brandTag || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>积分偏好</span>
                        <span style={{ fontWeight: '600' }}>{selectedProfile?.pointsTag || '-'}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="基本信息">
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>微信昵称</span>
                        <span>{selectedMember.wxNickname || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>性别</span>
                        <span>{selectedMember.gender === 'male' ? '男' : selectedMember.gender === 'female' ? '女' : '保密'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>年龄</span>
                        <span>{selectedMember.age || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>生日</span>
                        <span>{selectedMember.birthday || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>地址</span>
                        <span style={{ textAlign: 'right', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMember.address || '-'}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="消费统计">
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>消费总额</span>
                        <span style={{ fontWeight: '600', color: '#EF4444' }}>¥{selectedMember.totalSpent}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>订单数量</span>
                        <span style={{ fontWeight: '600' }}>{selectedMember.orderCount} 单</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>客单价</span>
                        <span style={{ fontWeight: '600' }}>¥{selectedMember.avgAmount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#6B7280' }}>注册来源</span>
                        <span>{selectedMember.source === 'miniapp' ? '小程序' : selectedMember.source === 'wxapp' ? '公众号' : selectedMember.source === 'shop' ? '门店' : selectedMember.source === 'activity' ? '活动' : '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>最近消费</span>
                        <span>{selectedMember.lastConsume || '-'}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '80px', color: '#9CA3AF' }}>
                <UserOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
                <div style={{ fontSize: '18px' }}>请从左侧列表选择会员查看详情</div>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title={isEdit ? '编辑会员' : '新增会员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input placeholder="请输入姓名…" />
              </Form.Item>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input placeholder="请输入手机号" name="phone" autoComplete="tel" />
              </Form.Item>
              <Form.Item name="gender" label="性别">
                <Select options={[{ label: '男', value: 'male' }, { label: '女', value: 'female' }, { label: '保密', value: 'unknown' }]} />
              </Form.Item>
              <Form.Item name="birthday" label="生日">
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item name="age" label="年龄">
                <InputNumber />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="level" label="会员等级" rules={[{ required: true }]}>
                <Select options={[{ label: '普通会员', value: 'NORMAL' }, { label: '银卡会员', value: 'SILVER' }, { label: '金卡会员', value: 'GOLD' }, { label: '钻石会员', value: 'DIAMOND' }]} />
              </Form.Item>
              <Form.Item name="points" label="积分">
                <InputNumber />
              </Form.Item>
              <Form.Item name="balance" label="储值余额">
                <InputNumber />
              </Form.Item>
              <Form.Item name="growthValue" label="成长值">
                <InputNumber />
              </Form.Item>
              <Form.Item name="source" label="注册来源">
                <Select options={[{ label: '小程序', value: 'miniapp' }, { label: '公众号', value: 'wxapp' }, { label: '门店', value: 'shop' }, { label: '活动', value: 'activity' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="地址">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}