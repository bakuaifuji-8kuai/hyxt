import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'antd-mobile';
import { ThunderboltOutlined } from '@ant-design/icons';
import { fetchList } from '../../services/store';
import '../mobile.css';

interface Activity {
  id: number;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function MobileActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const result = fetchList('marketing/campaigns', { pageSize: 20 });
    setActivities(result.list);
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      enabled: { label: '进行中', className: 'mobile-tag-success' },
      pending: { label: '未开始', className: 'mobile-tag-warning' },
      finished: { label: '已结束', className: 'mobile-tag-info' },
      disabled: { label: '已禁用', className: 'mobile-tag-error' },
    };
    const item = map[status] || { label: status, className: 'mobile-tag-info' };
    return <span className={`mobile-tag ${item.className}`}>{item.label}</span>;
  };

  return (
    <div>
      {/* 头部 */}
      <div className="mobile-header">
        <div className="mobile-header-title">营销活动</div>
        <div className="mobile-header-subtitle">查看并报名参加商场活动</div>
      </div>

      {/* 活动列表 */}
      {activities.length === 0 ? (
        <div className="mobile-empty" style={{ marginTop: 60 }}>
          <div className="mobile-empty-icon">📭</div>
          <div>暂无活动</div>
        </div>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="mobile-activity-card"
            onClick={() => navigate(`/mobile/activity/${activity.id}`)}
          >
            <div
              className="mobile-activity-cover"
              style={{
                background: activity.type === 'promotion'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : activity.type === 'groupbuy'
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 24,
              }}
            >
              <ThunderboltOutlined style={{ fontSize: 48 }} />
            </div>
            <div className="mobile-activity-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="mobile-activity-title">{activity.name}</div>
                {getStatusTag(activity.status)}
              </div>
              <div className="mobile-activity-time">
                {activity.startTime} 至 {activity.endTime}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}