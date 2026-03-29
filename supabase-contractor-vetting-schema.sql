-- HROP Contractor Vetting & Onboarding Schema
-- Run this migration against Supabase project: gmemgoqultiiedrdgtba

-- 1. Contractor Applications table
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
  primary_trade TEXT NOT NULL,
  secondary_trades TEXT[],
  years_experience INTEGER NOT NULL,
  licensed_trade BOOLEAN DEFAULT false,
  license_number TEXT,
  licensing_body TEXT,

  -- Service Area
  service_radius_km INTEGER DEFAULT 50,
  service_cities TEXT[],

  -- Status
  status TEXT CHECK (status IN (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'suspended',
    'removed'
  )) DEFAULT 'draft',

  rejection_reason TEXT,
  suspension_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Contractor Documents table
CREATE TABLE contractor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES contractor_applications(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id),

  document_type TEXT CHECK (document_type IN (
    'liability_insurance',
    'wsib_clearance',
    'trade_license',
    'business_registration',
    'criminal_record_check',
    'drivers_license',
    'reference_letter'
  )) NOT NULL,

  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  -- Expiry tracking
  expiry_date DATE,
  expiry_alert_sent BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Contractor References table
CREATE TABLE contractor_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES contractor_applications(id) ON DELETE CASCADE,

  reference_name TEXT NOT NULL,
  reference_email TEXT,
  reference_phone TEXT NOT NULL,
  relationship TEXT NOT NULL,

  -- Admin follow-up
  contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMPTZ,
  contacted_by TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add vetting columns to existing contractors table
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

-- 5. Indexes for performance
CREATE INDEX idx_contractor_applications_user_id ON contractor_applications(user_id);
CREATE INDEX idx_contractor_applications_status ON contractor_applications(status);
CREATE INDEX idx_contractor_documents_application_id ON contractor_documents(application_id);
CREATE INDEX idx_contractor_documents_expiry ON contractor_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_contractor_references_application_id ON contractor_references(application_id);

-- 6. Row Level Security
ALTER TABLE contractor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_references ENABLE ROW LEVEL SECURITY;

-- Contractors can read/write their own applications
CREATE POLICY "Users can view own applications"
  ON contractor_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON contractor_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft applications"
  ON contractor_applications FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'submitted'));

-- Contractors can manage their own documents
CREATE POLICY "Users can view own documents"
  ON contractor_documents FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM contractor_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload own documents"
  ON contractor_documents FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM contractor_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own unverified documents"
  ON contractor_documents FOR DELETE
  USING (
    verified = false AND
    application_id IN (
      SELECT id FROM contractor_applications WHERE user_id = auth.uid()
    )
  );

-- Contractors can manage their own references
CREATE POLICY "Users can view own references"
  ON contractor_references FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM contractor_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own references"
  ON contractor_references FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM contractor_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own references"
  ON contractor_references FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM contractor_applications WHERE user_id = auth.uid()
    )
  );

-- 7. Storage bucket for contractor documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('contractor-documents', 'contractor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Contractors upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contractor-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contractor-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'contractor-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 8. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contractor_applications_updated_at
  BEFORE UPDATE ON contractor_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
