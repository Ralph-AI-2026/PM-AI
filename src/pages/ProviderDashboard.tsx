import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  DollarSign,
  Briefcase,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';

interface Job {
  id: string;
  status: string;
  cost: number;
  scheduled_date: string | null;
  request: {
    title: string;
    description: string;
    category: string;
    priority: string;
    property: {
      address: string;
      city: string;
    };
  };
}

interface ProviderStats {
  total_earnings: number;
  total_jobs: number;
  rating: number;
  available: boolean;
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<ProviderStats>({
    total_earnings: 0,
    total_jobs: 0,
    rating: 0,
    available: true,
  });
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load provider stats
      const { data: providerData } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (providerData) {
        setStats({
          total_earnings: providerData.total_earnings || 0,
          total_jobs: providerData.total_jobs || 0,
          rating: providerData.rating || 0,
          available: providerData.available,
        });
      }

      // Load available jobs
      const { data: availableData } = await supabase
        .from('jobs')
        .select(`
          *,
          request:maintenance_requests(
            title,
            description,
            category,
            priority,
            property:properties(address, city)
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      setAvailableJobs(availableData || []);

      // Load active jobs
      const { data: activeData } = await supabase
        .from('jobs')
        .select(`
          *,
          request:maintenance_requests(
            title,
            description,
            category,
            priority,
            property:properties(address, city)
          )
        `)
        .eq('service_provider_id', user.id)
        .in('status', ['accepted', 'in_progress'])
        .order('scheduled_date', { ascending: true });

      setActiveJobs(activeData || []);

      // Load recent completed jobs
      const { data: completedData } = await supabase
        .from('jobs')
        .select(`
          *,
          request:maintenance_requests(
            title,
            description,
            category,
            priority,
            property:properties(address, city)
          )
        `)
        .eq('service_provider_id', user.id)
        .eq('status', 'completed')
        .order('completed_date', { ascending: false })
        .limit(5);

      setCompletedJobs(completedData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (jobId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('jobs')
        .update({
          status: 'accepted',
          service_provider_id: user.id,
        })
        .eq('id', jobId);

      loadDashboard();
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'completed') {
        updates.completed_date = new Date().toISOString();
      }

      await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId);

      loadDashboard();
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('service_providers')
        .update({ available: !stats.available })
        .eq('id', user.id);

      setStats({ ...stats, available: !stats.available });
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

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
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Service Provider Dashboard</h1>
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  stats.available
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stats.available ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.total_earnings.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+12% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Jobs Completed</span>
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_jobs}</p>
            <p className="text-sm text-gray-500 mt-2">Lifetime total</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Rating</span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.rating >= 4.5 ? 'Excellent!' : 'Keep it up'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Active Jobs</span>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeJobs.length}</p>
            <p className="text-sm text-gray-500 mt-2">In progress</p>
          </div>
        </div>

        {/* Available Jobs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Jobs</h2>
          {availableJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No jobs available right now</p>
              <p className="text-sm text-gray-500 mt-1">Check back soon for new opportunities</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {availableJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{job.request.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          job.request.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          job.request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          job.request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {job.request.priority}
                        </span>
                        <span className="text-sm text-gray-500">{job.request.category}</span>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-600">${job.cost}</span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{job.request.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{job.request.property.address}, {job.request.property.city}</span>
                  </div>

                  <button
                    onClick={() => acceptJob(job.id)}
                    className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                  >
                    Accept Job
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Jobs</h2>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{job.request.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {job.request.property.address}, {job.request.property.city}
                        </span>
                      </div>
                      {job.scheduled_date && (
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(job.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600 mb-3">${job.cost}</p>
                      {job.status === 'accepted' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'in_progress')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      {job.status === 'in_progress' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'completed')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Completions */}
        {completedJobs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Completed</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {completedJobs.map((job) => (
                  <div key={job.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{job.request.title}</h4>
                        <p className="text-sm text-gray-500">
                          {job.request.property.address}, {job.request.property.city}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">${job.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
