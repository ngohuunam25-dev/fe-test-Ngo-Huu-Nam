import {
  CheckSquareOutlined,
  DashboardOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, theme } from 'antd';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface MainLayoutProps {}

const { Sider, Header, Content } = Layout;

const MainLayout: React.FC<MainLayoutProps> = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const { token } = theme.useToken();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: <Link to="/tasks">Tasks</Link>,
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={256}
        collapsedWidth={80}
        collapsible
        trigger={null}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '0 24px',
            borderBottom: '1px solid rgba(226, 232, 240, 0.1)',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckSquareOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                TaskBoard
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          // theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 24,
          }}
        />

        {/* User Profile */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid rgba(226, 232, 240, 0.1)',
            padding: 16,
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        ></div>
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Top Header */}
        <Header
          className="bg-[#FAFAFA]"
          style={{
            borderBottom: '1px solid rgba(226, 232, 240, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: 32,
            height: 64,
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            TaskBoard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            />
            <Avatar
              size="large"
              style={{ backgroundColor: '#6366f1' }}
              icon={<UserOutlined />}
            >
              U
            </Avatar>
          </div>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
