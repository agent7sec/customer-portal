import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { UserOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProfileForm } from '../components/account/ProfileForm';
import { PasswordResetCard } from '../components/account/PasswordResetCard';
import { DeleteAccountForm } from '../components/account/DeleteAccountForm';

const { Content, Sider } = Layout;
const { Title } = Typography;

type SettingsView = 'profile' | 'password' | 'delete';

export const AccountSettingsPage: React.FC = () => {
    const [activeView, setActiveView] = React.useState<SettingsView>('profile');

    const menuItems = [
        { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
        { key: 'password', icon: <LockOutlined />, label: 'Password' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Delete Account', danger: true },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'profile':
                return <ProfileForm />;
            case 'password':
                return <PasswordResetCard />;
            case 'delete':
                return <DeleteAccountForm />;
            default:
                return <ProfileForm />;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
                <div style={{ padding: '24px' }}>
                    <Title level={4}>Account Settings</Title>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activeView]}
                    items={menuItems}
                    onClick={({ key }) => setActiveView(key as SettingsView)}
                />
            </Sider>
            <Content style={{ padding: '24px 48px' }}>
                {renderContent()}
            </Content>
        </Layout>
    );
};
