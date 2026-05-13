import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'umi';
import { Card, Row, Col, Spin, Typography, Space, Tag, Button, Descriptions, List, Avatar, Empty, Divider, Breadcrumb } from 'antd';
import { 
  ApartmentOutlined, 
  EnvironmentOutlined, 
  GlobalOutlined, 
  PhoneOutlined, 
  MailOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { schoolAPI, majorAPI } from '@/services/api';
import { School, Major } from '@/models';

const { Title, Text, Paragraph } = Typography;

const SchoolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schoolRes, majorsRes] = await Promise.all([
        schoolAPI.getById(id!),
        majorAPI.getBySchool(id!)
      ]);
      setSchool(schoolRes.data?.data);
      setMajors(majorsRes.data?.data || []);
    } catch (error) {
      console.error('Error loading school:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!school) {
    return <Empty description="Không tìm thấy trường" />;
  }

  const colors = ['#667eea', '#764ba2', '#4facfe', '#f093fb'];

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/schools">Trường đại học</Link> },
            { title: school.name },
          ]}
        />

        {/* Hero Banner */}
        <Card
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            marginBottom: 32,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
          styles={{ body: { padding: 0 } }}
        >
          <div
            style={{
              height: 240,
              background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Avatar 
              size={120} 
              icon={<ApartmentOutlined />}
              style={{ 
                background: 'rgba(255,255,255,0.2)',
                fontSize: 60,
                border: '4px solid rgba(255,255,255,0.5)',
              }}
            />
            <Tag 
              style={{ 
                position: 'absolute', 
                top: 20, 
                right: 20,
                background: 'rgba(255,255,255,0.9)',
                fontSize: 16,
                padding: '4px 16px',
              }}
            >
              {school.code}
            </Tag>
          </div>

          <div style={{ padding: 32 }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} lg={16}>
                <Title level={2} style={{ marginBottom: 8 }}>{school.name}</Title>
                {school.shortName && (
                  <Text type="secondary" style={{ fontSize: 16 }}>({school.shortName})</Text>
                )}
                
                <Divider />
                
                <Descriptions column={{ xs: 1, md: 2 }}>
                  {school.address?.province && (
                    <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                      {school.address.detail}, {school.address.district}, {school.address.province}
                    </Descriptions.Item>
                  )}
                  {school.website && (
                    <Descriptions.Item label={<><GlobalOutlined /> Website</>}>
                      <a href={school.website} target="_blank" rel="noopener noreferrer">
                        {school.website}
                      </a>
                    </Descriptions.Item>
                  )}
                  {school.phone && (
                    <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>
                      {school.phone}
                    </Descriptions.Item>
                  )}
                  {school.email && (
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>
                      {school.email}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card style={{ background: '#f8f9fa', border: 'none' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">Phương thức xét tuyển</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space wrap>
                          {school.admissionMethod?.map((m, i) => (
                            <Tag key={i} color={['purple', 'blue', 'green', 'orange'][i % 4]}>
                              {m === 'exam' ? 'Xét điểm thi' : 
                               m === 'direct' ? 'Xét tuyển thẳng' : 
                               m === 'combination' ? 'Xét kết hợp' : 
                               m === 'mixed' ? 'Xét hỗn hợp' : m}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                    
                    {school.tuitionRange && (
                      <div>
                        <Text type="secondary">Học phí (VNĐ/học kỳ)</Text>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#667eea', marginTop: 4 }}>
                          {school.tuitionRange.min?.toLocaleString()} - {school.tuitionRange.max?.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Description */}
        {school.description && (
          <Card style={{ borderRadius: 16, marginBottom: 32 }}>
            <Title level={4}>
              <BookOutlined style={{ marginRight: 8 }} />
              Giới thiệu
            </Title>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
              {school.description}
            </Paragraph>
          </Card>
        )}

        {/* Admission Rounds */}
        {school.admissionRounds && school.admissionRounds.length > 0 && (
          <Card style={{ borderRadius: 16, marginBottom: 32 }}>
            <Title level={4}>
              <TrophyOutlined style={{ marginRight: 8 }} />
              Đợt xét tuyển
            </Title>
            <List
              dataSource={school.admissionRounds.filter(r => r.isActive)}
              renderItem={(round) => (
                <List.Item>
                  <List.Item.Meta
                    title={round.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text>
                          <strong>Ngày bắt đầu:</strong> {new Date(round.startDate).toLocaleDateString('vi-VN')}
                        </Text>
                        <Text>
                          <strong>Ngày kết thúc:</strong> {new Date(round.endDate).toLocaleDateString('vi-VN')}
                        </Text>
                        <Text>
                          <strong>Ngày công bố kết quả:</strong> {new Date(round.resultDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Majors */}
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={4} style={{ margin: 0 }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              Ngành đào tạo ({majors.length})
            </Title>
            <Link to="/candidate/registration">
              <Button type="primary" icon={<BookOutlined />}>
                Đăng ký xét tuyển
              </Button>
            </Link>
          </div>

          {majors.length === 0 ? (
            <Empty description="Chưa có ngành đào tạo" />
          ) : (
            <Row gutter={[16, 16]}>
              {majors.map((major, index) => (
                <Col xs={24} sm={12} lg={8} key={major._id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <Avatar
                        size={40}
                        style={{
                          background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`,
                        }}
                        icon={<BookOutlined />}
                      />
                      <div>
                        <Text strong style={{ display: 'block' }}>{major.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{major.code}</Text>
                      </div>
                    </div>
                    
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {major.group && <Tag>{major.group}</Tag>}
                      {major.capacity && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Chỉ tiêu: {major.capacity}
                        </Text>
                      )}
                      {major.minScore && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Điểm chuẩn dự kiến: {major.minScore}
                        </Text>
                      )}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>

        {/* Back Button */}
        <div style={{ marginTop: 32 }}>
          <Link to="/schools">
            <Button icon={<ArrowLeftOutlined />} size="large">
              Quay lại danh sách trường
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailPage;
