import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

export interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  testId?: string;
  className?: string;
  contentClassName?: string;
}

export function FilterPanel({ title, children, testId, className, contentClassName }: FilterPanelProps) {
  return (
    <Card className={className} data-testid={testId || 'panel-filters'}>
      {title && (
        <CardHeader data-testid={`${testId || 'panel-filters'}-header`}>
          <CardTitle className="text-base" data-testid={`${testId || 'panel-filters'}-title`}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent data-testid={`${testId || 'panel-filters'}-content`}>
        <div className={contentClassName} data-testid={`${testId || 'panel-filters'}-container`}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
