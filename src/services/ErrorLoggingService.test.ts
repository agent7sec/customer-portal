import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorLoggingService } from './ErrorLoggingService';

describe('ErrorLoggingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('logs error with context information', () => {
    const error = new Error('Test error');
    const componentStack = 'at Component';

    errorLoggingService.logError(error, componentStack);

    expect(console.error).toHaveBeenCalled();
  });

  it('logs warning with context', () => {
    errorLoggingService.logWarning('Test warning', { key: 'value' });

    expect(console.warn).toHaveBeenCalled();
  });

  it('includes user agent and URL in error log', () => {
    const error = new Error('Test error');
    const spy = vi.spyOn(console, 'error');

    errorLoggingService.logError(error);

    const loggedData = spy.mock.calls[0][1];
    expect(loggedData).toHaveProperty('userAgent');
    expect(loggedData).toHaveProperty('url');
  });
});
