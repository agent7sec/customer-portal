import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from './PaymentForm';
import type { SubscriptionPlan } from '../../types/subscription.types';

// Mock Stripe hooks
vi.mock('@stripe/react-stripe-js', () => ({
    CardElement: () => <div data-testid="card-element">Card Element</div>,
    useStripe: () => null,
    useElements: () => null,
}));

// Mock the subscription service
vi.mock('../../services/SubscriptionService', () => ({
    subscriptionService: {
        createSubscription: vi.fn(),
    },
}));

const mockPlan: SubscriptionPlan = {
    id: 'plan_123',
    name: 'Pro Plan',
    description: 'Professional plan with all features',
    price: 2999,
    currency: 'usd',
    interval: 'month',
    features: ['Feature 1', 'Feature 2'],
    stripePriceId: 'price_123',
};

describe('PaymentForm', () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderPaymentForm = (plan = mockPlan) => {
        return render(
            <PaymentForm
                plan={plan}
                onSuccess={mockOnSuccess}
                onCancel={mockOnCancel}
            />
        );
    };

    it('renders payment form with plan details', () => {
        renderPaymentForm();

        expect(screen.getByText(`Subscribe to ${mockPlan.name}`)).toBeInTheDocument();
        const priceElements = screen.getAllByText(/\$29\.99\/month/);
        expect(priceElements.length).toBeGreaterThan(0);
    });

    it('integrates Stripe CardElement with Ant Design Form', () => {
        const { container } = renderPaymentForm();

        // Verify Ant Design Form is rendered
        const form = container.querySelector('.ant-form');
        expect(form).toBeInTheDocument();
        expect(form).toHaveClass('ant-form-vertical');
        expect(form).toHaveClass('ant-form-hide-required-mark');

        // Verify Form.Item with label is rendered
        expect(screen.getByText('Card Information')).toBeInTheDocument();

        // Verify CardElement is integrated within the form
        expect(screen.getByTestId('card-element')).toBeInTheDocument();
    });

    it('displays submit button with correct styling and text', () => {
        renderPaymentForm();

        const submitButton = screen.getByRole('button', { name: /Subscribe - \$29\.99\/month/ });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveClass('ant-btn-primary');
        expect(submitButton).toHaveClass('ant-btn-lg');
        expect(submitButton).toHaveClass('ant-btn-block');
        expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('displays back to plans button', () => {
        renderPaymentForm();

        const backButton = screen.getByRole('button', { name: /Back to Plans/ });
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveClass('ant-btn-lg');
        expect(backButton).toHaveClass('ant-btn-block');
    });

    it('calls onCancel when back button is clicked', async () => {
        const user = userEvent.setup();
        renderPaymentForm();

        const backButton = screen.getByRole('button', { name: /Back to Plans/ });
        await user.click(backButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('displays security message with lock icon', () => {
        renderPaymentForm();

        expect(screen.getByText(/Your payment is secured with 256-bit SSL encryption/)).toBeInTheDocument();
    });

    it('formats price correctly for USD', () => {
        renderPaymentForm();

        const priceElements = screen.getAllByText(/\$29\.99\/month/);
        expect(priceElements.length).toBeGreaterThan(0);
    });

    it('formats price correctly for EUR', () => {
        const euroPlan = { ...mockPlan, currency: 'eur', price: 3500 };
        renderPaymentForm(euroPlan);

        const priceElements = screen.getAllByText(/€35\.00\/month/);
        expect(priceElements.length).toBeGreaterThan(0);
    });

    it('disables submit button when Stripe is not loaded', () => {
        renderPaymentForm();

        const submitButton = screen.getByRole('button', { name: /Subscribe/ });
        expect(submitButton).toBeDisabled();
    });

    it('uses Ant Design Card component for layout', () => {
        const { container } = renderPaymentForm();

        const card = container.querySelector('.ant-card');
        expect(card).toBeInTheDocument();
    });

    it('uses Ant Design Space component for vertical layout', () => {
        const { container } = renderPaymentForm();

        const space = container.querySelector('.ant-space-vertical');
        expect(space).toBeInTheDocument();
    });
});
