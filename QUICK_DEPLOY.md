# Quick Deployment Guide

Fast-track guide to deploy the Customer Portal to AWS Amplify.

## Prerequisites

✅ AWS account with Amplify access  
✅ Git repository (GitHub, GitLab, or Bitbucket)  
✅ Auth0 application configured  
✅ Stripe account with API keys  
✅ API Gateway endpoint URL  

## 5-Minute Setup

### Step 1: Create Amplify App (2 min)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Select your Git provider and authorize
4. Choose repository: `customer-portal`
5. Select branch: `main`
6. Click **"Next"**

### Step 2: Configure Build (1 min)

Amplify will auto-detect `amplify.yml`. Verify:

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: Auto-detected from package.json

Click **"Next"** → **"Save and deploy"**

### Step 3: Add Environment Variables (2 min)

While the first build runs, add environment variables:

1. Go to **App Settings** → **Environment Variables**
2. Click **"Manage variables"**
3. Add these variables:

```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://your-api-audience
VITE_API_URL=https://your-api.amazonaws.com/prod
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
NODE_ENV=production
```

4. Click **"Save"**
5. Trigger a new build: **Redeploy this version**

### Step 4: Verify Deployment

Once the build completes (~3-5 minutes):

1. Click the provided URL (e.g., `https://main.xxxxx.amplifyapp.com`)
2. Verify the app loads
3. Test authentication with Auth0
4. Check that API calls work

## Optional: Custom Domain

1. Go to **App Settings** → **Domain management**
2. Click **"Add domain"**
3. Enter your domain (e.g., `portal.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (5-30 minutes)

## Optional: Staging Environment

To add a staging environment:

1. Go to **App Settings** → **Branch settings**
2. Click **"Connect branch"**
3. Select `develop` branch
4. Add staging environment variables (use `pk_test_` for Stripe)
5. Enable automatic builds

## Optional: PR Previews

1. Go to **App Settings** → **Branch settings**
2. Enable **"Pull request previews"**
3. Select **"Automatically deploy all pull requests"**
4. Choose staging environment variables
5. Enable **"Delete preview when PR is closed"**

## GitHub Actions Setup

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each variable:
   - `VITE_AUTH0_DOMAIN`
   - `VITE_AUTH0_CLIENT_ID`
   - `VITE_AUTH0_AUDIENCE`
   - `VITE_API_URL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

## Troubleshooting

### Build Fails

**Check build logs** in Amplify Console:
- TypeScript errors? Run `npm run type-check` locally
- Missing dependencies? Run `npm ci` locally
- Environment variables missing? Verify all `VITE_*` variables are set

### App Doesn't Load

- **404 on refresh?** Verify SPA rewrite rule is configured
- **Blank page?** Check browser console for errors
- **Auth fails?** Verify Auth0 domain and client ID are correct

### Environment Variables Not Working

- Variables must start with `VITE_` prefix
- Rebuild after adding/changing variables
- Check browser console: `import.meta.env.VITE_*`

## Performance Optimization

The build is already optimized with:

✅ Code splitting (vendor, antd, refine, stripe)  
✅ Minification with Terser  
✅ Console.log removal in production  
✅ Asset optimization  
✅ Long-term caching headers  
✅ Gzip/Brotli compression  

Expected bundle sizes:
- Initial bundle: ~650KB (gzipped)
- Largest chunk (antd): ~318KB (gzipped)
- Total app size: ~1.7MB (gzipped)

## Monitoring

### Build Status
- View in Amplify Console → **App** → **Deployments**
- Each commit shows build status and logs

### Performance
- Use Chrome DevTools Lighthouse
- Target: Performance score > 90
- Initial load: < 3 seconds

### Errors
- Enable CloudWatch Logs in **App Settings** → **Monitoring**
- View access logs and error rates

## Rollback

To rollback a deployment:

1. Go to **Amplify Console** → **Deployments**
2. Find the previous successful deployment
3. Click **"Redeploy this version"**
4. Confirm rollback

## Cost Estimate

AWS Amplify pricing (as of 2024):

- **Build minutes**: First 1,000 min/month free, then $0.01/min
- **Hosting**: First 15 GB served/month free, then $0.15/GB
- **Data transfer**: First 15 GB/month free, then $0.15/GB

Typical monthly cost for small app: **$0-20**

## Next Steps

✅ Deployment complete!

Consider:
- [ ] Set up custom domain
- [ ] Configure staging environment
- [ ] Enable PR previews
- [ ] Set up monitoring alerts
- [ ] Configure backup/disaster recovery
- [ ] Add performance monitoring (CloudWatch RUM)

## Support

- **Detailed guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Checklist**: See [AMPLIFY_SETUP_CHECKLIST.md](./AMPLIFY_SETUP_CHECKLIST.md)
- **AWS Docs**: https://docs.aws.amazon.com/amplify/
- **Vite Docs**: https://vitejs.dev/guide/build.html
