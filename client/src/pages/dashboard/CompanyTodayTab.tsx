import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// Fleet Status Distribution Card (relocated from main dashboard)
export function CompanyTodayTab() {
  const { t, i18n } = useTranslation();

  const { data: fleetStatusData, isLoading: fleetStatusLoading } = useQuery<{
    available: number;
    rented: number;
    maintenance: number;
    damaged: number;
  }>({
    queryKey: ['/api/analytics/fleet-status'],
  });

  const { data: pendingActionsData, isLoading: pendingActionsLoading } = useQuery<{
    overdueReturns: any[];
    pendingRefunds: any[];
    unclosedContracts: number;
  }>({
    queryKey: ['/api/analytics/pending-actions'],
  });

  const { data: driverAvailabilityData, isLoading: driverAvailabilityLoading } = useQuery<{
    totalDrivers: number;
    activeDrivers: number;
    onAssignment: number;
    averageUtilization: number;
  }>({
    queryKey: ['/api/analytics/driver-availability'],
  });

  // Fleet status chart data
  const fleetChartData = fleetStatusData ? [
    { name: t('vehicle.status.available'), value: fleetStatusData.available, color: 'hsl(var(--chart-1))' },
    { name: t('vehicle.status.rented'), value: fleetStatusData.rented, color: 'hsl(var(--chart-2))' },
    { name: t('vehicle.status.maintenance'), value: fleetStatusData.maintenance, color: 'hsl(var(--chart-3))' },
    { name: t('vehicle.status.damaged'), value: fleetStatusData.damaged, color: 'hsl(var(--chart-4))' },
  ] : [];

  const totalVehicles = fleetChartData.reduce((sum, item) => sum + item.value, 0);

  if (fleetStatusLoading || pendingActionsLoading || driverAvailabilityLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight" data-testid="text-company-today-title">
          {t('dashboard.companyToday')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1" data-testid="text-company-today-subtitle">
          {t('dashboard.companyTodaySubtitle')}
        </p>
      </div>

      {/* Fleet Status Distribution */}
      <Card data-testid="card-fleet-status">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {t('dashboard.fleetOverview')}
              </p>
              <CardTitle className="text-lg">{t('dashboard.fleetStatusDistribution')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Concentric Donut Chart */}
            <div className="relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={fleetChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fleetChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="font-semibold">{payload[0].name}</p>
                            <p className="text-sm text-muted-foreground">
                              {payload[0].value} {t('dashboard.vehicles')}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Central Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold" data-testid="text-fleet-total">{totalVehicles}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('dashboard.totalFleet')}</p>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
                <p className="text-xs text-muted-foreground mb-1">{t('vehicle.status.available')}</p>
                <p className="text-xl font-bold" data-testid="text-fleet-available">{fleetStatusData?.available || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <p className="text-xs text-muted-foreground mb-1">{t('vehicle.status.rented')}</p>
                <p className="text-xl font-bold" data-testid="text-fleet-rented">{fleetStatusData?.rented || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <p className="text-xs text-muted-foreground mb-1">{t('vehicle.status.maintenance')}</p>
                <p className="text-xl font-bold" data-testid="text-fleet-maintenance">{fleetStatusData?.maintenance || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
                <p className="text-xs text-muted-foreground mb-1">{t('vehicle.status.damaged')}</p>
                <p className="text-xl font-bold" data-testid="text-fleet-damaged">{fleetStatusData?.damaged || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Availability */}
      {driverAvailabilityData && (
        <Card data-testid="card-driver-availability">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Driver Service
                </p>
                <CardTitle className="text-lg">Driver Availability</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Total Drivers</p>
                <p className="text-xl font-bold" data-testid="text-total-drivers">{driverAvailabilityData.totalDrivers}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
                <p className="text-xs text-muted-foreground mb-1">Available</p>
                <p className="text-xl font-bold" data-testid="text-available-drivers">{driverAvailabilityData.activeDrivers}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <p className="text-xs text-muted-foreground mb-1">On Assignment</p>
                <p className="text-xl font-bold" data-testid="text-on-assignment">{driverAvailabilityData.onAssignment}</p>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Utilization Rate</p>
                <p className="text-sm font-bold" data-testid="text-utilization-rate">{driverAvailabilityData.averageUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Actions */}
      <Card data-testid="card-pending-actions">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {t('dashboard.actionRequired')}
              </p>
              <CardTitle className="text-lg">{t('dashboard.pendingActions')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {/* Overdue Returns */}
            <Link href="/contracts?status=active">
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 hover-elevate cursor-pointer" data-testid="button-overdue-returns">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('dashboard.overdueReturns')}
                  </p>
                  <Badge variant="destructive">{t('common.urgent')}</Badge>
                </div>
                <p className="text-2xl font-bold text-destructive" data-testid="text-overdue-count">
                  {pendingActionsData?.overdueReturns?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.requiresImmediate Attention')}</p>
              </div>
            </Link>

            {/* Pending Refunds */}
            <Link href="/contracts?depositRefunded=false">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer" data-testid="button-pending-refunds">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('dashboard.pendingRefunds')}
                  </p>
                  <Badge>{t('common.pending')}</Badge>
                </div>
                <p className="text-2xl font-bold" data-testid="text-refunds-count">
                  {pendingActionsData?.pendingRefunds?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.depositsToRefund')}</p>
              </div>
            </Link>

            {/* Unclosed Contracts */}
            <Link href="/contracts?status=completed">
              <div className="p-4 rounded-lg border hover-elevate cursor-pointer" data-testid="button-unclosed-contracts">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('dashboard.unclosedContracts')}
                  </p>
                  <Badge variant="outline">{t('common.action')}</Badge>
                </div>
                <p className="text-2xl font-bold" data-testid="text-unclosed-count">
                  {pendingActionsData?.unclosedContracts || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.awaitingClosure')}</p>
              </div>
            </Link>
          </div>

          {/* Details Section */}
          {pendingActionsData && (pendingActionsData.overdueReturns.length > 0 || pendingActionsData.pendingRefunds.length > 0) && (
            <div className="mt-6 space-y-4">
              {pendingActionsData.overdueReturns.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('dashboard.overdueReturnDetails')}</h4>
                  <div className="space-y-2">
                    {pendingActionsData.overdueReturns.slice(0, 5).map((item: any) => (
                      <Link key={item.id} href={`/contracts/${item.id}`}>
                        <div className="p-3 rounded-lg border hover-elevate cursor-pointer" data-testid={`row-overdue-detail-${item.id}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">#{item.contractNumber} - {item.customerNameEn}</p>
                              <p className="text-sm text-muted-foreground">{item.vehicleRegistration}</p>
                            </div>
                            <Badge variant="destructive">{item.daysOverdue} {t('dashboard.daysOverdue')}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
