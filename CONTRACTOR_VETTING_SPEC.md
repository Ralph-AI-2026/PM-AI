# HROP Contractor Vetting & Onboarding Spec

## Overview
Every contractor on HROP must be verified before they can receive job requests or submit estimates. This protects landlords, tenants, and HROP from liability.

## Database Schema

### contractor_applications
```sql
CREATE TABLE contractor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Personal / Business Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  business_registration_number TEXT,
  hst_number TEXT,
  
  -- Address
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'ON',
  postal_code TEXT NOT NULL,
  
  -- Trades
  primary_trade TEXT NOT NULL, -- plumbing, electrical, hvac, general, painting, carpentry, locksmith, appliance, roofing, landscaping
  secondary_trades TEXT[], -- additional trades
  years_experience INTEGER NOT NULL,
  licensed_trade BOOLEAN DEFAULT false,
  license_number TEXT,
  licensing_body TEXT, -- Ontario College of Trades, TSSA, ESA, etc.
  
  -- Service Area
  service_radius_km INTEGER DEFAULT 50,
  service_cities TEXT[], -- cities they serve
  
  -- Status
  status TEXT CHECK (status IN (
    'draft',              -- started but not submitted
    'submitted',          -- all required docs uploaded, awaiting review
    'under_review',       -- admin is reviewing
    'approved',           -- passed vetting, contractor is active
    'rejected',           -- failed vetting
    'suspended',          -- temporarily suspended (expired docs, complaints)
    'removed'             -- permanently removed
  )) DEFAULT 'draft',
  
  rejection_reason TEXT,
  suspension_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### contractor_documents
```sql
CREATE TABLE contractor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES contractor_applications(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id),
  
  document_type TEXT CHECK (document_type IN (
    'liability_insurance',    -- General liability certificate ($2M min)
    'wsib_clearance',         -- WSIB clearance certificate
    'trade_license',          -- Trade-specific license
    'business_registration',  -- Ontario business registration
    'criminal_record_check',  -- Police background check
    'drivers_license',        -- Photo ID verification
    'reference_letter'        -- Client reference letters
  )) NOT NULL,
  
  file_url TEXT NOT NULL,          -- Supabase storage URL
  file_name TEXT NOT NULL,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  
  -- Expiry tracking
  expiry_date DATE,                -- When this document expires
  expiry_alert_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### contractor_references
```sql
CREATE TABLE contractor_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES contractor_applications(id) ON DELETE CASCADE,
  
  reference_name TEXT NOT NULL,
  reference_email TEXT,
  reference_phone TEXT NOT NULL,
  relationship TEXT NOT NULL,        -- 'past_client', 'business_partner', 'supplier', 'other'
  
  -- Admin follow-up
  contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMPTZ,
  contacted_by TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Update existing contractors table
```sql
-- Add vetting columns to existing contractors table
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES contractor_applications(id);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS vetting_status TEXT DEFAULT 'pending';
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS insurance_coverage_amount NUMERIC(12,2);
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS wsib_account_number TEXT;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS background_check_date DATE;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS next_review_date DATE;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS suspension_count INTEGER DEFAULT 0;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS complaint_count INTEGER DEFAULT 0;
```

## Required Documents by Trade Type

### Licensed Trades (plumbing, electrical, HVAC, gas fitting)
- [x] General liability insurance ($2M min) -- REQUIRED
- [x] WSIB clearance certificate -- REQUIRED
- [x] Trade license from governing body -- REQUIRED
- [x] Criminal record check -- REQUIRED
- [x] 2 references -- REQUIRED
- [ ] Business registration -- RECOMMENDED

### General Trades (painting, carpentry, general maintenance, landscaping, cleaning)
- [x] General liability insurance ($2M min) -- REQUIRED
- [x] WSIB clearance OR independent operator declaration -- REQUIRED
- [x] Criminal record check -- REQUIRED
- [x] 2 references -- REQUIRED
- [ ] Trade license -- NOT REQUIRED
- [ ] Business registration -- RECOMMENDED

## Onboarding Flow (React Components)

### 1. ContractorOnboardingWizard (multi-step form)
```
Step 1: Personal & Business Info
  - First name, last name, email, phone
  - Company name (optional for sole proprietors)
  - Business registration number (optional)
  - HST number (optional)
  - Address, city, province, postal code

Step 2: Trade Information
  - Primary trade (dropdown)
  - Secondary trades (multi-select)
  - Years of experience
  - Licensed trade? (yes/no)
  - If yes: license number + licensing body
  - Service area: radius slider + city multi-select

Step 3: Document Upload
  - Show required docs based on trade type selected in Step 2
  - Drag-and-drop or click to upload
  - File types: PDF, JPG, PNG (max 10MB each)
  - Each document shows: uploaded/not uploaded status
  - Insurance: must enter expiry date
  - WSIB: must enter expiry date

Step 4: References
  - Minimum 2 references
  - Name, phone, email (optional), relationship type
  - "Add another reference" button

Step 5: Review & Submit
  - Summary of all info entered
  - Checklist showing all required docs
  - Checkbox: "I confirm all information is accurate"
  - Checkbox: "I agree to HROP's Contractor Terms of Service"
  - Submit button
```

### 2. ContractorVerificationStatus (dashboard widget)
Shows contractor their current vetting status:
- Draft: "Complete your application to get started"
- Submitted: "Your application is under review (typically 1-2 business days)"
- Under Review: "We're verifying your documents"
- Approved: Green checkmark, "You're verified!"
- Rejected: "Your application was not approved" + reason + "Contact support"
- Suspended: "Your account is suspended" + reason + steps to resolve

### 3. AdminContractorReview (admin page)
- List of pending applications with filters (status, trade, date)
- Click into application to see:
  - All submitted info
  - Document viewer (inline PDF/image viewer)
  - Verify/reject each document individually
  - Reference contact log
  - Approve / Reject application with reason
  - Suspend / Remove existing contractor

### 4. DocumentExpiryAlerts (system component)
- Cron job / scheduled function checks daily for expiring documents
- 30 days before expiry: email contractor "Your [document] expires on [date]"
- 7 days before: second warning
- On expiry date: auto-suspend contractor, notify them
- Contractor uploads new document -> admin reviews -> reactivated

## API Routes

```
POST   /api/contractor/apply              -- Start or update application
GET    /api/contractor/application         -- Get current user's application status
POST   /api/contractor/documents           -- Upload a document
DELETE /api/contractor/documents/:id       -- Remove a document

-- Admin routes (require admin role)
GET    /api/admin/applications             -- List all applications (filterable)
GET    /api/admin/applications/:id         -- Get single application detail
POST   /api/admin/applications/:id/review  -- Approve/reject/suspend
POST   /api/admin/documents/:id/verify     -- Mark document as verified
POST   /api/admin/references/:id/contact   -- Log reference contact result
```

## Supabase Storage Buckets

```
contractor-documents/
  ├── {contractor_id}/
  │   ├── liability-insurance.pdf
  │   ├── wsib-clearance.pdf
  │   ├── trade-license.pdf
  │   ├── criminal-record-check.pdf
  │   ├── business-registration.pdf
  │   └── reference-letters/
  │       ├── ref-1.pdf
  │       └── ref-2.pdf
```

Storage policies:
- Contractors can upload to their own folder only
- Admins can read all folders
- Public cannot access any documents

## Auto-Suspension Rules

Contractor gets auto-suspended when:
1. Insurance certificate expires (most critical)
2. WSIB clearance expires
3. Trade license expires
4. 3+ complaints of type 'property_damage' or 'safety_concern'
5. 5+ complaints of any type within 90 days

Auto-suspension triggers:
- Contractor status -> 'suspended'
- All active estimates withdrawn
- Email notification to contractor with reason and resolution steps
- Email notification to admin

## UI Theme
- Same dark theme: #060D1A background, #00D4AA teal accent
- Form cards: #0D1F35 background with rgba(255,255,255,0.08) borders
- Status badges: green for approved, yellow for pending, red for rejected/suspended
- Upload zones: dashed border, teal accent on hover

## Implementation Notes
- Use Supabase Storage for document uploads (signed URLs for viewing)
- File uploads go through the client directly to Supabase Storage (no server relay)
- Application data saved to Supabase via client SDK with RLS
- Admin routes use Supabase service key (server-side only)
- All document verification is manual (admin reviews) -- no auto-verify
- TypeScript strict mode, no any types in new code
