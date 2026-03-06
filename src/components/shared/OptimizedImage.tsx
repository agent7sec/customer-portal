import React, { useState } from 'react';
import { Skeleton } from 'antd';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    fallback?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    width,
    height,
    className,
    fallback,
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    if (error) {
        return fallback ? (
            <>{fallback}</>
        ) : (
            <div
                style={{
                    width,
                    height,
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                }}
            >
                <span style={{ color: '#999', fontSize: 12 }}>Image not available</span>
            </div>
        );
    }

    return (
        <>
            {!loaded && <Skeleton.Image active style={{ width, height }} />}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                className={className}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                style={{ display: loaded ? 'block' : 'none' }}
            />
        </>
    );
};
