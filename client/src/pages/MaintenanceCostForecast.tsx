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
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Download, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import type { MaintenanceCostForecastReport } from '@shared/schema';

export default function MaintenanceCostForecast() {
  const { t } = useTranslation();
  const [vehicleType, setVehicleType] = useState('');

  const { data, isLoading } = useQuery<MaintenanceCostForecastReport>({
    queryKey: ['/api/reports/predictive/maintenance-forecast', vehicleType],
  });

  const exportData = () => {
    if (!data) return;
    const csvContent = [
      ['Vehicle Type', 'Total Vehicles', 'Forecast Cost', 'Avg Vehicle Age', 'Avg Mileage'].join(','),
      ...data.vehicleTypes.map((v: any) => 
        [v.vehicleType, v.totalVehicles, v.forecastCost, v.avgVehicleAge, v.avgMileage].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-forecast-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="p-6" data-testid="loading-maintenance-forecast">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-maintenance-forecast">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold" data-testid="title-maintenance-forecast">
          {t('reports.maintenanceCostForecast')}
        </h1>
        <Button onClick={exportData} disabled={!data} data-testid="button-export-maintenance">
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
            <Label>{t('vehicles.vehicleType')}</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger data-testid="select-vehicle-type">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="Sedan">{t('vehicles.types.sedan')}</SelectItem>
                <SelectItem value="SUV">{t('vehicles.types.suv')}</SelectItem>
                <SelectItem value="Luxury">{t('vehicles.types.luxury')}</SelectItem>
                <SelectItem value="Economy">{t('vehicles.types.economy')}</SelectItem>
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
                  {t('reports.totalForecastCost')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold" data-testid="text-total-forecast">
                    {data.summary.totalForecastCost.toLocaleString()} AED
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-cost">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.avgCostPerVehicle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-cost">
                  {data.summary.avgCostPerVehicle.toLocaleString()} AED
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-vehicles">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalVehicles')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-vehicles">
                  {data.summary.totalVehicles}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-age">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.avgFleetAge')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-age">
                  {data.summary.avgFleetAge.toFixed(1)} {t('common.years')}
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

          <Card data-testid="card-cost-by-type">
            <CardHeader>
              <CardTitle>{t('reports.forecastCostByType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.vehicleTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicleType" />
                  <YAxis tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `${value.toLocaleString()} AED`} />
                  <Legend />
                  <Bar dataKey="forecastCost" fill="#8884d8" name={t('reports.forecastCost')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="card-age-mileage">
            <CardHeader>
              <CardTitle>{t('reports.ageAndMileageAnalysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.vehicleTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicleType" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="avgVehicleAge" stroke="#8884d8" name={t('reports.avgAge')} />
                  <Line yAxisId="right" type="monotone" dataKey="avgMileage" stroke="#82ca9d" name={t('reports.avgMileage')} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
