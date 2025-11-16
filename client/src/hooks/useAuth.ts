import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

interface UseAuthReturn {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isViewer: boolean;
  // Permission toggles
  canAccessReports: boolean;
  canCloseContracts: boolean;
  canViewAllContracts: boolean;
  // Granular report permissions
  canAccessRevenueTrends: boolean;
  canAccessFleetPerformance: boolean;
  canAccessContractAnalytics: boolean;
  canAccessCollectionPerformance: boolean;
  canAccessFinancialReports: boolean;
  canAccessOperationalReports: boolean;
  canAccessCustomerReports: boolean;
  canAccessInsuranceReports: boolean;
  canAccessAuditReports: boolean;
  canAccessUserActivityReports: boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const hasElevatedAccess = isAdmin || isManager;

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isManager,
    isStaff: user?.role === 'staff',
    isViewer: user?.role === 'viewer',
    // Permission toggles - default to false if not set
    canAccessReports: user?.canAccessReports ?? false,
    canCloseContracts: user?.canCloseContracts ?? false,
    canViewAllContracts: user?.canViewAllContracts ?? false,
    // Granular report permissions - Admin/Manager have full access, others check their flags
    canAccessRevenueTrends: hasElevatedAccess || (user?.canAccessRevenueTrends ?? false),
    canAccessFleetPerformance: hasElevatedAccess || (user?.canAccessFleetPerformance ?? false),
    canAccessContractAnalytics: hasElevatedAccess || (user?.canAccessContractAnalytics ?? false),
    canAccessCollectionPerformance: hasElevatedAccess || (user?.canAccessCollectionPerformance ?? false),
    canAccessFinancialReports: hasElevatedAccess || (user?.canAccessFinancialReports ?? false),
    canAccessOperationalReports: hasElevatedAccess || (user?.canAccessOperationalReports ?? false),
    canAccessCustomerReports: hasElevatedAccess || (user?.canAccessCustomerReports ?? false),
    canAccessInsuranceReports: hasElevatedAccess || (user?.canAccessInsuranceReports ?? false),
    canAccessAuditReports: hasElevatedAccess || (user?.canAccessAuditReports ?? false),
    canAccessUserActivityReports: hasElevatedAccess || (user?.canAccessUserActivityReports ?? false),
  };
}
