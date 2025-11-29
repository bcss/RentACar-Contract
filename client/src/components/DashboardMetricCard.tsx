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
      className={`flex flex-col gap-1.5 rounded-xl p-4 border ${className}`}
      data-testid={testId}
    >
      <p className="text-sm font-medium leading-normal text-muted-foreground">
        {title}
      </p>
      <p className="tracking-tight text-2xl font-bold leading-tight tabular-nums" data-testid={valueTestId}>
        {value}
      </p>
      {subtitle && (
        <div className="text-sm font-medium leading-normal">
          {typeof subtitle === 'string' ? (
            <span className="text-muted-foreground">{subtitle}</span>
          ) : (
            subtitle
          )}
        </div>
      )}
    </Card>
  );
}
