import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'umi';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, theme } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  SolutionOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  HistoryOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const CandidateLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/candidate/dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/candidate/dashboard">Trang chủ</Link>,
    },
    {
      key: '/candidate/registration',
      icon: <FileTextOutlined />,
      label: <Link to="/candidate/registration">Đăng ký xét tuyển</Link>,
    },
    {
      key: '/candidate/applications',
      icon: <SolutionOutlined />,
      label: <Link to="/candidate/applications">Hồ sơ của tôi</Link>,
    },
    {
      key: '/candidate/profile',
      icon: <UserOutlined />,
      label: <Link to="/candidate/profile">Hồ sơ cá nhân</Link>,
    },
  ];

  const userDropdownItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: '/candidate/profile',
      icon: <SettingOutlined />,
      label: <Link to="/candidate/profile">Cài đặt</Link>,
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
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #764ba2 100%)`,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined style={{ fontSize: 28, color: '#fff' }} />
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
            TUYỂN SINH
          </span>
        </Link>

        <Space size="middle">
          <Badge count={0} size="small">
            <span style={{ color: '#fff', cursor: 'pointer' }}>
              <BellOutlined style={{ fontSize: 20 }} />
            </span>
          </Badge>

          <Dropdown menu={{ items: userDropdownItems }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#fff', color: token.colorPrimary }}>
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                marginBottom: 12,
              }}
              icon={<UserOutlined />}
            />
            <Text strong style={{ display: 'block', fontSize: 16 }}>{user?.fullName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
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

export default CandidateLayout;
