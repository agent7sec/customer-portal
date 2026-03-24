import React from 'react';
import { useList } from '@refinedev/core';
import { Row, Col, Typography, Empty, Spin, Space } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import type { Analysis } from '../../types/analysis.types';
import { AnalysisCard } from './AnalysisCard';
import { useAnalysisNotifications } from '../../hooks/useAnalysisNotifications';

const { Title, Text } = Typography;

/**
 * Dashboard component displaying all user analyses
 * Uses Refine useList hook with polling for real-time updates
 */
export const Dashboard: React.FC = () => {
  // Fetch analyses with polling enabled for active analyses
  const { data, isLoading, isError } = useList<Analysis>({
    resource: 'analyses',
    pagination: {
      current: 1,
      pageSize: 50,
    },
    queryOptions: {
      // Poll every 5 seconds
      refetchInterval: 5000,
      // Only refetch if there are active analyses
      refetchIntervalInBackground: false,
    },
  });

  const analyses = data?.data || [];

  // Enable notifications for status changes
  useAnalysisNotifications(analyses, {
    enableBrowserNotifications: true,
  });

  // Check if there are any active analyses (for conditional polling)
  const hasActiveAnalyses = analyses.some(
    (analysis) => ['uploading', 'queued', 'processing'].includes(analysis.status)
  );

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading analyses..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">Failed to load analyses. Please try again.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>Analysis Dashboard</Title>
          <Text type="secondary">
            Track the status of your code analysis submissions
            {hasActiveAnalyses && ' • Auto-refreshing every 5 seconds'}
          </Text>
        </div>

        {analyses.length === 0 ? (
          <Empty
            image={<FileSearchOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
            description={
              <Space direction="vertical">
                <Text>No analyses found</Text>
                <Text type="secondary">Upload a file to start your first analysis</Text>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {analyses.map((analysis) => (
              <Col xs={24} sm={24} md={12} lg={8} key={analysis.id}>
                <AnalysisCard analysis={analysis} />
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
};
