import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('should render with default title', () => {
    const { container } = render(<EmptyState />);
    
    const titleDiv = container.querySelector('div[style*="font-size: 16px"]');
    expect(titleDiv).toHaveTextContent('No data');
  });

  it('should render with custom title and description', () => {
    const { container } = render(
      <EmptyState 
        title="No analyses found" 
        description="Upload a file to get started" 
      />
    );
    
    const titleDiv = container.querySelector('div[style*="font-size: 16px"]');
    expect(titleDiv).toHaveTextContent('No analyses found');
    expect(screen.getByText('Upload a file to get started')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const onAction = vi.fn();
    
    render(
      <EmptyState 
        title="No data" 
        actionText="Add New" 
        onAction={onAction} 
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add New' });
    expect(button).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    
    render(
      <EmptyState 
        title="No data" 
        actionText="Add New" 
        onAction={onAction} 
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add New' });
    await user.click(button);
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should not render button when actionText is not provided', () => {
    render(<EmptyState title="No data" />);
    
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });
});
