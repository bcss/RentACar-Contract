import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SlowRequest {
  method: string;
  path: string;
  duration: number;
  timestamp: Date;
}

interface PerformanceMetrics {
  totalRequests: number;
  averageDuration: number;
  slowestRequests: SlowRequest[];
  errorRate: string;
}

export default function PerformanceMonitoring() {
  const { t } = useTranslation();

  const { data: metrics, isLoading } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/system/performance'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <MaterialSymbol name="progress_activity" size="2xl" className="mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  const slowRequests = metrics?.slowestRequests || [];
  
  // Prepare chart data
  const chartData = slowRequests.slice(0, 10).map((req, index) => ({
    name: `${req.method} ${req.path.length > 30 ? req.path.substring(0, 30) + '...' : req.path}`,
    duration: req.duration,
    color: req.duration > 2000 ? 'hsl(var(--destructive))' : req.duration > 1000 ? 'hsl(var(--accent))' : 'hsl(var(--chart-1))',
  }));

  const avgDuration = metrics?.averageDuration || 0;
  const errorRate = parseFloat(metrics?.errorRate || '0');

  return (
    <div className="h-full overflow-auto p-6" data-testid="page-performance-monitoring">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t('performance.title', 'Performance Monitoring')}
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            {t('performance.description', 'Real-time application performance metrics and slow request analysis')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Requests */}
          <Card data-testid="card-total-requests">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('performance.totalRequests', 'Total Requests')}
              </CardTitle>
              <MaterialSymbol name="monitoring" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-requests">
                {metrics?.totalRequests.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('performance.last1000', 'Last 1000 requests')}
              </p>
            </CardContent>
          </Card>

          {/* Average Duration */}
          <Card data-testid="card-avg-duration">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('performance.avgDuration', 'Avg Duration')}
              </CardTitle>
              <MaterialSymbol name="schedule" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-duration">
                {avgDuration}
                <span className="text-sm font-normal text-muted-foreground">ms</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {avgDuration < 200 
                  ? t('performance.excellent', 'Excellent')
                  : avgDuration < 500
                  ? t('performance.good', 'Good')
                  : avgDuration < 1000
                  ? t('performance.fair', 'Fair')
                  : t('performance.slow', 'Needs optimization')}
              </p>
            </CardContent>
          </Card>

          {/* Error Rate */}
          <Card data-testid="card-error-rate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('performance.errorRate', 'Error Rate')}
              </CardTitle>
              <MaterialSymbol name="warning" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-error-rate">
                {errorRate.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {errorRate < 1 
                  ? t('performance.healthy', 'Healthy')
                  : errorRate < 5
                  ? t('performance.acceptable', 'Acceptable')
                  : t('performance.highErrors', 'High error rate')}
              </p>
            </CardContent>
          </Card>

          {/* Slowest Request */}
          <Card data-testid="card-slowest-request">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('performance.slowestRequest', 'Slowest Request')}
              </CardTitle>
              <MaterialSymbol name="trending_up" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-slowest-duration">
                {slowRequests[0]?.duration || 0}
                <span className="text-sm font-normal text-muted-foreground">ms</span>
              </div>
              <p className="truncate text-xs text-muted-foreground" title={slowRequests[0]?.path}>
                {slowRequests[0]?.path || t('performance.noData', 'No data')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Slowest Requests Chart */}
        <Card data-testid="card-slowest-requests-chart">
          <CardHeader>
            <CardTitle>{t('performance.slowestRequestsChart', 'Top 10 Slowest Requests')}</CardTitle>
            <CardDescription>
              {t('performance.chartDescription', 'Request duration in milliseconds. Red = critical (>2s), Amber = slow (>1s)')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--foreground))" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={190}
                    stroke="hsl(var(--foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="duration" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">{t('performance.noRequests', 'No requests recorded yet')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slowest Requests Table */}
        <Card className="mt-6" data-testid="card-slowest-requests-table">
          <CardHeader>
            <CardTitle>{t('performance.slowestRequestsTable', 'Slowest Requests Details')}</CardTitle>
            <CardDescription>
              {t('performance.tableDescription', 'Complete list of the slowest API requests')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium">{t('performance.method', 'Method')}</th>
                    <th className="pb-3 text-left text-sm font-medium">{t('performance.path', 'Path')}</th>
                    <th className="pb-3 text-right text-sm font-medium">{t('performance.duration', 'Duration')}</th>
                    <th className="pb-3 text-right text-sm font-medium">{t('performance.timestamp', 'Timestamp')}</th>
                  </tr>
                </thead>
                <tbody>
                  {slowRequests.length > 0 ? (
                    slowRequests.map((req, index) => (
                      <tr key={index} className="border-b last:border-0" data-testid={`row-slow-request-${index}`}>
                        <td className="py-3 text-sm">
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{req.method}</code>
                        </td>
                        <td className="py-3 text-sm font-mono">{req.path}</td>
                        <td className="py-3 text-right">
                          <span className={`font-semibold ${
                            req.duration > 2000 ? 'text-destructive' : 
                            req.duration > 1000 ? 'text-amber-600 dark:text-amber-400' : 
                            'text-foreground'
                          }`}>
                            {req.duration}ms
                          </span>
                        </td>
                        <td className="py-3 text-right text-sm text-muted-foreground">
                          {new Date(req.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        {t('performance.noRequests', 'No requests recorded yet')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
