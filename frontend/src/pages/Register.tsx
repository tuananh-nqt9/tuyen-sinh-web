import React, { useState } from 'react';
import { Link, useNavigate } from 'umi';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { authAPI } from '@/services/api';
import { authService } from '@/services/auth';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values: { 
    email: string; 
    password: string; 
    confirmPassword: string;
    fullName: string;
    phone?: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
      });
      
      if (response.data.success) {
        authService.login(response.data.data.token, response.data.data.user);
        message.success('Đăng ký thành công!');
        navigate('/candidate/dashboard');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại';
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
          maxWidth: 480,
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
            Tạo tài khoản mới
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
            Tham gia hệ thống tuyển sinh ngay hôm nay
          </Text>
        </div>

        <div style={{ padding: '32px 32px 40px' }}>
          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#aaa' }} />}
                placeholder="Họ và tên"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

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
              name="phone"
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#aaa' }} />}
                placeholder="Số điện thoại (không bắt buộc)"
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
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#aaa' }} />}
                placeholder="Xác nhận mật khẩu"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
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
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary" style={{ fontSize: 12 }}>hoặc</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Đã có tài khoản? </Text>
            <Link to="/login" style={{ fontWeight: 600 }}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
