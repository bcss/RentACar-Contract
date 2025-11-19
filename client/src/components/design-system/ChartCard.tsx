import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

export interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  testId?: string;
  actions?: ReactNode;
}

export function ChartCard({ title, description, children, testId, actions }: ChartCardProps) {
  return (
    <Card data-testid={testId || 'card-chart'}>
      <CardHeader className="flex flex-row items-center justify-between gap-2" data-testid={`${testId || 'card-chart'}-header`}>
        <div>
          <CardTitle data-testid={`${testId || 'card-chart'}-title`}>{title}</CardTitle>
          {description && (
            <CardDescription data-testid={`${testId || 'card-chart'}-description`}>
              {description}
            </CardDescription>
          )}
        </div>
        {actions && (
          <div data-testid={`${testId || 'card-chart'}-actions`}>{actions}</div>
        )}
      </CardHeader>
      <CardContent data-testid={`${testId || 'card-chart'}-content`}>
        {children}
      </CardContent>
    </Card>
  );
}
