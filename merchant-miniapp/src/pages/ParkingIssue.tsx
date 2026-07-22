import { useState, type FormEvent } from 'react'
import { Toast } from 'antd-mobile'
import {
  CircleParking,
  Clock,
  CheckCircle,
  Car,
  RotateCcw,
  Info,
} from 'lucide-react'
import request from '../services/request'

const HOUR_OPTIONS = [1, 2, 3, 4, 6, 8]

interface IssueResult {
  orderNo?: string
  plate?: string
  hours?: number
  validUntil?: string
  [key: string]: unknown
}

export default function ParkingIssue() {
  const [plate, setPlate] = useState('')
  const [hours, setHours] = useState(2)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IssueResult | null>(null)

  function normalizePlate(value: string): string {
    return value.trim().toUpperCase()
  }

  async function handleIssue(e: FormEvent) {
    e.preventDefault()
    const normalized = normalizePlate(plate)
    if (!normalized) {
      Toast.show({ content: '请输入车牌号', icon: 'fail' })
      return
    }
    if (normalized.length < 7) {
      Toast.show({ content: '车牌号格式有误', icon: 'fail' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await request.post<unknown, IssueResult>('/bapp/parking-issue', {
        plate: normalized,
        hours,
      })
      setResult({ ...res, plate: res.plate || normalized, hours: res.hours ?? hours })
      Toast.show({ content: '停车券发放成功', icon: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '发放失败，请重试'
      Toast.show({ content: msg, icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setPlate('')
    setHours(2)
    setResult(null)
  }

  return (
    <div className="page">
      <header className="pi-header">
        <div className="pi-header-mark">
          <CircleParking size={26} strokeWidth={2.2} color="#fff" />
        </div>
        <h1 className="pi-title">停车券发放</h1>
        <p className="pi-sub">为顾客车牌发放停车优惠时长</p>
      </header>

      <form className="pi-form" onSubmit={handleIssue}>
        {/* Plate input — license-plate styled */}
        <label className="field-label">车牌号</label>
        <div className="pi-plate">
          <div className="pi-plate-badge">京</div>
          <div className="field pi-plate-field">
            <span className="field-icon">
              <Car size={20} strokeWidth={2} />
            </span>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="如 A12345"
              autoCapitalize="characters"
              autoCorrect="off"
              maxLength={8}
              disabled={loading}
            />
          </div>
        </div>
        <p className="pi-tip">
          <Info size={12} strokeWidth={2} />
          请输入完整车牌号（含省份简称后字符）
        </p>

        {/* Hours selector */}
        <div className="pi-hours">
          <label className="field-label">
            <Clock size={14} strokeWidth={2.2} />
            优惠时长
          </label>
          <div className="pi-hours-grid">
            {HOUR_OPTIONS.map((h) => {
              const active = h === hours
              return (
                <button
                  type="button"
                  key={h}
                  className={`pi-hour-chip${active ? ' active' : ''}`}
                  onClick={() => setHours(h)}
                  disabled={loading}
                >
                  <span className="pi-hour-num">{h}</span>
                  <span className="pi-hour-unit">小时</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-accent btn-block pi-submit"
          disabled={loading || !plate.trim()}
        >
          {loading ? '发放中…' : `发放 ${hours} 小时停车券`}
          {!loading && <CheckCircle size={18} strokeWidth={2.4} />}
        </button>
      </form>

      {/* Success result */}
      {result && (
        <div className="pi-result">
          <div className="pi-result-banner">
            <div className="pi-result-check">
              <CheckCircle size={40} strokeWidth={2.2} color="#fff" />
            </div>
            <h2 className="pi-result-title">发放成功</h2>
            <p className="pi-result-sub">
              {result.orderNo ? `单号 ${result.orderNo}` : '停车券已发放至车牌'}
            </p>
          </div>

          <div className="card pi-result-card">
            <div className="pi-plate-display">
              <Car size={18} strokeWidth={2.2} color="var(--accent-deep)" />
              <span className="pi-plate-display-text">{result.plate}</span>
            </div>
            <div className="pi-result-meta">
              <div className="pi-result-meta-item">
                <span className="pi-result-meta-label">优惠时长</span>
                <span className="pi-result-meta-value text-accent">
                  {result.hours} 小时
                </span>
              </div>
              {result.validUntil && (
                <div className="pi-result-meta-item">
                  <span className="pi-result-meta-label">有效期至</span>
                  <span className="pi-result-meta-value">{result.validUntil}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-block pi-again"
            onClick={handleReset}
          >
            <RotateCcw size={16} strokeWidth={2.2} />
            继续发放
          </button>
        </div>
      )}

      <style>{`
        .pi-header {
          text-align: center;
          padding: 14px 4px 22px;
        }
        .pi-header-mark {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #c9a86a 0%, #b3934f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 28px rgba(201, 168, 106, 0.32);
        }
        .pi-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .pi-sub {
          margin-top: 6px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .pi-form {
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          padding: 20px 18px;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(232, 236, 243, 0.7);
        }
        .pi-plate {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        .pi-plate-badge {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.25);
        }
        .pi-plate-field {
          flex: 1;
          height: 58px;
        }
        .pi-plate-field input {
          letter-spacing: 0.18em;
          font-weight: 600;
          text-transform: uppercase;
        }
        .pi-tip {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .pi-hours {
          margin-top: 22px;
        }
        .pi-hours .field-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .pi-hours-grid {
          margin-top: 8px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .pi-hour-chip {
          padding: 12px 0;
          border-radius: var(--radius-md);
          background: var(--bg);
          border: 1.5px solid var(--line);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          transition: all 0.15s ease;
        }
        .pi-hour-chip.active {
          background: var(--accent-soft);
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(201, 168, 106, 0.12);
        }
        .pi-hour-num {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .pi-hour-chip.active .pi-hour-num {
          color: var(--accent-deep);
        }
        .pi-hour-unit {
          font-size: 11px;
          color: var(--text-muted);
        }
        .pi-submit {
          margin-top: 24px;
          height: 52px;
          font-size: 16px;
        }
        .pi-result {
          margin-top: 20px;
          animation: piPop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes piPop {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .pi-result-banner {
          text-align: center;
          padding: 24px 0 18px;
        }
        .pi-result-check {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          margin: 0 auto 14px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 28px rgba(22, 163, 74, 0.32);
        }
        .pi-result-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--success);
          letter-spacing: -0.01em;
        }
        .pi-result-sub {
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .pi-result-card {
          padding: 20px 18px;
        }
        .pi-plate-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          border-radius: var(--radius-md);
          background: var(--accent-soft);
          border: 1.5px dashed var(--accent);
        }
        .pi-plate-display-text {
          font-size: 22px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: 0.16em;
        }
        .pi-result-meta {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pi-result-meta-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pi-result-meta-label {
          font-size: 13px;
          color: var(--text-muted);
        }
        .pi-result-meta-value {
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
        }
        .pi-again {
          margin-top: 14px;
        }
      `}</style>
    </div>
  )
}
