/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TenantDashboard from './pages/TenantDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import ProviderDashboard from './pages/ProviderDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
