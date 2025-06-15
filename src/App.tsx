import "@/i18n";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SharedView from "./pages/SharedView";
import SharedFolder from "./pages/SharedFolder";
import NotFound from "./pages/NotFound";
import MagicLink from "./pages/MagicLink";
import SharedOtpGate from "./pages/SharedOtpGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/magic-link" element={<MagicLink />} />
            {/* OTP beskyttelse for delte filer/mapper */}
            <Route path="/shared/:type/:id-otp" element={<SharedOtpGate />} />
            <Route
              path="/shared/:type/:id"
              element={
                <OtpWrapper>
                  {/* SharedView loader fil/mappe, men kræver adgang! */}
                  <SharedView />
                </OtpWrapper>
              }
            />
            <Route path="/shared/folder/:id" element={<SharedFolder />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Simple wrapper: Hvis adgang ikke givet på dette sessionStorage-key, send til /shared/:type/:id-otp
function OtpWrapper({ children }: { children: React.ReactNode }) {
  const { type, id } = useParams<{ type: string, id: string }>();
  const navigate = useNavigate();

  // Strip "-otp" hvis det er med i id
  const realId = id?.replace(/-otp$/, "");
  if (typeof window !== "undefined" && type && realId) {
    const unlocked = sessionStorage.getItem(`share_access_${type}_${realId}`) === "true";
    if (!unlocked) {
      // Naviger til OTP-gate med -otp på rigtig id
      navigate(`/shared/${type}/${realId}-otp`);
      return null;
    }
  }
  return <>{children}</>;
}

export default App;
