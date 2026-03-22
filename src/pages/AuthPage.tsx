import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Wrench, Mail, Lock, User, Phone, Home, Shield, Users } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'role-select';
type UserRole = 'tenant' | 'landlord' | 'service_provider';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const navigateByRole = (role: string) => {
    if (role === 'tenant') navigate('/tenant');
    else if (role === 'landlord') navigate('/landlord');
    else if (role === 'service_provider') navigate('/provider');
    else navigate('/');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      if (profile) navigateByRole(profile.role);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) { setError('Please select a role'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone, role: selectedRole }
        }
      });
      if (error) throw error;
      if (data.user) navigateByRole(selectedRole);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 transition-all";
  const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' };

  const roles: { id: UserRole; label: string; desc: string; Icon: typeof Home }[] = [
    { id: 'tenant', label: 'Tenant', desc: 'Submit and track maintenance requests', Icon: Home },
    { id: 'landlord', label: 'Landlord', desc: 'Manage properties and approve work', Icon: Shield },
    { id: 'service_provider', label: 'Service Provider', desc: 'Find jobs and earn money', Icon: Users },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#060D1A' }}>
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#00D4AA' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: '#00D4AA' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)' }}>
              <Wrench className="w-7 h-7" style={{ color: '#00D4AA' }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">HROP</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Fix It Fast</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border" style={{ background: '#0D1F35', borderColor: 'rgba(255,255,255,0.08)' }}>

          {/* Role Select */}
          {mode === 'role-select' && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Choose your role</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Select how you'll use HROP</p>
              <div className="space-y-3 mb-6">
                {roles.map(({ id, label, desc, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedRole(id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border"
                    style={{
                      background: selectedRole === id ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)',
                      borderColor: selectedRole === id ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,170,0.15)' }}>
                      <Icon className="w-5 h-5" style={{ color: '#00D4AA' }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{label}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectedRole && setMode('signup')}
                disabled={!selectedRole}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: selectedRole ? '#00D4AA' : 'rgba(255,255,255,0.1)',
                  color: selectedRole ? '#060D1A' : 'rgba(255,255,255,0.3)',
                  cursor: selectedRole ? 'pointer' : 'not-allowed',
                }}
              >
                Continue
              </button>
              <p className="text-center text-sm mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Already have an account?{' '}
                <button onClick={() => setMode('signin')} style={{ color: '#00D4AA' }} className="hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* Sign In */}
          {mode === 'signin' && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Sign in to your HROP account</p>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className={inputClass + " pl-10"}
                    style={inputStyle}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className={inputClass + " pl-10"}
                    style={inputStyle}
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#00D4AA', color: '#060D1A', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <p className="text-center text-sm mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                No account?{' '}
                <button onClick={() => setMode('role-select')} style={{ color: '#00D4AA' }} className="hover:underline">
                  Create one
                </button>
              </p>
            </>
          )}

          {/* Sign Up */}
          {mode === 'signup' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode('role-select')} className="text-sm hover:underline" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  ← Back
                </button>
                <div>
                  <h2 className="text-xl font-bold text-white">Create account</h2>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: '#00D4AA' }}>
                    {selectedRole?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className={inputClass + " pl-10"}
                    style={inputStyle}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className={inputClass + " pl-10"}
                    style={inputStyle}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={inputClass + " pl-10"}
                    style={inputStyle}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className={inputClass + " pl-10"}
                    style={inputStyle}
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#00D4AA', color: '#060D1A', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-sm mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Already have an account?{' '}
                <button onClick={() => setMode('signin')} style={{ color: '#00D4AA' }} className="hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
