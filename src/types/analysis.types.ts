export interface Analysis {
    id: string;
    userId: string;
    fileName: string;
    fileSize: number;
    status: AnalysisStatus;
    progress: number;
    currentStage?: string;
    submittedAt: Date;
    completedAt?: Date;
    errorMessage?: string;
    certificateId?: string;
}

export type AnalysisStatus =
    | 'uploading'
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed';

export const STATUS_LABELS: Record<AnalysisStatus, string> = {
    uploading: 'Uploading',
    queued: 'In Queue',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
};

export const STATUS_COLORS: Record<AnalysisStatus, string> = {
    uploading: 'blue',
    queued: 'gold',
    processing: 'processing',
    completed: 'green',
    failed: 'red',
};

export const ANALYSIS_STAGES = [
    'Uploaded',
    'Queued',
    'Scanning',
    'Analyzing',
    'Generating Report',
    'Complete',
];
