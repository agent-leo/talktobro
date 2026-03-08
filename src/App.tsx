import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Record from "./pages/Record";
import Ledger from "./pages/Ledger";
import AtoZ from "./pages/AtoZ";
import CrisisResources from "./pages/CrisisResources";
import Pricing from "./pages/Pricing";
import Onboarding from "./pages/Onboarding";
import Success from "./pages/Success";
import BookCall from "./pages/BookCall";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/record" element={<Record />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/a-z" element={<AtoZ />} />
            <Route path="/crisis" element={<CrisisResources />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/success" element={<Success />} />
            <Route path="/book-call" element={<BookCall />} />
            <Route path="/integrations" element={<Integrations />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
