import * as React from "react";
import { cn } from "@/lib/utils";

export interface MinimalInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
  rightElement?: React.ReactNode;
}

const MinimalInput = React.forwardRef<HTMLInputElement, MinimalInputProps>(
  ({ className, type, icon, error, rightElement, ...props }, ref) => {
    return (
      <div
        className={cn(
          "group flex items-center gap-3 border-b pb-2 transition-colors",
          error
            ? "border-destructive"
            : "border-border dark:border-slate-700 focus-within:border-primary",
          className
        )}
      >
        {icon && (
          <div className="text-muted-foreground shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex-1 bg-transparent outline-none text-sm",
            "text-foreground placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          ref={ref}
          {...props}
        />
        {rightElement && <div className="shrink-0">{rightElement}</div>}
      </div>
    );
  }
);

MinimalInput.displayName = "MinimalInput";

export { MinimalInput };
