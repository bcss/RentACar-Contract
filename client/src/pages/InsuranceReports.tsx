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
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { captureMultipleCharts } from '@/utils/chartExport';
import { useToast } from '@/hooks/use-toast';
import { Icon } from '@/components/Icon';

interface InsuranceReport {
  summary: {
    totalClaims: number;
    pendingClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
    settledClaims: number;
    totalClaimAmount: number;
    totalApprovedAmount: number;
    totalSettledAmount: number;
  };
  claimsByStatus: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    claimCount: number;
    claimAmount: number;
  }>;
  claimsByInsurer: Array<{
    insuranceCompany: string;
    claimCount: number;
    totalAmount: number;
  }>;
  recentClaims: Array<{
    id: string;
    claimNumber: string;
    contractNumber: number;
    contractId: string;
    claimDate: string;
    incidentDate: string;
    claimStatus: string;
    claimAmount: number;
    insuranceCompany: string;
    claimantName: string;
  }>;
}

export default function InsuranceReports() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager, canAccessReports } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('overview');

  // Build query URL with date filters
  const getQueryUrl = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    return `/api/reports/insurance${params.toString() ? `?${params.toString()}` : ''}`;
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
      const chartsToCapture = activeTab === 'overview' 
        ? [
            { elementId: 'insurance-chart-status', chartName: 'Claims by Status' },
            { elementId: 'insurance-chart-trend', chartName: 'Monthly Claim Trend' },
          ]
        : activeTab === 'analysis'
        ? [
            { elementId: 'insurance-chart-insurers', chartName: 'Claims by Insurer' },
          ]
        : []; // No charts on claims tab
      
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
      
      const response = await fetch(`/api/reports/insurance/export?${params.toString()}`, {
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
      a.download = `insurance-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
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

  const { data: report, isLoading } = useQuery<InsuranceReport>({
    queryKey: ['/api/reports/insurance', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(getQueryUrl(), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch insurance report');
      return response.json();
    },
    enabled: canAccessReports || isAdmin || isManager,
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

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'outline',
      settled: 'outline',
    };
    return variants[status] || 'outline';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'hsl(45, 100%, 51%)',
      approved: 'hsl(142, 71%, 45%)',
      rejected: 'hsl(0, 84%, 60%)',
      settled: 'hsl(199, 89%, 48%)',
    };
    return colors[status] || 'hsl(220, 9%, 46%)';
  };

  if (!canAccessReports && !isAdmin && !isManager) {
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
            Insurance Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insurance claims analysis and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')} data-testid="button-export-pdf">
            <Icon name="picture_as_pdf" className=" mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} data-testid="button-export-excel">
            <Icon name="table_chart" className=" mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
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
              <Icon name="clear" className=" mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-insurance-reports">
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">
            Analysis
          </TabsTrigger>
          <TabsTrigger value="claims" data-testid="tab-claims">
            Recent Claims
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-claims">
                      {report.summary.totalClaims}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-claims">
                      {report.summary.pendingClaims}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Claim Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-claim-amount">
                      {formatCurrency(report.summary.totalClaimAmount)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Settled
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-total-settled">
                      {formatCurrency(report.summary.totalSettledAmount)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-claims-by-status-chart">
                <CardHeader>
                  <CardTitle>Claims by Status</CardTitle>
                  <CardDescription>Distribution of claims across different statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.claimsByStatus.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No claims data available
                    </p>
                  ) : (
                    <div id="insurance-chart-status">
                      <ResponsiveContainer width="100%" minHeight={300}>
                        <PieChart>
                          <Pie
                            data={report.claimsByStatus.map(item => ({
                              name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                              value: item.count,
                              amount: item.totalAmount,
                              color: getStatusColor(item.status)
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {report.claimsByStatus.map((item, index) => (
                              <Cell key={`cell-${index}`} fill={getStatusColor(item.status)} />
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
                                    Claims: {payload[0].value}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Amount: {formatCurrency(payload[0].payload.amount)}
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

              <Card data-testid="card-monthly-trend-chart">
                <CardHeader>
                  <CardTitle>Monthly Claim Trend</CardTitle>
                  <CardDescription>Claims volume and amounts over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.monthlyTrend.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No trend data available
                    </p>
                  ) : (
                    <div id="insurance-chart-trend">
                      <ResponsiveContainer width="100%" minHeight={300}>
                        <LineChart data={report.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="month" 
                            tickFormatter={formatMonth}
                            className="text-xs"
                          />
                          <YAxis 
                            yAxisId="left"
                            tickFormatter={(value) => value.toString()}
                            className="text-xs"
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
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
                                    Claims: {payload[0].value}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Amount: {formatCurrency(payload[0].payload.claimAmount)}
                                  </p>
                                </div>
                              );
                            }}
                          />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="claimCount" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                            name="Claim Count"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="claimAmount" 
                            stroke="hsl(142, 71%, 45%)" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(142, 71%, 45%)' }}
                            name="Claim Amount"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Approved Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-approved-claims">
                      {report.summary.approvedClaims}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(report.summary.totalApprovedAmount)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rejected Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600" data-testid="text-rejected-claims">
                      {report.summary.rejectedClaims}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Settled Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-settled-claims">
                      {report.summary.settledClaims}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(report.summary.totalSettledAmount)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-claims-by-insurer-chart">
                <CardHeader>
                  <CardTitle>Claims by Insurance Company</CardTitle>
                  <CardDescription>Claims distribution across insurance providers</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.claimsByInsurer.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No insurer data available
                    </p>
                  ) : (
                    <div id="insurance-chart-insurers">
                      <ResponsiveContainer width="100%" minHeight={300}>
                        <BarChart data={report.claimsByInsurer}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="insuranceCompany" 
                            className="text-xs"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              return (
                                <div className="bg-background border border-border rounded-md p-3 shadow-lg">
                                  <p className="text-sm font-medium mb-1">
                                    {payload[0].payload.insuranceCompany}
                                  </p>
                                  <p className="text-sm text-primary">
                                    Claims: {payload[0].value}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Amount: {formatCurrency(payload[0].payload.totalAmount)}
                                  </p>
                                </div>
                              );
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="claimCount" 
                            fill="hsl(var(--primary))" 
                            name="Number of Claims"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Insurance Company Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {report.claimsByInsurer.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No insurer data available
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="table-header-insurer">Insurance Company</TableHead>
                          <TableHead className="text-right" data-testid="table-header-claim-count">
                            Claims
                          </TableHead>
                          <TableHead className="text-right" data-testid="table-header-total-amount">
                            Total Amount
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.claimsByInsurer.map((item, index) => (
                          <TableRow key={index} data-testid={`row-insurer-${index}`}>
                            <TableCell className="font-medium">{item.insuranceCompany}</TableCell>
                            <TableCell className="text-right">{item.claimCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
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

        <TabsContent value="claims" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Insurance Claims</CardTitle>
                <CardDescription>
                  Latest insurance claims in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.recentClaims.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No claims found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-header-claim-number">Claim Number</TableHead>
                        <TableHead data-testid="table-header-contract">Contract</TableHead>
                        <TableHead data-testid="table-header-claimant">Claimant</TableHead>
                        <TableHead data-testid="table-header-insurer-name">Insurer</TableHead>
                        <TableHead className="text-right" data-testid="table-header-amount">Amount</TableHead>
                        <TableHead data-testid="table-header-status">Status</TableHead>
                        <TableHead data-testid="table-header-claim-date">Claim Date</TableHead>
                        <TableHead data-testid="table-header-incident-date">Incident Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.recentClaims.map((claim) => (
                        <TableRow key={claim.id} data-testid={`row-claim-${claim.id}`}>
                          <TableCell className="font-medium">
                            <Link href={`/insurance-claims/${claim.id}`}>
                              <span className="text-primary hover:underline">{claim.claimNumber}</span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/contracts/${claim.contractId}`}>
                              <span className="text-primary hover:underline">#{claim.contractNumber}</span>
                            </Link>
                          </TableCell>
                          <TableCell>{claim.claimantName}</TableCell>
                          <TableCell>{claim.insuranceCompany}</TableCell>
                          <TableCell className="text-right">{formatCurrency(claim.claimAmount)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(claim.claimStatus)}>
                              {claim.claimStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(claim.claimDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{format(new Date(claim.incidentDate), 'MMM d, yyyy')}</TableCell>
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
