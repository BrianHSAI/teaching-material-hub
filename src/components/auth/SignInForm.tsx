
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type SignInFormProps = {
  setLoadingParent: (loading: boolean) => void;
};

export const SignInForm = ({ setLoadingParent }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingParent(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Forkerte loginoplysninger",
            description: "Email eller adgangskode er forkert. Prøv igen.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login fejl",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Logget ind!",
          description: "Velkommen tilbage.",
        });
        navigate("/");
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
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <Label htmlFor="signin-email">{t('signIn.emailLabel')}</Label>
        <Input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="signin-password">{t('signIn.passwordLabel')}</Label>
        <Input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('signIn.buttonLoading') : t('signIn.button')}
      </Button>
    </form>
  );
};
