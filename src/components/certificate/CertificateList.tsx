import React from 'react';
import { Table, Tag, Descriptions, Space, Typography, Tooltip } from 'antd';
import { FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTable } from '@refinedev/antd';
import type { Certificate } from '../../types/certificate.types';
import { DownloadButton } from './DownloadButton';

const { Text } = Typography;

/**
 * Certificate list component with Refine integration
 * Displays certificates in a table with download functionality
 */
export const CertificateList: React.FC = () => {
    const { tableProps } = useTable<Certificate>({
        resource: 'certificates',
        pagination: {
            pageSize: 10,
        },
        sorters: {
            initial: [
                {
                    field: 'generatedAt',
                    order: 'desc',
                },
            ],
        },
    });

    const columns = [
        {
            title: 'Certificate',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (fileName: string) => (
                <Space>
                    <FileTextOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                    <Text strong>{fileName}</Text>
                </Space>
            ),
        },
        {
            title: 'Analysis ID',
            dataIndex: 'analysisId',
            key: 'analysisId',
            render: (analysisId: string) => (
                <Tooltip title="Click to view analysis details">
                    <Text copyable={{ text: analysisId }} code>
                        {analysisId.substring(0, 8)}...
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: 'Generated',
            dataIndex: 'generatedAt',
            key: 'generatedAt',
            render: (date: Date) => {
                const generatedDate = new Date(date);
                return (
                    <Space>
                        <ClockCircleOutlined />
                        <Text>{generatedDate.toLocaleDateString()}</Text>
                        <Text type="secondary">{generatedDate.toLocaleTimeString()}</Text>
                    </Space>
                );
            },
            sorter: true,
        },
        {
            title: 'File Size',
            dataIndex: 'fileSize',
            key: 'fileSize',
            render: (size: number) => {
                const sizeInKB = (size / 1024).toFixed(2);
                const sizeInMB = (size / (1024 * 1024)).toFixed(2);
                return (
                    <Text>
                        {size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`}
                    </Text>
                );
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: Certificate) => {
                const now = new Date();
                const expiresAt = record.expiresAt ? new Date(record.expiresAt) : null;
                const isExpired = expiresAt && expiresAt < now;

                return (
                    <Tag color={isExpired ? 'red' : 'green'}>
                        {isExpired ? 'Expired' : 'Valid'}
                    </Tag>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (record: Certificate) => {
                const now = new Date();
                const expiresAt = record.expiresAt ? new Date(record.expiresAt) : null;
                const isExpired = expiresAt && expiresAt < now;

                return (
                    <DownloadButton
                        certificateId={record.id}
                        fileName={record.fileName}
                        disabled={isExpired}
                        size="small"
                    />
                );
            },
        },
    ];

    return (
        <Table<Certificate>
            {...tableProps}
            columns={columns}
            rowKey="id"
            expandable={{
                expandedRowRender: (record) => (
                    <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="Certificate ID">
                            <Text copyable>{record.id}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Analysis ID">
                            <Text copyable>{record.analysisId}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="User ID">
                            <Text copyable>{record.userId}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Generated At">
                            {new Date(record.generatedAt).toLocaleString()}
                        </Descriptions.Item>
                        {record.expiresAt && (
                            <Descriptions.Item label="Expires At">
                                {new Date(record.expiresAt).toLocaleString()}
                            </Descriptions.Item>
                        )}
                        {record.downloadCount !== undefined && (
                            <Descriptions.Item label="Download Count">
                                {record.downloadCount}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                ),
            }}
        />
    );
};
