import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MinimalSelectProps {
  icon?: React.ReactNode;
  error?: boolean;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const MinimalSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  MinimalSelectProps
>(({ icon, error, placeholder, className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Root {...props}>
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
        <SelectPrimitive.Trigger
          className={cn(
            "flex-1 flex items-center justify-between bg-transparent outline-none text-sm",
            "text-foreground data-[placeholder]:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </SelectPrimitive.Trigger>
      </div>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          position="popper"
          sideOffset={5}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});

MinimalSelect.displayName = "MinimalSelect";

const MinimalSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

MinimalSelectItem.displayName = "MinimalSelectItem";

export { MinimalSelect, MinimalSelectItem };
