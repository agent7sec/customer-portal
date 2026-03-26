import React, { useState } from 'react';
import {
    Upload, Progress, Alert, List, Button, Typography,
    Space, Card, Tag, Descriptions, Tooltip, theme, notification,
} from 'antd';
import {
    InboxOutlined, DeleteOutlined, FileOutlined,
    CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
    LoadingOutlined, CopyOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadService } from '../../services/UploadService';
import type { UploadFile, AnalysisRecord } from '../../types/upload.types';
import { formatFileSize, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../types/upload.types';
import { calculateFileHash, truncateHash } from '../../utils/fileHash';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;
const { useToken } = theme;

interface FileUploaderProps {
    onUploadComplete?: (analysis: AnalysisRecord) => void;
    onUploadError?: (error: string) => void;
    /** Auth0 tenantId from user context – required for DynamoDB tenant isolation */
    tenantId?: string;
    userId?: string;
}

interface UploadFileWithNative extends UploadFile {
    nativeFile?: File;
}

// ── File Details card shown after a successful upload ────────────────────────

const FileDetailsCard: React.FC<{ analysis: AnalysisRecord }> = ({ analysis }) => (
    <Card
        title={
            <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>File Details</span>
                <Tag color="green">UPLOADED</Tag>
            </Space>
        }
    >
        <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="File Name">
                <Text strong>{analysis.fileName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="File Size">
                {formatFileSize(analysis.fileSize)}
            </Descriptions.Item>
            <Descriptions.Item label="SHA-256 Hash">
                <Tooltip title="This hash uniquely identifies your file across all systems">
                    <Paragraph
                        copyable={{ icon: <CopyOutlined />, tooltips: ['Copy hash', 'Copied!'] }}
                        style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}
                    >
                        {analysis.fileHash}
                    </Paragraph>
                </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Analysis ID">
                <Text code>{analysis.analysisId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
                <Tag color="blue">{analysis.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Uploaded At">
                {new Date(analysis.createdAt).toLocaleString()}
            </Descriptions.Item>
        </Descriptions>
    </Card>
);

// ── Main FileUploader ────────────────────────────────────────────────────────

export const FileUploader: React.FC<FileUploaderProps> = ({
    onUploadComplete,
    onUploadError,
    tenantId,
    userId,
}) => {
    const { token } = useToken();
    const [uploadFiles, setUploadFiles] = useState<UploadFileWithNative[]>([]);
    const [uploading, setUploading] = useState(false);
    const [completedAnalysis, setCompletedAnalysis] = useState<AnalysisRecord | null>(null);

    const updateFileStatus = (fileId: string, updates: Partial<UploadFileWithNative>) => {
        setUploadFiles(prev =>
            prev.map(file => file.id === fileId ? { ...file, ...updates } : file)
        );
    };

    const handleUpload = async (file: File, fileId: string) => {
        setUploading(true);

        try {
            // Step 1 — Calculate SHA-256 hash (Phase 5 spec requirement)
            updateFileStatus(fileId, { status: 'hashing', progress: 0 });
            const hash = await calculateFileHash(file);
            updateFileStatus(fileId, { hash, status: 'uploading', progress: 0 });

            // Step 2 — Get pre-signed S3 URL
            const presignedData = await uploadService.getPresignedUrl(
                file.name,
                file.type || 'application/octet-stream'
            );
            updateFileStatus(fileId, { fileKey: presignedData.fileKey });

            // Step 3 — Upload directly to S3 with progress tracking
            await uploadService.uploadToS3(
                presignedData.uploadUrl,
                file,
                (percent) => updateFileStatus(fileId, { progress: percent })
            );

            // Step 4 — Create DynamoDB analysis record via POST /analyses
            updateFileStatus(fileId, { status: 'saving', progress: 100 });

            const effectiveTenantId = tenantId || 'default';
            const record = await uploadService.createAnalysisRecord({
                fileName: file.name,
                fileSize: file.size,
                fileHash: hash,
                fileKey: presignedData.fileKey,
                tenantId: effectiveTenantId,
            });

            // Build the full analysis record for display and callback
            const analysis: AnalysisRecord = {
                analysisId: record.analysisId,
                tenantId: effectiveTenantId,
                userId: userId || '',
                fileHash: hash,
                fileName: record.fileName,
                fileSize: record.fileSize,
                fileKey: presignedData.fileKey,
                status: 'UPLOADED',
                createdAt: record.createdAt,
                updatedAt: record.createdAt,
            };

            updateFileStatus(fileId, { status: 'completed', progress: 100, analysisId: record.analysisId });
            setCompletedAnalysis(analysis);

            notification.success({
                message: 'Upload Successful',
                description: `${file.name} uploaded — analysis ${record.analysisId} created.`,
                placement: 'topRight',
            });

            onUploadComplete?.(analysis);

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
            updateFileStatus(fileId, { status: 'failed', error: errorMessage });
            notification.error({
                message: 'Upload Failed',
                description: errorMessage,
                placement: 'topRight',
                duration: 0,
            });
            onUploadError?.(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const validation = uploadService.validateFile(file);

        if (!validation.valid) {
            notification.error({
                message: 'File Validation Failed',
                description: validation.error,
                placement: 'topRight',
            });
            onUploadError?.(validation.error || 'File validation failed');
            return Upload.LIST_IGNORE;
        }

        const uploadFile: UploadFileWithNative = {
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0,
            nativeFile: file,
        };

        setUploadFiles(prev => [...prev, uploadFile]);
        handleUpload(file, uploadFile.id);
        return false;
    };

    const handleRetry = (fileId: string) => {
        const file = uploadFiles.find(f => f.id === fileId);
        if (file?.nativeFile) {
            updateFileStatus(fileId, { status: 'pending', error: undefined, progress: 0, hash: undefined });
            handleUpload(file.nativeFile, fileId);
        }
    };

    const handleRemove = async (fileId: string) => {
        const file = uploadFiles.find(f => f.id === fileId);
        if (file?.fileKey && file.status !== 'completed') {
            try { await uploadService.cancelUpload(file.fileKey); } catch { /* ignore */ }
        }
        setUploadFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const getStatusLabel = (status: UploadFile['status']) => {
        switch (status) {
            case 'hashing': return 'Calculating SHA-256 hash…';
            case 'uploading': return 'Uploading to S3…';
            case 'saving': return 'Creating analysis record…';
            case 'completed': return 'Upload complete';
            case 'failed': return 'Upload failed';
            default: return 'Pending';
        }
    };

    const getStatusIcon = (status: UploadFile['status']) => {
        if (status === 'completed') return <CheckCircleOutlined style={{ color: token.colorSuccess }} />;
        if (status === 'failed') return <CloseCircleOutlined style={{ color: token.colorError }} />;
        if (['hashing', 'uploading', 'saving'].includes(status))
            return <LoadingOutlined style={{ color: token.colorPrimary }} />;
        return <FileOutlined />;
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        beforeUpload,
        showUploadList: false,
        disabled: uploading || completedAnalysis !== null,
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Title level={4}>Upload Code for Analysis</Title>
                        <Text type="secondary">
                            Upload your code archive for security analysis and certification.
                            A SHA-256 hash will be calculated to uniquely identify your file.
                        </Text>
                    </div>

                    <Alert
                        message="Supported File Types"
                        description={
                            <div>
                                <Text>Allowed formats: {ALLOWED_FILE_TYPES.join(', ')}</Text>
                                <br />
                                <Text>Maximum file size: {formatFileSize(MAX_FILE_SIZE)}</Text>
                            </div>
                        }
                        type="info"
                        showIcon
                    />

                    <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: token.colorPrimary }} />
                        </p>
                        <p className="ant-upload-text">Click or drag file to upload</p>
                        <p className="ant-upload-hint">
                            Single file upload. A SHA-256 hash is computed locally before transfer.
                        </p>
                    </Dragger>
                </Space>
            </Card>

            {uploadFiles.length > 0 && (
                <Card title="Upload Queue">
                    <List
                        dataSource={uploadFiles}
                        renderItem={(file) => (
                            <List.Item
                                key={file.id}
                                actions={[
                                    file.status === 'failed' && (
                                        <Button
                                            type="primary"
                                            icon={<ReloadOutlined />}
                                            onClick={() => handleRetry(file.id)}
                                        >
                                            Retry
                                        </Button>
                                    ),
                                    file.status !== 'uploading' && file.status !== 'hashing' && file.status !== 'saving' && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemove(file.id)}
                                        >
                                            Remove
                                        </Button>
                                    ),
                                ].filter(Boolean)}
                            >
                                <List.Item.Meta
                                    avatar={getStatusIcon(file.status)}
                                    title={
                                        <Space>
                                            <Text>{file.name}</Text>
                                            <Text type="secondary">({formatFileSize(file.size)})</Text>
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Text type="secondary">{getStatusLabel(file.status)}</Text>

                                            {file.status === 'uploading' && (
                                                <Progress percent={file.progress} status="active" size="small" />
                                            )}
                                            {file.hash && (
                                                <Text type="secondary" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                                    SHA-256: {truncateHash(file.hash)}
                                                </Text>
                                            )}
                                            {file.status === 'failed' && (
                                                <Alert
                                                    message={file.error || 'Upload failed'}
                                                    type="error"
                                                    showIcon
                                                    style={{ marginTop: 8 }}
                                                />
                                            )}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {completedAnalysis && <FileDetailsCard analysis={completedAnalysis} />}
        </Space>
    );
};
