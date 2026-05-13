import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Input, Modal, Form, message, Spin, Row, Col, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, BookOutlined } from '@ant-design/icons';
import { majorAPI, schoolAPI } from '@/services/api';
import { Major, School } from '@/models';

const { Title, Text } = Typography;

const AdminMajors: React.FC = () => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadMajors();
  }, [page, searchValue, schoolFilter]);

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
        limit: 20,
        search: searchValue || undefined,
        schoolId: schoolFilter || undefined,
      });
      setMajors(response.data?.majors || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading majors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      if (editingMajor) {
        await majorAPI.update(editingMajor._id, values);
        message.success('Cập nhật ngành thành công');
      } else {
        await majorAPI.create(values);
        message.success('Tạo ngành mới thành công');
      }
      setModalVisible(false);
      setEditingMajor(null);
      form.resetFields();
      loadMajors();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (major: Major) => {
    setEditingMajor(major);
    form.setFieldsValue({
      ...major,
      school: typeof major.school === 'string' ? major.school : (major.school as any)?._id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (major: Major) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa ngành "${major.name}" không?`,
      onOk: async () => {
        try {
          await majorAPI.delete(major._id);
          message.success('Xóa ngành thành công');
          loadMajors();
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
      title: 'Tên ngành',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Trường',
      key: 'school',
      render: (_: any, record: Major) => {
        const school = typeof record.school === 'object' ? record.school as any : null;
        return school?.name || '-';
      },
    },
    {
      title: 'Nhóm',
      dataIndex: 'group',
      key: 'group',
      render: (group: string) => group || '-',
    },
    {
      title: 'Chỉ tiêu',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => capacity || '-',
    },
    {
      title: 'Điểm chuẩn',
      dataIndex: 'minScore',
      key: 'minScore',
      render: (score: number) => score || '-',
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
      width: 100,
      render: (_: any, record: Major) => (
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
              <BookOutlined style={{ marginRight: 8 }} />
              Quản lý Ngành đào tạo
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadMajors}>Tải lại</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingMajor(null);
                form.resetFields();
                setModalVisible(true);
              }}>
                Thêm ngành
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm kiếm ngành..."
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
          <Col xs={24} md={12}>
            <Select
              placeholder="Lọc theo trường"
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
          dataSource={majors}
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
        title={editingMajor ? 'Sửa ngành' : 'Thêm ngành mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingMajor(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="code" label="Mã ngành" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="school" label="Trường" rules={[{ required: true }]}>
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={schools.map(s => ({ value: s._id, label: s.name }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="name" label="Tên ngành" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="group" label="Nhóm ngành">
                <Select allowClear>
                  <Select.Option value="CN">Công nghệ</Select.Option>
                  <Select.Option value="KT">Kinh tế</Select.Option>
                  <Select.Option value="TM">Thương mại</Select.Option>
                  <Select.Option value="SP">Sư phạm</Select.Option>
                  <Select.Option value="NN">Ngôn ngữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="degree" label="Bậc đào tạo">
                <Select>
                  <Select.Option value="Cử nhân">Cử nhân</Select.Option>
                  <Select.Option value="Kỹ sư">Kỹ sư</Select.Option>
                  <Select.Option value="Bác sĩ">Bác sĩ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="duration" label="Thời gian (năm)">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="capacity" label="Chỉ tiêu">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="minScore" label="Điểm chuẩn">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingMajor ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMajors;
