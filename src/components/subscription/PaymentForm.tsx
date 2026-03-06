import React, { useState } from 'react';
import { Card, Button, Alert, Typography, Space } from 'antd';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { LockOutlined, CreditCardOutlined } from '@ant-design/icons';
import { subscriptionService } from '../../services/SubscriptionService';
import type { SubscriptionPlan } from '../../types/subscription.types';

const { Title, Text } = Typography;

interface PaymentFormProps {
    plan: SubscriptionPlan;
    onSuccess: () => void;
    onCancel: () => void;
}

const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    },
};

export const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(price / 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (pmError) {
                throw new Error(pmError.message);
            }

            if (!paymentMethod) {
                throw new Error('Failed to create payment method');
            }

            await subscriptionService.createSubscription(plan.id, paymentMethod.id);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'An error occurred during payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
            <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <CreditCardOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                        <Title level={3}>Subscribe to {plan.name}</Title>
                        <Text type="secondary">
                            {formatPrice(plan.price, plan.currency)}/{plan.interval}
                        </Text>
                    </div>

                    {error && (
                        <Alert type="error" message="Payment Error" description={error} showIcon closable />
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 24 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Card Information
                            </Text>
                            <div
                                style={{
                                    padding: 12,
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 6,
                                    background: '#fafafa',
                                }}
                            >
                                <CardElement options={cardElementOptions} />
                            </div>
                        </div>

                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                                disabled={!stripe}
                                icon={<LockOutlined />}
                            >
                                Subscribe - {formatPrice(plan.price, plan.currency)}/{plan.interval}
                            </Button>
                            <Button block size="large" onClick={onCancel} disabled={loading}>
                                Back to Plans
                            </Button>
                        </Space>
                    </form>

                    <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12 }}>
                        <LockOutlined /> Your payment is secured with 256-bit SSL encryption
                    </Text>
                </Space>
            </Card>
        </div>
    );
};
