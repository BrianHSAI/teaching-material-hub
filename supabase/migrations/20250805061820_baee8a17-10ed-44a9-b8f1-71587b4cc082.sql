-- Add cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.shared_link_otps 
  WHERE expires_at < now() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit log for security events (optional)
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  email text,
  share_id text,
  share_type text,
  ip_address inet,
  user_agent text,
  success boolean NOT NULL DEFAULT false,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "Only service role can access audit logs" 
ON public.security_audit_log 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Block all other access to audit logs
CREATE POLICY "Block public access to audit logs" 
ON public.security_audit_log 
FOR ALL 
TO anon, authenticated 
USING (false) 
WITH CHECK (false);

-- Add index for audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at 
ON public.security_audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_email 
ON public.security_audit_log (email, created_at DESC);