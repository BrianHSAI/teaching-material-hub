
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const MagicLink = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        toast({
          title: "Fejl",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Tjek din e-mail",
          description: "Du har fået tilsendt et login-link.",
        });
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error: any) {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke sende login-link.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Få midlertidig adgang</CardTitle>
          <CardDescription>
            Indtast din e-mail for at modtage et login-link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendLink} className="space-y-4">
            <Input
              type="email"
              placeholder="din@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={sending}
            />
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sender link..." : "Send login-link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MagicLink;
