import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Dialog, Toast, Card } from 'antd-mobile';
import { ScanOutlined, HistoryOutlined } from '@ant-design/icons';
import { fetchList, createItem } from '../../services/store';
import '../mobile.css';

interface VerifyRecord {
  id: number;
  shop: string;
  couponCode: string;
  member: string;
  verifyTime: string;
  status: string;
}

export default function MobileVerify() {
  const [code, setCode] = useState('');
  const [records, setRecords] = useState<VerifyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const result = fetchList('bapp/coupon-verify', { pageSize: 5 });
    setRecords(result.list);
  };

  const handleScan = () => {
    // H5 扫码需要 HTTPS 环境，这里模拟扫码
    Dialog.confirm({
      content: '请在实际环境中调用相机扫码，当前为演示模式',
      confirmText: '模拟扫码',
      onConfirm: () => {
        setCode('CP' + Date.now().toString().slice(-10));
      },
    });
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      Toast.show({ content: '请输入券码', icon: 'fail' });
      return;
    }

    setLoading(true);
    try {
      // 模拟核销
      await new Promise((r) => setTimeout(r, 500));

      // 创建核销记录
      createItem('bapp/coupon-verify', {
        shop: '当前门店',
        couponCode: code,
        member: '模拟会员',
        verifyTime: new Date().toLocaleString(),
        status: 'verified',
      });

      Dialog.alert({
        content: (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>核销成功</div>
            <div style={{ fontSize: 14, color: '#666' }}>
              <div>券码：{code}</div>
              <div>优惠金额：¥50</div>
              <div>会员：模拟会员</div>
            </div>
          </div>
        ),
        confirmText: '确定',
      });

      setCode('');
      loadRecords();
    } catch (err) {
      Toast.show({ content: '核销失败', icon: 'fail' });
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      {/* 头部 */}
      <div className="mobile-header">
        <div className="mobile-header-title">核销中心</div>
      </div>

      {/* 扫码区域 */}
      <div className="mobile-verify-scan">
        <Button
          style={{
            width: '80%',
            height: 56,
            borderRadius: 28,
            fontSize: 18,
            fontWeight: 500,
          }}
          color="primary"
          size="large"
          onClick={handleScan}
        >
          <ScanOutlined style={{ marginRight: 8 }} /> 扫码核销
        </Button>

        <div className="mobile-verify-input">
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8, textAlign: 'center' }}>
            或手动输入券码
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Input
              placeholder="请输入券码"
              value={code}
              onChange={setCode}
              style={{ flex: 1, '--font-size': '16px' } as any}
            />
            <Button
              color="primary"
              loading={loading}
              onClick={handleVerify}
              style={{ whiteSpace: 'nowrap' }}
            >
              核销
            </Button>
          </div>
        </div>
      </div>

      {/* 核销记录 */}
      <div className="mobile-card mobile-verify-records">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mobile-card-title" style={{ margin: 0 }}>最近核销</span>
          <span
            style={{ fontSize: 12, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => navigate('/mobile/verify-record')}
          >
            <HistoryOutlined /> 查看全部
          </span>
        </div>

        {records.length === 0 ? (
          <div className="mobile-empty">
            <div className="mobile-empty-icon">📭</div>
            <div>暂无核销记录</div>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            {records.map((record) => (
              <div key={record.id} className="mobile-list-item" style={{ padding: '12px 0' }}>
                <div className="mobile-list-icon" style={{ background: '#f0f5ff', color: '#1677ff' }}>
                  <ScanOutlined />
                </div>
                <div className="mobile-list-content">
                  <div className="mobile-list-title">{record.couponCode}</div>
                  <div className="mobile-list-desc">{record.member}</div>
                </div>
                <div className="mobile-list-extra">
                  {getStatusTag(record.status)}
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{record.verifyTime}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}