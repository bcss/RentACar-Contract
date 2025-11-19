import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  testId?: string;
}

export function PageHeader({ title, description, actions, testId }: PageHeaderProps) {
  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      data-testid={testId || 'page-header'}
    >
      <div className="space-y-1" data-testid={`${testId || 'header'}-content`}>
        <h1 className="text-3xl font-bold tracking-tight" data-testid={`${testId || 'header'}-title`}>
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground" data-testid={`${testId || 'header'}-description`}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2" data-testid={`${testId || 'header'}-actions`}>
          {actions}
        </div>
      )}
    </div>
  );
}
