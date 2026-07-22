import { useState, useRef, type FormEvent } from 'react'
import { Toast } from 'antd-mobile'
import {
  ScanLine,
  QrCode,
  CheckCircle,
  User,
  Ticket,
  Coins,
  Clock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import request from '../services/request'

interface VerifyResult {
  memberName?: string
  memberPhone?: string
  couponName?: string
  couponValue?: number
  amount?: number
  coins?: number
  validUntil?: string
  orderNo?: string
  [key: string]: unknown
}

export default function CouponVerify() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      Toast.show({ content: '请输入核销码', icon: 'fail' })
      inputRef.current?.focus()
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await request.post<unknown, VerifyResult>('/bapp/coupon-verify', {
        code: trimmed,
      })
      setResult(res)
      Toast.show({ content: '核销成功', icon: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '核销失败，请核对核销码'
      Toast.show({ content: msg, icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setCode('')
    setResult(null)
    inputRef.current?.focus()
  }

  return (
    <div className="page">
      <header className="cv-header">
        <div className="cv-header-mark">
          <ScanLine size={26} strokeWidth={2.2} color="#fff" />
        </div>
        <h1 className="cv-title">券核销</h1>
        <p className="cv-sub">输入或扫描会员的核销码，完成券核销</p>
      </header>

      <form className="cv-form" onSubmit={handleVerify}>
        <label className="field-label" htmlFor="cv-code">核销码</label>
        <div className="cv-input-wrap">
          <div className="field cv-field">
            <span className="field-icon">
              <QrCode size={20} strokeWidth={2} />
            </span>
            <input
              ref={inputRef}
              id="cv-code"
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="请输入核销码…"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              maxLength={64}
              disabled={loading}
            />
          </div>
          <button
            type="button"
            className="cv-scan-btn"
            aria-label="扫描核销码"
            onClick={() => Toast.show({ content: '扫码功能即将开放', icon: 'todo' })}
          >
            <ScanLine size={20} strokeWidth={2} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block cv-submit"
          disabled={loading}
        >
          {loading ? '核销中…' : '立即核销'}
          {!loading && <CheckCircle size={18} strokeWidth={2.4} />}
        </button>
      </form>

      {/* Success result */}
      {result && (
        <div className="cv-result">
          <div className="cv-result-banner">
            <div className="cv-result-check">
              <CheckCircle size={40} strokeWidth={2.2} color="#fff" />
            </div>
            <h2 className="cv-result-title">核销成功</h2>
            <p className="cv-result-sub">
              {result.orderNo ? `订单号 ${result.orderNo}` : '券已成功核销'}
            </p>
          </div>

          <div className="card cv-result-card">
            <div className="cv-result-row">
              <span className="cv-result-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <User size={16} strokeWidth={2.2} />
              </span>
              <span className="cv-result-label">会员姓名</span>
              <span className="cv-result-value">{result.memberName || '—'}</span>
            </div>
            {result.memberPhone && (
              <div className="cv-result-row">
                <span className="cv-result-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                  <ShieldCheck size={16} strokeWidth={2.2} />
                </span>
                <span className="cv-result-label">联系方式</span>
                <span className="cv-result-value">{result.memberPhone}</span>
              </div>
            )}
            <div className="cv-result-row">
              <span className="cv-result-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                <Ticket size={16} strokeWidth={2.2} />
              </span>
              <span className="cv-result-label">券名称</span>
              <span className="cv-result-value">{result.couponName || '—'}</span>
            </div>
            {result.couponValue !== undefined && (
              <div className="cv-result-row">
                <span className="cv-result-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                  <Coins size={16} strokeWidth={2.2} />
                </span>
                <span className="cv-result-label">券面值</span>
                <span className="cv-result-value">
                  {result.couponValue ? `¥${new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(result.couponValue))}` : '—'}
                </span>
              </div>
            )}
            {result.validUntil && (
              <div className="cv-result-row">
                <span className="cv-result-icon" style={{ background: 'var(--line-soft)', color: 'var(--text-soft)' }}>
                  <Clock size={16} strokeWidth={2.2} />
                </span>
                <span className="cv-result-label">有效期至</span>
                <span className="cv-result-value">{result.validUntil}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-block cv-again"
            onClick={handleReset}
          >
            <RotateCcw size={16} strokeWidth={2.2} />
            继续核销下一张
          </button>
        </div>
      )}

      <style>{`
        .cv-header {
          text-align: center;
          padding: 14px 4px 22px;
        }
        .cv-header-mark {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.32);
        }
        .cv-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .cv-sub {
          margin-top: 6px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .cv-form {
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          padding: 20px 18px;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(232, 236, 243, 0.7);
        }
        .cv-input-wrap {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        .cv-field {
          flex: 1;
          height: 58px;
        }
        .cv-scan-btn {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-md);
          background: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .cv-scan-btn:active {
          transform: scale(0.95);
        }
        .cv-submit {
          margin-top: 16px;
          height: 52px;
          font-size: 16px;
        }
        .cv-result {
          margin-top: 20px;
          animation: cvPop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cvPop {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cv-result-banner {
          text-align: center;
          padding: 24px 0 18px;
        }
        .cv-result-check {
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
        .cv-result-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--success);
          letter-spacing: -0.01em;
        }
        .cv-result-sub {
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .cv-result-card {
          padding: 8px 18px;
        }
        .cv-result-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--line-soft);
        }
        .cv-result-row:last-child {
          border-bottom: none;
        }
        .cv-result-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cv-result-label {
          font-size: 13px;
          color: var(--text-muted);
          width: 70px;
          flex-shrink: 0;
        }
        .cv-result-value {
          flex: 1;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .cv-again {
          margin-top: 14px;
        }
      `}</style>
    </div>
  )
}
