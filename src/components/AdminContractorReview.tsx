import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  ArrowLeft,
  Search,
  Filter,
  Shield,
  Phone,
  Mail,
  MapPin,
  FileText,
  Users,
  Star,
  ChevronDown,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import type {
  ContractorApplication,
  ContractorDocument,
  ContractorReference,
  ApplicationStatus,
  TradeType,
} from '../types/contractor';
import { DOCUMENT_LABELS, ALL_TRADES } from '../types/contractor';

type ViewMode = 'list' | 'detail';

export default function AdminContractorReview() {
  const [applications, setApplications] = useState<ContractorApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<ContractorApplication | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [tradeFilter, setTradeFilter] = useState<TradeType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewAction, setReviewAction] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [statusFilter, tradeFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contractor_applications')
        .select('*, contractor_documents(*), contractor_references(*)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (tradeFilter !== 'all') {
        query = query.eq('primary_trade', tradeFilter);
      }

      const { data } = await query;
      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewApplication = (app: ContractorApplication) => {
    setSelectedApp(app);
    setViewMode('detail');
    setReviewAction(null);
    setReviewReason('');
  };

  const handleReviewAction = async (action: 'approved' | 'rejected' | 'suspended' | 'removed') => {
    if (!selectedApp) return;
    if ((action === 'rejected' || action === 'suspended') && !reviewReason) return;

    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updates: Record<string, string | null> = {
        status: action,
        reviewed_by: user?.email || null,
        reviewed_at: new Date().toISOString(),
      };

      if (action === 'rejected') {
        updates.rejection_reason = reviewReason;
      }
      if (action === 'suspended') {
        updates.suspension_reason = reviewReason;
      }

      const { error } = await supabase
        .from('contractor_applications')
        .update(updates)
        .eq('id', selectedApp.id);

      if (error) throw error;

      setSelectedApp({ ...selectedApp, status: action } as ContractorApplication);
      setReviewAction(null);
      setReviewReason('');
      loadApplications();
    } catch (err) {
      console.error('Error updating application:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const verifyDocument = async (docId: string, verified: boolean, notes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('contractor_documents')
        .update({
          verified,
          verified_by: user?.email || null,
          verified_at: new Date().toISOString(),
          verification_notes: notes || null,
        })
        .eq('id', docId);

      // Refresh selected application
      if (selectedApp) {
        const { data } = await supabase
          .from('contractor_applications')
          .select('*, contractor_documents(*), contractor_references(*)')
          .eq('id', selectedApp.id)
          .single();
        if (data) setSelectedApp(data);
      }
    } catch (err) {
      console.error('Error verifying document:', err);
    }
  };

  const logReferenceContact = async (refId: string, feedback: string, rating: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('contractor_references')
        .update({
          contacted: true,
          contacted_at: new Date().toISOString(),
          contacted_by: user?.email || null,
          feedback,
          rating,
        })
        .eq('id', refId);

      if (selectedApp) {
        const { data } = await supabase
          .from('contractor_applications')
          .select('*, contractor_documents(*), contractor_references(*)')
          .eq('id', selectedApp.id)
          .single();
        if (data) setSelectedApp(data);
      }
    } catch (err) {
      console.error('Error logging reference contact:', err);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.first_name.toLowerCase().includes(q) ||
      app.last_name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      (app.company_name && app.company_name.toLowerCase().includes(q))
    );
  });

  const statusBadge = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      submitted: 'bg-blue-500/20 text-blue-400',
      under_review: 'bg-purple-500/20 text-purple-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      suspended: 'bg-orange-500/20 text-orange-400',
      removed: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const inputClass = 'w-full bg-[#0a1929] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4AA] focus:ring-1 focus:ring-[#00D4AA] transition-colors text-sm';

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-[#060D1A] text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Contractor Applications</h1>
              <p className="text-gray-400 mt-1">{applications.length} applications</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className={`${inputClass} pl-10`}
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className={`${inputClass} w-auto`}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
                <option value="draft">Draft</option>
              </select>
              <select
                className={`${inputClass} w-auto`}
                value={tradeFilter}
                onChange={e => setTradeFilter(e.target.value as TradeType | 'all')}
              >
                <option value="all">All Trades</option>
                {ALL_TRADES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4AA]" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map(app => (
                <div
                  key={app.id}
                  className="bg-[#0D1F35] rounded-xl border border-white/8 p-5 flex items-center justify-between hover:border-white/15 transition-colors cursor-pointer"
                  onClick={() => viewApplication(app)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00D4AA]/10 flex items-center justify-center text-[#00D4AA] font-bold">
                      {app.first_name[0]}{app.last_name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{app.first_name} {app.last_name}</span>
                        {statusBadge(app.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="capitalize">{app.primary_trade}</span>
                        <span>{app.years_experience}y exp</span>
                        <span>{app.city}, {app.province}</span>
                        {app.company_name && <span>{app.company_name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(app.created_at).toLocaleDateString()}</p>
                      <p>{(app.documents || []).length} docs</p>
                    </div>
                    <Eye className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  if (!selectedApp) return null;

  return (
    <div className="min-h-screen bg-[#060D1A] text-white">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => { setViewMode('list'); setSelectedApp(null); }}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{selectedApp.first_name} {selectedApp.last_name}</h1>
              {statusBadge(selectedApp.status)}
            </div>
            <p className="text-gray-400 mt-1">{selectedApp.email}</p>
            {selectedApp.company_name && (
              <p className="text-gray-500 text-sm">{selectedApp.company_name}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {(selectedApp.status === 'submitted' || selectedApp.status === 'under_review') && (
              <>
                <button
                  onClick={() => handleReviewAction('approved')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => setReviewAction('rejected')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {selectedApp.status === 'approved' && (
              <button
                onClick={() => setReviewAction('suspended')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-semibold hover:bg-orange-500/30 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> Suspend
              </button>
            )}
            {(selectedApp.status === 'suspended' || selectedApp.status === 'approved') && (
              <button
                onClick={() => setReviewAction('removed')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
          </div>
        </div>

        {/* Review action panel */}
        {reviewAction && (
          <div className="bg-[#0D1F35] rounded-xl border border-white/8 p-6 mb-6">
            <h3 className="font-semibold mb-3">
              {reviewAction === 'rejected' ? 'Reject Application' :
               reviewAction === 'suspended' ? 'Suspend Contractor' :
               'Remove Contractor'}
            </h3>
            <textarea
              className={`${inputClass} h-24`}
              placeholder="Enter reason..."
              value={reviewReason}
              onChange={e => setReviewReason(e.target.value)}
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleReviewAction(reviewAction as 'rejected' | 'suspended' | 'removed')}
                disabled={!reviewReason || actionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => { setReviewAction(null); setReviewReason(''); }}
                className="px-4 py-2 border border-white/10 text-gray-400 rounded-lg text-sm hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal info */}
            <div className="bg-[#0D1F35] rounded-xl border border-white/8 p-6">
              <h2 className="font-semibold text-lg mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Phone:</span>
                  <span>{selectedApp.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Email:</span>
                  <span>{selectedApp.email}</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Address:</span>
                  <span>{selectedApp.address}, {selectedApp.city}, {selectedApp.province} {selectedApp.postal_code}</span>
                </div>
                {selectedApp.business_registration_number && (
                  <div>
                    <span className="text-gray-400">BRN:</span> <span>{selectedApp.business_registration_number}</span>
                  </div>
                )}
                {selectedApp.hst_number && (
                  <div>
                    <span className="text-gray-400">HST:</span> <span>{selectedApp.hst_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trade info */}
            <div className="bg-[#0D1F35] rounded-xl border border-white/8 p-6">
              <h2 className="font-semibold text-lg mb-4">Trade Information</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Primary Trade:</span>
                  <span className="capitalize ml-2">{selectedApp.primary_trade}</span>
                </div>
                <div>
                  <span className="text-gray-400">Experience:</span>
                  <span className="ml-2">{selectedApp.years_experience} years</span>
                </div>
                {selectedApp.secondary_trades && selectedApp.secondary_trades.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-gray-400">Secondary Trades:</span>
                    <span className="capitalize ml-2">{selectedApp.secondary_trades.join(', ')}</span>
                  </div>
                )}
                {selectedApp.licensed_trade && (
                  <>
                    <div>
                      <span className="text-gray-400">License #:</span>
                      <span className="ml-2">{selectedApp.license_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Body:</span>
                      <span className="ml-2">{selectedApp.licensing_body}</span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-gray-400">Radius:</span>
                  <span className="ml-2">{selectedApp.service_radius_km} km</span>
                </div>
                {selectedApp.service_cities && selectedApp.service_cities.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-gray-400">Cities:</span>
                    <span className="ml-2">{selectedApp.service_cities.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-[#0D1F35] rounded-xl border border-white/8 p-6">
              <h2 className="font-semibold text-lg mb-4">
                <FileText className="w-5 h-5 inline mr-2 text-gray-500" />
                Documents ({(selectedApp.documents || []).length})
              </h2>
              <div className="space-y-3">
                {(selectedApp.documents || []).map((doc: ContractorDocument) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    onVerify={verifyDocument}
                  />
                ))}
                {(selectedApp.documents || []).length === 0 && (
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column - references */}
          <div className="space-y-6">
            <div className="bg-[#0D1F35] rounded-xl border border-white/8 p-6">
              <h2 className="font-semibold text-lg mb-4">
                <Users className="w-5 h-5 inline mr-2 text-gray-500" />
                References ({(selectedApp.references || []).length})
              </h2>
              <div className="space-y-4">
                {(selectedApp.references || []).map((ref: ContractorReference) => (
                  <ReferenceRow
                    key={ref.id}
                    reference={ref}
                    onLogContact={logReferenceContact}
                  />
                ))}
                {(selectedApp.references || []).length === 0 && (
                  <p className="text-gray-500 text-sm">No references provided</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#0D1F35] rounded-xl border border-white/8 p-6">
              <h2 className="font-semibold text-lg mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  Applied: {new Date(selectedApp.created_at).toLocaleString()}
                </div>
                {selectedApp.reviewed_at && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className={`w-2 h-2 rounded-full ${selectedApp.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`} />
                    Reviewed: {new Date(selectedApp.reviewed_at).toLocaleString()}
                    {selectedApp.reviewed_by && <span>by {selectedApp.reviewed_by}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Document row sub-component
function DocumentRow({
  doc,
  onVerify,
}: {
  doc: ContractorDocument;
  onVerify: (id: string, verified: boolean, notes: string) => Promise<void>;
}) {
  const [showVerify, setShowVerify] = useState(false);
  const [notes, setNotes] = useState(doc.verification_notes || '');

  const inputClass = 'w-full bg-[#0a1929] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4AA] text-sm';

  return (
    <div className="border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {doc.verified ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-gray-600" />
          )}
          <span className="font-medium text-sm">{DOCUMENT_LABELS[doc.document_type]}</span>
        </div>
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00D4AA] text-xs flex items-center gap-1 hover:underline"
        >
          View <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <p className="text-xs text-gray-500">{doc.file_name}</p>
      {doc.expiry_date && (
        <p className="text-xs text-gray-500 mt-1">Expires: {new Date(doc.expiry_date).toLocaleDateString()}</p>
      )}
      {doc.verified && doc.verified_by && (
        <p className="text-xs text-green-400 mt-1">Verified by {doc.verified_by}</p>
      )}

      {!doc.verified && (
        <>
          {showVerify ? (
            <div className="mt-3 space-y-2">
              <textarea
                className={inputClass}
                placeholder="Verification notes (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => { await onVerify(doc.id, true, notes); setShowVerify(false); }}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded text-xs font-semibold hover:bg-green-500/30"
                >
                  Verify
                </button>
                <button
                  onClick={() => setShowVerify(false)}
                  className="px-3 py-1.5 border border-white/10 text-gray-400 rounded text-xs hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowVerify(true)}
              className="mt-2 text-xs text-[#00D4AA] hover:underline"
            >
              Review & Verify
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Reference row sub-component
function ReferenceRow({
  reference,
  onLogContact,
}: {
  reference: ContractorReference;
  onLogContact: (id: string, feedback: string, rating: number) => Promise<void>;
}) {
  const [showLog, setShowLog] = useState(false);
  const [feedback, setFeedback] = useState(reference.feedback || '');
  const [rating, setRating] = useState(reference.rating || 3);

  const inputClass = 'w-full bg-[#0a1929] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4AA] text-sm';

  return (
    <div className="border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        {reference.contacted ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <div className="w-4 h-4 rounded-full border border-gray-600" />
        )}
        <span className="font-medium text-sm">{reference.reference_name}</span>
      </div>
      <p className="text-xs text-gray-500 capitalize">{reference.relationship.replace('_', ' ')}</p>
      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{reference.reference_phone}</span>
        {reference.reference_email && (
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{reference.reference_email}</span>
        )}
      </div>

      {reference.contacted && reference.feedback && (
        <div className="mt-2 bg-[#0a1929] rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < (reference.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400">{reference.feedback}</p>
        </div>
      )}

      {!reference.contacted && (
        <>
          {showLog ? (
            <div className="mt-3 space-y-2">
              <div>
                <label className="text-xs text-gray-400">Rating</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setRating(r)}>
                      <Star className={`w-4 h-4 ${r <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className={inputClass}
                placeholder="Feedback from reference..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => { await onLogContact(reference.id, feedback, rating); setShowLog(false); }}
                  disabled={!feedback}
                  className="px-3 py-1.5 bg-[#00D4AA]/20 text-[#00D4AA] rounded text-xs font-semibold hover:bg-[#00D4AA]/30 disabled:opacity-50"
                >
                  Log Contact
                </button>
                <button
                  onClick={() => setShowLog(false)}
                  className="px-3 py-1.5 border border-white/10 text-gray-400 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLog(true)}
              className="mt-2 text-xs text-[#00D4AA] hover:underline"
            >
              Log Contact
            </button>
          )}
        </>
      )}
    </div>
  );
}
