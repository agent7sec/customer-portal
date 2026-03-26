import React, { Suspense } from "react";
import { Typography, Spin } from "antd";
import { useGetIdentity } from "@refinedev/core";
import { FileUploader } from "../components/upload/FileUploader";
import type { AnalysisRecord } from "../types/upload.types";

const { Title } = Typography;

const LoadingFallback = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
    <Spin size="large" />
  </div>
);

export const UploadPage: React.FC = () => {
  // Get tenantId and userId from Auth0 identity (via Refine useGetIdentity)
  const { data: identity } = useGetIdentity<{
    id: string;
    tenantId?: string;
  }>();

  const handleUploadComplete = (analysis: AnalysisRecord) => {
    // Navigation handled inside FileUploader via notification feedback
    // Parent page can listen for this to refresh dashboard, etc.
    console.info(`Analysis created: ${analysis.analysisId} (hash: ${analysis.fileHash.slice(0, 16)}…)`);
  };

  return (
    <div>
      <Title level={2}>Upload Code for Analysis</Title>
      <Suspense fallback={<LoadingFallback />}>
        <FileUploader
          tenantId={identity?.tenantId}
          userId={identity?.id}
          onUploadComplete={handleUploadComplete}
        />
      </Suspense>
    </div>
  );
};
