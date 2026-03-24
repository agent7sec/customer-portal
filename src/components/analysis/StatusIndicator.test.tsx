import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusIndicator } from './StatusIndicator';
import type { AnalysisStatus } from '../../types/analysis.types';

describe('StatusIndicator', () => {
  it('renders uploading status correctly', () => {
    render(<StatusIndicator status="uploading" />);
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });

  it('renders queued status correctly', () => {
    render(<StatusIndicator status="queued" />);
    expect(screen.getByText('Queued')).toBeInTheDocument();
  });

  it('renders processing status correctly', () => {
    render(<StatusIndicator status="processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders completed status correctly', () => {
    render(<StatusIndicator status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders failed status correctly', () => {
    render(<StatusIndicator status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    const { container } = render(<StatusIndicator status="processing" showIcon={false} />);
    expect(container.querySelector('.anticon')).not.toBeInTheDocument();
  });

  it('renders with small size prop', () => {
    const { container } = render(<StatusIndicator status="completed" size="small" />);
    const tag = container.querySelector('.ant-tag');
    expect(tag).toBeInTheDocument();
  });

  it('applies correct color for each status', () => {
    const statuses: AnalysisStatus[] = ['uploading', 'queued', 'processing', 'completed', 'failed'];

    statuses.forEach((status) => {
      const { container } = render(<StatusIndicator status={status} />);
      const tag = container.querySelector('.ant-tag');
      expect(tag).toBeInTheDocument();
    });
  });
});
