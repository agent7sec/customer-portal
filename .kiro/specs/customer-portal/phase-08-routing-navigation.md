# Phase 8: Routing & Navigation Specification

## Overview

Configure React Router with Refine, protected routes, and Ant Design layout.

## Status: ⏳ NOT STARTED

---

## 8.1 Route Configuration

### src/routes/index.tsx

```typescript
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Lazy load pages
const LoginPage = lazy(() => import('./LoginPage'));
const SignUpPage = lazy(() => import('./SignUpPage'));
const DashboardPage = lazy(() => import('./DashboardPage'));
const UploadPage = lazy(() => import('./UploadPage'));
const AnalysisDetailsPage = lazy(() => import('./AnalysisDetailsPage'));
const CertificatesPage = lazy(() => import('./CertificatesPage'));
const SubscriptionPage = lazy(() => import('./SubscriptionPage'));
const AccountSettingsPage = lazy(() => import('./AccountSettingsPage'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
      <Route path="/analyses/:id" element={<ProtectedRoute><AnalysisDetailsPage /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
      <Route path="/settings/*" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);
```

---

## 8.2 App Layout with Ant Design

### src/components/layout/AppLayout.tsx

```typescript
import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
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

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/upload', icon: <UploadOutlined />, label: 'Upload' },
    { key: '/certificates', icon: <SafetyCertificateOutlined />, label: 'Certificates' },
    { key: '/subscription', icon: <CreditCardOutlined />, label: 'Subscription' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const userMenuItems = [
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') signOut();
    else if (key === 'settings') navigate('/settings');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={220}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Text strong style={{ fontSize: 18 }}>Customer Portal</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={user?.picture} icon={<UserOutlined />} />
              <Text>{user?.firstName || user?.email}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
```

---

## 8.3 Updated App.tsx

### src/App.tsx

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/LoginPage';
import { SignUpPage } from './routes/SignUpPage';
import { DashboardPage } from './routes/DashboardPage';
import { UploadPage } from './routes/UploadPage';
import { CertificatesPage } from './routes/CertificatesPage';
import { SubscriptionPage } from './routes/SubscriptionPage';
import { AccountSettingsPage } from './routes/AccountSettingsPage';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected Routes with Layout */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/settings/*" element={<AccountSettingsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
```

---

## Verification

```bash
npm run dev
npm run type-check
```
