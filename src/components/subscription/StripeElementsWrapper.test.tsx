import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StripeElementsWrapper from './StripeElementsWrapper';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({ 
    elements: vi.fn(),
    createToken: vi.fn(),
  })),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
}));

describe('StripeElementsWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner initially', () => {
    render(
      <StripeElementsWrapper>
        <div>Child content</div>
      </StripeElementsWrapper>
    );

    // Loading spinner should be visible
    const spinner = document.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render children after Stripe loads', async () => {
    render(
      <StripeElementsWrapper>
        <div>Child content</div>
      </StripeElementsWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  it('should wrap children in Stripe Elements component', async () => {
    render(
      <StripeElementsWrapper>
        <div data-testid="payment-form">Payment Form</div>
      </StripeElementsWrapper>
    );

    await waitFor(() => {
      const stripeElements = screen.getByTestId('stripe-elements');
      const paymentForm = screen.getByTestId('payment-form');
      
      expect(stripeElements).toBeInTheDocument();
      expect(paymentForm).toBeInTheDocument();
    });
  });
});
