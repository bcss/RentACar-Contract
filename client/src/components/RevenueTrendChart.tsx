import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';

interface RevenueTrendData {
  month: string;
  totalRevenue: number;
  rentalFees: number;
  extraCharges: number;
  deliveryFees: number;
  contractCount: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
  isLoading?: boolean;
}

type TimeRange = '3M' | '6M' | '12M';

export function RevenueTrendChart({ data, isLoading }: RevenueTrendChartProps) {
  const { currency } = useCurrency();
  const [timeRange, setTimeRange] = useState<TimeRange>('12M');
  
  const monthsToShow = timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
  const filteredData = data.slice(-monthsToShow);
  
  const formatCurrency = (value: number) => {
    return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };
  
  if (isLoading) {
    return (
      <Card data-testid="card-revenue-trend">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card data-testid="card-revenue-trend">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No revenue data available
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid="card-revenue-trend">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 flex-wrap">
        <CardTitle className="text-base font-semibold">Revenue Trend - Last {monthsToShow} Months</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={timeRange === '3M' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('3M')}
            className="h-8 px-3"
            data-testid="button-timerange-3m"
          >
            3M
          </Button>
          <Button
            variant={timeRange === '6M' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('6M')}
            className="h-8 px-3"
            data-testid="button-timerange-6m"
          >
            6M
          </Button>
          <Button
            variant={timeRange === '12M' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('12M')}
            className="h-8 px-3"
            data-testid="button-timerange-12m"
          >
            12M
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={(value) => `${currency} ${(value / 1000).toFixed(0)}k`}
              className="text-xs"
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const label = name === 'totalRevenue' ? 'Total Revenue'
                  : name === 'rentalFees' ? 'Rental Fees'
                  : name === 'extraCharges' ? 'Extra Charges'
                  : name === 'deliveryFees' ? 'Delivery Fees'
                  : name;
                return [formatCurrency(value), label];
              }}
              labelFormatter={(label) => formatMonth(label as string)}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => {
                return value === 'totalRevenue' ? 'Total Revenue'
                  : value === 'rentalFees' ? 'Rental Fees'
                  : value === 'extraCharges' ? 'Extra Charges'
                  : value === 'deliveryFees' ? 'Delivery Fees'
                  : value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalRevenue" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
              activeDot={{ r: 6 }}
              name="totalRevenue"
            />
            <Line 
              type="monotone" 
              dataKey="rentalFees" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--chart-2))', r: 3 }}
              name="rentalFees"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Contracts</p>
            <p className="text-lg font-semibold">
              {filteredData.reduce((sum, d) => sum + d.contractCount, 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Revenue/Month</p>
            <p className="text-lg font-semibold">
              {formatCurrency(
                filteredData.reduce((sum, d) => sum + d.totalRevenue, 0) / filteredData.length
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Highest Month</p>
            <p className="text-lg font-semibold">
              {formatCurrency(Math.max(...filteredData.map(d => d.totalRevenue)))}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Lowest Month</p>
            <p className="text-lg font-semibold">
              {formatCurrency(Math.min(...filteredData.map(d => d.totalRevenue)))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
