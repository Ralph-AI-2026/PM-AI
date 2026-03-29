-- HROP Payment System Schema Migration
-- Run this against your Supabase PostgreSQL database
-- Project: gmemgoqultiiedrdgtba

-- ============================================
-- ORGANIZATIONS (landlord/property management companies)
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  unit_count INTEGER NOT NULL DEFAULT 1,
  subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'growth', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations visible to their members"
  ON organizations FOR SELECT
  USING (auth.uid() IN (
    SELECT p.id FROM profiles p WHERE p.role = 'landlord'
  ));

CREATE POLICY "Organizations updatable by their owners"
  ON organizations FOR UPDATE
  USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- ============================================
-- CONTRACTORS
-- ============================================
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  trade TEXT NOT NULL,
  license_number TEXT,
  insurance_verified BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  wsib_verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'suspended', 'removed')) DEFAULT 'active',
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors visible to authenticated users"
  ON contractors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Contractors can update own record"
  ON contractors FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- ESTIMATES
-- ============================================
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id),

  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  estimated_duration TEXT,
  available_date DATE,
  valid_until DATE,

  status TEXT CHECK (status IN (
    'pending', 'accepted', 'declined', 'expired'
  )) DEFAULT 'pending',

  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estimates visible to request owner and contractor"
  ON estimates FOR SELECT
  USING (
    contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
    OR request_id IN (
      SELECT id FROM maintenance_requests WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can insert estimates"
  ON estimates FOR INSERT
  WITH CHECK (
    contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
  );

-- ============================================
-- SERVICE FEES (tracks every charge)
-- ============================================
CREATE TABLE IF NOT EXISTS service_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  request_id UUID REFERENCES maintenance_requests(id),
  estimate_id UUID REFERENCES estimates(id),

  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'cad',

  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,

  status TEXT CHECK (status IN (
    'pending', 'charged', 'failed', 'refunded', 'credited'
  )) DEFAULT 'pending',

  charged_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE service_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service fees visible to organization owner"
  ON service_fees FOR SELECT
  USING (
    organization_id IN (
      SELECT o.id FROM organizations o
      WHERE o.email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

-- ============================================
-- CONTRACTOR REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS contractor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id),
  request_id UUID REFERENCES maintenance_requests(id),
  organization_id UUID REFERENCES organizations(id),

  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contractor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews visible to authenticated users"
  ON contractor_reviews FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Reviews insertable by organization owners"
  ON contractor_reviews FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM organizations o
      WHERE o.email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

-- ============================================
-- CONTRACTOR COMPLAINTS
-- ============================================
CREATE TABLE IF NOT EXISTS contractor_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id),
  request_id UUID REFERENCES maintenance_requests(id),

  complaint_type TEXT CHECK (complaint_type IN (
    'property_damage', 'no_show', 'poor_quality',
    'overcharge', 'safety_concern', 'unprofessional', 'other'
  )),
  description TEXT NOT NULL,
  evidence_urls TEXT[],

  resolution TEXT,
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contractor_complaints ENABLE ROW LEVEL SECURITY;

-- Complaints are admin-only read
CREATE POLICY "Complaints insertable by authenticated users"
  ON contractor_complaints FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- ADD status columns to existing maintenance_requests if needed
-- ============================================
-- Add organization_id to maintenance_requests for linking to organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maintenance_requests' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE maintenance_requests ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_estimates_request_id ON estimates(request_id);
CREATE INDEX IF NOT EXISTS idx_estimates_contractor_id ON estimates(contractor_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_service_fees_organization_id ON service_fees(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_fees_request_id ON service_fees(request_id);
CREATE INDEX IF NOT EXISTS idx_service_fees_status ON service_fees(status);
CREATE INDEX IF NOT EXISTS idx_contractors_trade ON contractors(trade);
CREATE INDEX IF NOT EXISTS idx_contractors_status ON contractors(status);
CREATE INDEX IF NOT EXISTS idx_contractor_reviews_contractor_id ON contractor_reviews(contractor_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
