# Phase 5: File Upload Specification

## Overview

Implement secure file upload to S3 using pre-signed URLs with SHA-256 hash generation, immediate file display, DynamoDB storage with tenant isolation, and progress tracking.

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
  status: 'pending' | 'hashing' | 'uploading' | 'saving' | 'completed' | 'failed';
  progress: number;
  error?: string;
  hash?: string; // SHA-256 hash calculated before upload
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: Date;
}

export interface AnalysisRecord {
  analysisId: string; // UUID primary key
  tenantId: string; // Organization/tenant identifier
  userId: string; // User who uploaded the file
  fileHash: string; // SHA-256 hash (GSI for lookups)
  fileName: string;
  fileSize: number;
  fileKey: string; // S3 object key
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface CreateAnalysisRequest {
  fileName: string;
  fileSize: number;
  fileHash: string;
  fileKey: string;
  tenantId: string;
}

export interface CreateAnalysisResponse {
  analysisId: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  status: 'UPLOADED';
  createdAt: string;
}

export const ALLOWED_FILE_TYPES = ['.zip', '.tar.gz', '.jar', '.war'];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

---

## 5.2 Hash Utility

### src/utils/fileHash.ts

```typescript
/**
 * Calculate SHA-256 hash of a file using Web Crypto API
 * @param file - File object to hash
 * @returns Promise resolving to hex-encoded SHA-256 hash
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

---

## 5.3 Upload Service

### src/services/UploadService.ts

```typescript
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import { 
  PresignedUrlResponse, 
  ALLOWED_FILE_TYPES, 
  MAX_FILE_SIZE,
  CreateAnalysisRequest,
  CreateAnalysisResponse 
} from '../types/upload.types';

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

  /**
   * Create analysis record in DynamoDB with tenant isolation
   * @param request - Analysis creation request with file metadata and hash
   * @returns Analysis record with UPLOADED status
   */
  async createAnalysisRecord(request: CreateAnalysisRequest): Promise<CreateAnalysisResponse> {
    const token = await auth0Service.getAccessToken();
    const response = await axios.post(
      `${config.api.baseUrl}/analyses`,
      request,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}

export const uploadService = new UploadService();
```

---

## 5.4 File Details Display Component

### src/components/upload/FileDetails.tsx

```typescript
import React from 'react';
import { Card, Descriptions, Tag, Typography, Space } from 'antd';
import { FileOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { AnalysisRecord } from '../../types/upload.types';

const { Text, Paragraph } = Typography;

interface FileDetailsProps {
  analysis: AnalysisRecord;
}

export const FileDetails: React.FC<FileDetailsProps> = ({ analysis }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Card 
      title={
        <Space>
          <FileOutlined />
          <span>File Details</span>
          <Tag color="green" icon={<CheckCircleOutlined />}>UPLOADED</Tag>
        </Space>
      }
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="File Name">
          <Text strong>{analysis.fileName}</Text>
        </Descriptions.Item>
        
        <Descriptions.Item label="File Size">
          {formatFileSize(analysis.fileSize)}
        </Descriptions.Item>
        
        <Descriptions.Item label="SHA-256 Hash">
          <Paragraph 
            copyable 
            style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}
          >
            {analysis.fileHash}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            This hash uniquely identifies your file and tracks it across all systems
          </Text>
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
};
```

---

## 5.5 File Uploader Component (Updated)

### src/components/upload/FileUploader.tsx

```typescript
import React, { useState } from 'react';
import { Upload, Button, Progress, Alert, Card, List, Typography, Space, Spin } from 'antd';
import { InboxOutlined, DeleteOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadService } from '../../services/UploadService';
import { UploadFile, AnalysisRecord } from '../../types/upload.types';
import { calculateFileHash } from '../../utils/fileHash';
import { FileDetails } from './FileDetails';
import { useAuth } from '../../hooks/useAuth';

const { Dragger } = Upload;
const { Text } = Typography;

interface FileUploaderProps {
  onUploadComplete: (analysis: AnalysisRecord) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [completedAnalysis, setCompletedAnalysis] = useState<AnalysisRecord | null>(null);
  const { user } = useAuth(); // Get tenantId from user context

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
    try {
      // Step 1: Calculate SHA-256 hash
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'hashing' } : f
      ));

      const hash = await calculateFileHash(rawFile);

      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, hash, status: 'uploading' } : f
      ));

      // Step 2: Get pre-signed URL and upload to S3
      const { uploadUrl, fileKey } = await uploadService.getPresignedUrl(file.name, file.type);

      await uploadService.uploadToS3(uploadUrl, rawFile, (progress) => {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, progress } : f
        ));
      });

      // Step 3: Create analysis record in DynamoDB
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'saving', progress: 100 } : f
      ));

      const analysisRecord = await uploadService.createAnalysisRecord({
        fileName: file.name,
        fileSize: file.size,
        fileHash: hash,
        fileKey: fileKey,
        tenantId: user.tenantId, // From Auth0 user metadata
      });

      // Step 4: Display file details immediately
      const fullAnalysis: AnalysisRecord = {
        analysisId: analysisRecord.analysisId,
        tenantId: user.tenantId,
        userId: user.userId,
        fileHash: analysisRecord.fileHash,
        fileName: analysisRecord.fileName,
        fileSize: analysisRecord.fileSize,
        fileKey: fileKey,
        status: 'UPLOADED',
        createdAt: analysisRecord.createdAt,
        updatedAt: analysisRecord.createdAt,
      };

      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
      ));

      setCompletedAnalysis(fullAnalysis);
      onUploadComplete(fullAnalysis);

    } catch (error: any) {
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'failed', error: error.message } : f
      ));
    }
  };

  const handleStartUpload = async () => {
    setUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      const rawFile = /* Get raw file from upload component */;
      await uploadFile(file, rawFile);
    }
    
    setUploading(false);
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'hashing': return 'Calculating hash...';
      case 'uploading': return 'Uploading to S3...';
      case 'saving': return 'Saving to database...';
      case 'completed': return 'Upload complete';
      case 'failed': return 'Upload failed';
      default: return 'Pending';
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Upload Code for Analysis">
        <Dragger
          multiple={false}
          beforeUpload={handleBeforeUpload}
          showUploadList={false}
          disabled={uploading || completedAnalysis !== null}
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
                  title={
                    <Space>
                      {file.name}
                      {(file.status === 'hashing' || file.status === 'saving') && (
                        <Spin indicator={<LoadingOutlined spin />} size="small" />
                      )}
                    </Space>
                  }
                  description={
                    <>
                      <Text type="secondary">{getStatusText(file.status)}</Text>
                      {file.status === 'uploading' && <Progress percent={file.progress} size="small" />}
                      {file.status === 'failed' && <Text type="danger">{file.error}</Text>}
                      {file.hash && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                            SHA-256: {file.hash.substring(0, 16)}...
                          </Text>
                        </div>
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
          disabled={!files.some(f => f.status === 'pending') || completedAnalysis !== null}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          Start Upload
        </Button>
      </Card>

      {completedAnalysis && <FileDetails analysis={completedAnalysis} />}
    </Space>
  );
};
```

---

## 5.6 Upload Page

### src/routes/UploadPage.tsx

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { FileUploader } from '../components/upload/FileUploader';
import { AnalysisRecord } from '../types/upload.types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadComplete = (analysis: AnalysisRecord) => {
    notification.success({ 
      message: 'Upload complete!', 
      description: `Analysis ${analysis.analysisId} has been created with status UPLOADED.`
    });
    
    // Navigate to analysis tracking page after 2 seconds
    setTimeout(() => {
      navigate(`/analyses/${analysis.analysisId}`);
    }, 2000);
  };

  return <FileUploader onUploadComplete={handleUploadComplete} />;
};
```

---

## 5.7 Backend API Contract

### POST /api/analyses

**Purpose**: Create a new analysis record in DynamoDB with tenant isolation

**Request Headers**:
```
Authorization: Bearer <auth0_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fileName": "myapp.zip",
  "fileSize": 5242880,
  "fileHash": "a3c5f8d9e2b1c4a7f6e8d9c2b5a4f7e6d8c9b2a5f4e7d6c8b9a2f5e4d7c6b8a9",
  "fileKey": "uploads/tenant-123/2024-03-18/uuid-here/myapp.zip",
  "tenantId": "tenant-123"
}
```

**Response** (201 Created):
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "fileHash": "a3c5f8d9e2b1c4a7f6e8d9c2b5a4f7e6d8c9b2a5f4e7d6c8b9a2f5e4d7c6b8a9",
  "fileName": "myapp.zip",
  "fileSize": 5242880,
  "status": "UPLOADED",
  "createdAt": "2024-03-18T10:30:00.000Z"
}
```

**DynamoDB Table Schema**:

**Table Name**: `Analyses`

**Primary Key**:
- Partition Key: `tenantId` (String) - Enables tenant isolation
- Sort Key: `analysisId` (String) - UUID for each analysis

**Global Secondary Index** (for hash lookups):
- Index Name: `FileHashIndex`
- Partition Key: `fileHash` (String)
- Sort Key: `createdAt` (String)

**Attributes**:
- `tenantId` (String) - Organization/tenant identifier
- `analysisId` (String) - UUID primary identifier
- `userId` (String) - User who uploaded the file
- `fileHash` (String) - SHA-256 hash
- `fileName` (String) - Original file name
- `fileSize` (Number) - File size in bytes
- `fileKey` (String) - S3 object key
- `status` (String) - UPLOADED | PROCESSING | COMPLETED | FAILED
- `createdAt` (String) - ISO timestamp
- `updatedAt` (String) - ISO timestamp

**Row-Level Security (Tenant Isolation)**:
- All queries MUST include `tenantId` in the partition key
- API Gateway validates `tenantId` from Auth0 token claims
- Users can only access analyses within their tenant
- Backend enforces tenant context from JWT claims

---

## 5.8 Auth0 User Metadata

Users must have `tenantId` in their Auth0 user metadata or app_metadata:

```json
{
  "user_id": "auth0|123456",
  "email": "user@example.com",
  "app_metadata": {
    "tenantId": "tenant-123",
    "organizationName": "Acme Corp"
  }
}
```

The frontend retrieves `tenantId` from the Auth0 user object and includes it in all API requests.

---

## Verification

```bash
# Unit tests
npm test -- src/utils/fileHash.test.ts
npm test -- src/services/UploadService.test.ts
npm test -- src/components/upload/FileUploader.test.tsx
npm test -- src/components/upload/FileDetails.test.tsx

# Type checking
npm run type-check

# Integration test
npm test -- src/test/integration/upload.integration.test.tsx
```

---

## Implementation Checklist

- [ ] Create `src/utils/fileHash.ts` with SHA-256 calculation
- [ ] Update `src/types/upload.types.ts` with new interfaces
- [ ] Update `src/services/UploadService.ts` with `createAnalysisRecord` method
- [ ] Create `src/components/upload/FileDetails.tsx` component
- [ ] Update `src/components/upload/FileUploader.tsx` with hash calculation and display
- [ ] Update `src/routes/UploadPage.tsx` to handle analysis records
- [ ] Add `tenantId` to Auth0 user context/hook
- [ ] Create backend API endpoint `POST /api/analyses`
- [ ] Create DynamoDB table with GSI for file hash lookups
- [ ] Implement tenant isolation in API Gateway/Lambda
- [ ] Write unit tests for hash utility
- [ ] Write component tests for FileDetails and FileUploader
- [ ] Write integration tests for complete upload flow
