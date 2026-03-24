import { render, screen } from '@testing-library/react';
import { SkipLinks } from './SkipLinks';

describe('SkipLinks', () => {
  it('renders skip links with correct labels', () => {
    render(<SkipLinks />);
    
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });

  it('has correct href attributes', () => {
    render(<SkipLinks />);
    
    const mainContentLink = screen.getByText('Skip to main content');
    const navigationLink = screen.getByText('Skip to navigation');
    
    expect(mainContentLink).toHaveAttribute('href', '#main-content');
    expect(navigationLink).toHaveAttribute('href', '#main-navigation');
  });

  it('has proper ARIA label on nav element', () => {
    const { container } = render(<SkipLinks />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', 'Skip links');
  });
});
