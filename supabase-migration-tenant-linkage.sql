-- Migration: tenant-to-property linkage
-- Run this in the Supabase SQL editor for project gmemgoqultiiedrdgtba (HROP)
-- Date: 2026-04-23

-- 1. Add invite_code column to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- 2. Generate invite codes for any existing properties
UPDATE public.properties
SET invite_code = upper(substring(md5(random()::text) from 1 for 6))
WHERE invite_code IS NULL;

-- 3. Add status column to property_tenants
ALTER TABLE public.property_tenants
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('invited', 'active'));

-- 4. Add invited_email for email-based invites (before tenant creates account)
ALTER TABLE public.property_tenants
  ADD COLUMN IF NOT EXISTS invited_email TEXT;

-- 5. Make tenant_id optional (supports email invites before account creation)
ALTER TABLE public.property_tenants
  ALTER COLUMN tenant_id DROP NOT NULL;

-- 6. Drop and recreate unique constraint to handle nullable tenant_id properly
ALTER TABLE public.property_tenants
  DROP CONSTRAINT IF EXISTS property_tenants_property_id_tenant_id_key;

-- 7. Trigger function: auto-generate invite_code on property insert
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.invite_code IS NULL THEN
    LOOP
      code := upper(substring(md5(random()::text) from 1 for 6));
      SELECT EXISTS(SELECT 1 FROM public.properties WHERE invite_code = code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.invite_code := code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Attach trigger to properties
DROP TRIGGER IF EXISTS set_invite_code ON public.properties;
CREATE TRIGGER set_invite_code
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION generate_invite_code();

-- 9. RLS policies for property_tenants
-- (Only run if RLS is enabled and policies don't already exist)

-- Landlords can insert invites for their own properties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'property_tenants'
      AND policyname = 'Landlords can invite tenants to their properties'
  ) THEN
    CREATE POLICY "Landlords can invite tenants to their properties"
      ON public.property_tenants FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.properties
          WHERE id = property_id AND landlord_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Landlords can view tenants for their properties; tenants can view their own links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'property_tenants'
      AND policyname = 'Landlords and tenants can view property_tenants'
  ) THEN
    CREATE POLICY "Landlords and tenants can view property_tenants"
      ON public.property_tenants FOR SELECT
      USING (
        tenant_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.properties
          WHERE id = property_id AND landlord_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Tenants can update their own linkage (e.g., activating via invite code)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'property_tenants'
      AND policyname = 'Tenants can update their own linkage'
  ) THEN
    CREATE POLICY "Tenants can update their own linkage"
      ON public.property_tenants FOR UPDATE
      USING (tenant_id = auth.uid() OR tenant_id IS NULL);
  END IF;
END $$;
