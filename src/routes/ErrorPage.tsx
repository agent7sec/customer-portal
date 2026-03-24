import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * 500 Error Page - Internal Server Error
 */
export const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong on our end."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Go Home
          </Button>,
          <Button key="retry" onClick={() => window.location.reload()}>
            Retry
          </Button>,
        ]}
      />
    </div>
  );
};
