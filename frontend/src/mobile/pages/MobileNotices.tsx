import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { fetchList } from '../../services/store';
import '../mobile.css';

interface Notice {
  id: number;
  title: string;
  type: string;
  content: string;
  sendTime: string;
  readStatus: string;
}

export default function MobileNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const result = fetchList('bapp/shop-notice', { pageSize: 50 });
    setNotices(result.list);
  };

  const getTypeIcon = (type: string) => {
    const map: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
      activity: { icon: <TeamOutlined />, bg: '#e6f7ff', color: '#1677ff' },
      system: { icon: <SafetyCertificateOutlined />, bg: '#f6ffed', color: '#52c41a' },
      contract: { icon: <BellOutlined />, bg: '#fffbe6', color: '#faad14' },
    };
    return map[type] || { icon: <BellOutlined />, bg: '#f0f0f0', color: '#666' };
  };

  const unreadCount = notices.filter((n) => n.readStatus === 'unread').length;

  return (
    <div>
      {/* 头部 */}
      <div className="mobile-header">
        <div className="mobile-header-title">消息通知</div>
        <div className="mobile-header-subtitle">
          {unreadCount > 0 ? `有 ${unreadCount} 条未读消息` : '暂无未读消息'}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="mobile-list">
        {notices.length === 0 ? (
          <div className="mobile-empty" style={{ padding: '60px 20px' }}>
            <div className="mobile-empty-icon">📭</div>
            <div>暂无消息</div>
          </div>
        ) : (
          notices.map((notice) => {
            const iconInfo = getTypeIcon(notice.type);
            return (
              <div
                key={notice.id}
                className="mobile-notice-card"
                onClick={() => navigate(`/mobile/notice/${notice.id}`)}
              >
                <div
                  className="mobile-notice-icon"
                  style={{ background: iconInfo.bg, color: iconInfo.color }}
                >
                  {iconInfo.icon}
                </div>
                <div className="mobile-notice-content">
                  <div className="mobile-notice-title">{notice.title}</div>
                  <div className="mobile-notice-time">{notice.sendTime}</div>
                </div>
                {notice.readStatus === 'unread' && <div className="mobile-notice-dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}