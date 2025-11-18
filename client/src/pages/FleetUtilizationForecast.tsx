import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Download, Car } from 'lucide-react';
import { format } from 'date-fns';
import type { FleetUtilizationForecastReport } from '@/../../shared/schema';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FleetUtilizationForecast() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery<FleetUtilizationForecastReport>({
    queryKey: ['/api/reports/predictive/fleet-utilization', { startDate, endDate }],
  });

  const exportData = () => {
    if (!data) return;
    const csvContent = [
      ['Vehicle Type', 'Total Fleet', 'Current Utilization %', 'Forecast Utilization %', 'Available Capacity'].join(','),
      ...data.vehicleTypes.map((v: any) => 
        [v.vehicleType, v.totalFleet, v.currentUtilization, v.forecastUtilization, v.availableCapacity].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-utilization-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return <div className="p-6" data-testid="loading-fleet-forecast">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-fleet-utilization">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold" data-testid="title-fleet-utilization">
          {t('reports.fleetUtilizationForecast')}
        </h1>
        <Button onClick={exportData} disabled={!data} data-testid="button-export-fleet">
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
            <Card data-testid="card-overall-utilization">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.overallUtilization')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-overall-utilization">
                  {data.summary.overallUtilization.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-fleet">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalFleet')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold" data-testid="text-total-fleet">
                    {data.summary.totalFleet}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-vehicles-rented">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.vehiclesRented')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-vehicles-rented">
                  {data.summary.vehiclesRented}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-available-capacity">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.availableCapacity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-available-capacity">
                  {data.summary.availableCapacity}
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

          <Card data-testid="card-utilization-by-type">
            <CardHeader>
              <CardTitle>{t('reports.utilizationByVehicleType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.vehicleTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicleType" />
                  <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="currentUtilization" fill="#8884d8" name={t('reports.current')} />
                  <Bar dataKey="forecastUtilization" fill="#82ca9d" name={t('reports.forecast')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="card-capacity-analysis">
            <CardHeader>
              <CardTitle>{t('reports.capacityAnalysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.vehicleTypes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="vehicleType" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalFleet" fill="#8884d8" name={t('reports.totalFleet')} />
                  <Bar dataKey="vehiclesRented" fill="#82ca9d" name={t('reports.rented')} />
                  <Bar dataKey="availableCapacity" fill="#fbbf24" name={t('reports.available')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
