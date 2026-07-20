import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, NavBar, Empty, Loading, useFetch, formatNumber } from '../components/common';
import { pointsApi } from '../services/api';

type FilterKey = 'all' | 'income' | 'expense';

export default function PointsLogsPage() {
  const navigate = useNavigate();
  const { data: initialData, loading, error, reload } = useFetch<any>(() => pointsApi.logs({ page: 1, pageSize: 20 }));
  const [filter, setFilter] = useState<FilterKey>('all');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (initialData) {
      setList(initialData.list || []);
      setTotal(initialData.total || 0);
    }
  }, [initialData]);

  const loadMore = useCallback(async () => {
    if (loadingMore || list.length >= total) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await pointsApi.logs({ page: next, pageSize: 20 });
      setList(prev => [...prev, ...(res.list || [])]);
      setPage(next);
      setTotal(res.total || 0);
    } catch {}
    setLoadingMore(false);
  }, [loadingMore, page, list.length, total]);

  // 滚动加载
  useEffect(() => {
    const container = document.querySelector('.app-container');
    if (!container) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container as HTMLElement;
      if (scrollHeight - scrollTop - clientHeight < 100) loadMore();
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [loadMore]);

  const filteredList = list.filter((item: any) => {
    if (filter === 'all') return true;
    if (filter === 'income') return item.points > 0;
    if (filter === 'expense') return item.points < 0;
    return true;
  });

  const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'income', label: '收入' },
    { key: 'expense', label: '支出' },
  ];

  const balance = initialData?.list?.[0]?.balance ?? 0;

  return (
    <Page>
      <NavBar title="积分明细" />
      {/* 顶部积分余额 */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>当前积分余额</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
          {formatNumber(balance)}
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/photo-points')}>
          赚积分
        </button>
      </div>

      {/* 篩选 Tab */}
      <div className="tabs">
        {tabs.map(t => (
          <span
            key={t.key}
            className={`tab-item ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </span>
        ))}
      </div>

      {loading && <Loading />}
      {error && <Empty text="加载失败" />}
      {!loading && !error && filteredList.length === 0 && <Empty text="暂无积分记录" />}
      {!loading && !error && filteredList.map((item: any) => {
        const isIncome = item.points > 0;
        return (
          <div className="list-item" key={item.id}>
            <div className="icon" style={{
              background: isIncome ? '#e6f7ed' : 'var(--primary-light)',
              color: isIncome ? '#2e8b57' : 'var(--primary)',
            }}>
              {isIncome ? '↑' : '↓'}
            </div>
            <div className="body">
              <div className="title">{item.type || item.remark}</div>
              <div className="desc">{item.remark} · {item.createdAt}</div>
            </div>
            <div style={{
              fontWeight: 600,
              fontSize: 14,
              color: isIncome ? '#2e8b57' : 'var(--primary)',
              textAlign: 'right',
            }}>
              {isIncome ? `+${item.points}` : `${item.points}`}
            </div>
          </div>
        );
      })}
      {!loading && !error && list.length < total && (
        <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
          {loadingMore ? '加载中...' : '下拉加载更多'}
        </div>
      )}
    </Page>
  );
}
