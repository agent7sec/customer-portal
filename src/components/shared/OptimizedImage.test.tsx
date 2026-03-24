import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptimizedImage } from './OptimizedImage';

describe('OptimizedImage', () => {
  it('should render skeleton while image is loading', () => {
    render(
      <OptimizedImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={200}
        height={200}
      />
    );

    // Skeleton should be visible initially
    const skeleton = document.querySelector('.ant-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render image with lazy loading attribute', () => {
    render(
      <OptimizedImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={200}
        height={200}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should show image after load event', async () => {
    render(
      <OptimizedImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={200}
        height={200}
      />
    );

    const img = screen.getByAltText('Test image') as HTMLImageElement;
    
    // Initially hidden
    expect(img).toHaveStyle({ display: 'none' });

    // Simulate image load using fireEvent
    fireEvent.load(img);

    await waitFor(() => {
      expect(img).toHaveStyle({ display: 'block' });
    });
  });

  it('should show error state when image fails to load', async () => {
    render(
      <OptimizedImage
        src="https://example.com/invalid-image.jpg"
        alt="Test image"
        width={200}
        height={200}
      />
    );

    const img = screen.getByAltText('Test image') as HTMLImageElement;

    // Simulate image error using fireEvent
    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  it('should apply custom styles and className', () => {
    const customStyle = { borderRadius: '8px' };
    const customClass = 'custom-image';

    render(
      <OptimizedImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={200}
        height={200}
        style={customStyle}
        className={customClass}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass(customClass);
    expect(img).toHaveStyle(customStyle);
  });
});
