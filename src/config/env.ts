/**
 * Environment configuration
 * Centralizes all environment variables with fallbacks
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },

  // Auth0 Configuration
  auth0: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
    redirectUri: window.location.origin,
    scope: 'openid profile email offline_access',
    useRefreshTokens: true,
    cacheLocation: 'memory' as const,
  },

  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },

  // Feature Flags
  features: {
    enableServiceWorker: import.meta.env.PROD,
    enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugLogging: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
  },

  // AWS S3 Configuration
  s3: {
    region: import.meta.env.VITE_S3_REGION || 'us-east-1',
    bucket: import.meta.env.VITE_S3_BUCKET || '',
  },

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Type-safe config access
export type Config = typeof config;
