/**
 * Error logging service for production environments
 * Logs errors to console in development and can be extended to send to external services
 */

import type { ErrorLog } from '../types/errors';

class ErrorLoggingService {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log an error with context information
   */
  logError(error: Error, componentStack?: string, userId?: string): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId,
    };

    if (this.isDevelopment) {
      console.error('Error logged:', errorLog);
    } else {
      // In production, send to external logging service
      this.sendToLoggingService(errorLog);
    }
  }

  /**
   * Send error to external logging service (e.g., Sentry, CloudWatch)
   */
  private sendToLoggingService(errorLog: ErrorLog): void {
    // TODO: Implement integration with external logging service
    // For now, just log to console
    console.error('Production error:', errorLog);

    // Example: Send to API endpoint
    // fetch('/api/logs/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog),
    // }).catch(console.error);
  }

  /**
   * Log a warning message
   */
  logWarning(message: string, context?: Record<string, unknown>): void {
    const log = {
      message,
      context,
      timestamp: new Date(),
      url: window.location.href,
    };

    if (this.isDevelopment) {
      console.warn('Warning logged:', log);
    } else {
      console.warn('Production warning:', log);
    }
  }
}

export const errorLoggingService = new ErrorLoggingService();
