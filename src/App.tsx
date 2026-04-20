import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import AIAssistant from "./components/AIAssistant";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import SocialLayout from "./components/social/SocialLayout";
import SocialAccounts from "./pages/social/SocialAccounts";
import AssetLibrary from "./pages/social/AssetLibrary";
import ContentCreate from "./pages/social/ContentCreate";
import ContentCalendar from "./pages/social/ContentCalendar";
import AdsLayout from "./components/ads/AdsLayout";
import AdsAccounts from "./pages/ads/AdsAccounts";
import AdsDashboard from "./pages/ads/AdsDashboard";
import AdsApprovals from "./pages/ads/AdsApprovals";
import EmailLayout from "./components/email/EmailLayout";
import EmailLists from "./pages/email/EmailLists";
import EmailCreate from "./pages/email/EmailCreate";
import EmailCampaigns from "./pages/email/EmailCampaigns";
import EmailAnalytics from "./pages/email/EmailAnalytics";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import DataCenter from "./pages/data/DataCenter";
import DataBackup from "./pages/data/DataBackup";
import DataExport from "./pages/data/DataExport";
import BillingCenter from "./pages/billing/BillingCenter";
import BillingSettings from "./pages/billing/BillingSettings";
import BillingInvoice from "./pages/billing/BillingInvoice";
import BillingPlans from "./pages/billing/BillingPlans";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/inbox" element={<Inbox />} />
                      <Route path="/social" element={<SocialLayout />}>
                        <Route index element={<Navigate to="accounts" replace />} />
                        <Route path="accounts" element={<SocialAccounts />} />
                        <Route path="assets" element={<AssetLibrary />} />
                        <Route path="create" element={<ContentCreate />} />
                        <Route path="calendar" element={<ContentCalendar />} />
                      </Route>
                      <Route path="/ads" element={<AdsLayout />}>
                        <Route index element={<Navigate to="accounts" replace />} />
                        <Route path="accounts" element={<AdsAccounts />} />
                        <Route path="dashboard" element={<AdsDashboard />} />
                        <Route path="approvals" element={<AdsApprovals />} />
                      </Route>
                      <Route path="/email" element={<EmailLayout />}>
                        <Route index element={<Navigate to="lists" replace />} />
                        <Route path="lists" element={<EmailLists />} />
                        <Route path="create" element={<EmailCreate />} />
                        <Route path="campaigns" element={<EmailCampaigns />} />
                        <Route path="analytics" element={<EmailAnalytics />} />
                      </Route>
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/data" element={<DataCenter />} />
                      <Route path="/data/backup" element={<DataBackup />} />
                      <Route path="/data/export" element={<DataExport />} />
                      <Route path="/billing" element={<BillingCenter />} />
                      <Route path="/billing/settings" element={<BillingSettings />} />
                      <Route path="/billing/invoice" element={<BillingInvoice />} />
                      <Route path="/billing/plans" element={<BillingPlans />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DashboardLayout>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
