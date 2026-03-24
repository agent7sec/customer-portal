import type { AuthProvider } from "@refinedev/core";
import { Auth0Client } from "@auth0/auth0-spa-js";

const auth0Client = new Auth0Client({
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "your-domain.auth0.com",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "your-client-id",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  },
  cacheLocation: "memory",
});

export const authProvider: AuthProvider = {
  login: async ({ email }) => {
    try {
      await auth0Client.loginWithRedirect({
        authorizationParams: {
          login_hint: email,
        },
      });
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
      await auth0Client.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
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
      const isAuthenticated = await auth0Client.isAuthenticated();
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
    try {
      const user = await auth0Client.getUser();
      return user?.["https://your-app.com/roles"] || [];
    } catch (error) {
      return null;
    }
  },

  getIdentity: async () => {
    try {
      const user = await auth0Client.getUser();
      if (user) {
        return {
          id: user.sub || "",
          name: user.name || "",
          email: user.email || "",
          avatar: user.picture,
        };
      }
      return null;
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

export { auth0Client };
