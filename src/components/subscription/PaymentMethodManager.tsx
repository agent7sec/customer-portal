import React, { useState } from 'react';
import { Card, List, Button, Modal, Space, Typography, Badge, Spin, Alert, Form } from 'antd';
import { useList, useUpdate, useDelete, useCreate } from '@refinedev/core';
import {
    CreditCardOutlined,
    DeleteOutlined,
    PlusOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { PaymentMethod } from '../../types/subscription.types';

const { Title, Text } = Typography;

export const PaymentMethodManager: React.FC = () => {
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stripe = useStripe();
    const elements = useElements();

    const { data, isLoading, refetch } = useList<PaymentMethod>({
        resource: 'payment-methods',
    });

    const { mutate: updatePaymentMethod } = useUpdate();
    const { mutate: deletePaymentMethod } = useDelete();
    const { mutate: createPaymentMethod } = useCreate();

    const paymentMethods = data?.data || [];

    const handleSetDefault = (paymentMethodId: string) => {
        updatePaymentMethod(
            {
                resource: 'payment-methods',
                id: paymentMethodId,
                values: { default: true },
            },
            {
                onSuccess: () => {
                    refetch();
                },
            }
        );
    };

    const handleDelete = (paymentMethodId: string) => {
        Modal.confirm({
            title: 'Remove Payment Method',
            content: 'Are you sure you want to remove this payment method?',
            okText: 'Remove',
            okButtonProps: { danger: true },
            onOk: () => {
                deletePaymentMethod(
                    {
                        resource: 'payment-methods',
                        id: paymentMethodId,
                    },
                    {
                        onSuccess: () => {
                            refetch();
                        },
                    }
                );
            },
        });
    };

    const handleAddPaymentMethod = async () => {
        if (!stripe || !elements) {
            setError('Stripe is not initialized. Please refresh the page.');
            return;
        }

        setIsAdding(true);
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

            createPaymentMethod(
                {
                    resource: 'payment-methods',
                    values: {
                        payment_method_id: paymentMethod.id,
                    },
                },
                {
                    onSuccess: () => {
                        setAddModalVisible(false);
                        cardElement.clear();
                        refetch();
                    },
                    onError: (error: any) => {
                        setError(error.message || 'Failed to add payment method');
                    },
                }
            );
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4}>Payment Methods</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setAddModalVisible(true)}
                    >
                        Add Payment Method
                    </Button>
                </div>

                {paymentMethods.length === 0 ? (
                    <Alert
                        type="info"
                        message="No Payment Methods"
                        description="Add a payment method to manage your subscription."
                        showIcon
                    />
                ) : (
                    <List
                        dataSource={paymentMethods}
                        renderItem={(method: PaymentMethod & { isDefault?: boolean }) => (
                            <List.Item
                                actions={[
                                    !method.isDefault && (
                                        <Button
                                            type="link"
                                            onClick={() => handleSetDefault(method.id)}
                                        >
                                            Set as Default
                                        </Button>
                                    ),
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(method.id)}
                                        disabled={method.isDefault}
                                    >
                                        Remove
                                    </Button>,
                                ].filter(Boolean)}
                            >
                                <List.Item.Meta
                                    avatar={<CreditCardOutlined style={{ fontSize: 24 }} />}
                                    title={
                                        <Space>
                                            <Text strong>
                                                {method.brand.toUpperCase()} •••• {method.last4}
                                            </Text>
                                            {method.isDefault && (
                                                <Badge
                                                    count={
                                                        <Space size={4}>
                                                            <CheckCircleOutlined />
                                                            <span>Default</span>
                                                        </Space>
                                                    }
                                                    style={{ backgroundColor: '#52c41a' }}
                                                />
                                            )}
                                        </Space>
                                    }
                                    description={`Expires ${method.expMonth}/${method.expYear}`}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Space>

            <Modal
                title="Add Payment Method"
                open={addModalVisible}
                onOk={handleAddPaymentMethod}
                onCancel={() => {
                    setAddModalVisible(false);
                    setError(null);
                }}
                okText="Add Payment Method"
                okButtonProps={{ loading: isAdding, disabled: !stripe }}
                cancelButtonProps={{ disabled: isAdding }}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {error && (
                        <Alert
                            type="error"
                            message="Error"
                            description={error}
                            showIcon
                            closable
                            onClose={() => setError(null)}
                        />
                    )}

                    <Form.Item label="Card Information">
                        <div
                            style={{
                                padding: '11px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px',
                            }}
                        >
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#000',
                                            '::placeholder': {
                                                color: '#bfbfbf',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </Form.Item>
                </Space>
            </Modal>
        </Card>
    );
};
