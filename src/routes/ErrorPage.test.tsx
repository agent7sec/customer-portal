import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorPage } from './ErrorPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ErrorPage', () => {
  it('renders 500 error message', () => {
    render(
      <BrowserRouter>
        <ErrorPage />
      </BrowserRouter>
    );

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong on our end/i)).toBeInTheDocument();
  });

  it('navigates to home when Go Home button is clicked', () => {
    render(
      <BrowserRouter>
        <ErrorPage />
      </BrowserRouter>
    );

    const homeButton = screen.getByText('Go Home');
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
