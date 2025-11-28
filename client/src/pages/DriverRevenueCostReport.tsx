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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icon } from '@/components/Icon';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateCSV, downloadCSV, safeToFixed } from '@/utils/csvExport';

interface DriverRevenueCostReport {
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    overallProfitMargin: number;
    totalAssignments: number;
    averageRevenuePerDriver: number;
    averageCostPerDriver: number;
  };
  driverAnalysis: Array<{
    driverId: string;
    driverCode: string;
    driverName: string;
    driverNameAr: string;
    employmentType: string;
    costRate: number;
    totalAssignments: number;
    totalDaysWorked: number;
    totalRevenue: number;
    baseRevenue: number;
    surchargeRevenue: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
    roi: number;
    revenuePerDay: number;
    costPerDay: number;
    isActive: boolean;
  }>;
  topPerformers: Array<{
    driverId: string;
    driverCode: string;
    driverName: string;
    profit: number;
  }>;
}

export default function DriverRevenueCostReport() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return `0.00 ${currency}`;
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const getQueryUrl = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    return `/api/reports/driver-revenue-cost${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const { data: report, isLoading } = useQuery<DriverRevenueCostReport>({
    queryKey: [getQueryUrl()],
    enabled: isAdmin || isManager,
  });

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

  const chartData = report?.topPerformers.map(d => ({
    name: d.driverCode,
    profit: d.profit,
  })) || [];

  const handleExportCSV = () => {
    if (!report) return;

    const csvData = [
      ['Driver Revenue & Cost Report', '', format(new Date(), 'yyyy-MM-dd HH:mm')],
      [],
      ['Summary'],
      ['Total Revenue', report.summary.totalRevenue ?? 0],
      ['Total Cost', report.summary.totalCost ?? 0],
      ['Total Profit', report.summary.totalProfit ?? 0],
      ['Profit Margin', `${safeToFixed(report.summary.overallProfitMargin)}%`],
      ['Total Assignments', report.summary.totalAssignments ?? 0],
      [],
      ['Driver Analysis'],
      ['Driver Code', 'Driver Name', 'Employment Type', 'Assignments', 'Days Worked', 'Revenue', 'Cost', 'Profit', 'Profit Margin %', 'ROI %'],
      ...report.driverAnalysis.map(d => [
        d.driverCode ?? '',
        d.driverName ?? '',
        d.employmentType ?? '',
        d.totalAssignments ?? 0,
        d.totalDaysWorked ?? 0,
        d.totalRevenue ?? 0,
        d.totalCost ?? 0,
        d.profit ?? 0,
        safeToFixed(d.profitMargin),
        safeToFixed(d.roi)
      ])
    ];

    const csv = generateCSV(csvData);
    downloadCSV(csv, `driver-revenue-cost-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.driverRevenueCost')}</h1>
          <p className="text-muted-foreground">{t('reports.driverRevenueCostDesc')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isLoading || !report} data-testid="button-export-csv">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t('common.startDate')}</label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder={t('common.selectDate')}
                data-testid="input-start-date"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('common.endDate')}</label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder={t('common.selectDate')}
                data-testid="input-end-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.totalRevenue')}</CardTitle>
                <Icon name="DollarSign" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-revenue">{formatCurrency(report.summary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {report.summary.totalAssignments} {t('drivers.assignments')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.totalCost')}</CardTitle>
                <Icon name="TrendingDown" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-cost">{formatCurrency(report.summary.totalCost)}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.avgPerDriver')}: {formatCurrency(report.summary.averageCostPerDriver)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.totalProfit')}</CardTitle>
                <Icon name="TrendingUp" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-profit">{formatCurrency(report.summary.totalProfit)}</div>
                <p className="text-xs text-muted-foreground">
                  {report.summary.overallProfitMargin.toFixed(1)}% {t('reports.margin')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.avgRevenue')}</CardTitle>
                <Icon name="BarChart" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-revenue">{formatCurrency(report.summary.averageRevenuePerDriver)}</div>
                <p className="text-xs text-muted-foreground">{t('reports.perDriver')}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.topPerformers')}</CardTitle>
              <CardDescription>{t('reports.driversByProfit')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit" fill="hsl(var(--primary))" name={t('reports.profit')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.detailedAnalysis')}</CardTitle>
              <CardDescription>{t('reports.revenueVsCostBreakdown')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('drivers.driverCode')}</TableHead>
                    <TableHead>{t('drivers.driverName')}</TableHead>
                    <TableHead>{t('drivers.employmentType')}</TableHead>
                    <TableHead className="text-right">{t('reports.assignments')}</TableHead>
                    <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                    <TableHead className="text-right">{t('reports.cost')}</TableHead>
                    <TableHead className="text-right">{t('reports.profit')}</TableHead>
                    <TableHead className="text-right">{t('reports.margin')}</TableHead>
                    <TableHead className="text-right">{t('reports.roi')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.driverAnalysis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.driverAnalysis.map((driver) => (
                      <TableRow key={driver.driverId} data-testid={`row-driver-${driver.driverId}`}>
                        <TableCell className="font-medium">{driver.driverCode}</TableCell>
                        <TableCell>{i18n.language === 'ar' ? driver.driverNameAr : driver.driverName}</TableCell>
                        <TableCell>
                          <Badge variant={driver.employmentType === 'in_house' ? 'default' : 'secondary'}>
                            {t(`drivers.${driver.employmentType}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{driver.totalAssignments}</TableCell>
                        <TableCell className="text-right">{formatCurrency(driver.totalRevenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(driver.totalCost)}</TableCell>
                        <TableCell className="text-right">
                          <span className={driver.profit >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}>
                            {formatCurrency(driver.profit)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={driver.profitMargin >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}>
                            {driver.profitMargin.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={driver.roi >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}>
                            {driver.roi.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
