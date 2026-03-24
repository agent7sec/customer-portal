# AWS Amplify Deployment Guide

This guide covers the setup and configuration of AWS Amplify Hosting for the Customer Portal application.

## Prerequisites

- AWS Account with appropriate permissions
- Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
- Domain name (optional, for custom domain setup)
- Environment variables configured (Auth0, Stripe, API endpoints)

## Task 12.1: Configure Amplify Hosting

### Step 1: Create Amplify App

1. Navigate to AWS Amplify Console: https://console.aws.amazon.com/amplify/
2. Click "New app" → "Host web app"
3. Select your Git provider and authorize AWS Amplify
4. Choose the repository containing the Customer Portal code
5. Select the main branch for production deployments

### Step 2: Configure Build Settings

The `amplify.yml` file in the root directory contains the build configuration:

- **Build command**: `npm run build` (runs TypeScript compilation + Vite build)
- **Output directory**: `dist` (Vite's default output directory)
- **Node version**: Amplify will auto-detect from package.json engines field

The build configuration includes:
- Dependency caching for faster builds
- Security headers (HSTS, X-Frame-Options, CSP, etc.)
- Cache control headers for static assets
- No-cache policy for index.html to ensure fresh deployments

### Step 3: Configure Environment Variables

Add the following environment variables in Amplify Console → App Settings → Environment Variables:

#### Required Variables

```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-production-client-id
VITE_AUTH0_AUDIENCE=https://your-api-audience
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
```

#### Environment-Specific Configuration

For staging/preview environments, use test credentials:
- Auth0: Use a separate Auth0 application for staging
- Stripe: Use `pk_test_` keys instead of `pk_live_`
- API: Point to staging API Gateway endpoint

### Step 4: Configure Custom Domain (Optional)

1. Go to App Settings → Domain management
2. Click "Add domain"
3. Enter your domain name (e.g., portal.yourdomain.com)
4. Amplify will automatically provision an SSL certificate via AWS Certificate Manager
5. Update your DNS records with the provided CNAME values
6. Wait for DNS propagation and SSL certificate validation (5-30 minutes)

### Step 5: Configure Redirects and Rewrites

Amplify automatically handles SPA routing, but you can customize in App Settings → Rewrites and redirects:

```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>
Target: /index.html
Type: 200 (Rewrite)
```

This ensures all routes are handled by React Router.

## Task 12.2: Set Up CI/CD Pipeline

### Automatic Deployments

AWS Amplify automatically sets up CI/CD when you connect your Git repository:

1. **Main Branch (Production)**
   - Automatic deployment on every push to main branch
   - Build runs with production environment variables
   - Deployed to production domain

2. **Feature Branches (Preview)**
   - Automatic preview deployments for pull requests
   - Each PR gets a unique preview URL
   - Uses staging/test environment variables

### Configure Branch Settings

1. Go to App Settings → Branch settings
2. Configure main branch:
   - Enable automatic builds
   - Set environment to "production"
   - Enable performance mode (CDN caching)

3. Configure preview branches:
   - Enable pull request previews
   - Set environment to "staging"
   - Auto-delete previews when PR is closed

### Build Optimization Steps

The build process includes several optimizations:

1. **Dependency Caching**
   - `node_modules` cached between builds
   - Reduces build time from ~5 minutes to ~2 minutes

2. **Code Splitting**
   - Configured in `vite.config.ts`
   - Separate chunks for vendor, Ant Design, Refine, Stripe
   - Lazy loading for heavy components

3. **Minification**
   - Terser minification enabled
   - Console.log statements removed in production
   - Source maps disabled for smaller bundle size

4. **Asset Optimization**
   - Static assets served with long-term caching (1 year)
   - index.html served with no-cache to ensure fresh deployments
   - Gzip/Brotli compression enabled by default on Amplify CDN

### Environment-Specific Builds

Configure different build settings per environment:

#### Production (main branch)
```bash
# Environment variables
VITE_API_URL=https://api.production.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NODE_ENV=production
```

#### Staging (develop branch)
```bash
# Environment variables
VITE_API_URL=https://api.staging.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NODE_ENV=staging
```

#### Preview (PR branches)
```bash
# Environment variables
VITE_API_URL=https://api.staging.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NODE_ENV=development
```

### Build Notifications

Configure build notifications in App Settings → Notifications:
- Email notifications for build failures
- Slack/SNS integration for team notifications
- Webhook for custom integrations

## Performance Targets

The deployment configuration is optimized to meet these targets:

- **Initial Load**: < 3 seconds on standard broadband
- **Page Navigation**: < 1 second (client-side routing)
- **Interaction Feedback**: < 200ms
- **Bundle Size**: < 500KB initial bundle (gzipped)

## Security Configuration

### Security Headers

The `amplify.yml` includes security headers:

- **HSTS**: Forces HTTPS for 1 year
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Content Security Policy (CSP)

Consider adding CSP headers for additional security:

```yaml
- key: 'Content-Security-Policy'
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.auth0.com https://api.stripe.com https://*.amazonaws.com"
```

### HTTPS Enforcement

- All traffic automatically redirected to HTTPS
- SSL certificates auto-renewed by AWS Certificate Manager
- TLS 1.2+ enforced

## Monitoring and Logging

### Access Logs

Enable access logs in App Settings → Monitoring:
- CloudWatch Logs integration
- Request/response logging
- Error tracking

### Performance Monitoring

Monitor application performance:
- Amplify Console shows build times and deployment history
- CloudWatch metrics for CDN performance
- Real User Monitoring (RUM) can be added via CloudWatch RUM

### Cost Monitoring

Amplify pricing includes:
- Build minutes: First 1,000 minutes/month free
- Hosting: First 15 GB served/month free
- Data transfer: $0.15/GB after free tier

## Troubleshooting

### Build Failures

Common issues and solutions:

1. **TypeScript errors**: Run `npm run type-check` locally first
2. **Missing environment variables**: Verify all VITE_* variables are set
3. **Dependency issues**: Clear cache and rebuild
4. **Memory issues**: Increase build memory in advanced settings

### Deployment Issues

1. **404 on refresh**: Verify SPA rewrite rule is configured
2. **Environment variables not working**: Ensure variables start with `VITE_`
3. **Slow builds**: Enable dependency caching
4. **SSL certificate issues**: Wait for DNS propagation (up to 48 hours)

## Rollback Procedure

To rollback a deployment:

1. Go to Amplify Console → App → Deployments
2. Find the previous successful deployment
3. Click "Redeploy this version"
4. Confirm rollback

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [React Router SPA Configuration](https://reactrouter.com/en/main/guides/spa)
