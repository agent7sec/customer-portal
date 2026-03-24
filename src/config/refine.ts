import type { QueryClientConfig } from '@tanstack/react-query';
import type { RefineProps } from '@refinedev/core';

/**
 * React Query configuration for Refine
 * Configures caching, retry logic, and stale time
 */
export const refineQueryConfig: { defaultOptions: QueryClientConfig['defaultOptions'] } = {
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        },
        mutations: {
            retry: 1,
        },
    },
};

/**
 * Refine options configuration
 */
export const refineOptions: RefineProps['options'] = {
    syncWithLocation: true,
    warnWhenUnsavedChanges: true,
    useNewQueryKeys: true,
    projectId: 'customer-portal',
    disableTelemetry: true,
};

/**
 * Resource-specific cache configurations
 */
export const resourceCacheConfig = {
    // Certificates don't change frequently
    certificates: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    },
    // Analyses change frequently (polling)
    analyses: {
        staleTime: 5 * 1000, // 5 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    },
    // Subscriptions change infrequently
    subscriptions: {
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    },
    // Plans are static
    plans: {
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
    },
};
