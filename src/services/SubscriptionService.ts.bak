import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import type {
    SubscriptionPlan,
    Subscription,
    PaymentMethod,
    Invoice,
} from '../types/subscription.types';

class SubscriptionService {
    private async getHeaders(): Promise<Record<string, string>> {
        const tokens = auth0Service.getTokens() || (await auth0Service.refreshSession());
        return {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    async getPlans(): Promise<SubscriptionPlan[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${config.api.baseUrl}/plans`, { headers });
        return response.data;
    }

    async getCurrentSubscription(): Promise<Subscription | null> {
        const headers = await this.getHeaders();
        try {
            const response = await axios.get(`${config.api.baseUrl}/subscriptions/current`, { headers });
            return this.mapToSubscription(response.data);
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async createSubscription(planId: string, paymentMethodId: string): Promise<Subscription> {
        const headers = await this.getHeaders();
        const response = await axios.post(
            `${config.api.baseUrl}/subscriptions`,
            { plan_id: planId, payment_method_id: paymentMethodId },
            { headers }
        );
        return this.mapToSubscription(response.data);
    }

    async cancelSubscription(): Promise<void> {
        const headers = await this.getHeaders();
        await axios.delete(`${config.api.baseUrl}/subscriptions/current`, { headers });
    }

    async reactivateSubscription(): Promise<Subscription> {
        const headers = await this.getHeaders();
        const response = await axios.post(
            `${config.api.baseUrl}/subscriptions/current/reactivate`,
            {},
            { headers }
        );
        return this.mapToSubscription(response.data);
    }

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${config.api.baseUrl}/payment-methods`, { headers });
        return response.data.map(this.mapToPaymentMethod);
    }

    async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
        const headers = await this.getHeaders();
        const response = await axios.post(
            `${config.api.baseUrl}/payment-methods`,
            { payment_method_id: paymentMethodId },
            { headers }
        );
        return this.mapToPaymentMethod(response.data);
    }

    async removePaymentMethod(paymentMethodId: string): Promise<void> {
        const headers = await this.getHeaders();
        await axios.delete(`${config.api.baseUrl}/payment-methods/${paymentMethodId}`, { headers });
    }

    async getInvoices(): Promise<Invoice[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${config.api.baseUrl}/invoices`, { headers });
        return response.data.map(this.mapToInvoice);
    }

    private mapToSubscription(data: any): Subscription {
        return {
            id: data.id,
            planId: data.plan_id || data.planId,
            planName: data.plan_name || data.planName,
            status: data.status,
            currentPeriodEnd: new Date(data.current_period_end),
            cancelAtPeriodEnd: data.cancel_at_period_end,
            amount: data.amount,
            currency: data.currency,
        };
    }

    private mapToPaymentMethod(data: any): PaymentMethod {
        return {
            id: data.id,
            brand: data.card?.brand || data.brand,
            last4: data.card?.last4 || data.last4,
            expMonth: data.card?.exp_month || data.expMonth,
            expYear: data.card?.exp_year || data.expYear,
        };
    }

    private mapToInvoice(data: any): Invoice {
        return {
            id: data.id,
            amount: data.amount_paid || data.amount,
            currency: data.currency,
            status: data.status,
            createdAt: new Date(data.created * 1000),
            pdfUrl: data.invoice_pdf,
        };
    }
}

export const subscriptionService = new SubscriptionService();
