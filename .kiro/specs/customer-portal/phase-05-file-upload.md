# Phase 5: File Upload Specification

## Overview

Implement secure file upload to S3 using pre-signed URLs with validation and progress tracking.

## Status: ⏳ NOT STARTED

---

## 5.1 TypeScript Interfaces

### src/types/upload.types.ts

```typescript
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: Date;
}

export const ALLOWED_FILE_TYPES = ['.zip', '.tar.gz', '.jar', '.war'];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

---

## 5.2 Upload Service

### src/services/UploadService.ts

```typescript
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import { PresignedUrlResponse, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types/upload.types';

class UploadService {
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
    }
    
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(ext)) {
      return { valid: false, error: `File type ${ext} not supported` };
    }
    
    return { valid: true };
  }

  async getPresignedUrl(fileName: string, fileType: string): Promise<PresignedUrlResponse> {
    const token = await auth0Service.getAccessToken();
    const response = await axios.post(
      `${config.api.baseUrl}/uploads/presigned-url`,
      { file_name: fileName, content_type: fileType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async uploadToS3(
    url: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    await axios.put(url, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  }

  async notifyUploadComplete(fileKey: string): Promise<{ analysisId: string }> {
    const token = await auth0Service.getAccessToken();
    const response = await axios.post(
      `${config.api.baseUrl}/uploads/complete`,
      { file_key: fileKey },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}

export const uploadService = new UploadService();
```

---

## 5.3 File Uploader Component

### src/components/upload/FileUploader.tsx

```typescript
import React, { useState } from 'react';
import { Upload, Button, Progress, Alert, Card, List, Typography } from 'antd';
import { InboxOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { uploadService } from '../../services/UploadService';
import { UploadFile } from '../../types/upload.types';

const { Dragger } = Upload;
const { Text } = Typography;

interface FileUploaderProps {
  onUploadComplete: (analysisId: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleBeforeUpload = (file: File) => {
    const validation = uploadService.validateFile(file);
    
    const uploadFile: UploadFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: validation.valid ? 'pending' : 'failed',
      progress: 0,
      error: validation.error,
    };
    
    setFiles(prev => [...prev, uploadFile]);
    return false; // Prevent auto upload
  };

  const uploadFile = async (file: UploadFile, rawFile: File) => {
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'uploading' } : f
    ));

    try {
      const { uploadUrl, fileKey } = await uploadService.getPresignedUrl(file.name, file.type);
      
      await uploadService.uploadToS3(uploadUrl, rawFile, (progress) => {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      });

      const { analysisId } = await uploadService.notifyUploadComplete(fileKey);
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
      ));
      
      onUploadComplete(analysisId);
    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'failed', error: error.message } : f
      ));
    }
  };

  return (
    <Card title="Upload Code for Analysis">
      <Dragger
        multiple={false}
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Drag files here or click to browse</p>
        <p className="ant-upload-hint">Supports .zip, .tar.gz, .jar (max 100MB)</p>
      </Dragger>

      {files.length > 0 && (
        <List
          style={{ marginTop: 16 }}
          dataSource={files}
          renderItem={(file) => (
            <List.Item
              actions={[
                file.status === 'failed' && (
                  <Button icon={<ReloadOutlined />} size="small">Retry</Button>
                ),
                <Button icon={<DeleteOutlined />} size="small" danger />,
              ]}
            >
              <List.Item.Meta
                title={file.name}
                description={
                  <>
                    {file.status === 'uploading' && <Progress percent={file.progress} size="small" />}
                    {file.status === 'failed' && <Text type="danger">{file.error}</Text>}
                    {file.status === 'completed' && <Text type="success">Upload complete</Text>}
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Button
        type="primary"
        onClick={() => {/* Start uploads */}}
        disabled={!files.some(f => f.status === 'pending')}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        Start Upload
      </Button>
    </Card>
  );
};
```

---

## 5.4 Upload Page

### src/routes/UploadPage.tsx

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { FileUploader } from '../components/upload/FileUploader';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadComplete = (analysisId: string) => {
    notification.success({ message: 'Upload complete! Analysis started.' });
    navigate(`/analyses/${analysisId}`);
  };

  return <FileUploader onUploadComplete={handleUploadComplete} />;
};
```

---

## Verification

```bash
npm test -- src/components/upload/
npm run type-check
```
