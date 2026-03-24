import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { DownloadButton } from './DownloadButton';
import { certificateService } from '../../services/CertificateService';

vi.mock('../../services/CertificateService', () => ({
    certificateService: {
        downloadCertificate: vi.fn(),
    },
}));

vi.mock('antd', async () => {
    const actual = await vi.importActual('antd');
    return {
        ...actual,
        message: {
            success: vi.fn(),
            error: vi.fn(),
        },
    };
});

describe('DownloadButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render download button with default props', () => {
        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
    });

    it('should render disabled button when disabled prop is true', () => {
        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
                disabled={true}
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        expect(button).toBeDisabled();
    });

    it('should call downloadCertificate on button click', async () => {
        vi.mocked(certificateService.downloadCertificate).mockResolvedValue();

        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(certificateService.downloadCertificate).toHaveBeenCalledWith(
                'cert-1',
                'certificate.pdf'
            );
        });
    });

    it('should show loading state during download', async () => {
        vi.mocked(certificateService.downloadCertificate).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/downloading/i)).toBeInTheDocument();
        });
    });

    it('should show success message on successful download', async () => {
        vi.mocked(certificateService.downloadCertificate).mockResolvedValue();

        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(message.success).toHaveBeenCalledWith('Certificate downloaded successfully');
        });
    });

    it('should show error message on download failure', async () => {
        const errorMessage = 'Download failed';
        vi.mocked(certificateService.downloadCertificate).mockRejectedValue(
            new Error(errorMessage)
        );

        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(message.error).toHaveBeenCalledWith(errorMessage);
        });
    });

    it('should show retry button after download failure', async () => {
        vi.mocked(certificateService.downloadCertificate).mockRejectedValue(
            new Error('Download failed')
        );

        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /retry download/i })).toBeInTheDocument();
        });
    });

    it('should retry download when retry button is clicked', async () => {
        vi.mocked(certificateService.downloadCertificate)
            .mockRejectedValueOnce(new Error('Download failed'))
            .mockResolvedValueOnce();

        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
            />
        );

        // First attempt - fails
        const button = screen.getByRole('button', { name: /download/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /retry download/i })).toBeInTheDocument();
        });

        // Retry - succeeds
        const retryButton = screen.getByRole('button', { name: /retry download/i });
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(certificateService.downloadCertificate).toHaveBeenCalledTimes(2);
            expect(message.success).toHaveBeenCalledWith('Certificate downloaded successfully');
        });
    });

    it('should render with custom size', () => {
        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
                size="large"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        expect(button).toHaveClass('ant-btn-lg');
    });

    it('should render with custom type', () => {
        render(
            <DownloadButton
                certificateId="cert-1"
                fileName="certificate.pdf"
                type="default"
            />
        );

        const button = screen.getByRole('button', { name: /download/i });
        expect(button).not.toHaveClass('ant-btn-primary');
    });
});
