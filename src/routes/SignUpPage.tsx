import { useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Text } = Typography;

/**
 * SignUpPage redirects to Auth0 Universal Login with the sign-up screen.
 */
export const SignUpPage = () => {
  const { signUp, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      signUp();
    }
  }, [isAuthenticated, isLoading, signUp]);

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
      <Text type="secondary">Redirecting to sign up...</Text>
    </div>
  );
};
