import { describe, it, expect } from 'vitest';
import { refineQueryConfig, refineOptions, resourceCacheConfig } from './refine';

describe('Refine Configuration', () => {
    describe('refineQueryConfig', () => {
        it('should have correct query default options', () => {
            expect(refineQueryConfig.defaultOptions.queries).toBeDefined();
            expect(refineQueryConfig.defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
            expect(refineQueryConfig.defaultOptions.queries?.retry).toBe(1);
            expect(refineQueryConfig.defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000);
            expect(refineQueryConfig.defaultOptions.queries?.gcTime).toBe(10 * 60 * 1000);
        });

        it('should have correct mutation default options', () => {
            expect(refineQueryConfig.defaultOptions.mutations).toBeDefined();
            expect(refineQueryConfig.defaultOptions.mutations?.retry).toBe(1);
        });
    });

    describe('refineOptions', () => {
        it('should have correct Refine options', () => {
            expect(refineOptions.syncWithLocation).toBe(true);
            expect(refineOptions.warnWhenUnsavedChanges).toBe(true);
            expect(refineOptions.useNewQueryKeys).toBe(true);
            expect(refineOptions.projectId).toBe('customer-portal');
            expect(refineOptions.disableTelemetry).toBe(true);
        });
    });

    describe('resourceCacheConfig', () => {
        it('should have certificates cache configuration', () => {
            expect(resourceCacheConfig.certificates).toBeDefined();
            expect(resourceCacheConfig.certificates.staleTime).toBe(10 * 60 * 1000);
            expect(resourceCacheConfig.certificates.gcTime).toBe(30 * 60 * 1000);
        });

        it('should have analyses cache configuration with short stale time', () => {
            expect(resourceCacheConfig.analyses).toBeDefined();
            expect(resourceCacheConfig.analyses.staleTime).toBe(5 * 1000);
            expect(resourceCacheConfig.analyses.gcTime).toBe(5 * 60 * 1000);
        });

        it('should have subscriptions cache configuration', () => {
            expect(resourceCacheConfig.subscriptions).toBeDefined();
            expect(resourceCacheConfig.subscriptions.staleTime).toBe(15 * 60 * 1000);
            expect(resourceCacheConfig.subscriptions.gcTime).toBe(30 * 60 * 1000);
        });

        it('should have plans cache configuration with long stale time', () => {
            expect(resourceCacheConfig.plans).toBeDefined();
            expect(resourceCacheConfig.plans.staleTime).toBe(60 * 60 * 1000);
            expect(resourceCacheConfig.plans.gcTime).toBe(24 * 60 * 60 * 1000);
        });

        it('should have longer cache times for static resources', () => {
            expect(resourceCacheConfig.plans.staleTime).toBeGreaterThan(
                resourceCacheConfig.certificates.staleTime
            );
            expect(resourceCacheConfig.certificates.staleTime).toBeGreaterThan(
                resourceCacheConfig.analyses.staleTime
            );
        });
    });
});
