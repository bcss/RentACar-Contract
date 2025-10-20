import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import Sponsors from "@/pages/Sponsors";
import Companies from "@/pages/Companies";
import Contracts from "@/pages/Contracts";
import ContractForm from "@/pages/ContractForm";
import ContractView from "@/pages/ContractView";
import Users from "@/pages/Users";
import DisabledUsers from "@/pages/DisabledUsers";
import DisabledContracts from "@/pages/DisabledContracts";
import AuditLogs from "@/pages/AuditLogs";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import "@/lib/i18n";
import { useEffect } from "react";

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
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Login} />
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
      <Route path="/users">
        {() => <ProtectedRoute component={Users} />}
      </Route>
      <Route path="/disabled-users">
        {() => <ProtectedRoute component={DisabledUsers} />}
      </Route>
      <Route path="/disabled-contracts">
        {() => <ProtectedRoute component={DisabledContracts} />}
      </Route>
      <Route path="/audit-logs">
        {() => <ProtectedRoute component={AuditLogs} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Custom sidebar width for contract application
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Router />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
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
