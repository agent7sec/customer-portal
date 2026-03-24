import React, { lazy, Suspense } from "react";
import { Typography, Spin } from "antd";

const { Title } = Typography;

// Lazy load FileUploader component (heavy component with upload logic)
const FileUploader = lazy(() =>
  import("../components/upload/FileUploader").then((m) => ({
    default: m.FileUploader,
  }))
);

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      padding: "50px",
    }}
  >
    <Spin size="large" />
  </div>
);

export const UploadPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Upload Code for Analysis</Title>
      <Suspense fallback={<LoadingFallback />}>
        <FileUploader />
      </Suspense>
    </div>
  );
};
