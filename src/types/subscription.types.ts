export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    stripePriceId: string;
}

export interface Subscription {
    id: string;
    planId: string;
    planName: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    amount: number;
    currency: string;
}

export interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

export interface CreateSubscriptionParams {
    planId: string;
    paymentMethodId: string;
}

export interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    createdAt: Date;
    pdfUrl?: string;
}
