# Phase 9: State Management & Notifications Specification

## Overview

Configure Refine state management, caching, and Ant Design notifications.

## Status: ⏳ NOT STARTED

---

## 9.1 Notification Provider

### src/providers/notificationProvider.ts

```typescript
import { notification } from 'antd';
import { NotificationProvider } from '@refinedev/core';

export const notificationProvider: NotificationProvider = {
  open: ({ message, description, type, key }) => {
    notification[type || 'info']({
      message,
      description,
      key,
      duration: type === 'error' ? 0 : 4.5,
    });
  },
  close: (key) => {
    notification.destroy(key);
  },
};
```

---

## 9.2 Data Provider

### src/providers/dataProvider.ts

```typescript
import { DataProvider } from '@refinedev/core';
import axios from 'axios';
import { auth0Service } from '../services/Auth0Service';
import { config } from '../config/env';

const api = axios.create({ baseURL: config.api.baseUrl });

api.interceptors.request.use(async (cfg) => {
  const token = await auth0Service.getAccessToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters }) => {
    const params = {
      page: pagination?.current || 1,
      limit: pagination?.pageSize || 10,
      sort: sorters?.[0]?.field,
      order: sorters?.[0]?.order,
    };
    const { data } = await api.get(`/${resource}`, { params });
    return { data: data.items, total: data.total };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await api.get(`/${resource}/${id}`);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const { data } = await api.post(`/${resource}`, variables);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await api.patch(`/${resource}/${id}`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await api.delete(`/${resource}/${id}`);
    return { data };
  },

  getApiUrl: () => config.api.baseUrl,
};
```

---

## 9.3 Auth Provider for Refine

### src/providers/authProvider.ts

```typescript
import { AuthProvider } from '@refinedev/core';
import { auth0Service } from '../services/Auth0Service';

export const authProvider: AuthProvider = {
  login: async () => {
    await auth0Service.signInWithRedirect();
    return { success: true };
  },

  logout: async () => {
    await auth0Service.signOut();
    return { success: true, redirectTo: '/login' };
  },

  check: async () => {
    const authenticated = await auth0Service.isAuthenticated();
    return { authenticated };
  },

  getIdentity: async () => {
    const user = await auth0Service.getCurrentUser();
    if (!user) return null;
    return { id: user.id, name: user.firstName, email: user.email, avatar: user.picture };
  },

  getPermissions: async () => null,
  onError: async (error) => ({ error }),
};
```

---

## 9.4 Refine App Configuration

### src/App.tsx (with Refine)

```typescript
import { Refine } from '@refinedev/core';
import { RefineKbarProvider } from '@refinedev/kbar';
import routerBindings from '@refinedev/react-router-v6';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { notificationProvider } from './providers/notificationProvider';
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
          <AntdApp>
            <Refine
              authProvider={authProvider}
              dataProvider={dataProvider}
              notificationProvider={notificationProvider}
              routerProvider={routerBindings}
              resources={[
                { name: 'analyses', list: '/dashboard', show: '/analyses/:id' },
                { name: 'certificates', list: '/certificates' },
                { name: 'subscriptions', show: '/subscription' },
              ]}
              options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
            >
              <AppRoutes />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 9.5 Loading Components

### src/components/shared/LoadingOverlay.tsx

```typescript
import React from 'react';
import { Spin } from 'antd';

export const LoadingOverlay: React.FC = () => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: 'rgba(255,255,255,0.8)', zIndex: 1000,
  }}>
    <Spin size="large" />
  </div>
);
```

---

## Verification

```bash
npm run type-check
npm run dev
```
