import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { stripe } from '../lib/stripe';
import { supabase } from '../lib/supabase';

export const config = {
  api: { bodyParser: false },
};

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event: Stripe.Event;

  try {
    const body = await buffer(req);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { request_id, estimate_id, fee_type } = paymentIntent.metadata;

        if (fee_type === 'service_fee' && request_id && estimate_id) {
          await supabase
            .from('service_fees')
            .update({
              status: 'charged',
              stripe_charge_id: paymentIntent.latest_charge as string,
              charged_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          await supabase
            .from('maintenance_requests')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', request_id);

          await supabase
            .from('estimates')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', estimate_id);

          // Decline other pending estimates for this request
          await supabase
            .from('estimates')
            .update({ status: 'declined' })
            .eq('request_id', request_id)
            .neq('id', estimate_id)
            .eq('status', 'pending');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { request_id } = paymentIntent.metadata;

        await supabase
          .from('service_fees')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (request_id) {
          // Revert request status so landlord can retry
          await supabase
            .from('maintenance_requests')
            .update({ status: 'estimated', updated_at: new Date().toISOString() })
            .eq('id', request_id);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase
          .from('organizations')
          .update({ updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.error(`Subscription payment failed for customer: ${customerId}`);
        // TODO: Send email notification to landlord
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from('organizations')
          .update({
            stripe_subscription_id: null,
            subscription_tier: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
