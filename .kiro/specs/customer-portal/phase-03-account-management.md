# Phase 3: Account Management Specification

## Overview

Implement user account management features including profile viewing/editing, password changes, and email updates using Auth0 Management API integration.

## Status: ⏳ NOT STARTED

---

## 3.1 TypeScript Interfaces

### src/types/account.types.ts

```typescript
export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  fullName: string;
  picture?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateEmailData {
  newEmail: string;
  password: string;
}
```

---

## 3.2 Account Service

### src/services/AccountService.ts

```typescript
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import { UserProfile, UpdateProfileData, ChangePasswordData, UpdateEmailData } from '../types/account.types';

class AccountService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await auth0Service.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getUserProfile(): Promise<UserProfile> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(`${config.api.baseUrl}/users/me`, { headers });
    return this.mapToUserProfile(response.data);
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const headers = await this.getAuthHeaders();
    const response = await axios.patch(
      `${config.api.baseUrl}/users/me`,
      {
        user_metadata: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          company: data.company,
          jobTitle: data.jobTitle,
        },
      },
      { headers }
    );
    return this.mapToUserProfile(response.data);
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const headers = await this.getAuthHeaders();
    await axios.post(
      `${config.api.baseUrl}/users/me/change-password`,
      {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      },
      { headers }
    );
  }

  async updateEmail(data: UpdateEmailData): Promise<void> {
    const headers = await this.getAuthHeaders();
    await axios.post(
      `${config.api.baseUrl}/users/me/change-email`,
      {
        new_email: data.newEmail,
        password: data.password,
      },
      { headers }
    );
  }

  async deleteAccount(password: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    await axios.delete(`${config.api.baseUrl}/users/me`, {
      headers,
      data: { password },
    });
  }

  private mapToUserProfile(data: any): UserProfile {
    return {
      id: data.user_id || data.sub,
      email: data.email,
      emailVerified: data.email_verified,
      firstName: data.user_metadata?.firstName || data.given_name || '',
      lastName: data.user_metadata?.lastName || data.family_name || '',
      fullName: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
      picture: data.picture,
      phone: data.user_metadata?.phone,
      company: data.user_metadata?.company,
      jobTitle: data.user_metadata?.jobTitle,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const accountService = new AccountService();
```

---

## 3.3 Account Settings Page

### src/routes/AccountSettingsPage.tsx

```typescript
import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProfileForm } from '../components/account/ProfileForm';
import { PasswordChangeForm } from '../components/account/PasswordChangeForm';
import { EmailChangeForm } from '../components/account/EmailChangeForm';
import { DeleteAccountForm } from '../components/account/DeleteAccountForm';

const { Content, Sider } = Layout;
const { Title } = Typography;

type SettingsView = 'profile' | 'password' | 'email' | 'delete';

export const AccountSettingsPage: React.FC = () => {
  const [activeView, setActiveView] = React.useState<SettingsView>('profile');

  const menuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'password', icon: <LockOutlined />, label: 'Password' },
    { key: 'email', icon: <MailOutlined />, label: 'Email' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete Account', danger: true },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <ProfileForm />;
      case 'password':
        return <PasswordChangeForm />;
      case 'email':
        return <EmailChangeForm />;
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
```

---

## 3.4 Profile Form Component

### src/components/account/ProfileForm.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, notification, Spin, Avatar, Upload, Row, Col } from 'antd';
import { UserOutlined, PhoneOutlined, BankOutlined, IdcardOutlined } from '@ant-design/icons';
import { accountService } from '../../services/AccountService';
import { UserProfile, UpdateProfileData } from '../../types/account.types';

export const ProfileForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await accountService.getUserProfile();
      setProfile(data);
      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        jobTitle: data.jobTitle,
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to load profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: UpdateProfileData) => {
    setSaving(true);
    try {
      const updated = await accountService.updateProfile(values);
      setProfile(updated);
      notification.success({
        message: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card title="Profile Information" style={{ maxWidth: 600 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar size={80} src={profile?.picture} icon={<UserOutlined />} />
        <div style={{ marginTop: 8 }}>
          <Upload showUploadList={false}>
            <Button size="small">Change Photo</Button>
          </Upload>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="John" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Doe" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="phone" label="Phone Number">
          <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 000-0000" />
        </Form.Item>

        <Form.Item name="company" label="Company">
          <Input prefix={<BankOutlined />} placeholder="Acme Inc." />
        </Form.Item>

        <Form.Item name="jobTitle" label="Job Title">
          <Input prefix={<IdcardOutlined />} placeholder="Software Engineer" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
```

---

## 3.5 Password Change Form

### src/components/account/PasswordChangeForm.tsx

```typescript
import React, { useState } from 'react';
import { Form, Input, Button, Card, notification, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { accountService } from '../../services/AccountService';
import { ChangePasswordData } from '../../types/account.types';

const passwordRules = [
  { required: true, message: 'Password is required' },
  { min: 8, message: 'Password must be at least 8 characters' },
  { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter' },
  { pattern: /[a-z]/, message: 'Password must contain a lowercase letter' },
  { pattern: /[0-9]/, message: 'Password must contain a number' },
  { pattern: /[!@#$%^&*]/, message: 'Password must contain a special character' },
];

export const PasswordChangeForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: ChangePasswordData) => {
    setLoading(true);
    setSuccess(false);

    try {
      await accountService.changePassword(values);
      setSuccess(true);
      form.resetFields();
      notification.success({
        message: 'Success',
        description: 'Password changed successfully',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      notification.error({
        message: 'Error',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Change Password" style={{ maxWidth: 500 }}>
      {success && (
        <Alert
          type="success"
          message="Password changed successfully"
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: 'Current password is required' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={passwordRules}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
```

---

## 3.6 Unit Tests

### src/components/account/ProfileForm.test.tsx

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProfileForm } from './ProfileForm';
import { accountService } from '../../services/AccountService';

vi.mock('../../services/AccountService');

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(accountService.getUserProfile).mockResolvedValue(mockProfile);
  });

  it('loads and displays profile data', async () => {
    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });
  });

  it('submits updated profile', async () => {
    const user = userEvent.setup();
    vi.mocked(accountService.updateProfile).mockResolvedValue({
      ...mockProfile,
      firstName: 'Jane',
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(accountService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Jane' })
      );
    });
  });
});
```

---

## Verification

```bash
# Run account management tests
npm test -- src/components/account/

# Type check
npm run type-check
```
