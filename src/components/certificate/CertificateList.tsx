import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, notification, Card, Empty } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { certificateService } from '../../services/CertificateService';
import type { Certificate } from '../../types/certificate.types';
import { formatFileSize } from '../../types/upload.types';

const { Title } = Typography;

export const CertificateList: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        setLoading(true);
        try {
            const data = await certificateService.getCertificates();
            setCertificates(data);
        } catch (error) {
            notification.error({
                title: 'Error',
                message: 'Failed to load certificates',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certificate: Certificate) => {
        setDownloading(certificate.id);
        try {
            await certificateService.downloadCertificate(certificate.id, certificate.fileName);
            notification.success({
                title: 'Download Started',
                message: 'Your certificate is being downloaded.',
            });
        } catch (error) {
            notification.error({
                title: 'Download Failed',
                message: 'Please try again later.',
            });
        } finally {
            setDownloading(null);
        }
    };

    const columns = [
        {
            title: 'File Name',
            dataIndex: 'fileName',
            key: 'fileName',
            ellipsis: true,
        },
        {
            title: 'Generated',
            dataIndex: 'generatedAt',
            key: 'generatedAt',
            width: 150,
            render: (date: Date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Size',
            dataIndex: 'fileSize',
            key: 'fileSize',
            width: 100,
            render: (size: number) => formatFileSize(size),
        },
        {
            title: 'Downloads',
            dataIndex: 'downloadCount',
            key: 'downloadCount',
            width: 100,
            render: (count: number | undefined) => count ?? 0,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: Certificate) => (
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    loading={downloading === record.id}
                    onClick={() => handleDownload(record)}
                >
                    Download
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Certificates
                </Title>
                <Button icon={<ReloadOutlined />} onClick={loadCertificates} loading={loading}>
                    Refresh
                </Button>
            </div>

            {certificates.length === 0 && !loading ? (
                <Card>
                    <Empty
                        description="No certificates yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            ) : (
                <Table
                    dataSource={certificates}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};
