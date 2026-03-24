import React from 'react';
import { Card, Row, Col, Button, Typography, List, Spin, Badge } from 'antd';
import { useList } from '@refinedev/core';
import { CheckOutlined, CrownOutlined } from '@ant-design/icons';
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
    const { data, isLoading } = useList<SubscriptionPlan>({
        resource: 'plans',
        pagination: {
            current: 1,
            pageSize: 100,
        },
    });

    const plans = data?.data || [];

    if (isLoading) {
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
                    const cardContent = (
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
                    );

                    return (
                        <Col key={plan.id} xs={24} sm={12} lg={8}>
                            {isCurrentPlan ? (
                                <Badge.Ribbon text="Current" color="green">
                                    {cardContent}
                                </Badge.Ribbon>
                            ) : (
                                cardContent
                            )}
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};
