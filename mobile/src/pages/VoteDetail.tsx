import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, Toast } from 'antd-mobile';
import { activityApi, promoApi } from '../services/api';
import { Page, NavBar, Loading, Empty, useFetch } from '../components/common';

export default function VoteDetailPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => activityApi.all() as Promise<any>, []);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);

  const allData = data as any;
  const votes: any[] = allData?.votes ?? [];
  const vote = votes.find((v: any) => String(v.id) === id) ?? votes[0];

  const handleVote = useCallback(async (optionId: string | number) => {
    if (voted || voting) return;
    setSelectedOption(optionId);
    setVoting(true);
    try {
      await promoApi.voteSubmit(vote?.id ?? id ?? 0, optionId);
      setVoted(true);
      Toast.show('投票成功');
      reload();
    } catch (e: any) {
      Toast.show(e?.message || '投票失败');
    } finally {
      setVoting(false);
    }
  }, [voted, voting, vote, id, reload]);

  if (loading) return <Page><NavBar title="投票活动" /><Loading /></Page>;
  if (error) return <Page><NavBar title="投票活动" /><Empty text="加载失败" /></Page>;

  const title = vote?.title ?? '天街最佳商户评选';
  const options: any[] = vote?.options ?? [
    { id: 1, text: '海底捞', votes: 256 },
    { id: 2, text: '星巴克', votes: 189 },
    { id: 3, text: '优衣库', votes: 145 },
    { id: 4, text: '小米之家', votes: 112 },
    { id: 5, text: '泡泡玛特', votes: 98 },
  ];
  const totalVotes = vote?.totalVotes ?? options.reduce((sum: number, o: any) => sum + (o.votes ?? 0), 0);
  const participants = vote?.participants ?? totalVotes;
  const reward = vote?.reward ?? '10 积分';

  return (
    <Page>
      <NavBar title="投票活动" />

      {/* 顶部信息 */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>已有 <span className="text-primary text-bold">{participants}</span> 人参与</span>
          <span>奖励：<span className="text-primary text-bold">{reward}</span></span>
        </div>
      </div>

      {/* 投票说明 */}
      <div className="card">
        <div className="card-title">投票说明</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          每人限投一票，投票后可查看实时结果。感谢您的参与！
        </div>
      </div>

      {/* 投票选项 */}
      <div className="card">
        <div className="card-title">投票选项</div>
        {options.map((opt: any, i: number) => {
          const optVotes = opt.votes ?? 0;
          const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
          const isSelected = selectedOption === opt.id;

          return (
            <div
              key={opt.id ?? i}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 8,
                background: voted
                  ? '#fff'
                  : isSelected
                    ? 'var(--primary-light)'
                    : '#f5f5f5',
                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                cursor: voted ? 'default' : 'pointer',
              }}
              onClick={() => !voted && handleVote(opt.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: voted ? 6 : 0 }}>
                <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>
                  {!voted && (isSelected ? '● ' : '○ ')}
                  {voted && isSelected && '✓ '}
                  {opt.text}
                </span>
                {voted && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {optVotes} 票 · {percent}%
                  </span>
                )}
              </div>
              {voted && (
                <div className="progress" style={{ background: '#f0f0f0' }}>
                  <div
                    className="progress-bar"
                    style={{
                      background: isSelected ? 'var(--primary)' : '#d0d0d0',
                      width: `${percent}%`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部按钮 */}
      <div className="section" style={{ marginTop: 8 }}>
        {voted ? (
          <button className="btn btn-block" disabled style={{ background: '#f0f0f0', color: 'var(--text-secondary)' }}>
            已投票 · 感谢您的参与
          </button>
        ) : (
          <button
            className="btn btn-primary btn-block"
            disabled={voting || !selectedOption}
            onClick={() => selectedOption && handleVote(selectedOption)}
          >
            {voting ? '提交中...' : '提交投票'}
          </button>
        )}
      </div>
    </Page>
  );
}
