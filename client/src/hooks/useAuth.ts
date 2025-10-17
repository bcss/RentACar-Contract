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
  };
}
