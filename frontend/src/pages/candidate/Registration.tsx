import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'umi';
import { 
  Card, Steps, Form, Input, Select, DatePicker, Radio, Row, Col, Button, 
  Typography, Space, Tag, message, Divider, Alert, Upload, List, Avatar, 
  Descriptions, Modal, Result, Spin
} from 'antd';
import {
  UserOutlined, ApartmentOutlined, BookOutlined, FileTextOutlined,
  UploadOutlined, DeleteOutlined, CheckCircleOutlined, ArrowLeftOutlined,
  ArrowRightOutlined, SaveOutlined, SendOutlined, CameraOutlined
} from '@ant-design/icons';
import { schoolAPI, majorAPI, combinationAPI, applicationAPI } from '@/services/api';
import { School, Major, Combination } from '@/models';
import { authService } from '@/services/auth';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const { Option } = Select;

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);
  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [createdApp, setCreatedApp] = useState<any>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.getAll({ limit: 100, isActive: true });
      setSchools(response.data?.schools || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMajors = async (schoolId: string) => {
    try {
      const response = await majorAPI.getBySchool(schoolId);
      setMajors(response.data?.data || []);
    } catch (error) {
      console.error('Error loading majors:', error);
    }
  };

  const loadCombinations = async (majorId: string) => {
    try {
      const response = await combinationAPI.getByMajor(majorId);
      setCombinations(response.data?.data || []);
    } catch (error) {
      console.error('Error loading combinations:', error);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find(s => s._id === schoolId);
    setSelectedSchool(school || null);
    setSelectedMajor(null);
    setSelectedCombination(null);
    setMajors([]);
    setCombinations([]);
    if (schoolId) {
      loadMajors(schoolId);
    }
  };

  const handleMajorChange = (majorId: string) => {
    const major = majors.find(m => m._id === majorId);
    setSelectedMajor(major || null);
    setSelectedCombination(null);
    setCombinations([]);
    if (majorId) {
      loadCombinations(majorId);
    }
  };

  const handleCombinationChange = (combinationId: string) => {
    const combination = combinations.find(c => c._id === combinationId);
    setSelectedCombination(combination || null);
  };

  const handleUpload = async (file: File, type: string) => {
    if (!createdApp) {
      message.error('Vui lòng lưu thông tin cơ bản trước');
      return false;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File phải nhỏ hơn 10MB!');
      return false;
    }

    try {
      const response = await applicationAPI.update(createdApp._id, {
        documents: [{ type, fileName: file.name }]
      });
      setDocuments(prev => ({ ...prev, [type]: file }));
      message.success(`Đã tải lên ${file.name}`);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Upload thất bại');
    }
    return false;
  };

  const handleCreateApplication = async () => {
    try {
      setSubmitting(true);
      const values = form.getFieldsValue();
      
      const response = await applicationAPI.create({
        school: selectedSchool?._id,
        major: selectedMajor?._id,
        combination: selectedCombination?._id,
        personalInfo: {
          fullName: values.fullName,
          dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
          gender: values.gender,
          cccd: values.cccd,
          phone: values.phone,
          email: values.email,
          address: values.address,
        },
        academicInfo: {
          highSchool: values.highSchool,
          graduationYear: values.graduationYear,
          academicRecord: values.academicRecord,
          scores: {
            subject1: values.subject1,
            subject2: values.subject2,
            subject3: values.subject3,
          },
          priorityObject: values.priorityObject,
          priorityArea: values.priorityArea,
        },
      });

      if (response.data.success) {
        setCreatedApp(response.data.data);
        message.success('Đã lưu thông tin hồ sơ!');
        setCurrent(1);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApplication = async () => {
    try {
      setSubmitting(true);
      await applicationAPI.submit(createdApp._id);
      message.success('Nộp hồ sơ thành công!');
      Modal.success({
        title: 'Nộp hồ sơ thành công!',
        content: 'Hồ sơ của bạn đã được gửi và đang chờ xét duyệt. Bạn sẽ nhận được email thông báo khi có cập nhật.',
        okText: 'Xem hồ sơ',
        onOk: () => navigate(`/candidate/application/${createdApp._id}`),
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Nộp hồ sơ thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { title: 'Chọn ngành', icon: <BookOutlined /> },
    { title: 'Thông tin cá nhân', icon: <UserOutlined /> },
    { title: 'Tài liệu', icon: <FileTextOutlined /> },
    { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
  ];

  const documentTypes = [
    { key: 'academic_record', label: 'Học bạ', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'cccd_front', label: 'CCCD mặt trước', accept: '.jpg,.jpeg,.png' },
    { key: 'cccd_back', label: 'CCCD mặt sau', accept: '.jpg,.jpeg,.png' },
    { key: 'photo', label: 'Ảnh 3x4', accept: '.jpg,.jpeg,.png' },
  ];

  const priorityAreas = [
    { value: 'KV1', label: 'Khu vực 1 (KV1)' },
    { value: 'KV2', label: 'Khu vực 2 (KV2)' },
    { value: 'KV2-NT', label: 'Khu vực 2 - Nông thôn (KV2-NT)' },
    { value: 'KV3', label: 'Khu vực 3 (KV3)' },
  ];

  const priorityObjects = [
    { value: '0', label: 'Không thuộc đối tượng ưu tiên' },
    { value: '1', label: 'Đối tượng 1 (OT1)' },
    { value: '2', label: 'Đối tượng 2 (OT2)' },
    { value: '3', label: 'Đối tượng 3 (OT3)' },
    { value: '4', label: 'Đối tượng 4 (OT4)' },
    { value: '5', label: 'Đối tượng 5 (OT5)' },
    { value: '6', label: 'Đối tượng 6 (OT6)' },
    { value: '7', label: 'Đối tượng 7 (OT7)' },
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
          <BookOutlined style={{ marginRight: 8 }} />
          Đăng ký xét tuyển
        </Title>
        <Paragraph type="secondary">
          Điền đầy đủ thông tin để đăng ký xét tuyển vào các trường đại học
        </Paragraph>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Steps current={current} items={steps} style={{ marginBottom: 40 }} />

        {current === 0 && (
          <div>
            <Title level={4}>Chọn trường và ngành xét tuyển</Title>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Form.Item label="Trường đại học" required>
                  <Select
                    placeholder="-- Chọn trường --"
                    value={selectedSchool?._id}
                    onChange={handleSchoolChange}
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={schools.map(s => ({ value: s._id, label: s.name }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Ngành đào tạo" required>
                  <Select
                    placeholder="-- Chọn ngành --"
                    value={selectedMajor?._id}
                    onChange={handleMajorChange}
                    size="large"
                    disabled={!selectedSchool}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={majors.map(m => ({ value: m._id, label: `${m.name} (${m.code})` }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            {selectedMajor && (
              <Alert
                message="Thông tin ngành"
                description={
                  <Descriptions size="small" column={2}>
                    <Descriptions.Item label="Mã ngành">{selectedMajor.code}</Descriptions.Item>
                    <Descriptions.Item label="Bậc đào tạo">{selectedMajor.degree}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian đào tạo">{selectedMajor.duration} năm</Descriptions.Item>
                    <Descriptions.Item label="Chỉ tiêu">{selectedMajor.capacity || 'Không giới hạn'}</Descriptions.Item>
                  </Descriptions>
                }
                type="info"
                style={{ marginBottom: 24 }}
              />
            )}

            {majors.length > 0 && (
              <Form.Item label="Tổ hợp xét tuyển" required>
                <Select
                  placeholder="-- Chọn tổ hợp --"
                  value={selectedCombination?._id}
                  onChange={handleCombinationChange}
                  size="large"
                  disabled={!selectedMajor}
                >
                  {combinations.map(c => (
                    <Option key={c._id} value={c._id}>
                      <Space>
                        <Tag color="purple">{c.name}</Tag>
                        <Text>{c.subjects?.join(', ')}</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Divider />

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                size="large"
                disabled={!selectedSchool || !selectedMajor || !selectedCombination}
                onClick={() => setCurrent(1)}
                icon={<ArrowRightOutlined />}
              >
                Tiếp tục
              </Button>
            </Space>
          </div>
        )}

        {current === 1 && (
          <div>
            <Title level={4}>Thông tin cá nhân</Title>
            
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                fullName: authService.getUser()?.fullName,
                email: authService.getUser()?.email,
                phone: authService.getUser()?.phone,
              }}
            >
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="fullName" label="Họ và tên" required>
                    <Input size="large" placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="dateOfBirth" label="Ngày sinh" required>
                    <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item name="gender" label="Giới tính" required>
                    <Radio.Group>
                      <Radio value="male">Nam</Radio>
                      <Radio value="female">Nữ</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="cccd" label="Số CCCD/CMND" required rules={[{ len: 12, message: 'CCCD phải 12 số' }]}>
                    <Input size="large" placeholder="Nhập số CCCD" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="phone" label="Số điện thoại" required>
                    <Input size="large" placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" required>
                    <Input size="large" placeholder="Nhập email" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="highSchool" label="Trường THPT" required>
                    <Input size="large" placeholder="Nhập tên trường THPT" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item name="graduationYear" label="Năm tốt nghiệp" required>
                    <Input size="large" type="number" placeholder="VD: 2024" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="academicRecord" label="Học lực" required>
                    <Select size="large" placeholder="Chọn học lực">
                      <Option value="Giỏi">Giỏi</Option>
                      <Option value="Khá">Khá</Option>
                      <Option value="Trung bình">Trung bình</Option>
                      <Option value="Yếu">Yếu</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Điểm thi THPT</Divider>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item name="subject1" label={selectedCombination?.subjects?.[0] || 'Môn 1'}>
                    <Input size="large" type="number" placeholder="0 - 10" min={0} max={10} step={0.1} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="subject2" label={selectedCombination?.subjects?.[1] || 'Môn 2'}>
                    <Input size="large" type="number" placeholder="0 - 10" min={0} max={10} step={0.1} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="subject3" label={selectedCombination?.subjects?.[2] || 'Môn 3'}>
                    <Input size="large" type="number" placeholder="0 - 10" min={0} max={10} step={0.1} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Đối tượng ưu tiên</Divider>

              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item name="priorityArea" label="Khu vực ưu tiên">
                    <Select size="large" placeholder="Chọn khu vực" allowClear>
                      {priorityAreas.map(a => (
                        <Option key={a.value} value={a.value}>{a.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="priorityObject" label="Đối tượng ưu tiên">
                    <Select size="large" placeholder="Chọn đối tượng" allowClear>
                      {priorityObjects.map(o => (
                        <Option key={o.value} value={o.value}>{o.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Divider />

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button size="large" onClick={() => setCurrent(0)} icon={<ArrowLeftOutlined />}>
                Quay lại
              </Button>
              <Space>
                <Button 
                  size="large" 
                  onClick={handleCreateApplication}
                  loading={submitting}
                  icon={<SaveOutlined />}
                >
                  Lưu tạm
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setCurrent(2)}
                  disabled={!createdApp}
                  icon={<ArrowRightOutlined />}
                >
                  Tiếp tục
                </Button>
              </Space>
            </Space>
          </div>
        )}

        {current === 2 && (
          <div>
            <Title level={4}>Tải lên tài liệu</Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              Vui lòng upload các tài liệu cần thiết. Chỉ chấp nhận file PDF, JPG, PNG, dung lượng tối đa 10MB.
            </Paragraph>

            <Row gutter={[24, 24]}>
              {documentTypes.map(doc => (
                <Col xs={24} md={12} key={doc.key}>
                  <Card 
                    style={{ 
                      borderRadius: 12,
                      border: documents[doc.key] ? '2px solid #52c41a' : '1px dashed #d9d9d9',
                      background: documents[doc.key] ? '#f6ffed' : '#fafafa',
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          {documents[doc.key] ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                          ) : (
                            <CameraOutlined style={{ color: '#888', fontSize: 20 }} />
                          )}
                          <Text strong>{doc.label}</Text>
                        </Space>
                        {documents[doc.key] && (
                          <Tag color="success">Đã tải lên</Tag>
                        )}
                      </div>
                      
                      {documents[doc.key] ? (
                        <div>
                          <Text type="secondary">{(documents[doc.key] as File)?.name}</Text>
                          <div style={{ marginTop: 8 }}>
                            <Button 
                              danger 
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => setDocuments(prev => {
                                const newDocs = { ...prev };
                                delete newDocs[doc.key];
                                return newDocs;
                              })}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Upload
                          beforeUpload={(file) => handleUpload(file, doc.key)}
                          showUploadList={false}
                          accept={doc.accept}
                        >
                          <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                      )}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            <Divider />

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button size="large" onClick={() => setCurrent(1)} icon={<ArrowLeftOutlined />}>
                Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrent(3)}
                icon={<ArrowRightOutlined />}
              >
                Xem trước & Xác nhận
              </Button>
            </Space>
          </div>
        )}

        {current === 3 && (
          <div>
            <Title level={4}>Xác nhận thông tin</Title>
            
            <Alert
              message="Kiểm tra kỹ thông tin trước khi nộp"
              description="Một khi nộp, bạn không thể chỉnh sửa thông tin. Vui lòng đảm bảo tất cả thông tin đã chính xác."
              type="warning"
              style={{ marginBottom: 24 }}
            />

            <Card title="Thông tin ngành đăng ký" style={{ marginBottom: 24 }}>
              <Descriptions column={{ xs: 1, md: 2 }}>
                <Descriptions.Item label="Trường">{selectedSchool?.name}</Descriptions.Item>
                <Descriptions.Item label="Ngành">{selectedMajor?.name}</Descriptions.Item>
                <Descriptions.Item label="Mã ngành">{selectedMajor?.code}</Descriptions.Item>
                <Descriptions.Item label="Tổ hợp xét tuyển">
                  <Tag color="purple">{selectedCombination?.name}</Tag>
                  {selectedCombination?.subjects?.join(' + ')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Thông tin cá nhân" style={{ marginBottom: 24 }}>
              <Descriptions column={{ xs: 1, md: 2 }}>
                <Descriptions.Item label="Họ và tên">{form.getFieldValue('fullName')}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{form.getFieldValue('dateOfBirth')?.format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="CCCD">{form.getFieldValue('cccd')}</Descriptions.Item>
                <Descriptions.Item label="Điện thoại">{form.getFieldValue('phone')}</Descriptions.Item>
                <Descriptions.Item label="Email">{form.getFieldValue('email')}</Descriptions.Item>
                <Descriptions.Item label="Trường THPT">{form.getFieldValue('highSchool')}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Tài liệu đã tải lên" style={{ marginBottom: 24 }}>
              {documentTypes.map(doc => (
                <div key={doc.key} style={{ marginBottom: 8 }}>
                  <Space>
                    {documents[doc.key] ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <Text type="secondary">-</Text>
                    )}
                    <Text>{doc.label}</Text>
                  </Space>
                </div>
              ))}
            </Card>

            <Divider />

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button size="large" onClick={() => setCurrent(2)} icon={<ArrowLeftOutlined />}>
                Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                loading={submitting}
                onClick={handleSubmitApplication}
                icon={<SendOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                }}
              >
                Nộp hồ sơ
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RegistrationPage;
