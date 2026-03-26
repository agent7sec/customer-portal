// Authentication type definitions

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  /** From Auth0 app_metadata – required for DynamoDB tenant isolation */
  tenantId?: string;
  /** Human-readable organization name */
  organizationName?: string;
  /** Profile picture URL */
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}
