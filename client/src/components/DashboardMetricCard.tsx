import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string | ReactNode;
  variant?: 'default' | 'primary' | 'destructive' | 'success';
  className?: string;
  testId?: string;
  valueTestId?: string;
}

export function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'default',
  className = '',
  testId,
  valueTestId,
}: DashboardMetricCardProps) {
  const variantStyles = {
    default: {
      card: 'border border-transparent bg-[hsl(var(--muted)/0.5)]',
      iconBg: 'bg-[hsl(var(--muted))]',
      iconColor: 'text-muted-foreground',
    },
    primary: {
      card: 'border border-transparent bg-[hsl(var(--primary)/0.08)] shadow-md',
      iconBg: 'bg-[hsl(var(--primary)/0.15)]',
      iconColor: 'text-primary',
    },
    destructive: {
      card: 'border border-[hsl(var(--destructive)/0.2)] bg-[hsl(var(--destructive)/0.08)] shadow-md',
      iconBg: 'bg-[hsl(var(--destructive)/0.15)]',
      iconColor: 'text-destructive',
    },
    success: {
      card: 'border border-transparent bg-[hsl(var(--positive)/0.08)] shadow-md',
      iconBg: 'bg-[hsl(var(--positive)/0.15)]',
      iconColor: 'text-[hsl(var(--positive))]',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card 
      className={`${styles.card} hover-elevate transition-all duration-200 ${className}`}
      data-testid={testId}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 pb-2">
        <div className="flex-1">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        <div className={`h-8 w-8 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${styles.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-bold tabular-nums tracking-tight" data-testid={valueTestId}>
          {value}
        </div>
        {subtitle && (
          <div className="mt-1.5">
            {typeof subtitle === 'string' ? (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            ) : (
              subtitle
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
