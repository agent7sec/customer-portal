import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AnalysisCard } from './AnalysisCard';
import type { Analysis } from '../../types/analysis.types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockAnalysis: Analysis = {
  id: 'test-123',
  userId: 'user-456',
  fileName: 'test-file.zip',
  fileSize: 5242880, // 5 MB
  status: 'processing',
  progress: 45,
  currentStage: 'Analyzing',
  submittedAt: new Date('2024-01-15T10:00:00Z'),
  completedAt: undefined,
  errorMessage: undefined,
  certificateUrl: undefined,
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AnalysisCard', () => {
  it('renders analysis information correctly', () => {
    renderWithRouter(<AnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText('test-file.zip')).toBeInTheDocument();
    expect(screen.getByText('5.00 MB')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('displays progress bar for processing status', () => {
    renderWithRouter(<AnalysisCard analysis={mockAnalysis} />);

    expect(screen.getByText('Progress: 45%')).toBeInTheDocument();
    expect(screen.getByText('Current Stage: Analyzing')).toBeInTheDocument();
  });

  it('displays completed date when analysis is complete', () => {
    const completedAnalysis: Analysis = {
      ...mockAnalysis,
      status: 'completed',
      completedAt: new Date('2024-01-15T11:00:00Z'),
      certificateId: 'cert-789',
    };

    renderWithRouter(<AnalysisCard analysis={completedAnalysis} />);
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
  });

  it('displays error message for failed analysis', () => {
    const failedAnalysis: Analysis = {
      ...mockAnalysis,
      status: 'failed',
      errorMessage: 'File format not supported',
    };

    renderWithRouter(<AnalysisCard analysis={failedAnalysis} />);
    expect(screen.getByText('File format not supported')).toBeInTheDocument();
  });

  it('shows certificate button when certificate is available', () => {
    const completedAnalysis: Analysis = {
      ...mockAnalysis,
      status: 'completed',
      certificateUrl: 'cert-789',
    };

    renderWithRouter(<AnalysisCard analysis={completedAnalysis} />);
    expect(screen.getByText('Certificate')).toBeInTheDocument();
  });

  it('navigates to details page when view button is clicked', () => {
    renderWithRouter(<AnalysisCard analysis={mockAnalysis} />);

    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith('/analyses/test-123');
  });

  it('navigates to certificate page when certificate button is clicked', () => {
    const completedAnalysis: Analysis = {
      ...mockAnalysis,
      status: 'completed',
      certificateUrl: 'cert-789',
    };

    renderWithRouter(<AnalysisCard analysis={completedAnalysis} />);

    const certButton = screen.getByText('Certificate');
    fireEvent.click(certButton);

    expect(mockNavigate).toHaveBeenCalledWith('/certificates/cert-789');
  });

  it('formats file size correctly', () => {
    const largeFileAnalysis: Analysis = {
      ...mockAnalysis,
      fileSize: 104857600, // 100 MB
    };

    renderWithRouter(<AnalysisCard analysis={largeFileAnalysis} />);
    expect(screen.getByText('100.00 MB')).toBeInTheDocument();
  });
});
