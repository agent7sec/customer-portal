# Phase 4: Subscription & Payment Specification

## Overview

Implement subscription management and payment processing using Stripe.

## Status: ⏳ NOT STARTED

---

## 4.1 TypeScript Interfaces

### src/types/subscription.types.ts

```typescript
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
```

---

## 4.2 Stripe Configuration

### src/config/stripe.ts

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { config } from './env';

export const getStripe = () => loadStripe(config.stripe.publishableKey);
```

---

## 4.3 Subscription Service

### src/services/SubscriptionService.ts

```typescript
import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';

class SubscriptionService {
  private async getHeaders() {
    const token = await auth0Service.getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }

  async getPlans() {
    const headers = await this.getHeaders();
    return axios.get(`${config.api.baseUrl}/plans`, { headers });
  }

  async getCurrentSubscription() {
    const headers = await this.getHeaders();
    return axios.get(`${config.api.baseUrl}/subscriptions/current`, { headers });
  }

  async createSubscription(planId: string, paymentMethodId: string) {
    const headers = await this.getHeaders();
    return axios.post(`${config.api.baseUrl}/subscriptions`, 
      { plan_id: planId, payment_method_id: paymentMethodId }, 
      { headers }
    );
  }

  async cancelSubscription() {
    const headers = await this.getHeaders();
    return axios.delete(`${config.api.baseUrl}/subscriptions/current`, { headers });
  }
}

export const subscriptionService = new SubscriptionService();
```

---

## 4.4 Subscription Plans Component

### src/components/subscription/SubscriptionPlans.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, List } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { subscriptionService } from '../../services/SubscriptionService';

const { Title } = Typography;

export const SubscriptionPlans: React.FC<{ onSelectPlan: (plan: any) => void }> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionService.getPlans()
      .then(res => setPlans(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Row gutter={24} justify="center">
      {plans.map((plan: any) => (
        <Col key={plan.id} xs={24} sm={12} lg={8}>
          <Card hoverable style={{ textAlign: 'center' }}>
            <Title level={3}>{plan.name}</Title>
            <Title level={2}>${plan.price / 100}/{plan.interval}</Title>
            <List
              dataSource={plan.features}
              renderItem={(f: string) => (
                <List.Item><CheckOutlined /> {f}</List.Item>
              )}
            />
            <Button type="primary" block onClick={() => onSelectPlan(plan)}>
              Select Plan
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
```

---

## 4.5 Payment Form with Stripe Elements

### src/components/subscription/PaymentForm.tsx

```typescript
import React, { useState } from 'react';
import { Card, Button, Alert } from 'antd';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { subscriptionService } from '../../services/SubscriptionService';

export const PaymentForm: React.FC<{ plan: any; onSuccess: () => void }> = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (pmError) throw new Error(pmError.message);

      await subscriptionService.createSubscription(plan.id, paymentMethod!.id);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={`Subscribe to ${plan.name}`} style={{ maxWidth: 500 }}>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <form onSubmit={handleSubmit}>
        <div style={{ padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, marginBottom: 16 }}>
          <CardElement />
        </div>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Subscribe - ${plan.price / 100}/{plan.interval}
        </Button>
      </form>
    </Card>
  );
};
```

---

## 4.6 Subscription Page

### src/routes/SubscriptionPage.tsx

```typescript
import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../config/stripe';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';
import { PaymentForm } from '../components/subscription/PaymentForm';

export const SubscriptionPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  if (selectedPlan) {
    return (
      <Elements stripe={getStripe()}>
        <PaymentForm plan={selectedPlan} onSuccess={() => setSelectedPlan(null)} />
      </Elements>
    );
  }

  return <SubscriptionPlans onSelectPlan={setSelectedPlan} />;
};
```

---

## Verification

```bash
npm test -- src/components/subscription/
npm run type-check
```
