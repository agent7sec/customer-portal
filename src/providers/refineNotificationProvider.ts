import React from 'react';
import type { NotificationProvider } from '@refinedev/core';
import { notification, Button } from 'antd';

/**
 * Refine Notification Provider using Ant Design notification
 * Provides consistent feedback for CRUD operations
 */
export const refineNotificationProvider: NotificationProvider = {
  open: ({ key, message, description, type = 'info', cancelMutation, undoableTimeout }) => {
    if (type === 'progress') {
      notification.open({
        key,
        message,
        description,
        duration: 0,
        closeIcon: React.createElement(React.Fragment),
      });
    } else {
      const notificationConfig: any = {
        key,
        message,
        description,
        duration: type === 'error' ? 0 : 4.5,
      };

      // Add undo button for undoable operations
      if (undoableTimeout && cancelMutation) {
        notificationConfig.btn = React.createElement(
          Button,
          {
            type: 'primary',
            size: 'small',
            onClick: () => {
              cancelMutation();
              notification.destroy(key);
            },
          },
          'Undo'
        );
      }

      (notification as any)[type](notificationConfig);
    }
  },
  close: (key) => {
    notification.destroy(key);
  },
};
