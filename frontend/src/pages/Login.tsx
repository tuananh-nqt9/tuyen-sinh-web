import React, { useState } from 'react';
import { Link, useNavigate } from 'umi';
import { Form, Input, Button, Card, Typography, message, Space, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { authAPI } from '@/services/api';
import { authService } from '@/services/auth';

const { Title, Text, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authAPI.login(values);
      
      if (response.data.success) {
        authService.login(response.data.data.token, response.data.data.user);
        message.success('Đăng nhập thành công!');
        
        const user = response.data.data.user;
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/candidate/dashboard');
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 32px',
            textAlign: 'center',
          }}
        >
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
            Chào mừng bạn!
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
            Đăng nhập để tiếp tục với hệ thống tuyển sinh
          </Text>
        </div>

        <div style={{ padding: '32px 32px 40px' }}>
          <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#aaa' }} />}
                placeholder="Email của bạn"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#aaa' }} />}
                placeholder="Mật khẩu"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text type="secondary">Chưa có tài khoản? </Text>
            <Link to="/register" style={{ fontWeight: 600 }}>
              Đăng ký ngay
            </Link>
          </div>

          <div style={{ 
            marginTop: 24, 
            padding: 16, 
            background: '#f5f7fa', 
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Tài khoản demo:</strong><br />
              Admin: admin@university.edu.vn / admin123<br />
              Thí sinh: student@email.com / password
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
