export interface Certificate {
    id: string;
    analysisId: string;
    userId: string;
    fileName: string;
    generatedAt: Date;
    expiresAt?: Date;
    fileSize: number;
    downloadCount?: number;
}

export interface CertificateDownloadResponse {
    url: string;
    expiresAt: Date;
}
