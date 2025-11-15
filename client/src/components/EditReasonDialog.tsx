import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

interface EditReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  contractNumber?: number;
  contractStatus?: string; // Used to determine validation requirements
  onConfirm?: (reason: string) => void; // Optional: for custom handling
}

// Validation function (matches backend logic)
function validateEditReason(reason: string, requiresStrictValidation: boolean): { 
  valid: boolean; 
  error?: string; 
  wordCount: number;
  minimumWords: number;
} {
  const trimmedReason = reason.trim();
  
  if (trimmedReason === '') {
    return { 
      valid: false, 
      error: 'Edit reason cannot be empty', 
      wordCount: 0,
      minimumWords: requiresStrictValidation ? 10 : 1
    };
  }

  // Split by whitespace and filter words with 3+ characters
  const words = trimmedReason.split(/\s+/).filter(word => word.length >= 3);
  const minimumWords = requiresStrictValidation ? 10 : 1;
  
  if (words.length < minimumWords) {
    return { 
      valid: false, 
      error: requiresStrictValidation 
        ? `Reason must contain at least ${minimumWords} meaningful words (3+ characters each). Currently: ${words.length} valid word${words.length === 1 ? '' : 's'}.`
        : 'Please provide a reason for this edit',
      wordCount: words.length,
      minimumWords
    };
  }

  return { valid: true, wordCount: words.length, minimumWords };
}

export function EditReasonDialog({
  open,
  onOpenChange,
  contractId,
  contractNumber,
  contractStatus = 'draft',
  onConfirm,
}: EditReasonDialogProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [editReason, setEditReason] = useState('');
  const [error, setError] = useState('');

  // Determine if strict validation is required (Active or Completed contracts)
  const requiresStrictValidation = contractStatus === 'active' || contractStatus === 'completed';

  // Calculate word count in real-time
  const validation = useMemo(() => {
    if (!editReason.trim()) {
      return { valid: false, wordCount: 0, minimumWords: requiresStrictValidation ? 10 : 1 };
    }
    return validateEditReason(editReason, requiresStrictValidation);
  }, [editReason, requiresStrictValidation]);

  const handleConfirm = () => {
    const validationResult = validateEditReason(editReason, requiresStrictValidation);
    
    if (!validationResult.valid) {
      setError(validationResult.error || 'Invalid edit reason');
      return;
    }

    // Store edit reason in sessionStorage so the form can access it
    sessionStorage.setItem(`editReason_${contractId}`, editReason.trim());

    if (onConfirm) {
      onConfirm(editReason.trim());
    } else {
      // Default behavior: navigate to edit form
      setLocation(`/contracts/${contractId}/edit`);
    }

    // Reset and close
    setEditReason('');
    setError('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditReason('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-edit-reason">
        <DialogHeader>
          <DialogTitle>{t('contracts.editReasonDialogTitle')}</DialogTitle>
          <DialogDescription>
            {contractNumber
              ? t('contracts.editReasonDialogDescription', { number: contractNumber })
              : t('contracts.editReasonDialogDescriptionGeneric')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-reason">{t('contracts.editReason')}</Label>
              <Badge 
                variant={validation.valid ? "default" : "secondary"}
                data-testid="badge-word-count"
              >
                {validation.wordCount} / {validation.minimumWords} words
              </Badge>
            </div>
            <Textarea
              id="edit-reason"
              placeholder={
                requiresStrictValidation 
                  ? "Please provide a detailed reason for editing this active/completed contract. Use at least 10 meaningful words (3+ characters each)."
                  : t('contracts.editReasonPlaceholder')
              }
              value={editReason}
              onChange={(e) => {
                setEditReason(e.target.value);
                if (error) setError('');
              }}
              rows={5}
              data-testid="textarea-edit-reason"
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive" data-testid="text-edit-reason-error">
                {error}
              </p>
            )}
          </div>
          {requiresStrictValidation ? (
            <div className="rounded-md bg-muted p-3 space-y-1">
              <p className="text-sm font-medium">Validation Requirements:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Minimum 10 meaningful words (3+ characters each)</li>
                <li>Short words like "a", "an", "is", "or" are not counted</li>
                <li>Explain why this edit is necessary</li>
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('contracts.editReasonHint')}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-edit-reason"
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} data-testid="button-confirm-edit-reason">
            {t('contracts.proceedToEdit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
