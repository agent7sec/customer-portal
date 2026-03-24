import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useFocusOnRouteChange = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return mainRef;
};

export const useAnnounce = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', priority);
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  };

  return { announce };
};
