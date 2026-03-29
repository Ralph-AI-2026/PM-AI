import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Shield,
  ArrowRight,
  FileText,
} from 'lucide-react';
import type { ApplicationStatus } from '../types/contractor';

interface ApplicationInfo {
  id: string;
  status: ApplicationStatus;
  rejection_reason: string | null;
  suspension_reason: string | null;
  created_at: string;
}

export default function ContractorVerificationStatus() {
  const [application, setApplication] = useState<ApplicationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNoApplication, setHasNoApplication] = useState(false);

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('contractor_applications')
        .select('id, status, rejection_reason, suspension_reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setApplication(data);
      } else {
        setHasNoApplication(true);
      }
    } catch (err) {
      console.error('Error loading application:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  // Don't show widget if already approved
  if (application?.status === 'approved') return null;

  const statusConfig: Record<string, {
    icon: typeof CheckCircle;
    title: string;
    message: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = {
    draft: {
      icon: FileText,
      title: 'Complete Your Application',
      message: 'Finish your onboarding application to start receiving job requests.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    submitted: {
      icon: Clock,
      title: 'Application Under Review',
      message: 'Your application has been submitted and is under review. This typically takes 1-2 business days.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    under_review: {
      icon: Shield,
      title: 'Verifying Your Documents',
      message: "We're currently verifying your documents and references. You'll be notified once the review is complete.",
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    rejected: {
      icon: XCircle,
      title: 'Application Not Approved',
      message: 'Unfortunately, your application was not approved.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    suspended: {
      icon: AlertTriangle,
      title: 'Account Suspended',
      message: 'Your contractor account has been temporarily suspended.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    removed: {
      icon: XCircle,
      title: 'Account Removed',
      message: 'Your contractor account has been permanently removed. Contact support for more information.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  };

  const status = hasNoApplication ? 'draft' : (application?.status || 'draft');
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-6 mb-8 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${config.color}`}>{config.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{config.message}</p>

          {application?.status === 'rejected' && application.rejection_reason && (
            <div className="mt-3 bg-red-500/10 rounded-lg p-3">
              <p className="text-sm text-red-300">
                <span className="font-medium">Reason:</span> {application.rejection_reason}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                If you believe this is an error, please contact support.
              </p>
            </div>
          )}

          {application?.status === 'suspended' && application.suspension_reason && (
            <div className="mt-3 bg-orange-500/10 rounded-lg p-3">
              <p className="text-sm text-orange-300">
                <span className="font-medium">Reason:</span> {application.suspension_reason}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                To resolve this, update your expired documents or contact support.
              </p>
            </div>
          )}

          {(hasNoApplication || status === 'draft') && (
            <a
              href="/contractor/onboarding"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#00D4AA] text-[#060D1A] rounded-lg font-semibold text-sm hover:bg-[#00B899] transition-colors"
            >
              {hasNoApplication ? 'Start Application' : 'Continue Application'}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}

          {application?.status === 'suspended' && (
            <a
              href="/contractor/onboarding"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors"
            >
              Update Documents
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
