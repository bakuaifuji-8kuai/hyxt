import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card } from 'antd-mobile';
import { ArrowLeftOutlined, ScanOutlined } from '@ant-design/icons';
import { fetchList } from '../../services/store';
import '../mobile.css';

interface VerifyRecord {
  id: number;
  shop: string;
  couponCode: string;
  member: string;
  verifyTime: string;
  status: string;
}

export default function MobileVerifyRecord() {
  const [records, setRecords] = useState<VerifyRecord[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    const result = fetchList('bapp/coupon-verify', { pageSize: 100 });
    setRecords(result.list);
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      verified: { label: '已核销', className: 'mobile-tag-success' },
      revoked: { label: '已撤销', className: 'mobile-tag-error' },
      pending: { label: '待核销', className: 'mobile-tag-warning' },
    };
    const item = map[status] || { label: status, className: 'mobile-tag-info' };
    return <span className={`mobile-tag ${item.className}`}>{item.label}</span>;
  };

  const filteredRecords = records.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  return (
    <div>
      {/* 头部 */}
      <div className="mobile-detail-header">
        <ArrowLeftOutlined className="mobile-detail-back" onClick={() => navigate(-1)} />
        <div className="mobile-detail-title">核销记录</div>
      </div>

      {/* 筛选 */}
      <Tabs
        style={{ '--title-font-size': '14px' } as any}
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab title="已核销" key="verified" />
        <Tabs.Tab title="已撤销" key="revoked" />
      </Tabs>

      {/* 记录列表 */}
      <div className="mobile-card" style={{ marginTop: 0 }}>
        {filteredRecords.length === 0 ? (
          <div className="mobile-empty">
            <div className="mobile-empty-icon">📭</div>
            <div>暂无记录</div>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="mobile-list-item">
              <div className="mobile-list-icon" style={{ background: '#f0f5ff', color: '#1677ff' }}>
                <ScanOutlined />
              </div>
              <div className="mobile-list-content">
                <div className="mobile-list-title">{record.couponCode}</div>
                <div className="mobile-list-desc">
                  {record.member} · {record.shop}
                </div>
              </div>
              <div className="mobile-list-extra">
                {getStatusTag(record.status)}
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  {record.verifyTime}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}