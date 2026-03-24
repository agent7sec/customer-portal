/**
 * Error types and interfaces for error handling and monitoring
 */

export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}


/**
 * Parse API error response
 */
export function parseApiError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}
