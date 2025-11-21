import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export interface MinimalDateInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const MinimalDateInput = React.forwardRef<HTMLDivElement, MinimalDateInputProps>(
  ({ value, onChange, placeholder = "Pick a date", error, disabled, className, icon }, ref) => {
    return (
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <div
            ref={ref}
            className={cn(
              "group flex items-center gap-3 border-b pb-2 transition-colors cursor-pointer",
              error
                ? "border-destructive"
                : "border-border dark:border-slate-700 hover:border-primary",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {icon || (
              <CalendarIcon
                className="h-4 w-4 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "flex-1 text-sm",
                value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {value ? format(value, "PPP") : placeholder}
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);

MinimalDateInput.displayName = "MinimalDateInput";

export { MinimalDateInput };
