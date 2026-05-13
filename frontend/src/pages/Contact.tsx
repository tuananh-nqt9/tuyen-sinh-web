import React from 'react';
import { Card, Typography, Space, Row, Col, Divider, Input, Button, message } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactPage: React.FC = () => {
  const handleSubmit = () => {
    message.success('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
  };

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ marginBottom: 16 }}>
            Liên hệ hỗ trợ
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {/* Contact Info */}
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 20, height: '100%' }}>
              <Title level={4} style={{ marginBottom: 32 }}>Thông tin liên hệ</Title>
              
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <PhoneOutlined style={{ fontSize: 20, color: '#fff' }} />
                  </div>
                  <div>
                    <Text type="secondary">Hotline</Text>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>1900 xxxx</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Từ 8:00 - 17:00 (Thứ 2 - Thứ 6)</Text>
                  </div>
                </Space>

                <Divider style={{ margin: '8px 0' }} />

                <Space>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <MailOutlined style={{ fontSize: 20, color: '#fff' }} />
                  </div>
                  <div>
                    <Text type="secondary">Email</Text>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>hotro@tuyensinh.edu.vn</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Phản hồi trong 24h</Text>
                  </div>
                </Space>

                <Divider style={{ margin: '8px 0' }} />

                <Space>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <EnvironmentOutlined style={{ fontSize: 20, color: '#fff' }} />
                  </div>
                  <div>
                    <Text type="secondary">Địa chỉ</Text>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Hà Nội, Việt Nam</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Làm việc: 8:00 - 17:00</Text>
                  </div>
                </Space>
              </Space>
            </Card>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 20 }}>
              <Title level={4} style={{ marginBottom: 24 }}>Gửi tin nhắn</Title>
              
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Text strong>Họ và tên *</Text>
                    <Input placeholder="Nhập họ và tên của bạn" size="large" style={{ marginTop: 8 }} />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Email *</Text>
                    <Input placeholder="Nhập email của bạn" size="large" style={{ marginTop: 8 }} />
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Text strong>Số điện thoại</Text>
                    <Input placeholder="Nhập số điện thoại" size="large" style={{ marginTop: 8 }} />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Chủ đề</Text>
                    <Input placeholder="Chủ đề liên hệ" size="large" style={{ marginTop: 8 }} />
                  </Col>
                </Row>

                <div>
                  <Text strong>Nội dung *</Text>
                  <TextArea 
                    rows={6} 
                    placeholder="Nhập nội dung liên hệ..." 
                    style={{ marginTop: 8 }}
                  />
                </div>

                <Button 
                  type="primary" 
                  size="large"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 12,
                  }}
                >
                  Gửi liên hệ
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* FAQ */}
        <Card style={{ borderRadius: 20, marginTop: 32 }}>
          <Title level={4} style={{ marginBottom: 24 }}>Câu hỏi thường gặp</Title>
          
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ padding: 16, background: '#f5f7fa', borderRadius: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Làm sao để đăng ký xét tuyển?</Text>
              <Text type="secondary">Bạn cần đăng ký tài khoản, đăng nhập và chọn trường/ngành muốn xét tuyển. Sau đó điền đầy đủ thông tin và nộp hồ sơ.</Text>
            </div>
            
            <div style={{ padding: 16, background: '#f5f7fa', borderRadius: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Tôi quên mật khẩu thì phải làm sao?</Text>
              <Text type="secondary">Liên hệ hotline 1900 xxxx hoặc gửi email về hotro@tuyensinh.edu.vn để được hỗ trợ đặt lại mật khẩu.</Text>
            </div>
            
            <div style={{ padding: 16, background: '#f5f7fa', borderRadius: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Hồ sơ cần những giấy tờ gì?</Text>
              <Text type="secondary">Bạn cần chuẩn bị: Ảnh CCCD (mặt trước và sau), Học bạ, Giấy khai sinh, Ảnh 3x4 và các giấy tờ ưu tiên (nếu có).</Text>
            </div>
            
            <div style={{ padding: 16, background: '#f5f7fa', borderRadius: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Khi nào tôi biết kết quả xét tuyển?</Text>
              <Text type="secondary">Thời gian công bố kết quả phụ thuộc vào đợt xét tuyển của từng trường. Thông tin sẽ được cập nhật trên website và gửi email cho bạn.</Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
