import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { RevenueForecastReport as RevenueForecastReportType } from '@/../../shared/schema';

export default function RevenueForecastReport() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery<RevenueForecastReportType>({
    queryKey: ['/api/reports/predictive/revenue-forecast', { startDate, endDate }],
  });

  const exportData = () => {
    if (!data) return;
    const csvContent = [
      ['Date', 'Forecast Revenue', 'Historical Revenue', 'Confidence'].join(','),
      ...data.forecasts.map((f: any) => 
        [f.forecastDate, f.forecastRevenue, f.historicalRevenue || '', f.confidence].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-forecast-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return <div className="p-6" data-testid="loading-revenue-forecast">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-revenue-forecast">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold" data-testid="title-revenue-forecast">
          {t('reports.revenueForecast')}
        </h1>
        <Button onClick={exportData} disabled={!data} data-testid="button-export-revenue">
          <Download className="h-4 w-4 mr-2" />
          {t('common.exportCSV')}
        </Button>
      </div>

      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle>{t('common.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('common.startDate')}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div>
              <Label>{t('common.endDate')}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-avg-monthly">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.avgMonthlyRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-monthly">
                  {data.summary.averageMonthlyRevenue.toLocaleString()} AED
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-growth-rate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.growthRate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold" data-testid="text-growth-rate">
                    {data.summary.growthRate.toFixed(1)}%
                  </div>
                  {data.summary.growthRate > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-30d-forecast">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.forecast30Days')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-30d-forecast">
                  {data.summary.forecast30Days.toLocaleString()} AED
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-90d-forecast">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.forecast90Days')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-90d-forecast">
                  {data.summary.forecast90Days.toLocaleString()} AED
                </div>
              </CardContent>
            </Card>
          </div>

          {data.warnings && data.warnings.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20" data-testid="card-warnings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertTriangle className="h-5 w-5" />
                  {t('reports.warnings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.warnings.map((warning: string, idx: number) => (
                    <li key={idx} className="text-sm" data-testid={`warning-${idx}`}>{warning}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card data-testid="card-revenue-trend">
            <CardHeader>
              <CardTitle>{t('reports.revenueTrend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.forecasts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="forecastDate" 
                    tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                  />
                  <YAxis tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: any) => `${value.toLocaleString()} AED`}
                    labelFormatter={(label) => format(new Date(label), 'PPP')}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="historicalRevenue" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    name={t('reports.historical')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecastRevenue" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                    name={t('reports.forecast')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="card-confidence">
            <CardHeader>
              <CardTitle>{t('reports.confidenceLevels')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.forecasts.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="forecastDate" 
                    tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                  />
                  <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="confidence" fill="#fbbf24" name={t('reports.confidence')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
