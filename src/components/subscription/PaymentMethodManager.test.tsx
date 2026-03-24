import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentMethodManager } from './PaymentMethodManager';
import type { PaymentMethod } from '../../types/subscription.types';

import { Modal } from 'antd';

// Mock dependencies
vi.mock('@refinedev/core', () => ({
    useList: vi.fn(),
    useUpdate: vi.fn(),
    useDelete: vi.fn(),
    useCreate: vi.fn(),
}));

vi.mock('@stripe/react-stripe-js', () => ({
    CardElement: () => <div data-testid="card-element">Card Element</div>,
    useStripe: vi.fn(),
    useElements: vi.fn(),
}));

import { useList, useUpdate, useDelete, useCreate } from '@refinedev/core';
import { useStripe, useElements } from '@stripe/react-stripe-js';

const mockPaymentMethods: (PaymentMethod & { isDefault?: boolean })[] = [
    {
        id: 'pm_1',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
    },
    {
        id: 'pm_2',
        brand: 'mastercard',
        last4: '5555',
        expMonth: 6,
        expYear: 2026,
        isDefault: false,
    },
];

describe('PaymentMethodManager', () => {
    const mockRefetch = vi.fn();
    const mockUpdate = vi.fn();
    const mockDelete = vi.fn();
    const mockCreate = vi.fn();
    const mockStripe = {
        createPaymentMethod: vi.fn(),
    };
    const mockElements = {
        getElement: vi.fn(),
    };
    const mockCardElement = {
        clear: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        Modal.destroyAll();
        vi.mocked(useStripe).mockReturnValue(mockStripe as any);
        vi.mocked(useElements).mockReturnValue(mockElements as any);
        mockElements.getElement.mockReturnValue(mockCardElement as any);

        vi.mocked(useList).mockReturnValue({
            data: { data: mockPaymentMethods },
            isLoading: false,
            refetch: mockRefetch,
        } as any);

        vi.mocked(useUpdate).mockReturnValue({
            mutate: mockUpdate,
        } as any);

        vi.mocked(useDelete).mockReturnValue({
            mutate: mockDelete,
        } as any);

        vi.mocked(useCreate).mockReturnValue({
            mutate: mockCreate,
        } as any);
    });

    it('should render loading state', () => {
        vi.mocked(useList).mockReturnValue({
            data: undefined,
            isLoading: true,
            refetch: mockRefetch,
        } as any);

        const { container } = render(<PaymentMethodManager />);

        const spinner = container.querySelector('.ant-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('should render payment methods list', async () => {
        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText('Payment Methods')).toBeInTheDocument();
        });

        expect(screen.getByText(/VISA •••• 4242/)).toBeInTheDocument();
        expect(screen.getByText(/MASTERCARD •••• 5555/)).toBeInTheDocument();
    });

    it('should display default badge for default payment method', async () => {
        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText('Default')).toBeInTheDocument();
        });
    });

    it('should show expiration dates', async () => {
        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText('Expires 12/2025')).toBeInTheDocument();
        });

        expect(screen.getByText('Expires 6/2026')).toBeInTheDocument();
    });

    it('should render add payment method button', async () => {
        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add payment method/i })).toBeInTheDocument();
        });
    });

    it('should open modal when add button is clicked', async () => {
        const user = userEvent.setup();
        render(<PaymentMethodManager />);

        const addButton = screen.getByRole('button', { name: /add payment method/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Card Information')).toBeInTheDocument();
        });
    });

    it('should handle adding new payment method', async () => {
        const user = userEvent.setup();

        mockStripe.createPaymentMethod.mockResolvedValue({
            paymentMethod: { id: 'pm_new' },
            error: null,
        });

        mockCreate.mockImplementation((params, options) => {
            options?.onSuccess?.();
        });

        render(<PaymentMethodManager />);

        const addButton = screen.getByRole('button', { name: /add payment method/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('card-element')).toBeInTheDocument();
        });

        const modalAddButton = screen.getAllByRole('button', { name: /add payment method/i })[1];
        await user.click(modalAddButton);

        await waitFor(() => {
            expect(mockStripe.createPaymentMethod).toHaveBeenCalled();
        });

        expect(mockCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                resource: 'payment-methods',
                values: {
                    payment_method_id: 'pm_new',
                },
            }),
            expect.any(Object)
        );
    });

    it('should handle set default payment method', async () => {
        const user = userEvent.setup();

        mockUpdate.mockImplementation((params, options) => {
            options?.onSuccess?.();
        });

        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText(/MASTERCARD •••• 5555/)).toBeInTheDocument();
        });

        const setDefaultButton = screen.getByRole('button', { name: /set as default/i });
        await user.click(setDefaultButton);

        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                resource: 'payment-methods',
                id: 'pm_2',
                values: { default: true },
            }),
            expect.any(Object)
        );
    });

    it('should show confirmation modal when removing payment method', async () => {
        const user = userEvent.setup();
        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText(/MASTERCARD •••• 5555/)).toBeInTheDocument();
        });

        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        await user.click(removeButtons[1]);

        await waitFor(() => {
            expect(screen.getAllByText('Remove Payment Method')[0]).toBeInTheDocument();
        });

        expect(screen.getByText('Are you sure you want to remove this payment method?')).toBeInTheDocument();
    });

    it('should disable remove button for default payment method', async () => {
        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText(/VISA •••• 4242/)).toBeInTheDocument();
        });

        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        expect(removeButtons[0]).toBeDisabled();
    });

    it('should render empty state when no payment methods', async () => {
        vi.mocked(useList).mockReturnValue({
            data: { data: [] },
            isLoading: false,
            refetch: mockRefetch,
        } as any);

        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText('No Payment Methods')).toBeInTheDocument();
        });

        expect(screen.getByText('Add a payment method to manage your subscription.')).toBeInTheDocument();
    });

    it('should disable add button when Stripe is not initialized', async () => {
        const user = userEvent.setup();
        vi.mocked(useStripe).mockReturnValue(null);

        render(<PaymentMethodManager />);

        const addButton = screen.getByRole('button', { name: /add payment method/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('card-element')).toBeInTheDocument();
        });

        const modalAddButton = screen.getAllByRole('button', { name: /add payment method/i })[1];
        expect(modalAddButton).toBeDisabled();
    });

    it('should handle Stripe error when adding payment method', async () => {
        const user = userEvent.setup();

        mockStripe.createPaymentMethod.mockResolvedValue({
            paymentMethod: null,
            error: { message: 'Card declined' },
        });

        render(<PaymentMethodManager />);

        const addButton = screen.getByRole('button', { name: /add payment method/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('card-element')).toBeInTheDocument();
        });

        const modalAddButton = screen.getAllByRole('button', { name: /add payment method/i })[1];
        await user.click(modalAddButton);

        await waitFor(() => {
            expect(screen.getByText('Card declined')).toBeInTheDocument();
        });
    });

    it('should clear card element after successful add', async () => {
        const user = userEvent.setup();

        mockStripe.createPaymentMethod.mockResolvedValue({
            paymentMethod: { id: 'pm_new' },
            error: null,
        });

        mockCreate.mockImplementation((params, options) => {
            options?.onSuccess?.();
        });

        render(<PaymentMethodManager />);

        const addButton = screen.getByRole('button', { name: /add payment method/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('card-element')).toBeInTheDocument();
        });

        const modalAddButton = screen.getAllByRole('button', { name: /add payment method/i })[1];
        await user.click(modalAddButton);

        await waitFor(() => {
            expect(mockCardElement.clear).toHaveBeenCalled();
        });
    });

    it('should refetch payment methods after successful operations', async () => {
        const user = userEvent.setup();

        mockUpdate.mockImplementation((params, options) => {
            options?.onSuccess?.();
        });

        render(<PaymentMethodManager />);

        await waitFor(() => {
            expect(screen.getByText(/MASTERCARD •••• 5555/)).toBeInTheDocument();
        });

        const setDefaultButton = screen.getByRole('button', { name: /set as default/i });
        await user.click(setDefaultButton);

        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled();
        });
    });
});
