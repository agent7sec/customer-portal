import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './AuthService';
import { auth0Service } from './Auth0Service';

// Mock Auth0Service
vi.mock('./Auth0Service', () => ({
  auth0Service: {
    signInWithRedirect: vi.fn(),
    signUpWithRedirect: vi.fn(),
    handleRedirectCallback: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
    getTokens: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

// Get mocked functions
const mockAuth0Service = vi.mocked(auth0Service);

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithRedirect', () => {
    it('should call auth0Service.signInWithRedirect', async () => {
      mockAuth0Service.signInWithRedirect.mockResolvedValue();

      await authService.signInWithRedirect('/dashboard');

      expect(mockAuth0Service.signInWithRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should call without returnTo when not provided', async () => {
      mockAuth0Service.signInWithRedirect.mockResolvedValue();

      await authService.signInWithRedirect();

      expect(mockAuth0Service.signInWithRedirect).toHaveBeenCalledWith(undefined);
    });
  });

  describe('signUpWithRedirect', () => {
    it('should call auth0Service.signUpWithRedirect', async () => {
      mockAuth0Service.signUpWithRedirect.mockResolvedValue();

      await authService.signUpWithRedirect();

      expect(mockAuth0Service.signUpWithRedirect).toHaveBeenCalled();
    });
  });

  describe('handleRedirectCallback', () => {
    it('should return user and returnTo path', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockAuth0Service.handleRedirectCallback.mockResolvedValue({
        user: mockUser,
        returnTo: '/dashboard',
      });

      const result = await authService.handleRedirectCallback();

      expect(result.user).toEqual(mockUser);
      expect(result.returnTo).toBe('/dashboard');
      expect(mockAuth0Service.handleRedirectCallback).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      mockAuth0Service.signOut.mockResolvedValue();

      await authService.signOut();

      expect(mockAuth0Service.signOut).toHaveBeenCalled();
    });

    it('should throw error if sign out fails', async () => {
      const error = new Error('Sign out failed');
      mockAuth0Service.signOut.mockRejectedValue(error);

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockAuth0Service.getCurrentUser.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockAuth0Service.getCurrentUser).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      const error = new Error('User is not authenticated');
      mockAuth0Service.getCurrentUser.mockRejectedValue(error);

      await expect(authService.getCurrentUser()).rejects.toThrow('User is not authenticated');
    });
  });

  describe('refreshSession', () => {
    it('should refresh session and update tokens', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        idToken: 'new-id-token',
        refreshToken: '',
        expiresAt: new Date(Date.now() + 3600000),
      };

      mockAuth0Service.refreshSession.mockResolvedValue(mockTokens);

      const result = await authService.refreshSession();

      expect(result.accessToken).toBe('new-access-token');
      expect(result.idToken).toBe('new-id-token');
      expect(mockAuth0Service.refreshSession).toHaveBeenCalled();
    });

    it('should throw error when no valid session exists', async () => {
      const error = new Error('No valid session found');
      mockAuth0Service.refreshSession.mockRejectedValue(error);

      await expect(authService.refreshSession()).rejects.toThrow('No valid session found');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      mockAuth0Service.isAuthenticated.mockResolvedValue(true);

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
      expect(mockAuth0Service.isAuthenticated).toHaveBeenCalled();
    });

    it('should return false when user is not authenticated', async () => {
      mockAuth0Service.isAuthenticated.mockResolvedValue(false);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getTokens', () => {
    it('should return null when no tokens are stored', () => {
      mockAuth0Service.getTokens.mockReturnValue(null);

      const result = authService.getTokens();

      expect(result).toBeNull();
      expect(mockAuth0Service.getTokens).toHaveBeenCalled();
    });

    it('should return stored tokens after successful sign in', () => {
      const mockTokens = {
        accessToken: 'access-token',
        idToken: 'id-token',
        refreshToken: '',
        expiresAt: new Date(Date.now() + 3600000),
      };

      mockAuth0Service.getTokens.mockReturnValue(mockTokens);

      const tokens = authService.getTokens();
      expect(tokens).not.toBeNull();
      expect(tokens?.accessToken).toBe('access-token');
    });
  });
});
