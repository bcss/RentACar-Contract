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
}

export function useAuth(): UseAuthReturn {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'staff',
    isViewer: user?.role === 'viewer',
    // Permission toggles - default to false if not set
    canAccessReports: user?.canAccessReports ?? false,
    canCloseContracts: user?.canCloseContracts ?? false,
    canViewAllContracts: user?.canViewAllContracts ?? false,
  };
}
