import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpinLoading } from 'antd-mobile';

/** 桌面端手机壳 + 移动端全屏自适应 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="desktop-shell">
      <div className="phone-frame">
        <div className="phone-screen">{children}</div>
      </div>
      <div className="phone-hint">
        恒伟商业 · C端小程序预览<br />
        参照龙湖天街交互范式<br />
        数据与后台管理互通
      </div>
    </div>
  );
}

/** 通用页面容器（带可选底部 padding） */
export function Page({ children, hasTabBar = false, className = '' }: { children: React.ReactNode; hasTabBar?: boolean; className?: string }) {
  return (
    <div className={`app-container ${hasTabBar ? 'has-tabbar' : ''}`}>
      <div className={`page ${className}`}>{children}</div>
    </div>
  );
}

/** 顶部导航栏（非 Tab 页用） */
export function NavBar({ title, right, onBack }: { title: string; right?: React.ReactNode; onBack?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="navbar">
      <span className="back" onClick={() => (onBack ? onBack() : navigate(-1))}>‹</span>
      <span className="title">{title}</span>
      <span className="right">{right}</span>
    </div>
  );
}

/** 空状态 */
export function Empty({ text = '暂无数据' }: { text?: string }) {
  return (
    <div className="empty">
      <div className="empty-icon">🗑️</div>
      <div>{text}</div>
    </div>
  );
}

/** 加载中 */
export function Loading({ text = '加载中' }: { text?: string }) {
  return (
    <div className="empty">
      <SpinLoading style={{ '--size': '36px' }} />
      <div style={{ marginTop: 8 }}>{text}</div>
    </div>
  );
}

/** 数据加载 hook */
export function useFetch<T>(fn: () => Promise<T>, deps: any[] = [], ready: boolean = true): { data: T | null; loading: boolean; error: any; reload: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    fn()
      .then((d) => !cancelled && (setData(d), setError(null)))
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, ready]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}

/** 图片占位（用 picsum 生成，避免外链失败） */
export function Img({ src, alt = '', style, className, onClick }: { src?: string; alt?: string; style?: React.CSSProperties; className?: string; onClick?: () => void }) {
  const fallback = `https://picsum.photos/seed/${(src || alt || 'img').length}-${alt.length}/400/300`;
  const [err, setErr] = useState(false);
  return (
    <img
      src={!src || err ? fallback : src}
      alt={alt}
      style={style}
      className={className}
      onClick={onClick}
      onError={() => setErr(true)}
    />
  );
}

/** 金额分→元 */
export function fen2yuan(fen: number | string) {
  const n = Number(fen) || 0;
  return (n / 100).toFixed(2);
}

/** 简单数字千分位 */
export function formatNumber(n: number) {
  return n.toLocaleString('zh-CN');
}
