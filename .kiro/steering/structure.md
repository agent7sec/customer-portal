# Project Structure

## Folder Organization

```
src/
├── components/          # React components organized by feature
│   ├── auth/           # Authentication components (SignUpForm, LoginForm, etc.)
│   ├── account/        # Account management components
│   ├── subscription/   # Subscription and payment components
│   ├── upload/         # File upload components
│   ├── analysis/       # Analysis tracking components (Dashboard, AnalysisCard)
│   ├── certificate/    # Certificate download components
│   ├── shared/         # Reusable UI components (Button, Modal, Toast, etc.)
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── services/           # Business logic and API integration
│   ├── AuthService.ts
│   ├── AccountService.ts
│   ├── SubscriptionService.ts
│   ├── UploadService.ts
│   ├── AnalysisService.ts
│   └── CertificateService.ts
├── hooks/              # Custom React hooks
├── context/            # React Context providers (AuthProvider, etc.)
├── types/              # TypeScript type definitions and interfaces
├── utils/              # Utility functions and helpers
├── config/             # Configuration files (API endpoints, constants)
├── routes/             # Route definitions and protected route components
└── assets/             # Static assets (images, fonts, etc.)
```

## Module Organization

The application is organized into six main feature modules:

1. **Authentication Module**: User signup, login, session management
2. **Account Management Module**: Profile updates, password changes
3. **Subscription Module**: Plan selection, payment processing, subscription management
4. **File Upload Module**: File validation, S3 upload with pre-signed URLs
5. **Analysis Tracking Module**: Dashboard, real-time status polling
6. **Certificate Download Module**: Secure certificate retrieval

## Component Naming Conventions

- **Pages**: `<Feature>Page.tsx` (e.g., `DashboardPage.tsx`)
- **Feature components**: `<Feature><Component>.tsx` (e.g., `AnalysisCard.tsx`)
- **Shared components**: `<Component>.tsx` (e.g., `Button.tsx`, `Modal.tsx`)
- **Services**: `<Feature>Service.ts` (e.g., `AuthService.ts`)
- **Hooks**: `use<Feature>.ts` (e.g., `useAuth.ts`, `useUpload.ts`)
- **Types**: `<feature>.types.ts` (e.g., `auth.types.ts`)

## Key Architectural Principles

- **Separation of concerns**: UI components separate from business logic (services)
- **Single responsibility**: Each component/service has one clear purpose
- **Reusability**: Shared components in `components/shared/`
- **Type safety**: All data models defined in TypeScript interfaces
- **Protected routes**: Authentication required for sensitive pages
- **Error boundaries**: Graceful error handling at component level

## Configuration Management

- Environment variables for API endpoints and service configuration
- Separate configs for development, staging, and production
- Feature flags for gradual rollouts (if needed)
