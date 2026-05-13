import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Input, Modal, Form, message, Spin, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ApartmentOutlined } from '@ant-design/icons';
import { schoolAPI } from '@/services/api';
import { School } from '@/models';

const { Title, Text } = Typography;

const AdminSchools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSchools();
  }, [page, searchValue]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.getAll({
        page,
        limit: 20,
        search: searchValue || undefined,
      });
      setSchools(response.data?.schools || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      if (editingSchool) {
        await schoolAPI.update(editingSchool._id, values);
        message.success('Cập nhật trường thành công');
      } else {
        await schoolAPI.create(values);
        message.success('Tạo trường mới thành công');
      }
      setModalVisible(false);
      setEditingSchool(null);
      form.resetFields();
      loadSchools();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    form.setFieldsValue(school);
    setModalVisible(true);
  };

  const handleDelete = async (school: School) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa trường "${school.name}" không?`,
      onOk: async () => {
        try {
          await schoolAPI.delete(school._id);
          message.success('Xóa trường thành công');
          loadSchools();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Xóa thất bại');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: 'Tên trường',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: School) => (
        <Space>
          <ApartmentOutlined style={{ color: '#667eea' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Tỉnh/TP',
      key: 'province',
      render: (_: any, record: School) => record.address?.province || '-',
    },
    {
      title: 'Phương thức',
      key: 'methods',
      render: (_: any, record: School) => (
        <Space wrap>
          {record.admissionMethod?.map((m, i) => (
            <Tag key={i}>{m === 'exam' ? 'Thi' : m === 'direct' ? 'Thẳng' : m === 'combination' ? 'Kết hợp' : m}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hoạt động' : 'Không'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: School) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              <ApartmentOutlined style={{ marginRight: 8 }} />
              Quản lý Trường đại học
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadSchools}>Tải lại</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingSchool(null);
                form.resetFields();
                setModalVisible(true);
              }}>
                Thêm trường
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Row style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm trường..."
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
        </Row>

        <Table
          dataSource={schools}
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
        title={editingSchool ? 'Sửa trường' : 'Thêm trường mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSchool(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="code" label="Mã trường" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="shortName" label="Tên viết tắt">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="name" label="Tên trường" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name={['address', 'province']} label="Tỉnh/TP">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="website" label="Website">
            <Input />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingSchool ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSchools;
