import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';

// Mock AuthService
vi.mock('../../services/AuthService', () => ({
  authService: {
    signInWithRedirect: vi.fn(),
    signUpWithRedirect: vi.fn(),
    handleRedirectCallback: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
    isAuthenticated: vi.fn(),
    getTokens: vi.fn(),
  },
}));

const mockAuthService = vi.mocked(authService);

// Test component that uses auth context
const TestAuthComponent = () => {
  const { isAuthenticated, user, signIn, signUp, signOut } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button onClick={() => signIn()}>Sign In</button>
      <button onClick={() => signUp()}>Sign Up</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth0 Universal Login redirect flow', () => {
    it('should call signInWithRedirect when sign in is triggered', async () => {
      const user = userEvent.setup();

      mockAuthService.isAuthenticated.mockResolvedValue(false);
      mockAuthService.signInWithRedirect.mockResolvedValue();

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      expect(mockAuthService.signInWithRedirect).toHaveBeenCalled();
    });

    it('should call signUpWithRedirect when sign up is triggered', async () => {
      const user = userEvent.setup();

      mockAuthService.isAuthenticated.mockResolvedValue(false);
      mockAuthService.signUpWithRedirect.mockResolvedValue();

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signUpButton);

      expect(mockAuthService.signUpWithRedirect).toHaveBeenCalled();
    });
  });

  describe('Redirect callback handling', () => {
    it('should handle redirect callback and update auth state', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.isAuthenticated.mockResolvedValue(false);
      mockAuthService.handleRedirectCallback.mockResolvedValue({
        user: mockUser,
        returnTo: '/dashboard',
      });

      const CallbackTestComponent = () => {
        const { isAuthenticated, user, handleRedirectCallback } = useAuth();

        return (
          <div>
            <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
            {user && <div data-testid="user-email">{user.email}</div>}
            <button onClick={() => handleRedirectCallback()}>Process Callback</button>
          </div>
        );
      };

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <CallbackTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      const callbackButton = screen.getByRole('button', { name: /process callback/i });
      await user.click(callbackButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
    });
  });

  describe('Session management', () => {
    it('should maintain session across page refreshes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.isAuthenticated.mockResolvedValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockAuthService.refreshSession.mockResolvedValue(undefined as any);

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
    });

    it('should handle session expiration', async () => {
      mockAuthService.isAuthenticated.mockResolvedValue(false);
      mockAuthService.getCurrentUser.mockResolvedValue(null as any);

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });
  });

  describe('Logout flow', () => {
    it('should successfully logout and clear auth state', async () => {
      const user = userEvent.setup();

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.isAuthenticated.mockResolvedValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser as any);
      mockAuthService.refreshSession.mockResolvedValue(undefined as any);
      mockAuthService.signOut.mockResolvedValue(undefined as any);

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      // Wait for initial auth check
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Click sign out
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockAuthService.signOut).toHaveBeenCalled();
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });
  });
});
