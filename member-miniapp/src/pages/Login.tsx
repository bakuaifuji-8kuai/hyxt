import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ShieldCheck, Crown, ChevronRight } from 'lucide-react'
import { Toast } from 'antd-mobile'
import { login, saveAuth, getToken } from '../services/request'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (getToken()) {
      navigate('/home', { replace: true })
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [navigate])

  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      Toast.show({ content: '请输入正确的手机号', icon: 'fail' })
      return
    }
    Toast.show({ content: '验证码已发送' })
    setCountdown(60)
    timerRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleLogin = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      Toast.show({ content: '请输入正确的手机号', icon: 'fail' })
      return
    }
    if (!code) {
      Toast.show({ content: '请输入验证码', icon: 'fail' })
      return
    }
    setLoading(true)
    try {
      const result = await login(phone, code)
      saveAuth(result.token, result.userInfo)
      Toast.show({ content: '欢迎回来', icon: 'success' })
      navigate('/home', { replace: true })
    } catch (e) {
      Toast.show({ content: (e as Error).message || '登录失败', icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="app-shell login-page">
      <div className="login-bg" />
      <div className="login-content">
        <div className="login-brand">
          <div className="login-brand-icon" aria-hidden="true">
            <Crown size={30} strokeWidth={1.6} />
          </div>
          <h1 className="login-brand-title">会员中心</h1>
          <p className="login-brand-sub">尊享品质生活 · 璀璨每一刻</p>
        </div>

        <form className="login-card" onSubmit={handleLoginSubmit}>
          <div className="login-field">
            <Phone size={18} className="login-field-icon" aria-hidden="true" />
            <label htmlFor="login-phone" className="sr-only">手机号</label>
            <input
              id="login-phone"
              className="login-input"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              placeholder="请输入手机号…"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="login-field">
            <ShieldCheck size={18} className="login-field-icon" aria-hidden="true" />
            <label htmlFor="login-code" className="sr-only">验证码</label>
            <input
              id="login-code"
              className="login-input"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="请输入验证码…"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <button
              type="button"
              className="login-code-btn"
              disabled={countdown > 0}
              onClick={sendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>

          <button
            type="submit"
            className="login-submit btn-primary"
            disabled={loading}
          >
            {loading ? '登录中…' : '登 录'}
          </button>

          <div className="login-hint">
            <ChevronRight size={12} aria-hidden="true" />
            <span>演示验证码为 123456，任意手机号均可登录</span>
          </div>
        </form>

        <p className="login-terms">
          登录即表示同意 <span className="login-terms-link">《会员服务协议》</span> 与{' '}
          <span className="login-terms-link">《隐私政策》</span>
        </p>
      </div>
    </div>
  )
}
