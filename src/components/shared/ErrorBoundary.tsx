import React, { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { errorLoggingService } from '../../services/ErrorLoggingService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to service
    errorLoggingService.logError(error, errorInfo.componentStack);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="We're sorry, but something unexpected happened. Please try again."
            extra={[
              <Button type="primary" key="retry" onClick={this.handleReset}>
                Try Again
              </Button>,
              <Button key="home" onClick={() => (window.location.href = '/')}>
                Go Home
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
