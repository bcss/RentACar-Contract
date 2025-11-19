import { LucideIcon } from 'lucide-react';

export type TimelineVariant = 'success' | 'info' | 'warning' | 'error' | 'default';

export interface TimelineEventProps {
  time: string;
  action: string;
  user?: string;
  icon: LucideIcon;
  variant?: TimelineVariant;
  showLine?: boolean;
  testId?: string;
}

const variantStyles: Record<TimelineVariant, string> = {
  success: 'text-emerald-600 dark:text-emerald-500',
  info: 'text-cyan-600 dark:text-cyan-500',
  warning: 'text-amber-600 dark:text-amber-500',
  error: 'text-rose-600 dark:text-rose-500',
  default: 'text-primary',
};

export function TimelineEvent({
  time,
  action,
  user,
  icon: Icon,
  variant = 'default',
  showLine = false,
  testId
}: TimelineEventProps) {
  const iconColorClass = variantStyles[variant];

  return (
    <div className="flex gap-4" data-testid={testId || 'timeline-event'}>
      <div className="flex flex-col items-center" data-testid={`${testId || 'timeline'}-indicator`}>
        <div className={`rounded-full p-2 bg-muted ${iconColorClass}`} data-testid={`${testId || 'timeline'}-icon`}>
          <Icon className="h-4 w-4" />
        </div>
        {showLine && (
          <div className="w-px h-12 bg-border mt-2" data-testid={`${testId || 'timeline'}-line`} />
        )}
      </div>
      <div className="flex-1 pb-4" data-testid={`${testId || 'timeline'}-content`}>
        <p className="font-medium" data-testid={`${testId || 'timeline'}-action`}>
          {action}
        </p>
        {user && (
          <p className="text-sm text-muted-foreground" data-testid={`${testId || 'timeline'}-user`}>
            {user}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1" data-testid={`${testId || 'timeline'}-time`}>
          {time}
        </p>
      </div>
    </div>
  );
}
