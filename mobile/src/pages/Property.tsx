import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Dialog, Modal } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img } from '../components/common';
import { propertyApi } from '../services/api';

const QUICK_NAV = [
  { name: '积分任务', icon: '📋', target: 'tasks' },
  { name: '业主活动', icon: '🎉', target: 'activities' },
  { name: '专属商城', icon: '🛒', target: 'goods' },
  { name: '每日签到', icon: '📅', target: 'checkin' },
];

export default function PropertyPage() {
  const navigate = useNavigate();
  const { data: info, loading, reload: reloadInfo } = useFetch<any>(
    () => propertyApi.info() as Promise<any>,
    [],
  );

  const isApproved = info && info.status === 'approved';
  const isPending = info && info.status === 'pending';

  // 认证 Modal
  const [authVisible, setAuthVisible] = useState(false);
  const [authForm, setAuthForm] = useState({ property: '', community: '', name: '', phone: '' });
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // 任务/活动/商品
  const { data: tasks, loading: tasksLoading, reload: reloadTasks } = useFetch<any[]>(
    () => propertyApi.tasks() as Promise<any[]>,
    [],
    !!isApproved,
  );
  const { data: activities, loading: activitiesLoading, reload: reloadActivities } = useFetch<any[]>(
    () => propertyApi.activities() as Promise<any[]>,
    [],
    !!isApproved,
  );
  const { data: goods, loading: goodsLoading } = useFetch<any[]>(
    () => propertyApi.goods() as Promise<any[]>,
    [],
    !!isApproved,
  );

  // 任务凭证 Modal
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [evidence, setEvidence] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const [signingUp, setSigningUp] = useState<number | string | null>(null);

  const tasksRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);
  const goodsRef = useRef<HTMLDivElement>(null);

  const scrollTo = (target: string) => {
    if (target === 'checkin') {
      navigate('/checkin');
      return;
    }
    const map: Record<string, React.RefObject<HTMLDivElement>> = {
      tasks: tasksRef,
      activities: activitiesRef,
      goods: goodsRef,
    };
    const ref = map[target];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAuthSubmit = async () => {
    const { property, community, name, phone } = authForm;
    if (!property.trim()) { Toast.show('请输入房产信息'); return; }
    if (!community.trim()) { Toast.show('请输入小区名称'); return; }
    if (!name.trim()) { Toast.show('请输入业主姓名'); return; }
    if (!/^1\d{10}$/.test(phone)) { Toast.show('请输入正确的手机号'); return; }
    setAuthSubmitting(true);
    try {
      await propertyApi.auth({ property, community, name, phone });
      Toast.show({ icon: 'success', content: '提交成功，请等待审核' });
      setAuthVisible(false);
      setAuthForm({ property: '', community: '', name: '', phone: '' });
      reloadInfo();
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setAuthSubmitting(false);
    }
  };

  const openTaskModal = (task: any) => {
    setActiveTask(task);
    setEvidence('');
    setTaskModalVisible(true);
  };

  const handleSubmitTask = async () => {
    if (!activeTask) return;
    setTaskSubmitting(true);
    try {
      await propertyApi.submitTask(activeTask.id, evidence || 'mock-evidence');
      Toast.show({ icon: 'success', content: '任务提交成功，等待审核' });
      setTaskModalVisible(false);
      reloadTasks();
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleSignup = async (id: number | string) => {
    try {
      setSigningUp(id);
      await propertyApi.signup(id);
      Toast.show({ icon: 'success', content: '报名成功' });
      reloadActivities();
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setSigningUp(null);
    }
  };

  const handleExchange = async (g: any) => {
    if ((g.stock || 0) <= 0) { Toast.show('库存不足'); return; }
    const ok = await Dialog.confirm({ content: `确认消耗 ${g.points} 积分兑换「${g.name}」？` });
    if (!ok) return;
    try {
      navigate(`/points/goods/${g.id}`);
    } catch {
      // 兜底
    }
  };

  return (
    <Page>
      <NavBar title="业主服务" />

      {loading && <Loading />}

      {/* 未认证 */}
      {!loading && !info && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #e63946, #c81d2a)',
            color: '#fff',
            textAlign: 'center',
            padding: '24px 16px',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏡</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>完成业主认证，解锁专属权益</div>
          <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6, marginBottom: 16 }}>
            业主可享受积分任务、专属活动、积分商城等多重权益
          </div>
          <button
            className="btn btn-block"
            style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }}
            onClick={() => setAuthVisible(true)}
          >
            立即认证
          </button>
        </div>
      )}

      {/* 待审核 */}
      {!loading && isPending && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #f5b25b, #d99429)',
            color: '#fff',
            textAlign: 'center',
            padding: '24px 16px',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>认证审核中</div>
          <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>
            您提交的业主认证信息正在审核，请耐心等待
          </div>
        </div>
      )}

      {/* 已认证 - 业主信息卡片 */}
      {!loading && isApproved && (
        <>
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #3a2a5e 0%, #6b3fa0 50%, #c81d2a 100%)',
              color: '#fff',
              padding: 16,
            }}
          >
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>业主信息</div>
              <span
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                }}
              >
                ✓ 已认证
              </span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.8 }}>
              <div>房产：{info.property || '-'}</div>
              <div>小区：{info.community || '-'}</div>
              <div>业主：{info.name || '-'}</div>
            </div>
          </div>

          {/* 4 个金刚区 */}
          <div className="quick-nav">
            {QUICK_NAV.map((q) => (
              <div key={q.name} className="quick-nav-item" onClick={() => scrollTo(q.target)}>
                <div className="quick-nav-icon">{q.icon}</div>
                <span>{q.name}</span>
              </div>
            ))}
          </div>

          {/* 积分任务 */}
          <div ref={tasksRef} className="section">
            <div className="section-title">积分任务</div>
            {tasksLoading && <Loading />}
            {!tasksLoading && (!tasks || tasks.length === 0) && <Empty text="暂无任务" />}
            {!tasksLoading && tasks && tasks.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                {tasks.map((t: any, i: number) => (
                  <div className="list-item" key={t.id || i} style={{ alignItems: 'flex-start' }}>
                    <div className="icon">📋</div>
                    <div className="body">
                      <div className="flex-between">
                        <span className="title">{t.name}</span>
                        <span className="tag tag-gold">+{t.points}积分</span>
                      </div>
                      <div className="desc">{t.description || ''}</div>
                      <div className="desc">
                        {t.limit ? `条件：${t.limit}` : ''}
                        {t.category ? ` · ${t.category}` : ''}
                      </div>
                    </div>
                    <button
                      className={`btn btn-sm ${t.status === 'done' || t.status === 'pending' ? '' : 'btn-primary'}`}
                      disabled={t.status === 'done' || t.status === 'pending'}
                      onClick={() => openTaskModal(t)}
                    >
                      {t.status === 'done' ? '已完成' : t.status === 'pending' ? '审核中' : '提交任务'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 业主活动 */}
          <div ref={activitiesRef} className="section">
            <div className="section-title">业主活动</div>
            {activitiesLoading && <Loading />}
            {!activitiesLoading && (!activities || activities.length === 0) && (
              <Empty text="暂无活动" />
            )}
            {!activitiesLoading && activities && activities.length > 0 && (
              <div>
                {activities.map((a: any, i: number) => (
                  <div className="card" key={a.id || i} style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#f5f5f5' }}>
                      {a.image ? (
                        <Img
                          src={a.image}
                          alt={a.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 48,
                            background: 'var(--primary-light)',
                          }}
                        >
                          🎉
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 12 }}>
                      <div className="flex-between">
                        <span className="text-lg text-bold">{a.name}</span>
                        {a.status === 'signed' ? (
                          <span className="tag tag-green">已报名</span>
                        ) : a.status === 'ended' ? (
                          <span className="tag tag-gray">已结束</span>
                        ) : (
                          <span className="tag tag-blue">报名中</span>
                        )}
                      </div>
                      <div className="text-sm text-muted mt-8">🕐 时间：{a.time || '-'}</div>
                      <div className="text-sm text-muted">📍 地点：{a.location || '-'}</div>
                      {a.description && (
                        <div className="text-sm text-muted mt-8 ellipsis-2">{a.description}</div>
                      )}
                      <div className="flex-between mt-12">
                        <span className="text-sm text-muted">
                          已报名 {a.signupCount ?? 0} 人
                        </span>
                        <button
                          className={`btn btn-sm ${
                            a.status === 'signed' || a.status === 'ended' ? '' : 'btn-primary'
                          }`}
                          disabled={a.status === 'signed' || a.status === 'ended' || signingUp === a.id}
                          onClick={() => handleSignup(a.id)}
                        >
                          {a.status === 'signed'
                            ? '已报名'
                            : a.status === 'ended'
                            ? '已结束'
                            : signingUp === a.id
                            ? '报名中…'
                            : '立即报名'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 专属商城 */}
          <div ref={goodsRef} className="section">
            <div className="section-title">
              专属商城
              <span className="more">业主专享</span>
            </div>
            {goodsLoading && <Loading />}
            {!goodsLoading && (!goods || goods.length === 0) && <Empty text="暂无商品" />}
            {!goodsLoading && goods && goods.length > 0 && (
              <div className="goods-grid">
                {goods.map((g: any, i: number) => {
                  const noStock = (g.stock || 0) <= 0;
                  return (
                    <div className="goods-card" key={g.id || i}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: 1,
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 40,
                          overflow: 'hidden',
                        }}
                      >
                        {g.image ? (
                          <Img
                            src={g.image}
                            alt={g.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          '🎁'
                        )}
                      </div>
                      <div className="info">
                        <div className="name ellipsis-2">{g.name}</div>
                        {g.community && (
                          <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                            {g.community}
                          </div>
                        )}
                        <div className="price" style={{ color: 'var(--gold-dark)' }}>
                          {g.points}
                          <small> 积分</small>
                        </div>
                        <div className="flex-between" style={{ marginTop: 4 }}>
                          <span className="text-sm text-muted">库存 {g.stock ?? 0}</span>
                          <button
                            className={`btn btn-sm ${noStock ? '' : 'btn-gold'}`}
                            disabled={noStock}
                            onClick={() => handleExchange(g)}
                          >
                            {noStock ? '已兑完' : '兑换'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* 认证 Modal */}
      <Modal
        visible={authVisible}
        title="业主认证"
        closeOnMaskClick
        onClose={() => setAuthVisible(false)}
        content={
          <div>
            <div style={{ marginBottom: 12 }}>
              <div className="text-sm text-muted mb-8">房产信息</div>
              <input
                className="input"
                placeholder="如：X 栋 X 单元 XXX 号"
                value={authForm.property}
                onChange={(e) => setAuthForm({ ...authForm, property: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div className="text-sm text-muted mb-8">小区名称</div>
              <input
                className="input"
                placeholder="请输入小区名称"
                value={authForm.community}
                onChange={(e) => setAuthForm({ ...authForm, community: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div className="text-sm text-muted mb-8">业主姓名</div>
              <input
                className="input"
                placeholder="请输入业主姓名"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="text-sm text-muted mb-8">手机号</div>
              <input
                className="input"
                type="tel"
                maxLength={11}
                placeholder="请输入手机号"
                value={authForm.phone}
                onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
              />
            </div>
            <button
              className="btn btn-primary btn-block"
              disabled={authSubmitting}
              onClick={handleAuthSubmit}
            >
              {authSubmitting ? '提交中…' : '提交认证'}
            </button>
          </div>
        }
      />

      {/* 任务凭证 Modal */}
      <Modal
        visible={taskModalVisible}
        title="提交任务凭证"
        closeOnMaskClick
        onClose={() => setTaskModalVisible(false)}
        content={
          <div>
            {activeTask && (
              <div className="notice-bar" style={{ marginBottom: 12, borderRadius: 8 }}>
                <span>📋</span>
                <span>{activeTask.name} · 奖励 +{activeTask.points} 积分</span>
              </div>
            )}
            <div className="text-sm text-muted mb-8">任务凭证（描述/链接）</div>
            <textarea
              className="input textarea"
              placeholder="请输入任务完成凭证，如相关描述或截图链接"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 16 }}
              disabled={taskSubmitting}
              onClick={handleSubmitTask}
            >
              {taskSubmitting ? '提交中…' : '提交任务'}
            </button>
          </div>
        }
      />
    </Page>
  );
}
