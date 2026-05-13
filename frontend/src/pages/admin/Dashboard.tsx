import React, { useState, useEffect } from 'react';
import { Link } from 'umi';
import { Card, Row, Col, Statistic, Typography, Space, Table, Tag, Button, Spin } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ApartmentOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowRightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { applicationAPI } from '@/services/api';
import { Application, Statistics } from '@/models';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes] = await Promise.all([
        applicationAPI.getStatistics(),
        applicationAPI.getAll({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);
      setStatistics(statsRes.data?.data);
      setRecentApplications(appsRes.data?.applications || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

  const statsData = statistics?.byStatus || [];
  const totalApplications = statistics?.total || 0;
  const pendingCount = statsData.find((s: any) => ['submitted', 'pending', 'reviewing'].includes(s._id))?.count || 0;
  const approvedCount = statsData.find((s: any) => s._id === 'approved')?.count || 0;
  const rejectedCount = statsData.find((s: any) => s._id === 'rejected')?.count || 0;

  const recentColumns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'applicationCode',
      key: 'applicationCode',
      render: (code: string) => <Text strong style={{ color: '#667eea' }}>{code}</Text>,
    },
    {
      title: 'Thí sinh',
      key: 'candidate',
      render: (_: any, record: Application) => {
        const candidate = typeof record.candidate === 'object' ? record.candidate as any : null;
        return candidate?.fullName || '-';
      },
    },
    {
      title: 'Trường',
      key: 'school',
      render: (_: any, record: Application) => {
        const school = typeof record.school === 'object' ? record.school as any : null;
        return school?.name || '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: Application) => (
        <Link to={`/admin/application/${record._id}`}>
          <Button type="link" size="small">Xem</Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Title level={3}>
          <DashboardOutlined style={{ marginRight: 8 }} />
          Dashboard Quản trị
        </Title>
        <Text type="secondary">Tổng quan về hệ thống tuyển sinh</Text>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Tổng hồ sơ</Text>}
              value={totalApplications}
              prefix={<FileTextOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Đang xử lý</Text>}
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Đã chấp nhận</Text>}
              value={approvedCount}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>Từ chối</Text>}
              value={rejectedCount}
              prefix={<CloseCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* By School */}
        <Col xs={24} lg={12}>
          <Card title="Hồ sơ theo trường" style={{ borderRadius: 16 }}>
            {statistics?.bySchool?.length > 0 ? (
              <Table
                dataSource={statistics.bySchool.map((item: any, index: number) => ({
                  ...item,
                  key: index,
                }))}
                columns={[
                  { title: 'Trường', dataIndex: 'name', key: 'name' },
                  { 
                    title: 'Số hồ sơ', 
                    dataIndex: 'count', 
                    key: 'count',
                    render: (count: number) => <Tag color="blue">{count}</Tag>
                  },
                  { 
                    title: 'Đã duyệt', 
                    dataIndex: 'approved', 
                    key: 'approved',
                    render: (count: number) => <Tag color="green">{count}</Tag>
                  },
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <Text type="secondary">Chưa có dữ liệu</Text>
            )}
          </Card>
        </Col>

        {/* By Major */}
        <Col xs={24} lg={12}>
          <Card title="Hồ sơ theo ngành" style={{ borderRadius: 16 }}>
            {statistics?.byMajor?.length > 0 ? (
              <Table
                dataSource={statistics.byMajor.map((item: any, index: number) => ({
                  ...item,
                  key: index,
                }))}
                columns={[
                  { title: 'Ngành', dataIndex: 'name', key: 'name' },
                  { 
                    title: 'Số hồ sơ', 
                    dataIndex: 'count', 
                    key: 'count',
                    render: (count: number) => <Tag color="purple">{count}</Tag>
                  },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            ) : (
              <Text type="secondary">Chưa có dữ liệu</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Applications */}
      <Card 
        title="Hồ sơ gần đây" 
        extra={<Link to="/admin/applications"><Button type="link">Xem tất cả</Button></Link>}
        style={{ borderRadius: 16, marginTop: 24 }}
      >
        <Table
          dataSource={recentApplications}
          columns={recentColumns}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
