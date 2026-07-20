import React, { useState } from 'react';
import { Toast, Dialog } from 'antd-mobile';
import { Page, NavBar, Empty, Loading, useFetch, fen2yuan } from '../components/common';
import { rentalApi } from '../services/api';

const ITEM_EMOJI: Record<string, string> = {
  婴儿车: '🚼',
  雨伞: '☂️',
  充电宝: '🔋',
  轮椅: '♿',
};

function getEmoji(name: string) {
  if (!name) return '📦';
  for (const k of Object.keys(ITEM_EMOJI)) {
    if (name.includes(k)) return ITEM_EMOJI[k];
  }
  return '📦';
}

type TabKey = 'items' | 'mine';

export default function RentalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('items');
  const { data: items, loading: itemsLoading, reload: reloadItems } = useFetch<any[]>(
    () => rentalApi.items() as Promise<any[]>,
    [],
    activeTab === 'items',
  );
  const { data: records, loading: recordsLoading, reload: reloadRecords } = useFetch<any[]>(
    () => rentalApi.records() as Promise<any[]>,
    [],
    activeTab === 'mine',
  );
  const [applying, setApplying] = useState<number | string | null>(null);
  const [returning, setReturning] = useState<number | string | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'items', label: '可租物品' },
    { key: 'mine', label: '我的租借' },
  ];

  const handleApply = async (item: any) => {
    if ((item.stock || 0) <= 0) {
      Toast.show('暂无库存');
      return;
    }
    try {
      setApplying(item.id);
      const res: any = await rentalApi.apply(item.id);
      const deposit = res?.deposit ?? item.deposit;
      await Dialog.alert({
        title: '申请成功',
        content: `请到服务台领取物品，押金 ¥${fen2yuan(deposit)} 将在归还后原路退回。`,
      });
      reloadItems();
      setActiveTab('mine');
      reloadRecords();
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setApplying(null);
    }
  };

  const handleReturn = async (recordId: number | string) => {
    const ok = await Dialog.confirm({ content: '确认归还该物品？' });
    if (!ok) return;
    try {
      setReturning(recordId);
      await rentalApi.return(recordId);
      Toast.show({ icon: 'success', content: '已归还，押金已原路退回' });
      reloadRecords();
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setReturning(null);
    }
  };

  return (
    <Page>
      <NavBar title="物品租借" />

      {/* 顶部说明卡片 */}
      <div
        style={{
          margin: '0 12px 12px',
          borderRadius: 12,
          padding: 16,
          background: 'linear-gradient(135deg, #e63946, #c81d2a)',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>🔧 便民物品租借</div>
        <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>
          提供婴儿车、雨伞、充电宝、轮椅等便民物品。
          <br />
          押金可退，归还后原路返回。
        </div>
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

      {/* 可租物品 */}
      {activeTab === 'items' && (
        <>
          {itemsLoading && <Loading />}
          {!itemsLoading && (!items || items.length === 0) && <Empty text="暂无可租物品" />}
          {!itemsLoading && items && items.length > 0 && (
            <div className="goods-grid" style={{ marginTop: 8 }}>
              {items.map((it: any, i: number) => {
                const noStock = (it.stock || 0) <= 0;
                const statusOffline = it.status && it.status !== 'available' && it.status !== 'normal';
                return (
                  <div
                    key={it.id || i}
                    className="goods-card"
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: 1,
                        background: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 56,
                      }}
                    >
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        getEmoji(it.name)
                      )}
                    </div>
                    <div className="info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div className="name text-bold" style={{ height: 'auto' }}>
                        {it.name}
                      </div>
                      {it.description && (
                        <div
                          className="text-sm text-muted ellipsis-2"
                          style={{ margin: '2px 0 6px' }}
                        >
                          {it.description}
                        </div>
                      )}
                      <div className="flex-between text-sm" style={{ marginTop: 'auto' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          押金 ¥{fen2yuan(it.deposit)}
                        </span>
                        <span className="text-muted">租金 ¥{fen2yuan(it.rent)}/天</span>
                      </div>
                      <div className="text-sm text-muted mt-8 flex-between">
                        <span>库存 {it.stock ?? 0}</span>
                      </div>
                      <button
                        className={`btn btn-sm ${noStock || statusOffline ? '' : 'btn-primary'}`}
                        disabled={noStock || statusOffline || applying === it.id}
                        onClick={() => handleApply(it)}
                        style={{ marginTop: 8, width: '100%' }}
                      >
                        {noStock || statusOffline
                          ? '暂无库存'
                          : applying === it.id
                          ? '申请中…'
                          : '申请租借'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 我的租借 */}
      {activeTab === 'mine' && (
        <>
          {recordsLoading && <Loading />}
          {!recordsLoading && (!records || records.length === 0) && <Empty text="暂无租借记录" />}
          {!recordsLoading && records && records.length > 0 && (
            <div className="section" style={{ marginTop: 8 }}>
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                {records.map((r: any, i: number) => {
                  const isRenting = (r.status || '') === 'renting';
                  const item = r.item || {};
                  return (
                    <div
                      className="list-item"
                      key={r.id || i}
                      style={{ alignItems: 'flex-start' }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          background: 'var(--primary-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                          marginRight: 10,
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          getEmoji(item.name || '')
                        )}
                      </div>
                      <div className="body">
                        <div className="flex-between">
                          <span className="title">{item.name || '物品'}</span>
                          {isRenting ? (
                            <span className="tag tag-green">使用中</span>
                          ) : (
                            <span className="tag tag-gray">已归还</span>
                          )}
                        </div>
                        <div className="desc">租借：{r.outTime || '-'}</div>
                        <div className="desc">归还：{r.returnTime || (isRenting ? '使用中' : '-')}</div>
                        <div className="desc">押金 ¥{fen2yuan(r.deposit || item.deposit)}</div>
                      </div>
                      {isRenting && (
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={returning === r.id}
                          onClick={() => handleReturn(r.id)}
                        >
                          {returning === r.id ? '处理中…' : '归还'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Page>
  );
}
