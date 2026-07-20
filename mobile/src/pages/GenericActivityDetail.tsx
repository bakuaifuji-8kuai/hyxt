import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, Toast } from 'antd-mobile';
import { activityApi, promoApi } from '../services/api';
import { Page, NavBar, Loading, Empty, useFetch, Img, fen2yuan, formatNumber } from '../components/common';

const TYPE_TITLE: Record<string, string> = {
  groupbuy: '拼团详情',
  seckill: '秒杀详情',
  'help-coupon': '助力领券',
  'word-coupon': '口令领券',
  'new-member': '新人礼',
  referral: '推荐有礼',
  'lucky-draw': '幸运抽奖',
  'blind-box': '盲盒',
  countdown: '限时购',
  'pre-sale': '预售详情',
  bargain: '砍价详情',
  'count-cards': '计次卡',
  'checkin-coupon': '到店打卡领券',
  'douyin-coupon': '抖音券兑换',
  signup: '活动报名',
};

const TYPE_EMOJI: Record<string, string> = {
  groupbuy: '👥',
  seckill: '⚡',
  'help-coupon': '🤝',
  'word-coupon': '🔑',
  'new-member': '🎁',
  referral: '📢',
  'lucky-draw': '🎰',
  'blind-box': '📦',
  countdown: '⏰',
  'pre-sale': '💰',
  bargain: '✂️',
  'count-cards': '🃏',
  'checkin-coupon': '📍',
  'douyin-coupon': '🎵',
  signup: '📋',
};

// type 路径参数 → activityApi.all() 返回数据中的数组 key
// （help-coupon → helpCoupon 等 camelCase；signup → signups 复数）
const TYPE_ARRAY_KEY: Record<string, string> = {
  groupbuy: 'groupbuy',
  seckill: 'seckill',
  'help-coupon': 'helpCoupon',
  'word-coupon': 'wordCoupon',
  'new-member': 'newMember',
  referral: 'referral',
  'lucky-draw': 'luckyDraw',
  'blind-box': 'blindBox',
  countdown: 'countdown',
  'pre-sale': 'preSale',
  bargain: 'bargain',
  'count-cards': 'countCards',
  'checkin-coupon': 'checkinCoupon',
  'douyin-coupon': 'douyinCoupon',
  signup: 'signups',
};

function useCountdown(targetTime: string | undefined) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!targetTime) { setText(''); return; }
    const update = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      if (diff <= 0) { setText('已结束'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(`${h}时${m}分${s}秒`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);
  return text;
}

function getStatusInfo(item: any) {
  const now = Date.now();
  if (item.endTime && new Date(item.endTime).getTime() < now) return { label: '已结束', tag: 'tag-gray', ended: true };
  if (item.startTime && new Date(item.startTime).getTime() > now) return { label: '即将开始', tag: 'tag-blue', upcoming: true };
  return { label: '进行中', tag: 'tag-green', active: true };
}

export default function GenericActivityDetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => activityApi.all() as Promise<any>, []);

  const [actioning, setActioning] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [douyinInput, setDouyinInput] = useState('');
  const [referralData, setReferralData] = useState<any>(null);
  const [referralRecords, setReferralRecords] = useState<any[]>([]);

  const allData = data as any;

  const typeKey = type ?? '';
  const arrayKey = TYPE_ARRAY_KEY[typeKey] ?? typeKey;
  const activityList: any[] = allData?.[arrayKey] ?? [];
  const item = activityList.find((a: any) => String(a.id) === id) ?? activityList[0];
  const statusInfo = item ? getStatusInfo(item) : { label: '', tag: '', ended: false, upcoming: false, active: false };

  const countdownText = useCountdown(item?.endTime);
  const startCountdown = useCountdown(item?.startTime);

  const loadReferral = useCallback(async () => {
    if (typeKey !== 'referral') return;
    try {
      const [codeRes, recordsRes]: any[] = await Promise.all([
        promoApi.referralCode(),
        promoApi.referralRecords(),
      ]);
      setReferralData(codeRes);
      setReferralRecords(recordsRes ?? []);
    } catch {}
  }, [typeKey]);

  useEffect(() => { loadReferral(); }, [loadReferral]);

  const doAction = useCallback(async (fn: () => Promise<any>, successMsg: string) => {
    setActioning(true);
    try {
      await fn();
      Toast.show(successMsg);
      reload();
    } catch (e: any) {
      Toast.show(e?.message || '操作失败');
    } finally {
      setActioning(false);
    }
  }, [reload]);

  const handleGroupbuyJoin = () => doAction(() => promoApi.groupbuyJoin(item.id), '参团成功');
  const handleSeckillBuy = () => doAction(() => promoApi.seckillBuy(item.id), '抢购成功');
  const handleHelpCouponHelp = () => doAction(() => promoApi.helpCoupon(item.id), '助力成功');
  const handleHelpCouponClaim = () => doAction(() => promoApi.helpCouponClaim(item.id), '领取成功');
  const handleWordCouponClaim = () => {
    if (!wordInput.trim()) { Toast.show('请输入口令'); return; }
    doAction(() => promoApi.wordCouponClaim(wordInput.trim()), '领取成功');
  };
  const handleNewMemberClaim = () => doAction(() => promoApi.newMemberClaim(), '领取成功');
  const handleSignup = () => doAction(() => activityApi.signup(item.id), '报名成功');
  const handleBlindBox = async () => {
    setActioning(true);
    try {
      const res: any = await promoApi.gamePlay(item.id);
      const prize = res?.prize;
      Dialog.alert({
        title: prize ? '🎉 恭喜' : '很遗憾',
        content: prize ? `开出：${prize.name}（${prize.value}）` : '本次未开出奖品',
        confirmText: '好的',
      });
    } catch (e: any) {
      Toast.show(e?.message || '操作失败');
    } finally {
      setActioning(false);
    }
  };
  const handleLuckyDraw = async () => {
    setActioning(true);
    try {
      const res: any = await promoApi.gamePlay(item.id);
      Dialog.alert({
        title: res?.prize ? '🎉 恭喜中奖' : '很遗憾',
        content: res?.prize ? `获得：${res.prize.name}` : '未中奖，下次好运',
        confirmText: '好的',
      });
    } catch (e: any) {
      Toast.show(e?.message || '抽奖失败');
    } finally {
      setActioning(false);
    }
  };
  const handleCopyCode = () => {
    const code = referralData?.code ?? item?.myCode ?? '';
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => Toast.show('已复制')).catch(() => Toast.show('复制失败'));
  };

  if (loading) return <Page><NavBar title={TYPE_TITLE[typeKey] ?? '活动详情'} /><Loading /></Page>;
  if (error) return <Page><NavBar title={TYPE_TITLE[typeKey] ?? '活动详情'} /><Empty text="加载失败" /></Page>;
  if (!item) return <Page><NavBar title={TYPE_TITLE[typeKey] ?? '活动详情'} /><Empty text="活动不存在" /></Page>;

  const name = item.name ?? item.title ?? '';
  const emoji = TYPE_EMOJI[typeKey] ?? '🎯';

  const renderTypeContent = () => {
    switch (typeKey) {
      case 'groupbuy':
        return (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <Img src={`https://picsum.photos/seed/gb${item.id}/400/300`} style={{ width: '100%', borderRadius: 8 }} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>¥{fen2yuan(item.payAmount ?? 9900)}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>¥{fen2yuan(item.deductAmount ?? 19900)}</span>
              </div>
              <div style={{ fontSize: 13, marginTop: 8, color: 'var(--text-secondary)' }}>
                成团人数：{item.minCount ?? 3}人 · 已参团：{item.joined ?? 1}人
              </div>
            </div>
          </>
        );

      case 'seckill':
        return (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <Img src={`https://picsum.photos/seed/sk${item.id}/400/300`} style={{ width: '100%', borderRadius: 8 }} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>¥{fen2yuan(item.price ?? 100)}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>¥{fen2yuan(item.originalPrice ?? 20000)}</span>
              </div>
              <div style={{ fontSize: 13, marginTop: 8, color: 'var(--text-secondary)' }}>
                库存：{item.stock ?? 100} · 已售：{item.sold ?? 0}
              </div>
              <div style={{ marginTop: 8 }}>
                {statusInfo.upcoming ? (
                  <div className="notice-bar">即将开始：{startCountdown}</div>
                ) : statusInfo.active ? (
                  <div style={{ fontSize: 13, color: 'var(--primary)' }}>距结束：<span className="countdown"><b>{countdownText}</b></span></div>
                ) : null}
              </div>
            </div>
          </>
        );

      case 'help-coupon': {
        const needHelp = item.needHelp ?? 5;
        const helped = item.helped ?? 0;
        const percent = Math.min(100, Math.round((helped / needHelp) * 100));
        const reached = helped >= needHelp;
        return (
          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>券信息</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {item.template ?? '满100减30优惠券'}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>助力进度</span>
                <span className="text-primary">{helped}/{needHelp}</span>
              </div>
              <div className="progress" style={{ background: '#f0f0f0' }}>
                <div className="progress-bar" style={{ background: 'var(--primary)', width: `${percent}%` }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleHelpCouponHelp} disabled={actioning}>
                邀请好友助力
              </button>
              {reached && (
                <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleHelpCouponClaim} disabled={actioning}>
                  领取优惠券
                </button>
              )}
            </div>
          </div>
        );
      }

      case 'word-coupon':
        return (
          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>口令领券</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {item.template ?? '输入指定口令即可领取优惠券'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="请输入口令"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleWordCouponClaim} disabled={actioning}>
                领取
              </button>
            </div>
          </div>
        );

      case 'new-member': {
        const rewards: any[] = item.rewards ?? ['50积分', '停车券', '满100减20券'];
        const claimed = item.status === 'claimed';
        return (
          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>新人礼包</div>
            {rewards.map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
                <span className="icon-circle">🎁</span>
                <span style={{ fontSize: 13 }}>{typeof r === 'string' ? r : r.name ?? r}</span>
              </div>
            ))}
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 12 }}
              disabled={claimed || actioning}
              onClick={handleNewMemberClaim}
            >
              {claimed ? '已领取' : '一键领取'}
            </button>
          </div>
        );
      }

      case 'referral': {
        const code = referralData?.code ?? item.myCode ?? 'REF000';
        const records = referralRecords.length > 0 ? referralRecords : (item.myInvites ?? []);
        return (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>我的邀请码</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)', letterSpacing: 4, margin: '8px 0' }}>
                {code}
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleCopyCode}>复制邀请码</button>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                邀请奖励：{item.referrerReward ?? '50积分'} / 被邀请奖励：{item.inviteeReward ?? '20积分'}
              </div>
            </div>
            {records.length > 0 && (
              <div className="card">
                <div className="card-title">邀请记录</div>
                {records.map((r: any, i: number) => (
                  <div key={i} className="list-item" style={{ padding: '8px 0' }}>
                    <span className="body">
                      <span className="title">{r.inviteeName ?? '好友'}</span>
                      <span className="desc">{r.time ?? ''}</span>
                    </span>
                    <span className="tag" style={{ background: r.status === 'success' ? undefined : '#f0f0f0' }}>
                      {r.status === 'success' ? '已获奖励' : '待完成'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      }

      case 'lucky-draw': {
        const prizes: any[] = item.prize ?? ['100积分', '停车券', '满50减10', '谢谢参与'];
        return (
          <div className="card">
            <div className="card-title">奖品列表</div>
            {prizes.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
                <span className="icon-circle">🏆</span>
                <span style={{ fontSize: 13 }}>{typeof p === 'string' ? p : p.name ?? p}</span>
              </div>
            ))}
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
              参与人数：{item.participants ?? 0} · 开奖时间：{item.drawTime ?? '活动结束后'}
            </div>
          </div>
        );
      }

      case 'blind-box': {
        const prizes: any[] = item.prizes ?? ['限量手办', '100积分', '停车券', '谢谢参与'];
        return (
          <div className="card">
            <div className="card-title">盲盒信息</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              价格：<span className="text-primary text-bold">{fen2yuan(item.price ?? 990)}</span> 元
            </div>
            <div style={{ marginTop: 8, fontSize: 13 }}>奖品池</div>
            {prizes.map((p: any, i: number) => (
              <div key={i} style={{ padding: '4px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                {typeof p === 'string' ? p : p.name ?? p}
              </div>
            ))}
          </div>
        );
      }

      case 'countdown':
        return (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <Img src={`https://picsum.photos/seed/cd${item.id}/400/300`} style={{ width: '100%', borderRadius: 8 }} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>¥{fen2yuan(item.price ?? 4900)}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>¥{fen2yuan(item.originalPrice ?? 9900)}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--primary)' }}>
                距结束：<span className="countdown"><b>{countdownText}</b></span>
              </div>
            </div>
          </>
        );

      case 'pre-sale':
        return (
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Img src={`https://picsum.photos/seed/ps${item.id}/400/300`} style={{ width: '100%', borderRadius: 8 }} />
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
              <div>定金：<span className="text-primary text-bold">{fen2yuan(item.deposit ?? 5000)}</span></div>
              <div>尾款：<span className="text-primary text-bold">{fen2yuan(item.finalPayment ?? 15000)}</span></div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
              预售期：{item.preTime ?? '即日起'} · 尾款期：{item.deliveryTime ?? '待通知'}
            </div>
          </div>
        );

      case 'bargain': {
        const originalPrice = item.originalPrice ?? 20000;
        const floorPrice = item.floorPrice ?? 5000;
        const currentPrice = item.currentPrice ?? Math.round((originalPrice + floorPrice) / 2);
        const cutAmount = originalPrice - currentPrice;
        const percent = Math.round(((currentPrice - floorPrice) / (originalPrice - floorPrice)) * 100);
        return (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <Img src={`https://picsum.photos/seed/bk${item.id}/400/300`} style={{ width: '100%', borderRadius: 8 }} />
            </div>
            <div className="card">
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                ¥{fen2yuan(currentPrice)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                原价 ¥{fen2yuan(originalPrice)} · 底价 ¥{fen2yuan(floorPrice)} · 已砍 ¥{fen2yuan(cutAmount)}
              </div>
              <div className="progress" style={{ background: '#f0f0f0', marginTop: 8 }}>
                <div className="progress-bar" style={{ background: 'var(--primary)', width: `${percent}%` }} />
              </div>
              <button className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={() => Toast.show('分享链接已复制，邀请好友帮砍')}>
                邀请好友砍价
              </button>
            </div>
          </>
        );
      }

      case 'count-cards': {
        const merchants: any[] = item.merchants ?? ['海底捞', '星巴克', '必胜客'];
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>计次卡</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>¥{fen2yuan(item.price ?? 9900)}</span>
            </div>
            <div style={{ fontSize: 13, marginTop: 8, color: 'var(--text-secondary)' }}>
              次数：{item.times ?? 10}次
            </div>
            <div style={{ fontSize: 13, marginTop: 8 }}>适用门店</div>
            {merchants.map((m: any, i: number) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0' }}>
                · {typeof m === 'string' ? m : m.name ?? m}
              </div>
            ))}
          </div>
        );
      }

      case 'checkin-coupon':
        return (
          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>到店打卡领券</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {item.template ?? '到店打卡即可领取专属优惠券'}
            </div>
            {item.location && (
              <div style={{ fontSize: 13, marginTop: 8, color: 'var(--text-secondary)' }}>
                📍 {item.location}
              </div>
            )}
            <button className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={() => Toast.show('请到店扫码打卡')}>
              扫码打卡
            </button>
          </div>
        );

      case 'douyin-coupon':
        return (
          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>抖音券兑换</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              在抖音获取券码后，在此输入即可兑换
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="请输入抖音券码"
                value={douyinInput}
                onChange={(e) => setDouyinInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                disabled={!douyinInput.trim() || actioning}
                onClick={() => doAction(() => promoApi.wordCouponClaim(douyinInput.trim()), '兑换成功')}
              >
                兑换
              </button>
            </div>
          </div>
        );

      case 'signup': {
        const signed = item.status === 'signed' || item.signed;
        return (
          <div className="card">
            <div className="card-title">活动详情</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              {item.time && <div>时间：{item.time}</div>}
              {item.location && <div>地点：{item.location}</div>}
              {item.description && <div>简介：{item.description}</div>}
              <div>报名人数：{item.count ?? 0}/{item.member ?? 100}</div>
            </div>
            {signed && (
              <div style={{ marginTop: 12, padding: 12, background: '#f0f0f0', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>核销码</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>SIGN{String(item.id).padStart(6, '0')}</div>
              </div>
            )}
          </div>
        );
      }

      default:
        return <div className="card"><Empty text="暂无该类型活动详情" /></div>;
    }
  };

  const renderBottomBar = () => {
    const disabled = actioning || statusInfo.ended;

    switch (typeKey) {
      case 'groupbuy':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled} onClick={handleGroupbuyJoin}>
            {actioning ? '处理中...' : '开团 / 参团'}
          </button>
        );
      case 'seckill':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled || statusInfo.upcoming} onClick={handleSeckillBuy}>
            {statusInfo.upcoming ? '即将开始' : statusInfo.ended ? '已结束' : actioning ? '抢购中...' : '立即抢购'}
          </button>
        );
      case 'help-coupon':
        return null;
      case 'word-coupon':
        return null;
      case 'new-member':
        return null;
      case 'referral':
        return (
          <button className="btn btn-primary btn-block" onClick={() => Toast.show('分享链接已复制')}>
            邀请好友
          </button>
        );
      case 'lucky-draw':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled} onClick={handleLuckyDraw}>
            {actioning ? '抽奖中...' : '立即抽奖'}
          </button>
        );
      case 'blind-box':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled} onClick={handleBlindBox}>
            {actioning ? '开启中...' : '开启盲盒'}
          </button>
        );
      case 'countdown':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled} onClick={() => Toast.show('即将跳转结算页')}>
            立即购买
          </button>
        );
      case 'pre-sale':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled} onClick={() => Toast.show('即将跳转支付定金')}>
            付定金
          </button>
        );
      case 'bargain':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled} onClick={() => Toast.show('即将跳转结算页')}>
            立即购买
          </button>
        );
      case 'count-cards':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled} onClick={() => Toast.show('即将跳转结算页')}>
            立即购买
          </button>
        );
      case 'checkin-coupon':
        return (
          <button className="btn btn-primary btn-block" disabled={disabled || (item.claimed ?? false)} onClick={() => doAction(() => promoApi.helpCouponClaim(item.id), '领取成功')}>
            {(item.claimed ?? false) ? '已领取' : '领取优惠券'}
          </button>
        );
      case 'douyin-coupon':
        return null;
      case 'signup': {
        const signed = item.status === 'signed' || item.signed;
        return (
          <button className="btn btn-primary btn-block" disabled={signed || disabled} onClick={handleSignup}>
            {signed ? '已报名' : actioning ? '报名中...' : '立即报名'}
          </button>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Page>
      <NavBar title={TYPE_TITLE[typeKey] ?? '活动详情'} />

      {/* 顶部主图 */}
      <div className="banner" style={{ background: `linear-gradient(135deg, #e63946, #c81d2a)` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
          <span style={{ fontSize: 48 }}>{emoji}</span>
          <span style={{ fontSize: 14, marginTop: 4, opacity: 0.85 }}>{TYPE_TITLE[typeKey] ?? '活动'}</span>
        </div>
      </div>

      {/* 活动信息卡片 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{name}</span>
          <span className={`tag ${statusInfo.tag}`}>{statusInfo.label}</span>
        </div>
        {item.startTime && item.endTime && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {item.startTime} ~ {item.endTime}
          </div>
        )}
      </div>

      {/* 类型特定内容 */}
      {renderTypeContent()}

      {/* 活动说明 */}
      <div className="card">
        <div className="card-title">活动说明</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {item.description ?? item.desc ?? '参与活动即可获得丰厚奖励，具体规则以活动页面为准。如有疑问请联系客服。'}
        </div>
      </div>

      {/* 底部操作栏 */}
      {renderBottomBar() && (
        <div style={{ padding: '12px 12px 20px', position: 'sticky', bottom: 0, background: '#fff', borderTop: '0.5px solid var(--border)' }}>
          {renderBottomBar()}
        </div>
      )}
    </Page>
  );
}
