import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Input, Modal, Form, message, Spin, Row, Col, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import { combinationAPI, majorAPI, schoolAPI } from '@/services/api';
import { Combination, Major, School } from '@/models';

const { Title, Text } = Typography;

const AdminCombinations: React.FC = () => {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCombination, setEditingCombination] = useState<Combination | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadCombinations();
  }, [page, searchValue, majorFilter, schoolFilter]);

  const loadSchools = async () => {
    try {
      const response = await schoolAPI.getAll({ limit: 100, isActive: true });
      setSchools(response.data?.schools || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadMajors = async (schoolId?: string) => {
    try {
      if (schoolId) {
        const response = await majorAPI.getBySchool(schoolId);
        setMajors(response.data?.data || []);
      } else {
        const response = await majorAPI.getAll({ limit: 200, isActive: true });
        setMajors(response.data?.majors || []);
      }
    } catch (error) {
      console.error('Error loading majors:', error);
    }
  };

  const loadCombinations = async () => {
    try {
      setLoading(true);
      const response = await combinationAPI.getAll({
        page,
        limit: 20,
        search: searchValue || undefined,
        majorId: majorFilter || undefined,
        schoolId: schoolFilter || undefined,
      });
      setCombinations(response.data?.combinations || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading combinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      if (editingCombination) {
        await combinationAPI.update(editingCombination._id, values);
        message.success('Cập nhật tổ hợp thành công');
      } else {
        await combinationAPI.create(values);
        message.success('Tạo tổ hợp mới thành công');
      }
      setModalVisible(false);
      setEditingCombination(null);
      form.resetFields();
      loadCombinations();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (combination: Combination) => {
    setEditingCombination(combination);
    const major = typeof combination.major === 'object' ? combination.major as Major : null;
    const school = typeof combination.school === 'object' ? combination.school as School : null;
    form.setFieldsValue({
      ...combination,
      major: major?._id,
      school: school?._id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (combination: Combination) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa tổ hợp "${combination.name}" không?`,
      onOk: async () => {
        try {
          await combinationAPI.delete(combination._id);
          message.success('Xóa tổ hợp thành công');
          loadCombinations();
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
      width: 140,
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: 80,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Môn thi',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects: string[]) => subjects?.join(' + ') || '-',
    },
    {
      title: 'Ngành',
      key: 'major',
      render: (_: any, record: Combination) => {
        const major = typeof record.major === 'object' ? record.major as any : null;
        return major?.name || '-';
      },
    },
    {
      title: 'Trường',
      key: 'school',
      render: (_: any, record: Combination) => {
        const school = typeof record.school === 'object' ? record.school as any : null;
        return school?.name || '-';
      },
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
      render: (_: any, record: Combination) => (
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
              <TeamOutlined style={{ marginRight: 8 }} />
              Quản lý Tổ hợp xét tuyển
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadCombinations}>Tải lại</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingCombination(null);
                form.resetFields();
                setModalVisible(true);
              }}>
                Thêm tổ hợp
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
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
          <Col xs={12} md={8}>
            <Select
              placeholder="Lọc theo trường"
              style={{ width: '100%' }}
              size="large"
              value={schoolFilter || undefined}
              onChange={(v) => {
                setSchoolFilter(v || '');
                setMajorFilter('');
                if (v) loadMajors(v);
                else loadMajors();
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
          <Col xs={12} md={8}>
            <Select
              placeholder="Lọc theo ngành"
              style={{ width: '100%' }}
              size="large"
              value={majorFilter || undefined}
              onChange={(v) => {
                setMajorFilter(v || '');
                setPage(1);
              }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={majors.map(m => ({ value: m._id, label: `${m.name} (${m.code})` }))}
            />
          </Col>
        </Row>

        <Table
          dataSource={combinations}
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
        title={editingCombination ? 'Sửa tổ hợp' : 'Thêm tổ hợp mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCombination(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="school" label="Trường" rules={[{ required: true }]}>
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(v) => {
                    loadMajors(v);
                    form.setFieldValue('major', undefined);
                  }}
                  options={schools.map(s => ({ value: s._id, label: s.name }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="major" label="Ngành" rules={[{ required: true }]}>
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={majors.map(m => ({ value: m._id, label: `${m.name} (${m.code})` }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="code" label="Mã tổ hợp" rules={[{ required: true }]}>
                <Input placeholder="VD: A00-CNTT" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Tên tổ hợp" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="A00">A00 - Toán, Lý, Hóa</Select.Option>
                  <Select.Option value="A01">A01 - Toán, Lý, Anh</Select.Option>
                  <Select.Option value="B00">B00 - Toán, Hóa, Sinh</Select.Option>
                  <Select.Option value="C00">C00 - Văn, Sử, Địa</Select.Option>
                  <Select.Option value="D01">D01 - Toán, Văn, Anh</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingCombination ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCombinations;
