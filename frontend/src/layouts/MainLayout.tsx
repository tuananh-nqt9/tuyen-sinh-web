import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'umi';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Space, Spin, theme } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  ApartmentOutlined,
  BookOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuOutlined,
  InfoCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { authService } from '@/services/auth';
import { notificationAPI } from '@/services/api';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();
  const { token } = theme.useToken();
  const [notifications, setNotifications] = useState<any>(null);
  const [loadingNoti, setLoadingNoti] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingNoti(true);
      notificationAPI.getAll({ limit: 5 })
        .then(res => setNotifications(res.data))
        .finally(() => setLoadingNoti(false));
    }
  }, [isAuthenticated]);

  const unreadCount = notifications?.unreadCount || 0;

  const publicMenuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
    { key: '/schools', icon: <ApartmentOutlined />, label: <Link to="/schools">Trường đại học</Link> },
    { key: '/majors', icon: <BookOutlined />, label: <Link to="/majors">Ngành đào tạo</Link> },
    { key: '/contact', icon: <InfoCircleOutlined />, label: <Link to="/contact">Liên hệ</Link> },
  ];

  const userMenuItems = user?.role === 'admin' 
    ? [...publicMenuItems, { key: '/admin', icon: <UserOutlined />, label: <Link to="/admin">Quản trị</Link> }]
    : [...publicMenuItems, { key: '/candidate', icon: <UserOutlined />, label: <Link to="/candidate">Hồ sơ của tôi</Link> }];

  const notificationItems = notifications?.notifications?.map((n: any) => ({
    key: n._id,
    label: (
      <div style={{ padding: '8px 0', maxWidth: 300 }}>
        <div style={{ fontWeight: 500 }}>{n.title}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{n.message}</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
          {new Date(n.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>
    ),
  })) || [];

  const userDropdownItems = [
    {
      key: user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard',
      icon: <HomeOutlined />,
      label: <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'}>Trang chủ</Link>,
    },
    {
      key: user?.role === 'admin' ? '/admin/users' : '/candidate/profile',
      icon: <UserOutlined />,
      label: <Link to={user?.role === 'admin' ? '/admin/users' : '/candidate/profile'}>Tài khoản</Link>,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ApartmentOutlined style={{ fontSize: 28, color: '#fff' }} />
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
              TUYỂN SINH
            </span>
          </Link>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={userMenuItems}
          style={{
            flex: 1,
            marginLeft: 40,
            background: 'transparent',
            border: 'none',
          }}
          theme="dark"
        />

        <Space size="middle">
          {isAuthenticated ? (
            <>
              <Dropdown
                menu={{ items: notificationItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Badge count={unreadCount} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 20, color: '#fff' }} />}
                    style={{ color: '#fff' }}
                  />
                </Badge>
              </Dropdown>

              <Dropdown menu={{ items: userDropdownItems }} trigger={['click']}>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar style={{ backgroundColor: '#fff', color: token.colorPrimary }}>
                    {user?.fullName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <span style={{ color: '#fff' }}>{user?.fullName}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="primary" ghost style={{ borderColor: '#fff', color: '#fff' }}>
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button style={{ backgroundColor: '#fff', color: token.colorPrimary }}>
                  Đăng ký
                </Button>
              </Link>
            </Space>
          )}
        </Space>
      </Header>

      <Content style={{ minHeight: 'calc(100vh - 64px - 70px)' }}>
        <Outlet />
      </Content>

      <Footer
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          padding: '40px 50px 20px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
            <div>
              <h3 style={{ color: '#fff', marginBottom: 16 }}>TUYỂN SINH</h3>
              <p style={{ color: '#aaa', lineHeight: 1.8 }}>
                Hệ thống đăng ký xét tuyển đại học trực tuyến hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 16 }}>Liên kết nhanh</h4>
              <Space direction="vertical" style={{ display: 'flex' }}>
                <Link to="/schools" style={{ color: '#aaa' }}>Danh sách trường</Link>
                <Link to="/majors" style={{ color: '#aaa' }}>Ngành đào tạo</Link>
                <Link to="/contact" style={{ color: '#aaa' }}>Liên hệ</Link>
              </Space>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 16 }}>Hỗ trợ</h4>
              <p style={{ color: '#aaa' }}>Hotline: 1900 xxxx</p>
              <p style={{ color: '#aaa' }}>Email: support@tuyensinh.edu.vn</p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 16 }}>Kết nối</h4>
              <Space>
                <a href="#" style={{ color: '#fff', fontSize: 20 }}>FB</a>
                <a href="#" style={{ color: '#fff', fontSize: 20 }}>YT</a>
                <a href="#" style={{ color: '#fff', fontSize: 20 }}>Zalo</a>
              </Space>
            </div>
          </div>
          <div
            style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop: '1px solid #333',
              textAlign: 'center',
              color: '#666',
            }}
          >
            © {new Date().getFullYear()} Hệ thống Tuyển sinh Đại học Trực tuyến. All rights reserved.
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
