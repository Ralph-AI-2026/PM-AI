import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe, SERVICE_FEE_AMOUNT, SERVICE_FEE_CURRENCY } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: estimateId } = req.query;

  if (!estimateId || typeof estimateId !== 'string') {
    return res.status(400).json({ error: 'Missing estimate ID' });
  }

  try {
    // Get the estimate with its request and organization
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('*, maintenance_requests(*, organizations(*))')
      .eq('id', estimateId)
      .single();

    if (estError || !estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    if (estimate.status !== 'pending') {
      return res.status(400).json({ error: 'Estimate is no longer pending' });
    }

    const request = estimate.maintenance_requests;
    if (!request) {
      return res.status(400).json({ error: 'Associated request not found' });
    }

    // Get organization from request's organization_id or landlord
    let org = request.organizations;

    // If no org linked, try to find by landlord_id
    if (!org && request.landlord_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', request.landlord_id)
        .single();

      if (profile) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('email', profile.email)
          .single();

        org = orgData;
      }
    }

    if (!org || !org.stripe_customer_id || !org.stripe_payment_method_id) {
      return res.status(400).json({
        error: 'Organization has no payment method on file. Please add a payment method first.',
      });
    }

    // Create PaymentIntent for $35 CAD service fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: SERVICE_FEE_AMOUNT,
      currency: SERVICE_FEE_CURRENCY,
      customer: org.stripe_customer_id,
      payment_method: org.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      metadata: {
        request_id: request.id,
        estimate_id: estimateId,
        organization_id: org.id,
        fee_type: 'service_fee',
      },
    });

    // Record in service_fees table
    const { error: feeError } = await supabase.from('service_fees').insert({
      organization_id: org.id,
      request_id: request.id,
      estimate_id: estimateId,
      amount: SERVICE_FEE_AMOUNT / 100,
      currency: SERVICE_FEE_CURRENCY,
      stripe_payment_intent_id: paymentIntent.id,
      status: paymentIntent.status === 'succeeded' ? 'charged' : 'pending',
      charged_at:
        paymentIntent.status === 'succeeded'
          ? new Date().toISOString()
          : null,
    });

    if (feeError) {
      console.error('Error recording service fee:', feeError);
    }

    // If immediate success, update statuses
    if (paymentIntent.status === 'succeeded') {
      await supabase
        .from('estimates')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', estimateId);

      // Decline other pending estimates
      await supabase
        .from('estimates')
        .update({ status: 'declined' })
        .eq('request_id', request.id)
        .neq('id', estimateId)
        .eq('status', 'pending');

      await supabase
        .from('maintenance_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', request.id);
    }

    return res.status(200).json({
      success: true,
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status,
      amount: SERVICE_FEE_AMOUNT / 100,
      currency: SERVICE_FEE_CURRENCY,
    });
  } catch (err: any) {
    console.error('Error accepting estimate:', err);

    // Handle Stripe card errors
    if (err.type === 'StripeCardError') {
      return res.status(402).json({
        error: 'Payment failed',
        message: err.message,
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
