# HROP Deployment Guide

**Status:** Production-ready frontend complete
**Commit:** 89f3400
**Date:** March 18, 2026

---

## What's Built

### Complete Frontend Application

1. **Landing Page** (`src/pages/LandingPage.tsx`)
   - Professional hero section with clear value proposition
   - Three-column layout showing benefits for each user type
   - "How It Works" section with 3-step process
   - Call-to-action sections
   - Clean footer with branding

2. **Authentication System** (`src/pages/AuthPage.tsx`)
   - Sign in / Sign up flow
   - Role selection screen (Tenant, Landlord, Service Provider)
   - Full name, phone, email, password collection
   - Automatic profile creation in Supabase
   - Automatic redirect to role-specific dashboard

3. **Service Provider Dashboard** (`src/pages/ProviderDashboard.tsx`)
   - Uber-style job marketplace interface
   - Real-time earnings, jobs completed, rating display
   - Available jobs grid with priority badges
   - Accept job functionality
   - Active jobs tracking with status updates
   - Recently completed jobs list
   - Availability toggle

4. **Tenant Dashboard** (`src/pages/TenantDashboard.tsx`)
   - Submit maintenance request modal
   - Photo upload support
   - Category selection (plumbing, electrical, HVAC, general)
   - Priority selection (low, medium, high, urgent)
   - Request history with status tracking
   - Photo gallery for each request
   - AI analysis display (when available)

5. **Landlord Dashboard** (`src/pages/LandlordDashboard.tsx`)
   - Multi-property management
   - Add property modal
   - Pending requests requiring approval
   - Active maintenance tracking
   - Approve/reject workflow with cost estimation
   - Properties grid view
   - Stats overview (properties, pending, active, completed)

### Design System
- Professional blue/gray color scheme
- Clean, minimal interface
- Mobile-first responsive design
- Consistent typography and spacing
- Professional iconography (Lucide React)

### Database Schema
- Complete SQL schema in `supabase-schema.sql`
- 9 tables with proper relationships
- Row Level Security (RLS) policies
- Indexes for performance
- All fields needed for MVP

---

## What's Left (Backend Setup)

### 1. Supabase Setup (30 minutes)

**Create Project:**
1. Go to https://supabase.com
2. Create new project
3. Name: "hrop-production"
4. Choose region closest to users

**Run SQL Schema:**
1. Open Supabase SQL Editor
2. Copy entire contents of `supabase-schema.sql`
3. Execute
4. Verify all tables created

**Set Up Storage:**
1. Go to Storage section
2. Create bucket: `maintenance-photos`
3. Set to Public
4. Enable RLS policies:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'maintenance-photos');

   -- Allow public to view
   CREATE POLICY "Allow public to view" ON storage.objects
   FOR SELECT TO public
   USING (bucket_id = 'maintenance-photos');
   ```

**Get Credentials:**
1. Go to Settings > API
2. Copy Project URL
3. Copy anon/public key
4. Add to `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Vercel Deployment (15 minutes)

**Connect Repository:**
1. Go to https://vercel.com
2. Import Git Repository
3. Select the arc-booking-software repo
4. Framework: Vite
5. Root directory: `./`

**Environment Variables:**
Add in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Deploy:**
- Click Deploy
- Wait 2-3 minutes
- Test on preview URL

**Custom Domain (optional):**
- Add domain in Vercel settings
- Update DNS records as instructed

### 3. Test End-to-End (20 minutes)

**Create Test Accounts:**
1. Sign up as Landlord
   - Add a test property
2. Sign up as Tenant
   - Submit a maintenance request
3. Sign up as Service Provider
   - Accept the job

**Test Flow:**
- Tenant submits request
- Landlord sees in dashboard
- Landlord approves with cost estimate
- Service Provider sees available job
- Service Provider accepts
- Service Provider marks complete

---

## Next Steps (Optional Enhancements)

### Phase 2: AI Integration (DeepSeek)
- Cost estimation from photos
- Automatic categorization
- Smart job routing
- Preventative maintenance alerts

**Setup:**
1. Sign up at https://platform.deepseek.com
2. Get API key ($5 free credit)
3. Add to `.env`: `VITE_DEEPSEEK_API_KEY=your-key`
4. Implement in backend API routes

### Phase 3: Payments (Stripe Connect)
- Multi-party payment splits
- 15% platform fee to you
- 85% to service provider
- Automatic payouts

**Setup:**
1. Create Stripe account
2. Enable Stripe Connect
3. Add Express account onboarding for service providers
4. Implement payment flow

### Phase 4: Push Notifications
- Job available alerts for providers
- Status update alerts for tenants
- Approval needed alerts for landlords

**Setup:**
1. Firebase Cloud Messaging or OneSignal
2. Store push tokens in database
3. Send on job status changes

---

## File Structure

```
src/
├── pages/
│   ├── LandingPage.tsx       (Public homepage)
│   ├── AuthPage.tsx           (Sign in/up + role selection)
│   ├── TenantDashboard.tsx    (Submit & track requests)
│   ├── LandlordDashboard.tsx  (Manage properties & approve)
│   └── ProviderDashboard.tsx  (Accept jobs & track earnings)
├── lib/
│   └── supabase.ts            (Supabase client)
├── App.tsx                     (Routes)
└── index.css                   (Tailwind theme)

public/
├── manifest.json               (PWA config)
├── sw.js                       (Service worker)
└── icons/                      (App icons - replace with HROP logo)
```

---

## Important Notes

1. **Icons:** The `public/icon-192.png` and `public/icon-512.png` are placeholders. Replace with HROP branding.

2. **Storage Setup:** Don't forget to create the `maintenance-photos` bucket in Supabase Storage.

3. **RLS Policies:** The schema includes RLS policies. Test that users can only see their own data.

4. **Photo Uploads:** Currently using Supabase Storage. Make sure bucket is public for image display.

5. **Email Verification:** Supabase sends verification emails by default. You can disable in Settings > Authentication.

---

## Quick Deploy Commands

```bash
# Install dependencies
npm install

# Test locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Support & Troubleshooting

**If Supabase queries fail:**
- Check RLS policies
- Verify user is authenticated
- Check browser console for errors

**If images don't load:**
- Verify storage bucket is public
- Check CORS settings in Supabase

**If routing breaks:**
- Vercel needs `vercel.json` for SPA routing
- Create file:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

**Built by Ralph | March 18, 2026**

Ready to deploy. All frontend code is production-ready. Backend setup takes ~1 hour total.
