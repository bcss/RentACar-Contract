import { LucideIcon, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testId?: string;
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  actionLabel,
  onAction,
  testId
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-testid={testId || 'empty-state'}
    >
      <div className="rounded-full bg-muted p-6 mb-4" data-testid={`${testId || 'empty'}-icon-container`}>
        <Icon className="h-12 w-12 text-muted-foreground" data-testid={`${testId || 'empty'}-icon`} />
      </div>
      <h3 className="text-lg font-semibold mb-2" data-testid={`${testId || 'empty'}-title`}>
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-6" data-testid={`${testId || 'empty'}-description`}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid={`${testId || 'empty'}-action`}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
