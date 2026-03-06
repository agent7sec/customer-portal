import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="404"
            title="Page Not Found"
            subTitle="The page you're looking for doesn't exist."
            extra={
                <Button type="primary" onClick={() => navigate('/')}>
                    Go Home
                </Button>
            }
        />
    );
};
