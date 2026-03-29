import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
});

export const SERVICE_FEE_AMOUNT = parseInt(
  process.env.STRIPE_SERVICE_FEE_AMOUNT || '3500',
  10
);
export const SERVICE_FEE_CURRENCY = 'cad';
