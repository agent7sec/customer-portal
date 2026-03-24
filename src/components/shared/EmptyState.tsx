import React from 'react';
import { Empty, Button } from 'antd';
import type { EmptyProps } from 'antd';

interface EmptyStateProps extends EmptyProps {
  title?: string;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Consistent empty state component with optional action button
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data',
  description,
  actionText,
  onAction,
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  ...props
}) => {
  return (
    <Empty
      image={image}
      description={
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
            {title}
          </div>
          {description && <div style={{ color: '#8c8c8c' }}>{description}</div>}
        </div>
      }
      {...props}
    >
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
};
