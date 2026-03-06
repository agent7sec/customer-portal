# Phase 15: Deployment Specification

## Overview

Configure AWS Amplify deployment with CI/CD pipeline.

## Status: ⏳ NOT STARTED

---

## 15.1 Amplify Configuration

### amplify.yml

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*

  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains'
        - key: 'X-Content-Type-Options'
          value: 'nosniff'
        - key: 'X-Frame-Options'
          value: 'DENY'
```

---

## 15.2 Environment Configuration

### .env.production

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.example.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 15.3 Build Verification Script

### scripts/verify-build.sh

```bash
#!/bin/bash
set -e

echo "Running type check..."
npm run type-check

echo "Running linting..."
npm run lint

echo "Running unit tests..."
npm test

echo "Building application..."
npm run build

echo "Verifying build output..."
if [ ! -d "dist" ]; then
  echo "Error: Build output directory not found"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "Error: index.html not found in build output"
  exit 1
fi

echo "Build verification complete!"
```

---

## 15.4 GitHub Actions Workflow

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 15.5 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Build completes without errors
- [ ] Environment variables configured in Amplify
- [ ] Auth0 production URLs configured
- [ ] Stripe production keys set

### Post-deployment
- [ ] Health check endpoint responding
- [ ] Authentication flow working
- [ ] Payment processing functional
- [ ] File upload/download working
- [ ] SSL certificate valid

---

## Verification

```bash
# Local production build test
npm run build
npm run preview

# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```
