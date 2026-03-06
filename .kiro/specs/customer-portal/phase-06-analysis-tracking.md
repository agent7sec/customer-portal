# Phase 6: Analysis Tracking Specification

## Overview

Implement real-time analysis status tracking with polling and notifications.

## Status: ⏳ NOT STARTED

---

## 6.1 TypeScript Interfaces

### src/types/analysis.types.ts

```typescript
export interface Analysis {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  status: AnalysisStatus;
  progress: number;
  currentStage?: string;
  submittedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  certificateId?: string;
}

export type AnalysisStatus = 
  | 'uploading' 
  | 'queued' 
  | 'processing' 
  | 'completed' 
  | 'failed';

export const STATUS_LABELS: Record<AnalysisStatus, string> = {
  uploading: 'Uploading',
  queued: 'In Queue',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export const STATUS_COLORS: Record<AnalysisStatus, string> = {
  uploading: 'blue',
  queued: 'gold',
  processing: 'processing',
  completed: 'green',
  failed: 'red',
};
```

---

## 6.2 Analysis Service

### src/services/AnalysisService.ts

```typescript
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import { Analysis } from '../types/analysis.types';

class AnalysisService {
  private async getHeaders() {
    const token = await auth0Service.getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }

  async getAnalyses(): Promise<Analysis[]> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${config.api.baseUrl}/analyses`, { headers });
    return response.data.map(this.mapAnalysis);
  }

  async getAnalysis(id: string): Promise<Analysis> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${config.api.baseUrl}/analyses/${id}`, { headers });
    return this.mapAnalysis(response.data);
  }

  private mapAnalysis(data: any): Analysis {
    return {
      id: data.id,
      userId: data.user_id,
      fileName: data.file_name,
      fileSize: data.file_size,
      status: data.status,
      progress: data.progress || 0,
      currentStage: data.current_stage,
      submittedAt: new Date(data.submitted_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      errorMessage: data.error_message,
      certificateId: data.certificate_id,
    };
  }
}

export const analysisService = new AnalysisService();
```

---

## 6.3 usePolling Hook

### src/hooks/usePolling.ts

```typescript
import { useEffect, useRef, useCallback } from 'react';

export const usePolling = (
  callback: () => Promise<void>,
  interval: number,
  enabled: boolean = true
) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      await savedCallback.current();
    };

    tick(); // Initial call
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
};
```

---

## 6.4 Dashboard Component

### src/components/analysis/Dashboard.tsx

```typescript
import React, { useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Typography } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { analysisService } from '../../services/AnalysisService';
import { usePolling } from '../../hooks/usePolling';
import { Analysis, STATUS_LABELS, STATUS_COLORS } from '../../types/analysis.types';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = useCallback(async () => {
    try {
      const data = await analysisService.getAnalyses();
      setAnalyses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 5 seconds if there are active analyses
  const hasActiveAnalyses = analyses.some(a => 
    ['uploading', 'queued', 'processing'].includes(a.status)
  );
  usePolling(fetchAnalyses, 5000, hasActiveAnalyses);

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}>
          {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: Analysis) => 
        record.status === 'processing' ? `${progress}%` : '-',
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Analysis) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/analyses/${record.id}`)}
          >
            View
          </Button>
          {record.certificateId && (
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => navigate(`/certificates/${record.certificateId}`)}
            >
              Certificate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Analysis Dashboard</Title>
      <Table
        dataSource={analyses}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
```

---

## 6.5 Analysis Details Component

### src/components/analysis/AnalysisDetails.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Progress, Timeline, Tag, Spin, notification } from 'antd';
import { useParams } from 'react-router-dom';
import { analysisService } from '../../services/AnalysisService';
import { usePolling } from '../../hooks/usePolling';
import { Analysis, STATUS_LABELS, STATUS_COLORS } from '../../types/analysis.types';

const STAGES = ['Uploaded', 'Queued', 'Scanning', 'Analyzing', 'Generating Report', 'Complete'];

export const AnalysisDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notified, setNotified] = useState(false);

  const fetchAnalysis = async () => {
    if (!id) return;
    const data = await analysisService.getAnalysis(id);
    
    // Notify on completion
    if (data.status === 'completed' && !notified) {
      notification.success({ message: 'Analysis Complete!', description: 'Your certificate is ready.' });
      setNotified(true);
    }
    
    setAnalysis(data);
    setLoading(false);
  };

  const isActive = analysis && ['uploading', 'queued', 'processing'].includes(analysis.status);
  usePolling(fetchAnalysis, 5000, isActive);

  useEffect(() => { fetchAnalysis(); }, [id]);

  if (loading) return <Spin size="large" />;
  if (!analysis) return <div>Analysis not found</div>;

  return (
    <Card title={analysis.fileName}>
      <Descriptions column={2}>
        <Descriptions.Item label="Status">
          <Tag color={STATUS_COLORS[analysis.status]}>{STATUS_LABELS[analysis.status]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Submitted">
          {new Date(analysis.submittedAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="File Size">
          {(analysis.fileSize / 1024 / 1024).toFixed(2)} MB
        </Descriptions.Item>
        {analysis.completedAt && (
          <Descriptions.Item label="Completed">
            {new Date(analysis.completedAt).toLocaleString()}
          </Descriptions.Item>
        )}
      </Descriptions>

      {analysis.status === 'processing' && (
        <Progress percent={analysis.progress} style={{ marginTop: 16 }} />
      )}

      <Timeline style={{ marginTop: 24 }}>
        {STAGES.map((stage, i) => (
          <Timeline.Item 
            key={stage}
            color={analysis.progress >= (i + 1) * 20 ? 'green' : 'gray'}
          >
            {stage}
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};
```

---

## Verification

```bash
npm test -- src/components/analysis/
npm run type-check
```
