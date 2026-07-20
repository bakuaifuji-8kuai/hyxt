import React, { useState, useCallback } from 'react';
import { Dialog, Toast } from 'antd-mobile';
import { checkinApi } from '../services/api';
import { Page, NavBar, Loading, Empty, useFetch } from '../components/common';

export default function CheckinPage() {
  const { data, loading, error, reload } = useFetch(() => checkinApi.status() as Promise<any>, []);
  const [signing, setSigning] = useState(false);

  const info = data as any;

  const handleSign = useCallback(async () => {
    if (signing) return;
    setSigning(true);
    try {
      const res: any = await checkinApi.do();
      const reward = res?.reward;
      if (reward) {
        const rewardText = reward.type === 'points'
          ? `${reward.value} 积分`
          : reward.type === 'coupon'
            ? '停车券'
            : `奖励`;
        Dialog.alert({
          title: '签到成功 🎉',
          content: `恭喜获得 ${rewardText}，已连续签到 ${res?.signedDays ?? '?'} 天`,
          confirmText: '好的',
        });
      } else {
        Toast.show('签到成功');
      }
      reload();
    } catch (e: any) {
      Toast.show(e?.message || '签到失败');
    } finally {
      setSigning(false);
    }
  }, [signing, reload]);

  const handleMakeUp = useCallback(async (day: number) => {
    const confirmed = await Dialog.confirm({
      title: '补签确认',
      content: `消耗 50 积分补签第 ${day} 天？`,
    });
    if (!confirmed) return;
    try {
      const res: any = await checkinApi.do();
      const reward = res?.reward;
      if (reward) {
        Toast.show(`补签成功，获得 ${reward.type === 'points' ? reward.value + ' 积分' : '奖励'}`);
      } else {
        Toast.show('补签成功');
      }
      reload();
    } catch (e: any) {
      Toast.show(e?.message || '补签失败');
    }
  }, [reload]);

  if (loading) return <Page><NavBar title="每日签到" /><Loading /></Page>;
  if (error) return <Page><NavBar title="每日签到" /><Empty text="加载失败" /></Page>;

  const signedToday = info?.signedToday ?? false;
  const continuousDays = info?.continuousDays ?? 0;
  const monthSigned: number[] = info?.monthSigned ?? [];
  const rewards: any[] = info?.rewards ?? [];
  const todayReward = info?.todayReward;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];

  const milestoneRewards = rewards.length > 0
    ? rewards
    : [
        { day: 3, reward: '10 积分' },
        { day: 7, reward: '停车券' },
        { day: 15, reward: '50 积分' },
        { day: 30, reward: '100 积分 + 专属券' },
      ];

  const todayRewardText = todayReward
    ? todayReward.type === 'points' ? `${todayReward.value} 积分` : '停车券'
    : '10 积分';

  return (
    <Page>
      <NavBar title="每日签到" />

      {/* 顶部签到卡片 - 红色渐变 */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #e63946 0%, #c81d2a 60%, #a01520 100%)',
          color: '#fff',
          textAlign: 'center',
          padding: 20,
          marginTop: 0,
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.85 }}>已连续签到</div>
        <div style={{ fontSize: 36, fontWeight: 700, margin: '4px 0' }}>{continuousDays}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 12 }}>天</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
          今日奖励：{todayRewardText}
        </div>
        <button
          className={signedToday ? 'btn btn-block' : 'btn btn-primary btn-block'}
          style={{
            maxWidth: 160,
            margin: '0 auto',
            borderRadius: '50%',
            width: 120,
            height: 120,
            fontSize: signedToday ? 14 : 16,
            fontWeight: 600,
            background: signedToday
              ? 'rgba(255,255,255,0.2)'
              : 'linear-gradient(135deg, #ffd700, #ffb800)',
            color: signedToday ? '#fff' : '#1a1a1a',
            border: signedToday ? '2px solid rgba(255,255,255,0.3)' : 'none',
            cursor: signedToday ? 'default' : 'pointer',
          }}
          disabled={signedToday || signing}
          onClick={handleSign}
        >
          {signedToday ? '已签到 ✓' : signing ? '签到中...' : '立即签到'}
        </button>
      </div>

      {/* 本月签到日历 */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">
          <span>本月签到</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 'normal' }}>
            {year}年{month + 1}月
          </span>
        </div>
        <div className="checkin-calendar" style={{ padding: 0 }}>
          {weekLabels.map((w) => (
            <div
              key={w}
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--text-secondary)',
                aspectRatio: 'auto',
                paddingBottom: 4,
              }}
            >
              {w}
            </div>
          ))}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isSigned = monthSigned.includes(day);
            const isToday = day === today;
            const isFuture = day > today;
            const isPastUnsigned = day < today && !isSigned;

            let cls = 'checkin-day';
            if (isSigned) cls += ' checked';
            if (isToday) cls += ' today';
            if (isFuture) cls += ' future';

            return (
              <div
                key={day}
                className={cls}
                style={isPastUnsigned ? { color: 'var(--primary)', cursor: 'pointer' } : undefined}
                onClick={() => isPastUnsigned && handleMakeUp(day)}
              >
                {isSigned && !isToday ? '✓' : day}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
          点击未签到日期可补签（消耗 50 积分）
        </div>
      </div>

      {/* 连续签到奖励阶梯 */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">连续签到奖励</div>
        <div
          className="scroll-x"
          style={{ display: 'flex', gap: 8, paddingBottom: 4 }}
        >
          {milestoneRewards.map((mr: any) => {
            const reached = continuousDays >= mr.day;
            return (
              <div
                key={mr.day}
                style={{
                  minWidth: 80,
                  padding: '10px 8px',
                  borderRadius: 8,
                  textAlign: 'center',
                  background: reached
                    ? 'linear-gradient(135deg, #e63946, #c81d2a)'
                    : '#f5f5f5',
                  color: reached ? '#fff' : 'var(--text)',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>第{mr.day}天</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: reached ? 0.85 : 1 }}>
                  {mr.reward}
                </div>
                {reached && (
                  <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>已达成 ✓</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="section" style={{ marginTop: 8 }}>
        <div className="section-title">签到规则</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>1. 每日签到可获得积分或停车券奖励</div>
          <div>2. 连续签到天数越多，奖励越丰厚</div>
          <div>3. 中途断签可消耗 50 积分补签</div>
          <div>4. 每日仅可签到 1 次，补签不限次数</div>
          <div>5. 连续签到奖励在达成时自动发放</div>
        </div>
      </div>
    </Page>
  );
}
