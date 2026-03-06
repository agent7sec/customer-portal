import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Focus management for route changes
 */
export const useFocusOnRouteChange = () => {
    const location = useLocation();
    const mainRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Focus main content on route change for screen readers
        mainRef.current?.focus();
    }, [location.pathname]);

    return mainRef;
};

/**
 * Hook for announcing messages to screen readers
 */
export const useAnnounce = () => {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', priority);
        el.setAttribute('aria-atomic', 'true');
        el.className = 'sr-only';
        el.textContent = message;
        document.body.appendChild(el);

        // Remove after announcement
        setTimeout(() => el.remove(), 1000);
    }, []);

    return { announce };
};

/**
 * Trap focus within a container (for modals)
 */
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, isActive: boolean) => {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [containerRef, isActive]);
};
