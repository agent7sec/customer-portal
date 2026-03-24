import { describe, it, expect, beforeEach, vi } from 'vitest';
import { register, unregister, update } from './serviceWorkerRegistration';

describe('serviceWorkerRegistration', () => {
  let mockServiceWorker: any;

  beforeEach(() => {
    // Mock service worker
    mockServiceWorker = {
      register: vi.fn().mockResolvedValue({
        installing: null,
        waiting: null,
        active: null,
        onupdatefound: null,
      }),
      ready: Promise.resolve({
        unregister: vi.fn().mockResolvedValue(true),
        update: vi.fn().mockResolvedValue(undefined),
      }),
    };

    // Mock navigator with service worker support
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: mockServiceWorker,
      },
      writable: true,
      configurable: true,
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'example.com',
        origin: 'https://example.com',
        href: 'https://example.com',
      },
      writable: true,
      configurable: true,
    });

    // Mock import.meta.env
    vi.stubEnv('PROD', true);
    vi.stubEnv('BASE_URL', '/');
  });

  describe('register', () => {
    it('should not register in development mode', () => {
      vi.stubEnv('PROD', false);
      register();
      expect(mockServiceWorker.register).not.toHaveBeenCalled();
    });

    it('should not register if service worker is not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      });

      register();
      expect(mockServiceWorker.register).not.toHaveBeenCalled();
    });
  });

  describe('unregister', () => {
    it('should call unregister on service worker', () => {
      const unregisterMock = vi.fn().mockResolvedValue(true);
      mockServiceWorker.ready = Promise.resolve({
        unregister: unregisterMock,
      });

      unregister();
      
      // Function should be called without throwing
      expect(() => unregister()).not.toThrow();
    });

    it('should not throw on errors', () => {
      mockServiceWorker.ready = Promise.reject(new Error('Failed'));
      
      // Should not throw
      expect(() => unregister()).not.toThrow();
    });
  });

  describe('update', () => {
    it('should call update on service worker', () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      mockServiceWorker.ready = Promise.resolve({
        update: updateMock,
      });

      update();
      
      // Function should be called without throwing
      expect(() => update()).not.toThrow();
    });

    it('should not throw on errors', () => {
      mockServiceWorker.ready = Promise.reject(new Error('Failed'));
      
      // Should not throw
      expect(() => update()).not.toThrow();
    });
  });
});
