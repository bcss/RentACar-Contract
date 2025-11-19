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
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icon } from '@/components/Icon';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateCSV, downloadCSV, safeToFixed } from '@/utils/csvExport';

export default function ContractAnalyticsReport() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const [months, setMonths] = useState<number>(6);

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<any[]>({
    queryKey: ['/api/contracts'],
    enabled: isAdmin || isManager,
  });

  const { data: contractVolumeData = [], isLoading: volumeLoading } = useQuery<any[]>({
    queryKey: ['/api/analytics/contract-volume', months],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/contract-volume?months=${months}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch contract volume');
      return response.json();
    },
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return `0.00 ${currency}`;
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  // Calculate contract status distribution
  const statusCounts = contracts.reduce((acc: any, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusDistributionData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
  }));

  // Calculate KPIs
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const closedContracts = contracts.filter(c => c.status === 'closed').length;
  const completionRate = totalContracts > 0 ? ((completedContracts + closedContracts) / totalContracts) * 100 : 0;

  const COLORS = ['#0891b2', '#06b6d4', '#67e8f9', '#a5f3fc'];

  const isLoading = contractsLoading || volumeLoading;

  const handleExportCSV = () => {
    const csvData = [
      ['Contract Analytics Report', '', format(new Date(), 'yyyy-MM-dd HH:mm')],
      [],
      ['Summary'],
      ['Total Contracts', totalContracts],
      ['Active Contracts', activeContracts],
      ['Completed Contracts', completedContracts + closedContracts],
      ['Completion Rate', `${safeToFixed(completionRate)}%`],
      [],
      ['Status Distribution'],
      ['Status', 'Count'],
      ...statusDistributionData.map(s => [s.name ?? '', s.value ?? 0]),
      [],
      ['Contract Volume Trend'],
      ['Month', 'Count'],
      ...(contractVolumeData || []).map((v: any) => [v.month ?? '', v.count ?? 0])
    ];

    const csv = generateCSV(csvData);
    downloadCSV(csv, `contract-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
          <h1 className="text-3xl font-bold" data-testid="heading-contract-analytics">Contract Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive contract lifecycle and volume analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isLoading} data-testid="button-export-csv">
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
          <Card data-testid="card-total-contracts">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <Icon name="description" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total">{totalContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card data-testid="card-active">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <Icon name="car_rental" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active">{activeContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently ongoing</p>
            </CardContent>
          </Card>

          <Card data-testid="card-completed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Icon name="check_circle" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-completed">{completedContracts + closedContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">Finalized</p>
            </CardContent>
          </Card>

          <Card data-testid="card-completion-rate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Icon name="trending_up" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-rate">{completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Success rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contract Volume Trend</CardTitle>
                <CardDescription>Monthly contract counts</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant={months === 3 ? "default" : "outline"} size="sm" onClick={() => setMonths(3)} data-testid="button-3m">3M</Button>
                <Button variant={months === 6 ? "default" : "outline"} size="sm" onClick={() => setMonths(6)} data-testid="button-6m">6M</Button>
                <Button variant={months === 12 ? "default" : "outline"} size="sm" onClick={() => setMonths(12)} data-testid="button-12m">12M</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {volumeLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={contractVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="contractCount" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} name="Contracts" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Contracts by lifecycle stage</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusDistributionData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {statusDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Lifecycle Summary</CardTitle>
          <CardDescription>Detailed status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusDistributionData.map((item, index) => (
                  <TableRow key={index} data-testid={`row-status-${index}`}>
                    <TableCell><Badge>{item.name}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{item.value}</TableCell>
                    <TableCell className="text-right">{((item.value / totalContracts) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
