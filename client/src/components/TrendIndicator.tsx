import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  format?: 'percentage' | 'number' | 'currency';
  currency?: string;
  inverse?: boolean;
  className?: string;
}

export function TrendIndicator({ 
  value, 
  previousValue, 
  format = 'number',
  currency = 'AED',
  inverse = false,
  className 
}: TrendIndicatorProps) {
  const changePercent = previousValue > 0 
    ? ((value - previousValue) / previousValue) * 100 
    : value > 0 ? 100 : 0;
  
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;
  const isNeutral = changePercent === 0;
  
  const isGood = inverse ? isNegative : isPositive;
  const isBad = inverse ? isPositive : isNegative;
  
  const trendColor = isGood 
    ? 'text-chart-2' 
    : isBad 
      ? 'text-destructive' 
      : 'text-muted-foreground';
  
  const TrendIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;
  
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `${currency} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'number':
      default:
        return val.toLocaleString('en-US');
    }
  };
  
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)} data-testid="trend-indicator">
      <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
      <span className={cn("font-medium", trendColor)} data-testid="trend-percentage">
        {Math.abs(changePercent).toFixed(1)}%
      </span>
      <span className="text-muted-foreground">
        vs last month
      </span>
      {previousValue > 0 && (
        <span className="text-muted-foreground hidden sm:inline">
          ({formatValue(previousValue)})
        </span>
      )}
    </div>
  );
}
