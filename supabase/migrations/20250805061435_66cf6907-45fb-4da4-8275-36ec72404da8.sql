-- Enable Row Level Security on shared_link_otps table
ALTER TABLE public.shared_link_otps ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policies for shared_link_otps
-- Only allow service role (edge functions) to manage OTP records
CREATE POLICY "Service role can manage OTPs" 
ON public.shared_link_otps 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Prevent any public access to OTP table
CREATE POLICY "Block public access to OTPs" 
ON public.shared_link_otps 
FOR ALL 
TO anon, authenticated 
USING (false) 
WITH CHECK (false);

-- Create index for better performance on OTP lookups
CREATE INDEX IF NOT EXISTS idx_shared_link_otps_lookup 
ON public.shared_link_otps (email, share_id, share_type, otp_code, used);

-- Create index for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_shared_link_otps_expires 
ON public.shared_link_otps (expires_at) WHERE used = false;