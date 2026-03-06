# Phase 7: Certificate Download Specification

## Overview

Implement secure certificate download functionality with pre-signed URLs.

## Status: ⏳ NOT STARTED

---

## 7.1 TypeScript Interfaces

### src/types/certificate.types.ts

```typescript
export interface Certificate {
  id: string;
  analysisId: string;
  userId: string;
  fileName: string;
  generatedAt: Date;
  expiresAt?: Date;
  fileSize: number;
}
```

---

## 7.2 Certificate Service

### src/services/CertificateService.ts

```typescript
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import { Certificate } from '../types/certificate.types';

class CertificateService {
  private async getHeaders() {
    const token = await auth0Service.getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }

  async getCertificates(): Promise<Certificate[]> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${config.api.baseUrl}/certificates`, { headers });
    return response.data;
  }

  async getCertificate(id: string): Promise<Certificate> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${config.api.baseUrl}/certificates/${id}`, { headers });
    return response.data;
  }

  async getDownloadUrl(id: string): Promise<string> {
    const headers = await this.getHeaders();
    const response = await axios.get(
      `${config.api.baseUrl}/certificates/${id}/download`,
      { headers }
    );
    return response.data.url;
  }

  async downloadCertificate(id: string): Promise<void> {
    const url = await this.getDownloadUrl(id);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const certificateService = new CertificateService();
```

---

## 7.3 Certificate List Component

### src/components/certificate/CertificateList.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, notification } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { certificateService } from '../../services/CertificateService';
import { Certificate } from '../../types/certificate.types';

const { Title } = Typography;

export const CertificateList: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const data = await certificateService.getCertificates();
      setCertificates(data);
    } catch (error) {
      notification.error({ message: 'Failed to load certificates' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    setDownloading(id);
    try {
      await certificateService.downloadCertificate(id);
      notification.success({ message: 'Download started' });
    } catch (error) {
      notification.error({ message: 'Download failed. Please try again.' });
    } finally {
      setDownloading(null);
    }
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Generated',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Certificate) => (
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading === record.id}
            onClick={() => handleDownload(record.id)}
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Certificates</Title>
      <Table
        dataSource={certificates}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No certificates yet' }}
      />
    </div>
  );
};
```

---

## 7.4 Download Button Component

### src/components/certificate/DownloadButton.tsx

```typescript
import React, { useState } from 'react';
import { Button, notification } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { certificateService } from '../../services/CertificateService';

interface DownloadButtonProps {
  certificateId: string;
  fileName?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ certificateId, fileName }) => {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await certificateService.downloadCertificate(certificateId);
      setRetryCount(0);
    } catch (error) {
      if (retryCount < 3) {
        notification.warning({ 
          message: 'Download failed', 
          description: 'Retrying...' 
        });
        setRetryCount(prev => prev + 1);
        setTimeout(handleDownload, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        notification.error({ 
          message: 'Download failed', 
          description: 'Please try again later.' 
        });
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      loading={loading}
      onClick={handleDownload}
    >
      {fileName || 'Download Certificate'}
    </Button>
  );
};
```

---

## 7.5 Certificates Page

### src/routes/CertificatesPage.tsx

```typescript
import React from 'react';
import { CertificateList } from '../components/certificate/CertificateList';

export const CertificatesPage: React.FC = () => {
  return <CertificateList />;
};
```

---

## Verification

```bash
npm test -- src/components/certificate/
npm run type-check
```
