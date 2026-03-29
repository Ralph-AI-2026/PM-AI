import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  User,
  Wrench,
  FolderOpen,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import type {
  ContractorApplication,
  ContractorDocument,
  ContractorReference,
  TradeType,
  DocumentType,
  ReferenceRelationship,
} from '../types/contractor';
import {
  ALL_TRADES,
  LICENSED_TRADES,
  LICENSED_TRADE_DOCS,
  GENERAL_TRADE_DOCS,
  DOCUMENT_LABELS,
  ONTARIO_CITIES,
  LICENSING_BODIES,
} from '../types/contractor';

const STEPS = [
  { label: 'Personal Info', icon: User },
  { label: 'Trade Info', icon: Wrench },
  { label: 'Documents', icon: FolderOpen },
  { label: 'References', icon: Users },
  { label: 'Review & Submit', icon: ClipboardCheck },
];

interface ReferenceForm {
  reference_name: string;
  reference_email: string;
  reference_phone: string;
  relationship: ReferenceRelationship;
}

const emptyReference: ReferenceForm = {
  reference_name: '',
  reference_email: '',
  reference_phone: '',
  relationship: 'past_client',
};

export default function ContractorOnboardingWizard() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ContractorDocument[]>([]);
  const [references, setReferences] = useState<ReferenceForm[]>([
    { ...emptyReference },
    { ...emptyReference },
  ]);
  const [savedReferences, setSavedReferences] = useState<ContractorReference[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    business_registration_number: '',
    hst_number: '',
    address: '',
    city: '',
    province: 'ON',
    postal_code: '',
    primary_trade: '' as TradeType | '',
    secondary_trades: [] as TradeType[],
    years_experience: 0,
    licensed_trade: false,
    license_number: '',
    licensing_body: '',
    service_radius_km: 50,
    service_cities: [] as string[],
  });

  // Load existing application on mount
  useEffect(() => {
    loadExistingApplication();
  }, []);

  const loadExistingApplication = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: app } = await supabase
      .from('contractor_applications')
      .select('*, contractor_documents(*), contractor_references(*)')
      .eq('user_id', user.id)
      .in('status', ['draft', 'submitted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (app) {
      setApplicationId(app.id);
      setForm({
        first_name: app.first_name || '',
        last_name: app.last_name || '',
        email: app.email || '',
        phone: app.phone || '',
        company_name: app.company_name || '',
        business_registration_number: app.business_registration_number || '',
        hst_number: app.hst_number || '',
        address: app.address || '',
        city: app.city || '',
        province: app.province || 'ON',
        postal_code: app.postal_code || '',
        primary_trade: (app.primary_trade as TradeType) || '',
        secondary_trades: (app.secondary_trades as TradeType[]) || [],
        years_experience: app.years_experience || 0,
        licensed_trade: app.licensed_trade || false,
        license_number: app.license_number || '',
        licensing_body: app.licensing_body || '',
        service_radius_km: app.service_radius_km || 50,
        service_cities: app.service_cities || [],
      });
      setDocuments(app.contractor_documents || []);
      if (app.contractor_references && app.contractor_references.length > 0) {
        setSavedReferences(app.contractor_references);
        setReferences(
          app.contractor_references.map((r: ContractorReference) => ({
            reference_name: r.reference_name,
            reference_email: r.reference_email || '',
            reference_phone: r.reference_phone,
            relationship: r.relationship as ReferenceRelationship,
          }))
        );
      }
    }
  };

  const saveApplication = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        user_id: user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        company_name: form.company_name || null,
        business_registration_number: form.business_registration_number || null,
        hst_number: form.hst_number || null,
        address: form.address,
        city: form.city,
        province: form.province,
        postal_code: form.postal_code,
        primary_trade: form.primary_trade || 'general',
        secondary_trades: form.secondary_trades,
        years_experience: form.years_experience,
        licensed_trade: form.licensed_trade,
        license_number: form.license_number || null,
        licensing_body: form.licensing_body || null,
        service_radius_km: form.service_radius_km,
        service_cities: form.service_cities,
        status: 'draft' as const,
      };

      if (applicationId) {
        const { error: err } = await supabase
          .from('contractor_applications')
          .update(payload)
          .eq('id', applicationId);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase
          .from('contractor_applications')
          .insert(payload)
          .select('id')
          .single();
        if (err) throw err;
        if (data) setApplicationId(data.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save application');
    } finally {
      setSaving(false);
    }
  }, [applicationId, form]);

  const handleNext = async () => {
    setError(null);
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    if (step === 3 && !validateStep4()) return;

    if (step <= 1) {
      await saveApplication();
    }
    if (step === 3) {
      await saveReferences();
    }
    setStep(step + 1);
  };

  const validateStep1 = (): boolean => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.address || !form.city || !form.postal_code) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!form.primary_trade) {
      setError('Please select a primary trade');
      return false;
    }
    if (form.years_experience < 1) {
      setError('Please enter your years of experience');
      return false;
    }
    if (form.licensed_trade && (!form.license_number || !form.licensing_body)) {
      setError('Please enter your license number and licensing body');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    const validRefs = references.filter(r => r.reference_name && r.reference_phone);
    if (validRefs.length < 2) {
      setError('Please provide at least 2 references with name and phone number');
      return false;
    }
    return true;
  };

  const getRequiredDocs = (): DocumentType[] => {
    if (!form.primary_trade) return [];
    return LICENSED_TRADES.includes(form.primary_trade as TradeType)
      ? LICENSED_TRADE_DOCS
      : GENERAL_TRADE_DOCS;
  };

  const isDocUploaded = (docType: DocumentType): boolean => {
    return documents.some(d => d.document_type === docType);
  };

  const handleFileUpload = async (docType: DocumentType, file: File) => {
    if (!applicationId) {
      setError('Please complete step 1 first');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are accepted');
      return;
    }

    setUploadingDoc(docType);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${docType}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('contractor-documents')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('contractor-documents')
        .getPublicUrl(path);

      // Remove old doc of same type if exists
      const existing = documents.find(d => d.document_type === docType);
      if (existing) {
        await supabase.from('contractor_documents').delete().eq('id', existing.id);
      }

      const { data: docData, error: docErr } = await supabase
        .from('contractor_documents')
        .insert({
          application_id: applicationId,
          document_type: docType,
          file_url: urlData.publicUrl,
          file_name: file.name,
        })
        .select()
        .single();

      if (docErr) throw docErr;
      if (docData) {
        setDocuments(prev => [...prev.filter(d => d.document_type !== docType), docData]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeDocument = async (docId: string) => {
    await supabase.from('contractor_documents').delete().eq('id', docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const saveReferences = async () => {
    if (!applicationId) return;

    // Delete existing references
    if (savedReferences.length > 0) {
      await supabase
        .from('contractor_references')
        .delete()
        .eq('application_id', applicationId);
    }

    const validRefs = references.filter(r => r.reference_name && r.reference_phone);
    if (validRefs.length === 0) return;

    const { data, error: err } = await supabase
      .from('contractor_references')
      .insert(
        validRefs.map(r => ({
          application_id: applicationId,
          reference_name: r.reference_name,
          reference_email: r.reference_email || null,
          reference_phone: r.reference_phone,
          relationship: r.relationship,
        }))
      )
      .select();

    if (!err && data) {
      setSavedReferences(data);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!confirmAccurate || !confirmTerms) {
      setError('Please confirm both checkboxes before submitting');
      return;
    }

    const requiredDocs = getRequiredDocs();
    const missingDocs = requiredDocs.filter(d => !isDocUploaded(d));
    if (missingDocs.length > 0) {
      setError(`Missing required documents: ${missingDocs.map(d => DOCUMENT_LABELS[d]).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await supabase
        .from('contractor_applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (err) throw err;
      window.location.href = '/provider/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string | number | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = 'w-full bg-[#0a1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4AA] focus:ring-1 focus:ring-[#00D4AA] transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="min-h-screen bg-[#060D1A] text-white">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Contractor Onboarding</h1>
        <p className="text-gray-400 mb-8">Complete your application to start receiving job requests on HROP.</p>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isComplete ? 'bg-[#00D4AA] border-[#00D4AA]' :
                    isActive ? 'border-[#00D4AA] text-[#00D4AA]' :
                    'border-gray-600 text-gray-600'
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5 text-[#060D1A]" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 whitespace-nowrap ${isActive ? 'text-[#00D4AA]' : isComplete ? 'text-gray-300' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mt-[-1rem] ${isComplete ? 'bg-[#00D4AA]' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Step content */}
        <div className="bg-[#0D1F35] rounded-xl border border-white/8 p-8">
          {/* Step 1: Personal Info */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Personal & Business Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input className={inputClass} value={form.first_name} onChange={e => updateField('first_name', e.target.value)} placeholder="John" />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input className={inputClass} value={form.last_name} onChange={e => updateField('last_name', e.target.value)} placeholder="Smith" />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input className={inputClass} type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="john@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input className={inputClass} type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="(416) 555-0123" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input className={inputClass} value={form.company_name} onChange={e => updateField('company_name', e.target.value)} placeholder="Optional for sole proprietors" />
                </div>
                <div>
                  <label className={labelClass}>Business Registration Number</label>
                  <input className={inputClass} value={form.business_registration_number} onChange={e => updateField('business_registration_number', e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className={labelClass}>HST Number</label>
                <input className={inputClass} value={form.hst_number} onChange={e => updateField('hst_number', e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label className={labelClass}>Street Address *</label>
                <input className={inputClass} value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="123 Main Street" />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>City *</label>
                  <input className={inputClass} value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="Toronto" />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <input className={inputClass} value={form.province} onChange={e => updateField('province', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Postal Code *</label>
                  <input className={inputClass} value={form.postal_code} onChange={e => updateField('postal_code', e.target.value)} placeholder="M5V 2T6" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Trade Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Trade Information</h2>
              <div>
                <label className={labelClass}>Primary Trade *</label>
                <select
                  className={inputClass}
                  value={form.primary_trade}
                  onChange={e => updateField('primary_trade', e.target.value)}
                >
                  <option value="">Select your primary trade</option>
                  {ALL_TRADES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Secondary Trades</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TRADES.filter(t => t.value !== form.primary_trade).map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        const trades = form.secondary_trades.includes(t.value)
                          ? form.secondary_trades.filter(x => x !== t.value)
                          : [...form.secondary_trades, t.value];
                        updateField('secondary_trades', trades);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        form.secondary_trades.includes(t.value)
                          ? 'bg-[#00D4AA]/20 border-[#00D4AA] text-[#00D4AA]'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Years of Experience *</label>
                <input className={inputClass} type="number" min={1} max={50} value={form.years_experience || ''} onChange={e => updateField('years_experience', parseInt(e.target.value) || 0)} placeholder="5" />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="licensed"
                  checked={form.licensed_trade}
                  onChange={e => updateField('licensed_trade', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-[#0a1929] text-[#00D4AA] focus:ring-[#00D4AA]"
                />
                <label htmlFor="licensed" className="text-gray-300">I hold a licensed trade certification</label>
              </div>
              {form.licensed_trade && (
                <div className="grid md:grid-cols-2 gap-6 pl-8 border-l-2 border-[#00D4AA]/30">
                  <div>
                    <label className={labelClass}>License Number *</label>
                    <input className={inputClass} value={form.license_number} onChange={e => updateField('license_number', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Licensing Body *</label>
                    <select className={inputClass} value={form.licensing_body} onChange={e => updateField('licensing_body', e.target.value)}>
                      <option value="">Select licensing body</option>
                      {LICENSING_BODIES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className={labelClass}>Service Radius: {form.service_radius_km} km</label>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={10}
                  value={form.service_radius_km}
                  onChange={e => updateField('service_radius_km', parseInt(e.target.value))}
                  className="w-full accent-[#00D4AA]"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10 km</span>
                  <span>200 km</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Service Cities</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {ONTARIO_CITIES.map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        const cities = form.service_cities.includes(city)
                          ? form.service_cities.filter(c => c !== city)
                          : [...form.service_cities, city];
                        updateField('service_cities', cities);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        form.service_cities.includes(city)
                          ? 'bg-[#00D4AA]/20 border-[#00D4AA] text-[#00D4AA]'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-2">Document Upload</h2>
              <p className="text-gray-400 text-sm mb-6">Upload required documents. Accepted formats: PDF, JPG, PNG (max 10MB each).</p>

              {getRequiredDocs().map(docType => {
                const doc = documents.find(d => d.document_type === docType);
                const isUploading = uploadingDoc === docType;
                return (
                  <div key={docType} className="border border-white/10 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {doc ? (
                          <CheckCircle className="w-5 h-5 text-[#00D4AA]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                        )}
                        <div>
                          <p className="font-medium text-white">{DOCUMENT_LABELS[docType]}</p>
                          <p className="text-xs text-red-400">Required</p>
                        </div>
                      </div>
                      {doc && (
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {doc ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400 bg-[#0a1929] rounded-lg px-4 py-2">
                        <FileText className="w-4 h-4" />
                        <span>{doc.file_name}</span>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-6 cursor-pointer transition-colors ${
                        isUploading ? 'border-[#00D4AA] bg-[#00D4AA]/5' : 'border-gray-600 hover:border-[#00D4AA]'
                      }`}>
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4AA]" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-500 mb-2" />
                            <span className="text-sm text-gray-400">Drop file here or click to upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(docType, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}

                    {(docType === 'liability_insurance' || docType === 'wsib_clearance') && doc && (
                      <div className="mt-3">
                        <label className="text-xs text-gray-400">Expiry Date *</label>
                        <input
                          type="date"
                          className={`${inputClass} mt-1`}
                          value={doc.expiry_date || ''}
                          onChange={async (e) => {
                            await supabase
                              .from('contractor_documents')
                              .update({ expiry_date: e.target.value })
                              .eq('id', doc.id);
                            setDocuments(prev => prev.map(d =>
                              d.id === doc.id ? { ...d, expiry_date: e.target.value } : d
                            ));
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Optional documents */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Optional Documents</h3>
                {(['business_registration', 'drivers_license', 'reference_letter'] as DocumentType[])
                  .filter(d => !getRequiredDocs().includes(d))
                  .map(docType => {
                    const doc = documents.find(d => d.document_type === docType);
                    return (
                      <div key={docType} className="border border-white/10 rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{DOCUMENT_LABELS[docType]}</span>
                          {doc ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{doc.file_name}</span>
                              <button onClick={() => removeDocument(doc.id)} className="text-gray-500 hover:text-red-400">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="text-sm text-[#00D4AA] cursor-pointer hover:underline">
                              Upload
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(docType, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Step 4: References */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-2">References</h2>
              <p className="text-gray-400 text-sm mb-6">Provide at least 2 professional references. We may contact them to verify your work quality.</p>

              {references.map((ref, i) => (
                <div key={i} className="border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-300">Reference {i + 1}{i < 2 ? ' *' : ''}</h3>
                    {i >= 2 && (
                      <button
                        onClick={() => setReferences(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input
                        className={inputClass}
                        value={ref.reference_name}
                        onChange={e => {
                          const updated = [...references];
                          updated[i] = { ...updated[i], reference_name: e.target.value };
                          setReferences(updated);
                        }}
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone *</label>
                      <input
                        className={inputClass}
                        type="tel"
                        value={ref.reference_phone}
                        onChange={e => {
                          const updated = [...references];
                          updated[i] = { ...updated[i], reference_phone: e.target.value };
                          setReferences(updated);
                        }}
                        placeholder="(416) 555-0123"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        className={inputClass}
                        type="email"
                        value={ref.reference_email}
                        onChange={e => {
                          const updated = [...references];
                          updated[i] = { ...updated[i], reference_email: e.target.value };
                          setReferences(updated);
                        }}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Relationship *</label>
                      <select
                        className={inputClass}
                        value={ref.relationship}
                        onChange={e => {
                          const updated = [...references];
                          updated[i] = { ...updated[i], relationship: e.target.value as ReferenceRelationship };
                          setReferences(updated);
                        }}
                      >
                        <option value="past_client">Past Client</option>
                        <option value="business_partner">Business Partner</option>
                        <option value="supplier">Supplier</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setReferences(prev => [...prev, { ...emptyReference }])}
                className="flex items-center gap-2 text-[#00D4AA] text-sm hover:underline"
              >
                <Plus className="w-4 h-4" /> Add another reference
              </button>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Review & Submit</h2>

              {/* Personal info summary */}
              <div className="border border-white/10 rounded-lg p-5">
                <h3 className="font-medium text-[#00D4AA] mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="text-white">{form.first_name} {form.last_name}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="text-white">{form.email}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="text-white">{form.phone}</span></div>
                  {form.company_name && <div><span className="text-gray-500">Company:</span> <span className="text-white">{form.company_name}</span></div>}
                  <div className="md:col-span-2"><span className="text-gray-500">Address:</span> <span className="text-white">{form.address}, {form.city}, {form.province} {form.postal_code}</span></div>
                </div>
              </div>

              {/* Trade info summary */}
              <div className="border border-white/10 rounded-lg p-5">
                <h3 className="font-medium text-[#00D4AA] mb-3">Trade Information</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Primary Trade:</span> <span className="text-white capitalize">{form.primary_trade}</span></div>
                  <div><span className="text-gray-500">Experience:</span> <span className="text-white">{form.years_experience} years</span></div>
                  {form.secondary_trades.length > 0 && (
                    <div className="md:col-span-2"><span className="text-gray-500">Secondary:</span> <span className="text-white capitalize">{form.secondary_trades.join(', ')}</span></div>
                  )}
                  {form.licensed_trade && (
                    <div><span className="text-gray-500">License:</span> <span className="text-white">{form.license_number} ({form.licensing_body})</span></div>
                  )}
                  <div><span className="text-gray-500">Service Radius:</span> <span className="text-white">{form.service_radius_km} km</span></div>
                </div>
              </div>

              {/* Documents checklist */}
              <div className="border border-white/10 rounded-lg p-5">
                <h3 className="font-medium text-[#00D4AA] mb-3">Documents</h3>
                <div className="space-y-2">
                  {getRequiredDocs().map(docType => (
                    <div key={docType} className="flex items-center gap-2 text-sm">
                      {isDocUploaded(docType) ? (
                        <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={isDocUploaded(docType) ? 'text-gray-300' : 'text-red-400'}>
                        {DOCUMENT_LABELS[docType]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* References summary */}
              <div className="border border-white/10 rounded-lg p-5">
                <h3 className="font-medium text-[#00D4AA] mb-3">References ({references.filter(r => r.reference_name).length})</h3>
                <div className="space-y-2 text-sm">
                  {references.filter(r => r.reference_name).map((ref, i) => (
                    <div key={i} className="text-gray-300">
                      {ref.reference_name} - {ref.reference_phone} ({ref.relationship.replace('_', ' ')})
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmations */}
              <div className="space-y-4 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmAccurate}
                    onChange={e => setConfirmAccurate(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 bg-[#0a1929] text-[#00D4AA] focus:ring-[#00D4AA] mt-0.5"
                  />
                  <span className="text-sm text-gray-300">I confirm all information provided is accurate and truthful.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmTerms}
                    onChange={e => setConfirmTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 bg-[#0a1929] text-[#00D4AA] focus:ring-[#00D4AA] mt-0.5"
                  />
                  <span className="text-sm text-gray-300">I agree to HROP's Contractor Terms of Service.</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => { setError(null); setStep(step - 1); }}
            disabled={step === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-[#060D1A] rounded-lg font-semibold hover:bg-[#00B899] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !confirmAccurate || !confirmTerms}
              className="flex items-center gap-2 px-8 py-3 bg-[#00D4AA] text-[#060D1A] rounded-lg font-semibold hover:bg-[#00B899] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
