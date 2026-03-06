export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    gatewayUrl: import.meta.env.VITE_API_GATEWAY_URL || '',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  auth0: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
  },
  s3: {
    region: import.meta.env.VITE_S3_REGION || '',
    bucket: import.meta.env.VITE_S3_BUCKET || '',
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugLogging: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
  },
}
