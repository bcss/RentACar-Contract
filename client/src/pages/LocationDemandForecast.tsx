import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Download, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { LocationDemandForecastReport } from '@/../../shared/schema';

const EMIRATES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

export default function LocationDemandForecast() {
  const { t } = useTranslation();
  const [emirate, setEmirate] = useState('');

  const { data, isLoading } = useQuery<LocationDemandForecastReport>({
    queryKey: ['/api/reports/predictive/demand-forecast', { emirate }],
  });

  const exportData = () => {
    if (!data) return;
    const csvContent = [
      ['Emirate', 'Historical Demand', 'Forecast Demand', 'Growth Rate'].join(','),
      ...data.locations.map((l: any) => 
        [l.emirate, l.historicalDemand, l.forecastDemand, l.growthRate].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demand-forecast-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return <div className="p-6" data-testid="loading-demand-forecast">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-demand-forecast">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold" data-testid="title-demand-forecast">
          {t('reports.locationDemandForecast')}
        </h1>
        <Button onClick={exportData} disabled={!data} data-testid="button-export-demand">
          <Download className="h-4 w-4 mr-2" />
          {t('common.exportCSV')}
        </Button>
      </div>

      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle>{t('common.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>{t('common.emirate')}</Label>
            <Select value={emirate} onValueChange={setEmirate}>
              <SelectTrigger data-testid="select-emirate">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {EMIRATES.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-total-forecast">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalForecastDemand')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold" data-testid="text-total-forecast">
                    {data.summary.totalForecastDemand}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-historical">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalHistorical')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-historical">
                  {data.summary.totalHistorical}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-growth">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.avgGrowthRate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-growth">
                  {data.summary.avgGrowthRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-locations">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.activeLocations')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-locations">
                  {data.locations.length}
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

          <Card data-testid="card-demand-comparison">
            <CardHeader>
              <CardTitle>{t('reports.demandComparison')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.locations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="emirate" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="historicalDemand" fill="#8884d8" name={t('reports.historical')} />
                  <Bar dataKey="forecastDemand" fill="#82ca9d" name={t('reports.forecast')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="card-growth-trends">
            <CardHeader>
              <CardTitle>{t('reports.growthTrends')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.locations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="emirate" />
                  <YAxis tickFormatter={(val) => `${val}%`} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                  <Line type="monotone" dataKey="growthRate" stroke="#8884d8" strokeWidth={2} name={t('reports.growthRate')} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
