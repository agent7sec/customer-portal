import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notification } from 'antd';
import { refineNotificationProvider } from './refineNotificationProvider';

vi.mock('antd', () => ({
  notification: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    destroy: vi.fn(),
    close: vi.fn(),
  },
  Button: vi.fn((props) => props),
}));

describe('refineNotificationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('open', () => {
    it('should open success notification with correct parameters', () => {
      refineNotificationProvider.open({
        message: 'Success',
        description: 'Operation completed',
        type: 'success',
        key: 'test-key',
      });

      expect(notification.success).toHaveBeenCalledWith({
        message: 'Success',
        description: 'Operation completed',
        key: 'test-key',
        duration: 4.5,
      });
    });

    it('should open error notification with duration 0', () => {
      refineNotificationProvider.open({
        message: 'Error',
        description: 'Operation failed',
        type: 'error',
        key: 'error-key',
      });

      expect(notification.error).toHaveBeenCalledWith({
        message: 'Error',
        description: 'Operation failed',
        key: 'error-key',
        duration: 0,
      });
    });

    it('should default to info type when type is not provided', () => {
      refineNotificationProvider.open({
        message: 'Info',
        description: 'Information message',
      });

      expect(notification.info).toHaveBeenCalledWith({
        message: 'Info',
        description: 'Information message',
        key: undefined,
        duration: 4.5,
      });
    });

    it('should include undo button when undoableTimeout and cancelMutation are provided', () => {
      const cancelMutation = vi.fn();
      
      refineNotificationProvider.open({
        message: 'Deleted',
        description: 'Item deleted',
        type: 'success',
        key: 'undo-key',
        undoableTimeout: 5000,
        cancelMutation,
      });

      const call = (notification.success as any).mock.calls[0][0];
      expect(call.btn).toBeDefined();
      expect(call.message).toBe('Deleted');
    });
  });

  describe('close', () => {
    it('should close notification with given key', () => {
      refineNotificationProvider.close('test-key');

      expect(notification.destroy).toHaveBeenCalledWith('test-key');
    });
  });
});
