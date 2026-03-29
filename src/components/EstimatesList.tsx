import { useState } from 'react';
import type { Estimate } from '../types/payment';
import { CheckCircle, Clock, DollarSign, Calendar, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  estimates: Estimate[];
  onAccept: (estimateId: string) => Promise<void>;
  canAccept?: boolean;
}

export default function EstimatesList({ estimates, onAccept, canAccept = true }: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleAccept = async (estimateId: string) => {
    setAcceptingId(estimateId);
    setError('');
    try {
      await onAccept(estimateId);
      setSuccessId(estimateId);
      setConfirmingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to accept estimate');
    } finally {
      setAcceptingId(null);
    }
  };

  if (estimates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No estimates yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {estimates.map(estimate => (
        <div
          key={estimate.id}
          className={`border rounded-lg p-5 ${
            estimate.status === 'accepted' || successId === estimate.id
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900">
                {estimate.contractor?.name || estimate.contractor?.company_name || 'Contractor'}
              </p>
              {estimate.contractor?.trade && (
                <p className="text-sm text-gray-500 capitalize">{estimate.contractor.trade}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${(estimate.amount / 100).toFixed(2)}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                estimate.status === 'accepted' || successId === estimate.id
                  ? 'bg-green-100 text-green-700'
                  : estimate.status === 'declined'
                  ? 'bg-red-100 text-red-700'
                  : estimate.status === 'expired'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {successId === estimate.id ? 'Accepted' : estimate.status}
              </span>
            </div>
          </div>

          {estimate.description && (
            <p className="text-sm text-gray-600 mb-3">{estimate.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
            {estimate.estimated_duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {estimate.estimated_duration}
              </span>
            )}
            {estimate.available_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Available {new Date(estimate.available_date).toLocaleDateString()}
              </span>
            )}
          </div>

          {canAccept && estimate.status === 'pending' && successId !== estimate.id && (
            <>
              {confirmingId === estimate.id ? (
                <div className="mt-3 border border-yellow-300 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">Confirm acceptance</p>
                      <p className="text-sm text-yellow-700">
                        This will charge a <strong>$35 service fee</strong> to your card on file.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmingId(null)}
                      disabled={!!acceptingId}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAccept(estimate.id)}
                      disabled={!!acceptingId}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {acceptingId === estimate.id && <Loader2 className="w-4 h-4 animate-spin" />}
                      {acceptingId === estimate.id ? 'Processing...' : 'Confirm & Pay $35'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingId(estimate.id)}
                  className="mt-2 w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Estimate
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
