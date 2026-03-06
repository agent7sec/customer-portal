# Customer Portal

A React-based web application for code analysis and certification services. Built with React 18, TypeScript, Vite, and AWS services.

## Features

- User authentication with Amazon Cognito
- Subscription management with Stripe
- Secure file uploads to S3
- Real-time analysis tracking
- Certificate downloads

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **AWS Services**: Cognito, S3, API Gateway, Amplify Hosting
- **Payments**: Stripe
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── components/       # React components by feature
│   ├── auth/        # Authentication components
│   ├── account/     # Account management
│   ├── subscription/# Subscription & payments
│   ├── upload/      # File upload
│   ├── analysis/    # Analysis tracking
│   ├── certificate/ # Certificate downloads
│   ├── shared/      # Reusable UI components
│   └── layout/      # Layout components
├── services/        # Business logic & API clients
├── hooks/           # Custom React hooks
├── context/         # React Context providers
├── types/           # TypeScript definitions
├── utils/           # Utility functions
├── routes/          # Route definitions
├── config/          # Configuration files
└── assets/          # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS account with Cognito, S3, and API Gateway configured
- Stripe account for payment processing

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env.development`
   - Fill in your AWS and Stripe credentials

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Code Quality

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

Type checking:
```bash
npm run type-check
```

## Environment Configuration

The application supports multiple environments:
- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Required environment variables:
- `VITE_API_GATEWAY_URL` - API Gateway endpoint
- `VITE_COGNITO_USER_POOL_ID` - Cognito User Pool ID
- `VITE_COGNITO_USER_POOL_CLIENT_ID` - Cognito Client ID
- `VITE_S3_BUCKET` - S3 bucket name
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Deployment

The application is designed to be deployed on AWS Amplify Hosting with automatic CI/CD from your Git repository.

## License

Proprietary
