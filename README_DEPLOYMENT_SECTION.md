## Deployment

The application is deployed on AWS Amplify Hosting with automatic CI/CD from your Git repository.

### Quick Start

1. **Automated Setup**: Run the setup script
   ```bash
   ./scripts/setup-amplify.sh
   ```

2. **Manual Setup**: Follow the detailed guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deployment Files

- `amplify.yml` - AWS Amplify build configuration
- `.env.production` - Production environment template
- `.env.staging` - Staging environment template
- `.github/workflows/amplify-deploy.yml` - GitHub Actions CI/CD workflow

### Environment Variables

Configure these in AWS Amplify Console (App Settings → Environment Variables):

```
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-audience
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

### Deployment Workflow

- **Production**: Push to `main` branch → Automatic deployment
- **Staging**: Push to `develop` branch → Automatic deployment to staging
- **Preview**: Open PR → Automatic preview deployment

For detailed instructions, troubleshooting, and advanced configuration, see [DEPLOYMENT.md](./DEPLOYMENT.md).
