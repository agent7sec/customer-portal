import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageSkeleton } from './PageSkeleton';

describe('PageSkeleton', () => {
  it('should render list skeleton by default', () => {
    const { container } = render(<PageSkeleton />);
    
    // Should render multiple skeleton cards for list view
    const skeletons = container.querySelectorAll('.ant-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render specified number of rows for list type', () => {
    const { container } = render(<PageSkeleton type="list" rows={3} />);
    
    const cards = container.querySelectorAll('.ant-card');
    expect(cards.length).toBe(3);
  });

  it('should render detail skeleton', () => {
    const { container } = render(<PageSkeleton type="detail" />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render form skeleton with inputs and button', () => {
    const { container } = render(<PageSkeleton type="form" />);
    
    const inputs = container.querySelectorAll('.ant-skeleton-input');
    const button = container.querySelector('.ant-skeleton-button');
    
    expect(inputs.length).toBeGreaterThan(0);
    expect(button).toBeInTheDocument();
  });
});
