import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePageLoadTime, useInteractionTracking } from './usePerformanceMonitoring';

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('usePageLoadTime', () => {
    it('initializes without errors', () => {
      const { result } = renderHook(() => usePageLoadTime('test-page'));
      
      // Hook should initialize without throwing
      expect(result).toBeDefined();
    });
  });

  describe('useInteractionTracking', () => {
    it('tracks interaction duration', () => {
      const { result } = renderHook(() => useInteractionTracking());
      const startTime = performance.now();
      
      result.current.trackInteraction('button-click', startTime);
      
      expect(console.log).toHaveBeenCalled();
    });
  });
});
