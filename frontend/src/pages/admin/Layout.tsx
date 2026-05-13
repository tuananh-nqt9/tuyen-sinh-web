import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'umi';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Badge, theme } from 'antd';
import {
  DashboardOutlined,
  ApartmentOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  HomeOutlined,
  SettingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: '/admin/applications',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/applications">Hồ sơ đăng ký</Link>,
    },
    {
      key: 'management',
      icon: <AppstoreOutlined />,
      label: 'Quản lý danh mục',
      children: [
        {
          key: '/admin/schools',
          icon: <ApartmentOutlined />,
          label: <Link to="/admin/schools">Trường đại học</Link>,
        },
        {
          key: '/admin/majors',
          icon: <BookOutlined />,
          label: <Link to="/admin/majors">Ngành đào tạo</Link>,
        },
        {
          key: '/admin/combinations',
          icon: <TeamOutlined />,
          label: <Link to="/admin/combinations">Tổ hợp xét tuyển</Link>,
        },
      ],
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Người dùng</Link>,
    },
  ];

  const userDropdownItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: '/admin/users',
      icon: <SettingOutlined />,
      label: <Link to="/admin/users">Cài đặt</Link>,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        authService.logout();
        navigate('/');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApartmentOutlined style={{ fontSize: 28, color: '#667eea' }} />
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
            ADMIN PANEL
          </span>
        </Link>

        <Space size="middle">
          <Badge count={0} size="small">
            <span style={{ color: '#fff', cursor: 'pointer', fontSize: 20 }}>
              <BellOutlined />
            </span>
          </Badge>

          <Dropdown menu={{ items: userDropdownItems }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#667eea' }}>
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <span style={{ color: '#fff' }}>{user?.fullName}</span>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider
          width={240}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            position: 'fixed',
            left: 0,
            top: 64,
            bottom: 0,
            overflow: 'auto',
          }}
        >
          <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <Avatar
              size={64}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                marginBottom: 12,
              }}
              icon={<UserOutlined />}
            />
            <Text strong style={{ display: 'block', fontSize: 16 }}>{user?.fullName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Quản trị viên</Text>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ border: 'none', padding: '16px 0' }}
          />
        </Sider>

        <Content
          style={{
            marginLeft: 240,
            padding: 24,
            background: '#f5f7fa',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
