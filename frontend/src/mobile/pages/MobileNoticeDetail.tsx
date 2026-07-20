import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd-mobile';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fetchOne, updateItem } from '../../services/store';
import '../mobile.css';

interface Notice {
  id: number;
  title: string;
  type: string;
  content: string;
  sendTime: string;
  readStatus: string;
}

export default function MobileNoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const data = fetchOne('bapp/shop-notice', Number(id));
      setNotice(data);

      // 标记已读
      if (data && data.readStatus === 'unread') {
        updateItem('bapp/shop-notice', Number(id), { readStatus: 'read' });
      }
    }
  }, [id]);

  if (!notice) {
    return (
      <div className="mobile-empty" style={{ paddingTop: 100 }}>
        <div>通知不存在</div>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      activity: '活动通知',
      system: '系统通知',
      contract: '合同提醒',
    };
    return map[type] || '通知';
  };

  return (
    <div>
      {/* 头部 */}
      <div className="mobile-detail-header">
        <ArrowLeftOutlined className="mobile-detail-back" onClick={() => navigate(-1)} />
        <div className="mobile-detail-title">通知详情</div>
      </div>

      {/* 内容 */}
      <div className="mobile-detail-content">
        <div style={{ marginBottom: 16 }}>
          <span className={`mobile-tag ${notice.type === 'activity' ? 'mobile-tag-info' : notice.type === 'system' ? 'mobile-tag-success' : 'mobile-tag-warning'}`}>
            {getTypeLabel(notice.type)}
          </span>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{notice.title}</h2>

        <div style={{ fontSize: 12, color: '#999', marginBottom: 24 }}>
          发布时间：{notice.sendTime}
        </div>

        <div style={{ fontSize: 15, color: '#333', lineHeight: 1.8 }}>
          {notice.content}

          <p style={{ marginTop: 16 }}>
            感谢您对恒伟商业会员平台的支持，如有任何问题，请随时联系我们。
          </p>
        </div>
      </div>
    </div>
  );
}