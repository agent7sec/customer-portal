import React from 'react';
import { Spin } from 'antd';

interface LoadingOverlayProps {
  tip?: string;
  fullScreen?: boolean;
}

/**
 * Full-screen or inline loading overlay with spinner
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  tip = 'Loading...', 
  fullScreen = true 
}) => {
  const style: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
      };

  return (
    <div style={style}>
      <Spin size="large" tip={tip} />
    </div>
  );
};
