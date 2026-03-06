import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Descriptions,
    Progress,
    Timeline,
    Tag,
    Spin,
    notification,
    Button,
    Space,
    Alert,
    Typography,
} from 'antd';
import {
    DownloadOutlined,
    ReloadOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisService } from '../../services/AnalysisService';
import { usePolling } from '../../hooks/usePolling';
import type { Analysis } from '../../types/analysis.types';
import { STATUS_LABELS, STATUS_COLORS, ANALYSIS_STAGES } from '../../types/analysis.types';
import { formatFileSize } from '../../types/upload.types';

const { Title } = Typography;

export const AnalysisDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [notified, setNotified] = useState(false);
    const [retrying, setRetrying] = useState(false);

    const fetchAnalysis = useCallback(async () => {
        if (!id) return;

        try {
            const data = await analysisService.getAnalysis(id);

            // Notify on completion
            if (data.status === 'completed' && !notified) {
                notification.success({
                    title: 'Analysis Complete!',
                    message: 'Your certificate is ready for download.',
                });
                setNotified(true);
            }

            setAnalysis(data);
        } catch (error) {
            console.error('Failed to fetch analysis', error);
        } finally {
            setLoading(false);
        }
    }, [id, notified]);

    const isActive =
        analysis && ['uploading', 'queued', 'processing'].includes(analysis.status);
    usePolling(fetchAnalysis, 5000, !!isActive);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    const handleRetry = async () => {
        if (!id) return;
        setRetrying(true);
        try {
            await analysisService.retryAnalysis(id);
            await fetchAnalysis();
            notification.success({
                title: 'Retry Started',
                message: 'The analysis has been requeued.',
            });
        } catch (error: any) {
            notification.error({
                title: 'Error',
                message: error.message || 'Failed to retry analysis',
            });
        } finally {
            setRetrying(false);
        }
    };

    const getStageStatus = (stageIndex: number): 'finish' | 'process' | 'wait' | 'error' => {
        if (!analysis) return 'wait';
        if (analysis.status === 'failed') return stageIndex === 0 ? 'error' : 'wait';
        const progressThreshold = ((stageIndex + 1) / ANALYSIS_STAGES.length) * 100;
        if (analysis.progress >= progressThreshold) return 'finish';
        if (analysis.progress >= (stageIndex / ANALYSIS_STAGES.length) * 100) return 'process';
        return 'wait';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div style={{ padding: 24 }}>
                <Alert type="error" message="Analysis not found" showIcon />
                <Button
                    style={{ marginTop: 16 }}
                    onClick={() => navigate('/dashboard')}
                    icon={<ArrowLeftOutlined />}
                >
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/dashboard')}
                style={{ marginBottom: 16 }}
            >
                Back to Dashboard
            </Button>

            <Card>
                <Title level={3}>{analysis.fileName}</Title>

                {analysis.status === 'failed' && (
                    <Alert
                        type="error"
                        message="Analysis Failed"
                        description={analysis.errorMessage || 'An error occurred during analysis'}
                        showIcon
                        style={{ marginBottom: 16 }}
                        action={
                            <Button size="small" onClick={handleRetry} loading={retrying}>
                                Retry
                            </Button>
                        }
                    />
                )}

                <Descriptions column={2} style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="Status">
                        <Tag color={STATUS_COLORS[analysis.status]}>
                            {STATUS_LABELS[analysis.status]}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="File Size">
                        {formatFileSize(analysis.fileSize)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Submitted">
                        {new Date(analysis.submittedAt).toLocaleString()}
                    </Descriptions.Item>
                    {analysis.completedAt && (
                        <Descriptions.Item label="Completed">
                            {new Date(analysis.completedAt).toLocaleString()}
                        </Descriptions.Item>
                    )}
                    {analysis.currentStage && (
                        <Descriptions.Item label="Current Stage">
                            {analysis.currentStage}
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {analysis.status === 'processing' && (
                    <Progress
                        percent={analysis.progress}
                        status="active"
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Title level={5}>Progress</Title>
                <Timeline
                    items={ANALYSIS_STAGES.map((stage, i) => ({
                        color:
                            getStageStatus(i) === 'finish'
                                ? 'green'
                                : getStageStatus(i) === 'process'
                                    ? 'blue'
                                    : getStageStatus(i) === 'error'
                                        ? 'red'
                                        : 'gray',
                        children: stage,
                    }))}
                />

                {analysis.certificateId && (
                    <Space style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => navigate(`/certificates/${analysis.certificateId}`)}
                        >
                            Download Certificate
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={fetchAnalysis}>
                            Refresh
                        </Button>
                    </Space>
                )}
            </Card>
        </div>
    );
};
