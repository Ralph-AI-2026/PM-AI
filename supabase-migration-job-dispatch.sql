-- HROP Job Dispatch Migration
-- Adds fields required for the Uber-style job dispatch system
-- Run in Supabase SQL Editor for project: uyazjsoystozhetysdtc

-- 1. Add service_area to service_providers (city/region the provider works in)
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS service_area TEXT;

-- 2. Add category to maintenance_requests if it doesn't exist
--    (schema shows it already exists as TEXT NOT NULL, but guard with IF NOT EXISTS)
--    This is a no-op if the column already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'maintenance_requests'
      AND column_name = 'category'
  ) THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN category TEXT;
  END IF;
END $$;

-- 3. Add claimed_at to jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- 4. Extend job status to include 'claimed'
--    Drop old constraint and add new one
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('available', 'claimed', 'accepted', 'in_progress', 'completed', 'cancelled'));

-- 5. RLS: Allow service providers to view all available jobs (needed for the dispatch feed)
DROP POLICY IF EXISTS "Service providers can view available jobs" ON public.jobs;
CREATE POLICY "Service providers can view available jobs" ON public.jobs
  FOR SELECT
  USING (
    status = 'available'
    OR auth.uid() = service_provider_id
  );

-- 6. RLS: Allow service providers to claim jobs (update status from available -> claimed)
DROP POLICY IF EXISTS "Service providers can claim available jobs" ON public.jobs;
CREATE POLICY "Service providers can claim available jobs" ON public.jobs
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.service_providers));

-- 7. Index on claimed_at for reporting
CREATE INDEX IF NOT EXISTS idx_jobs_claimed_at ON public.jobs(claimed_at);

-- 8. RLS: Allow service providers to read all profiles
--    (needed to get tenant contact details after claiming)
DROP POLICY IF EXISTS "Service providers can read tenant profiles" ON public.profiles;
CREATE POLICY "Service providers can read tenant profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.service_providers)
    OR auth.uid() = id
  );
