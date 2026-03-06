/**
 * Auth0 Configuration
 * 
 * This file contains the Auth0 configuration for the application.
 * Environment variables should be set in .env files with VITE_ prefix.
 */

export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
  redirectUri: `${window.location.origin}/callback`,
  // Scopes for Auth0 API access
  scope: 'openid profile email',
  // Use refresh tokens for better UX
  useRefreshTokens: true,
  // Cache location - memory is more secure than localStorage
  cacheLocation: 'memory' as const,
};

/**
 * Validate Auth0 configuration
 * Throws error if required configuration is missing
 */
export const validateAuth0Config = () => {
  if (!auth0Config.domain) {
    throw new Error('VITE_AUTH0_DOMAIN is not configured');
  }
  if (!auth0Config.clientId) {
    throw new Error('VITE_AUTH0_CLIENT_ID is not configured');
  }
};
