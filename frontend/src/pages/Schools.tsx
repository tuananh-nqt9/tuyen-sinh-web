import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'umi';
import { Card, Row, Col, Input, Select, Spin, Typography, Space, Tag, Avatar, Empty, Button, Pagination, Layout, Divider } from 'antd';
const { Sider, Content } = Layout;
import { ApartmentOutlined, EnvironmentOutlined, GlobalOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { schoolAPI } from '@/services/api';
import { School } from '@/models';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const SchoolsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [province, setProvince] = useState<string>('');
  const [method, setMethod] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    loadSchools();
  }, [page, debouncedSearch, province, method]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.getAll({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        isActive: true,
      });
      setSchools(response.data?.schools || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const colors = ['#667eea', '#764ba2', '#4facfe', '#f093fb', '#00f2fe', '#fa709a', '#a8edea', '#fed6e3'];

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={1} style={{ marginBottom: 8 }}>
            <ApartmentOutlined style={{ marginRight: 16, color: '#667eea' }} />
            Trường đại học
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Khám phá danh sách các trường đại học hàng đầu Việt Nam
          </Paragraph>
        </div>

        <Layout style={{ background: 'transparent' }}>
          {/* Sidebar - Search & Filter */}
          <Sider
            width={300}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              marginRight: 24,
              height: 'fit-content',
              position: 'sticky',
              top: 88,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Title level={4} style={{ marginBottom: 24 }}>Tìm kiếm</Title>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Search
                placeholder="Tên trường, mã trường..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear
                size="large"
              />

              <Divider style={{ margin: '8px 0' }} />

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Tỉnh/Thành phố</Text>
                <Select
                  placeholder="Chọn tỉnh/thành"
                  style={{ width: '100%' }}
                  size="large"
                  allowClear
                  value={province || undefined}
                  onChange={(v) => setProvince(v || '')}
                >
                  <Select.Option value="Hà Nội">Hà Nội</Select.Option>
                  <Select.Option value="TP.HCM">TP. Hồ Chí Minh</Select.Option>
                  <Select.Option value="Đà Nẵng">Đà Nẵng</Select.Option>
                  <Select.Option value="Hải Phòng">Hải Phòng</Select.Option>
                  <Select.Option value="Cần Thơ">Cần Thơ</Select.Option>
                  <Select.Option value="Nghệ An">Nghệ An</Select.Option>
                </Select>
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Phương thức xét tuyển</Text>
                <Select
                  placeholder="Chọn phương thức"
                  style={{ width: '100%' }}
                  size="large"
                  allowClear
                  value={method || undefined}
                  onChange={(v) => setMethod(v || '')}
                >
                  <Select.Option value="exam">Xét điểm thi</Select.Option>
                  <Select.Option value="direct">Xét tuyển thẳng</Select.Option>
                  <Select.Option value="combination">Xét kết hợp</Select.Option>
                </Select>
              </div>

              <Button
                icon={<FilterOutlined />}
                size="large"
                block
                onClick={() => {
                  setSearchValue('');
                  setProvince('');
                  setMethod('');
                  setPage(1);
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </Space>
          </Sider>

          {/* Main Content */}
          <Content>
            {/* Result count */}
            {!loading && schools.length > 0 && (
              <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                Tìm thấy <strong>{total}</strong> trường đại học
              </Text>
            )}

            {/* Schools Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" />
              </div>
            ) : schools.length === 0 ? (
              <Card style={{ borderRadius: 16, textAlign: 'center', padding: 60 }}>
                <Empty description="Không tìm thấy trường nào phù hợp" />
              </Card>
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {schools.map((school, index) => (
                    <Col xs={24} sm={12} lg={8} key={school._id}>
                      <Link to={`/school/${school._id}`}>
                        <Card
                          hoverable
                          style={{
                            borderRadius: 20,
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            height: '100%',
                          }}
                          styles={{ body: { padding: 0 } }}
                        >
                          <div
                            style={{
                              height: 140,
                              background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 4) % colors.length]} 100%)`,
                              position: 'relative',
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
                                border: '3px solid rgba(255,255,255,0.5)',
                              }}
                            />
                            <Tag
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                background: 'rgba(255,255,255,0.9)',
                              }}
                            >
                              {school.code}
                            </Tag>
                          </div>

                          <div style={{ padding: 20 }}>
                            <Title level={5} style={{ marginBottom: 4 }} ellipsis={{ rows: 1 }}>
                              {school.name}
                            </Title>

                            {school.shortName && (
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {school.shortName}
                              </Text>
                            )}

                            <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 12 }}>
                              {school.address?.province && (
                                <Space>
                                  <EnvironmentOutlined style={{ color: '#888' }} />
                                  <Text type="secondary" style={{ fontSize: 13 }}>{school.address.province}</Text>
                                </Space>
                              )}
                              {school.website && (
                                <Space>
                                  <GlobalOutlined style={{ color: '#888' }} />
                                  <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ rows: 1 }}>{school.website}</Text>
                                </Space>
                              )}
                            </Space>

                            <div style={{ marginTop: 12 }}>
                              <Space size={4} wrap>
                                {school.admissionMethod?.slice(0, 3).map((m, i) => (
                                  <Tag
                                    key={i}
                                    color={['purple', 'blue', 'green'][i % 3]}
                                    style={{ marginRight: 0 }}
                                  >
                                    {m === 'exam' ? 'Xét điểm thi' :
                                     m === 'direct' ? 'Xét tuyển thẳng' :
                                     m === 'combination' ? 'Xét kết hợp' : m}
                                  </Tag>
                                ))}
                              </Space>
                            </div>

                            {school.tuitionRange && (
                              <div style={{ marginTop: 12, padding: 10, background: '#f5f7fa', borderRadius: 8 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Học phí</Text>
                                <div style={{ fontWeight: 600, color: '#667eea', fontSize: 13 }}>
                                  {school.tuitionRange.min?.toLocaleString()} - {school.tuitionRange.max?.toLocaleString()} VNĐ
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    </Col>
                  ))}
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
          </Content>
        </Layout>
      </div>
    </div>
  );
};

export default SchoolsPage;
