import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import { parseApiError } from '../types/errors';
import type {
    SubscriptionPlan,
    Subscription,
    PaymentMethod,
    Invoice,
    CreateSubscriptionParams,
} from '../types/subscription.types';

/**
 * Service for managing subscriptions and payment methods via Stripe
 */
class SubscriptionService {
    private async getHeaders(): Promise<Record<string, string>> {
        try {
            const tokens = auth0Service.getTokens() || (await auth0Service.refreshSession());
            return {
                Authorization: `Bearer ${tokens.accessToken}`,
                'Content-Type': 'application/json',
            };
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Fetch all available subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${config.api.baseUrl}/plans`, { headers });
            return response.data;
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Get the current user's active subscription
     * Returns null if no active subscription exists
     */
    async getCurrentSubscription(): Promise<Subscription | null> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${config.api.baseUrl}/subscriptions/current`, { headers });
            return this.mapToSubscription(response.data);
        } catch (error: any) {
            // 404 means no subscription exists - this is not an error
            if (error.response?.status === 404) {
                return null;
            }
            throw parseApiError(error);
        }
    }

    /**
     * Create a new subscription with the specified plan and payment method
     */
    async createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${config.api.baseUrl}/subscriptions`,
                { 
                    plan_id: params.planId, 
                    payment_method_id: params.paymentMethodId 
                },
                { headers }
            );
            return this.mapToSubscription(response.data);
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Cancel the current subscription
     * The subscription will remain active until the end of the billing period
     */
    async cancelSubscription(): Promise<void> {
        try {
            const headers = await this.getHeaders();
            await axios.delete(`${config.api.baseUrl}/subscriptions/current`, { headers });
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Reactivate a canceled subscription before the period ends
     */
    async reactivateSubscription(): Promise<Subscription> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${config.api.baseUrl}/subscriptions/current/reactivate`,
                {},
                { headers }
            );
            return this.mapToSubscription(response.data);
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Update the subscription to a different plan
     */
    async updateSubscriptionPlan(planId: string): Promise<Subscription> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(
                `${config.api.baseUrl}/subscriptions/current`,
                { plan_id: planId },
                { headers }
            );
            return this.mapToSubscription(response.data);
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Get all payment methods for the current user
     */
    async getPaymentMethods(): Promise<PaymentMethod[]> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${config.api.baseUrl}/payment-methods`, { headers });
            return response.data.map(this.mapToPaymentMethod);
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Add a new payment method
     */
    async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(
                `${config.api.baseUrl}/payment-methods`,
                { payment_method_id: paymentMethodId },
                { headers }
            );
            return this.mapToPaymentMethod(response.data);
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Set a payment method as the default for subscriptions
     */
    async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
        try {
            const headers = await this.getHeaders();
            await axios.put(
                `${config.api.baseUrl}/payment-methods/${paymentMethodId}/default`,
                {},
                { headers }
            );
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Remove a payment method
     */
    async removePaymentMethod(paymentMethodId: string): Promise<void> {
        try {
            const headers = await this.getHeaders();
            await axios.delete(`${config.api.baseUrl}/payment-methods/${paymentMethodId}`, { headers });
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Get billing history (invoices)
     */
    async getInvoices(): Promise<Invoice[]> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${config.api.baseUrl}/invoices`, { headers });
            return response.data.map(this.mapToInvoice);
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Get a specific invoice by ID
     */
    async getInvoice(invoiceId: string): Promise<Invoice> {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${config.api.baseUrl}/invoices/${invoiceId}`, { headers });
            return this.mapToInvoice(response.data);
        } catch (error) {
            throw parseApiError(error);
        }
    }

    /**
     * Map API response to Subscription type
     */
    private mapToSubscription(data: any): Subscription {
        return {
            id: data.id,
            planId: data.plan_id || data.planId,
            planName: data.plan_name || data.planName,
            status: data.status,
            currentPeriodEnd: new Date(data.current_period_end || data.currentPeriodEnd),
            cancelAtPeriodEnd: data.cancel_at_period_end ?? data.cancelAtPeriodEnd ?? false,
            amount: data.amount,
            currency: data.currency,
        };
    }

    /**
     * Map API response to PaymentMethod type
     */
    private mapToPaymentMethod(data: any): PaymentMethod {
        return {
            id: data.id,
            brand: data.card?.brand || data.brand,
            last4: data.card?.last4 || data.last4,
            expMonth: data.card?.exp_month || data.expMonth,
            expYear: data.card?.exp_year || data.expYear,
        };
    }

    /**
     * Map API response to Invoice type
     */
    private mapToInvoice(data: any): Invoice {
        return {
            id: data.id,
            amount: data.amount_paid || data.amount,
            currency: data.currency,
            status: data.status,
            createdAt: new Date(data.created ? data.created * 1000 : data.createdAt),
            pdfUrl: data.invoice_pdf || data.pdfUrl,
        };
    }
}

export const subscriptionService = new SubscriptionService();
