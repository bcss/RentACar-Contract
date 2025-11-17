import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Consistent form section with optional title and description
 * Provides visual separation between form sections
 */
export function FormSection({ title, description, children, className = "" }: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-medium leading-none">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <Separator className="mt-4" />
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
