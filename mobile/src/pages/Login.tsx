import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Dialog } from 'antd-mobile';
import { loginByPhone, loginDemo } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      Toast.show('请输入正确的手机号');
      return;
    }
    Toast.show({ icon: 'success', content: '验证码已发送（mock：任意 4-6 位数字）' });
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!agreed) { Toast.show('请先同意用户协议'); return; }
    if (!phone || !code) { Toast.show('请输入手机号和验证码'); return; }
    setLoading(true);
    try {
      await loginByPhone(phone, code);
      Toast.show({ icon: 'success', content: '登录成功' });
      navigate('/home', { replace: true });
    } catch {
      // 错误已在拦截器里 Toast
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await loginDemo();
      navigate('/home', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ background: 'linear-gradient(180deg, #e63946 0%, #c81d2a 30%, #f5f6f8 30%)' }}>
      <div style={{ padding: '60px 24px 20px', color: '#fff', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, margin: '0 auto 12px', borderRadius: 18, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, backdropFilter: 'blur(6px)' }}>🏢</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>恒伟商业</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>智慧会员 · 一站畅享</div>
      </div>

      <div style={{ margin: '0 20px', background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>手机号登录</div>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="请输入手机号"
            value={phone}
            maxLength={11}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          />
          <span style={{ position: 'absolute', left: 12, top: 13, fontSize: 16, color: '#8c8c8c' }}>📱</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="验证码"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <span style={{ position: 'absolute', left: 12, top: 13, fontSize: 16, color: '#8c8c8c' }}>🔑</span>
          </div>
          <button
            className="btn btn-outline"
            style={{ whiteSpace: 'nowrap', padding: '0 12px' }}
            disabled={countdown > 0}
            onClick={sendCode}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </button>
        </div>

        <button className="btn btn-primary btn-block" disabled={loading} onClick={handleLogin}>
          {loading ? '登录中…' : '登录 / 注册'}
        </button>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            className="btn btn-sm"
            style={{ background: 'transparent', color: '#8c8c8c' }}
            onClick={handleDemo}
          >
            一键体验（demo 账号）
          </button>
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: '#8c8c8c', textAlign: 'center', lineHeight: 1.6 }}>
          未注册手机号登录将自动注册，注册即代表您已阅读并同意
          <a style={{ color: '#e63946' }} onClick={() => Dialog.alert({ content: '《恒伟商业会员服务协议》\n\n（mock 演示文本）' })}>《用户协议》</a>
          与
          <a style={{ color: '#e63946' }} onClick={() => Dialog.alert({ content: '《隐私政策》\n\n（mock 演示文本）' })}>《隐私政策》</a>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: '#8c8c8c' }}>
        地产业主可使用业主账号互通登录 · v1.0
      </div>
    </div>
  );
}
