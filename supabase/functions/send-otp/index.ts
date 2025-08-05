
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

// Allow both production and localhost for development
const allowedOrigins = [
  "https://778d9511-57a9-49df-99ca-8ff9d89ab734.lovableproject.com",
  "http://localhost:3000",
  "http://localhost:5173"
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function generateOtpCode(): string {
  // Use cryptographically secure random number generation
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (100000 + (array[0] % 900000)).toString();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

async function checkRateLimit(email: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { count, error } = await supabase
    .from("shared_link_otps")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo);
    
  if (error) {
    console.error("Rate limit check error:", error);
    return false; // Allow on error to avoid blocking legitimate users
  }
  
  return (count || 0) < 3; // Max 3 OTP requests per hour
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, share_id, share_type, action, otp_code } = await req.json();

    if (action === "send") {
      // Input validation
      if (!email || !share_id || !share_type) {
        throw new Error("Missing required fields");
      }
      
      // Validate email format and length
      if (!isValidEmail(email)) {
        throw new Error("Ugyldig email format");
      }
      
      // Validate other inputs
      if (share_id.length > 50 || share_type.length > 20) {
        throw new Error("Ugyldige parametre");
      }
      
      // Check rate limiting
      const rateLimitOk = await checkRateLimit(email);
      if (!rateLimitOk) {
        console.log(`Rate limit exceeded for email: ${email}`);
        throw new Error("For mange forsøg. Prøv igen senere.");
      }
      
      const code = generateOtpCode();
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Reduced to 5 min

      console.log(`Sending OTP for email: ${email}, share_id: ${share_id}, share_type: ${share_type}`);

      // Clean up existing codes
      await supabase
        .from("shared_link_otps")
        .delete()
        .eq("email", email)
        .eq("share_id", share_id)
        .eq("share_type", share_type)
        .eq("used", false);

      // Insert new code
      const { error } = await supabase.from("shared_link_otps").insert({
        email, otp_code: code, share_id, share_type, expires_at: expires
      });
      if (error) {
        console.error("Database error creating OTP:", error);
        throw new Error("Kunne ikke oprette OTP");
      }

      // Send email
      await resend.emails.send({
        from: "Materialedeling <onboarding@resend.dev>",
        to: [email],
        subject: "Din adgangskode til delte materialer",
        html: `
          <h2>Her er din adgangskode</h2>
          <p>Hej! Din engangskode til at få adgang: <b style="font-size:20px">${code}</b></p>
          <p>Koden virker kun én gang og udløber om 5 minutter.</p>
          <p>- Materialedeling</p>
        `
      });

      console.log(`OTP sent successfully for email: ${email}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "verify") {
      // Input validation
      if (!email || !share_id || !share_type || !otp_code) {
        throw new Error("Missing required fields");
      }
      
      // Validate inputs
      if (!isValidEmail(email)) {
        throw new Error("Ugyldig email format");
      }
      
      if (share_id.length > 50 || share_type.length > 20 || otp_code.length !== 6) {
        throw new Error("Ugyldige parametre");
      }
      
      console.log(`Verifying OTP for email: ${email}, share_id: ${share_id}, share_type: ${share_type}`);
      
      const { data, error } = await supabase
        .from("shared_link_otps")
        .select("*")
        .eq("email", email)
        .eq("share_id", share_id)
        .eq("share_type", share_type)
        .eq("otp_code", otp_code)
        .eq("used", false)
        .single();
        
      if (error) {
        console.log(`Invalid OTP attempt for email: ${email}`);
        return new Response(JSON.stringify({ ok: false, reason: "Ugyldig kode" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      if (new Date(data.expires_at) < new Date()) {
        console.log(`Expired OTP attempt for email: ${email}`);
        return new Response(JSON.stringify({ ok: false, reason: "Koden er udløbet" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Mark as used
      await supabase
        .from("shared_link_otps")
        .update({ used: true })
        .eq("id", data.id);

      console.log(`OTP verified successfully for email: ${email}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: false, reason: "Ugyldig handling" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, reason: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
