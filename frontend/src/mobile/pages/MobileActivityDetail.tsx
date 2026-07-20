import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Dialog, Toast } from 'antd-mobile';
import { ArrowLeftOutlined, ThunderboltOutlined, TeamOutlined } from '@ant-design/icons';
import { fetchOne, updateItem } from '../../services/store';
import '../mobile.css';

interface Activity {
  id: number;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
  budget?: number;
}

export default function MobileActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [signedUp, setSignedUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const data = fetchOne('marketing/campaigns', Number(id));
      setActivity(data);
    }
  }, [id]);

  const handleSignUp = () => {
    Dialog.confirm({
      content: `确认报名参加「${activity?.name}」活动？`,
      confirmText: '确认报名',
      onConfirm: () => {
        Toast.show({ content: '报名成功', icon: 'success' });
        setSignedUp(true);
      },
    });
  };

  if (!activity) {
    return (
      <div className="mobile-empty" style={{ paddingTop: 100 }}>
        <div>活动不存在</div>
      </div>
    );
  }

  return (
    <div>
      {/* 头部 */}
      <div className="mobile-detail-header">
        <ArrowLeftOutlined className="mobile-detail-back" onClick={() => navigate(-1)} />
        <div className="mobile-detail-title">活动详情</div>
      </div>

      {/* 封面 */}
      <div
        style={{
          height: 200,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <ThunderboltOutlined style={{ fontSize: 64 }} />
      </div>

      {/* 活动信息 */}
      <div className="mobile-card">
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{activity.name}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>活动类型</div>
            <div style={{ fontSize: 14, color: '#333', marginTop: 4 }}>
              {activity.type === 'promotion' ? '促销活动' : activity.type === 'groupbuy' ? '团购活动' : '其他活动'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>活动预算</div>
            <div style={{ fontSize: 14, color: '#333', marginTop: 4 }}>
              ¥{(activity.budget || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: 12, color: '#999' }}>活动时间</div>
            <div style={{ fontSize: 14, color: '#333', marginTop: 4 }}>
              {activity.startTime} 至 {activity.endTime}
            </div>
          </div>
        </div>

        {/* 活动介绍 */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>活动介绍</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
            {activity.name}是恒伟商业会员平台推出的大型营销活动，旨在通过优惠促销吸引更多消费者，
            提升商场整体销售业绩。欢迎各入驻商户积极报名参加。
          </div>
        </div>

        {/* 参与商户 */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
            <TeamOutlined style={{ marginRight: 8 }} />已报名商户
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="mobile-tag mobile-tag-info">海底捞</span>
            <span className="mobile-tag mobile-tag-info">星巴克</span>
            <span className="mobile-tag mobile-tag-info">优衣库</span>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div style={{ padding: '16px', background: '#fff', position: 'fixed', bottom: 50, left: 0, right: 0 }}>
        <Button
          block
          color="primary"
          size="large"
          disabled={signedUp || activity.status !== 'enabled'}
          onClick={handleSignUp}
          style={{ borderRadius: 24 }}
        >
          {signedUp ? '已报名' : activity.status !== 'enabled' ? '活动已结束' : '我要报名'}
        </Button>
      </div>
    </div>
  );
}