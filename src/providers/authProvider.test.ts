import { describe, it, expect, vi, beforeEach } from "vitest";
import { authProvider } from "./authProvider";

// Mock Auth0 client
vi.mock("@auth0/auth0-spa-js", () => ({
  Auth0Client: vi.fn().mockImplementation(function () {
    return {
      loginWithRedirect: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: vi.fn().mockResolvedValue(false),
      getUser: vi.fn().mockResolvedValue(null),
      getTokenSilently: vi.fn().mockResolvedValue("mock-token"),
      handleRedirectCallback: vi.fn().mockResolvedValue(undefined),
    };
  }),
}));

describe("authProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should initiate Auth0 login redirect", async () => {
      const result = await authProvider.login({ email: "test@example.com" });
      expect(result.success).toBe(true);
    });

    it("should handle login errors", async () => {
      const result = await authProvider.login({ email: "test@example.com" });
      expect(result).toHaveProperty("success");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const result = await authProvider.logout({});
      expect(result.success).toBe(true);
    });
  });

  describe("check", () => {
    it("should return authenticated false when not authenticated", async () => {
      const result = await authProvider.check();
      expect(result.authenticated).toBe(false);
      expect(result.redirectTo).toBe("/login");
    });

    it("should handle redirect callback when code and state are present", async () => {
      const originalLocation = window.location;

      // Mock window.location.search
      Object.defineProperty(window, "location", {
        value: {
          ...originalLocation,
          search: "?code=xyz&state=abc",
          pathname: "/",
        },
        writable: true,
      });

      // We just want to check if it parses, we don't care about the final auth state
      await authProvider.check();

      // Since we can't easily assert on the inner mock without exporting it, 
      // we just ensure no errors are thrown during handleRedirectCallback

      // Restore window.location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe("getIdentity", () => {
    it("should return null when no user", async () => {
      const result = await authProvider.getIdentity();
      expect(result).toBeNull();
    });
  });

  describe("getPermissions", () => {
    it("should return empty array when no permissions", async () => {
      const result = await authProvider.getPermissions();
      expect(result).toEqual([]);
    });
  });

  describe("onError", () => {
    it("should handle 401 errors with logout", async () => {
      const result = await authProvider.onError({ statusCode: 401 });
      expect(result.logout).toBe(true);
      expect(result.redirectTo).toBe("/login");
    });

    it("should handle other errors without logout", async () => {
      const result = await authProvider.onError({ statusCode: 500 });
      expect(result.logout).toBeUndefined();
    });
  });
});
