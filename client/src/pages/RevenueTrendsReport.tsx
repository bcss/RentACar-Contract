import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icon } from '@/components/Icon';
import {TrendIndicator} from '@/components/TrendIndicator';
import { Download } from 'lucide-react';
import { generateCSV, downloadCSV, safeToFixed } from '@/utils/csvExport';

export default function RevenueTrendsReport() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const [months, setMonths] = useState<number>(12);

  const { data: trendData = [], isLoading: trendLoading } = useQuery<any[]>({
    queryKey: ['/api/analytics/revenue-trend', months],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/revenue-trend?months=${months}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch revenue trend');
      return response.json();
    },
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return `0.00 ${currency}`;
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatMonth = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMM yyyy');
  };

  // Calculate summary metrics
  const totalRevenue = trendData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  const totalContracts = trendData.reduce((sum, item) => sum + (item.contractCount || 0), 0);
  const avgRevenuePerMonth = trendData.length > 0 ? totalRevenue / trendData.length : 0;
  const avgRevenuePerContract = totalContracts > 0 ? totalRevenue / totalContracts : 0;

  // Find highest and lowest revenue months
  const sortedByRevenue = [...trendData].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const highestMonth = sortedByRevenue[0];
  const lowestMonth = sortedByRevenue[sortedByRevenue.length - 1];

  // Calculate month-over-month growth
  const recentMonth = trendData[trendData.length - 1];
  const previousMonth = trendData[trendData.length - 2];
  const revenueGrowth = previousMonth && previousMonth.totalRevenue > 0
    ? ((recentMonth?.totalRevenue || 0) - previousMonth.totalRevenue) / previousMonth.totalRevenue * 100
    : 0;

  const handleExportCSV = () => {
    const csvData = [
      ['Revenue Trends Report', '', format(new Date(), 'yyyy-MM-dd HH:mm')],
      [],
      ['Summary'],
      ['Total Revenue', totalRevenue],
      ['Total Contracts', totalContracts],
      ['Avg Revenue Per Month', avgRevenuePerMonth],
      ['Avg Revenue Per Contract', avgRevenuePerContract],
      ['Month-over-Month Growth', `${safeToFixed(revenueGrowth)}%`],
      [],
      ['Monthly Trends'],
      ['Month', 'Total Revenue', 'Contracts', 'Avg per Contract'],
      ...trendData.map(t => [
        t.month ?? '',
        t.totalRevenue ?? 0,
        t.contractCount ?? 0,
        t.contractCount > 0 ? safeToFixed(t.totalRevenue / t.contractCount) : '0.00'
      ])
    ];

    const csv = generateCSV(csvData);
    downloadCSV(csv, `revenue-trends-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="container max-w-7xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('common.accessDenied')}</CardTitle>
            <CardDescription>{t('common.noPermission')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-revenue-trends">Revenue Trends Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive revenue performance analysis and forecasting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={trendLoading} data-testid="button-export-csv">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" data-testid="button-refresh">
            <Icon name="refresh" className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {trendLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Icon name="payments" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-revenue">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last {months} months
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-monthly">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly Revenue</CardTitle>
              <Icon name="trending_up" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-avg-monthly">
                {formatCurrency(avgRevenuePerMonth)}
              </div>
              {recentMonth && previousMonth && (
                <div className="mt-1">
                  <TrendIndicator
                    value={recentMonth.totalRevenue}
                    previousValue={previousMonth.totalRevenue}
                    format="currency"
                    currency={currency}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-total-contracts">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <Icon name="description" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-contracts">
                {totalContracts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(avgRevenuePerContract)} avg/contract
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-revenue-growth">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MoM Growth</CardTitle>
              <Icon name="show_chart" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-growth">
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs previous month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Trend Analysis</CardTitle>
            <CardDescription>Monthly revenue breakdown by component</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={months === 3 ? "default" : "outline"}
              size="sm"
              onClick={() => setMonths(3)}
              data-testid="button-3months"
            >
              3M
            </Button>
            <Button
              variant={months === 6 ? "default" : "outline"}
              size="sm"
              onClick={() => setMonths(6)}
              data-testid="button-6months"
            >
              6M
            </Button>
            <Button
              variant={months === 12 ? "default" : "outline"}
              size="sm"
              onClick={() => setMonths(12)}
              data-testid="button-12months"
            >
              12M
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : trendData.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              No data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{formatMonth(payload[0].payload.month)}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Total Revenue:</span>
                            <span className="font-medium">{formatCurrency(payload[0].payload.totalRevenue)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Rental Fees:</span>
                            <span className="font-medium">{formatCurrency(payload[0].payload.rentalFees)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Extra Charges:</span>
                            <span className="font-medium">{formatCurrency(payload[0].payload.extraCharges)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Delivery Fees:</span>
                            <span className="font-medium">{formatCurrency(payload[0].payload.deliveryFees)}</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t">
                            <span className="text-muted-foreground">Contracts:</span>
                            <span className="font-medium">{payload[0].payload.contractCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="rentalFees" stackId="1" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} name="Rental Fees" />
                <Area type="monotone" dataKey="extraCharges" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="Extra Charges" />
                <Area type="monotone" dataKey="deliveryFees" stackId="1" stroke="#67e8f9" fill="#67e8f9" fillOpacity={0.6} name="Delivery Fees" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Performers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Summary</CardTitle>
          <CardDescription>Detailed breakdown of revenue by month</CardDescription>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Rental Fees</TableHead>
                    <TableHead className="text-right">Extra Charges</TableHead>
                    <TableHead className="text-right">Delivery Fees</TableHead>
                    <TableHead className="text-right">Contracts</TableHead>
                    <TableHead className="text-right">Avg/Contract</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...trendData].reverse().map((item, index) => {
                    const avgPerContract = item.contractCount > 0 ? item.totalRevenue / item.contractCount : 0;
                    return (
                      <TableRow key={index} data-testid={`row-month-${index}`}>
                        <TableCell className="font-medium">{formatMonth(item.month)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalRevenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rentalFees)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.extraCharges)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.deliveryFees)}</TableCell>
                        <TableCell className="text-right">{item.contractCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(avgPerContract)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {!trendLoading && highestMonth && lowestMonth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card data-testid="card-highest-month">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="star" className="text-yellow-500" />
                Best Performing Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatMonth(highestMonth.month)}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(highestMonth.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contracts Closed:</span>
                  <span className="font-medium">{highestMonth.contractCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-lowest-month">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="trending_down" className="text-muted-foreground" />
                Lowest Performing Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatMonth(lowestMonth.month)}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(lowestMonth.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contracts Closed:</span>
                  <span className="font-medium">{lowestMonth.contractCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
