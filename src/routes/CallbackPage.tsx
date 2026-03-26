import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { auth0Service } from '../services/Auth0Service';

const { Text } = Typography;

/**
 * CallbackPage handles the Auth0 redirect after login/signup.
 * It processes the authorization code using the same auth0Service singleton
 * that the Refine authProvider uses, then redirects to the intended page.
 */
export const CallbackPage = () => {
    const navigate = useNavigate();
    const processedRef = useRef(false);

    useEffect(() => {
        // Prevent double-processing (React StrictMode or unstable deps)
        if (processedRef.current) return;
        processedRef.current = true;

        const processCallback = async () => {
            try {
                const { returnTo: rawReturnTo } = await auth0Service.handleRedirectCallback();
                // Guard against open-redirect: only allow same-origin relative paths
                const safeReturnTo =
                    typeof rawReturnTo === 'string' &&
                        rawReturnTo.startsWith('/') &&
                        !rawReturnTo.startsWith('//')
                        ? rawReturnTo
                        : '/dashboard';
                navigate(safeReturnTo, { replace: true });
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login', { replace: true });
            }
        };

        processCallback();
    }, [navigate]);

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
