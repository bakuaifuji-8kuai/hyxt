import { useState, useEffect } from 'react'
import { ParkingCircle, Clock, Car, Wallet, Tag, ChevronRight, Crown } from 'lucide-react'
import { Toast } from 'antd-mobile'
import request from '../services/request'

interface ParkingData {
  current: {
    plate: string
    inTime: string
    duration: string
    fee: number
    discount: number
    finalFee: number
  }
  records: {
    id: number
    plate: string
    inTime: string
    outTime: string
    duration: string
    fee: number
    discount: number
  }[]
  benefit: { freeHours: number; pointsRate: number; level: string }
}

const LEVEL_NAME: Record<string, string> = {
  GOLD: '金卡会员',
  SILVER: '银卡会员',
  DIAMOND: '钻石会员',
  NORMAL: '普通会员',
}

export default function Parking() {
  const [data, setData] = useState<ParkingData | null>(null)

  useEffect(() => {
    request
      .get<ParkingData>('/capp/parking')
      .then((d) => setData(d as ParkingData))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  const cur = data?.current

  return (
    <div className="page page--no-tab parking-page">
      <h1 className="sr-only">停车缴费</h1>
      {/* Current parking card */}
      <section className="section parking-current">
        <div className="parking-current-glow" />
        <div className="parking-current-top">
          <span className="parking-current-eyebrow">
            <ParkingCircle size={14} /> 当前停车
          </span>
          <span className="parking-plate">{cur?.plate || '––'}</span>
        </div>

        {cur ? (
          <>
            <div className="parking-duration">
              <Clock size={16} />
              <div>
                <p className="parking-duration-val">{cur.duration}</p>
                <p className="parking-duration-sub">入场时间 {cur.inTime}</p>
              </div>
            </div>

            <div className="parking-fee">
              <div className="parking-fee-row">
                <span>
                  <Wallet size={14} /> 应付费用
                </span>
                <span>{new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(cur.fee))}</span>
              </div>
              <div className="parking-fee-row discount">
                <span>
                  <Tag size={14} /> 会员优惠
                </span>
                <span>{new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(-Number(cur.discount))}</span>
              </div>
              <div className="parking-fee-row total">
                <span>实付金额</span>
                <span className="parking-fee-final">{new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(cur.finalFee))}</span>
              </div>
            </div>

            <button
              className="btn-primary parking-pay-btn"
              onClick={() => Toast.show({ content: '缴费·敬请期待' })}
            >
              立即缴费 ¥{cur.finalFee}
            </button>
          </>
        ) : (
          <div className="parking-empty-inline">
            <Car size={28} color="rgba(255,255,255,0.5)" />
            <span>暂无在场车辆</span>
          </div>
        )}
      </section>

      {/* Benefit */}
      {data?.benefit ? (
        <section className="section card parking-benefit">
          <div className="parking-benefit-icon">
            <Crown />
          </div>
          <div className="parking-benefit-info">
            <p className="parking-benefit-title">
              {LEVEL_NAME[data.benefit.level] || '会员'} 停车权益
            </p>
            <p className="parking-benefit-desc">
              每日免费停车 {data.benefit.freeHours}{'\u00a0'}小时 · 消费 {data.benefit.pointsRate}{'\u00a0'}元获 1 金币
            </p>
          </div>
        </section>
      ) : null}

      {/* History */}
      <section className="section card parking-history">
        <div className="section-head" style={{ padding: '16px 16px 8px' }}>
          <div className="section-title">
            <span className="accent-bar" />
            <Clock size={17} />
            <span>停车记录</span>
          </div>
        </div>
        {data?.records?.length ? (
          data.records.map((r) => (
            <div key={r.id} className="parking-record">
              <div className="parking-record-left">
                <span className="parking-record-plate">{r.plate}</span>
                <span className="parking-record-time">
                  {r.inTime} → {r.outTime}
                </span>
                <span className="parking-record-dur">停放 {r.duration}</span>
              </div>
              <div className="parking-record-right">
                <span className="parking-record-fee">¥{r.fee}</span>
                <span className="parking-record-disc">优惠 ¥{r.discount}</span>
              </div>
              <ChevronRight size={15} className="parking-record-arrow" />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <ParkingCircle size={36} color="var(--ink-4)" />
            <span className="empty-text">暂无停车记录</span>
          </div>
        )}
      </section>
    </div>
  )
}
