import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, getErrorTitle } from "@/lib/errorUtils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/**
 * ErrorDisplay Component Modes
 */
export type ErrorDisplayMode = "toast" | "banner" | "inline";
export type ErrorDisplayVariant = "destructive" | "success" | "warning" | "info";

/**
 * ErrorDisplay Component Props
 */
interface ErrorDisplayProps {
  error?: unknown;
  title?: string;
  description?: string;
  variant?: ErrorDisplayVariant;
  mode?: ErrorDisplayMode;
  className?: string;
  onDismiss?: () => void;
}

/**
 * Visual icons for each variant
 */
const variantIcons = {
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};

/**
 * ErrorDisplay Component
 * Displays errors in toast, banner, or inline modes with theme-aware styling
 */
export function ErrorDisplay({
  error,
  title,
  description,
  variant = "destructive",
  mode = "banner",
  className,
  onDismiss,
}: ErrorDisplayProps) {
  // Extract error message if error object is provided
  const resolvedTitle = title || (error ? getErrorTitle(error) : "Error");
  const resolvedDescription = description || (error ? getErrorMessage(error) : undefined);

  // Toast mode is handled by the hook
  if (mode === "toast") {
    return null;
  }

  // Inline mode - compact error message
  if (mode === "inline") {
    const Icon = variantIcons[variant];
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm",
          variant === "destructive" && "text-destructive",
          variant === "success" && "text-green-600 dark:text-green-400",
          variant === "warning" && "text-yellow-600 dark:text-yellow-400",
          variant === "info" && "text-blue-600 dark:text-blue-400",
          className
        )}
        data-testid="error-inline"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{resolvedDescription || resolvedTitle}</span>
      </div>
    );
  }

  // Banner mode - full alert component
  const Icon = variantIcons[variant];
  return (
    <Alert
      variant={variant === "destructive" ? "destructive" : "default"}
      className={cn(
        "mb-4",
        variant === "success" && "border-green-500 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-50",
        variant === "warning" && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-50",
        variant === "info" && "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-50",
        className
      )}
      data-testid="error-banner"
    >
      <Icon className="h-4 w-4" />
      <AlertTitle>{resolvedTitle}</AlertTitle>
      {resolvedDescription && (
        <AlertDescription>{resolvedDescription}</AlertDescription>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 rounded-md p-1 hover-elevate active-elevate-2"
          aria-label="Dismiss"
          data-testid="button-dismiss-error"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}

/**
 * Error state interface for hook-managed errors
 */
interface ErrorState {
  error: unknown;
  title?: string;
  description?: string;
  variant: ErrorDisplayVariant;
  mode: ErrorDisplayMode;
}

/**
 * Hook to display user-friendly error notifications with state management
 * Supports toast, banner, and inline modes with automatic error parsing
 * 
 * Usage for banner/inline modes:
 * ```tsx
 * const { currentError, showError, dismissError } = useErrorDisplay();
 * 
 * // Show banner error
 * showError(error, { mode: "banner" });
 * 
 * // Render banner
 * {currentError && (
 *   <ErrorDisplay 
 *     {...currentError}
 *     onDismiss={dismissError}
 *   />
 * )}
 * ```
 */
export function useErrorDisplay() {
  const { toast } = useToast();
  const [currentError, setCurrentError] = useState<ErrorState | null>(null);

  const dismissError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const showError = useCallback((error: unknown, optionsOrTitle?: string | {
    title?: string;
    mode?: ErrorDisplayMode;
    variant?: ErrorDisplayVariant;
  }) => {
    // Backwards compatibility: accept string as title (defaults to toast mode)
    const options = typeof optionsOrTitle === "string" 
      ? { title: optionsOrTitle, mode: "toast" as ErrorDisplayMode }
      : optionsOrTitle;

    const mode = options?.mode || "toast";
    const variant = options?.variant || "destructive";
    const title = options?.title || getErrorTitle(error);
    const description = getErrorMessage(error);

    // For toast mode, show toast immediately
    if (mode === "toast") {
      toast({
        variant: "destructive",
        title,
        description,
      });
      return;
    }

    // For banner/inline modes, update state
    setCurrentError({
      error,
      title,
      description,
      variant,
      mode,
    });
  }, [toast]);

  const showSuccess = useCallback((title: string, description?: string, options?: {
    mode?: ErrorDisplayMode;
  }) => {
    const mode = options?.mode || "toast";

    // For toast mode, show toast immediately
    if (mode === "toast") {
      toast({
        title,
        description,
      });
      return;
    }

    // For banner/inline modes, update state
    setCurrentError({
      error: null,
      title,
      description,
      variant: "success",
      mode,
    });
  }, [toast]);

  const showWarning = useCallback((title: string, description?: string, options?: {
    mode?: ErrorDisplayMode;
  }) => {
    const mode = options?.mode || "toast";

    if (mode === "toast") {
      toast({
        title,
        description,
        variant: "default",
      });
      return;
    }

    setCurrentError({
      error: null,
      title,
      description,
      variant: "warning",
      mode,
    });
  }, [toast]);

  const showInfo = useCallback((title: string, description?: string, options?: {
    mode?: ErrorDisplayMode;
  }) => {
    const mode = options?.mode || "toast";

    if (mode === "toast") {
      toast({
        title,
        description,
      });
      return;
    }

    setCurrentError({
      error: null,
      title,
      description,
      variant: "info",
      mode,
    });
  }, [toast]);

  return {
    // State for banner/inline rendering
    currentError,
    dismissError,
    
    // Actions
    showError,
    showSuccess,
    showWarning,
    showInfo,
    
    // Raw toast for custom use
    toast,
  };
}
