import { auth0Service } from './Auth0Service';
import type {
  User,
  AuthTokens,
} from '../types/auth.types';

/**
 * AuthService handles all authentication operations with Auth0 Universal Login.
 * This is a wrapper around Auth0Service to maintain a clean public API.
 * All sign-in/sign-up operations redirect to Auth0's hosted login page.
 */
class AuthService {
  /**
   * Sign in via Auth0 Universal Login (redirect)
   * @param returnTo - Optional path to redirect to after login
   */
  async signInWithRedirect(returnTo?: string): Promise<void> {
    return auth0Service.signInWithRedirect(returnTo);
  }

  /**
   * Sign up via Auth0 Universal Login (redirect)
   * Redirects to Auth0's hosted login page with sign-up screen
   */
  async signUpWithRedirect(): Promise<void> {
    return auth0Service.signUpWithRedirect();
  }

  /**
   * Handle redirect callback after Auth0 login
   */
  async handleRedirectCallback(): Promise<{ user: User; returnTo: string }> {
    return auth0Service.handleRedirectCallback();
  }

  /**
   * Sign out current user and clear stored tokens
   */
  async signOut(): Promise<void> {
    return auth0Service.signOut();
  }

  /**
   * Get current authenticated user information
   * @throws Error if user is not authenticated
   */
  async getCurrentUser(): Promise<User> {
    return auth0Service.getCurrentUser();
  }

  /**
   * Refresh authentication session and update stored tokens
   * @throws Error if session cannot be refreshed
   */
  async refreshSession(): Promise<AuthTokens> {
    return auth0Service.refreshSession();
  }

  /**
   * Get stored authentication tokens
   * Returns null if no valid session exists
   */
  getTokens(): AuthTokens | null {
    return auth0Service.getTokens();
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return auth0Service.isAuthenticated();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
