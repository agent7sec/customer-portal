import React, { useState, lazy, Suspense } from 'react';
import { Tabs, Space, notification, Spin } from 'antd';
import { useCreate } from '@refinedev/core';
import type { SubscriptionPlan } from '../../types/subscription.types';

// Lazy load Stripe Elements wrapper
const StripeElementsWrapper = lazy(() => import('./StripeElementsWrapper'));

// Lazy load heavy components
const SubscriptionPlans = lazy(() => 
  import('./SubscriptionPlans').then(module => ({ default: module.SubscriptionPlans }))
);
const SubscriptionManager = lazy(() => 
  import('./SubscriptionManager').then(module => ({ default: module.SubscriptionManager }))
);
const PaymentMethodManager = lazy(() => 
  import('./PaymentMethodManager').then(module => ({ default: module.PaymentMethodManager }))
);
const PaymentForm = lazy(() => 
  import('./PaymentForm').then(module => ({ default: module.PaymentForm }))
);

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
    <Spin size="large" />
  </div>
);

export const SubscriptionPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [activeTab, setActiveTab] = useState('plans');

    const { mutate: createSubscription } = useCreate();

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
    };

    const handlePaymentSuccess = () => {
        notification.success({
            message: 'Subscription Created',
            description: 'Your subscription has been successfully activated!',
        });
        setSelectedPlan(null);
        setActiveTab('manage');
    };

    const handlePaymentCancel = () => {
        setSelectedPlan(null);
    };

    const handleCancelSubscription = () => {
        notification.success({
            message: 'Subscription Canceled',
            description: 'Your subscription has been canceled. You will have access until the end of your billing period.',
        });
    };

    const handleReactivateSubscription = () => {
        notification.success({
            message: 'Subscription Reactivated',
            description: 'Your subscription has been reactivated successfully!',
        });
    };

    if (selectedPlan) {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <StripeElementsWrapper>
                    <PaymentForm
                        plan={selectedPlan}
                        onSuccess={handlePaymentSuccess}
                        onCancel={handlePaymentCancel}
                    />
                </StripeElementsWrapper>
            </Suspense>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'plans',
                        label: 'Available Plans',
                        children: (
                            <Suspense fallback={<LoadingFallback />}>
                                <StripeElementsWrapper>
                                    <SubscriptionPlans
                                        onSelectPlan={handleSelectPlan}
                                        currentSubscription={null}
                                    />
                                </StripeElementsWrapper>
                            </Suspense>
                        ),
                    },
                    {
                        key: 'manage',
                        label: 'Manage Subscription',
                        children: (
                            <Suspense fallback={<LoadingFallback />}>
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <SubscriptionManager
                                        onCancel={handleCancelSubscription}
                                        onReactivate={handleReactivateSubscription}
                                    />
                                </Space>
                            </Suspense>
                        ),
                    },
                    {
                        key: 'payment',
                        label: 'Payment Methods',
                        children: (
                            <Suspense fallback={<LoadingFallback />}>
                                <StripeElementsWrapper>
                                    <PaymentMethodManager />
                                </StripeElementsWrapper>
                            </Suspense>
                        ),
                    },
                ]}
            />
        </div>
    );
};
