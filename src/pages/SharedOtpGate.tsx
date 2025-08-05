
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const LOGO = "/lovable-uploads/70b7bcd1-e7d9-4faf-baf5-855b246bb838.png";

export default function SharedOtpGate() {
  // Strip "-otp" from id if it exists in the param, so we always have the correct ID
  const { type, id } = useParams<{type: "folder" | "file", id: string}>();
  const realId = id?.replace(/-otp$/, "");
  const [step, setStep] = useState<"email" | "verify" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Input validation
    if (!validateEmail(email)) {
      setError("Indtast en gyldig e-mail adresse");
      return;
    }
    
    if (!type || !realId) {
      setError("Ugyldige parametre");
      return;
    }
    
    setSending(true);
    
    try {
      const res = await fetch("https://ytegircevnaewgqpbked.supabase.co/functions/v1/send-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZWdpcmNldm5hZXdncXBia2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTU1MzcsImV4cCI6MjA2NTEzMTUzN30.ectpPhTNG-IGEl4uzSTI-rWeTMfK5hdcdhu4SxteORY`
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          share_type: type, 
          share_id: realId, 
          action: "send" 
        })
      });
      
      const data = await res.json();
      if (data.ok) {
        setStep("verify");
      } else {
        setError(data.reason || "Der opstod en fejl. Prøv igen.");
      }
    } catch (error) {
      setError("Netværksfejl. Prøv igen.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Input validation
    if (!validateEmail(email)) {
      setError("Ugyldig e-mail adresse");
      return;
    }
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Koden skal være 6 cifre");
      return;
    }
    
    if (!type || !realId) {
      setError("Ugyldige parametre");
      return;
    }
    
    setSending(true);
    
    try {
      const res = await fetch("https://ytegircevnaewgqpbked.supabase.co/functions/v1/send-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZWdpcmNldm5hZXdncXBia2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTU1MzcsImV4cCI6MjA2NTEzMTUzN30.ectpPhTNG-IGEl4uzSTI-rWeTMfK5hdcdhu4SxteORY`
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          share_type: type, 
          share_id: realId, 
          action: "verify", 
          otp_code: otp 
        })
      });
      
      const data = await res.json();
      if (data.ok) {
        // Generate a more secure session token
        const sessionToken = crypto.randomUUID();
        const expiryTime = Date.now() + (30 * 60 * 1000); // 30 minutes
        
        // Store session with expiry
        sessionStorage.setItem(`share_access_${type}_${realId}`, JSON.stringify({
          token: sessionToken,
          expires: expiryTime,
          email: email.trim().toLowerCase()
        }));
        
        navigate(`/shared/${type}/${realId}`);
      } else {
        setError(data.reason || "Ugyldig kode eller fejl.");
      }
    } catch (error) {
      setError("Netværksfejl. Prøv igen.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        {/* Logo og titel */}
        <div className="flex items-center mb-6">
          <img src={LOGO} alt="Logo" className="h-10 w-10 rounded mr-3" />
          <h1 className="text-xl font-bold text-gray-700">Materialedeling</h1>
        </div>
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="mb-2 text-sm text-gray-700">Indtast din e-mail for at få adgang til materialet:</p>
            {/* LABEL and INPUT update */}
            <label htmlFor="otp-email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <Input
              id="otp-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={sending}>{sending ? "Sender..." : "Send kode"}</Button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        )}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-700 mb-2">
              Der er sendt en engangskode til<br /><b>{email}</b>.<br />Indtast koden for at få adgang:
            </p>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              render={({ slots }) => (
                <InputOTPGroup className="justify-center mb-1">
                  {slots.map((_, idx) => (
                    <InputOTPSlot key={idx} index={idx} />
                  ))}
                </InputOTPGroup>
              )}
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={sending || otp.length !== 6}>
              {sending ? "Tjekker..." : "Bekræft kode"}
            </Button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="button"
              className="text-sm underline text-blue-600 mt-3"
              onClick={() => { setStep("email"); setOtp(""); setError(null); }}
            >
              Modtag ny kode
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
