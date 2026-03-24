import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CertificateList } from './CertificateList';
import type { Certificate } from '../../types/certificate.types';

// Mock Refine hooks
vi.mock('@refinedev/antd', () => ({
    useTable: vi.fn(),
}));

vi.mock('./DownloadButton', () => ({
    DownloadButton: ({ certificateId, fileName, disabled }: any) => (
        <button disabled={disabled}>
            Download {fileName} ({certificateId})
        </button>
    ),
}));

import { useTable } from '@refinedev/antd';

describe('CertificateList', () => {
    const mockCertificates: Certificate[] = [
        {
            id: 'cert-1',
            analysisId: 'analysis-1',
            userId: 'user-1',
            fileName: 'certificate1.pdf',
            generatedAt: new Date('2024-01-01T10:00:00Z'),
            fileSize: 1024 * 100, // 100 KB
        },
        {
            id: 'cert-2',
            analysisId: 'analysis-2',
            userId: 'user-1',
            fileName: 'certificate2.pdf',
            generatedAt: new Date('2024-01-02T10:00:00Z'),
            fileSize: 1024 * 1024 * 2, // 2 MB
            expiresAt: new Date('2099-12-31T23:59:59Z'), // Far future
        },
        {
            id: 'cert-3',
            analysisId: 'analysis-3',
            userId: 'user-1',
            fileName: 'certificate3.pdf',
            generatedAt: new Date('2024-01-03T10:00:00Z'),
            fileSize: 1024 * 500, // 500 KB
            expiresAt: new Date('2020-01-01T10:00:00Z'), // Expired
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render certificate list with data', async () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: mockCertificates,
                loading: false,
                pagination: {
                    current: 1,
                    pageSize: 10,
                    total: mockCertificates.length,
                },
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        await waitFor(() => {
            expect(screen.getByText('certificate1.pdf')).toBeInTheDocument();
            expect(screen.getByText('certificate2.pdf')).toBeInTheDocument();
            expect(screen.getByText('certificate3.pdf')).toBeInTheDocument();
        });
    });

    it('should display file sizes correctly', async () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: mockCertificates,
                loading: false,
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        await waitFor(() => {
            // Check that file sizes are displayed (KB and MB units)
            const text = screen.getByRole('table').textContent || '';
            expect(text).toMatch(/KB|MB/);
        });
    });

    it('should display valid status for non-expired certificates', async () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: [mockCertificates[1]], // Non-expired certificate
                loading: false,
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        await waitFor(() => {
            expect(screen.getByText('Valid')).toBeInTheDocument();
        });
    });

    it('should display expired status for expired certificates', async () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: [mockCertificates[2]], // Expired certificate
                loading: false,
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        await waitFor(() => {
            expect(screen.getByText('Expired')).toBeInTheDocument();
        });
    });

    it('should render download buttons for all certificates', async () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: mockCertificates,
                loading: false,
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        await waitFor(() => {
            expect(screen.getByText(/Download certificate1.pdf \(cert-1\)/)).toBeInTheDocument();
            expect(screen.getByText(/Download certificate2.pdf \(cert-2\)/)).toBeInTheDocument();
            expect(screen.getByText(/Download certificate3.pdf \(cert-3\)/)).toBeInTheDocument();
        });
    });

    it('should disable download button for expired certificates', async () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: [mockCertificates[2]], // Expired certificate
                loading: false,
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        await waitFor(() => {
            const button = screen.getByText(/Download certificate3.pdf/);
            expect(button).toBeDisabled();
        });
    });

    it('should show loading state', () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: [],
                loading: true,
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should configure useTable with correct parameters', () => {
        vi.mocked(useTable).mockReturnValue({
            tableProps: {
                dataSource: [],
                loading: false,
            },
            tableQueryResult: {} as any,
            searchFormProps: {} as any,
            filters: [],
            sorters: [],
            current: 1,
            pageSize: 10,
            setCurrent: vi.fn(),
            setPageSize: vi.fn(),
            setFilters: vi.fn(),
            setSorters: vi.fn(),
        });

        render(<CertificateList />);

        expect(useTable).toHaveBeenCalledWith({
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
    });
});
