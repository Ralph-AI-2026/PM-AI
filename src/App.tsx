/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TenantDashboard from './pages/TenantDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import ProviderDashboard from './pages/ProviderDashboard';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setState(data.user ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#060D1A' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #1a2a3a', borderTopColor: '#00D4AA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#060D1A', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '4rem', margin: 0, fontWeight: 700 }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginTop: '0.5rem' }}>Page not found</p>
      <a href="/" style={{ marginTop: '1.5rem', color: '#00D4AA', textDecoration: 'none', fontSize: '1rem' }}>Back to home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/tenant/dashboard" element={<ProtectedRoute><TenantDashboard /></ProtectedRoute>} />
        <Route path="/landlord/dashboard" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/provider/dashboard" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
