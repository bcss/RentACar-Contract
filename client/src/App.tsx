import { Switch, Route, useLocation } from "wouter";
import { queryClient, fetchCsrfToken } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import Login from "@/pages/Login";
import "@/lib/i18n";
import { useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CompanySettings as CompanySettingsType } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { setupGlobalErrorHandler } from "@/utils/errorLogger";

// Lazy load all pages except Login (needed immediately for initial load)
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Customers = lazy(() => import("@/pages/Customers"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const Sponsors = lazy(() => import("@/pages/Sponsors"));
const Companies = lazy(() => import("@/pages/Companies"));
const Contracts = lazy(() => import("@/pages/Contracts"));
const ContractForm = lazy(() => import("@/pages/ContractForm"));
const ContractView = lazy(() => import("@/pages/ContractView"));
const Users = lazy(() => import("@/pages/Users"));
const AuditLogs = lazy(() => import("@/pages/AuditLogs"));
const AccessReport = lazy(() => import("@/pages/AccessReport"));
const SystemErrors = lazy(() => import("@/pages/SystemErrors"));
const Settings = lazy(() => import("@/pages/Settings"));
const CompanySettings = lazy(() => import("@/pages/CompanySettings"));
const FinancialSettings = lazy(() => import("@/pages/FinancialSettings"));
const TermsConditions = lazy(() => import("@/pages/TermsConditions"));
const FinancialReports = lazy(() => import("@/pages/FinancialReports"));
const OperationalReports = lazy(() => import("@/pages/OperationalReports"));
const CustomerReports = lazy(() => import("@/pages/CustomerReports"));
const AuditReports = lazy(() => import("@/pages/AuditReports"));
const UserActivity = lazy(() => import("@/pages/UserActivity"));
const DriverRevenueCostReport = lazy(() => import("@/pages/DriverRevenueCostReport"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("@/pages/TermsOfServicePage"));
const SupportHelpPage = lazy(() => import("@/pages/SupportHelpPage"));
const InsuranceClaims = lazy(() => import("@/pages/InsuranceClaims"));
const InsuranceClaimForm = lazy(() => import("@/pages/InsuranceClaimForm"));
const InsuranceReports = lazy(() => import("@/pages/InsuranceReports"));
const UnclosedContractsReport = lazy(() => import("@/pages/UnclosedContractsReport"));
const RevenueTrendsReport = lazy(() => import("@/pages/RevenueTrendsReport"));
const FleetPerformanceReport = lazy(() => import("@/pages/FleetPerformanceReport"));
const ContractAnalyticsReport = lazy(() => import("@/pages/ContractAnalyticsReport"));
const CollectionPerformanceReport = lazy(() => import("@/pages/CollectionPerformanceReport"));
const ImportData = lazy(() => import("@/pages/ImportData"));
const DashboardSamples = lazy(() => import("@/pages/DashboardSamples"));
const DesignSamples = lazy(() => import("@/pages/DesignSamples"));
const PublicHolidays = lazy(() => import("@/pages/PublicHolidays"));
const Branches = lazy(() => import("@/pages/Branches"));
const Drivers = lazy(() => import("@/pages/Drivers"));
const DriverCompanies = lazy(() => import("@/pages/DriverCompanies"));
const VehicleTransfers = lazy(() => import("@/pages/VehicleTransfers"));

// Wave 1: Compliance & Operations
const TollManagement = lazy(() => import("@/pages/TollManagement"));
const TrafficFines = lazy(() => import("@/pages/TrafficFines"));
const Incidents = lazy(() => import("@/pages/Incidents"));
const DocumentRegistry = lazy(() => import("@/pages/DocumentRegistry"));

// Wave 2: Fleet Economics
const VehicleMaintenance = lazy(() => import("@/pages/VehicleMaintenance"));
const RentalRatePlans = lazy(() => import("@/pages/RentalRatePlans"));
const VehicleAccessories = lazy(() => import("@/pages/VehicleAccessories"));

// Wave 3: Workforce & Automation
const DriverScheduling = lazy(() => import("@/pages/DriverScheduling"));
const AutomatedReminders = lazy(() => import("@/pages/AutomatedReminders"));
const ApprovalWorkflows = lazy(() => import("@/pages/ApprovalWorkflows"));
const CustomerRiskScoring = lazy(() => import("@/pages/CustomerRiskScoring"));

// Communication Platform
const CommunicationProviders = lazy(() => import("@/pages/CommunicationProviders"));
const CommunicationLogs = lazy(() => import("@/pages/CommunicationLogs"));
const ManualNotificationSender = lazy(() => import("@/pages/ManualNotificationSender"));
const CampaignManagement = lazy(() => import("@/pages/CampaignManagement"));

// Advanced Analytics Reports
const CustomerRiskTrends = lazy(() => import("@/pages/reports/CustomerRiskTrends"));
const TollExpenseAnalysis = lazy(() => import("@/pages/reports/TollExpenseAnalysis"));
const TrafficFineAgingReport = lazy(() => import("@/pages/reports/TrafficFineAgingReport"));
const IncidentCostAnalysis = lazy(() => import("@/pages/reports/IncidentCostAnalysis"));
const MaintenanceComplianceReport = lazy(() => import("@/pages/reports/MaintenanceComplianceReport"));
const DriverUtilizationReport = lazy(() => import("@/pages/reports/DriverUtilizationReport"));
const ReminderDeliverySLA = lazy(() => import("@/pages/reports/ReminderDeliverySLA"));
const ApprovalTurnaroundReport = lazy(() => import("@/pages/reports/ApprovalTurnaroundReport"));

// Predictive Intelligence Reports
const RevenueForecastReport = lazy(() => import("@/pages/RevenueForecastReport"));
const FleetUtilizationForecast = lazy(() => import("@/pages/FleetUtilizationForecast"));
const CustomerChurnRiskReport = lazy(() => import("@/pages/CustomerChurnRiskReport"));
const MaintenanceCostForecast = lazy(() => import("@/pages/MaintenanceCostForecast"));
const PaymentDefaultPrediction = lazy(() => import("@/pages/PaymentDefaultPrediction"));
const LocationDemandForecast = lazy(() => import("@/pages/LocationDemandForecast"));

// Professional loading skeleton
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" data-testid="loader-spinner" />
        <p className="text-muted-foreground" data-testid="text-loading">Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper with proper redirect
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={isAuthenticated ? () => (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ) : Login} />
        <Route path="/login" component={Login} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/customers">
        {() => <ProtectedRoute component={Customers} />}
      </Route>
      <Route path="/vehicles">
        {() => <ProtectedRoute component={Vehicles} />}
      </Route>
      <Route path="/sponsors">
        {() => <ProtectedRoute component={Sponsors} />}
      </Route>
      <Route path="/companies">
        {() => <ProtectedRoute component={Companies} />}
      </Route>
      <Route path="/contracts" component={() => <ProtectedRoute component={Contracts} />} />
      <Route path="/contracts/new" component={() => <ProtectedRoute component={ContractForm} />} />
      <Route path="/contracts/:id/edit" component={() => <ProtectedRoute component={ContractForm} />} />
      <Route path="/contracts/:id" component={() => <ProtectedRoute component={ContractView} />} />
      <Route path="/insurance-claims" component={() => <ProtectedRoute component={InsuranceClaims} />} />
      <Route path="/insurance-claims/new" component={() => <ProtectedRoute component={InsuranceClaimForm} />} />
      <Route path="/insurance-claims/:id/edit" component={() => <ProtectedRoute component={InsuranceClaimForm} />} />
      <Route path="/insurance-claims/:id" component={() => <ProtectedRoute component={InsuranceClaimForm} />} />
      <Route path="/users">
        {() => <ProtectedRoute component={Users} />}
      </Route>
      <Route path="/audit-logs">
        {() => <ProtectedRoute component={AuditLogs} />}
      </Route>
      <Route path="/access-report">
        {() => <ProtectedRoute component={AccessReport} />}
      </Route>
      <Route path="/system-errors">
        {() => <ProtectedRoute component={SystemErrors} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/settings/company">
        {() => <ProtectedRoute component={CompanySettings} />}
      </Route>
      <Route path="/settings/financials">
        {() => <ProtectedRoute component={FinancialSettings} />}
      </Route>
      <Route path="/settings/terms">
        {() => <ProtectedRoute component={TermsConditions} />}
      </Route>
      <Route path="/settings/import">
        {() => <ProtectedRoute component={ImportData} />}
      </Route>
      <Route path="/reports/financial">
        {() => <ProtectedRoute component={FinancialReports} />}
      </Route>
      <Route path="/reports/operational">
        {() => <ProtectedRoute component={OperationalReports} />}
      </Route>
      <Route path="/reports/customers">
        {() => <ProtectedRoute component={CustomerReports} />}
      </Route>
      <Route path="/reports/audit">
        {() => <ProtectedRoute component={AuditReports} />}
      </Route>
      <Route path="/reports/insurance">
        {() => <ProtectedRoute component={InsuranceReports} />}
      </Route>
      <Route path="/reports/user-activity">
        {() => <ProtectedRoute component={UserActivity} />}
      </Route>
      <Route path="/unclosed-contracts-report">
        {() => <ProtectedRoute component={UnclosedContractsReport} />}
      </Route>
      <Route path="/reports/revenue-trends">
        {() => <ProtectedRoute component={RevenueTrendsReport} />}
      </Route>
      <Route path="/reports/fleet-performance">
        {() => <ProtectedRoute component={FleetPerformanceReport} />}
      </Route>
      <Route path="/reports/contract-analytics">
        {() => <ProtectedRoute component={ContractAnalyticsReport} />}
      </Route>
      <Route path="/reports/collection-performance">
        {() => <ProtectedRoute component={CollectionPerformanceReport} />}
      </Route>
      <Route path="/reports/driver-revenue-cost">
        {() => <ProtectedRoute component={DriverRevenueCostReport} />}
      </Route>
      <Route path="/settings/support">
        {() => <ProtectedRoute component={SupportHelpPage} />}
      </Route>
      <Route path="/settings/privacy">
        {() => <ProtectedRoute component={PrivacyPolicyPage} />}
      </Route>
      <Route path="/settings/terms-of-service">
        {() => <ProtectedRoute component={TermsOfServicePage} />}
      </Route>
      <Route path="/privacy">
        {() => <ProtectedRoute component={PrivacyPolicyPage} />}
      </Route>
      <Route path="/terms">
        {() => <ProtectedRoute component={TermsOfServicePage} />}
      </Route>
      <Route path="/dashboard-samples">
        {() => <ProtectedRoute component={DashboardSamples} />}
      </Route>
      <Route path="/design-samples">
        {() => <ProtectedRoute component={DesignSamples} />}
      </Route>
      <Route path="/public-holidays">
        {() => <ProtectedRoute component={PublicHolidays} />}
      </Route>
      <Route path="/branches">
        {() => <ProtectedRoute component={Branches} />}
      </Route>
      <Route path="/drivers">
        {() => <ProtectedRoute component={Drivers} />}
      </Route>
      <Route path="/driver-companies">
        {() => <ProtectedRoute component={DriverCompanies} />}
      </Route>
      <Route path="/vehicle-transfers">
        {() => <ProtectedRoute component={VehicleTransfers} />}
      </Route>
      
      {/* Wave 1: Compliance & Operations */}
      <Route path="/toll-management">
        {() => <ProtectedRoute component={TollManagement} />}
      </Route>
      <Route path="/traffic-fines">
        {() => <ProtectedRoute component={TrafficFines} />}
      </Route>
      <Route path="/incidents">
        {() => <ProtectedRoute component={Incidents} />}
      </Route>
      <Route path="/documents">
        {() => <ProtectedRoute component={DocumentRegistry} />}
      </Route>
      
      {/* Wave 2: Fleet Economics */}
      <Route path="/vehicle-maintenance">
        {() => <ProtectedRoute component={VehicleMaintenance} />}
      </Route>
      <Route path="/rate-plans">
        {() => <ProtectedRoute component={RentalRatePlans} />}
      </Route>
      <Route path="/accessories">
        {() => <ProtectedRoute component={VehicleAccessories} />}
      </Route>
      
      {/* Wave 3: Workforce & Automation */}
      <Route path="/driver-scheduling">
        {() => <ProtectedRoute component={DriverScheduling} />}
      </Route>
      <Route path="/reminders">
        {() => <ProtectedRoute component={AutomatedReminders} />}
      </Route>
      <Route path="/approvals">
        {() => <ProtectedRoute component={ApprovalWorkflows} />}
      </Route>
      <Route path="/risk-scoring">
        {() => <ProtectedRoute component={CustomerRiskScoring} />}
      </Route>
      
      {/* Communication Platform */}
      <Route path="/communication/providers">
        {() => <ProtectedRoute component={CommunicationProviders} />}
      </Route>
      <Route path="/communication/logs">
        {() => <ProtectedRoute component={CommunicationLogs} />}
      </Route>
      <Route path="/notifications/send">
        {() => <ProtectedRoute component={ManualNotificationSender} />}
      </Route>
      <Route path="/campaigns">
        {() => <ProtectedRoute component={CampaignManagement} />}
      </Route>
      
      {/* Advanced Analytics Reports */}
      <Route path="/reports/customer-risk-trends">
        {() => <ProtectedRoute component={CustomerRiskTrends} />}
      </Route>
      <Route path="/reports/toll-expense-analysis">
        {() => <ProtectedRoute component={TollExpenseAnalysis} />}
      </Route>
      <Route path="/reports/traffic-fine-aging">
        {() => <ProtectedRoute component={TrafficFineAgingReport} />}
      </Route>
      <Route path="/reports/incident-cost-analysis">
        {() => <ProtectedRoute component={IncidentCostAnalysis} />}
      </Route>
      <Route path="/reports/maintenance-compliance">
        {() => <ProtectedRoute component={MaintenanceComplianceReport} />}
      </Route>
      <Route path="/reports/driver-utilization">
        {() => <ProtectedRoute component={DriverUtilizationReport} />}
      </Route>
      <Route path="/reports/reminder-delivery-sla">
        {() => <ProtectedRoute component={ReminderDeliverySLA} />}
      </Route>
      <Route path="/reports/approval-turnaround">
        {() => <ProtectedRoute component={ApprovalTurnaroundReport} />}
      </Route>
      
      {/* Predictive Intelligence Reports */}
      <Route path="/reports/predictive/revenue-forecast">
        {() => <ProtectedRoute component={RevenueForecastReport} />}
      </Route>
      <Route path="/reports/predictive/fleet-utilization">
        {() => <ProtectedRoute component={FleetUtilizationForecast} />}
      </Route>
      <Route path="/reports/predictive/customer-churn">
        {() => <ProtectedRoute component={CustomerChurnRiskReport} />}
      </Route>
      <Route path="/reports/predictive/maintenance-forecast">
        {() => <ProtectedRoute component={MaintenanceCostForecast} />}
      </Route>
      <Route path="/reports/predictive/payment-default">
        {() => <ProtectedRoute component={PaymentDefaultPrediction} />}
      </Route>
      <Route path="/reports/predictive/demand-forecast">
        {() => <ProtectedRoute component={LocationDemandForecast} />}
      </Route>
      
      <Route component={() => <NotFound />} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t, i18n } = useTranslation();
  
  // Fetch company settings for dynamic title
  const { data: settings } = useQuery<CompanySettingsType>({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated,
  });

  // Fetch CSRF token when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCsrfToken();
    }
  }, [isAuthenticated]);

  // Update document title with company name
  useEffect(() => {
    if (settings) {
      const companyName = i18n.language === 'ar' 
        ? settings.companyNameAr || settings.companyNameEn
        : settings.companyNameEn || settings.companyNameAr;
      document.title = companyName 
        ? `${companyName} ${t('landing.title')}`
        : t('landing.title');
    } else {
      document.title = t('landing.title');
    }
  }, [settings, i18n.language, t]);

  // Custom sidebar width for contract application
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Determine sidebar side based on language (RTL support)
  const sidebarSide = i18n.language === 'ar' ? 'right' : 'left';

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Router />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar side={sidebarSide as 'left' | 'right'} />
        <main className="flex-1 overflow-auto">
          <Router />
        </main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  // Setup global error handler on mount
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
