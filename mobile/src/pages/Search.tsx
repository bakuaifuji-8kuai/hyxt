import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { Page, Empty, Loading, Img } from '../components/common';
import { merchantApi, mallApi, activityApi, couponApi } from '../services/api';

const HOT_WORDS = ['海底捞', '星巴克', '停车券', '签到'];
const TAB_LIST = ['商户', '商品', '活动', '优惠券'];

const HISTORY_KEY = 'search_history';

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(word: string) {
  const list = getHistory().filter((w) => w !== word);
  list.unshift(word);
  if (list.length > 10) list.length = 10;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export default function SearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState<string[]>(getHistory());

  const [merchants, setMerchants] = useState<any[]>([]);
  const [goods, setGoods] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const kw = keyword.trim();
    if (!kw) return;
    saveHistory(kw);
    setHistory(getHistory());
    setSubmitted(true);
    doSearch(kw);
  };

  const doSearch = async (kw: string) => {
    setLoading(true);
    try {
      const [m, g, a, c] = await Promise.all([
        merchantApi.list({ keyword: kw }),
        mallApi.goods({ keyword: kw }),
        activityApi.all(),
        couponApi.available(),
      ]);
      setMerchants((m as any[]) || []);
      setGoods(((g as any)?.list || g as any[]) || []);
      setActivities(((a as any)?.list || a as any[]) || []);
      setCoupons((c as any[]) || []);
    } catch {
      Toast.show({ icon: 'fail', content: '搜索失败' });
    } finally {
      setLoading(false);
    }
  };

  const clearHist = async () => {
    const ok = await Dialog.confirm({ content: '确定清空搜索历史？' });
    if (ok) {
      clearHistory();
      setHistory([]);
    }
  };

  const tapHot = (w: string) => {
    setKeyword(w);
    setSubmitted(true);
    saveHistory(w);
    setHistory(getHistory());
    doSearch(w);
  };

  const filteredResults = () => {
    const kw = keyword.trim().toLowerCase();
    if (tab === 0) return merchants;
    if (tab === 1) return goods;
    if (tab === 2) return activities.filter((a: any) => a.title?.toLowerCase().includes(kw) || a.name?.toLowerCase().includes(kw));
    if (tab === 3) return coupons.filter((c: any) => c.name?.toLowerCase().includes(kw) || c.title?.toLowerCase().includes(kw));
    return [];
  };

  return (
    <Page>
      {/* 搜索框 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: '#fff' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            className="input"
            placeholder="搜索商户/商品/活动/优惠券"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ paddingLeft: 28, paddingRight: 8 }}
          />
          <span style={{ position: 'absolute', left: 8, top: 9, fontSize: 16, color: '#8c8c8c' }}>🔍</span>
        </div>
        <span
          style={{ marginLeft: 12, fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          onClick={() => { if (submitted) { setSubmitted(false); setKeyword(''); } else navigate(-1); }}
        >
          取消
        </span>
      </div>

      {!submitted ? (
        /* 未输入状态 */
        <div style={{ padding: 16 }}>
          <div className="section-title">热门搜索</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {HOT_WORDS.map((w) => (
              <span key={w} className="tag" style={{ cursor: 'pointer', padding: '4px 12px' }} onClick={() => tapHot(w)}>{w}</span>
            ))}
          </div>

          {history.length > 0 && (
            <>
              <div className="section-title">
                历史搜索
                <span className="more" style={{ cursor: 'pointer' }} onClick={clearHist}>清空</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {history.map((w) => (
                  <span key={w} className="tag tag-gray" style={{ cursor: 'pointer', padding: '4px 12px' }} onClick={() => tapHot(w)}>{w}</span>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* 搜索结果 */
        <>
          <div className="tabs">
            {TAB_LIST.map((t, i) => (
              <span key={t} className={`tab-item ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</span>
            ))}
          </div>

          {loading ? <Loading /> : (
            <>
              {filteredResults().length === 0 ? <Empty text="暂无搜索结果" /> : (
                <div style={{ padding: '8px 0' }}>
                  {/* 商户 Tab */}
                  {tab === 0 && filteredResults().map((m: any) => (
                    <div className="list-item" key={m.id} onClick={() => navigate(`/merchants/${m.id}`)}>
                      <div className="icon">{m.logo ? <Img src={m.logo} alt={m.name} style={{ width: 36, height: 36, borderRadius: 8 }} /> : (m.name?.[0] || '商')}</div>
                      <div className="body">
                        <div className="title">{m.name}</div>
                        <div className="desc">
                          {m.category && <span className="tag tag-gray" style={{ marginRight: 4 }}>{m.category}</span>}
                          {m.floor && <span>{m.floor}</span>}
                        </div>
                      </div>
                      <span className="arrow">›</span>
                    </div>
                  ))}

                  {/* 商品 Tab */}
                  {tab === 1 && (
                    <div className="goods-grid">
                      {filteredResults().map((g: any) => (
                        <div className="goods-card" key={g.id} onClick={() => navigate(`/mall/goods/${g.id}`)}>
                          <Img src={g.image || g.cover} alt={g.name} className="img-placeholder" />
                          <div className="info">
                            <div className="name ellipsis-2">{g.name}</div>
                            <div className="price"><small>¥</small>{g.price ? (g.price / 100).toFixed(0) : '—'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 活动 Tab */}
                  {tab === 2 && filteredResults().map((a: any) => (
                    <div className="list-item" key={a.id} onClick={() => navigate(`/activity/${a.id}`)}>
                      <div className="icon">🎉</div>
                      <div className="body">
                        <div className="title">{a.title || a.name}</div>
                        <div className="desc">{a.type || '活动'}</div>
                      </div>
                      <span className="arrow">›</span>
                    </div>
                  ))}

                  {/* 优惠券 Tab */}
                  {tab === 3 && filteredResults().map((c: any) => (
                    <div className="coupon-card" key={c.id || c.templateId}>
                      <div className="left">
                        <div className="amount"><small>¥</small>{c.amount ? (c.amount / 100).toFixed(0) : c.value || '—'}</div>
                        <div className="threshold">{c.threshold ? `满${(c.threshold / 100).toFixed(0)}可用` : '无门槛'}</div>
                      </div>
                      <div className="right">
                        <div className="name">{c.name || c.title}</div>
                        <div className="scope">{c.scope || '全场通用'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </Page>
  );
}
