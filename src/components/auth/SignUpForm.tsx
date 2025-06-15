
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SignUpFormProps = {
  setLoadingParent: (loading: boolean) => void;
};

export const SignUpForm = ({ setLoadingParent }: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingParent(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Konto eksisterer allerede",
            description: "Der findes allerede en konto med denne email. Prøv at logge ind i stedet.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Fejl ved oprettelse",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Konto oprettet!",
          description: "Tjek din email for at bekræfte din konto.",
        });
      }
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Der skete en fejl. Prøv igen senere.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingParent(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <Label htmlFor="signup-name">Fulde navn</Label>
        <Input
          id="signup-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="signup-password">Adgangskode</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Opretter konto..." : "Opret konto"}
      </Button>
    </form>
  );
};
