/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ClubAdminDashboard from './pages/ClubAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LaneCalendar from './components/LaneCalendar';
import ClubAdminEvents from './pages/ClubAdminEvents';
import ClubAdminFinancials from './pages/ClubAdminFinancials';
import ClubAdminWaiverSettings from './pages/ClubAdminWaiverSettings';
import ClubAdminMembers from './pages/ClubAdminMembers';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ClubAdminDashboard />} />

          <Route path="club-admin" element={<ClubAdminDashboard />} />
          <Route path="club-admin/calendar" element={<LaneCalendar isAdmin={true} />} />
          <Route path="club-admin/members" element={<ClubAdminMembers />} />
          <Route path="club-admin/events" element={<ClubAdminEvents />} />
          <Route path="club-admin/financials" element={<ClubAdminFinancials />} />
          <Route path="club-admin/waiver-settings" element={<ClubAdminWaiverSettings />} />

          <Route path="super-admin" element={<SuperAdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
