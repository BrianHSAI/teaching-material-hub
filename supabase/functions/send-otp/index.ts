
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, share_id, share_type, action, otp_code } = await req.json();

    if (action === "send") {
      if (!email || !share_id || !share_type) throw new Error("Missing required fields");
      const code = generateOtpCode();
      const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

      // Slet evt. eksisterende koder, så kun én aktiv pr. mail/link ad gangen
      await supabase
        .from("shared_link_otps")
        .delete()
        .eq("email", email)
        .eq("share_id", share_id)
        .eq("share_type", share_type)
        .eq("used", false);

      // Indsæt ny kode
      const { error } = await supabase.from("shared_link_otps").insert({
        email, otp_code: code, share_id, share_type, expires_at: expires
      });
      if (error) throw new Error("Kunne ikke oprette OTP");

      // Send e-mail
      await resend.emails.send({
        from: "Materialedeling <onboarding@resend.dev>",
        to: [email],
        subject: "Din adgangskode til delte materialer",
        html: `
          <h2>Her er din adgangskode</h2>
          <p>Hej! Din engangskode til at få adgang: <b style="font-size:20px">${code}</b></p>
          <p>Koden virker kun én gang og udløber om 15 minutter.</p>
          <p>- Materialedeling</p>
        `
      });

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "verify") {
      // Verificér kode
      if (!email || !share_id || !share_type || !otp_code) throw new Error("Missing required field");
      const { data, error } = await supabase
        .from("shared_link_otps")
        .select("*")
        .eq("email", email)
        .eq("share_id", share_id)
        .eq("share_type", share_type)
        .eq("otp_code", otp_code)
        .eq("used", false)
        .single();
      if (error) return new Response(JSON.stringify({ ok: false, reason: "Ugyldig kode" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (new Date(data.expires_at) < new Date()) {
        return new Response(JSON.stringify({ ok: false, reason: "Koden er udløbet" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Markér som brugt
      await supabase
        .from("shared_link_otps")
        .update({ used: true })
        .eq("id", data.id);

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: false, reason: "Ugyldig handling" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, reason: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
