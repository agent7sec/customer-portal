# Customer Portal

A modern React-based web application for code analysis and certification services. Built with React 18, TypeScript, Vite, Refine, Ant Design, and AWS services.

## Features

- 🔐 User authentication with Auth0
- 💳 Subscription management with Stripe
- 📤 Secure file uploads to S3 with pre-signed URLs
- 📊 Real-time analysis tracking with polling
- 📜 Certificate downloads
- 🎨 Modern UI with Ant Design components
- ⚡ Optimized performance with code splitting
- ♿ WCAG 2.1 AA accessibility compliance
- 🔒 Comprehensive security measures

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Framework**: Refine (headless React framework)
- **UI Library**: Ant Design v5
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query (via Refine)
- **AWS Services**: S3, API Gateway, Amplify Hosting
- **Authentication**: Auth0
- **Payments**: Stripe
- **Code Quality**: ESLint, Prettier, TypeScript

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
├── providers/       # Refine providers (auth, data, notification)
├── types/           # TypeScript definitions
├── utils/           # Utility functions
├── routes/          # Route definitions & pages
├── config/          # Configuration files
└── assets/          # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS account with S3 and API Gateway configured
- Auth0 account for authentication
- Stripe account for payment processing

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env.development`
   - Fill in your Auth0, AWS, and Stripe credentials

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
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
- `VITE_AUTH0_DOMAIN` - Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API audience
- `VITE_S3_BUCKET` - S3 bucket name
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

See `.env.example` for complete list of environment variables.

## Architecture

### Key Patterns

- **Component-based architecture**: Modular React components
- **Service layer pattern**: Business logic separated from UI
- **Refine framework**: Headless framework handling routing, state, and data fetching
- **Protected routes**: Authentication required for sensitive pages
- **Direct-to-S3 uploads**: Pre-signed URLs for efficient file transfers
- **Polling pattern**: Real-time updates via 5-second polling intervals
- **Code splitting**: Route-based lazy loading for optimal performance

### Performance Optimizations

- Route-based code splitting with React.lazy
- Lazy loading of heavy components (Stripe, file uploader)
- Service worker caching for static assets
- Optimized bundle size: ~650KB gzipped initial load
- Resource-specific cache TTLs via React Query
- Ant Design tree-shaking and icon optimization

### Security Features

- Content Security Policy (CSP) headers
- HTTPS enforcement
- Input validation and sanitization
- XSS prevention with DOMPurify
- Authorization checks for resource access
- Secure token storage via Auth0 SDK

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and semantic HTML
- Focus management for modals and forms
- Skip links for keyboard users

## Deployment

The application is deployed on AWS Amplify Hosting with automatic CI/CD.

### Quick Deploy

1. Connect your Git repository to AWS Amplify
2. Configure environment variables in Amplify Console
3. Deploy automatically on push to main branch

See `DEPLOYMENT.md` for detailed deployment instructions.

## Documentation

- `DEPLOYMENT.md` - Comprehensive deployment guide
- `PERFORMANCE_OPTIMIZATIONS.md` - Performance optimization details
- `TASK_13_IMPLEMENTATION.md` - Error handling and monitoring
- `TASK_14_ACCESSIBILITY_IMPLEMENTATION.md` - Accessibility features
- `.kiro/specs/customer-portal/` - Complete specification documents

## Module Status

All core modules are implemented and tested:

✅ Authentication Module (Auth0 integration)
✅ Account Management Module (Profile, password management)
✅ Subscription Module (Stripe integration, plan management)
✅ File Upload Module (S3 pre-signed URLs, validation)
✅ Analysis Tracking Module (Real-time polling, notifications)
✅ Certificate Download Module (Secure downloads)
✅ Routing & Navigation (Protected routes, responsive layout)
✅ State Management (Refine + React Query)
✅ Security Measures (CSP, validation, authorization)
✅ Performance Optimization (Code splitting, caching)
✅ Deployment Configuration (AWS Amplify, CI/CD)
✅ Error Handling (Error boundaries, logging)
✅ Accessibility (WCAG 2.1 AA compliance)

## License

Proprietary
