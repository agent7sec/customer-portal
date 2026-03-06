# Phase 1: Project Setup Specification

## Overview

Initialize the Customer Portal React application with Vite, TypeScript, Refine framework, and Ant Design component library.

## Status: ✅ COMPLETE

---

## 1.1 Project Initialization

### Create Vite React Project

```bash
npm create vite@latest customer-portal -- --template react-ts
cd customer-portal
npm install
```

### Install Core Dependencies

```bash
# Refine Framework
npm install @refinedev/core @refinedev/antd @refinedev/react-router-v6

# Ant Design
npm install antd

# Authentication & Payments
npm install @auth0/auth0-spa-js
npm install @stripe/react-stripe-js @stripe/stripe-js

# AWS
npm install aws-amplify

# HTTP Client
npm install axios

# Routing
npm install react-router-dom
```

### Install Dev Dependencies

```bash
# Testing
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test

# Code Quality
npm install -D eslint prettier typescript-eslint
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh
```

---

## 1.2 Project Structure

```
src/
├── assets/              # Static assets (images, fonts)
├── components/          # React components organized by feature
│   ├── auth/           # Authentication components
│   ├── account/        # Account management
│   ├── subscription/   # Subscription & payments
│   ├── upload/         # File upload
│   ├── analysis/       # Analysis tracking
│   ├── certificate/    # Certificate downloads
│   ├── shared/         # Reusable UI components
│   └── layout/         # Layout components
├── config/             # Configuration files
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── providers/          # Refine providers
├── routes/             # Page components
├── services/           # Business logic & API clients
├── test/               # Test setup and utilities
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

---

## 1.3 Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
```

### tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### tsconfig.app.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'e2e/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 1.4 Environment Configuration

### .env.example

```env
# API Gateway
VITE_API_GATEWAY_URL=https://api.example.com

# Auth0
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api.example.com

# AWS S3
VITE_S3_BUCKET=your-bucket-name
VITE_S3_REGION=us-east-1

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### src/config/env.ts

```typescript
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_GATEWAY_URL || '',
  },
  auth0: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
    redirectUri: window.location.origin,
  },
  s3: {
    bucket: import.meta.env.VITE_S3_BUCKET || '',
    region: import.meta.env.VITE_S3_REGION || 'us-east-1',
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
} as const;
```

---

## 1.5 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest --run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 1.6 Test Setup

### src/test/setup.ts

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Auth0
vi.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: vi.fn().mockImplementation(() => ({
    isAuthenticated: vi.fn().mockResolvedValue(false),
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getTokenSilently: vi.fn(),
    getUser: vi.fn(),
  })),
}));
```

---

## Verification

```bash
# Verify installation
npm run type-check
npm run lint
npm test
npm run dev
```
