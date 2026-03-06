# Phase 12: Error Handling Specification

## Overview

Implement global error handling with React Error Boundaries and API error handling.

## Status: ⏳ NOT STARTED

---

## 12.1 Custom Error Classes

### src/types/errors.ts

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

---

## 12.2 Error Boundary Component

### src/components/shared/ErrorBoundary.tsx

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Result
          status="error"
          title="Something went wrong"
          subTitle={this.state.error?.message || 'An unexpected error occurred'}
          extra={[
            <Button key="retry" type="primary" onClick={this.handleReset}>Try Again</Button>,
            <Button key="home" onClick={() => window.location.href = '/'}>Go Home</Button>,
          ]}
        />
      );
    }
    return this.props.children;
  }
}
```

---

## 12.3 Error Handler Hook

### src/hooks/useErrorHandler.ts

```typescript
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ApiError, AuthenticationError } from '../types/errors';

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error: unknown) => {
    if (error instanceof AuthenticationError) {
      navigate('/login');
      return;
    }

    if (error instanceof ApiError) {
      notification.error({
        message: 'Error',
        description: error.message,
        duration: error.statusCode >= 500 ? 0 : 4.5,
      });
      return;
    }

    notification.error({
      message: 'Unexpected Error',
      description: error instanceof Error ? error.message : 'Please try again',
    });
  };

  return { handleError };
};
```

---

## 12.4 API Error Handling

### src/services/apiClient.ts (error interceptor)

```typescript
import axios from 'axios';
import { ApiError, AuthenticationError } from '../types/errors';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      throw new AuthenticationError();
    }
    
    throw new ApiError(
      error.response?.data?.message || 'Request failed',
      error.response?.status || 500,
      error.response?.data?.code
    );
  }
);

export { apiClient };
```

---

## 12.5 Not Found Page

### src/routes/NotFoundPage.tsx

```typescript
import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="Page Not Found"
      subTitle="The page you're looking for doesn't exist."
      extra={<Button type="primary" onClick={() => navigate('/')}>Go Home</Button>}
    />
  );
};
```

---

## Verification

```bash
npm run type-check
npm test -- src/components/shared/ErrorBoundary
```
