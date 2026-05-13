import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'umi';
import { Card, Row, Col, Statistic, Typography, Space, Tag, List, Avatar, Button, Spin, Progress, Divider, Badge, Input } from 'antd';
import {
  BellOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  PlusOutlined,
  RightOutlined,
  RobotOutlined,
  BulbOutlined,
  MessageOutlined,
  SendOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { applicationAPI, notificationAPI } from '@/services/api';
import { Application, Notification } from '@/models';
import { authService } from '@/services/auth';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý tuyển sinh. Bạn có câu hỏi gì về việc đăng ký xét tuyển không?' }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appRes, notifRes] = await Promise.all([
        applicationAPI.getMy(),
        notificationAPI.getAll({ limit: 5 }),
      ]);
      setApplications(appRes.data?.data || []);
      setNotifications(notifRes.data?.notifications || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['submitted', 'pending', 'reviewing'].includes(a.status)).length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      submitted: 'processing',
      pending: 'warning',
      reviewing: 'processing',
      approved: 'success',
      rejected: 'error',
      waitlist: 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: 'Nháp',
      submitted: 'Đã nộp',
      pending: 'Chờ duyệt',
      reviewing: 'Đang xét',
      approved: 'Đã chấp nhận',
      rejected: 'Từ chối',
      waitlist: 'Danh sách chờ',
    };
    return texts[status] || status;
  };

  const handleChat = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    const userMessage = chatMessage;
    setChatMessage('');

    setTimeout(() => {
      let response = '';
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('ngành') || lowerMsg.includes('trường')) {
        response = 'Bạn có thể xem danh sách trường và ngành tại mục "Khám phá" trên trang chủ. Nếu bạn cần tư vấn cụ thể, vui lòng liên hệ hotline 1900 xxxx.';
      } else if (lowerMsg.includes('điểm') || lowerMsg.includes('chuẩn')) {
        response = 'Điểm chuẩn của mỗi ngành/phương thức xét tuyển sẽ được công bố sau khi kết thúc đợt xét tuyển. Bạn có thể xem điểm chuẩn dự kiến trong thông tin từng ngành.';
      } else if (lowerMsg.includes('hồ sơ') || lowerMsg.includes('nộp')) {
        response = 'Để đăng ký xét tuyển, bạn cần: 1) Chọn trường và ngành, 2) Điền thông tin cá nhân, 3) Upload tài liệu minh chứng, 4) Nộp hồ sơ. Vào mục "Đăng ký xét tuyển" để bắt đầu!';
      } else if (lowerMsg.includes('tài liệu') || lowerMsg.includes('giấy')) {
        response = 'Bạn cần chuẩn bị: Ảnh CCCD (mặt trước và sau), Học bạ THPT, Giấy khai sinh, Ảnh 3x4 và các giấy tờ ưu tiên (nếu có).';
      } else if (lowerMsg.includes('ưu tiên')) {
        response = 'Đối tượng ưu tiên gồm: Khu vực ưu tiên (KV1, KV2, KV2-NT, KV3) và Đối tượng ưu tiên (từ OT1 đến OT7). Mỗi đối tượng được cộng điểm khác nhau từ 0 đến 2 điểm.';
      } else if (lowerMsg.includes('thời gian') || lowerMsg.includes('hạn')) {
        response = 'Thời gian xét tuyển phụ thuộc vào từng trường. Thông tin chi tiết về các đợt xét tuyển được cập nhật trong mục thông tin của từng trường.';
      } else {
        response = 'Cảm ơn câu hỏi của bạn! Để được hỗ trợ chi tiết hơn, bạn có thể: 1) Gọi hotline 1900 xxxx, 2) Gửi email về hotro@tuyensinh.edu.vn, 3) Truy cập mục Liên hệ trên website.';
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <Card
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <div style={{ color: '#fff' }}>
              <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
                Xin chào, {user?.fullName}!
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 16 }}>
                Chào mừng bạn đến với hệ thống tuyển sinh. Theo dõi và quản lý hồ sơ xét tuyển của bạn dễ dàng.
              </Paragraph>
              <Link to="/candidate/registration">
                <Button 
                  type="primary" 
                  ghost
                  icon={<PlusOutlined />}
                  size="large"
                  style={{ 
                    borderColor: '#fff', 
                    color: '#fff',
                    borderRadius: 24,
                    height: 48,
                  }}
                >
                  Đăng ký xét tuyển mới
                </Button>
              </Link>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrophyOutlined style={{ fontSize: 56, color: '#fff' }} />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Tổng hồ sơ"
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Đang xét duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Đã chấp nhận"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Applications */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>Hồ sơ gần đây</span>
              </Space>
            }
            extra={<Link to="/candidate/applications"><Button type="link">Xem tất cả</Button></Link>}
            style={{ borderRadius: 16 }}
          >
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <Text type="secondary">Bạn chưa có hồ sơ đăng ký nào</Text>
                <div>
                  <Link to="/candidate/registration">
                    <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 16 }}>
                      Đăng ký xét tuyển
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <List
                dataSource={applications.slice(0, 5)}
                renderItem={(app) => {
                  const school = typeof app.school === 'object' ? app.school as any : null;
                  const major = typeof app.major === 'object' ? app.major as any : null;
                  return (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/candidate/application/${app._id}`)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={48}
                            style={{
                              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                            }}
                            icon={<FileTextOutlined />}
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{major?.name || 'Ngành'}</Text>
                            <Tag color={getStatusColor(app.status)}>{getStatusText(app.status)}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary">{school?.name || 'Trường'}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Mã hồ sơ: {app.applicationCode} • {dayjs(app.createdAt).format('DD/MM/YYYY')}
                            </Text>
                          </Space>
                        }
                      />
                      <RightOutlined style={{ color: '#ccc' }} />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        {/* Notifications */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <BellOutlined />
                <span>Thông báo</span>
              </Space>
            }
            style={{ borderRadius: 16, height: '100%' }}
          >
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <BellOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <Text type="secondary">Không có thông báo mới</Text>
              </div>
            ) : (
              <List
                dataSource={notifications}
                renderItem={(notif) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text style={{ fontSize: 14 }}>{notif.title}</Text>}
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary" style={{ fontSize: 12 }}>{notif.message}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {dayjs(notif.createdAt).fromNow()}
                          </Text>
                        </Space>
                      }
                    />
                    {!notif.isRead && <Badge status="processing" />}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* AI Chatbot Button */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        {chatOpen && (
          <Card
            style={{
              width: 360,
              height: 480,
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              marginBottom: 16,
            }}
            styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 0 } }}
          >
            <div style={{
              padding: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px 16px 0 0',
            }}>
              <Space>
                <RobotOutlined style={{ fontSize: 24, color: '#fff' }} />
                <Text strong style={{ color: '#fff' }}>Trợ lý AI</Text>
              </Space>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : '#f5f5f5',
                      color: msg.role === 'user' ? '#fff' : '#333',
                    }}
                  >
                    <Text style={{ color: msg.role === 'user' ? '#fff' : '#333' }}>
                      {msg.content}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Nhập câu hỏi..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onPressEnter={handleChat}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleChat} />
              </Space.Compact>
            </div>
          </Card>
        )}
        
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={chatOpen ? <ArrowUpOutlined /> : <RobotOutlined />}
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
          }}
        />
      </div>
    </div>
  );
};

export default CandidateDashboard;
