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

interface DriverUtilizationReport {
  summary: {
    totalDrivers: number;
    activeDrivers: number;
    onAssignment: number;
    totalAssignments: number;
    completedAssignments: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageUtilization: number;
  };
  driverStats: Array<{
    driverId: string;
    driverCode: string;
    driverName: string;
    driverNameAr: string;
    employmentType: string;
    availability: string;
    totalAssignments: number;
    completedAssignments: number;
    activeAssignments: number;
    totalDaysWorked: number;
    totalRevenue: number;
    totalCost: number;
    profitMargin: number;
    isActive: boolean;
  }>;
}

export default function DriverUtilizationReport() {
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
    return `/api/reports/driver-utilization${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const { data: report, isLoading } = useQuery<DriverUtilizationReport>({
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

  const chartData = report?.driverStats.slice(0, 10).map(d => ({
    name: i18n.language === 'ar' ? d.driverNameAr : d.driverName,
    revenue: d.totalRevenue,
    cost: d.totalCost,
    profit: d.profitMargin,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.driverUtilization')}</h1>
          <p className="text-muted-foreground">{t('reports.driverUtilizationDesc')}</p>
        </div>
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
                <CardTitle className="text-sm font-medium">{t('drivers.totalDrivers')}</CardTitle>
                <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-drivers">{report.summary.totalDrivers}</div>
                <p className="text-xs text-muted-foreground">
                  {report.summary.activeDrivers} {t('drivers.available')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('drivers.onAssignment')}</CardTitle>
                <Icon name="UserCheck" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-on-assignment">{report.summary.onAssignment}</div>
                <p className="text-xs text-muted-foreground">
                  {report.summary.averageUtilization.toFixed(1)}% {t('drivers.utilization')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('reports.totalRevenue')}</CardTitle>
                <Icon name="DollarSign" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-revenue">{formatCurrency(report.summary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {report.summary.completedAssignments} {t('drivers.completedAssignments')}
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
                  {t('reports.cost')}: {formatCurrency(report.summary.totalCost)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.topDriversByRevenue')}</CardTitle>
              <CardDescription>{t('reports.top10Drivers')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name={t('reports.revenue')} />
                  <Bar dataKey="cost" fill="hsl(var(--destructive))" name={t('reports.cost')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.driverDetails')}</CardTitle>
              <CardDescription>{t('reports.allDriverStats')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('drivers.driverCode')}</TableHead>
                    <TableHead>{t('drivers.driverName')}</TableHead>
                    <TableHead>{t('drivers.employmentType')}</TableHead>
                    <TableHead>{t('drivers.status')}</TableHead>
                    <TableHead className="text-right">{t('drivers.totalAssignments')}</TableHead>
                    <TableHead className="text-right">{t('drivers.daysWorked')}</TableHead>
                    <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                    <TableHead className="text-right">{t('reports.cost')}</TableHead>
                    <TableHead className="text-right">{t('reports.profit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.driverStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.driverStats.map((driver) => (
                      <TableRow key={driver.driverId} data-testid={`row-driver-${driver.driverId}`}>
                        <TableCell className="font-medium">{driver.driverCode}</TableCell>
                        <TableCell>{i18n.language === 'ar' ? driver.driverNameAr : driver.driverName}</TableCell>
                        <TableCell>
                          <Badge variant={driver.employmentType === 'in_house' ? 'default' : 'secondary'}>
                            {t(`drivers.${driver.employmentType}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={driver.availability === 'available' ? 'default' : driver.availability === 'on_assignment' ? 'secondary' : 'outline'}>
                            {t(`drivers.${driver.availability}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{driver.totalAssignments}</TableCell>
                        <TableCell className="text-right">{driver.totalDaysWorked}</TableCell>
                        <TableCell className="text-right">{formatCurrency(driver.totalRevenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(driver.totalCost)}</TableCell>
                        <TableCell className="text-right">
                          <span className={driver.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(driver.profitMargin)}
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
