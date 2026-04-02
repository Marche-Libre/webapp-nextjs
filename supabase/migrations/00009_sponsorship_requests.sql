-- Sponsorship requests: users on /en-attente can declare a sponsor by @handle
-- Max 2 attempts per requester. Sponsors can approve/reject.

CREATE TABLE IF NOT EXISTS public.sponsorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sponsor_handle TEXT NOT NULL,
  sponsor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  attempt_number INT NOT NULL DEFAULT 1 CHECK (attempt_number >= 1 AND attempt_number <= 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one pending/approved request per requester at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsorship_requests_requester_attempt
  ON public.sponsorship_requests (requester_id, attempt_number);

-- Enable RLS
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Requester can view their own requests
CREATE POLICY "Requesters can view own requests"
  ON public.sponsorship_requests FOR SELECT
  USING (requester_id = auth.uid());

-- Requester can create requests (insert)
CREATE POLICY "Requesters can create requests"
  ON public.sponsorship_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Sponsors can view requests addressed to them
CREATE POLICY "Sponsors can view requests for them"
  ON public.sponsorship_requests FOR SELECT
  USING (sponsor_id = auth.uid());

-- Sponsors can update requests addressed to them (approve/reject)
CREATE POLICY "Sponsors can update requests for them"
  ON public.sponsorship_requests FOR UPDATE
  USING (sponsor_id = auth.uid())
  WITH CHECK (sponsor_id = auth.uid());

-- Admins can view all requests
CREATE POLICY "Admins can view all sponsorship requests"
  ON public.sponsorship_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all sponsorship requests"
  ON public.sponsorship_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_sponsorship_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sponsorship_requests_updated_at
  BEFORE UPDATE ON public.sponsorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sponsorship_requests_updated_at();
