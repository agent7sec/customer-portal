import React, { useState } from 'react';
import { Skeleton } from 'antd';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Optimized image component with lazy loading and skeleton placeholder
 * Implements native lazy loading for better performance
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  height,
  className,
  style 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          ...style
        }}
        className={className}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <Skeleton.Image 
          active 
          style={{ width, height }} 
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ 
          display: loaded ? 'block' : 'none',
          ...style
        }}
        className={className}
      />
    </>
  );
};
