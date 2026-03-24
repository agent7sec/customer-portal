import React, { useState } from 'react';
import { Button, Tooltip, Progress, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { certificateService } from '../../services/CertificateService';

interface DownloadButtonProps {
    certificateId: string;
    fileName: string;
    disabled?: boolean;
    size?: 'small' | 'middle' | 'large';
    type?: 'primary' | 'default' | 'link' | 'text';
}

/**
 * Certificate download button with loading state and retry mechanism
 */
export const DownloadButton: React.FC<DownloadButtonProps> = ({
    certificateId,
    fileName,
    disabled = false,
    size = 'middle',
    type = 'primary',
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setLoading(true);
        setError(null);

        try {
            await certificateService.downloadCertificate(certificateId, fileName);
            message.success('Certificate downloaded successfully');
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to download certificate';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <Tooltip title="Click to retry download">
                <Button
                    type="default"
                    size={size}
                    icon={<ReloadOutlined />}
                    onClick={handleDownload}
                    loading={loading}
                    danger
                >
                    Retry Download
                </Button>
            </Tooltip>
        );
    }

    return (
        <Tooltip title={disabled ? 'Download not available' : 'Download certificate'}>
            <Button
                type={type}
                size={size}
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                loading={loading}
                disabled={disabled}
            >
                {loading ? 'Downloading...' : 'Download'}
            </Button>
        </Tooltip>
    );
};
