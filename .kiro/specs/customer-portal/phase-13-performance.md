# Phase 13: Performance Optimization Specification

## Overview

Implement code splitting, lazy loading, and caching strategies.

## Status: ⏳ NOT STARTED

---

## 13.1 Code Splitting with Lazy Loading

### src/routes/index.tsx

```typescript
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// Lazy load route components
const DashboardPage = lazy(() => import('./DashboardPage'));
const UploadPage = lazy(() => import('./UploadPage'));
const CertificatesPage = lazy(() => import('./CertificatesPage'));
const SubscriptionPage = lazy(() => import('./SubscriptionPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));

const LazyLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>}>
    {children}
  </Suspense>
);

export { DashboardPage, UploadPage, CertificatesPage, SubscriptionPage, SettingsPage, LazyLoader };
```

---

## 13.2 React Query Configuration

### src/config/queryClient.ts

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 13.3 Custom Data Fetching Hook

### src/hooks/useAnalyses.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisService } from '../services/AnalysisService';

export const useAnalyses = () => {
  return useQuery({
    queryKey: ['analyses'],
    queryFn: () => analysisService.getAnalyses(),
  });
};

export const useAnalysis = (id: string) => {
  return useQuery({
    queryKey: ['analyses', id],
    queryFn: () => analysisService.getAnalysis(id),
    enabled: !!id,
  });
};
```

---

## 13.4 Vite Build Optimization

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

---

## 13.5 Image Optimization Component

### src/components/shared/OptimizedImage.tsx

```typescript
import React, { useState } from 'react';
import { Skeleton } from 'antd';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, width, height }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return <div style={{ width, height, background: '#f0f0f0' }} />;

  return (
    <>
      {!loaded && <Skeleton.Image active style={{ width, height }} />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </>
  );
};
```

---

## Verification

```bash
npm run build
npm run preview
# Check bundle size in dist/
```
