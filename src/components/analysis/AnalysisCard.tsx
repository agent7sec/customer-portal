import React from 'react';
import { Card, Progress, Space, Typography, Button } from 'antd';
import { EyeOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Analysis } from '../../types/analysis.types';
import { StatusIndicator } from './StatusIndicator';

const { Text, Title } = Typography;

interface AnalysisCardProps {
  analysis: Analysis;
}

/**
 * Card component displaying individual analysis summary
 * Uses Ant Design Card with status indicators and actions
 */
export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const navigate = useNavigate();

  const formatFileSize = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card
      hoverable
      style={{ marginBottom: 16 }}
      actions={[
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/analyses/${analysis.id}`)}
        >
          View Details
        </Button>,
        analysis.certificateUrl && (
          <Button
            key="certificate"
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => navigate(`/certificates/${analysis.certificateUrl}`)}
          >
            Certificate
          </Button>
        ),
      ].filter(Boolean)}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <FileTextOutlined style={{ fontSize: 20 }} />
            <Title level={5} style={{ margin: 0 }}>
              {analysis.fileName}
            </Title>
          </Space>
          <StatusIndicator status={analysis.status} />
        </div>

        <div>
          <Text type="secondary">File Size: </Text>
          <Text>{formatFileSize(analysis.fileSize)}</Text>
        </div>

        <div>
          <Text type="secondary">Submitted: </Text>
          <Text>{formatDate(analysis.createdAt || analysis.submittedAt || analysis.uploadedAt)}</Text>
        </div>

        {analysis.status === 'processing' && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Progress: {analysis.progress}%
            </Text>
            <Progress percent={analysis.progress} status="active" />
            {analysis.currentStage && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Current Stage: {analysis.currentStage}
              </Text>
            )}
          </div>
        )}

        {analysis.status === 'completed' && analysis.completedAt && (
          <div>
            <Text type="secondary">Completed: </Text>
            <Text>{formatDate(analysis.completedAt)}</Text>
          </div>
        )}

        {analysis.status === 'failed' && analysis.errorMessage && (
          <div>
            <Text type="danger">{analysis.errorMessage}</Text>
          </div>
        )}
      </Space>
    </Card>
  );
};
