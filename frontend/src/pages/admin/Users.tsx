import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Input, Modal, Form, message, Spin, Row, Col, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { authAPI } from '@/services/api';
import { User } from '@/models';

const { Title, Text } = Typography;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, searchValue, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers({
        page,
        limit: 20,
        role: roleFilter || undefined,
        search: searchValue || undefined,
      });
      setUsers(response.data?.data?.users || []);
      setTotal(response.data?.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      if (editingUser) {
        await authAPI.updateUser(editingUser._id, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await authAPI.createAdmin(values);
        message.success('Tạo tài khoản admin thành công');
      }
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      loadUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar style={{ background: record.role === 'admin' ? '#1a1a2e' : '#667eea' }}>
            {record.fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.fullName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>
          {role === 'admin' ? 'Admin' : 'Thí sinh'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hoạt động' : 'Khóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: any, record: User) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
      ),
    },
  ];

  return (
    <div>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Quản lý Người dùng
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadUsers}>Tải lại</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingUser(null);
                form.resetFields();
                setModalVisible(true);
              }}>
                Thêm Admin
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm kiếm..."
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
            <select
              style={{ 
                width: '100%', 
                height: 40, 
                borderRadius: 8, 
                border: '1px solid #d9d9d9',
                padding: '0 12px',
              }}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              <option value="admin">Admin</option>
              <option value="candidate">Thí sinh</option>
            </select>
          </Col>
        </Row>

        <Table
          dataSource={users}
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

      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm Admin mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[{ required: true, type: 'email' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item 
              name="password" 
              label="Mật khẩu" 
              rules={[{ required: !editingUser, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <input type="checkbox" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
