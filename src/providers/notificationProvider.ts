import { notification, message } from 'antd';
import type { NotificationArgsProps } from 'antd';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationConfig {
    title: string;
    message?: string;
    type?: NotificationType;
    duration?: number;
    key?: string;
}

/**
 * Centralized notification service for consistent user feedback
 */
export const notificationService = {
    success: (config: NotificationConfig) => {
        notification.success({
            message: config.title,
            description: config.message,
            duration: config.duration ?? 4.5,
            key: config.key,
        });
    },

    error: (config: NotificationConfig) => {
        notification.error({
            message: config.title,
            description: config.message,
            duration: config.duration ?? 0, // Errors stay until closed
            key: config.key,
        });
    },

    info: (config: NotificationConfig) => {
        notification.info({
            message: config.title,
            description: config.message,
            duration: config.duration ?? 4.5,
            key: config.key,
        });
    },

    warning: (config: NotificationConfig) => {
        notification.warning({
            message: config.title,
            description: config.message,
            duration: config.duration ?? 4.5,
            key: config.key,
        });
    },

    close: (key: string) => {
        notification.destroy(key);
    },

    closeAll: () => {
        notification.destroy();
    },
};

/**
 * Toast-style messages for quick feedback
 */
export const toastService = {
    success: (content: string) => message.success(content),
    error: (content: string) => message.error(content),
    warning: (content: string) => message.warning(content),
    info: (content: string) => message.info(content),
    loading: (content: string) => message.loading(content),
};
