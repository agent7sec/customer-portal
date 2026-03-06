import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '../services/AuthService';
import type { AuthState } from '../types/auth.types';

interface AuthContextType extends AuthState {
  signIn: (returnTo?: string) => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
  handleRedirectCallback: () => Promise<string>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  // Check authentication status on mount, but skip on /callback route
  useEffect(() => {
    const isCallbackRoute = window.location.pathname === '/callback';
    if (isCallbackRoute) {
      // On callback route, let CallbackPage handle auth via handleRedirectCallback
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    checkAuthStatus();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!authState.isAuthenticated) {
      return;
    }

    // Refresh token every 50 minutes (tokens typically expire in 60 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        await authService.refreshSession();
      } catch (error) {
        console.error('Failed to refresh session:', error);
        await handleSignOut();
      }
    }, 50 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [authState.isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();

      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        await authService.refreshSession();

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          error: null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  };

  /**
   * Redirect to Auth0 Universal Login for sign-in
   */
  const handleSignIn = useCallback(async (returnTo?: string) => {
    await authService.signInWithRedirect(returnTo);
  }, []);

  /**
   * Redirect to Auth0 Universal Login for sign-up
   */
  const handleSignUp = useCallback(async () => {
    await authService.signUpWithRedirect();
  }, []);

  /**
   * Handle the redirect callback from Auth0
   * Returns the path to redirect the user to
   */
  const handleRedirectCallback = useCallback(async (): Promise<string> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, returnTo } = await authService.handleRedirectCallback();

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });

      return returnTo;
    } catch (error: any) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error.message || 'Failed to complete authentication',
      });
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = {
    ...authState,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    handleRedirectCallback,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
