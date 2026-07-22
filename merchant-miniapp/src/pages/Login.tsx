import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'antd-mobile'
import { Store, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { login } from '../services/request'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('haidilao')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      Toast.show({ content: '请输入账号与密码', icon: 'fail' })
      return
    }
    setLoading(true)
    try {
      await login({ username: username.trim(), password })
      Toast.show({ content: '欢迎回来', icon: 'success' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登录失败，请重试'
      Toast.show({ content: msg, icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div className="login-hero-mark">
          <Store size={26} strokeWidth={2.2} color="#fff" />
        </div>
        <div className="login-hero-text">
          <h1 className="login-hero-title">商户助手</h1>
          <p className="login-hero-sub">为商户打造的智能运营工作台</p>
        </div>
        <div className="login-hero-trust">
          <ShieldCheck size={14} strokeWidth={2} />
          <span>安全登录 · 企业级保障</span>
        </div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-head">
          <h2 className="login-form-title">账号登录</h2>
          <p className="login-form-sub">请使用商户账号登录工作台</p>
        </div>

        <div className="login-fields">
          <div>
            <label className="field-label">商户账号</label>
            <div className="field">
              <span className="field-icon">
                <Store size={18} strokeWidth={2} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入商户账号"
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
          </div>

          <div>
            <label className="field-label">登录密码</label>
            <div className="field">
              <span className="field-icon">
                <Lock size={18} strokeWidth={2} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入登录密码"
                autoComplete="current-password"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block login-submit"
          disabled={loading}
        >
          {loading ? '登录中…' : '登录'}
          {!loading && <ArrowRight size={18} strokeWidth={2.4} />}
        </button>

        <div className="login-hint">
          <span className="login-hint-dot" />
          演示账号已预填，可直接登录体验
        </div>
      </form>

      <footer className="login-footer">
        登录即代表您同意《商户服务协议》与《隐私政策》
      </footer>

      <style>{`
        .login-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          max-width: 480px;
          margin: 0 auto;
        }
        .login-hero {
          position: relative;
          padding: 56px 28px 44px;
          background:
            radial-gradient(120% 90% at 100% 0%, rgba(201, 168, 106, 0.18) 0%, transparent 55%),
            linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%);
          color: #fff;
          overflow: hidden;
        }
        .login-hero::after {
          content: '';
          position: absolute;
          right: -60px;
          top: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }
        .login-hero-mark {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
        }
        .login-hero-title {
          color: #fff;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .login-hero-sub {
          margin-top: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.82);
          letter-spacing: 0.01em;
        }
        .login-hero-trust {
          margin-top: 22px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }
        .login-form {
          flex: 1;
          margin: -24px 16px 0;
          background: var(--bg-elevated);
          border-radius: var(--radius-xl);
          padding: 28px 22px 24px;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(232, 236, 243, 0.7);
        }
        .login-form-head {
          margin-bottom: 22px;
        }
        .login-form-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .login-form-sub {
          margin-top: 4px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .login-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-submit {
          margin-top: 26px;
          height: 52px;
          font-size: 16px;
        }
        .login-hint {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .login-hint-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }
        .login-footer {
          text-align: center;
          padding: 20px 24px 28px;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  )
}
