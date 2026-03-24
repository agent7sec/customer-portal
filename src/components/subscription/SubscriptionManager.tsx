import React, { useState } from 'react';
import { Card, Descriptions, Badge, Button, Modal, Space, Typography, Alert, Spin } from 'antd';
import { useShow, useDelete } from '@refinedev/core';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Subscription } from '../../types/subscription.types';

const { Title, Text } = Typography;

interface SubscriptionManagerProps {
    subscriptionId?: string;
    onCancel?: () => void;
    onReactivate?: () => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
    subscriptionId,
    onCancel,
    onReactivate,
}) => {
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    
    const { queryResult } = useShow<Subscription>({
        resource: 'subscriptions',
        id: subscriptionId || 'current',
        queryOptions: {
            enabled: !!subscriptionId || true,
        },
    });

    const { mutate: cancelSubscription, isLoading: isCanceling } = useDelete();

    const subscription = queryResult?.data?.data;
    const isLoading = queryResult?.isLoading;
    const error = queryResult?.error;

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(price / 100);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: Subscription['status']) => {
        const statusConfig = {
            active: { color: 'success', text: 'Active' },
            canceled: { color: 'default', text: 'Canceled' },
            past_due: { color: 'error', text: 'Past Due' },
            trialing: { color: 'processing', text: 'Trial' },
        };

        const config = statusConfig[status] || { color: 'default', text: status };
        return <Badge status={config.color as any} text={config.text} />;
    };

    const handleCancelConfirm = () => {
        if (!subscription) return;

        cancelSubscription(
            {
                resource: 'subscriptions',
                id: subscription.id,
            },
            {
                onSuccess: () => {
                    setCancelModalVisible(false);
                    onCancel?.();
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <Alert
                type="info"
                message="No Active Subscription"
                description="You don't have an active subscription. Choose a plan to get started."
                showIcon
            />
        );
    }

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={4}>Current Subscription</Title>
                    {subscription.cancelAtPeriodEnd && (
                        <Alert
                            type="warning"
                            message="Subscription Ending"
                            description={`Your subscription will end on ${formatDate(subscription.currentPeriodEnd)}. You can reactivate it before this date.`}
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    )}
                </div>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Plan">
                        <Text strong>{subscription.planName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        {getStatusBadge(subscription.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Amount">
                        <Text strong>
                            {formatPrice(subscription.amount, subscription.currency)}
                        </Text>
                        <Text type="secondary"> / month</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Next Billing Date">
                        {formatDate(subscription.currentPeriodEnd)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Billing Amount">
                        <Text strong>
                            {formatPrice(subscription.amount, subscription.currency)}
                        </Text>
                    </Descriptions.Item>
                </Descriptions>

                <Space>
                    {subscription.cancelAtPeriodEnd ? (
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={onReactivate}
                        >
                            Reactivate Subscription
                        </Button>
                    ) : (
                        <Button
                            danger
                            onClick={() => setCancelModalVisible(true)}
                            disabled={subscription.status === 'canceled'}
                        >
                            Cancel Subscription
                        </Button>
                    )}
                </Space>
            </Space>

            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                        <span>Cancel Subscription</span>
                    </Space>
                }
                open={cancelModalVisible}
                onOk={handleCancelConfirm}
                onCancel={() => setCancelModalVisible(false)}
                okText="Yes, Cancel Subscription"
                cancelText="Keep Subscription"
                okButtonProps={{ danger: true, loading: isCanceling }}
                cancelButtonProps={{ disabled: isCanceling }}
            >
                <Space direction="vertical" size="middle">
                    <Text>
                        Are you sure you want to cancel your subscription? You will continue to have
                        access until the end of your current billing period.
                    </Text>
                    <Alert
                        type="info"
                        message={`Your subscription will remain active until ${formatDate(subscription.currentPeriodEnd)}`}
                        showIcon
                    />
                </Space>
            </Modal>
        </Card>
    );
};
