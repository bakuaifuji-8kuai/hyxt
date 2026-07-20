import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Toast } from 'antd-mobile';
import { ShopOutlined } from '@ant-design/icons';
import { loginMobile } from '../../services/request';
import '../mobile.css';

export default function MobileLogin() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone || phone.length !== 11) {
      Toast.show({ content: '请输入正确的手机号', icon: 'fail' });
      return;
    }
    if (!code) {
      Toast.show({ content: '请输入验证码', icon: 'fail' });
      return;
    }

    setLoading(true);
    try {
      const result = loginMobile(phone);
      if (result) {
        Toast.show({ content: '登录成功', icon: 'success' });
        navigate('/mobile/home', { replace: true });
      }
    } catch (err: any) {
      Toast.show({ content: err.message || '登录失败', icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-login-container">
      <div className="mobile-login-logo">
        <ShopOutlined style={{ fontSize: 48, color: '#fff' }} />
        <h1>商户助手</h1>
      </div>
      <div className="mobile-login-form">
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="请输入手机号"
            value={phone}
            onChange={setPhone}
            type="tel"
            maxLength={11}
            style={{ '--font-size': '16px', '--placeholder-size': '16px' } as any}
          />
        </div>
        <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
          <Input
            placeholder="验证码"
            value={code}
            onChange={setCode}
            type="tel"
            maxLength={6}
            style={{ '--font-size': '16px', '--placeholder-size': '16px', flex: 1 } as any}
          />
          <Button
            color="primary"
            fill="outline"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => { Toast.show({ content: '验证码已发送', icon: 'success' }); }}
          >
            获取验证码
          </Button>
        </div>
        <Button
          block
          color="primary"
          size="large"
          loading={loading}
          onClick={handleLogin}
          style={{ '--background-color': '#1677ff', borderRadius: 24 }}
        >
          登录
        </Button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 24, color: '#999', fontSize: 12 }}>
        恒伟商业会员平台
      </div>
    </div>
  );
}