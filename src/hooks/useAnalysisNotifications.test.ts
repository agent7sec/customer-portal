import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notification } from 'antd';
import { useAnalysisNotifications } from './useAnalysisNotifications';
import type { Analysis } from '../types/analysis.types';

// Mock antd notification
vi.mock('antd', () => ({
  notification: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock browser Notification API
const mockNotification = vi.fn();
globalThis.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted'),
} as any;
globalThis.Notification = mockNotification as any;

const createMockAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
  id: 'test-1',
  userId: 'user-1',
  fileName: 'test.zip',
  fileSize: 5242880,
  status: 'queued',
  progress: 0,
  uploadedAt: new Date().toISOString(),
  ...overrides,
});

describe('useAnalysisNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('does not show notification on initial render', () => {
    const analyses = [createMockAnalysis()];
    renderHook(() => useAnalysisNotifications(analyses));

    expect(notification.info).not.toHaveBeenCalled();
  });

  it('shows notification when status changes to queued', async () => {
    const { rerender } = renderHook(
      ({ analyses }) => useAnalysisNotifications(analyses),
      {
        initialProps: { analyses: [createMockAnalysis({ status: 'uploading' })] },
      }
    );

    rerender({ analyses: [createMockAnalysis({ status: 'queued' })] });

    await waitFor(() => {
      expect(notification.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Analysis Queued',
          description: expect.stringContaining('test.zip'),
        })
      );
    });
  });

  it('shows notification when status changes to processing', async () => {
    const { rerender } = renderHook(
      ({ analyses }) => useAnalysisNotifications(analyses),
      {
        initialProps: { analyses: [createMockAnalysis({ status: 'queued' })] },
      }
    );

    rerender({ analyses: [createMockAnalysis({ status: 'processing' })] });

    await waitFor(() => {
      expect(notification.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Analysis Started',
          description: expect.stringContaining('test.zip'),
        })
      );
    });
  });

  it('shows success notification when analysis completes', async () => {
    const { rerender } = renderHook(
      ({ analyses }) => useAnalysisNotifications(analyses),
      {
        initialProps: { analyses: [createMockAnalysis({ status: 'processing' })] },
      }
    );

    rerender({ analyses: [createMockAnalysis({ status: 'completed' })] });

    await waitFor(() => {
      expect(notification.success).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Analysis Complete!',
          description: expect.stringContaining('test.zip'),
        })
      );
    });
  });

  it('shows error notification when analysis fails', async () => {
    const { rerender } = renderHook(
      ({ analyses }) => useAnalysisNotifications(analyses),
      {
        initialProps: { analyses: [createMockAnalysis({ status: 'processing' })] },
      }
    );

    rerender({
      analyses: [
        createMockAnalysis({
          status: 'failed',
          errorMessage: 'Invalid file format',
        }),
      ],
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Analysis Failed',
          description: expect.stringContaining('Invalid file format'),
        })
      );
    });
  });

  it('handles multiple analyses independently', async () => {
    const { rerender } = renderHook(
      ({ analyses }) => useAnalysisNotifications(analyses),
      {
        initialProps: {
          analyses: [
            createMockAnalysis({ id: '1', status: 'queued' }),
            createMockAnalysis({ id: '2', status: 'processing' }),
          ],
        },
      }
    );

    rerender({
      analyses: [
        createMockAnalysis({ id: '1', status: 'processing' }),
        createMockAnalysis({ id: '2', status: 'completed' }),
      ],
    });

    await waitFor(() => {
      expect(notification.info).toHaveBeenCalled();
      expect(notification.success).toHaveBeenCalled();
    });
  });

  it('does not show duplicate notifications for same status', async () => {
    const { rerender } = renderHook(
      ({ analyses }) => useAnalysisNotifications(analyses),
      {
        initialProps: { analyses: [createMockAnalysis({ status: 'processing' })] },
      }
    );

    // Rerender with same status
    rerender({ analyses: [createMockAnalysis({ status: 'processing' })] });

    await waitFor(() => {
      expect(notification.info).not.toHaveBeenCalled();
    });
  });
});
