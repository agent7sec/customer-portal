import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionManager } from './SubscriptionManager';
import type { Subscription } from '../../types/subscription.types';

// Mock Refine hooks
vi.mock('@refinedev/core', () => ({
    useShow: vi.fn(),
    useDelete: vi.fn(),
}));

import { useShow, useDelete } from '@refinedev/core';

const mockSubscription: Subscription = {
    id: 'sub_1',
    planId: 'plan_basic',
    planName: 'Basic Plan',
    status: 'active',
    currentPeriodEnd: new Date('2024-12-31T23:59:59Z'),
    cancelAtPeriodEnd: false,
    amount: 999,
    currency: 'usd',
};

const mockCanceledSubscription: Subscription = {
    ...mockSubscription,
    cancelAtPeriodEnd: true,
};

describe('SubscriptionManager', () => {
    const mockOnCancel = vi.fn();
    const mockOnReactivate = vi.fn();
    const mockCancelMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useDelete).mockReturnValue({
            mutate: mockCancelMutate,
            isLoading: false,
        } as any);
    });

    it('should render loading state', () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: true,
                data: undefined,
                error: null,
            },
        } as any);

        const { container } = render(<SubscriptionManager />);

        const spinner = container.querySelector('.ant-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('should render subscription details', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByText('Current Subscription')).toBeInTheDocument();
        });

        expect(screen.getByText('Basic Plan')).toBeInTheDocument();
        expect(screen.getAllByText('$9.99')[0]).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display formatted price correctly', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getAllByText('$9.99')[0]).toBeInTheDocument();
        });
    });

    it('should display next billing date', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByText('December 31, 2024')).toBeInTheDocument();
        });
    });

    it('should render cancel button for active subscription', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
        });
    });

    it('should show confirmation modal when cancel is clicked', async () => {
        const user = userEvent.setup();
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        const cancelButton = screen.getByRole('button', { name: /cancel subscription/i });
        await user.click(cancelButton);

        await waitFor(() => {
            expect(screen.getAllByText('Cancel Subscription')[0]).toBeInTheDocument();
        });

        expect(screen.getByText(/are you sure you want to cancel your subscription/i)).toBeInTheDocument();
    });

    it('should handle subscription cancellation', async () => {
        const user = userEvent.setup();
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        mockCancelMutate.mockImplementation((params, options) => {
            options?.onSuccess?.();
        });

        render(<SubscriptionManager onCancel={mockOnCancel} />);

        const cancelButton = screen.getByRole('button', { name: /cancel subscription/i });
        await user.click(cancelButton);

        await waitFor(() => {
            expect(screen.getAllByText('Cancel Subscription')[0]).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /yes, cancel subscription/i });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(mockCancelMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    resource: 'subscriptions',
                    id: 'sub_1',
                }),
                expect.any(Object)
            );
        });

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should display warning for subscription ending', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockCanceledSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByText('Subscription Ending')).toBeInTheDocument();
        });

        expect(screen.getByText(/your subscription will end on/i)).toBeInTheDocument();
    });

    it('should render reactivate button for canceled subscription', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockCanceledSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /reactivate subscription/i })).toBeInTheDocument();
        });
    });

    it('should call onReactivate when reactivate button is clicked', async () => {
        const user = userEvent.setup();
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockCanceledSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager onReactivate={mockOnReactivate} />);

        const reactivateButton = screen.getByRole('button', { name: /reactivate subscription/i });
        await user.click(reactivateButton);

        expect(mockOnReactivate).toHaveBeenCalledTimes(1);
    });

    it('should render empty state when no subscription', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: undefined,
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByText('No Active Subscription')).toBeInTheDocument();
        });

        expect(screen.getByText("You don't have an active subscription. Choose a plan to get started.")).toBeInTheDocument();
    });

    it('should render empty state on error', async () => {
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: undefined,
                error: new Error('Failed to load'),
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByText('No Active Subscription')).toBeInTheDocument();
        });
    });

    it('should disable cancel button for already canceled subscription', async () => {
        const canceledSub: Subscription = {
            ...mockSubscription,
            status: 'canceled',
        };

        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: canceledSub },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            const cancelButton = screen.getByRole('button', { name: /cancel subscription/i });
            expect(cancelButton).toBeDisabled();
        });
    });

    it('should display correct status badge for different statuses', async () => {
        const trialingSub: Subscription = {
            ...mockSubscription,
            status: 'trialing',
        };

        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: trialingSub },
                error: null,
            },
        } as any);

        render(<SubscriptionManager />);

        await waitFor(() => {
            expect(screen.getByText('Trial')).toBeInTheDocument();
        });
    });

    it('should show loading state on cancel button during cancellation', async () => {
        const user = userEvent.setup();
        vi.mocked(useShow).mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        vi.mocked(useDelete).mockReturnValue({
            mutate: mockCancelMutate,
            isLoading: true,
        } as any);

        render(<SubscriptionManager />);

        const cancelButton = screen.getByRole('button', { name: /cancel subscription/i });
        await user.click(cancelButton);

        await waitFor(() => {
            const confirmButton = screen.getByRole('button', { name: /yes, cancel subscription/i });
            expect(confirmButton).toHaveClass('ant-btn-loading');
        });
    });

    it('should use provided subscriptionId', async () => {
        const mockUseShow = vi.mocked(useShow);
        mockUseShow.mockReturnValue({
            queryResult: {
                isLoading: false,
                data: { data: mockSubscription },
                error: null,
            },
        } as any);

        render(<SubscriptionManager subscriptionId="sub_custom" />);

        expect(mockUseShow).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'sub_custom',
            })
        );
    });
});
