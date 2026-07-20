import React, { useRef, useState } from 'react';
import { Toast } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, Img } from '../components/common';
import { photoPointsApi, merchantApi } from '../services/api';

type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

export default function PhotoPointsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [image, setImage] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [merchantId, setMerchantId] = useState<string>('');
  const [merchantInput, setMerchantInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: records, loading, reload } = useFetch<any[]>(() => photoPointsApi.records() as Promise<any[]>, []);
  const { data: merchants } = useFetch<any[]>(() => merchantApi.list() as Promise<any[]>, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '审核中' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已驳回' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Toast.show({ icon: 'fail', content: '图片不能超过 5MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) { Toast.show('请上传小票图片'); return; }
    const amt = Number(amount);
    if (!amt || amt <= 0) { Toast.show('请输入正确的消费金额'); return; }
    setSubmitting(true);
    try {
      await photoPointsApi.upload({
        merchantId: merchantId ? Number(merchantId) : undefined,
        amount: amt,
        image,
      });
      Toast.show({ icon: 'success', content: '提交成功，等待审核' });
      setImage('');
      setAmount('');
      setMerchantId('');
      setMerchantInput('');
      reload();
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setSubmitting(false);
    }
  };

  const filterByTab = (list: any[]) => {
    if (activeTab === 'all') return list;
    return list.filter((r) => (r.auditStatus || r.status) === activeTab);
  };

  const getStatusTag = (r: any) => {
    const s = r.auditStatus || r.status;
    if (s === 'approved') return <span className="tag tag-green">已通过</span>;
    if (s === 'rejected') return <span className="tag" style={{ background: '#ffe4e6', color: 'var(--primary)' }}>已驳回</span>;
    return <span className="tag tag-gold">审核中</span>;
  };

  const filtered = filterByTab(records || []);

  return (
    <Page>
      <NavBar title="拍照积分" />

      {/* 顶部说明卡片 - 红色渐变 */}
      <div
        style={{
          margin: '0 12px 12px',
          borderRadius: 12,
          padding: 16,
          background: 'linear-gradient(135deg, #e63946, #c81d2a)',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>📸 拍照赢积分</div>
        <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>
          拍照上传消费小票，审核通过即可获得积分。
          <br />
          每消费 1 元 = 1 积分（示例规则）
        </div>
      </div>

      {/* 上传区域 */}
      <div className="card">
        <div className="card-title">上传消费小票</div>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '1.5px dashed #d0d0d0',
            borderRadius: 10,
            padding: image ? 8 : '24px 0',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: 13,
            cursor: 'pointer',
            background: '#fafafa',
            marginBottom: 12,
          }}
        >
          {image ? (
            <img
              src={image}
              alt="小票预览"
              style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6 }}
            />
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 4 }}>📷</div>
              <div>点击上传小票图片</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>支持 JPG/PNG，单张不超过 5MB</div>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div style={{ marginBottom: 12 }}>
          <div className="text-sm text-muted mb-8">消费金额（元）</div>
          <input
            className="input"
            type="number"
            placeholder="请输入消费金额"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="text-sm text-muted mb-8">消费商户</div>
          {merchants && merchants.length > 0 ? (
            <select
              className="input"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
            >
              <option value="">请选择商户</option>
              {merchants.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input"
              placeholder="请输入商户名称"
              value={merchantInput}
              onChange={(e) => setMerchantInput(e.target.value)}
            />
          )}
        </div>

        <button
          className="btn btn-primary btn-block"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '提交中…' : '提交审核'}
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="tabs">
        {tabs.map((t) => (
          <span
            key={t.key}
            className={`tab-item ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* 审核记录列表 */}
      <div className="section">
        <div className="section-title">我的审核记录</div>
        {loading && <Loading />}
        {!loading && filtered.length === 0 && <Empty text="暂无审核记录" />}
        {!loading && filtered.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            {filtered.map((r: any, i: number) => {
              const status = r.auditStatus || r.status;
              return (
                <div className="list-item" key={r.id || i} style={{ alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#f5f5f5',
                      flexShrink: 0,
                      marginRight: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {r.receiptImage ? (
                      <Img
                        src={r.receiptImage}
                        alt="小票"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 22 }}>🧾</span>
                    )}
                  </div>
                  <div className="body">
                    <div className="flex-between">
                      <span className="title">
                        {r.merchant?.name || r.merchant || '未知商户'}
                      </span>
                      {getStatusTag(r)}
                    </div>
                    <div className="desc">
                      ¥{r.amount} · {r.submitTime}
                    </div>
                    {r.aiStatus === 'auto_approved' && (
                      <div style={{ marginTop: 4 }}>
                        <span className="tag tag-blue">⚡ AI 自动通过</span>
                      </div>
                    )}
                    {status === 'approved' && r.pointsIssued != null && (
                      <div className="text-primary text-bold text-sm" style={{ marginTop: 4 }}>
                        +{r.pointsIssued} 积分
                      </div>
                    )}
                    {status === 'rejected' && r.auditRemark && (
                      <div className="text-sm" style={{ marginTop: 4, color: 'var(--primary)' }}>
                        驳回原因：{r.auditRemark}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}
