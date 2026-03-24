import React, { useEffect, useState } from 'react';
import { useOne, useNotification } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Progress,
  Timeline,
  Spin,
  Button,
  Space,
  Typography,
  Alert
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { ANALYSIS_STAGES } from '../../types/analysis.types';
import type { Analysis } from '../../types/analysis.types';
import { StatusIndicator } from './StatusIndicator';

const { Title, Text } = Typography;

/**
 * Detailed view of a single analysis
 * Uses Refine useOne hook with polling for real-time updates
 */
export const AnalysisDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { open } = useNotification();
  const [notified, setNotified] = useState(false);

  // Fetch analysis with polling
  const { data, isLoading, isError } = useOne<Analysis>({
    resource: 'analyses',
    id: id!,
    queryOptions: {
      // Poll every 5 seconds for active analyses
      refetchInterval: (data) => {
        const analysis = data?.data;
        if (!analysis) return false;

        const isActive = ['uploading', 'queued', 'processing'].includes(analysis.status);
        return isActive ? 5000 : false;
      },
      refetchIntervalInBackground: false,
      enabled: !!id,
    },
  });

  const analysis = data?.data;

  // Notify when analysis completes
  useEffect(() => {
    if (analysis?.status === 'completed' && !notified) {
      open?.({
        type: 'success',
        message: 'Analysis Complete!',
        description: 'Your certificate is ready for download.',
      });
      setNotified(true);
    }
  }, [analysis?.status, notified, open]);

  const formatFileSize = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStageStatus = (index: number): 'finish' | 'process' | 'wait' | 'error' => {
    if (!analysis) return 'wait';

    if (analysis.status === 'failed') {
      const currentStageIndex = Math.floor(analysis.progress / 20);
      if (index < currentStageIndex) return 'finish';
      if (index === currentStageIndex) return 'error';
      return 'wait';
    }

    const stageProgress = (index + 1) * 20;
    if (analysis.progress >= stageProgress) return 'finish';
    if (analysis.progress >= stageProgress - 20) return 'process';
    return 'wait';
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading analysis details..." />
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Analysis Not Found"
          description="The requested analysis could not be found."
          type="error"
          showIcon
        />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/analyses')}
          style={{ marginTop: 16 }}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isActive = ['uploading', 'queued', 'processing'].includes(analysis.status);

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/analyses')}
          >
            Back to Dashboard
          </Button>
          {analysis.certificateUrl && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => navigate(`/certificates/${analysis.certificateUrl}`)}
            >
              Download Certificate
            </Button>
          )}
        </div>

        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                {analysis.fileName}
              </Title>
              <StatusIndicator status={analysis.status} />
            </div>

            {isActive && (
              <Alert
                message="Analysis in Progress"
                description="This page will automatically update as the analysis progresses."
                type="info"
                showIcon
              />
            )}

            <Descriptions column={2} bordered>
              <Descriptions.Item label="Analysis ID">{analysis.id}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusIndicator status={analysis.status} showIcon={false} />
              </Descriptions.Item>
              <Descriptions.Item label="File Size">
                {formatFileSize(analysis.fileSize)}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {formatDate(analysis.submittedAt)}
              </Descriptions.Item>
              {analysis.completedAt && (
                <Descriptions.Item label="Completed" span={2}>
                  {formatDate(analysis.completedAt)}
                </Descriptions.Item>
              )}
              {analysis.currentStage && (
                <Descriptions.Item label="Current Stage" span={2}>
                  {analysis.currentStage}
                </Descriptions.Item>
              )}
            </Descriptions>

            {analysis.status === 'processing' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Progress: {analysis.progress}%
                </Text>
                <Progress
                  percent={analysis.progress}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            )}

            {analysis.status === 'failed' && analysis.errorMessage && (
              <Alert
                message="Analysis Failed"
                description={analysis.errorMessage}
                type="error"
                showIcon
              />
            )}

            <div>
              <Title level={5}>Analysis Stages</Title>
              <Timeline
                items={ANALYSIS_STAGES.map((stage, index) => ({
                  color: getStageStatus(index) === 'finish' ? 'green'
                    : getStageStatus(index) === 'process' ? 'blue'
                      : getStageStatus(index) === 'error' ? 'red'
                        : 'gray',
                  children: stage,
                }))}
              />
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};
