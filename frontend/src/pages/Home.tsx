import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'umi';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Statistic, 
  Carousel, 
  Tag,
  Spin,
  Typography,
  Space,
  Avatar,
  Progress
} from 'antd';
import {
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  RightOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  RocketOutlined,
  BulbOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { schoolAPI, majorAPI } from '@/services/api';
import { School, Major } from '@/models';
import { authService } from '@/services/auth';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const [schools, setSchools] = useState<School[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<'school' | 'major'>('school');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, majorsRes] = await Promise.all([
        schoolAPI.getAll({ limit: 6 }),
        majorAPI.getAll({ limit: 8 })
      ]);
      setSchools(schoolsRes.data?.schools || []);
      setMajors(majorsRes.data?.majors || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchType === 'school') {
      navigate(`/schools?search=${searchValue}`);
    } else {
      navigate(`/majors?search=${searchValue}`);
    }
  };

  const features = [
    {
      icon: <FileTextOutlined />,
      title: 'Đăng ký trực tuyến',
      description: 'Nộp hồ sơ xét tuyển mọi lúc, mọi nơi chỉ với vài thao tác đơn giản',
      color: '#667eea',
    },
    {
      icon: <CheckCircleOutlined />,
      title: 'Theo dõi trạng thái',
      description: 'Cập nhật real-time tình trạng xét duyệt hồ sơ của bạn',
      color: '#764ba2',
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: 'Bảo mật an toàn',
      description: 'Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn quốc tế',
      color: '#f093fb',
    },
    {
      icon: <RocketOutlined />,
      title: 'Xử lý nhanh chóng',
      description: 'Quy trình xét duyệt được tối ưu hóa, rút ngắn thời gian chờ đợi',
      color: '#4facfe',
    },
  ];

  const statistics = [
    { title: 'Trường đại học', value: 150, suffix: '+', icon: <ApartmentOutlined />, color: '#667eea' },
    { title: 'Ngành đào tạo', value: 500, suffix: '+', icon: <BookOutlined />, color: '#764ba2' },
    { title: 'Thí sinh đăng ký', value: 50000, suffix: '+', icon: <TeamOutlined />, color: '#4facfe' },
    { title: 'Tỷ lệ trúng tuyển', value: 85, suffix: '%', icon: <TrophyOutlined />, color: '#f093fb' },
  ];

  return (
    <div style={{ background: '#f5f7fa' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          padding: '100px 0 120px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background shapes */}
        <div style={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: 50,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          animation: 'float 8s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -80,
          left: '30%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          animation: 'float 7s ease-in-out infinite',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ 
                color: '#fff',
                animation: 'fadeInUp 0.8s ease-out',
              }}>
                <Tag 
                  color="rgba(255,255,255,0.2)" 
                  style={{ 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontSize: 14,
                    padding: '4px 16px',
                    marginBottom: 24,
                  }}
                >
                  <RocketOutlined style={{ marginRight: 8 }} />
                  Năm học 2024 - 2025
                </Tag>
                
                <Title 
                  level={1} 
                  style={{ 
                    color: '#fff', 
                    fontSize: 48, 
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: 24,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  Hệ thống Tuyển sinh
                  <br />
                  <span style={{ fontSize: 36 }}>Đại học Trực tuyến</span>
                </Title>
                
                <Paragraph 
                  style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: 18, 
                    lineHeight: 1.8,
                    marginBottom: 32,
                    maxWidth: 500,
                  }}
                >
                  Đăng ký xét tuyển đại học dễ dàng, nhanh chóng với hệ thống trực tuyến hiện đại. 
                  Theo dõi trạng thái hồ sơ 24/7, nhận thông báo tức thì.
                </Paragraph>

                <Space size={16} wrap>
                  {isAuthenticated ? (
                    <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'}>
                      <Button 
                        type="primary" 
                        size="large" 
                        style={{ 
                          height: 56, 
                          paddingLeft: 40, 
                          paddingRight: 40,
                          fontSize: 16,
                          fontWeight: 600,
                          background: '#fff',
                          color: '#667eea',
                          border: 'none',
                          borderRadius: 28,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        }}
                      >
                        Đến Dashboard <ArrowRightOutlined style={{ marginLeft: 8 }} />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/register">
                        <Button 
                          type="primary" 
                          size="large" 
                          style={{ 
                            height: 56, 
                            paddingLeft: 40, 
                            paddingRight: 40,
                            fontSize: 16,
                            fontWeight: 600,
                            background: '#fff',
                            color: '#667eea',
                            border: 'none',
                            borderRadius: 28,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          }}
                        >
                          Đăng ký ngay <ArrowRightOutlined style={{ marginLeft: 8 }} />
                        </Button>
                      </Link>
                      <Link to="/schools">
                        <Button 
                          ghost 
                          size="large" 
                          style={{ 
                            height: 56, 
                            paddingLeft: 32, 
                            paddingRight: 32,
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#fff',
                            border: '2px solid rgba(255,255,255,0.5)',
                            borderRadius: 28,
                          }}
                        >
                          Khám phá trường
                        </Button>
                      </Link>
                    </>
                  )}
                </Space>
              </div>
            </Col>

            <Col xs={24} lg={10}>
              <Card
                style={{
                  borderRadius: 24,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ padding: 16 }}>
                  <Title level={4} style={{ marginBottom: 24, textAlign: 'center' }}>
                    <SearchOutlined style={{ marginRight: 8, color: '#667eea' }} />
                    Tìm kiếm nhanh
                  </Title>
                  
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Select
                      value={searchType}
                      onChange={setSearchType}
                      style={{ width: '100%', height: 48 }}
                      size="large"
                      options={[
                        { value: 'school', label: 'Tìm theo trường' },
                        { value: 'major', label: 'Tìm theo ngành' },
                      ]}
                    />
                    
                    <Search
                      placeholder={searchType === 'school' ? 'Nhập tên trường...' : 'Nhập tên ngành...'}
                      size="large"
                      style={{ height: 48 }}
                      prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onSearch={handleSearch}
                      enterButton={
                        <Button 
                          type="primary" 
                          size="large"
                          style={{ height: 40, borderRadius: 8 }}
                        >
                          Tìm kiếm
                        </Button>
                      }
                    />
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Statistics Section */}
      <div style={{ 
        background: '#fff', 
        marginTop: -60, 
        marginLeft: 24, 
        marginRight: 24,
        borderRadius: 24,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 10,
      }}>
        <Row gutter={[24, 24]} style={{ padding: '40px 32px' }}>
          {statistics.map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <div style={{ textAlign: 'center' }}>
                <div 
                  style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    background: `${stat.color}15`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    fontSize: 28,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <Statistic 
                  value={stat.value} 
                  suffix={stat.suffix}
                  valueStyle={{ 
                    fontSize: 36, 
                    fontWeight: 700, 
                    color: '#333' 
                  }}
                />
                <Text type="secondary" style={{ fontSize: 14 }}>{stat.title}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features Section */}
      <div style={{ maxWidth: 1200, margin: '80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={2} style={{ marginBottom: 16 }}>
            Tại sao chọn chúng tôi?
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
            Hệ thống được thiết kế để mang lại trải nghiệm tốt nhất cho thí sinh và nhà trường
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                style={{ 
                  borderRadius: 16,
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                }}
                styles={{ body: { padding: 32 } }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    background: `${feature.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    color: feature.color,
                    marginBottom: 20,
                  }}
                >
                  {feature.icon}
                </div>
                <Title level={4} style={{ marginBottom: 12 }}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Schools Section */}
      <div style={{ 
        background: 'linear-gradient(180deg, #f5f7fa 0%, #fff 100%)',
        padding: '80px 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 40,
          }}>
            <div>
              <Title level={2} style={{ marginBottom: 8 }}>Trường đại học nổi bật</Title>
              <Text type="secondary">Khám phá các trường đại học hàng đầu</Text>
            </div>
            <Link to="/schools">
              <Button type="link" size="large">
                Xem tất cả <RightOutlined />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {schools.map((school, index) => (
                <Col xs={24} sm={12} lg={8} key={school._id}>
                  <Link to={`/school/${school._id}`}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                      }}
                      cover={
                        <div
                          style={{
                            height: 140,
                            background: `linear-gradient(135deg, ${['#667eea', '#764ba2', '#4facfe', '#f093fb', '#667eea', '#764ba2'][index]} 0%, ${['#f093fb', '#4facfe', '#00f2fe', '#667eea', '#764ba2', '#4facfe'][index]} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Avatar 
                            size={80} 
                            icon={<ApartmentOutlined />}
                            style={{ 
                              background: 'rgba(255,255,255,0.2)',
                              fontSize: 40,
                            }}
                          />
                        </div>
                      }
                    >
                      <Title level={4} style={{ marginBottom: 8 }}>{school.name}</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                        {school.address?.province || 'Việt Nam'}
                      </Text>
                      <Space wrap size="small">
                        {school.admissionMethod?.slice(0, 2).map((method, i) => (
                          <Tag key={i} color="purple">{method}</Tag>
                        ))}
                      </Space>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      {/* Majors Section */}
      <div style={{ maxWidth: 1200, margin: '80px auto', padding: '0 24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 40,
        }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>Ngành đào tạo</Title>
            <Text type="secondary">Các ngành học được quan tâm nhiều nhất</Text>
          </div>
          <Link to="/majors">
            <Button type="link" size="large">
              Xem tất cả <RightOutlined />
            </Button>
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {majors.map((major, index) => (
            <Col xs={12} sm={8} lg={6} key={major._id}>
              <Link to={`/majors?majorId=${major._id}`}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    textAlign: 'center',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  <Avatar
                    size={48}
                    style={{
                      background: `linear-gradient(135deg, ${['#667eea', '#764ba2', '#4facfe', '#f093fb', '#00f2fe', '#fa709a', '#667eea', '#764ba2'][index % 8]} 0%, ${['#f093fb', '#4facfe', '#667eea', '#764ba2', '#fa709a', '#fee140', '#764ba2', '#4facfe'][index % 8]} 100%)`,
                      marginBottom: 12,
                    }}
                    icon={<BookOutlined />}
                  />
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{major.name}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{major.code}</Text>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>

      {/* AI Assistant Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '80px 0',
        margin: '40px 0',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
            }}
          >
            <BulbOutlined style={{ fontSize: 48, color: '#fff' }} />
          </div>
          
          <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
            Trợ lý AI thông minh
          </Title>
          
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 32 }}>
            Đặt câu hỏi về ngành học, trường đại học, điều kiện xét tuyển...
            <br />
            AI sẽ tư vấn và gợi ý lựa chọn phù hợp nhất cho bạn!
          </Paragraph>

          <Link to={isAuthenticated ? '/candidate/dashboard' : '/login'}>
            <Button 
              type="primary" 
              size="large"
              icon={<MessageOutlined />}
              style={{ 
                height: 56, 
                paddingLeft: 40, 
                paddingRight: 40,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 28,
              }}
            >
              Trò chuyện với AI
            </Button>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        maxWidth: 800, 
        margin: '0 auto 80px', 
        padding: '0 24px',
        textAlign: 'center',
      }}>
        <Title level={2} style={{ marginBottom: 24 }}>Sẵn sàng bắt đầu?</Title>
        <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 32 }}>
          Đăng ký tài khoản ngay hôm nay và bắt đầu hành trình vào đại học mơ ước của bạn
        </Paragraph>
        
        <Space size="middle">
          <Link to="/register">
            <Button 
              type="primary" 
              size="large"
              style={{ 
                height: 48,
                paddingLeft: 32,
                paddingRight: 32,
                borderRadius: 24,
              }}
            >
              Đăng ký ngay
            </Button>
          </Link>
          <Link to="/contact">
            <Button 
              size="large"
              style={{ 
                height: 48,
                paddingLeft: 32,
                paddingRight: 32,
                borderRadius: 24,
              }}
            >
              Liên hệ hỗ trợ
            </Button>
          </Link>
        </Space>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
