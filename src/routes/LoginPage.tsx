import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Text } = Typography;

/**
 * LoginPage redirects to Auth0 Universal Login.
 * If the user was trying to access a protected page, the return path is preserved.
 */
export const LoginPage = () => {
  const location = useLocation();
  const { signIn, isAuthenticated, isLoading } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Only redirect to Auth0 if not already authenticated and not loading
    if (!isAuthenticated && !isLoading) {
      signIn(from);
    }
  }, [isAuthenticated, isLoading, signIn, from]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      gap: '16px',
    }}>
      <Spin size="large" />
      <Text type="secondary">Redirecting to sign in...</Text>
    </div>
  );
};
