import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  Plus,
  MapPin,
  Image as ImageIcon,
  CreditCard,
  Receipt,
  Settings,
  UserPlus,
  Users,
  Copy,
  X
} from 'lucide-react';
import type { Estimate } from '../types/payment';
import EstimatesList from '../components/EstimatesList';
import ServiceFeeHistory from '../components/ServiceFeeHistory';
import PaymentMethodForm from '../components/PaymentMethodForm';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  photos: string[];
  estimated_cost: number | null;
  ai_analysis: string | null;
  created_at: string;
  tenant: {
    full_name: string;
    phone: string;
  };
  property: {
    id: string;
    address: string;
    city: string;
  };
}

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  property_type: string;
  units: number;
  invite_code: string | null;
}

interface PropertyTenant {
  id: string;
  property_id: string;
  tenant_id: string | null;
  invited_email: string | null;
  status: string;
  unit_number: string | null;
  profile?: {
    full_name: string;
    email: string;
  };
}

export default function LandlordDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'fees' | 'settings'>('requests');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [requestEstimates, setRequestEstimates] = useState<Record<string, Estimate[]>>({});

  // Tenant invite state
  const [invitePropertyId, setInvitePropertyId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUnit, setInviteUnit] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Tenants per property
  const [propertyTenants, setPropertyTenants] = useState<Record<string, PropertyTenant[]>>({});
  const [showTenantsFor, setShowTenantsFor] = useState<string | null>(null);

  // Copied code indicator
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Property form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [units, setUnits] = useState(1);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      setProperties(propertiesData || []);

      // Load maintenance requests
      const { data: requestsData } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant:profiles!maintenance_requests_tenant_id_fkey(full_name, phone),
          property:properties(id, address, city)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      setRequests(requestsData || []);

      // Load organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (orgData) {
        setOrganizationId(orgData.id);
      }

      // Load estimates for all requests
      if (requestsData && requestsData.length > 0) {
        const requestIds = requestsData.map(r => r.id);
        const { data: estimatesData } = await supabase
          .from('estimates')
          .select('*, contractor:contractors(name, company_name, trade)')
          .in('request_id', requestIds);

        if (estimatesData) {
          const grouped: Record<string, Estimate[]> = {};
          for (const est of estimatesData) {
            if (!grouped[est.request_id]) grouped[est.request_id] = [];
            grouped[est.request_id].push(est);
          }
          setRequestEstimates(grouped);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('properties')
        .insert({
          landlord_id: user.id,
          address,
          city,
          state,
          zip_code: zipCode,
          property_type: propertyType,
          units,
        });

      if (error) throw error;

      // Reset form
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setPropertyType('apartment');
      setUnits(1);
      setShowAddProperty(false);

      // Reload dashboard
      loadDashboard();
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property. Please try again.');
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, estimatedCost?: number) => {
    try {
      const updates: any = { status };
      if (estimatedCost !== undefined) {
        updates.estimated_cost = estimatedCost;
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      // If approved, create a job and notify matching contractors
      if (status === 'approved') {
        const { data: newJob } = await supabase
          .from('jobs')
          .insert({
            request_id: requestId,
            status: 'available',
            cost: estimatedCost || 0,
          })
          .select('id')
          .single();

        // Find the request details to pass to the notification
        const req = requests.find(r => r.id === requestId);
        if (newJob && req) {
          try {
            await fetch('/api/notifications/job-available', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                job_id: newJob.id,
                service_type: req.category,
                location: req.property.city,
                description: req.description,
                property_address: `${req.property.address}, ${req.property.city}`,
              }),
            });
          } catch (notifyErr) {
            // Non-fatal: job was created, notification is best-effort
            console.error('Failed to send job notifications:', notifyErr);
          }
        }
      }

      setSelectedRequest(null);
      loadDashboard();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    }
  };

  const loadTenantsForProperty = async (propertyId: string) => {
    const { data, error } = await supabase
      .from('property_tenants')
      .select(`*, profile:profiles(full_name, email)`)
      .eq('property_id', propertyId);

    if (!error && data) {
      setPropertyTenants(prev => ({ ...prev, [propertyId]: data }));
    }
  };

  const toggleShowTenants = async (propertyId: string) => {
    if (showTenantsFor === propertyId) {
      setShowTenantsFor(null);
    } else {
      setShowTenantsFor(propertyId);
      if (!propertyTenants[propertyId]) {
        await loadTenantsForProperty(propertyId);
      }
    }
  };

  const inviteTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePropertyId) return;
    setInviting(true);
    setInviteSuccess('');

    try {
      const { error } = await supabase
        .from('property_tenants')
        .insert({
          property_id: invitePropertyId,
          invited_email: inviteEmail.trim().toLowerCase(),
          unit_number: inviteUnit || null,
          status: 'invited',
          active: false,
        });

      if (error) throw error;

      setInviteSuccess(
        `Invite recorded for ${inviteEmail}. Share the property invite code so they can link their account.`
      );
      setInviteEmail('');
      setInviteUnit('');

      if (showTenantsFor === invitePropertyId) {
        await loadTenantsForProperty(invitePropertyId);
      }
    } catch (error: any) {
      console.error('Error inviting tenant:', error);
      alert(error.message || 'Failed to invite tenant. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const acceptEstimate = async (estimateId: string) => {
    const response = await fetch(`/api/estimates/${estimateId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: organizationId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to accept estimate');
    }

    loadDashboard();
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeRequests = requests.filter(r => ['approved', 'assigned', 'in_progress'].includes(r.status));
  const completedRequests = requests.filter(r => r.status === 'completed');
  const inviteProperty = invitePropertyId ? properties.find(p => p.id === invitePropertyId) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
            <button
              onClick={() => setShowAddProperty(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {([
              { key: 'requests', label: 'Requests', icon: AlertCircle },
              { key: 'fees', label: 'Service Fees', icon: Receipt },
              { key: 'settings', label: 'Settings', icon: Settings },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {activeTab === 'fees' && organizationId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Service Fee History</h2>
              <p className="text-sm text-gray-500 mt-1">All $35 service fees charged for accepted estimates</p>
            </div>
            <ServiceFeeHistory organizationId={organizationId} />
          </div>
        )}

        {activeTab === 'settings' && organizationId && (
          <div className="max-w-xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>
              <PaymentMethodForm organizationId={organizationId} />
            </div>
          </div>
        )}

        {activeTab === 'requests' && <>
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Properties</span>
              <Building className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Pending</span>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingRequests.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Active</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeRequests.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedRequests.length}</p>
          </div>
        </div>

        {/* Add Property Modal */}
        {showAddProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
              </div>

              <form onSubmit={addProperty} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="State"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Units
                    </label>
                    <input
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(parseInt(e.target.value))}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddProperty(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                  >
                    Add Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Tenant Modal */}
        {invitePropertyId && inviteProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Invite Tenant</h2>
                  <p className="text-sm text-gray-500 mt-1">{inviteProperty.address}, {inviteProperty.city}</p>
                </div>
                <button
                  onClick={() => { setInvitePropertyId(null); setInviteSuccess(''); setInviteEmail(''); setInviteUnit(''); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {inviteProperty.invite_code && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Property Invite Code</p>
                    <p className="text-xs text-blue-700 mb-3">
                      Share this code with your tenant. They enter it on their dashboard to link to this property.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold text-blue-800 tracking-widest">
                        {inviteProperty.invite_code}
                      </span>
                      <button
                        onClick={() => copyInviteCode(inviteProperty.invite_code!)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedCode === inviteProperty.invite_code ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm font-semibold text-gray-700 mb-3">Also record by email (optional):</p>

                {inviteSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
                    {inviteSuccess}
                  </div>
                )}

                <form onSubmit={inviteTenant}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="tenant@example.com"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number (optional)</label>
                    <input
                      type="text"
                      value={inviteUnit}
                      onChange={(e) => setInviteUnit(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="e.g. 2B"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setInvitePropertyId(null); setInviteSuccess(''); setInviteEmail(''); setInviteUnit(''); }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={inviting}
                      className="flex-1 px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                    >
                      {inviting ? 'Recording...' : 'Record Invite'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRequest.property.address}, {selectedRequest.property.city}
                </p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tenant Information</h3>
                  <p className="text-gray-600">{selectedRequest.tenant.full_name}</p>
                  <p className="text-gray-600">{selectedRequest.tenant.phone}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                    <p className="text-gray-600 capitalize">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Priority</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedRequest.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      selectedRequest.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      selectedRequest.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                </div>

                {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Photos</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedRequest.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.ai_analysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-blue-900 mb-1">AI Analysis</p>
                    <p className="text-sm text-blue-700">{selectedRequest.ai_analysis}</p>
                  </div>
                )}

                {requestEstimates[selectedRequest.id]?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Contractor Estimates</h3>
                    <EstimatesList
                      estimates={requestEstimates[selectedRequest.id]}
                      onAccept={acceptEstimate}
                      canAccept={['submitted', 'estimating', 'estimated'].includes(selectedRequest.status)}
                    />
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Cost
                    </label>
                    <input
                      type="number"
                      id="estimated-cost"
                      defaultValue={selectedRequest.estimated_cost || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="Enter estimated cost"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          const costInput = document.getElementById('estimated-cost') as HTMLInputElement;
                          const cost = parseFloat(costInput.value) || 0;
                          updateRequestStatus(selectedRequest.id, 'approved', cost);
                        }}
                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Approval</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {request.property.address}, {request.property.city}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          request.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {request.priority}
                        </span>
                        <span className="text-sm text-gray-500">{request.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Maintenance</h2>
            <div className="space-y-4">
              {activeRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {request.property.address}, {request.property.city}
                      </p>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {request.estimated_cost && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Cost</p>
                        <p className="text-xl font-bold text-green-600">${request.estimated_cost}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Properties</h2>
          {properties.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-600 mb-6">
                Add your first property to start managing maintenance requests.
              </p>
              <button
                onClick={() => setShowAddProperty(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add First Property
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{property.address}</h3>
                        <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 flex-wrap">
                          <span className="capitalize">{property.property_type}</span>
                          <span>{property.units} unit(s)</span>
                          {property.invite_code && (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                              Code: <strong>{property.invite_code}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleShowTenants(property.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          Tenants
                        </button>
                        <button
                          onClick={() => { setInvitePropertyId(property.id); setInviteSuccess(''); }}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          Invite Tenant
                        </button>
                      </div>
                    </div>
                  </div>

                  {showTenantsFor === property.id && (
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Tenants</h4>
                      {!propertyTenants[property.id] ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                      ) : propertyTenants[property.id].length === 0 ? (
                        <p className="text-sm text-gray-500">No tenants linked yet. Invite one using the button above.</p>
                      ) : (
                        <div className="space-y-2">
                          {propertyTenants[property.id].map((pt) => (
                            <div key={pt.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-200">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {pt.profile?.full_name || pt.invited_email || 'Unknown'}
                                </p>
                                {pt.profile?.email && <p className="text-xs text-gray-500">{pt.profile.email}</p>}
                                {!pt.profile && pt.invited_email && <p className="text-xs text-gray-500">{pt.invited_email}</p>}
                                {pt.unit_number && <p className="text-xs text-gray-400">Unit {pt.unit_number}</p>}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                pt.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {pt.status === 'active' ? 'Active' : 'Invited'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </>}
      </div>
    </div>
  );
}
