import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, List, Spin, Badge } from 'antd';
import { CheckOutlined, CrownOutlined } from '@ant-design/icons';
import { subscriptionService } from '../../services/SubscriptionService';
import type { SubscriptionPlan, Subscription } from '../../types/subscription.types';

const { Title, Text } = Typography;

interface SubscriptionPlansProps {
    onSelectPlan: (plan: SubscriptionPlan) => void;
    currentSubscription?: Subscription | null;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
    onSelectPlan,
    currentSubscription,
}) => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        subscriptionService
            .getPlans()
            .then((data) => setPlans(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(price / 100);
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
                Choose Your Plan
            </Title>
            <Row gutter={24} justify="center">
                {plans.map((plan) => {
                    const isCurrentPlan = currentSubscription?.planId === plan.id;
                    return (
                        <Col key={plan.id} xs={24} sm={12} lg={8}>
                            <Badge.Ribbon
                                text="Current"
                                color="green"
                                style={{ display: isCurrentPlan ? 'block' : 'none' }}
                            >
                                <Card
                                    hoverable={!isCurrentPlan}
                                    style={{
                                        textAlign: 'center',
                                        borderColor: isCurrentPlan ? '#52c41a' : undefined,
                                        marginBottom: 16,
                                    }}
                                >
                                    <CrownOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 16 }} />
                                    <Title level={3}>{plan.name}</Title>
                                    <Text type="secondary">{plan.description}</Text>
                                    <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
                                        {formatPrice(plan.price, plan.currency)}
                                        <Text type="secondary" style={{ fontSize: 16 }}>
                                            /{plan.interval}
                                        </Text>
                                    </Title>
                                    <List
                                        dataSource={plan.features}
                                        renderItem={(feature: string) => (
                                            <List.Item style={{ justifyContent: 'center', border: 'none', padding: 8 }}>
                                                <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                                {feature}
                                            </List.Item>
                                        )}
                                        style={{ marginBottom: 24 }}
                                    />
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        onClick={() => onSelectPlan(plan)}
                                        disabled={isCurrentPlan}
                                    >
                                        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                                    </Button>
                                </Card>
                            </Badge.Ribbon>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};
