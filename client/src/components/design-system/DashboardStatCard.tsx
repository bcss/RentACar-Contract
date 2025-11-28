import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  progress?: number;
  testId?: string;
}

/**
 * Reusable Dashboard Stat Card Component
 * 
 * Standard KPI card with icon, title, value, and optional trend indicator.
 * Use for dashboards, reports, and summary views.
 * 
 * @example
 * <DashboardStatCard
 *   title="Total Revenue"
 *   value="AED 125,430"
 *   icon={DollarSign}
 *   trend={{ value: "+12.5%", isPositive: true, label: "from last month" }}
 *   testId="stat-revenue"
 * />
 */
export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  trend,
  progress,
  testId = 'stat-card',
}: DashboardStatCardProps) {
  return (
    <Card className="hover-elevate active-elevate-2" data-testid={`card-${testId}`}>
      <CardHeader 
        className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2"
        data-testid={`header-${testId}`}
      >
        <CardTitle className="text-sm font-medium" data-testid={`title-${testId}`}>
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" data-testid={`icon-${testId}`} />
      </CardHeader>
      <CardContent data-testid={`content-${testId}`}>
        <div className="text-2xl font-bold" data-testid={`value-${testId}`}>
          {value}
        </div>
        
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground mt-1" data-testid={`trend-${testId}`}>
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3 text-[hsl(var(--positive))]" data-testid={`icon-trend-up-${testId}`} />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-[hsl(var(--negative))]" data-testid={`icon-trend-down-${testId}`} />
            )}
            <span 
              className={`font-medium ${trend.isPositive ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}
              data-testid={`trend-value-${testId}`}
            >
              {trend.value}
            </span>
            <span className="ml-1" data-testid={`trend-label-${testId}`}>
              {trend.label}
            </span>
          </div>
        )}

        {progress !== undefined && (
          <Progress value={progress} className="mt-2" data-testid={`progress-${testId}`} />
        )}
      </CardContent>
    </Card>
  );
}
