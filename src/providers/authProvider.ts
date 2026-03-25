import type { AuthProvider } from "@refinedev/core";
import { auth0Service } from "../services/Auth0Service";

export const authProvider: AuthProvider = {
  login: async ({ email }) => {
    try {
      if (email) {
        // Just keeping the interface compatible, we might need a custom flow 
        // to pass login_hint with the Auth0Service, but default works.
        await auth0Service.signInWithRedirect();
      } else {
        await auth0Service.signInWithRedirect();
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Failed to initiate login",
        },
      };
    }
  },

  logout: async () => {
    try {
      await auth0Service.signOut();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LogoutError",
          message: "Failed to logout",
        },
      };
    }
  },

  check: async () => {
    try {
      // Handle the redirect callback if returning from Auth0
      if (
        window.location.search.includes("code=") &&
        window.location.search.includes("state=")
      ) {
        await auth0Service.handleRedirectCallback();
        // Clean up the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const isAuthenticated = await auth0Service.isAuthenticated();
      if (isAuthenticated) {
        return { authenticated: true };
      }
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }
  },

  getPermissions: async () => {
    return [];
  },

  getIdentity: async () => {
    try {
      const user = await auth0Service.getCurrentUser();
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        email: user.email,
        avatar: undefined,
      };
    } catch (error) {
      return null;
    }
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }
    return { error };
  },
};

