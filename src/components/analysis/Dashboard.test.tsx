import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import type { Analysis } from '../../types/analysis.types';

// Mock Refine hooks
const mockUseList = vi.fn();
vi.mock('@refinedev/core', () => ({
  useList: () => mockUseList(),
}));

// Mock notifications hook
vi.mock('../../hooks/useAnalysisNotifications', () => ({
  useAnalysisNotifications: vi.fn(),
}));

const mockAnalyses: Analysis[] = [
  {
    id: '1',
    userId: 'user-1',
    fileName: 'app.zip',
    fileSize: 5242880,
    status: 'processing',
    progress: 60,
    currentStage: 'Analyzing',
    submittedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    userId: 'user-1',
    fileName: 'lib.tar.gz',
    fileSize: 10485760,
    status: 'completed',
    progress: 100,
    submittedAt: new Date('2024-01-14T09:00:00Z'),
    completedAt: new Date('2024-01-14T09:30:00Z'),
    certificateUrl: 'cert-123',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { container } = renderWithRouter(<Dashboard />);
    // Check for the Spin component
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Failed to load analyses. Please try again.')).toBeInTheDocument();
  });

  it('displays empty state when no analyses exist', () => {
    mockUseList.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('No analyses found')).toBeInTheDocument();
    expect(screen.getByText('Upload a file to start your first analysis')).toBeInTheDocument();
  });

  it('displays analyses in grid layout', () => {
    mockUseList.mockReturnValue({
      data: { data: mockAnalyses },
      isLoading: false,
      isError: false,
    });

    renderWithRouter(<Dashboard />);

    expect(screen.getByText('app.zip')).toBeInTheDocument();
    expect(screen.getByText('lib.tar.gz')).toBeInTheDocument();
  });

  it('shows auto-refresh indicator when active analyses exist', () => {
    mockUseList.mockReturnValue({
      data: { data: mockAnalyses },
      isLoading: false,
      isError: false,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText(/Auto-refreshing every 5 seconds/)).toBeInTheDocument();
  });

  it('does not show auto-refresh indicator when no active analyses', () => {
    const completedAnalyses: Analysis[] = [
      {
        ...mockAnalyses[1],
        status: 'completed',
      },
    ];

    mockUseList.mockReturnValue({
      data: { data: completedAnalyses },
      isLoading: false,
      isError: false,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.queryByText(/Auto-refreshing/)).not.toBeInTheDocument();
  });
});
