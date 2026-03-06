import React, { useState, useRef } from 'react';
import { Upload, Button, Progress, Card, List, Typography, Space, notification } from 'antd';
import {
    InboxOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { uploadService } from '../../services/UploadService';
import type { UploadFile as UploadFileType } from '../../types/upload.types';
import { formatFileSize, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../types/upload.types';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

interface FileUploaderProps {
    onUploadComplete: (analysisId: string) => void;
    maxFiles?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
    onUploadComplete,
    maxFiles = 1,
}) => {
    const [files, setFiles] = useState<UploadFileType[]>([]);
    const [uploading, setUploading] = useState(false);
    const rawFilesRef = useRef<Map<string, File>>(new Map());

    const handleBeforeUpload = (file: File) => {
        if (files.length >= maxFiles) {
            notification.warning({
                title: 'Limit Reached',
                message: `You can only upload ${maxFiles} file(s) at a time`,
            });
            return false;
        }

        const validation = uploadService.validateFile(file);

        const uploadFile: UploadFileType = {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            status: validation.valid ? 'pending' : 'failed',
            progress: 0,
            error: validation.error,
        };

        if (validation.valid) {
            rawFilesRef.current.set(uploadFile.id, file);
        }

        setFiles((prev) => [...prev, uploadFile]);
        return false; // Prevent auto upload
    };

    const updateFile = (id: string, updates: Partial<UploadFileType>) => {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        rawFilesRef.current.delete(id);
    };

    const uploadSingleFile = async (file: UploadFileType) => {
        const rawFile = rawFilesRef.current.get(file.id);
        if (!rawFile) return;

        updateFile(file.id, { status: 'uploading', progress: 0 });

        try {
            // Get pre-signed URL
            const { uploadUrl, fileKey } = await uploadService.getPresignedUrl(
                file.name,
                file.type
            );

            updateFile(file.id, { fileKey });

            // Upload to S3 with progress
            await uploadService.uploadToS3(uploadUrl, rawFile, (progress) => {
                updateFile(file.id, { progress });
            });

            // Notify backend
            const { analysisId } = await uploadService.notifyUploadComplete(fileKey);

            updateFile(file.id, {
                status: 'completed',
                progress: 100,
                analysisId,
            });

            rawFilesRef.current.delete(file.id);
            onUploadComplete(analysisId);
        } catch (error: any) {
            updateFile(file.id, {
                status: 'failed',
                error: error.message || 'Upload failed',
            });
        }
    };

    const handleStartUpload = async () => {
        const pendingFiles = files.filter((f) => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setUploading(true);

        for (const file of pendingFiles) {
            await uploadSingleFile(file);
        }

        setUploading(false);
    };

    const handleRetry = async (file: UploadFileType) => {
        const rawFile = rawFilesRef.current.get(file.id);
        if (!rawFile) {
            notification.error({
                title: 'Error',
                message: 'Original file not found. Please add the file again.',
            });
            return;
        }

        setUploading(true);
        await uploadSingleFile(file);
        setUploading(false);
    };

    const getStatusIcon = (status: UploadFileType['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'failed':
                return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
            case 'uploading':
                return <LoadingOutlined style={{ color: '#1890ff' }} />;
            default:
                return null;
        }
    };

    const hasPendingFiles = files.some((f) => f.status === 'pending');

    return (
        <Card title="Upload Code for Analysis">
            <Dragger
                multiple={maxFiles > 1}
                beforeUpload={handleBeforeUpload}
                showUploadList={false}
                disabled={uploading || files.length >= maxFiles}
                accept={ALLOWED_FILE_TYPES.join(',')}
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Drag files here or click to browse</p>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Supports {ALLOWED_FILE_TYPES.join(', ')} (max {MAX_FILE_SIZE / 1024 / 1024}MB)
                </Paragraph>
            </Dragger>

            {files.length > 0 && (
                <List
                    style={{ marginTop: 16 }}
                    dataSource={files}
                    renderItem={(file) => (
                        <List.Item
                            actions={[
                                file.status === 'failed' && (
                                    <Button
                                        key="retry"
                                        icon={<ReloadOutlined />}
                                        size="small"
                                        onClick={() => handleRetry(file)}
                                        disabled={uploading}
                                    >
                                        Retry
                                    </Button>
                                ),
                                <Button
                                    key="delete"
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    danger
                                    onClick={() => removeFile(file.id)}
                                    disabled={file.status === 'uploading'}
                                />,
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
                                    <>
                                        {file.status === 'uploading' && (
                                            <Progress
                                                percent={file.progress}
                                                size="small"
                                                status="active"
                                            />
                                        )}
                                        {file.status === 'failed' && (
                                            <Text type="danger">{file.error}</Text>
                                        )}
                                        {file.status === 'completed' && (
                                            <Text type="success">Upload complete</Text>
                                        )}
                                        {file.status === 'pending' && (
                                            <Text type="secondary">Ready to upload</Text>
                                        )}
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}

            <Button
                type="primary"
                onClick={handleStartUpload}
                disabled={!hasPendingFiles}
                loading={uploading}
                style={{ marginTop: 16 }}
                block
            >
                {uploading ? 'Uploading...' : 'Start Upload'}
            </Button>
        </Card>
    );
};
