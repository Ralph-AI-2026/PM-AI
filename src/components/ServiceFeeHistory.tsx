import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ServiceFee } from '../types/payment';
import { DollarSign, Loader2 } from 'lucide-react';

interface ServiceFeeRow extends ServiceFee {
  maintenance_request?: {
    title: string;
  };
  estimate?: {
    contractor?: {
      name: string;
      company_name: string | null;
    };
  };
}

interface Props {
  organizationId: string;
}

const STATUS_STYLES: Record<string, string> = {
  charged: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
  credited: 'bg-blue-100 text-blue-700',
};

export default function ServiceFeeHistory({ organizationId }: Props) {
  const [fees, setFees] = useState<ServiceFeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFees();
  }, [organizationId]);

  const loadFees = async () => {
    try {
      const { data } = await supabase
        .from('service_fees')
        .select(`
          *,
          maintenance_request:maintenance_requests(title),
          estimate:estimates(contractor:contractors(name, company_name))
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      setFees(data || []);
    } catch (err) {
      console.error('Error loading service fees:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (fees.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <DollarSign className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p>No service fees yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Request</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Contractor</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Amount</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fees.map(fee => (
            <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-gray-600">
                {new Date(fee.charged_at || fee.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-gray-900 font-medium">
                {fee.maintenance_request?.title || '—'}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {fee.estimate?.contractor?.name || fee.estimate?.contractor?.company_name || '—'}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-gray-900">
                ${(fee.amount / 100).toFixed(2)} {fee.currency.toUpperCase()}
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${STATUS_STYLES[fee.status] || 'bg-gray-100 text-gray-600'}`}>
                  {fee.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
