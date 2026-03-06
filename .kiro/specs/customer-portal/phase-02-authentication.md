# Phase 2: Authentication Specification

## Overview

Implement user authentication with Auth0, including signup, login, email verification, session management, and protected routes using Refine's AuthProvider pattern.

## Status: 🔄 IN PROGRESS (~85%)

---

## 2.1 Auth0 Configuration

### src/config/auth0.ts

```typescript
import { Auth0Client } from '@auth0/auth0-spa-js';
import { config } from './env';

export const auth0Config = {
  domain: config.auth0.domain,
  clientId: config.auth0.clientId,
  authorizationParams: {
    redirect_uri: config.auth0.redirectUri,
    audience: config.auth0.audience,
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
};

let auth0Client: Auth0Client | null = null;

export const getAuth0Client = async (): Promise<Auth0Client> => {
  if (!auth0Client) {
    auth0Client = new Auth0Client(auth0Config);
  }
  return auth0Client;
};
```

---

## 2.2 TypeScript Interfaces

### src/types/auth.types.ts

```typescript
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithRedirect: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
}
```

---

## 2.3 Auth0 Service

### src/services/Auth0Service.ts

```typescript
import { Auth0Client, User as Auth0User } from '@auth0/auth0-spa-js';
import { getAuth0Client, auth0Config } from '../config/auth0';
import { User, AuthTokens, SignUpData, SignInData } from '../types/auth.types';

class Auth0Service {
  private client: Auth0Client | null = null;

  private async getClient(): Promise<Auth0Client> {
    if (!this.client) {
      this.client = await getAuth0Client();
    }
    return this.client;
  }

  async signUp(data: SignUpData): Promise<void> {
    const client = await this.getClient();
    
    // Auth0 Universal Login handles signup
    // For custom UI, use Auth0 Management API via backend
    await client.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
        login_hint: data.email,
      },
    });
  }

  async signIn(data: SignInData): Promise<void> {
    const client = await this.getClient();
    
    await client.loginWithRedirect({
      authorizationParams: {
        login_hint: data.email,
      },
    });
  }

  async signInWithRedirect(): Promise<void> {
    const client = await this.getClient();
    await client.loginWithRedirect();
  }

  async handleRedirectCallback(): Promise<void> {
    const client = await this.getClient();
    await client.handleRedirectCallback();
  }

  async signOut(): Promise<void> {
    const client = await this.getClient();
    await client.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const client = await this.getClient();
    return client.isAuthenticated();
  }

  async getCurrentUser(): Promise<User | null> {
    const client = await this.getClient();
    const auth0User = await client.getUser();
    
    if (!auth0User) return null;

    return this.mapAuth0User(auth0User);
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const client = await this.getClient();
      return await client.getTokenSilently();
    } catch {
      return null;
    }
  }

  async refreshSession(): Promise<AuthTokens | null> {
    try {
      const client = await this.getClient();
      const token = await client.getTokenSilently({ cacheMode: 'off' });
      
      return {
        accessToken: token,
        idToken: '',
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };
    } catch {
      return null;
    }
  }

  private mapAuth0User(auth0User: Auth0User): User {
    return {
      id: auth0User.sub || '',
      email: auth0User.email || '',
      emailVerified: auth0User.email_verified || false,
      firstName: auth0User.given_name,
      lastName: auth0User.family_name,
      picture: auth0User.picture,
    };
  }
}

export const auth0Service = new Auth0Service();
```

---

## 2.4 Auth Service Wrapper

### src/services/AuthService.ts

```typescript
import { auth0Service } from './Auth0Service';
import { User, SignUpData, SignInData, AuthTokens } from '../types/auth.types';

class AuthService {
  async signUp(data: SignUpData): Promise<void> {
    return auth0Service.signUp(data);
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    // Auth0 handles email verification automatically
    // This is kept for API compatibility
    console.log('Email verification handled by Auth0', { email, code });
  }

  async signIn(data: SignInData): Promise<void> {
    return auth0Service.signIn(data);
  }

  async signInWithRedirect(): Promise<void> {
    return auth0Service.signInWithRedirect();
  }

  async handleRedirectCallback(): Promise<void> {
    return auth0Service.handleRedirectCallback();
  }

  async signOut(): Promise<void> {
    return auth0Service.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    return auth0Service.getCurrentUser();
  }

  async isAuthenticated(): Promise<boolean> {
    return auth0Service.isAuthenticated();
  }

  async refreshSession(): Promise<AuthTokens | null> {
    return auth0Service.refreshSession();
  }

  async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await auth0Service.getAccessToken();
    if (!accessToken) return null;

    return {
      accessToken,
      idToken: '',
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  }
}

export const authService = new AuthService();
```

---

## 2.5 Auth Context

### src/context/AuthContext.tsx

```typescript
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/AuthService';
import { User, SignUpData, SignInData, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Handle redirect callback
      if (window.location.search.includes('code=')) {
        await authService.handleRedirectCallback();
        window.history.replaceState({}, '', window.location.pathname);
      }

      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signUp = async (data: SignUpData): Promise<void> => {
    setError(null);
    await authService.signUp(data);
  };

  const signIn = async (data: SignInData): Promise<void> => {
    setError(null);
    await authService.signIn(data);
  };

  const signInWithRedirect = async (): Promise<void> => {
    setError(null);
    await authService.signInWithRedirect();
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    await authService.confirmSignUp(email, code);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    error,
    signUp,
    signIn,
    signOut,
    signInWithRedirect,
    confirmSignUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## 2.6 Login Form Component

### src/components/auth/LoginForm.tsx

```typescript
import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp }) => {
  const { signIn } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await signIn(values);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('NotAuthorizedException')) {
          setError('Invalid email or password');
        } else if (err.message.includes('UserNotConfirmedException')) {
          setError('Please verify your email before signing in');
        } else {
          setError('An error occurred. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '0 auto', marginTop: 50 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ textAlign: 'center', margin: 0 }}>
          Sign In
        </Title>

        {error && (
          <Alert
            type="error"
            message={error}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              type="email"
              placeholder="you@example.com"
              size="large"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          Don't have an account?{' '}
          <Button type="link" onClick={onSwitchToSignUp} style={{ padding: 0 }}>
            Sign Up
          </Button>
        </Text>
      </Space>
    </Card>
  );
};
```

---

## 2.7 Sign Up Form Component

### src/components/auth/SignUpForm.tsx

```typescript
import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSignUpSuccess: (email: string) => void;
}

interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const passwordRules = [
  { required: true, message: 'Password is required' },
  { min: 8, message: 'Password must be at least 8 characters' },
  {
    pattern: /[A-Z]/,
    message: 'Password must contain at least one uppercase letter',
  },
  {
    pattern: /[a-z]/,
    message: 'Password must contain at least one lowercase letter',
  },
  {
    pattern: /[0-9]/,
    message: 'Password must contain at least one number',
  },
  {
    pattern: /[!@#$%^&*(),.?":{}|<>]/,
    message: 'Password must contain at least one special character',
  },
];

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSwitchToLogin,
  onSignUpSuccess,
}) => {
  const { signUp } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: SignUpFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      onSignUpSuccess(values.email);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('UsernameExistsException')) {
          setError('An account with this email already exists');
        } else {
          setError('An error occurred. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 500, margin: '0 auto', marginTop: 50 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ textAlign: 'center', margin: 0 }}>
          Create Account
        </Title>

        {error && (
          <Alert
            type="error"
            message={error}
            closable
            onClose={() => setError(null)}
          />
        )}

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
                <Input
                  prefix={<UserOutlined />}
                  placeholder="John"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Doe"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              type="email"
              placeholder="you@example.com"
              size="large"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={passwordRules}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a strong password"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          Already have an account?{' '}
          <Button type="link" onClick={onSwitchToLogin} style={{ padding: 0 }}>
            Sign In
          </Button>
        </Text>
      </Space>
    </Card>
  );
};
```

---

## 2.8 Email Verification Component

### src/components/auth/EmailVerification.tsx

```typescript
import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBackToLogin,
}) => {
  const { confirmSignUp } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { code: string }) => {
    setLoading(true);
    setError(null);

    try {
      await confirmSignUp(email, values.code);
      onVerificationSuccess();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('CodeMismatchException')) {
          setError('Invalid verification code');
        } else if (err.message.includes('ExpiredCodeException')) {
          setError('Verification code has expired. Please request a new one.');
        } else {
          setError('An error occurred. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '0 auto', marginTop: 50 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ textAlign: 'center', margin: 0 }}>
          Verify Email
        </Title>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          We've sent a verification code to <strong>{email}</strong>
        </Text>

        {error && (
          <Alert
            type="error"
            message={error}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Verification Code"
            rules={[
              { required: true, message: 'Verification code is required' },
              { len: 6, message: 'Code must be 6 digits' },
            ]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder="Enter 6-digit code"
              size="large"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Verify Email
            </Button>
          </Form.Item>
        </Form>

        <Button type="link" onClick={onBackToLogin} block>
          Back to Login
        </Button>
      </Space>
    </Card>
  );
};
```

---

## 2.9 Protected Route Component

### src/components/auth/ProtectedRoute.tsx

```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

---

## 2.10 Login Page

### src/routes/LoginPage.tsx

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { EmailVerification } from '../components/auth/EmailVerification';

type AuthView = 'login' | 'signup' | 'verify';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSignUpSuccess = (email: string) => {
    setVerificationEmail(email);
    setView('verify');
  };

  const handleVerificationSuccess = () => {
    setView('login');
  };

  if (view === 'signup') {
    return (
      <SignUpForm
        onSwitchToLogin={() => setView('login')}
        onSignUpSuccess={handleSignUpSuccess}
      />
    );
  }

  if (view === 'verify') {
    return (
      <EmailVerification
        email={verificationEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={() => setView('login')}
      />
    );
  }

  return <LoginForm onSwitchToSignUp={() => setView('signup')} />;
};
```

---

## 2.11 Unit Tests

### src/components/auth/LoginForm.test.tsx

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../../context/AuthContext';

const mockSignIn = vi.fn();

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      signIn: mockSignIn,
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: null,
    }),
  };
});

const renderLoginForm = () => {
  const onSwitchToSignUp = vi.fn();
  render(
    <AuthProvider>
      <LoginForm onSwitchToSignUp={onSwitchToSignUp} />
    </AuthProvider>
  );
  return { onSwitchToSignUp };
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    renderLoginForm();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty submission', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    renderLoginForm();
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!@#');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test123!@#',
      });
    });
  });

  it('shows error message on invalid credentials', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('NotAuthorizedException'));
    renderLoginForm();
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
```

---

## 2.12 E2E Tests

### e2e/auth.e2e.test.ts

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Flow', () => {
    test('displays login form with required fields', async ({ page }) => {
      await expect(page.locator('label:has-text("Email")')).toBeVisible();
      await expect(page.locator('label:has-text("Password")')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test('shows validation errors for empty form', async ({ page }) => {
      await page.click('button:has-text("Sign In")');
      
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('validates email format', async ({ page }) => {
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button:has-text("Sign In")');
      
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    });
  });

  test.describe('Sign Up Flow', () => {
    test('navigates to signup form', async ({ page }) => {
      await page.click('button:has-text("Sign Up")');
      
      await expect(page.locator('h2:has-text("Create Account")')).toBeVisible();
    });

    test('validates password requirements', async ({ page }) => {
      await page.click('button:has-text("Sign Up")');
      await page.fill('input[type="password"]', 'weak');
      await page.click('button:has-text("Sign Up")');
      
      await expect(page.locator('text=at least 8 characters')).toBeVisible();
    });

    test('validates password confirmation', async ({ page }) => {
      await page.click('button:has-text("Sign Up")');
      await page.fill('input[type="password"]', 'Test123!@#');
      await page.fill('input[placeholder*="Confirm"]', 'Different123!');
      await page.click('button:has-text("Sign Up")');
      
      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('is keyboard navigable', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();
    });

    test('has proper autocomplete attributes', async ({ page }) => {
      await expect(page.locator('input[type="email"]')).toHaveAttribute('autocomplete', 'email');
      await expect(page.locator('input[type="password"]')).toHaveAttribute('autocomplete', 'current-password');
    });
  });
});
```

---

## Verification Commands

```bash
# Run unit tests
npm test -- src/components/auth/

# Run E2E tests
npm run test:e2e

# Type check
npm run type-check
```
