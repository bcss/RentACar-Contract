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
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 pb-1.5">
        <div className="flex-1">
          <CardTitle className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        <div className={`h-7 w-7 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${styles.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-base font-semibold tabular-nums tracking-tight" data-testid={valueTestId}>
          {value}
        </div>
        {subtitle && (
          <div className="mt-1">
            {typeof subtitle === 'string' ? (
              <span className="text-[10px] text-muted-foreground leading-4">{subtitle}</span>
            ) : (
              subtitle
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
