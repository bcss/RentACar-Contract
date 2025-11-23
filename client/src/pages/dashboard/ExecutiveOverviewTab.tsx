import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { EmirateLabels } from '@shared/schema';
import { RevenueTrendChart } from '@/components/RevenueTrendChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, Users, Car } from 'lucide-react';

export function ExecutiveOverviewTab() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();

  const { data: revenueTrendData = [], isLoading: revenueTrendLoading } = useQuery<any[]>({
    queryKey: ['/api/analytics/revenue-trend'],
  });

  const { data: topPerformersData, isLoading: topPerformersLoading } = useQuery<{
    topVehiclesByRevenue: any[];
    mostActiveStaff: any[];
  }>({
    queryKey: ['/api/analytics/top-performers'],
  });

  const { data: uaeGeographicData, isLoading: uaeGeographicLoading } = useQuery<{
    customersByEmirate: { emirate: string; count: number }[];
    vehiclesByEmirate: { emirate: string; count: number }[];
    sponsorsByEmirate: { emirate: string; count: number }[];
    companiesByEmirate: { emirate: string; count: number }[];
  }>({
    queryKey: ['/api/analytics/geographic-distribution-uae'],
  });

  if (revenueTrendLoading || topPerformersLoading || uaeGeographicLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Calculate total revenue
  const totalRevenue = revenueTrendData.reduce((sum, month) => sum + month.totalRevenue, 0);
  const latestMonth = revenueTrendData[revenueTrendData.length - 1];
  const previousMonth = revenueTrendData[revenueTrendData.length - 2];
  const revenueGrowth = previousMonth && previousMonth.totalRevenue > 0
    ? ((latestMonth?.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue) * 100
    : 0;

  // Prepare UAE emirate chart data
  const emirateChartData = uaeGeographicData?.customersByEmirate.map(item => ({
    emirate: EmirateLabels[item.emirate]?.[i18n.language === 'ar' ? 'ar' : 'en'] || item.emirate,
    customers: item.count,
    vehicles: uaeGeographicData.vehiclesByEmirate.find(v => v.emirate === item.emirate)?.count || 0,
    sponsors: uaeGeographicData.sponsorsByEmirate.find(s => s.emirate === item.emirate)?.count || 0,
    companies: uaeGeographicData.companiesByEmirate.find(c => c.emirate === item.emirate)?.count || 0,
  })) || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight" data-testid="text-executive-overview-title">
          {t('dashboard.executiveOverview')}
        </h2>
      </div>

      {/* Revenue Trends */}
      <Card data-testid="card-revenue-trends">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {t('dashboard.financialPerformance')}
              </p>
              <CardTitle className="text-lg">{t('dashboard.revenueTrends')}</CardTitle>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">{t('dashboard.totalRevenue')}</p>
              <p className="text-xl font-bold" data-testid="text-total-revenue">
                {currency} {totalRevenue.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">{t('dashboard.thisMonth')}</p>
              <p className="text-xl font-bold" data-testid="text-current-month-revenue">
                {currency} {(latestMonth?.totalRevenue || 0).toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">{t('dashboard.growth')}</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold" data-testid="text-revenue-growth">
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </p>
                <Badge variant={revenueGrowth >= 0 ? 'default' : 'destructive'}>
                  {revenueGrowth >= 0 ? t('common.up') : t('common.down')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          {revenueTrendData.length > 0 && (
            <RevenueTrendChart data={revenueTrendData} />
          )}
        </CardContent>
      </Card>

      {/* Top Performers - Elegant List Design */}
      <Card data-testid="card-top-performers">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {t('dashboard.performance')}
              </p>
              <CardTitle className="text-lg">{t('dashboard.topPerformers')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 divide-x">
            {/* Top Vehicles by Revenue */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {t('dashboard.topVehicles')}
                </h4>
                <Badge variant="outline">Top 5</Badge>
              </div>
              <div className="space-y-1">
                {topPerformersData?.topVehiclesByRevenue.slice(0, 5).map((vehicle, index) => (
                  <Link key={vehicle.vehicleId} href={`/vehicles/${vehicle.vehicleId}`}>
                    <div className="group flex items-center gap-3 p-2 rounded-lg hover-elevate transition-colors cursor-pointer" data-testid={`row-top-vehicle-${index}`}>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{vehicle.registration}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm" data-testid={`text-vehicle-revenue-${index}`}>
                          {currency} {vehicle.totalRevenue.toLocaleString(i18n.language, { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Most Active Staff */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('dashboard.topStaff')}
                </h4>
                <Badge variant="outline">Top 5</Badge>
              </div>
              <div className="space-y-1">
                {topPerformersData?.mostActiveStaff.slice(0, 5).map((staff, index) => (
                  <div key={staff.userId} className="group flex items-center gap-3 p-2 rounded-lg hover-elevate transition-colors" data-testid={`row-top-staff-${index}`}>
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {staff.firstName?.[0]}{staff.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{staff.firstName} {staff.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {staff.contractCount} {t('dashboard.contracts')}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-sm" data-testid={`text-staff-revenue-${index}`}>
                          {currency} {staff.totalRevenue.toLocaleString(i18n.language, { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">#{index + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UAE Geographic Distribution */}
      <Card data-testid="card-uae-geographic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {t('dashboard.uaeMarket')}
              </p>
              <CardTitle className="text-lg">{t('dashboard.geographicDistribution')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emirateChartData.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.customers')}</p>
                  <p className="text-xl font-bold">
                    {uaeGeographicData?.customersByEmirate.reduce((sum, item) => sum + item.count, 0) || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.vehicles')}</p>
                  <p className="text-xl font-bold">
                    {uaeGeographicData?.vehiclesByEmirate.reduce((sum, item) => sum + item.count, 0) || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.sponsors')}</p>
                  <p className="text-xl font-bold">
                    {uaeGeographicData?.sponsorsByEmirate.reduce((sum, item) => sum + item.count, 0) || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
                  <p className="text-xs text-muted-foreground mb-1">{t('dashboard.companies')}</p>
                  <p className="text-xl font-bold">
                    {uaeGeographicData?.companiesByEmirate.reduce((sum, item) => sum + item.count, 0) || 0}
                  </p>
                </div>
              </div>

              {/* Bar Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emirateChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="emirate" className="text-xs" width={120} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="font-semibold mb-2">{payload[0].payload.emirate}</p>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">{t('dashboard.customers')}:</span> {payload[0].payload.customers}</p>
                              <p><span className="text-muted-foreground">{t('dashboard.vehicles')}:</span> {payload[0].payload.vehicles}</p>
                              <p><span className="text-muted-foreground">{t('dashboard.sponsors')}:</span> {payload[0].payload.sponsors}</p>
                              <p><span className="text-muted-foreground">{t('dashboard.companies')}:</span> {payload[0].payload.companies}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="customers" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="vehicles" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="sponsors" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="companies" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-chart-1" />
                  <span>{t('dashboard.customers')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-chart-2" />
                  <span>{t('dashboard.vehicles')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-chart-3" />
                  <span>{t('dashboard.sponsors')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-chart-4" />
                  <span>{t('dashboard.companies')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-2">{t('dashboard.noEmirateData')}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.emirateDataHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
