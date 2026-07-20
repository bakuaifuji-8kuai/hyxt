import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, Toast } from 'antd-mobile';
import { activityApi, promoApi } from '../services/api';
import { Page, NavBar, Loading, Empty, useFetch, Img, formatNumber } from '../components/common';

const TYPE_EMOJI: Record<string, string> = {
  wheel: '🎡',
  slot: '🎰',
  redpacket: '🧧',
  grid: '🎲',
};

const TYPE_NAME: Record<string, string> = {
  wheel: '大转盘',
  slot: '老虎机',
  redpacket: '抢红包',
  grid: '九宫格',
};

const mockHistory = [
  { time: '2024-01-15 10:23', prize: '20 积分' },
  { time: '2024-01-14 18:05', prize: '谢谢参与' },
  { time: '2024-01-13 09:12', prize: '停车券' },
];

export default function GameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => activityApi.all() as Promise<any>, []);
  const [playing, setPlaying] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const allData = data as any;

  const games: any[] = allData?.games ?? [];
  const game = games.find((g: any) => String(g.id) === id) ?? games[0];

  const handlePlay = useCallback(async () => {
    if (playing || spinning) return;
    setSpinning(true);
    setPlaying(true);

    // mock 旋转动画 2 秒
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const res: any = await promoApi.gamePlay(game?.id ?? id ?? 0);
      setSpinning(false);
      setPlaying(false);
      const prize = res?.prize;
      if (prize) {
        Dialog.alert({
          title: '🎉 恭喜中奖',
          content: (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, margin: '12px 0' }}>
                {TYPE_EMOJI[game?.type] ?? '🎁'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{prize.name}</div>
              <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
                奖品价值：{prize.value}
              </div>
              {res?.pointsCost > 0 && (
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                  消耗积分：{res.pointsCost}
                </div>
              )}
            </div>
          ),
          confirmText: '再来一次',
          onConfirm: () => { handlePlay(); },
        });
      } else {
        Dialog.alert({
          title: '很遗憾',
          content: '本次未中奖，再试试吧！',
          confirmText: '再来一次',
          onConfirm: () => { handlePlay(); },
        });
      }
      reload();
    } catch (e: any) {
      setSpinning(false);
      setPlaying(false);
      Toast.show(e?.message || '游戏失败');
    }
  }, [game, id, playing, spinning, reload]);

  if (loading) return <Page><NavBar title="互动游戏" /><Loading /></Page>;
  if (error) return <Page><NavBar title="互动游戏" /><Empty text="加载失败" /></Page>;
  if (!game) return <Page><NavBar title="互动游戏" /><Empty text="游戏不存在" /></Page>;

  const gameType = game.type ?? 'wheel';
  const emoji = TYPE_EMOJI[gameType] ?? '🎮';
  const typeName = TYPE_NAME[gameType] ?? '互动游戏';
  const rewards: any[] = game.rewards ?? [];
  const pointsCost = game.pointsCost ?? 50;
  const plays = game.plays ?? 0;

  return (
    <Page>
      <NavBar title="互动游戏" />

      {/* 顶部游戏信息 */}
      <div className="card" style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{game.name ?? typeName}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          已参与 {formatNumber(plays)} 次
        </div>
      </div>

      {/* 游戏说明 */}
      <div className="card">
        <div className="card-title">玩法说明</div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <div>游戏类型：{typeName}</div>
          <div style={{ marginTop: 4 }}>每次消耗 <span className="text-primary text-bold">{pointsCost} 积分</span></div>
        </div>
        {rewards.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>奖品列表</div>
            {rewards.map((r: any, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '0.5px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <span>{r.name ?? r}</span>
                {r.probability && <span style={{ color: 'var(--text-secondary)' }}>概率 {r.probability}%</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 游戏区域 - 简化版 */}
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        {gameType === 'wheel' && (
          <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 16px' }}>
            <svg viewBox="0 0 200 200" width={200} height={200}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const startAngle = (i * 45 - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * 45 - 90) * (Math.PI / 180);
                const x1 = 100 + 90 * Math.cos(startAngle);
                const y1 = 100 + 90 * Math.sin(startAngle);
                const x2 = 100 + 90 * Math.cos(endAngle);
                const y2 = 100 + 90 * Math.sin(endAngle);
                const largeArc = 0;
                const colors = ['#e63946', '#ffd700', '#e63946', '#ffd700', '#e63946', '#ffd700', '#e63946', '#ffd700'];
                const labels = rewards.length > 0
                  ? rewards.slice(0, 8).map((r: any) => r.name ?? '奖品')
                  : ['积分', '券', '积分', '谢谢', '积分', '券', '积分', '谢谢'];
                const midAngle = ((i + 0.5) * 45 - 90) * (Math.PI / 180);
                const tx = 100 + 55 * Math.cos(midAngle);
                const ty = 100 + 55 * Math.sin(midAngle);
                return (
                  <g key={i} style={{ transition: 'transform 2s', transform: spinning ? `rotate(${720}deg)` : 'none', transformOrigin: '100px 100px' }}>
                    <path
                      d={`M100,100 L${x1},${y1} A90,90 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={colors[i]}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={10}>
                      {(labels[i] ?? '').slice(0, 3)}
                    </text>
                  </g>
                );
              })}
              <circle cx={100} cy={100} r={22} fill="#fff" stroke="#e63946" strokeWidth={2} />
            </svg>
          </div>
        )}

        {gameType === 'slot' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 56, height: 56, borderRadius: 8, background: '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, border: '2px solid var(--border)',
                }}
              >
                {spinning ? '🎲' : ['7️⃣', '🍒', '⭐'][i]}
              </div>
            ))}
          </div>
        )}

        {gameType === 'redpacket' && (
          <div style={{ fontSize: 80, marginBottom: 16, animation: spinning ? 'none' : 'none' }}>
            🧧
          </div>
        )}

        {gameType === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, maxWidth: 180, margin: '0 auto 16px' }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1', borderRadius: 8, background: i === 4 ? 'var(--primary)' : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: i === 4 ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {i === 4 ? 'GO' : (rewards[i]?.name ?? '🎁').slice(0, 2)}
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          style={{ maxWidth: 200, margin: '0 auto', fontSize: 16, padding: 12 }}
          disabled={playing}
          onClick={handlePlay}
        >
          {spinning ? '抽奖中...' : '点击抽奖'}
        </button>
      </div>

      {/* 游戏记录 */}
      <div className="section">
        <div className="section-title">
          <span>我的游戏记录</span>
          <span className="more">查看全部 ›</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          {mockHistory.map((record, i) => (
            <div key={i} className="list-item">
              <span className="icon">🎰</span>
              <span className="body">
                <span className="title">{record.prize}</span>
                <span className="desc">{record.time}</span>
              </span>
              <span className="tag" style={{ background: record.prize === '谢谢参与' ? '#f0f0f0' : undefined, color: record.prize === '谢谢参与' ? 'var(--text-secondary)' : undefined }}>
                {record.prize === '谢谢参与' ? '未中奖' : '已中奖'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
