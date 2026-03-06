import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for polling data at regular intervals
 * @param callback - Async function to call on each poll
 * @param interval - Polling interval in milliseconds
 * @param enabled - Whether polling is enabled
 */
export const usePolling = (
    callback: () => Promise<void>,
    interval: number,
    enabled: boolean = true
) => {
    const savedCallback = useRef(callback);

    // Update ref when callback changes
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        let isMounted = true;

        const tick = async () => {
            if (isMounted) {
                await savedCallback.current();
            }
        };

        // Initial call
        tick();

        // Set up interval
        const id = setInterval(tick, interval);

        return () => {
            isMounted = false;
            clearInterval(id);
        };
    }, [interval, enabled]);
};

/**
 * Hook for polling with exponential backoff on error
 */
export const usePollingWithBackoff = (
    callback: () => Promise<void>,
    baseInterval: number,
    maxInterval: number,
    enabled: boolean = true
) => {
    const savedCallback = useRef(callback);
    const intervalRef = useRef(baseInterval);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const tick = async () => {
            if (!isMounted) return;

            try {
                await savedCallback.current();
                intervalRef.current = baseInterval; // Reset on success
            } catch {
                // Increase interval on error (exponential backoff)
                intervalRef.current = Math.min(intervalRef.current * 2, maxInterval);
            }

            if (isMounted) {
                timeoutId = setTimeout(tick, intervalRef.current);
            }
        };

        tick();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [baseInterval, maxInterval, enabled]);
};
