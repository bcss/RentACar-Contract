import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icon } from '@/components/Icon';
import { Link } from 'wouter';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateCSV, downloadCSV, safeToFixed } from '@/utils/csvExport';

export default function CollectionPerformanceReport() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();

  const { data: report, isLoading } = useQuery<any>({
    queryKey: ['/api/reports/financial'],
    queryFn: async () => {
      const response = await fetch('/api/reports/financial', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch financial report');
      return response.json();
    },
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return `0.00 ${currency}`;
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const COLORS = ['#0891b2', '#06b6d4', '#67e8f9', '#a5f3fc'];

  const handleExportCSV = () => {
    if (!report) return;

    const csvData = [
      ['Collection Performance Report', '', '', format(new Date(), 'yyyy-MM-dd HH:mm')],
      [],
      ['Summary'],
      ['Total Collected', report.summary.totalCollected ?? 0],
      ['Total Outstanding', report.summary.totalOutstanding ?? 0],
      ['Total Revenue', report.summary.totalRevenue ?? 0],
      ['Collection Rate', `${safeToFixed(report.summary.collectionRate)}%`],
      [],
      ['Payment Methods'],
      ['Method', 'Amount'],
      ...(report.methodBreakdown || []).map((method: any) => [method.method ?? '', method.amount ?? 0]),
      [],
      ['Outstanding Payments'],
      ['Contract', 'Customer', 'Total', 'Collected', 'Outstanding', 'Status'],
      ...(report.outstandingPayments || []).map((payment: any) => [
        payment.contractNumber ?? '',
        payment.customerName ?? '',
        payment.totalAmount ?? 0,
        payment.collected ?? 0,
        payment.outstanding ?? 0,
        payment.status ?? ''
      ])
    ];

    const csv = generateCSV(csvData);
    downloadCSV(csv, `collection-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-collection">Collection Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Payment collection analysis and outstanding balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isLoading || !report} data-testid="button-export-csv">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" data-testid="button-refresh">
            <Icon name="refresh" className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-collected">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <Icon name="payments" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-collected">{formatCurrency(report?.summary?.totalCollected)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card data-testid="card-outstanding">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <Icon name="account_balance" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-outstanding">{formatCurrency(report?.summary?.totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
            </CardContent>
          </Card>

          <Card data-testid="card-collection-rate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <Icon name="trending_up" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-rate">{report?.summary?.collectionRate?.toFixed(1) || '0.0'}%</div>
              <p className="text-xs text-muted-foreground mt-1">Payment efficiency</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Icon name="show_chart" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-revenue">{formatCurrency(report?.summary?.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Expected total</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
            <CardDescription>Breakdown by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : report?.methodBreakdown && report.methodBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={report.methodBreakdown} cx="50%" cy="50%" labelLine={false} label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`} outerRadius={100} fill="#8884d8" dataKey="amount">
                    {report.methodBreakdown.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No payment data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Progress</CardTitle>
            <CardDescription>Total collected vs outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <div className="space-y-6 pt-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Collected</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(report?.summary?.totalCollected)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div className="bg-chart-2 h-4 rounded-full" style={{ width: `${report?.summary?.collectionRate || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Outstanding</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(report?.summary?.totalOutstanding)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div className="bg-destructive/70 h-4 rounded-full" style={{ width: `${100 - (report?.summary?.collectionRate || 0)}%` }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Collection Rate</span>
                    <span className="text-3xl font-bold text-chart-2">{report?.summary?.collectionRate?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Payments</CardTitle>
          <CardDescription>Contracts with pending balances</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : report?.outstandingPayments && report.outstandingPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.outstandingPayments.slice(0, 10).map((item: any, index: number) => (
                    <TableRow key={index} data-testid={`row-outstanding-${index}`}>
                      <TableCell className="font-medium">
                        <Link href={`/contracts/${item.contractId}`} className="hover:underline">
                          #{item.contractNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell><Badge>{item.status}</Badge></TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.collected)}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">{formatCurrency(item.outstanding)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/contracts/${item.contractId}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-${index}`}>
                            <Icon name="visibility" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No outstanding payments</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
