import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

/**
 * CallbackPage handles the Auth0 redirect after login/signup.
 * It processes the authorization code and redirects to the intended page.
 */
export const CallbackPage = () => {
    const navigate = useNavigate();
    const { handleRedirectCallback } = useAuth();
    const processedRef = useRef(false);

    useEffect(() => {
        // Prevent double-processing (React StrictMode or unstable deps)
        if (processedRef.current) return;
        processedRef.current = true;

        const processCallback = async () => {
            try {
                const returnTo = await handleRedirectCallback();
                navigate(returnTo, { replace: true });
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login', { replace: true });
            }
        };

        processCallback();
    }, [handleRedirectCallback, navigate]);

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
            <Text type="secondary">Completing sign in...</Text>
        </div>
    );
};
