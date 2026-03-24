import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionPlans } from './SubscriptionPlans';
import type { SubscriptionPlan, Subscription } from '../../types/subscription.types';

// Mock Refine hooks
vi.mock('@refinedev/core', () => ({
    useList: vi.fn(),
}));

import { useList } from '@refinedev/core';

const mockPlans: SubscriptionPlan[] = [
    {
        id: 'plan_basic',
        name: 'Basic',
        description: 'Perfect for individuals',
        price: 999,
        currency: 'usd',
        interval: 'month',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        stripePriceId: 'price_basic',
    },
    {
        id: 'plan_pro',
        name: 'Pro',
        description: 'For professionals',
        price: 1999,
        currency: 'usd',
        interval: 'month',
        features: ['All Basic features', 'Feature 4', 'Feature 5'],
        stripePriceId: 'price_pro',
    },
];

const mockCurrentSubscription: Subscription = {
    id: 'sub_1',
    planId: 'plan_basic',
    planName: 'Basic',
    status: 'active',
    currentPeriodEnd: new Date('2024-12-31'),
    cancelAtPeriodEnd: false,
    amount: 999,
    currency: 'usd',
};

describe('SubscriptionPlans', () => {
    const mockOnSelectPlan = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state', () => {
        vi.mocked(useList).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        const { container } = render(
            <SubscriptionPlans onSelectPlan={mockOnSelectPlan} />
        );

        const spinner = container.querySelector('.ant-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('should render plans after loading', async () => {
        vi.mocked(useList).mockReturnValue({
            data: { data: mockPlans },
            isLoading: false,
        } as any);

        render(<SubscriptionPlans onSelectPlan={mockOnSelectPlan} />);

        await waitFor(() => {
            expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
        });

        expect(screen.getByText('Basic')).toBeInTheDocument();
        expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    it('should display plan details correctly', async () => {
        vi.mocked(useList).mockReturnValue({
            data: { data: mockPlans },
            isLoading: false,
        } as any);

        render(<SubscriptionPlans onSelectPlan={mockOnSelectPlan} />);

        await waitFor(() => {
            expect(screen.getByText('Perfect for individuals')).toBeInTheDocument();
        });

        expect(screen.getByText('$9.99')).toBeInTheDocument();
        expect(screen.getByText('Feature 1')).toBeInTheDocument();
        expect(screen.getByText('Feature 2')).toBeInTheDocument();
    });

    it('should call onSelectPlan when plan is selected', async () => {
        const user = userEvent.setup();
        vi.mocked(useList).mockReturnValue({
            data: { data: mockPlans },
            isLoading: false,
        } as any);

        render(<SubscriptionPlans onSelectPlan={mockOnSelectPlan} />);

        await waitFor(() => {
            expect(screen.getByText('Basic')).toBeInTheDocument();
        });

        const selectButtons = screen.getAllByRole('button', { name: /select plan/i });
        await user.click(selectButtons[0]);

        expect(mockOnSelectPlan).toHaveBeenCalledWith(mockPlans[0]);
    });

    it('should highlight current plan', async () => {
        vi.mocked(useList).mockReturnValue({
            data: { data: mockPlans },
            isLoading: false,
        } as any);

        render(
            <SubscriptionPlans
                onSelectPlan={mockOnSelectPlan}
                currentSubscription={mockCurrentSubscription}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Current')).toBeInTheDocument();
        });

        const currentPlanButton = screen.getByRole('button', { name: /current plan/i });
        expect(currentPlanButton).toBeDisabled();
    });

    it('should not allow selecting current plan', async () => {
        const user = userEvent.setup();
        vi.mocked(useList).mockReturnValue({
            data: { data: mockPlans },
            isLoading: false,
        } as any);

        render(
            <SubscriptionPlans
                onSelectPlan={mockOnSelectPlan}
                currentSubscription={mockCurrentSubscription}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Basic')).toBeInTheDocument();
        });

        const currentPlanButton = screen.getByRole('button', { name: /current plan/i });
        await user.click(currentPlanButton);

        expect(mockOnSelectPlan).not.toHaveBeenCalled();
    });

    it('should render empty state when no plans available', async () => {
        vi.mocked(useList).mockReturnValue({
            data: { data: [] },
            isLoading: false,
        } as any);

        render(<SubscriptionPlans onSelectPlan={mockOnSelectPlan} />);

        await waitFor(() => {
            expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
        });

        expect(screen.queryByText('Basic')).not.toBeInTheDocument();
    });
});
