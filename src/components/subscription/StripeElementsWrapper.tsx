import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { Spin } from 'antd';

// Lazy initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

interface StripeElementsWrapperProps {
  children: React.ReactNode;
}

const StripeElementsWrapper: React.FC<StripeElementsWrapperProps> = ({ children }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStripePromise().then((stripeInstance) => {
      setStripe(stripeInstance);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <Elements stripe={stripe}>{children}</Elements>;
};

export default StripeElementsWrapper;
