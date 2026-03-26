import React from 'react';
import { Badge, Tag } from 'antd';
import {
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { STATUS_LABELS, STATUS_COLORS, normalizeStatus } from '../../types/analysis.types';
import type { AnalysisStatus } from '../../types/analysis.types';

interface StatusIndicatorProps {
  status: AnalysisStatus;
  showIcon?: boolean;
  size?: 'small' | 'default';
}

/**
 * Visual indicator for analysis status
 * Uses Ant Design Badge and Tag with color coding
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showIcon = true,
  size = 'default'
}) => {
  const normalizedStatus = normalizeStatus(status as string);
  const getIcon = () => {
    switch (normalizedStatus) {
      case 'uploading':
        return <CloudUploadOutlined />;
      case 'queued':
        return <ClockCircleOutlined />;
      case 'processing':
        return <SyncOutlined spin />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  return (
    <Tag
      color={STATUS_COLORS[normalizedStatus]}
      icon={showIcon ? getIcon() : undefined}
      style={{ fontSize: size === 'small' ? '12px' : '14px' }}
    >
      {STATUS_LABELS[normalizedStatus]}
    </Tag>
  );
};
