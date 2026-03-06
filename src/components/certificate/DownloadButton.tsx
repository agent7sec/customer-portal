import React, { useState } from 'react';
import { Button, notification } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { certificateService } from '../../services/CertificateService';

interface DownloadButtonProps {
    certificateId: string;
    fileName?: string;
    label?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
    certificateId,
    fileName,
    label,
}) => {
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const handleDownload = async () => {
        setLoading(true);
        try {
            await certificateService.downloadCertificate(certificateId, fileName);
            setRetryCount(0);
            notification.success({
                title: 'Download Started',
                message: 'Your certificate is being downloaded.',
            });
        } catch (error) {
            if (retryCount < 3) {
                notification.warning({
                    title: 'Download Failed',
                    message: 'Retrying...',
                });
                setRetryCount((prev) => prev + 1);
                setTimeout(handleDownload, 1000 * (retryCount + 1)); // Exponential backoff
            } else {
                notification.error({
                    title: 'Download Failed',
                    message: 'Please try again later.',
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
            {label || 'Download Certificate'}
        </Button>
    );
};
