import { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';

interface PaymentMethod {
  brand: string;
  last4: string;
}

interface CardFormProps {
  organizationId: string;
  currentCard: PaymentMethod | null;
  onUpdated: () => void;
}

function CardForm({ organizationId, currentCard, onUpdated }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(!currentCard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) throw new Error(stripeError.message);

      // Save payment method via API
      const response = await fetch('/api/organizations/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          payment_method_id: paymentMethod!.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save payment method');
      }

      setSuccess(true);
      setShowForm(false);
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {currentCard && !showForm && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900 capitalize">{currentCard.brand} ending in {currentCard.last4}</p>
              <p className="text-sm text-gray-500">Current card on file</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Update
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          <CheckCircle className="w-4 h-4" />
          Card saved successfully
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}>
          <div className="border border-gray-300 rounded-lg p-4 mb-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    '::placeholder': { color: '#9ca3af' },
                  },
                },
              }}
            />
          </div>
          <div className="flex gap-3">
            {currentCard && (
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !stripe}
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : currentCard ? 'Update Card' : 'Save Card'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface Props {
  organizationId: string;
}

export default function PaymentMethodForm({ organizationId }: Props) {
  const [currentCard, setCurrentCard] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCard = async () => {
    try {
      const response = await fetch(`/api/organizations/payment-method?organization_id=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.card) {
          setCurrentCard(data.card);
        }
      }
    } catch (err) {
      console.error('Error loading card:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Payment processing is not configured</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CardForm organizationId={organizationId} currentCard={currentCard} onUpdated={loadCard} />
    </Elements>
  );
}
