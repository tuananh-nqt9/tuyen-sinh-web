import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'umi';
import { Card, Row, Col, Input, Select, Spin, Typography, Space, Tag, Avatar, Empty, Pagination, Breadcrumb, Button } from 'antd';
import { BookOutlined, SearchOutlined, FilterOutlined, BankOutlined } from '@ant-design/icons';
import { majorAPI, schoolAPI } from '@/services/api';
import { Major, School } from '@/models';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const MajorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [majors, setMajors] = useState<Major[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [selectedSchool, setSelectedSchool] = useState<string>(searchParams.get('schoolId') || '');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadSchools();
    loadMajors();
  }, [page, searchValue, selectedSchool, selectedGroup]);

  const loadSchools = async () => {
    try {
      const response = await schoolAPI.getAll({ limit: 100, isActive: true });
      setSchools(response.data?.schools || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadMajors = async () => {
    try {
      setLoading(true);
      const response = await majorAPI.getAll({
        page,
        limit: 12,
        search: searchValue || undefined,
        schoolId: selectedSchool || undefined,
        group: selectedGroup || undefined,
        isActive: true,
      });
      setMajors(response.data?.majors || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading majors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const colors = ['#667eea', '#764ba2', '#4facfe', '#f093fb', '#00f2fe', '#fa709a'];

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ marginBottom: 16 }}>
            <BookOutlined style={{ marginRight: 16, color: '#764ba2' }} />
            Ngành đào tạo
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Khám phá các ngành đào tạo tại các trường đại học hàng đầu
          </Paragraph>
        </div>

        {/* Search & Filter */}
        <Card style={{ marginBottom: 32, borderRadius: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
              <Search
                placeholder="Tìm kiếm ngành..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={12} md={7}>
              <Select
                placeholder="Lọc theo trường"
                style={{ width: '100%' }}
                size="large"
                allowClear
                showSearch
                value={selectedSchool || undefined}
                onChange={(v) => {
                  setSelectedSchool(v || '');
                  setPage(1);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={schools.map(s => ({ value: s._id, label: s.name }))}
              />
            </Col>
            <Col xs={12} md={7}>
              <Select
                placeholder="Nhóm ngành"
                style={{ width: '100%' }}
                size="large"
                allowClear
                value={selectedGroup || undefined}
                onChange={(v) => {
                  setSelectedGroup(v || '');
                  setPage(1);
                }}
              >
                <Select.Option value="CN">Công nghệ</Select.Option>
                <Select.Option value="KT">Kinh tế</Select.Option>
                <Select.Option value="TM">Thương mại</Select.Option>
                <Select.Option value="SP">Sư phạm</Select.Option>
                <Select.Option value="NN">Ngôn ngữ</Select.Option>
                <Select.Option value="Luật">Luật</Select.Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Majors Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" />
          </div>
        ) : majors.length === 0 ? (
          <Empty description="Không tìm thấy ngành nào" />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {majors.map((major, index) => {
                const school = typeof major.school === 'object' ? major.school as School : null;
                return (
                  <Col xs={24} sm={12} lg={8} key={major._id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 16,
                        height: '100%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <Avatar
                          size={56}
                          style={{
                            background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 3) % colors.length]} 100%)`,
                            flexShrink: 0,
                          }}
                          icon={<BookOutlined />}
                        />
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ display: 'block', fontSize: 16, marginBottom: 4 }}>
                            {major.name}
                          </Text>
                          <Space size="small" style={{ marginBottom: 12 }}>
                            <Tag color="purple">{major.code}</Tag>
                            {major.degree && <Tag>{major.degree}</Tag>}
                          </Space>
                          
                          {school && (
                            <Link to={`/school/${typeof major.school === 'string' ? major.school : (major.school as School)._id}`}>
                              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                                <BankOutlined style={{ marginRight: 4 }} />
                                {school.name}
                              </Text>
                            </Link>
                          )}

                          <Row gutter={[8, 8]}>
                            {major.group && (
                              <Col span={12}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Nhóm: </Text>
                                <Text>{major.group}</Text>
                              </Col>
                            )}
                            {major.duration && (
                              <Col span={12}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Thời gian: </Text>
                                <Text>{major.duration} năm</Text>
                              </Col>
                            )}
                            {major.capacity && (
                              <Col span={12}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Chỉ tiêu: </Text>
                                <Text>{major.capacity}</Text>
                              </Col>
                            )}
                            {major.minScore && (
                              <Col span={12}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Điểm chuẩn: </Text>
                                <Text strong style={{ color: '#667eea' }}>{major.minScore}</Text>
                              </Col>
                            )}
                          </Row>

                          <Link to="/candidate/registration" style={{ marginTop: 12, display: 'block' }}>
                            <Button type="primary" size="small" block>
                              Đăng ký xét tuyển
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {total > 12 && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Pagination
                  current={page}
                  pageSize={12}
                  total={total}
                  onChange={setPage}
                  showSizeChanger={false}
                  size="large"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MajorsPage;
