import React, { useState, useEffect } from 'react';
import { useNavigate } from 'umi';
import { Card, Table, Tag, Button, Space, Typography, Input, Select, Modal, message, Spin, Empty, Row, Col, Statistic } from 'antd';
import { 
  SearchOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, 
  ReloadOutlined, FilterOutlined, FileTextOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseCircleOutlined, SendOutlined
} from '@ant-design/icons';
import { applicationAPI } from '@/services/api';
import { Application } from '@/models';
import dayjs from 'dayjs';
import { Link } from 'umi';

const { Title, Text } = Typography;

const CandidateApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; id: string }>({ visible: false, id: '' });
  const [submitModal, setSubmitModal] = useState<{ visible: boolean; id: string; code: string }>({ visible: false, id: '', code: '' });

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getMy({
        status: statusFilter || undefined,
      });
      setApplications(response.data?.data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await applicationAPI.delete(deleteModal.id);
      message.success('Xóa hồ sơ thành công');
      setDeleteModal({ visible: false, id: '' });
      loadApplications();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleSubmit = async () => {
    try {
      await applicationAPI.submit(submitModal.id);
      message.success('Nộp hồ sơ thành công!');
      setSubmitModal({ visible: false, id: '', code: '' });
      loadApplications();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Nộp hồ sơ thất bại');
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

  const filteredApplications = applications.filter(app => {
    if (!searchValue) return true;
    const school = typeof app.school === 'object' ? (app.school as any)?.name || '' : '';
    const major = typeof app.major === 'object' ? (app.major as any)?.name || '' : '';
    const code = app.applicationCode || '';
    const search = searchValue.toLowerCase();
    return code.toLowerCase().includes(search) || 
           school.toLowerCase().includes(search) || 
           major.toLowerCase().includes(search);
  });

  const stats = {
    total: applications.length,
    draft: applications.filter(a => a.status === 'draft').length,
    pending: applications.filter(a => ['submitted', 'pending', 'reviewing'].includes(a.status)).length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'applicationCode',
      key: 'applicationCode',
      width: 150,
      render: (code: string) => (
        <Text strong style={{ color: '#667eea' }}>{code}</Text>
      ),
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
      title: 'Tổ hợp',
      key: 'combination',
      render: (_: any, record: Application) => {
        const combination = typeof record.combination === 'object' ? record.combination as any : null;
        return combination?.name || '-';
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
      width: 140,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={
          status === 'approved' ? <CheckCircleOutlined /> :
          status === 'rejected' ? <CloseCircleOutlined /> :
          status === 'draft' ? <FileTextOutlined /> :
          <ClockCircleOutlined />
        }>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_: any, record: Application) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/candidate/application/${record._id}`)}
          >
            Xem
          </Button>
          {record.status === 'draft' && (
            <>
              <Button 
                type="text" 
                icon={<SendOutlined />} 
                onClick={() => setSubmitModal({ visible: true, id: record._id, code: record.applicationCode })}
                style={{ color: '#52c41a' }}
              >
                Nộp
              </Button>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => setDeleteModal({ visible: true, id: record._id })}
              />
            </>
          )}
        </Space>
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
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Hồ sơ của tôi
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Link to="/candidate/registration">
              <Button type="primary" icon={<PlusOutlined />} size="large">
                Đăng ký mới
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Tổng hồ sơ" value={stats.total} valueStyle={{ color: '#667eea' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Bản nháp" value={stats.draft} valueStyle={{ color: '#888' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Đang xét duyệt" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic title="Đã có kết quả" value={stats.approved + stats.rejected} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 16 }}>
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm kiếm theo mã hồ sơ, trường, ngành..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              size="large"
              value={statusFilter || undefined}
              onChange={(v) => setStatusFilter(v || '')}
              allowClear
            >
              <Select.Option value="draft">Bản nháp</Select.Option>
              <Select.Option value="submitted">Đã nộp</Select.Option>
              <Select.Option value="pending">Chờ duyệt</Select.Option>
              <Select.Option value="approved">Đã chấp nhận</Select.Option>
              <Select.Option value="rejected">Từ chối</Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Button 
              icon={<ReloadOutlined />} 
              size="large" 
              block
              onClick={loadApplications}
            >
              Tải lại
            </Button>
          </Col>
        </Row>

        {/* Table */}
        {filteredApplications.length === 0 ? (
          <Empty 
            description={searchValue || statusFilter ? "Không tìm thấy hồ sơ phù hợp" : "Bạn chưa có hồ sơ đăng ký nào"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!searchValue && !statusFilter && (
              <Link to="/candidate/registration">
                <Button type="primary" icon={<PlusOutlined />}>
                  Đăng ký xét tuyển
                </Button>
              </Link>
            )}
          </Empty>
        ) : (
          <Table
            dataSource={filteredApplications}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              style: { cursor: 'pointer' },
              onClick: () => navigate(`/candidate/application/${record._id}`),
            })}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa hồ sơ"
        open={deleteModal.visible}
        onOk={handleDelete}
        onCancel={() => setDeleteModal({ visible: false, id: '' })}
        okText="Xóa"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa hồ sơ này không?</p>
        <p style={{ color: '#ff4d4f' }}>Lưu ý: Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        title="Xác nhận nộp hồ sơ"
        open={submitModal.visible}
        onOk={handleSubmit}
        onCancel={() => setSubmitModal({ visible: false, id: '', code: '' })}
        okText="Nộp hồ sơ"
        okButtonProps={{ style: { background: '#52c41a' } }}
      >
        <p>Bạn có chắc chắn muốn nộp hồ sơ <strong>{submitModal.code}</strong> không?</p>
        <p>Sau khi nộp, bạn sẽ không thể chỉnh sửa thông tin.</p>
      </Modal>
    </div>
  );
};

export default CandidateApplications;
