import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Typography, Spin, Card, Descriptions, Button, Space, Tag, Modal, notification } from 'antd';
import { CalendarOutlined, CreditCardOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { getStripe } from '../config/stripe';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';
import { PaymentForm } from '../components/subscription/PaymentForm';
import { subscriptionService } from '../services/SubscriptionService';
import type { SubscriptionPlan, Subscription } from '../types/subscription.types';

const { Title, Text } = Typography;

export const SubscriptionPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(false);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const subscription = await subscriptionService.getCurrentSubscription();
            setCurrentSubscription(subscription);
        } catch (error) {
            console.error('Failed to load subscription', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        setSelectedPlan(null);
        loadSubscription();
        notification.success({
            title: 'Success',
            message: 'Your subscription has been activated!',
        });
    };

    const handleCancelSubscription = () => {
        Modal.confirm({
            title: 'Cancel Subscription?',
            icon: <ExclamationCircleFilled />,
            content: 'Your subscription will remain active until the end of the current billing period.',
            okText: 'Yes, Cancel',
            okType: 'danger',
            async onOk() {
                setCanceling(true);
                try {
                    await subscriptionService.cancelSubscription();
                    await loadSubscription();
                    notification.success({
                        title: 'Subscription Canceled',
                        message: 'Your subscription will not renew after the current period.',
                    });
                } catch (error: any) {
                    notification.error({
                        title: 'Error',
                        message: error.message || 'Failed to cancel subscription',
                    });
                } finally {
                    setCanceling(false);
                }
            },
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (selectedPlan) {
        return (
            <Elements stripe={getStripe()}>
                <PaymentForm
                    plan={selectedPlan}
                    onSuccess={handleSuccess}
                    onCancel={() => setSelectedPlan(null)}
                />
            </Elements>
        );
    }

    const getStatusTag = (status: string) => {
        const colors: Record<string, string> = {
            active: 'green',
            canceled: 'red',
            past_due: 'orange',
            trialing: 'blue',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
            <Title level={2}>Subscription</Title>

            {currentSubscription && (
                <Card style={{ marginBottom: 24 }}>
                    <Descriptions title="Current Subscription" column={2}>
                        <Descriptions.Item label="Plan">{currentSubscription.planName}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            {getStatusTag(currentSubscription.status)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: currentSubscription.currency.toUpperCase(),
                            }).format(currentSubscription.amount / 100)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Next Billing Date" span={2}>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                            {currentSubscription.cancelAtPeriodEnd && (
                                <Text type="warning" style={{ marginLeft: 8 }}>
                                    (Cancels at period end)
                                </Text>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                    <Space style={{ marginTop: 16 }}>
                        {!currentSubscription.cancelAtPeriodEnd && (
                            <Button danger onClick={handleCancelSubscription} loading={canceling}>
                                Cancel Subscription
                            </Button>
                        )}
                        <Button icon={<CreditCardOutlined />}>Manage Payment Methods</Button>
                    </Space>
                </Card>
            )}

            <SubscriptionPlans
                onSelectPlan={setSelectedPlan}
                currentSubscription={currentSubscription}
            />
        </div>
    );
};
