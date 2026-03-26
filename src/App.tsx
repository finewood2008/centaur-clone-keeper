import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import AIAssistant from "./components/AIAssistant";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";

import SocialContent from "./pages/SocialContent";
import AdsCommand from "./pages/AdsCommand";
import EmailMarketing from "./pages/EmailMarketing";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              
              <Route path="/social" element={<SocialContent />} />
              <Route path="/ads" element={<AdsCommand />} />
              <Route path="/email" element={<EmailMarketing />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
          <AIAssistant />
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
