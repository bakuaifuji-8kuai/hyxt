import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/request';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res: any = await login(values.username, values.password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
      message.success('登录成功');
      navigate('/');
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e.message || '登录失败，请检查账号或密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card title="力唯智慧商业会员营销平台" style={{ width: 400, textAlign: 'center' }} styles={{ header: { fontSize: 18, fontWeight: 'bold' } }}>
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input name="username" autoComplete="username" placeholder="请输入用户名…" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password name="password" autoComplete="current-password" placeholder="请输入密码…" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
          <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>演示账号：admin / admin</div>
        </Form>
      </Card>
    </div>
  );
}
