import React, { useState } from 'react';
import { Upload, Progress, Alert, List, Button, Typography, Space, Card, theme, notification } from 'antd';
import { InboxOutlined, DeleteOutlined, FileOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadService } from '../../services/UploadService';
import type { UploadFile } from '../../types/upload.types';
import { formatFileSize, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../types/upload.types';

const { Dragger } = Upload;
const { Text, Title } = Typography;
const { useToken } = theme;

interface FileUploaderProps {
    onUploadComplete?: (analysisId: string) => void;
    onUploadError?: (error: string) => void;
}

interface UploadFileWithNative extends UploadFile {
    nativeFile?: File;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, onUploadError }) => {
    const { token } = useToken();
    const [uploadFiles, setUploadFiles] = useState<UploadFileWithNative[]>([]);
    const [uploading, setUploading] = useState(false);

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
        
        return false; // Prevent default upload behavior
    };

    const handleUpload = async (file: File, fileId: string) => {
        setUploading(true);
        
        try {
            // Update status to uploading
            updateFileStatus(fileId, { status: 'uploading', progress: 0 });

            // Get pre-signed URL
            const presignedData = await uploadService.getPresignedUrl(
                file.name,
                file.type || 'application/octet-stream'
            );

            // Store analysis ID and file key
            updateFileStatus(fileId, { 
                analysisId: presignedData.analysisId,
                fileKey: presignedData.fileKey 
            });

            // Upload to S3 with progress tracking and automatic retry
            await uploadService.uploadToS3(
                presignedData.uploadUrl,
                file,
                (percent) => {
                    updateFileStatus(fileId, { progress: percent });
                }
            );

            // Notify backend of completion
            await uploadService.notifyUploadComplete(
                presignedData.analysisId,
                presignedData.fileKey
            );

            // Update status to completed
            updateFileStatus(fileId, { status: 'completed', progress: 100 });
            
            notification.success({
                message: 'Upload Successful',
                description: `${file.name} has been uploaded successfully`,
                placement: 'topRight',
            });
            
            onUploadComplete?.(presignedData.analysisId);

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
            updateFileStatus(fileId, { 
                status: 'failed', 
                error: errorMessage 
            });
            
            notification.error({
                message: 'Upload Failed',
                description: errorMessage,
                placement: 'topRight',
                duration: 0, // Don't auto-close error notifications
            });
            
            onUploadError?.(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleRetry = (fileId: string) => {
        const file = uploadFiles.find(f => f.id === fileId);
        if (file?.nativeFile) {
            updateFileStatus(fileId, { status: 'pending', error: undefined, progress: 0 });
            handleUpload(file.nativeFile, fileId);
        }
    };

    const updateFileStatus = (fileId: string, updates: Partial<UploadFileWithNative>) => {
        setUploadFiles(prev =>
            prev.map(file =>
                file.id === fileId ? { ...file, ...updates } : file
            )
        );
    };

    const handleRemove = async (fileId: string) => {
        const file = uploadFiles.find(f => f.id === fileId);
        
        if (file?.fileKey && file.status !== 'completed') {
            try {
                await uploadService.cancelUpload(file.fileKey);
            } catch (error) {
                console.error('Failed to cancel upload:', error);
            }
        }

        setUploadFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const getStatusIcon = (status: UploadFile['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircleOutlined style={{ color: token.colorSuccess }} />;
            case 'failed':
                return <CloseCircleOutlined style={{ color: token.colorError }} />;
            case 'uploading':
                return <FileOutlined style={{ color: token.colorPrimary }} />;
            default:
                return <FileOutlined />;
        }
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        beforeUpload,
        showUploadList: false,
        disabled: uploading,
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Title level={4}>Upload Code for Analysis</Title>
                        <Text type="secondary">
                            Upload your code archive for security analysis and certification
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
                        <p className="ant-upload-text">
                            Click or drag file to this area to upload
                        </p>
                        <p className="ant-upload-hint">
                            Support for single file upload. Strictly prohibited from uploading company data or other banned files.
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
                                    file.status !== 'uploading' && (
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
                                            {file.status === 'uploading' && (
                                                <Progress 
                                                    percent={file.progress} 
                                                    status="active"
                                                    size="small"
                                                />
                                            )}
                                            {file.status === 'completed' && (
                                                <Text type="success">Upload completed successfully</Text>
                                            )}
                                            {file.status === 'failed' && (
                                                <Alert
                                                    message={file.error || 'Upload failed'}
                                                    type="error"
                                                    showIcon
                                                    style={{ marginTop: 8 }}
                                                />
                                            )}
                                            {file.status === 'pending' && (
                                                <Text type="secondary">Waiting to upload...</Text>
                                            )}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}
        </Space>
    );
};
