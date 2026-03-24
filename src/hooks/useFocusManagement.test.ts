import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAnnounce } from './useFocusManagement';
import { vi } from 'vitest';

describe('useFocusManagement', () => {
  describe('useAnnounce', () => {
    it('creates announcement element with correct attributes', () => {
      const { result } = renderHook(() => useAnnounce(), {
        wrapper: BrowserRouter,
      });

      result.current.announce('Test message');

      const announcements = document.querySelectorAll('[role="status"]');
      expect(announcements.length).toBeGreaterThan(0);

      const lastAnnouncement = announcements[announcements.length - 1];
      expect(lastAnnouncement).toHaveAttribute('aria-live', 'polite');
      expect(lastAnnouncement).toHaveAttribute('aria-atomic', 'true');
      expect(lastAnnouncement).toHaveClass('sr-only');
      expect(lastAnnouncement.textContent).toBe('Test message');
    });

    it('supports assertive priority', () => {
      const { result } = renderHook(() => useAnnounce(), {
        wrapper: BrowserRouter,
      });

      result.current.announce('Urgent message', 'assertive');

      const announcements = document.querySelectorAll('[role="status"]');
      const lastAnnouncement = announcements[announcements.length - 1];
      expect(lastAnnouncement).toHaveAttribute('aria-live', 'assertive');
    });

    it('removes announcement after timeout', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useAnnounce(), {
        wrapper: BrowserRouter,
      });

      result.current.announce('Temporary message');

      const initialCount = document.querySelectorAll('[role="status"]').length;
      
      vi.advanceTimersByTime(1000);

      const finalCount = document.querySelectorAll('[role="status"]').length;
      expect(finalCount).toBeLessThan(initialCount);

      vi.useRealTimers();
    });
  });
});
