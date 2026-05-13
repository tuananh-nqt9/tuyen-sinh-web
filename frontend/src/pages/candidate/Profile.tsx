import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, Space, Row, Col, DatePicker, Radio, message, Spin, Upload, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined, LockOutlined, SaveOutlined, CameraOutlined } from '@ant-design/icons';
import { authAPI } from '@/services/api';
import { authService } from '@/services/auth';
import { User } from '@/models';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const CandidateProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const user = authService.getUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await authAPI.getProfile();
      const userData = response.data?.data;
      if (userData) {
        form.setFieldsValue({
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
          gender: userData.gender,
          cccd: userData.cccd,
          address: {
            province: userData.address?.province,
            district: userData.address?.district,
            ward: userData.address?.ward,
            detail: userData.address?.detail,
          },
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile({
        fullName: values.fullName,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        gender: values.gender,
        cccd: values.cccd,
        address: values.address,
      });
      
      if (response.data.success) {
        authService.setUser(response.data.data);
        message.success('Cập nhật thông tin thành công!');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      setLoading(true);
      const response = await authAPI.changePassword(values);
      if (response.data.success) {
        message.success('Đổi mật khẩu thành công!');
        passwordForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Space>
          <Avatar 
            size={80} 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            icon={<UserOutlined />}
          />
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>{user?.fullName}</Title>
            <Text type="secondary">{user?.email}</Text>
          </div>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin cá nhân" style={{ borderRadius: 16 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                    <Input size="large" prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input size="large" prefix={<MailOutlined />} disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Số điện thoại">
                    <Input size="large" prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="cccd" label="Số CCCD">
                    <Input size="large" prefix={<IdcardOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="gender" label="Giới tính">
                    <Radio.Group>
                      <Radio value="male">Nam</Radio>
                      <Radio value="female">Nữ</Radio>
                      <Radio value="other">Khác</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Địa chỉ</Divider>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name={['address', 'province']} label="Tỉnh/Thành phố">
                    <Input size="large" prefix={<HomeOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={['address', 'district']} label="Quận/Huyện">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name={['address', 'ward']} label="Phường/Xã">
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={['address', 'detail']} label="Địa chỉ chi tiết">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  icon={<SaveOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Đổi mật khẩu" style={{ borderRadius: 16 }}>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                >
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateProfile;
