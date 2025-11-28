import { Button } from "@/components/ui/button";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { useTranslation } from "react-i18next";

interface ActionButtonsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  type?: "submit" | "button";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showCancel?: boolean;
}

/**
 * Consistent action buttons for forms (Submit/Cancel/Back)
 * Handles loading states and bilingual labels automatically
 */
export function ActionButtons({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel,
  isLoading = false,
  submitDisabled = false,
  cancelDisabled = false,
  type = "submit",
  variant = "default",
  className = "",
  showCancel = true,
}: ActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      {showCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || cancelDisabled}
          data-testid="button-cancel"
        >
          {cancelLabel || t('common.cancel')}
        </Button>
      )}
      <Button
        type={type}
        variant={variant}
        onClick={type === "button" ? onSubmit : undefined}
        disabled={isLoading || submitDisabled}
        data-testid="button-submit"
      >
        {isLoading && <MaterialSymbol name="progress_activity" size="sm" className="mr-2 animate-spin" />}
        {submitLabel || t('common.submit')}
      </Button>
    </div>
  );
}
