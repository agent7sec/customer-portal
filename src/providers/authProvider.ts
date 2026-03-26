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
      // Callback handling is owned by the /callback route (CallbackPage).
      // Here we only check whether a valid session already exists.
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
    try {
      const user = await auth0Service.getCurrentUser();
      if (!user) return [];
      // Roles are injected by Auth0 Actions under the https://a7s.app/ namespace
      // e.g. ["customer", "subscriber"] or ["customer"]
      const client = (auth0Service as any)['auth0Client'];
      if (client) {
        const claims = await client.getIdTokenClaims?.();
        const roles: string[] = claims?.['https://a7s.app/roles'] || [];
        return roles;
      }
      return [];
    } catch {
      return [];
    }
  },


  getIdentity: async () => {
    try {
      const user = await auth0Service.getCurrentUser();
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        email: user.email,
        avatar: user.picture,
        tenantId: user.tenantId,
        organizationName: user.organizationName,
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

