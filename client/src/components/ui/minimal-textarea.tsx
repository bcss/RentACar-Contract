import * as React from "react";
import { cn } from "@/lib/utils";

export interface MinimalTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: React.ReactNode;
  label?: string;
  error?: boolean;
}

const MinimalTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MinimalTextareaProps
>(({ className, icon, label, error, ...props }, ref) => {
  return (
    <div
      className={cn(
        "border-b pb-2 transition-colors",
        error
          ? "border-destructive"
          : "border-border dark:border-slate-700 focus-within:border-primary"
      )}
    >
      {(icon || label) && (
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="text-muted-foreground shrink-0" aria-hidden="true">
              {icon}
            </div>
          )}
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
        </div>
      )}
      <textarea
        className={cn(
          "w-full bg-transparent outline-none text-sm resize-none",
          "text-foreground placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});

MinimalTextarea.displayName = "MinimalTextarea";

export { MinimalTextarea };
