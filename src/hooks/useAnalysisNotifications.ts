import { useEffect, useRef, useState } from 'react';
import { notification } from 'antd';
import type { Analysis, AnalysisStatus } from '../types/analysis.types';

interface UseAnalysisNotificationsOptions {
  enableBrowserNotifications?: boolean;
}

/**
 * Hook for managing analysis status change notifications
 * Provides both Ant Design notifications and browser notifications
 */
export const useAnalysisNotifications = (
  analyses: Analysis[],
  options: UseAnalysisNotificationsOptions = {}
) => {
  const { enableBrowserNotifications = false } = options;
  const previousStatusesRef = useRef<Map<string, AnalysisStatus>>(new Map());
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);

  // Request browser notification permission
  useEffect(() => {
    if (enableBrowserNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setBrowserNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          setBrowserNotificationsEnabled(permission === 'granted');
        });
      }
    }
  }, [enableBrowserNotifications]);

  // Monitor status changes
  useEffect(() => {
    analyses.forEach((analysis) => {
      const previousStatus = previousStatusesRef.current.get(analysis.id);

      // Skip if this is the first time we're seeing this analysis
      if (!previousStatus) {
        previousStatusesRef.current.set(analysis.id, analysis.status);
        return;
      }

      // Check if status has changed
      if (previousStatus !== analysis.status) {
        handleStatusChange(analysis, previousStatus);
        previousStatusesRef.current.set(analysis.id, analysis.status);
      }
    });
  }, [analyses, browserNotificationsEnabled]);

  const handleStatusChange = (analysis: Analysis, previousStatus: AnalysisStatus) => {
    const { status, fileName } = analysis;

    // Show Ant Design notification
    switch (status) {
      case 'queued':
        notification.info({
          message: 'Analysis Queued',
          description: `${fileName} has been queued for processing.`,
          placement: 'topRight',
        });
        break;

      case 'processing':
        notification.info({
          message: 'Analysis Started',
          description: `Processing has started for ${fileName}.`,
          placement: 'topRight',
        });
        break;

      case 'completed':
        notification.success({
          message: 'Analysis Complete!',
          description: `${fileName} has been analyzed successfully. Your certificate is ready.`,
          placement: 'topRight',
          duration: 6,
        });

        // Show browser notification for completion
        if (browserNotificationsEnabled) {
          showBrowserNotification(
            'Analysis Complete!',
            `${fileName} has been analyzed successfully.`
          );
        }
        break;

      case 'failed':
        notification.error({
          message: 'Analysis Failed',
          description: `${fileName} analysis failed. ${analysis.errorMessage || 'Please try again.'}`,
          placement: 'topRight',
          duration: 8,
        });

        // Show browser notification for failure
        if (browserNotificationsEnabled) {
          showBrowserNotification(
            'Analysis Failed',
            `${fileName} analysis encountered an error.`
          );
        }
        break;
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  return {
    browserNotificationsEnabled,
  };
};
