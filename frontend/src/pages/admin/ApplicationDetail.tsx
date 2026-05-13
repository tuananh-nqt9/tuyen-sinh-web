import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'umi';
import { Card, Descriptions, Tag, Button, Space, Typography, Spin, Timeline, Divider, Row, Col, message, Modal, Input, Select, Tabs, Table, Avatar } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, FileTextOutlined, SaveOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { applicationAPI } from '@/services/api';
import { Application } from '@/models';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusModal, setStatusModal] = useState<{ visible: boolean; action: string }>({ visible: false, action: '' });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getById(id!);
      setApplication(response.data?.data);
    } catch (error) {
      console.error('Error loading application:', error);
      message.error('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!application) return;
    
    try {
      setUpdating(true);
      const status = statusModal.action === 'approve' ? 'approved' : 
                     statusModal.action === 'reject' ? 'rejected' : 
                     statusModal.action === 'reviewing' ? 'reviewing' : 'pending';
      
      await applicationAPI.updateStatus(application._id, { status, notes });
      
      message.success(`Đã cập nhật trạng thái`);
      setStatusModal({ visible: false, action: '' });
      setNotes('');
      loadApplication();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
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
      draft: 'Bản nháp',
      submitted: 'Đã nộp',
      pending: 'Chờ duyệt',
      reviewing: 'Đang xét',
      approved: 'Đã chấp nhận',
      rejected: 'Từ chối',
      waitlist: 'Danh sách chờ',
    };
    return texts[status] || status;
  };

  const getDocumentStatus = (type: string) => {
    const doc = application?.documents?.find(d => d.type === type);
    return doc ? { uploaded: true, verified: doc.verified } : { uploaded: false, verified: false };
  };

  const school = typeof application?.school === 'object' ? application?.school as any : null;
  const major = typeof application?.major === 'object' ? application?.major as any : null;
  const combination = typeof application?.combination === 'object' ? application?.combination as any : null;
  const candidate = typeof application?.candidate === 'object' ? application?.candidate as any : null;

  const documentTypes = [
    { key: 'academic_record', label: 'Học bạ THPT', icon: '📄' },
    { key: 'cccd_front', label: 'CCCD mặt trước', icon: '🪪' },
    { key: 'cccd_back', label: 'CCCD mặt sau', icon: '🪪' },
    { key: 'photo', label: 'Ảnh 3x4', icon: '📷' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return <Text>Không tìm thấy hồ sơ</Text>;
  }

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin hồ sơ',
      children: (
        <>
          <Card title="Thông tin đăng ký" style={{ marginBottom: 16 }}>
            <Descriptions column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Trường">{school?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngành">{major?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tổ hợp">{combination?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Môn thi">{combination?.subjects?.join(' + ') || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thông tin cá nhân" style={{ marginBottom: 16 }}>
            <Descriptions column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Họ và tên">{application.personalInfo?.fullName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {application.personalInfo?.dateOfBirth ? dayjs(application.personalInfo.dateOfBirth).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="CCCD">{application.personalInfo?.cccd || '-'}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {application.personalInfo?.gender === 'male' ? 'Nam' : 
                 application.personalInfo?.gender === 'female' ? 'Nữ' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">{application.personalInfo?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{application.personalInfo?.email || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thông tin học tập">
            <Descriptions column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Trường THPT">{application.academicInfo?.highSchool || '-'}</Descriptions.Item>
              <Descriptions.Item label="Năm tốt nghiệp">{application.academicInfo?.graduationYear || '-'}</Descriptions.Item>
              <Descriptions.Item label="Học lực">{application.academicInfo?.academicRecord || '-'}</Descriptions.Item>
              <Descriptions.Item label="Khu vực">{application.academicInfo?.priorityArea || '-'}</Descriptions.Item>
              <Descriptions.Item label="Đối tượng">{application.academicInfo?.priorityObject || '-'}</Descriptions.Item>
            </Descriptions>
            {application.academicInfo?.scores && (
              <>
                <Divider>Điểm thi</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                      <Text>{combination?.subjects?.[0] || 'Môn 1'}</Text>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>
                        {application.academicInfo.scores.subject1 || '-'}
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                      <Text>{combination?.subjects?.[1] || 'Môn 2'}</Text>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#764ba2' }}>
                        {application.academicInfo.scores.subject2 || '-'}
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                      <Text>{combination?.subjects?.[2] || 'Môn 3'}</Text>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#4facfe' }}>
                        {application.academicInfo.scores.subject3 || '-'}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </>
      ),
    },
    {
      key: 'documents',
      label: 'Tài liệu',
      children: (
        <Row gutter={[16, 16]}>
          {documentTypes.map(doc => {
            const status = getDocumentStatus(doc.key);
            return (
              <Col xs={24} sm={12} key={doc.key}>
                <Card 
                  style={{ 
                    borderRadius: 12,
                    border: status.verified ? '2px solid #52c41a' : 
                           status.uploaded ? '2px solid #faad14' : 
                           '1px dashed #d9d9d9',
                  }}
                >
                  <Space>
                    <Text style={{ fontSize: 32 }}>{doc.icon}</Text>
                    <div>
                      <Text strong>{doc.label}</Text>
                      <div>
                        {status.verified ? (
                          <Tag color="success">Đã xác minh</Tag>
                        ) : status.uploaded ? (
                          <Tag color="warning">Chờ xác minh</Tag>
                        ) : (
                          <Text type="secondary">Chưa tải lên</Text>
                        )}
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      ),
    },
    {
      key: 'history',
      label: 'Lịch sử',
      children: (
        <Timeline
          items={application.statusHistory?.map((item, index) => ({
            color: index === 0 ? 'green' : 'blue',
            children: (
              <div>
                <Text strong>{getStatusText(item.status)}</Text>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {dayjs(item.changedAt).format('DD/MM/YYYY HH:mm')}
                </div>
                {item.notes && (
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.notes}</Text>
                )}
              </div>
            ),
          }))}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 24,
          background: `linear-gradient(135deg, ${application.status === 'approved' ? '#52c41a' : application.status === 'rejected' ? '#ff4d4f' : '#667eea'} 0%, ${application.status === 'approved' ? '#73d13d' : application.status === 'rejected' ? '#ff7875' : '#764ba2'} 100%)`,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              style={{ color: '#fff' }}
              onClick={() => navigate('/admin/applications')}
            >
              Quay lại
            </Button>
            <Title level={3} style={{ color: '#fff', margin: '16px 0 8px' }}>
              Hồ sơ: {application.applicationCode}
            </Title>
            <Space>
              <Tag 
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}
              >
                {getStatusText(application.status)}
              </Tag>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                Ngày nộp: {dayjs(application.createdAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            {['submitted', 'pending', 'reviewing'].includes(application.status) && (
              <Space>
                <Button 
                  icon={<ClockCircleOutlined />}
                  onClick={() => setStatusModal({ visible: true, action: 'reviewing' })}
                >
                  Đánh dấu đang xét
                </Button>
                <Button 
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  style={{ background: '#fff', color: '#52c41a', border: 'none' }}
                  onClick={() => setStatusModal({ visible: true, action: 'approve' })}
                >
                  Chấp nhận
                </Button>
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setStatusModal({ visible: true, action: 'reject' })}
                >
                  Từ chối
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {/* Candidate Info */}
      {candidate && (
        <Card style={{ borderRadius: 16, marginBottom: 24 }}>
          <Space>
            <Avatar size={48} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {candidate.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div>
              <Text strong style={{ display: 'block', fontSize: 16 }}>{candidate.fullName}</Text>
              <Space size="middle">
                <Text type="secondary"><MailOutlined /> {candidate.email}</Text>
                <Text type="secondary"><PhoneOutlined /> {candidate.phone || '-'}</Text>
              </Space>
            </div>
          </Space>
        </Card>
      )}

      {/* Tabs */}
      <Card style={{ borderRadius: 16 }}>
        <Tabs items={tabItems} />
      </Card>

      {/* Status Modal */}
      <Modal
        title={statusModal.action === 'approve' ? 'Chấp nhận hồ sơ' : statusModal.action === 'reject' ? 'Từ chối hồ sơ' : 'Đánh dấu đang xét'}
        open={statusModal.visible}
        onOk={handleUpdateStatus}
        onCancel={() => {
          setStatusModal({ visible: false, action: '' });
          setNotes('');
        }}
        okText={statusModal.action === 'approve' ? 'Chấp nhận' : statusModal.action === 'reject' ? 'Từ chối' : 'Cập nhật'}
        okButtonProps={{ 
          loading: updating,
          style: { 
            background: statusModal.action === 'approve' ? '#52c41a' : 
                       statusModal.action === 'reject' ? '#ff4d4f' : undefined 
          }
        }}
      >
        <Text>Ghi chú:</Text>
        <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nhập ghi chú..." />
      </Modal>
    </div>
  );
};

export default AdminApplicationDetail;
