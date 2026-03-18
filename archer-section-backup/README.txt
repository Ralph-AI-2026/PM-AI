ARCHER (MEMBER) SECTION - TEMPORARILY REMOVED FROM PLATFORM
=============================================================

This folder contains all the archer/member-facing code that was removed
from the active platform. To re-enable, restore these files to their
original locations and re-add the routes in App.tsx and Layout.tsx.

Files:
  - MemberDashboard.tsx      → src/pages/MemberDashboard.tsx
  - MemberEvents.tsx          → src/pages/MemberEvents.tsx
  - MembershipPurchase.tsx    → src/pages/MembershipPurchase.tsx
  - BookingCalendar.tsx       → src/components/BookingCalendar.tsx
  - WaiverForm.tsx            → src/components/WaiverForm.tsx

Routes to restore in App.tsx:
  <Route index element={<MemberDashboard />} />
  <Route path="member" element={<MemberDashboard />} />
  <Route path="member/calendar" element={<BookingCalendar />} />
  <Route path="member/waiver" element={<WaiverForm />} />
  <Route path="member/purchase-membership" element={<MembershipPurchase />} />
  <Route path="member/events" element={<MemberEvents />} />

Sidebar role to restore in Layout.tsx:
  { key: "member", label: "ARCHER", icon: Crosshair, path: "/member" }
