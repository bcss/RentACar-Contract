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
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icon } from '@/components/Icon';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateCSV, downloadCSV, safeToFixed } from '@/utils/csvExport';

export default function FleetPerformanceReport() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const [sortBy, setSortBy] = useState<'revenue' | 'contracts' | 'utilization'>('revenue');

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<any[]>({
    queryKey: ['/api/vehicles'],
    enabled: isAdmin || isManager,
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<any[]>({
    queryKey: ['/api/contracts'],
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return `0.00 ${currency}`;
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  // Calculate vehicle performance metrics
  const vehiclePerformance = vehicles.map(vehicle => {
    const vehicleContracts = contracts.filter(c => c.vehicleId === vehicle.id && c.status !== 'draft');
    const totalRevenue = vehicleContracts.reduce((sum, c) => 
      sum + parseFloat(c.totalAmount || '0') + parseFloat(c.totalExtraCharges || '0') + 
      parseFloat(c.dropOffCharge || '0') + parseFloat(c.pickUpCharge || '0'), 0
    );
    const totalDays = vehicleContracts.reduce((sum, c) => sum + (c.totalDays || 0), 0);
    const isActive = contracts.some(c => c.vehicleId === vehicle.id && c.status === 'active');
    
    return {
      ...vehicle,
      contractCount: vehicleContracts.length,
      totalRevenue,
      totalDays,
      isActive,
      avgRevenuePerDay: totalDays > 0 ? totalRevenue / totalDays : 0,
    };
  });

  // Sort vehicles
  const sortedVehicles = [...vehiclePerformance].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'contracts':
        return b.contractCount - a.contractCount;
      case 'utilization':
        return b.totalDays - a.totalDays;
      default:
        return 0;
    }
  });

  // Calculate summary metrics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehiclePerformance.filter(v => v.isActive).length;
  const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
  const totalFleetRevenue = vehiclePerformance.reduce((sum, v) => sum + v.totalRevenue, 0);
  const avgRevenuePerVehicle = totalVehicles > 0 ? totalFleetRevenue / totalVehicles : 0;

  // Vehicle type distribution
  const vehicleTypes = vehicles.reduce((acc: any, v) => {
    const key = `${v.make} ${v.model}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const typeDistributionData = Object.entries(vehicleTypes).map(([name, count]) => ({
    name,
    value: count as number,
  }));

  const COLORS = ['#0891b2', '#06b6d4', '#67e8f9', '#a5f3fc', '#cffafe'];

  const isLoading = vehiclesLoading || contractsLoading;

  const handleExportCSV = () => {
    const csvData = [
      ['Fleet Performance Report', '', format(new Date(), 'yyyy-MM-dd HH:mm')],
      [],
      ['Summary'],
      ['Total Vehicles', totalVehicles],
      ['Active Vehicles', activeVehicles],
      ['Utilization Rate', `${safeToFixed(utilizationRate)}%`],
      ['Total Fleet Revenue', totalFleetRevenue],
      ['Avg Revenue Per Vehicle', avgRevenuePerVehicle],
      [],
      ['Vehicle Performance'],
      ['Make', 'Model', 'Year', 'Registration', 'Contracts', 'Total Days', 'Total Revenue', 'Avg Revenue/Day', 'Status'],
      ...sortedVehicles.map(v => [
        v.make ?? '',
        v.model ?? '',
        v.year ?? '',
        v.registration ?? '',
        v.contractCount ?? 0,
        v.totalDays ?? 0,
        v.totalRevenue ?? 0,
        safeToFixed(v.avgRevenuePerDay),
        v.isActive ? 'Active' : 'Inactive'
      ])
    ];

    const csv = generateCSV(csvData);
    downloadCSV(csv, `fleet-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-fleet-performance">Fleet Performance Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive fleet utilization and revenue analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-vehicles">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Icon name="directions_car" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-vehicles">
                {totalVehicles}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In fleet
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-active-vehicles">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
              <Icon name="car_rental" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-vehicles">
                {activeVehicles}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently rented
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-utilization">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
              <Icon name="trending_up" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-utilization">
                {utilizationRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fleet efficiency
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-fleet-revenue">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fleet Revenue</CardTitle>
              <Icon name="payments" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-fleet-revenue">
                {formatCurrency(totalFleetRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(avgRevenuePerVehicle)} avg/vehicle
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fleet Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Distribution by Type</CardTitle>
            <CardDescription>Vehicle model breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : typeDistributionData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No vehicle data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vehicles</CardTitle>
            <CardDescription>By total revenue generated</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sortedVehicles.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No performance data available
              </div>
            ) : (
              <div className="space-y-3">
                {sortedVehicles.slice(0, 5).map((vehicle, index) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-xl font-bold text-muted-foreground">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{vehicle.registration}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(vehicle.totalRevenue)}</div>
                      <div className="text-xs text-muted-foreground">{vehicle.contractCount} contracts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detailed Vehicle Performance</CardTitle>
              <CardDescription>Complete fleet analysis with sorting options</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === 'revenue' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('revenue')}
                data-testid="button-sort-revenue"
              >
                By Revenue
              </Button>
              <Button
                variant={sortBy === 'contracts' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('contracts')}
                data-testid="button-sort-contracts"
              >
                By Contracts
              </Button>
              <Button
                variant={sortBy === 'utilization' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('utilization')}
                data-testid="button-sort-utilization"
              >
                By Days Rented
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Contracts</TableHead>
                    <TableHead className="text-right">Days Rented</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Avg/Day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVehicles.map((vehicle, index) => (
                    <TableRow key={vehicle.id} data-testid={`row-vehicle-${index}`}>
                      <TableCell className="font-medium">{vehicle.registration}</TableCell>
                      <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                      <TableCell>
                        {vehicle.isActive ? (
                          <Badge variant="default" data-testid={`badge-active-${index}`}>Active</Badge>
                        ) : (
                          <Badge variant="secondary" data-testid={`badge-available-${index}`}>Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{vehicle.contractCount}</TableCell>
                      <TableCell className="text-right">{vehicle.totalDays}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(vehicle.totalRevenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(vehicle.avgRevenuePerDay)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
