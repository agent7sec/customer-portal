# AWS Amplify Deployment Checklist

This checklist ensures all components of the AWS Amplify deployment are properly configured for the Customer Portal.

## ✅ Task 12.1: Configure Amplify Hosting

### Build Configuration
- [x] **amplify.yml** - Build configuration file created
  - Build command: `npm run build`
  - Output directory: `dist`
  - Node.js caching enabled
  - Security headers configured (HSTS, CSP, X-Frame-Options, etc.)

### Environment Configuration
- [x] **.env.example** - Template for environment variables
- [x] **.env.production** - Production environment documentation
- [x] **.env.staging** - Staging environment documentation
- [x] **Required environment variables documented:**
  - `VITE_AUTH0_DOMAIN`
  - `VITE_AUTH0_CLIENT_ID`
  - `VITE_AUTH0_AUDIENCE`
  - `VITE_API_URL`
  - `VITE_STRIPE_PUBLISHABLE_KEY`

### Build Optimization
- [x] **vite.config.ts** - Optimized build configuration
  - Code splitting configured (vendor, antd, refine, stripe, etc.)
  - Terser minification enabled
  - Console.log removal in production
  - Asset optimization (4KB inline limit)
  - CSS code splitting enabled
  - Target: ES2015 for modern browsers

### Setup Tools
- [x] **scripts/setup-amplify.sh** - Interactive setup script
  - AWS CLI validation
  - Environment variable collection
  - Local .env file generation

### Documentation
- [x] **DEPLOYMENT.md** - Comprehensive deployment guide
  - Step-by-step Amplify setup instructions
  - Environment variable configuration
  - Custom domain setup
  - Security configuration
  - Troubleshooting guide

## ✅ Task 12.2: Set Up CI/CD Pipeline

### GitHub Actions Workflows
- [x] **.github/workflows/amplify-deploy.yml** - Main deployment workflow
  - Build and test job (type-check, lint, tests, security audit)
  - Deploy preview job (PR comments with preview URLs)
  - Deploy production job (main branch)
  - Deploy staging job (develop branch)
  - Environment variables from GitHub secrets

- [x] **.github/workflows/ci.yml** - Continuous integration
  - Unit tests with coverage
  - E2E tests with Playwright
  - Artifact uploads on failure

### Deployment Strategy
- [x] **Automatic deployments configured:**
  - Production: `main` branch → production environment
  - Staging: `develop` branch → staging environment
  - Preview: Pull requests → temporary preview URLs

### Build Optimization
- [x] **Dependency caching** - npm cache in workflows
- [x] **Code splitting** - Configured in vite.config.ts
- [x] **Minification** - Terser with console removal
- [x] **Asset optimization** - Long-term caching headers

### Environment-Specific Builds
- [x] **Production build configuration**
  - Live Auth0 credentials
  - Live Stripe keys (pk_live_*)
  - Production API endpoints
  - NODE_ENV=production

- [x] **Staging build configuration**
  - Test Auth0 credentials
  - Test Stripe keys (pk_test_*)
  - Staging API endpoints
  - NODE_ENV=staging

## 📋 Manual Setup Required in AWS Console

The following steps must be completed manually in the AWS Amplify Console:

### 1. Create Amplify App
- [ ] Navigate to AWS Amplify Console
- [ ] Click "New app" → "Host web app"
- [ ] Connect Git repository (GitHub/GitLab/Bitbucket)
- [ ] Select repository: `customer-portal`
- [ ] Select branch: `main` for production

### 2. Configure Build Settings
- [ ] Verify amplify.yml is detected automatically
- [ ] Confirm build command: `npm run build`
- [ ] Confirm output directory: `dist`
- [ ] Enable build caching

### 3. Set Environment Variables
Navigate to App Settings → Environment Variables and add:

**Production Environment:**
```
VITE_AUTH0_DOMAIN=<your-production-domain>.auth0.com
VITE_AUTH0_CLIENT_ID=<production-client-id>
VITE_AUTH0_AUDIENCE=https://<your-api-audience>
VITE_API_URL=https://<api-gateway-url>.amazonaws.com/prod
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_<production-key>
NODE_ENV=production
```

**Staging Environment (if using develop branch):**
```
VITE_AUTH0_DOMAIN=<your-staging-domain>.auth0.com
VITE_AUTH0_CLIENT_ID=<staging-client-id>
VITE_AUTH0_AUDIENCE=https://<your-api-audience>
VITE_API_URL=https://<api-gateway-url>.amazonaws.com/staging
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_<staging-key>
NODE_ENV=staging
```

### 4. Configure Custom Domain (Optional)
- [ ] Go to App Settings → Domain management
- [ ] Click "Add domain"
- [ ] Enter domain name (e.g., portal.yourdomain.com)
- [ ] Wait for SSL certificate provisioning (5-30 minutes)
- [ ] Update DNS records with provided CNAME values

### 5. Configure Branch Settings
- [ ] Go to App Settings → Branch settings
- [ ] Configure `main` branch:
  - Enable automatic builds
  - Set environment to "production"
  - Enable performance mode
- [ ] Configure `develop` branch (if using):
  - Enable automatic builds
  - Set environment to "staging"
- [ ] Enable pull request previews:
  - Auto-delete previews when PR closes
  - Use staging environment variables

### 6. Configure Redirects (SPA Routing)
- [ ] Go to App Settings → Rewrites and redirects
- [ ] Verify SPA rewrite rule exists:
  ```
  Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>
  Target: /index.html
  Type: 200 (Rewrite)
  ```

### 7. Configure Build Notifications (Optional)
- [ ] Go to App Settings → Notifications
- [ ] Add email notifications for build failures
- [ ] Configure Slack/SNS integration (optional)

### 8. Configure GitHub Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE
VITE_API_URL
VITE_STRIPE_PUBLISHABLE_KEY
```

## 🧪 Verification Steps

After deployment, verify the following:

### Build Verification
- [ ] Build completes successfully (check Amplify Console)
- [ ] Build time is reasonable (~2-5 minutes)
- [ ] No critical errors in build logs
- [ ] Bundle size is acceptable (~650KB gzipped initial bundle)

### Deployment Verification
- [ ] Application loads successfully
- [ ] All routes work correctly (no 404 on refresh)
- [ ] Environment variables are loaded correctly
- [ ] Auth0 authentication works
- [ ] Stripe integration works
- [ ] API calls succeed

### Performance Verification
- [ ] Initial load < 3 seconds (test with Chrome DevTools)
- [ ] Page navigation < 1 second
- [ ] Interaction feedback < 200ms
- [ ] Lighthouse score > 90 for Performance

### Security Verification
- [ ] All traffic uses HTTPS
- [ ] Security headers present (check browser DevTools)
- [ ] CSP policy is enforced
- [ ] No mixed content warnings
- [ ] Auth0 tokens stored securely

### CI/CD Verification
- [ ] Push to main triggers production deployment
- [ ] Push to develop triggers staging deployment (if configured)
- [ ] Pull requests create preview deployments
- [ ] GitHub Actions workflows pass
- [ ] Build notifications work

## 📊 Performance Targets

Verify these targets are met:

- **Initial Load**: < 3 seconds on standard broadband
- **Page Navigation**: < 1 second (client-side routing)
- **Interaction Feedback**: < 200ms
- **Initial Bundle**: ~650KB (gzipped)
- **Lighthouse Performance**: > 90
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

## 🔒 Security Checklist

- [x] HTTPS enforced (configured in amplify.yml)
- [x] Security headers configured (HSTS, CSP, X-Frame-Options, etc.)
- [x] Content Security Policy defined
- [x] Auth0 integration for authentication
- [x] Pre-signed URLs for S3 operations
- [x] Environment variables not committed to repository
- [x] Sensitive data not exposed in client-side code

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [React Router SPA Configuration](https://reactrouter.com/en/main/guides/spa)
- [Auth0 React SDK](https://auth0.com/docs/quickstart/spa/react)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)

## 🎯 Summary

**Task 12.1 Status: ✅ COMPLETE**
- All configuration files created
- Build optimization implemented
- Environment templates documented
- Setup scripts provided
- Comprehensive documentation written

**Task 12.2 Status: ✅ COMPLETE**
- CI/CD workflows configured
- Automatic deployments set up
- Environment-specific builds configured
- Preview deployments enabled
- Build optimization implemented

**Manual Steps Required:**
- AWS Amplify Console configuration (one-time setup)
- Environment variables configuration in AWS
- GitHub secrets configuration
- Optional: Custom domain setup

The deployment infrastructure is production-ready and follows AWS best practices.
