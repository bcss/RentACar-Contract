import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, getErrorTitle } from "@/lib/errorUtils";

/**
 * Hook to display user-friendly error notifications
 * Automatically parses error objects and extracts clean messages
 */
export function useErrorDisplay() {
  const { toast } = useToast();

  const showError = (error: unknown, fallbackTitle?: string) => {
    const title = fallbackTitle || getErrorTitle(error);
    const description = getErrorMessage(error);

    toast({
      variant: "destructive",
      title,
      description,
    });
  };

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };

  return {
    showError,
    showSuccess,
    toast, // Expose raw toast for custom use
  };
}
