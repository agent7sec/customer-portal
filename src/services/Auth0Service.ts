import { Auth0Client } from '@auth0/auth0-spa-js';
import { auth0Config } from '../config/auth0';
import type {
  User,
  AuthTokens,
} from '../types/auth.types';

/**
 * Auth0Service handles all authentication operations using Auth0 Universal Login.
 * All sign-in/sign-up flows redirect to Auth0's hosted login page.
 * Implements secure token storage using Auth0 SDK.
 */
class Auth0Service {
  private auth0Client: Auth0Client | null = null;
  private tokens: AuthTokens | null = null;

  /**
   * Initialize Auth0 client
   */
  private async getClient(): Promise<Auth0Client> {
    if (!this.auth0Client) {
      this.auth0Client = new Auth0Client({
        domain: auth0Config.domain,
        clientId: auth0Config.clientId,
        authorizationParams: {
          redirect_uri: auth0Config.redirectUri,
          audience: auth0Config.audience,
          scope: auth0Config.scope,
        },
        useRefreshTokens: auth0Config.useRefreshTokens,
        cacheLocation: auth0Config.cacheLocation,
      });
    }
    return this.auth0Client;
  }

  /**
   * Sign in via Auth0 Universal Login (redirect)
   * Redirects user to Auth0's hosted login page
   */
  async signInWithRedirect(returnTo?: string): Promise<void> {
    const client = await this.getClient();
    await client.loginWithRedirect({
      appState: { returnTo: returnTo || '/dashboard' },
    });
  }

  /**
   * Sign up via Auth0 Universal Login (redirect)
   * Redirects user to Auth0's hosted login page with sign-up screen
   */
  async signUpWithRedirect(): Promise<void> {
    const client = await this.getClient();
    await client.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
      appState: { returnTo: '/dashboard' },
    });
  }

  /**
   * Handle redirect callback after Auth0 login
   * Returns the intended destination path from appState
   */
  async handleRedirectCallback(): Promise<{ user: User; returnTo: string }> {
    const client = await this.getClient();
    const result = await client.handleRedirectCallback();
    const returnTo = result.appState?.returnTo || '/dashboard';
    const user = await this.getCurrentUser();
    await this.refreshSession();
    return { user, returnTo };
  }

  /**
   * Sign out current user and clear stored tokens
   */
  async signOut(): Promise<void> {
    try {
      const client = await this.getClient();
      await client.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
      this.tokens = null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get current authenticated user information
   * @throws Error if user is not authenticated
   */
  async getCurrentUser(): Promise<User> {
    try {
      const client = await this.getClient();
      const user = await client.getUser();

      if (!user) {
        throw new Error('User is not authenticated');
      }

      return {
        id: user.sub || '',
        email: user.email || '',
        emailVerified: user.email_verified || false,
        firstName: user.given_name || user.user_metadata?.given_name || '',
        lastName: user.family_name || user.user_metadata?.family_name || '',
        createdAt: new Date(user.created_at || Date.now()),
        updatedAt: new Date(user.updated_at || Date.now()),
      };
    } catch (error: any) {
      throw new Error('User is not authenticated');
    }
  }

  /**
   * Refresh authentication session and update stored tokens
   * @throws Error if session cannot be refreshed
   */
  async refreshSession(): Promise<AuthTokens> {
    try {
      const client = await this.getClient();
      const token = await client.getTokenSilently();
      const claims = await client.getIdTokenClaims();

      if (!token || !claims) {
        throw new Error('No valid session found');
      }

      const tokens: AuthTokens = {
        accessToken: token,
        idToken: claims.__raw,
        refreshToken: '', // Managed by Auth0 SDK
        expiresAt: new Date((claims.exp || 0) * 1000),
      };

      this.tokens = tokens;
      return tokens;
    } catch (error: any) {
      this.tokens = null;
      throw new Error(error.message || 'Failed to refresh session');
    }
  }

  /**
   * Get stored authentication tokens
   * Returns null if no valid session exists
   */
  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const client = await this.getClient();
      return await client.isAuthenticated();
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const auth0Service = new Auth0Service();
export default auth0Service;
