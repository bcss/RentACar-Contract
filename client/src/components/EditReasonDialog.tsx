import { useState } from 'react';
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
import { useLocation } from 'wouter';

interface EditReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  contractNumber?: number;
  onConfirm?: (reason: string) => void; // Optional: for custom handling
}

export function EditReasonDialog({
  open,
  onOpenChange,
  contractId,
  contractNumber,
  onConfirm,
}: EditReasonDialogProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [editReason, setEditReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!editReason.trim()) {
      setError(t('contracts.editReasonRequired'));
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
            <Label htmlFor="edit-reason">{t('contracts.editReason')}</Label>
            <Textarea
              id="edit-reason"
              placeholder={t('contracts.editReasonPlaceholder')}
              value={editReason}
              onChange={(e) => {
                setEditReason(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              data-testid="textarea-edit-reason"
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive" data-testid="text-edit-reason-error">
                {error}
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('contracts.editReasonHint')}
          </p>
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
