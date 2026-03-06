import React, { useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Typography, Card, Empty } from 'antd';
import {
    EyeOutlined,
    DownloadOutlined,
    ReloadOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { analysisService } from '../../services/AnalysisService';
import { usePolling } from '../../hooks/usePolling';
import type { Analysis } from '../../types/analysis.types';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/analysis.types';
import { formatFileSize } from '../../types/upload.types';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalyses = useCallback(async () => {
        try {
            const data = await analysisService.getAnalyses();
            setAnalyses(data);
        } catch (error) {
            console.error('Failed to fetch analyses', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll every 5 seconds if there are active analyses
    const hasActiveAnalyses = analyses.some((a) =>
        ['uploading', 'queued', 'processing'].includes(a.status)
    );
    usePolling(fetchAnalyses, 5000, hasActiveAnalyses || loading);

    const columns = [
        {
            title: 'File Name',
            dataIndex: 'fileName',
            key: 'fileName',
            ellipsis: true,
        },
        {
            title: 'Size',
            dataIndex: 'fileSize',
            key: 'fileSize',
            render: (size: number) => formatFileSize(size),
            width: 100,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
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
            width: 100,
            render: (progress: number, record: Analysis) =>
                record.status === 'processing' ? `${progress}%` : '-',
        },
        {
            title: 'Submitted',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            width: 150,
            render: (date: Date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_: any, record: Analysis) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => navigate(`/analyses/${record.id}`)}
                    >
                        View
                    </Button>
                    {record.certificateId && (
                        <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            type="primary"
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
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Analysis Dashboard
                </Title>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchAnalyses} loading={loading}>
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => navigate('/upload')}
                    >
                        New Analysis
                    </Button>
                </Space>
            </div>

            {analyses.length === 0 && !loading ? (
                <Card>
                    <Empty
                        description="No analyses yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/upload')}>
                            Upload Code for Analysis
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Table
                    dataSource={analyses}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};
