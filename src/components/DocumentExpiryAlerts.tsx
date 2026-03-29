import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Clock, FileText, Calendar } from 'lucide-react';
import type { ContractorDocument } from '../types/contractor';
import { DOCUMENT_LABELS } from '../types/contractor';

interface ExpiringDoc extends ContractorDocument {
  days_until_expiry: number;
}

export default function DocumentExpiryAlerts() {
  const [expiringDocs, setExpiringDocs] = useState<ExpiringDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpiringDocs();
  }, []);

  const loadExpiringDocs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's application
      const { data: app } = await supabase
        .from('contractor_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (!app) return;

      // Get documents with expiry dates
      const { data: docs } = await supabase
        .from('contractor_documents')
        .select('*')
        .eq('application_id', app.id)
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true });

      if (!docs) return;

      const now = new Date();
      const alertDocs: ExpiringDoc[] = docs
        .map(doc => {
          const expiry = new Date(doc.expiry_date!);
          const diffMs = expiry.getTime() - now.getTime();
          const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          return { ...doc, days_until_expiry: days };
        })
        .filter(doc => doc.days_until_expiry <= 30);

      setExpiringDocs(alertDocs);
    } catch (err) {
      console.error('Error loading expiring docs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || expiringDocs.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-orange-400" />
        Document Expiry Alerts
      </h3>
      <div className="space-y-3">
        {expiringDocs.map(doc => {
          const isExpired = doc.days_until_expiry <= 0;
          const isUrgent = doc.days_until_expiry <= 7;

          return (
            <div
              key={doc.id}
              className={`rounded-lg border p-4 flex items-start gap-3 ${
                isExpired
                  ? 'bg-red-500/10 border-red-500/30'
                  : isUrgent
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className={`mt-0.5 ${
                isExpired ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-yellow-400'
              }`}>
                {isExpired ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-white text-sm">
                    {DOCUMENT_LABELS[doc.document_type]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span className={`text-xs ${
                    isExpired ? 'text-red-300' : isUrgent ? 'text-orange-300' : 'text-yellow-300'
                  }`}>
                    {isExpired
                      ? `Expired ${Math.abs(doc.days_until_expiry)} day${Math.abs(doc.days_until_expiry) !== 1 ? 's' : ''} ago`
                      : `Expires in ${doc.days_until_expiry} day${doc.days_until_expiry !== 1 ? 's' : ''}`}
                    {' '}({new Date(doc.expiry_date!).toLocaleDateString()})
                  </span>
                </div>
                {isExpired && (
                  <p className="text-xs text-red-300 mt-2">
                    Your account may be suspended. Upload a renewed document to resolve this.
                  </p>
                )}
              </div>
              <a
                href="/contractor/onboarding"
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap ${
                  isExpired
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                } transition-colors`}
              >
                Update
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
