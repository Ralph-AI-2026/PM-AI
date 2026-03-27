# HROP Codebase Audit — 2026-03-27

## Bugs Fixed

1. **Missing `@types/react` and `@types/react-dom`** — TypeScript could not resolve `React.FormEvent` / `React.ChangeEvent` in AuthPage, TenantDashboard, LandlordDashboard. Installed the missing devDependencies.

2. **tsconfig.json not excluding backup directories** — `archer-section-backup/` and `old-archery-code/` caused spurious TS errors about missing modules. Added `exclude` array to tsconfig.

3. **Auth navigation routes broken** — `navigateByRole()` in AuthPage.tsx navigated to `/tenant`, `/landlord`, `/provider` — but the actual routes in App.tsx are `/tenant/dashboard`, `/landlord/dashboard`, `/provider/dashboard`. Users would hit a blank page after sign-in/sign-up. Fixed to include `/dashboard` suffix.

4. **PWA theme-color mismatch** — index.html and manifest.json both had `theme-color: #1e40af` (blue) and `background_color: #ffffff` (white), but the app uses a dark theme (`#060D1A`). Fixed both to `#060D1A`.

5. **PWA icon references broken** — index.html and manifest.json referenced `icon-192.png` and `icon-512.png`, but only `icon-192.svg` exists in `/public`. Updated all references to use the SVG file.

6. **TypeScript type error in TenantDashboard** — `propertyTenants.map(pt => pt.property)` produced a nested array type that didn't match `Property[]`. Added a cast to fix the type mismatch from Supabase's inferred join types.

## Items for Josh

1. **Supabase env vars** — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` fall back to placeholder values. Set these in Vercel environment settings for the live site.

2. **Stripe secret key** — `STRIPE_SECRET_KEY` is required by server.ts but not set. The server-side API routes (onboard, checkout, bookings, events) will all 500 without it. If server.ts is not used in production (Vercel is SPA-only), these routes are dead code and can be removed.

3. **server.ts contains archery/club API routes** — Routes for lanes, bookings, events, memberships, waivers, and financials are all from the old archery project (ARC). These are not relevant to HROP property maintenance. Recommend removing or replacing with HROP-specific API routes (maintenance requests, property management, provider matching).

4. **`useWaiverConfig` hook is dead code** — `src/hooks/useWaiverConfig.ts` references archery clubs, waiver configs, and facility types. It's not imported anywhere in the active app. Safe to delete.

5. **No auth guard on dashboard routes** — `/tenant/dashboard`, `/landlord/dashboard`, and `/provider/dashboard` are accessible without authentication. Anyone can navigate directly to these URLs. Add route guards that check `supabase.auth.getUser()` and redirect to `/auth` if not logged in.

6. **No 404 / catch-all route** — Navigating to any undefined path shows a blank page. Add a catch-all `<Route path="*">` that redirects to `/` or shows a 404 page.

7. **Service worker (`sw.js`)** — Registered in main.tsx but needs to be verified as functional. Check that it caches the right assets for offline PWA support.

8. **PWA icons** — Only a single SVG icon exists. For full PWA compatibility across devices, generate PNG icons at 192x192 and 512x512 from the SVG and update manifest.json accordingly.

9. **No Supabase database schema deployed** — `supabase-schema.sql` exists in the repo but the dashboards depend on tables (`properties`, `maintenance_requests`, `profiles`, `jobs`, `service_providers`, `property_tenants`) being created in Supabase. Ensure the schema is applied to the live Supabase project.
