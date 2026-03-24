import { useEffect, useRef } from 'react';
import type { PerformanceMetric } from '../types/errors';

/**
 * Hook to monitor page load performance
 */
export const usePageLoadTime = (pageName: string): void => {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;

    // Wait for page to fully load
    const logPageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const metric: PerformanceMetric = {
          name: `page_load_${pageName}`,
          value: loadTime,
          timestamp: new Date(),
          metadata: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
          },
        };

        logPerformanceMetric(metric);
        hasLogged.current = true;
      }
    };

    if (document.readyState === 'complete') {
      logPageLoad();
    } else {
      window.addEventListener('load', logPageLoad);
      return () => window.removeEventListener('load', logPageLoad);
    }
  }, [pageName]);
};

/**
 * Hook to track user interactions and their response times
 */
export const useInteractionTracking = () => {
  const trackInteraction = (actionName: string, startTime: number) => {
    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name: `interaction_${actionName}`,
      value: duration,
      timestamp: new Date(),
    };

    logPerformanceMetric(metric);
  };

  return { trackInteraction };
};

/**
 * Hook to measure component render time
 */
export const useRenderTime = (componentName: string): void => {
  const renderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    
    const metric: PerformanceMetric = {
      name: `render_${componentName}`,
      value: renderTime,
      timestamp: new Date(),
    };

    logPerformanceMetric(metric);
  }, [componentName]);
};

/**
 * Log performance metric to console in dev, send to monitoring service in production
 */
const logPerformanceMetric = (metric: PerformanceMetric): void => {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`, metric.metadata);
  } else {
    // In production, send to monitoring service (e.g., CloudWatch, DataDog)
    sendToMonitoringService(metric);
  }
};

/**
 * Send metric to external monitoring service
 */
const sendToMonitoringService = (metric: PerformanceMetric): void => {
  // TODO: Implement integration with monitoring service
  // For now, just log to console
  console.log('[Performance]', metric);

  // Example: Send to API endpoint
  // fetch('/api/metrics/performance', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  // }).catch(console.error);
};
