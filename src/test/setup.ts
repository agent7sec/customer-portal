import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Auth0 SDK
vi.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: vi.fn().mockImplementation(() => ({
    loginWithRedirect: vi.fn(),
    handleRedirectCallback: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn(),
    getTokenSilently: vi.fn(),
    getIdTokenClaims: vi.fn(),
    isAuthenticated: vi.fn(),
  })),
}));

// Mock Auth0Service
vi.mock('../services/Auth0Service', () => ({
  auth0Service: {
    signInWithRedirect: vi.fn(),
    signUpWithRedirect: vi.fn(),
    handleRedirectCallback: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
    getTokens: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

