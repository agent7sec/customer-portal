# Phase 10: Security Specification

## Overview

Implement security measures including CSP, input validation, and authorization.

## Status: ⏳ NOT STARTED

---

## 10.1 Content Security Policy

### amplify.yml (headers configuration)

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-Frame-Options'
        value: 'DENY'
      - key: 'X-XSS-Protection'
        value: '1; mode=block'
      - key: 'Content-Security-Policy'
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.auth0.com https://api.stripe.com https://*.amazonaws.com; frame-src https://js.stripe.com;"
```

---

## 10.2 Input Validation Utilities

### src/utils/validation.ts

```typescript
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');
  return { valid: errors.length === 0, errors };
};
```

---

## 10.3 Authorization Hook

### src/hooks/useAuthorization.ts

```typescript
import { useAuth } from '../context/AuthContext';

export const useAuthorization = () => {
  const { user, isAuthenticated } = useAuth();

  const canAccessResource = (resourceUserId: string): boolean => {
    return isAuthenticated && user?.id === resourceUserId;
  };

  const hasSubscription = async (): Promise<boolean> => {
    // Check subscription status
    return true; // Implement actual check
  };

  return { canAccessResource, hasSubscription };
};
```

---

## 10.4 Secure API Client

### src/services/apiClient.ts

```typescript
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 30000,
});

// Add auth token to requests
apiClient.interceptors.request.use(async (cfg) => {
  const token = await auth0Service.getAccessToken();
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await auth0Service.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

---

## 10.5 Error Boundary

### src/components/shared/ErrorBoundary.tsx

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to monitoring service in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="Please refresh the page or try again later."
          extra={<Button type="primary" onClick={() => window.location.reload()}>Refresh</Button>}
        />
      );
    }
    return this.props.children;
  }
}
```

---

## Verification

```bash
npm run type-check
npm run lint
```
