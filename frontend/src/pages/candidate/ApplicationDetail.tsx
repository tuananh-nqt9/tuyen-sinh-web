import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'umi';
import { Card, Descriptions, Tag, Button, Space, Typography, Spin, Timeline, Divider, Row, Col, message, Modal, Upload, Progress, Empty } from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  CloseCircleOutlined, FileTextOutlined, UploadOutlined, 
  DownloadOutlined, PrinterOutlined, SendOutlined, UserOutlined
} from '@ant-design/icons';
import { applicationAPI } from '@/services/api';
import { Application } from '@/models';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const CandidateApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await applicationAPI.submit(id!);
      message.success('Nộp hồ sơ thành công!');
      loadApplication();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Nộp hồ sơ thất bại');
    } finally {
      setSubmitting(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleOutlined />;
      case 'rejected': return <CloseCircleOutlined />;
      case 'draft': return <FileTextOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getDocumentStatus = (type: string) => {
    const doc = application?.documents?.find(d => d.type === type);
    return doc ? { uploaded: true, verified: doc.verified } : { uploaded: false, verified: false };
  };

  const documentTypes = [
    { key: 'academic_record', label: 'Học bạ THPT', icon: '📄' },
    { key: 'cccd_front', label: 'CCCD mặt trước', icon: '🪪' },
    { key: 'cccd_back', label: 'CCCD mặt sau', icon: '🪪' },
    { key: 'photo', label: 'Ảnh 3x4', icon: '📷' },
  ];

  const school = typeof application?.school === 'object' ? application?.school as any : null;
  const major = typeof application?.major === 'object' ? application?.major as any : null;
  const combination = typeof application?.combination === 'object' ? application?.combination as any : null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return <Empty description="Không tìm thấy hồ sơ" />;
  }

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          borderRadius: 16,
          background: `linear-gradient(135deg, ${application.status === 'approved' ? '#52c41a' : application.status === 'rejected' ? '#ff4d4f' : '#667eea'} 0%, ${application.status === 'approved' ? '#73d13d' : application.status === 'rejected' ? '#ff7875' : '#764ba2'} 100%)`,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Space direction="vertical" size="middle">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                style={{ color: '#fff' }}
                onClick={() => navigate('/candidate/applications')}
              >
                Quay lại
              </Button>
              <Title level={2} style={{ color: '#fff', margin: 0 }}>
                Hồ sơ xét tuyển
              </Title>
              <Space>
                <Tag 
                  icon={getStatusIcon(application.status)}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none',
                    color: '#fff',
                    padding: '4px 16px',
                    fontSize: 14,
                  }}
                >
                  {getStatusText(application.status)}
                </Tag>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Mã hồ sơ: <strong>{application.applicationCode}</strong>
                </Text>
              </Space>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            {application.status === 'draft' && (
              <Button 
                type="primary" 
                size="large"
                icon={<SendOutlined />}
                loading={submitting}
                onClick={handleSubmit}
                style={{ 
                  background: '#fff', 
                  color: '#667eea',
                  border: 'none',
                  borderRadius: 12,
                }}
              >
                Nộp hồ sơ
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          {/* Application Info */}
          <Card title="Thông tin đăng ký" style={{ borderRadius: 16, marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Trường đại học">{school?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Mã trường">{school?.code || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngành đào tạo">{major?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Mã ngành">{major?.code || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tổ hợp xét tuyển">
                {combination?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Môn thi">
                {combination?.subjects?.join(' + ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Đợt xét tuyển">{application.admissionRound || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký">
                {dayjs(application.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Personal Info */}
          <Card title="Thông tin cá nhân" style={{ borderRadius: 16, marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Họ và tên">{application.personalInfo?.fullName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {application.personalInfo?.dateOfBirth ? dayjs(application.personalInfo.dateOfBirth).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {application.personalInfo?.gender === 'male' ? 'Nam' : 
                 application.personalInfo?.gender === 'female' ? 'Nữ' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Số CCCD">{application.personalInfo?.cccd || '-'}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{application.personalInfo?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{application.personalInfo?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {application.personalInfo?.address ? 
                  `${application.personalInfo.address.detail || ''}, ${application.personalInfo.address.ward || ''}, ${application.personalInfo.address.district || ''}, ${application.personalInfo.address.province || ''}` 
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Academic Info */}
          <Card title="Thông tin học tập" style={{ borderRadius: 16, marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Trường THPT">{application.academicInfo?.highSchool || '-'}</Descriptions.Item>
              <Descriptions.Item label="Năm tốt nghiệp">{application.academicInfo?.graduationYear || '-'}</Descriptions.Item>
              <Descriptions.Item label="Học lực">{application.academicInfo?.academicRecord || '-'}</Descriptions.Item>
              <Descriptions.Item label="Khu vực ưu tiên">{application.academicInfo?.priorityArea || '-'}</Descriptions.Item>
              <Descriptions.Item label="Đối tượng ưu tiên">{application.academicInfo?.priorityObject || '-'}</Descriptions.Item>
            </Descriptions>
            
            {application.academicInfo?.scores && (
              <>
                <Divider>Điểm thi THPT</Divider>
                <Row gutter={[24, 24]}>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
                      <Text type="secondary">{combination?.subjects?.[0] || 'Môn 1'}</Text>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#667eea' }}>
                        {application.academicInfo.scores.subject1 || '-'}
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
                      <Text type="secondary">{combination?.subjects?.[1] || 'Môn 2'}</Text>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#764ba2' }}>
                        {application.academicInfo.scores.subject2 || '-'}
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
                      <Text type="secondary">{combination?.subjects?.[2] || 'Môn 3'}</Text>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#4facfe' }}>
                        {application.academicInfo.scores.subject3 || '-'}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Card>

          {/* Documents */}
          <Card title="Tài liệu minh chứng" style={{ borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              {documentTypes.map(doc => {
                const status = getDocumentStatus(doc.key);
                return (
                  <Col xs={24} sm={12} key={doc.key}>
                    <Card 
                      size="small" 
                      style={{ 
                        borderRadius: 12,
                        border: status.verified ? '2px solid #52c41a' : 
                               status.uploaded ? '2px solid #faad14' : 
                               '1px dashed #d9d9d9',
                        background: status.verified ? '#f6ffed' : '#fafafa',
                      }}
                    >
                      <Space>
                        <Text style={{ fontSize: 24 }}>{doc.icon}</Text>
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
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Timeline */}
          <Card title="Lịch sử xử lý" style={{ borderRadius: 16, marginBottom: 24 }}>
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
          </Card>

          {/* Review Result */}
          {application.review && (
            <Card 
              title="Kết quả xét duyệt" 
              style={{ 
                borderRadius: 16, 
                marginBottom: 24,
                borderColor: application.status === 'approved' ? '#52c41a' : 
                            application.status === 'rejected' ? '#ff4d4f' : undefined,
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 48, 
                    color: application.status === 'approved' ? '#52c41a' : 
                           application.status === 'rejected' ? '#ff4d4f' : '#faad14',
                  }}>
                    {getStatusIcon(application.status)}
                  </div>
                  <Title level={4} style={{ margin: '8px 0' }}>
                    {getStatusText(application.status)}
                  </Title>
                </div>
                {application.review.notes && (
                  <div>
                    <Text type="secondary">Ghi chú:</Text>
                    <Paragraph>{application.review.notes}</Paragraph>
                  </div>
                )}
                {application.review.reviewedAt && (
                  <Text type="secondary">
                    Xét duyệt lúc: {dayjs(application.review.reviewedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                )}
              </Space>
            </Card>
          )}

          {/* Actions */}
          <Card title="Thao tác" style={{ borderRadius: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<DownloadOutlined />}>
                Tải phiếu báo điểm
              </Button>
              <Button block icon={<PrinterOutlined />}>
                In hồ sơ
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateApplicationDetail;
