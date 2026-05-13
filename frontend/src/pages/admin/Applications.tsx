import React, { useState, useEffect } from 'react';
import { useNavigate } from 'umi';
import { Card, Table, Tag, Button, Space, Typography, Input, Select, Modal, message, Spin, Row, Col, Statistic, Drawer } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, ReloadOutlined, FilterOutlined, FileTextOutlined } from '@ant-design/icons';
import { applicationAPI, schoolAPI } from '@/services/api';
import { Application, School } from '@/models';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statusModal, setStatusModal] = useState<{ visible: boolean; app: Application | null; action: string }>({ visible: false, app: null, action: '' });
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [page, statusFilter, schoolFilter, searchValue]);

  const loadSchools = async () => {
    try {
      const response = await schoolAPI.getAll({ limit: 100, isActive: true });
      setSchools(response.data?.schools || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getAll({
        page,
        limit: 20,
        status: statusFilter || undefined,
        schoolId: schoolFilter || undefined,
        search: searchValue || undefined,
      });
      setApplications(response.data?.applications || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModal.app) return;
    
    try {
      setUpdating(true);
      const status = statusModal.action === 'approve' ? 'approved' : 
                     statusModal.action === 'reject' ? 'rejected' : 'reviewing';
      
      await applicationAPI.updateStatus(statusModal.app._id, {
        status,
        notes: statusNotes,
      });
      
      message.success(`Đã ${statusModal.action === 'approve' ? 'chấp nhận' : statusModal.action === 'reject' ? 'từ chối' : 'cập nhật'} hồ sơ`);
      setStatusModal({ visible: false, app: null, action: '' });
      setStatusNotes('');
      loadApplications();
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

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'applicationCode',
      key: 'applicationCode',
      width: 140,
      render: (code: string) => <Text strong style={{ color: '#667eea' }}>{code}</Text>,
    },
    {
      title: 'Thí sinh',
      key: 'candidate',
      render: (_: any, record: Application) => {
        const candidate = typeof record.candidate === 'object' ? record.candidate as any : null;
        return (
          <Space direction="vertical" size="small">
            <Text>{candidate?.fullName || '-'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{candidate?.email}</Text>
          </Space>
        );
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
      title: 'Ngành',
      key: 'major',
      render: (_: any, record: Application) => {
        const major = typeof record.major === 'object' ? record.major as any : null;
        return major?.name || '-';
      },
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: any, record: Application) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/admin/application/${record._id}`)}
          >
            Chi tiết
          </Button>
          {['submitted', 'pending', 'reviewing'].includes(record.status) && (
            <>
              <Button 
                type="text" 
                icon={<CheckOutlined />} 
                onClick={() => setStatusModal({ visible: true, app: record, action: 'approve' })}
                style={{ color: '#52c41a' }}
              />
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={() => setStatusModal({ visible: true, app: record, action: 'reject' })}
                style={{ color: '#ff4d4f' }}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: total,
    pending: applications.filter(a => ['submitted', 'pending'].includes(a.status)).length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    processed: applications.filter(a => ['approved', 'rejected'].includes(a.status)).length,
  };

  return (
    <div>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Quản lý hồ sơ đăng ký
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Button icon={<ReloadOutlined />} onClick={loadApplications}>
              Tải lại
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Tổng" value={stats.total} valueStyle={{ color: '#667eea' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Chờ duyệt" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Đang xét" value={stats.reviewing} valueStyle={{ color: '#4facfe' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Đã xử lý" value={stats.processed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 16 }}>
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm mã hồ sơ, tên thí sinh..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setPage(1);
              }}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              size="large"
              value={statusFilter || undefined}
              onChange={(v) => {
                setStatusFilter(v || '');
                setPage(1);
              }}
              allowClear
            >
              <Select.Option value="submitted">Đã nộp</Select.Option>
              <Select.Option value="pending">Chờ duyệt</Select.Option>
              <Select.Option value="reviewing">Đang xét</Select.Option>
              <Select.Option value="approved">Đã chấp nhận</Select.Option>
              <Select.Option value="rejected">Từ chối</Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Trường"
              style={{ width: '100%' }}
              size="large"
              value={schoolFilter || undefined}
              onChange={(v) => {
                setSchoolFilter(v || '');
                setPage(1);
              }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={schools.map(s => ({ value: s._id, label: s.name }))}
            />
          </Col>
        </Row>

        <Table
          dataSource={applications}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: setPage,
            showSizeChanger: false,
          }}
          size="middle"
        />
      </Card>

      {/* Status Update Modal */}
      <Modal
        title={statusModal.action === 'approve' ? 'Chấp nhận hồ sơ' : statusModal.action === 'reject' ? 'Từ chối hồ sơ' : 'Cập nhật trạng thái'}
        open={statusModal.visible}
        onOk={handleUpdateStatus}
        onCancel={() => {
          setStatusModal({ visible: false, app: null, action: '' });
          setStatusNotes('');
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
        {statusModal.app && (
          <div>
            <Text>Mã hồ sơ: <strong>{statusModal.app.applicationCode}</strong></Text>
            <br /><br />
            <Text>Ghi chú (không bắt buộc):</Text>
            <Input.TextArea
              rows={4}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Nhập ghi chú cho thí sinh..."
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminApplications;
