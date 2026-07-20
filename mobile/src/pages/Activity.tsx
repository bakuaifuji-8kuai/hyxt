import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { activityApi } from '../services/api';
import { useFetch, Img, Loading, Empty } from '../components/common';

/** 活动 type → 路由路径映射 */
const TYPE_ROUTE_MAP: Record<string, string> = {
  groupbuy: 'groupbuy',
  seckill: 'seckill',
  helpCoupon: 'help-coupon',
  wordCoupon: 'word-coupon',
  newMember: 'new-member',
  referral: 'referral',
  luckyDraw: 'lucky-draw',
  blindBox: 'blind-box',
  countdown: 'countdown',
  preSale: 'pre-sale',
  bargain: 'bargain',
  countCards: 'count-cards',
  checkinCoupon: 'checkin-coupon',
  douyinCoupon: 'douyin-coupon',
  signups: 'signup',
};

function getTypeRoute(type: string, id: number | string) {
  const route = TYPE_ROUTE_MAP[type];
  return route ? `/activity/${route}/${id}` : `/activity/${type}/${id}`;
}

function getStatusTag(item: any) {
  const now = Date.now();
  if (item.endTime && new Date(item.endTime).getTime() < now) {
    return <span className="tag tag-gray">已结束</span>;
  }
  if (item.startTime && new Date(item.startTime).getTime() > now) {
    return <span className="tag tag-blue">即将开始</span>;
  }
  return <span className="tag tag-green">进行中</span>;
}

/** 活动类型中文映射 */
const TYPE_LABEL: Record<string, string> = {
  groupbuy: '拼团',
  seckill: '秒杀',
  helpCoupon: '助力券',
  wordCoupon: '口令券',
  newMember: '新人礼',
  referral: '推荐有礼',
  luckyDraw: '幸运抽奖',
  blindBox: '盲盒',
  countdown: '倒计时',
  preSale: '预售',
  bargain: '砍价',
  countCards: '集卡',
  checkinCoupon: '签到券',
  douyinCoupon: '抖音券',
  signups: '报名',
  checkin: '签到',
  games: '游戏',
  surveys: '问卷',
  votes: '投票',
};

export default function ActivityPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => activityApi.all() as Promise<any>, []);

  if (loading) return <div className="page"><Loading /></div>;
  if (error) return <div className="page"><Empty text="加载失败" /></div>;

  const {
    checkin = [],
    games = [],
    surveys = [],
    votes = [],
    groupbuy = [],
    seckill = [],
    helpCoupon = [],
    wordCoupon = [],
    newMember = [],
    referral = [],
    luckyDraw = [],
    blindBox = [],
    countdown = [],
    preSale = [],
    bargain = [],
    countCards = [],
    checkinCoupon = [],
    douyinCoupon = [],
    signups = [],
  } = data || {};

  // 所有活动合并
  const allActivities: any[] = [
    ...groupbuy.map((a: any) => ({ ...a, type: 'groupbuy' })),
    ...seckill.map((a: any) => ({ ...a, type: 'seckill' })),
    ...helpCoupon.map((a: any) => ({ ...a, type: 'helpCoupon' })),
    ...wordCoupon.map((a: any) => ({ ...a, type: 'wordCoupon' })),
    ...newMember.map((a: any) => ({ ...a, type: 'newMember' })),
    ...referral.map((a: any) => ({ ...a, type: 'referral' })),
    ...luckyDraw.map((a: any) => ({ ...a, type: 'luckyDraw' })),
    ...blindBox.map((a: any) => ({ ...a, type: 'blindBox' })),
    ...countdown.map((a: any) => ({ ...a, type: 'countdown' })),
    ...preSale.map((a: any) => ({ ...a, type: 'preSale' })),
    ...bargain.map((a: any) => ({ ...a, type: 'bargain' })),
    ...countCards.map((a: any) => ({ ...a, type: 'countCards' })),
    ...checkinCoupon.map((a: any) => ({ ...a, type: 'checkinCoupon' })),
    ...douyinCoupon.map((a: any) => ({ ...a, type: 'douyinCoupon' })),
    ...signups.map((a: any) => ({ ...a, type: 'signups' })),
  ];

  const firstGame = games[0];
  const firstSurvey = surveys[0];
  const firstVote = votes[0];

  return (
    <div className="page">
      {/* 顶部标题栏 */}
      <div className="navbar">
        <span className="title">活动中心</span>
        <span className="right" style={{ cursor: 'pointer' }} onClick={() => navigate('/activity/mine')}>我的活动</span>
      </div>

      {/* 顶部 4 个分类入口 */}
      <div className="card flex-between" style={{ padding: '14px 8px' }}>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => firstGame ? navigate(`/game/${firstGame.id}`) : Toast.show('暂无游戏')}>
          <span style={{ fontSize: 28 }}>🎮</span>营销游戏
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => navigate('/checkin')}>
          <span style={{ fontSize: 28 }}>📅</span>签到打卡
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => firstSurvey ? navigate(`/survey/${firstSurvey.id}`) : Toast.show('暂无问卷')}>
          <span style={{ fontSize: 28 }}>📝</span>问卷调查
        </span>
        <span className="flex-center flex-col gap-4" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => firstVote ? navigate(`/vote/${firstVote.id}`) : Toast.show('暂无投票')}>
          <span style={{ fontSize: 28 }}>🗳️</span>投票活动
        </span>
      </div>

      {/* 热门活动列表 */}
      <div className="section">
        <div className="section-title">热门活动</div>
        {allActivities.length > 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            {allActivities.map((item: any, i: number) => (
              <div
                key={item.id || i}
                className="list-item"
                onClick={() => navigate(getTypeRoute(item.type, item.id || i))}
              >
                <span className="icon">{item.emoji || '🎯'}</span>
                <span className="body">
                  <span className="title">{item.name || item.title || TYPE_LABEL[item.type] || '活动'}</span>
                  <span className="desc ellipsis">{item.description || item.desc || TYPE_LABEL[item.type] || ''}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {getStatusTag(item)}
                  <span className="arrow">›</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="暂无活动" />
        )}
      </div>
    </div>
  );
}
