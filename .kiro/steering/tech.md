# Technology Stack

## Frontend Framework

- **React 18+** with TypeScript for type safety
- **Vite** for build tooling and development server
- **React Router v6** for client-side routing

## AWS Services

- **Amazon S3**: File storage with pre-signed URLs for direct uploads/downloads
- **Amazon API Gateway**: Backend API communication
- **AWS Amplify Hosting**: CI/CD, global CDN, and hosting infrastructure

## Third-Party Services

- **Auth0**: User authentication, identity management, and session handling
- **Stripe**: Payment processing and subscription management
- **Stripe Elements**: Secure payment form components

## Development Tools

- **TypeScript**: Static typing and improved developer experience
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Key Libraries

- Auth0 SDK (@auth0/auth0-spa-js or @auth0/auth0-react) for authentication
- Stripe React SDK for payment forms
- Axios or Fetch API for HTTP requests

## Common Commands

```bash
# Development
npm run dev          # Start development server with Vite

# Build
npm run build        # Production build with optimizations
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking

# Testing
npm test             # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## Architecture Patterns

- **Component-based architecture**: Modular React components
- **Service layer pattern**: Separate business logic from UI components
- **Context API**: Global state management for auth and user data
- **Protected routes**: Route guards for authenticated pages
- **Direct-to-S3 uploads**: Pre-signed URLs to bypass backend for file transfers
- **Polling pattern**: Real-time status updates via periodic API calls (5-second intervals)

## Performance Considerations

- Route-based code splitting for lazy loading
- CDN delivery via AWS Amplify
- Optimistic UI updates for better perceived performance
- Target: <3s initial load, <1s page navigation, <200ms interaction feedback
