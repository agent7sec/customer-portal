import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { subscriptionService } from './SubscriptionService';
import { auth0Service } from './Auth0Service';
import { StripeError, SubscriptionError } from '../types/errors';

// Mock dependencies
vi.mock('axios');
vi.mock('./Auth0Service');
vi.mock('../config/env', () => ({
    config: {
        api: {
            baseUrl: 'https://api.example.com',
        },
    },
}));

const mockedAxios = vi.mocked(axios);
const mockedAuth0Service = vi.mocked(auth0Service);

describe('SubscriptionService', () => {
    const mockTokens = {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
        expiresAt: Date.now() + 3600000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAuth0Service.getTokens.mockReturnValue(mockTokens);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getPlans', () => {
        it('should fetch subscription plans successfully', async () => {
            const mockPlans = [
                {
                    id: 'plan_1',
                    name: 'Basic',
                    description: 'Basic plan',
                    price: 999,
                    currency: 'usd',
                    interval: 'month' as const,
                    features: ['Feature 1', 'Feature 2'],
                    stripePriceId: 'price_123',
                },
            ];

            mockedAxios.get.mockResolvedValue({ data: mockPlans });

            const result = await subscriptionService.getPlans();

            expect(result).toEqual(mockPlans);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://api.example.com/plans',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-access-token',
                    }),
                })
            );
        });

        it('should handle errors when fetching plans', async () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { message: 'Server error' },
                },
            };

            mockedAxios.get.mockRejectedValue(mockError);

            await expect(subscriptionService.getPlans()).rejects.toThrow();
        });
    });

    describe('getCurrentSubscription', () => {
        it('should fetch current subscription successfully', async () => {
            const mockSubscription = {
                id: 'sub_1',
                plan_id: 'plan_1',
                plan_name: 'Basic',
                status: 'active',
                current_period_end: '2024-12-31T23:59:59Z',
                cancel_at_period_end: false,
                amount: 999,
                currency: 'usd',
            };

            mockedAxios.get.mockResolvedValue({ data: mockSubscription });

            const result = await subscriptionService.getCurrentSubscription();

            expect(result).toMatchObject({
                id: 'sub_1',
                planId: 'plan_1',
                planName: 'Basic',
                status: 'active',
                cancelAtPeriodEnd: false,
                amount: 999,
                currency: 'usd',
            });
        });

        it('should return null when no subscription exists (404)', async () => {
            const mockError = {
                response: {
                    status: 404,
                    data: { message: 'Not found' },
                },
            };

            mockedAxios.get.mockRejectedValue(mockError);

            const result = await subscriptionService.getCurrentSubscription();

            expect(result).toBeNull();
        });

        it('should throw error for non-404 errors', async () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { message: 'Server error' },
                },
            };

            mockedAxios.get.mockRejectedValue(mockError);

            await expect(subscriptionService.getCurrentSubscription()).rejects.toThrow();
        });
    });

    describe('createSubscription', () => {
        it('should create subscription successfully', async () => {
            const mockResponse = {
                id: 'sub_1',
                plan_id: 'plan_1',
                plan_name: 'Basic',
                status: 'active',
                current_period_end: '2024-12-31T23:59:59Z',
                cancel_at_period_end: false,
                amount: 999,
                currency: 'usd',
            };

            mockedAxios.post.mockResolvedValue({ data: mockResponse });

            const result = await subscriptionService.createSubscription({
                planId: 'plan_1',
                paymentMethodId: 'pm_123',
            });

            expect(result).toMatchObject({
                id: 'sub_1',
                planId: 'plan_1',
                status: 'active',
            });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.example.com/subscriptions',
                {
                    plan_id: 'plan_1',
                    payment_method_id: 'pm_123',
                },
                expect.any(Object)
            );
        });

        it('should handle Stripe payment errors', async () => {
            const mockError = {
                response: {
                    status: 402,
                    data: {
                        type: 'stripe_card_error',
                        code: 'card_declined',
                        message: 'Your card was declined',
                    },
                },
            };

            mockedAxios.post.mockRejectedValue(mockError);

            await expect(
                subscriptionService.createSubscription({
                    planId: 'plan_1',
                    paymentMethodId: 'pm_123',
                })
            ).rejects.toThrow();
        });
    });

    describe('cancelSubscription', () => {
        it('should cancel subscription successfully', async () => {
            mockedAxios.delete.mockResolvedValue({ data: {} });

            await expect(subscriptionService.cancelSubscription()).resolves.not.toThrow();

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                'https://api.example.com/subscriptions/current',
                expect.any(Object)
            );
        });

        it('should handle errors when canceling', async () => {
            const mockError = {
                response: {
                    status: 404,
                    data: { message: 'Subscription not found' },
                },
            };

            mockedAxios.delete.mockRejectedValue(mockError);

            await expect(subscriptionService.cancelSubscription()).rejects.toThrow();
        });
    });

    describe('reactivateSubscription', () => {
        it('should reactivate subscription successfully', async () => {
            const mockResponse = {
                id: 'sub_1',
                plan_id: 'plan_1',
                plan_name: 'Basic',
                status: 'active',
                current_period_end: '2024-12-31T23:59:59Z',
                cancel_at_period_end: false,
                amount: 999,
                currency: 'usd',
            };

            mockedAxios.post.mockResolvedValue({ data: mockResponse });

            const result = await subscriptionService.reactivateSubscription();

            expect(result.cancelAtPeriodEnd).toBe(false);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.example.com/subscriptions/current/reactivate',
                {},
                expect.any(Object)
            );
        });
    });

    describe('updateSubscriptionPlan', () => {
        it('should update subscription plan successfully', async () => {
            const mockResponse = {
                id: 'sub_1',
                plan_id: 'plan_2',
                plan_name: 'Pro',
                status: 'active',
                current_period_end: '2024-12-31T23:59:59Z',
                cancel_at_period_end: false,
                amount: 1999,
                currency: 'usd',
            };

            mockedAxios.put.mockResolvedValue({ data: mockResponse });

            const result = await subscriptionService.updateSubscriptionPlan('plan_2');

            expect(result.planId).toBe('plan_2');
            expect(result.amount).toBe(1999);
        });
    });

    describe('getPaymentMethods', () => {
        it('should fetch payment methods successfully', async () => {
            const mockPaymentMethods = [
                {
                    id: 'pm_1',
                    card: {
                        brand: 'visa',
                        last4: '4242',
                        exp_month: 12,
                        exp_year: 2025,
                    },
                },
            ];

            mockedAxios.get.mockResolvedValue({ data: mockPaymentMethods });

            const result = await subscriptionService.getPaymentMethods();

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: 'pm_1',
                brand: 'visa',
                last4: '4242',
                expMonth: 12,
                expYear: 2025,
            });
        });
    });

    describe('addPaymentMethod', () => {
        it('should add payment method successfully', async () => {
            const mockResponse = {
                id: 'pm_1',
                card: {
                    brand: 'visa',
                    last4: '4242',
                    exp_month: 12,
                    exp_year: 2025,
                },
            };

            mockedAxios.post.mockResolvedValue({ data: mockResponse });

            const result = await subscriptionService.addPaymentMethod('pm_123');

            expect(result.id).toBe('pm_1');
            expect(result.brand).toBe('visa');
        });
    });

    describe('removePaymentMethod', () => {
        it('should remove payment method successfully', async () => {
            mockedAxios.delete.mockResolvedValue({ data: {} });

            await expect(
                subscriptionService.removePaymentMethod('pm_1')
            ).resolves.not.toThrow();

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                'https://api.example.com/payment-methods/pm_1',
                expect.any(Object)
            );
        });
    });

    describe('getInvoices', () => {
        it('should fetch invoices successfully', async () => {
            const mockInvoices = [
                {
                    id: 'in_1',
                    amount_paid: 999,
                    currency: 'usd',
                    status: 'paid',
                    created: 1640000000,
                    invoice_pdf: 'https://example.com/invoice.pdf',
                },
            ];

            mockedAxios.get.mockResolvedValue({ data: mockInvoices });

            const result = await subscriptionService.getInvoices();

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                id: 'in_1',
                amount: 999,
                currency: 'usd',
                status: 'paid',
            });
            expect(result[0].createdAt).toBeInstanceOf(Date);
        });
    });

    describe('getInvoice', () => {
        it('should fetch a specific invoice successfully', async () => {
            const mockInvoice = {
                id: 'in_1',
                amount_paid: 999,
                currency: 'usd',
                status: 'paid',
                created: 1640000000,
                invoice_pdf: 'https://example.com/invoice.pdf',
            };

            mockedAxios.get.mockResolvedValue({ data: mockInvoice });

            const result = await subscriptionService.getInvoice('in_1');

            expect(result.id).toBe('in_1');
            expect(result.amount).toBe(999);
        });
    });

    describe('setDefaultPaymentMethod', () => {
        it('should set default payment method successfully', async () => {
            mockedAxios.put.mockResolvedValue({ data: {} });

            await expect(
                subscriptionService.setDefaultPaymentMethod('pm_1')
            ).resolves.not.toThrow();

            expect(mockedAxios.put).toHaveBeenCalledWith(
                'https://api.example.com/payment-methods/pm_1/default',
                {},
                expect.any(Object)
            );
        });
    });
});
