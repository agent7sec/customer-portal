import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, notification } from 'antd';
import { FileUploader } from '../components/upload/FileUploader';

const { Title } = Typography;

export const UploadPage: React.FC = () => {
    const navigate = useNavigate();

    const handleUploadComplete = (analysisId: string) => {
        notification.success({
            title: 'Success',
            message: 'Upload complete! Analysis has started.',
        });
        navigate(`/analyses/${analysisId}`);
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <Title level={2}>Upload Code</Title>
            <FileUploader onUploadComplete={handleUploadComplete} />
        </div>
    );
};
