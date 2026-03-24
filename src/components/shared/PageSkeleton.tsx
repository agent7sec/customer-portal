import React from 'react';
import { Skeleton, Card, Space } from 'antd';

interface PageSkeletonProps {
  type?: 'list' | 'detail' | 'form';
  rows?: number;
}

/**
 * Skeleton loading placeholders for different page types
 */
export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  type = 'list',
  rows = 5
}) => {
  if (type === 'list') {
    return (
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </Space>
    );
  }

  if (type === 'detail') {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (type === 'form') {
    return (
      <Card>
        <Skeleton.Input active style={{ width: '100%', marginBottom: 16 }} />
        <Skeleton.Input active style={{ width: '100%', marginBottom: 16 }} />
        <Skeleton.Input active style={{ width: '100%', marginBottom: 16 }} />
        <Skeleton.Button active style={{ marginTop: 16 }} />
      </Card>
    );
  }

  return <Skeleton active />;
};
