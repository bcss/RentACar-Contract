import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateSelector } from '@/components/ui/date-selector';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'wouter';

interface VehicleUtilization {
  vehicleId: string;
  registration: string;
  make: string;
  model: string;
  totalDaysRented: number;
  availableDays: number;
  utilizationRate: number;
  currentStatus: string;
}

interface ContractStatusSummary {
  status: string;
  count: number;
  percentage: number;
  averageDuration: number;
}

interface ExtraChargeContract {
  contractId: string;
  contractNumber: number;
  customerName: string;
  vehicleInfo: string;
  totalExtra: number;
  breakdown: {
    extraKm?: number;
    fuel?: number;
    salik?: number;
    trafficFines?: number;
    damage?: number;
    other?: number;
  };
  dateCompleted: string;
}

interface OperationalReport {
  utilization: {
    utilizationRate: number;
    activeVehicles: number;
    totalVehicles: number;
  };
  vehicleStats: Array<{
    vehicleId: string;
    registration: string;
    make: string;
    model: string;
    contractCount: number;
    totalRevenue: number;
    totalDays: number;
    isActive: boolean;
  }>;
  statusSummary: {
    draft: number;
    confirmed: number;
    active: number;
    completed: number;
    closed: number;
  };
  extraCharges: {
    total: number;
    average: number;
    contracts: Array<{
      contractId: string;
      contractNumber: number;
      customerName: string;
      extraCharges: number;
      status: string;
    }>;
  };
}

export default function OperationalReports() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('utilization');

  // Build query URL with date filters
  const getQueryUrl = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    return `/api/reports/operational${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const { data: report, isLoading } = useQuery<OperationalReport>({
    queryKey: ['/api/reports/operational', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(getQueryUrl());
      if (!response.ok) throw new Error('Failed to fetch operational report');
      return response.json();
    },
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getUtilizationBadgeVariant = (rate: number): 'default' | 'secondary' | 'outline' => {
    if (rate >= 80) return 'default';
    if (rate >= 50) return 'secondary';
    return 'outline';
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      draft: 'outline',
      confirmed: 'secondary',
      active: 'default',
      completed: 'default',
      closed: 'outline',
    };
    return variants[status] || 'outline';
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardHeader>
            <CardTitle>{t('common.error')}</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate vehicle utilization data
  const calculateDaysBetween = (start?: Date, end?: Date) => {
    if (!start || !end) {
      // Default to 30 days if no range specified
      return 30;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 30;
  };

  const availableDaysInPeriod = calculateDaysBetween(startDate, endDate);

  const vehicleUtilizationData: VehicleUtilization[] = report?.vehicleStats.map(v => ({
    vehicleId: v.vehicleId,
    registration: v.registration,
    make: v.make,
    model: v.model,
    totalDaysRented: v.totalDays,
    availableDays: availableDaysInPeriod,
    utilizationRate: availableDaysInPeriod > 0 ? (v.totalDays / availableDaysInPeriod) * 100 : 0,
    currentStatus: v.isActive ? 'Rented' : 'Available',
  })).sort((a, b) => b.utilizationRate - a.utilizationRate) || [];

  // Calculate contract status summary
  const totalContracts = report ? 
    report.statusSummary.draft + 
    report.statusSummary.confirmed + 
    report.statusSummary.active + 
    report.statusSummary.completed + 
    report.statusSummary.closed : 0;

  const contractStatusData: ContractStatusSummary[] = report ? [
    {
      status: 'draft',
      count: report.statusSummary.draft,
      percentage: totalContracts > 0 ? (report.statusSummary.draft / totalContracts) * 100 : 0,
      averageDuration: 0,
    },
    {
      status: 'confirmed',
      count: report.statusSummary.confirmed,
      percentage: totalContracts > 0 ? (report.statusSummary.confirmed / totalContracts) * 100 : 0,
      averageDuration: 0,
    },
    {
      status: 'active',
      count: report.statusSummary.active,
      percentage: totalContracts > 0 ? (report.statusSummary.active / totalContracts) * 100 : 0,
      averageDuration: 0,
    },
    {
      status: 'completed',
      count: report.statusSummary.completed,
      percentage: totalContracts > 0 ? (report.statusSummary.completed / totalContracts) * 100 : 0,
      averageDuration: 0,
    },
    {
      status: 'closed',
      count: report.statusSummary.closed,
      percentage: totalContracts > 0 ? (report.statusSummary.closed / totalContracts) * 100 : 0,
      averageDuration: 0,
    },
  ] : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t('operationalReports.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Operational metrics and vehicle utilization
          </p>
        </div>
        <Button variant="outline" disabled data-testid="button-export">
          <span className="material-icons mr-2">download</span>
          {t('operationalReports.exportPlaceholder')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('operationalReports.dateRange')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateFrom')}</label>
              <DateSelector
                value={startDate}
                onChange={setStartDate}
                placeholder={t('common.dateFrom')}
                data-testid="date-from"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateTo')}</label>
              <DateSelector
                value={endDate}
                onChange={setEndDate}
                placeholder={t('common.dateTo')}
                data-testid="date-to"
              />
            </div>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={!startDate && !endDate}
              data-testid="button-clear-filters"
            >
              <span className="material-icons mr-2">clear</span>
              {t('operationalReports.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-operational-reports">
          <TabsTrigger value="utilization" data-testid="tab-utilization">
            {t('operationalReports.vehicleUtilization')}
          </TabsTrigger>
          <TabsTrigger value="status" data-testid="tab-status">
            {t('operationalReports.contractStatusSummary')}
          </TabsTrigger>
          <TabsTrigger value="charges" data-testid="tab-charges">
            {t('operationalReports.extraChargesReport')}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Vehicle Utilization */}
        <TabsContent value="utilization" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('operationalReports.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('operationalReports.fleetUtilization')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-fleet-utilization">
                    <span className={getUtilizationColor(report.utilization.utilizationRate)}>
                      {report.utilization.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.utilization.activeVehicles} of {report.utilization.totalVehicles} vehicles in use
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('operationalReports.vehicleUtilization')}</CardTitle>
                  <CardDescription>
                    Sorted by utilization rate (highest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicleUtilizationData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      {t('operationalReports.noVehicles')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="table-header-vehicle">{t('operationalReports.vehicle')}</TableHead>
                          <TableHead className="text-right" data-testid="table-header-days-rented">
                            {t('operationalReports.totalDaysRented')}
                          </TableHead>
                          <TableHead className="text-right" data-testid="table-header-available-days">
                            {t('operationalReports.availableDays')}
                          </TableHead>
                          <TableHead className="text-right" data-testid="table-header-utilization">
                            {t('operationalReports.utilizationRate')}
                          </TableHead>
                          <TableHead data-testid="table-header-status">
                            {t('operationalReports.currentStatus')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicleUtilizationData.map((vehicle) => (
                          <TableRow key={vehicle.vehicleId} data-testid={`row-vehicle-${vehicle.vehicleId}`}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{vehicle.make} {vehicle.model}</div>
                                <div className="text-xs text-muted-foreground">{vehicle.registration}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{vehicle.totalDaysRented}</TableCell>
                            <TableCell className="text-right">{vehicle.availableDays}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={getUtilizationBadgeVariant(vehicle.utilizationRate)}>
                                <span className={getUtilizationColor(vehicle.utilizationRate)}>
                                  {vehicle.utilizationRate.toFixed(1)}%
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={vehicle.currentStatus === 'Rented' ? 'default' : 'secondary'}>
                                {vehicle.currentStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab 2: Contract Status Summary */}
        <TabsContent value="status" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('operationalReports.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('operationalReports.totalContracts')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-contracts">
                    {totalContracts}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {startDate && endDate
                      ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                      : 'All time'}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contractStatusData.map((statusData) => (
                  <Card key={statusData.status} data-testid={`card-status-${statusData.status}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        <Badge variant={getStatusBadgeVariant(statusData.status)}>
                          {t(`operationalReports.${statusData.status}`)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statusData.count}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {statusData.percentage.toFixed(1)}% of total
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('operationalReports.statusBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractStatusData.map((statusData) => (
                      <div key={statusData.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {t(`operationalReports.${statusData.status}`)}
                          </span>
                          <span className="text-sm font-bold" data-testid={`text-count-${statusData.status}`}>
                            {statusData.count} ({statusData.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(statusData.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab 3: Extra Charges Report */}
        <TabsContent value="charges" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('operationalReports.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('operationalReports.totalExtraCharges')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-extra-charges">
                      {formatCurrency(report.extraCharges.total)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('operationalReports.averageExtraCharge')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-average-extra-charge">
                      {formatCurrency(report.extraCharges.average)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('operationalReports.contractsWithCharges')}</CardTitle>
                  <CardDescription>
                    Sorted by total extra charges (highest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.extraCharges.contracts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      {t('operationalReports.noExtraCharges')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="table-header-contract-num">{t('operationalReports.contractNumber')}</TableHead>
                          <TableHead data-testid="table-header-customer">{t('operationalReports.customer')}</TableHead>
                          <TableHead className="text-right" data-testid="table-header-total-extra">
                            {t('operationalReports.totalExtra')}
                          </TableHead>
                          <TableHead data-testid="table-header-status-extra">{t('operationalReports.currentStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.extraCharges.contracts
                          .sort((a, b) => b.extraCharges - a.extraCharges)
                          .map((contract) => (
                          <TableRow key={contract.contractId} data-testid={`row-extra-${contract.contractId}`}>
                            <TableCell className="font-medium">
                              <Link href={`/contracts/${contract.contractId}`}>
                                <span className="text-primary hover:underline">#{contract.contractNumber}</span>
                              </Link>
                            </TableCell>
                            <TableCell>{contract.customerName}</TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(contract.extraCharges)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(contract.status)}>
                                {contract.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
