import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { Page, NavBar, Loading, Empty, useFetch } from '../components/common';
import { messageApi } from '../services/api';

const MSG_CATEGORIES = [
  { key: 'SYSTEM', label: '系统通知', icon: '📢' },
  { key: 'POINTS', label: '积分变动', icon: '💰' },
  { key: 'ACTIVITY', label: '活动通知', icon: '🎉' },
  { key: 'COUPON', label: '券到期', icon: '🎫' },
];

function formatTime(t: string) {
  if (!t) return '';
  const d = new Date(t);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState('');
  const { data, loading, error, reload } = useFetch<any[]>(messageApi.list, [], true);

  const handleReadAll = async () => {
    try {
      await messageApi.read({ all: true });
      Toast.show({ icon: 'success', content: '全部已读' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  const handleItemClick = async (item: any) => {
    if (!item.read) {
      try {
        await messageApi.read({ ids: [item.id] });
        reload();
      } catch {}
    }
    navigate('/me');
  };

  if (loading) return <Page><NavBar title="消息中心" /><Loading /></Page>;
  if (error) return <Page><NavBar title="消息中心" /><Empty text="加载失败" /></Page>;

  const messages = (data || []) as any[];
  const filtered = activeCat ? messages.filter((m) => m.type === activeCat) : messages;
  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <Page>
      <NavBar
        title="消息中心"
        right={
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: 13 }} onClick={handleReadAll}>
            全部已读
          </span>
        }
      />

      {/* 消息分类卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '12px 12px 8px', gap: 8 }}>
        {MSG_CATEGORIES.map((cat) => {
          const count = messages.filter((m) => m.type === cat.key && !m.read).length;
          return (
            <div
              key={cat.key}
              className={`card ${activeCat === cat.key ? '' : ''}`}
              style={{
                textAlign: 'center', padding: 8, margin: 0, cursor: 'pointer',
                border: activeCat === cat.key ? '2px solid var(--primary)' : 'none',
                borderRadius: 10,
              }}
              onClick={() => setActiveCat(activeCat === cat.key ? '' : cat.key)}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
              <div className="text-sm">{cat.label}</div>
              {count > 0 && (
                <div className="text-sm text-primary text-bold">{count}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 消息列表 */}
      <div className="card" style={{ margin: '0 12px', padding: 0 }}>
        {filtered.length === 0 ? <Empty text="暂无消息" /> : (
          filtered.map((msg) => (
            <div className="list-item" key={msg.id} onClick={() => handleItemClick(msg)}>
              <div className="icon">
                {MSG_CATEGORIES.find((c) => c.key === msg.type)?.icon || '📩'}
              </div>
              <div className="body">
                <div className="title">
                  {msg.title}
                  {!msg.read && (
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--primary)', marginLeft: 6, verticalAlign: 'middle',
                    }} />
                  )}
                </div>
                <div className="desc ellipsis">{msg.content}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 40 }}>
                <div className="text-sm text-muted">{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Page>
  );
}
