import React, { useState } from 'react';
import { Card, Button, Alert, Typography, Space, Form, theme } from 'antd';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { LockOutlined, CreditCardOutlined } from '@ant-design/icons';
import { subscriptionService } from '../../services/SubscriptionService';
import type { SubscriptionPlan } from '../../types/subscription.types';

const { Title, Text } = Typography;
const { useToken } = theme;

interface PaymentFormProps {
    plan: SubscriptionPlan;
    onSuccess: () => void;
    onCancel: () => void;
}

/**
 * Custom Stripe CardElement wrapper that integrates with Ant Design Form
 */
const StripeCardInput: React.FC<{
    value?: any;
    onChange?: (value: any) => void;
    status?: 'error' | 'warning' | '';
}> = ({ onChange, status }) => {
    const { token } = useToken();
    const [cardError, setCardError] = useState<string | null>(null);

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: token.colorText,
                fontFamily: token.fontFamily,
                '::placeholder': {
                    color: token.colorTextPlaceholder,
                },
            },
            invalid: {
                color: token.colorError,
            },
        },
    };

    const handleCardChange = (event: any) => {
        setCardError(event.error ? event.error.message : null);
        if (onChange) {
            onChange(event.complete ? event : null);
        }
    };

    return (
        <div>
            <div
                style={{
                    padding: '11px',
                    border: `1px solid ${status === 'error' ? token.colorError : token.colorBorder}`,
                    borderRadius: token.borderRadius,
                    background: token.colorBgContainer,
                    transition: 'all 0.3s',
                }}
            >
                <CardElement options={cardElementOptions} onChange={handleCardChange} />
            </div>
            {cardError && (
                <div style={{ color: token.colorError, fontSize: '14px', marginTop: '4px' }}>
                    {cardError}
                </div>
            )}
        </div>
    );
};

export const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(price / 100);
    };

    const handleSubmit = async (values: any) => {
        if (!stripe || !elements) {
            setError('Stripe is not initialized. Please refresh the page.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            // Create payment method with Stripe
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

            // Create subscription via backend
            await subscriptionService.createSubscription({
                planId: plan.id,
                paymentMethodId: paymentMethod.id,
            });

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
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <CreditCardOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                        <Title level={3}>Subscribe to {plan.name}</Title>
                        <Text type="secondary">
                            {formatPrice(plan.price, plan.currency)}/{plan.interval}
                        </Text>
                    </div>

                    {error && (
                        <Alert type="error" message="Payment Error" description={error} showIcon closable onClose={() => setError(null)} />
                    )}

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="cardDetails"
                            label="Card Information"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.reject(new Error('Please enter your card details'));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <StripeCardInput />
                        </Form.Item>

                        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
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
                    </Form>

                    <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12 }}>
                        <LockOutlined /> Your payment is secured with 256-bit SSL encryption
                    </Text>
                </Space>
            </Card>
        </div>
    );
};
