import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
    DashboardOutlined,
    UploadOutlined,
    SafetyCertificateOutlined,
    CreditCardOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems: MenuProps['items'] = [
        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/upload', icon: <UploadOutlined />, label: 'Upload' },
        { key: '/certificates', icon: <SafetyCertificateOutlined />, label: 'Certificates' },
        { key: '/subscription', icon: <CreditCardOutlined />, label: 'Subscription' },
        { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    const userMenuItems: MenuProps['items'] = [
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const handleUserMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            signOut();
        } else if (key === 'settings') {
            navigate('/settings');
        }
    };

    // Match settings/* paths to settings menu item
    const selectedKeys = location.pathname.startsWith('/settings')
        ? ['/settings']
        : [location.pathname];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider theme="light" width={220} style={{ borderRight: '1px solid #f0f0f0' }}>
                <div
                    style={{
                        padding: '16px',
                        textAlign: 'center',
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                        Customer Portal
                    </Text>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ border: 'none' }}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 24px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} trigger={['click']}>
                        <div
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Avatar src={user?.picture} icon={<UserOutlined />} />
                            <Text>{user?.firstName || user?.email}</Text>
                        </div>
                    </Dropdown>
                </Header>
                <Content
                    style={{
                        margin: 24,
                        padding: 24,
                        background: '#fff',
                        borderRadius: 8,
                        minHeight: 280,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
