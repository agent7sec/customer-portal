import React from 'react';
import { Spin } from 'antd';

interface LoadingOverlayProps {
    visible?: boolean;
    tip?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible = true,
    tip = 'Loading...',
}) => {
    if (!visible) return null;

    return (
        <div
            style={{
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
            }}
        >
            <Spin size="large" tip={tip} />
        </div>
    );
};

interface LoadingSpinnerProps {
    size?: 'small' | 'default' | 'large';
    tip?: string;
    fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    tip,
    fullHeight = false,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
                height: fullHeight ? '100vh' : 'auto',
            }}
        >
            <Spin size={size} tip={tip} />
        </div>
    );
};

interface PageLoadingProps {
    message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ message }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: 16,
        }}
    >
        <Spin size="large" />
        {message && <span style={{ color: '#666' }}>{message}</span>}
    </div>
);
