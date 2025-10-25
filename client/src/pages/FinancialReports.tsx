import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { captureMultipleCharts } from '@/utils/chartExport';
import { useToast } from '@/hooks/use-toast';

interface FinancialReport {
  summary: {
    totalRevenue: number;
    allTimeRevenue: number;
    totalCollected: number;
    totalOutstanding: number;
    collectionRate: number;
  };
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
    contractCount: number;
  }>;
  revenueByStatus: {
    confirmed: number;
    active: number;
    completed: number;
    closed: number;
  };
  methodBreakdown: Array<{
    method: string;
    amount: number;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    method: string;
    date: string;
    contractNumber: number;
    contractId: string;
  }>;
  outstandingPayments: Array<{
    contractId: string;
    contractNumber: number;
    customerName: string;
    totalAmount: number;
    collected: number;
    outstanding: number;
    status: string;
    dueDate: string;
  }>;
}

export default function FinancialReports() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('revenue');

  // Build query URL with date filters
  const getQueryUrl = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    return `/api/reports/financial${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const { toast } = useToast();
  
  // Export handlers
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      toast({
        title: t('common.processing'),
        description: 'Capturing charts...',
      });
      
      // Capture charts based on active tab
      const chartsToCapture = activeTab === 'revenue' 
        ? [
            { elementId: 'financial-chart-revenue-trend', chartName: 'Monthly Revenue Trend' },
            { elementId: 'financial-chart-revenue-status', chartName: 'Revenue by Status' },
          ]
        : activeTab === 'collection'
        ? [
            { elementId: 'financial-chart-payment-methods', chartName: 'Payment Methods' },
          ]
        : []; // No charts on outstanding tab
      
      const chartImages = await captureMultipleCharts(chartsToCapture);
      
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('lang', i18n.language);
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      const response = await fetch(`/api/reports/financial/export?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ charts: chartImages }),
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: t('common.success'),
        description: 'Report exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const { data: report, isLoading } = useQuery<FinancialReport>({
    queryKey: ['/api/reports/financial', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(getQueryUrl(), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch financial report');
      return response.json();
    },
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return `0.00 ${currency}`;
    }
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMM yyyy');
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      confirmed: 'secondary',
      active: 'default',
      completed: 'default',
      closed: 'outline',
    };
    return variants[status] || 'outline';
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: t('financialReports.cash'),
      card: t('financialReports.card'),
      bank_transfer: t('financialReports.bankTransfer'),
      unknown: t('financialReports.unknown'),
    };
    return labels[method] || method;
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardHeader>
            <CardTitle>{t('common.error')}</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t('financialReports.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial analysis and reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')} data-testid="button-export-pdf">
            <span className="material-icons mr-2">picture_as_pdf</span>
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} data-testid="button-export-excel">
            <span className="material-icons mr-2">table_chart</span>
            Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('financialReports.dateRange')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateFrom')}</label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder={t('common.dateFrom')}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateTo')}</label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder={t('common.dateTo')}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={!startDate && !endDate}
              data-testid="button-clear-filters"
            >
              <span className="material-icons mr-2">clear</span>
              {t('financialReports.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-financial-reports">
          <TabsTrigger value="revenue" data-testid="tab-revenue">
            {t('financialReports.revenueSummary')}
          </TabsTrigger>
          <TabsTrigger value="collection" data-testid="tab-collection">
            {t('financialReports.paymentCollection')}
          </TabsTrigger>
          <TabsTrigger value="outstanding" data-testid="tab-outstanding">
            {t('financialReports.outstandingPayments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('financialReports.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('financialReports.allTimeRevenue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-all-time-revenue">
                      {formatCurrency(report.summary.allTimeRevenue)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('financialReports.selectedPeriod')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-period-revenue">
                      {formatCurrency(report.summary.totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {startDate && endDate
                        ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                        : 'All time'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-monthly-revenue-chart">
                <CardHeader>
                  <CardTitle>{t('financialReports.monthlyRevenueTrend')}</CardTitle>
                  <CardDescription>Revenue trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.monthlyBreakdown.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t('financialReports.noData')}
                    </p>
                  ) : (
                    <div id="financial-chart-revenue-trend">
                    <ResponsiveContainer width="100%" minHeight={300}>
                      <LineChart data={report.monthlyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={formatMonth}
                          className="text-xs"
                        />
                        <YAxis 
                          tickFormatter={(value) => `${value.toLocaleString()}`}
                          className="text-xs"
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            return (
                              <div className="bg-background border border-border rounded-md p-3 shadow-lg">
                                <p className="text-sm font-medium mb-1">
                                  {formatMonth(payload[0].payload.month)}
                                </p>
                                <p className="text-sm text-primary">
                                  Revenue: {formatCurrency(payload[0].value as number)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Contracts: {payload[0].payload.contractCount}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                          name="Revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('financialReports.monthlyBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {report.monthlyBreakdown.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t('financialReports.noData')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="table-header-month">{t('financialReports.month')}</TableHead>
                          <TableHead className="text-right" data-testid="table-header-revenue">
                            {t('financialReports.revenue')}
                          </TableHead>
                          <TableHead className="text-right" data-testid="table-header-contracts">
                            {t('financialReports.contractCount')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.monthlyBreakdown.map((item) => (
                          <TableRow key={item.month} data-testid={`row-month-${item.month}`}>
                            <TableCell className="font-medium">{formatMonth(item.month)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                            <TableCell className="text-right">{item.contractCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-revenue-by-status-chart">
                <CardHeader>
                  <CardTitle>{t('financialReports.revenueByStatus')}</CardTitle>
                  <CardDescription>Revenue distribution across contract statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div id="financial-chart-revenue-status">
                  <ResponsiveContainer width="100%" minHeight={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: t('financialReports.confirmed'), value: report.revenueByStatus.confirmed, color: 'hsl(207, 90%, 54%)' },
                          { name: t('financialReports.active'), value: report.revenueByStatus.active, color: 'hsl(142, 71%, 45%)' },
                          { name: t('financialReports.completed'), value: report.revenueByStatus.completed, color: 'hsl(199, 89%, 48%)' },
                          { name: t('financialReports.closed'), value: report.revenueByStatus.closed, color: 'hsl(220, 9%, 46%)' },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: t('financialReports.confirmed'), value: report.revenueByStatus.confirmed, color: 'hsl(207, 90%, 54%)' },
                          { name: t('financialReports.active'), value: report.revenueByStatus.active, color: 'hsl(142, 71%, 45%)' },
                          { name: t('financialReports.completed'), value: report.revenueByStatus.completed, color: 'hsl(199, 89%, 48%)' },
                          { name: t('financialReports.closed'), value: report.revenueByStatus.closed, color: 'hsl(220, 9%, 46%)' },
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          return (
                            <div className="bg-background border border-border rounded-md p-3 shadow-lg">
                              <p className="text-sm font-medium mb-1">
                                {payload[0].name}
                              </p>
                              <p className="text-sm text-primary">
                                {formatCurrency(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="collection" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('financialReports.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('financialReports.collectionRate')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-collection-rate">
                      {report.summary.collectionRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('financialReports.collectedAmount')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-collected">
                      {formatCurrency(report.summary.totalCollected)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('financialReports.outstandingAmount')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-outstanding-summary">
                      {formatCurrency(report.summary.totalOutstanding)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-payment-methods-chart">
                <CardHeader>
                  <CardTitle>{t('financialReports.paymentMethods')}</CardTitle>
                  <CardDescription>Payment method breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.methodBreakdown.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t('financialReports.noPayments')}
                    </p>
                  ) : (
                    <div id="financial-chart-payment-methods">
                    <ResponsiveContainer width="100%" minHeight={300}>
                      <PieChart>
                        <Pie
                          data={report.methodBreakdown.map((item, index) => ({
                            name: getPaymentMethodLabel(item.method),
                            value: item.amount,
                            color: [
                              'hsl(142, 71%, 45%)',
                              'hsl(199, 89%, 48%)',
                              'hsl(207, 90%, 54%)',
                              'hsl(45, 100%, 51%)',
                            ][index % 4]
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {report.methodBreakdown.map((item, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                'hsl(142, 71%, 45%)',
                                'hsl(199, 89%, 48%)',
                                'hsl(207, 90%, 54%)',
                                'hsl(45, 100%, 51%)',
                              ][index % 4]}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            return (
                              <div className="bg-background border border-border rounded-md p-3 shadow-lg">
                                <p className="text-sm font-medium mb-1">
                                  {payload[0].name}
                                </p>
                                <p className="text-sm text-primary">
                                  {formatCurrency(payload[0].value as number)}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('financialReports.recentPayments')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {report.recentPayments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t('financialReports.noPayments')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="table-header-amount">{t('financialReports.amount')}</TableHead>
                          <TableHead data-testid="table-header-method">{t('financialReports.method')}</TableHead>
                          <TableHead data-testid="table-header-date">{t('financialReports.paymentDate')}</TableHead>
                          <TableHead data-testid="table-header-contract">{t('financialReports.contractNumber')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.recentPayments.map((payment) => (
                          <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                            <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{getPaymentMethodLabel(payment.method)}</TableCell>
                            <TableCell>{format(new Date(payment.date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              <Link href={`/contracts/${payment.contractId}`}>
                                <span className="text-primary hover:underline">#{payment.contractNumber}</span>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('financialReports.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('financialReports.outstandingPayments')}</CardTitle>
                <CardDescription>
                  Sorted by outstanding amount (highest first)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.outstandingPayments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    {t('financialReports.noOutstanding')}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-header-contract-num">{t('financialReports.contractNumber')}</TableHead>
                        <TableHead data-testid="table-header-customer">{t('financialReports.customerName')}</TableHead>
                        <TableHead className="text-right" data-testid="table-header-total">{t('financialReports.totalAmount')}</TableHead>
                        <TableHead className="text-right" data-testid="table-header-paid">{t('financialReports.paid')}</TableHead>
                        <TableHead className="text-right" data-testid="table-header-outstanding">{t('financialReports.outstanding')}</TableHead>
                        <TableHead data-testid="table-header-status">{t('financialReports.status')}</TableHead>
                        <TableHead data-testid="table-header-due">{t('financialReports.dueDate')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.outstandingPayments.map((contract) => (
                        <TableRow key={contract.contractId} data-testid={`row-outstanding-${contract.contractId}`}>
                          <TableCell className="font-medium">
                            <Link href={`/contracts/${contract.contractId}`}>
                              <span className="text-primary hover:underline">#{contract.contractNumber}</span>
                            </Link>
                          </TableCell>
                          <TableCell>{contract.customerName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(contract.totalAmount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(contract.collected)}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(contract.outstanding)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(contract.status)}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(contract.dueDate), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
