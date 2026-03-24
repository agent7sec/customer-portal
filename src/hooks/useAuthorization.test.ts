import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthorization } from './useAuthorization';
import * as RefineCore from '@refinedev/core';

vi.mock('@refinedev/core', () => ({
  useGetIdentity: vi.fn(),
}));

describe('useAuthorization', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  };

  describe('canAccessResource', () => {
    it('should return true when resource belongs to user', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: mockUser,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.canAccessResource('user-123')).toBe(true);
    });

    it('should return false when resource belongs to different user', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: mockUser,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.canAccessResource('user-456')).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.canAccessResource('user-123')).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: mockUser,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.isAuthenticated()).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('should return user ID when authenticated', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: mockUser,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.getUserId()).toBe('user-123');
    });

    it('should return undefined when not authenticated', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.getUserId()).toBeUndefined();
    });
  });

  describe('hasSubscription', () => {
    it('should return true when user is authenticated', async () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: mockUser,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      const hasSubscription = await result.current.hasSubscription();
      expect(hasSubscription).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      const hasSubscription = await result.current.hasSubscription();
      expect(hasSubscription).toBe(false);
    });
  });

  describe('user', () => {
    it('should return user data when authenticated', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: mockUser,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.user).toEqual(mockUser);
    });

    it('should return undefined when not authenticated', () => {
      vi.mocked(RefineCore.useGetIdentity).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useAuthorization());
      expect(result.current.user).toBeUndefined();
    });
  });
});
