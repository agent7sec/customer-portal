import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ApiError, AuthenticationError, isApiError, isAuthError } from '../types/errors';

export const useErrorHandler = () => {
    const navigate = useNavigate();

    const handleError = (error: unknown) => {
        if (isAuthError(error)) {
            navigate('/login');
            return;
        }

        if (isApiError(error)) {
            notification.error({
                message: 'Error',
                description: error.message,
                duration: error.statusCode >= 500 ? 0 : 4.5,
            });
            return;
        }

        notification.error({
            message: 'Unexpected Error',
            description: error instanceof Error ? error.message : 'Please try again',
        });
    };

    return { handleError };
};
