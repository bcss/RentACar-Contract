import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { Icon } from '@/components/Icon';
import { getCsrfToken } from '@/lib/queryClient';

interface Modification {
  id: string;
  contractId: string;
  editedBy: string;
  editedAt: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  userName: string;
}

interface UserActivity {
  userId: string;
  userName: string;
  modificationCount: number;
  auditActionCount: number;
  totalActions: number;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  contractId: string | null;
  details: string | null;
  createdAt: string;
  userName: string;
  userFirstName: string | null;
  userLastName: string | null;
}

interface AuditReport {
  modifications: Modification[];
  userActivity: UserActivity[];
  auditLogs: AuditLog[];
  summary: {
    totalModifications: number;
    totalAuditLogs: number;
    uniqueContracts: number;
    avgModificationsPerContract: number;
    activeUsers: number;
    contractOperationsCount: number;
    masterDataOperationsCount: number;
    paymentOperationsCount: number;
    inspectionOperationsCount: number;
  };
  categories: {
    contractOperations: AuditLog[];
    masterDataOperations: AuditLog[];
    paymentOperations: AuditLog[];
    inspectionOperations: AuditLog[];
  };
  mostModifiedContracts: Array<{ contractId: string; modificationCount: number }>;
}

export default function AuditReports() {
  const { t, i18n } = useTranslation();
  const { isAdmin, isManager } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('contract-ops');

  // Build query URL with date filters
  const getQueryUrl = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    return `/api/reports/audit${params.toString() ? `?${params.toString()}` : ''}`;
  };

  // Export handlers
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('lang', i18n.language);
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      // Get CSRF token and include it in headers
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = {};
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
      
      const response = await fetch(`/api/reports/audit/export?${params.toString()}`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const { data: report, isLoading } = useQuery<AuditReport>({
    queryKey: ['/api/reports/audit', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(getQueryUrl(), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch audit report');
      return response.json();
    },
    enabled: isAdmin || isManager,
  });

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      status: 'Status',
      totalAmount: 'Total Amount',
      totalDays: 'Total Days',
      startDate: 'Start Date',
      endDate: 'End Date',
      vehicleId: 'Vehicle',
      customerId: 'Customer',
      totalExtraCharges: 'Extra Charges',
      kmAllowed: 'KM Allowed',
      kmStart: 'KM Start',
      kmEnd: 'KM End',
      notes: 'Notes',
      dailyRate: 'Daily Rate',
      weeklyRate: 'Weekly Rate',
      monthlyRate: 'Monthly Rate',
    };
    return labels[field] || field;
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Business Operations Audit
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all contract operations, master data changes, and financial activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')} data-testid="button-export-pdf">
            <Icon name="picture_as_pdf" className=" mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} data-testid="button-export-excel">
            <Icon name="table_chart" className=" mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateFrom')}</label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder={t('common.dateFrom')}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateTo')}</label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder={t('common.dateTo')}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={!startDate && !endDate}
              data-testid="button-clear-filters"
            >
              <Icon name="clear" className=" mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-audit-reports">
          <TabsTrigger value="contract-ops" data-testid="tab-contract-ops">
            Contract Operations
          </TabsTrigger>
          <TabsTrigger value="master-data" data-testid="tab-master-data">
            Master Data
          </TabsTrigger>
          <TabsTrigger value="financial" data-testid="tab-financial">
            Financial Operations
          </TabsTrigger>
          <TabsTrigger value="summary" data-testid="tab-summary">
            Summary Statistics
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Contract Operations */}
        <TabsContent value="contract-ops" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Contract Lifecycle Operations</CardTitle>
                <CardDescription>
                  Create, confirm, activate, complete, and close events ({report.categories.contractOperations.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.categories.contractOperations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No contract operations in this period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {report.categories.contractOperations.slice(0, 100).map((log) => (
                      <div 
                        key={log.id} 
                        className="border rounded-lg p-4 hover-elevate"
                        data-testid={`contract-op-${log.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="font-mono text-xs">
                                {formatActionName(log.action)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                              </span>
                            </div>
                            
                            {log.details && (
                              <p className="text-sm">
                                {log.details}
                              </p>
                            )}
                            
                            {log.contractId && (
                              <Link href={`/contracts/${log.contractId}`}>
                                <span className="text-xs text-primary hover:underline">
                                  Contract: {log.contractId.slice(0, 8)}
                                </span>
                              </Link>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {log.userFirstName && log.userLastName 
                                ? `${log.userFirstName} ${log.userLastName}`
                                : log.userName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {report.categories.contractOperations.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center pt-4">
                        Showing first 100 operations. Use date filters to narrow results.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Master Data Operations */}
        <TabsContent value="master-data" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Master Data Operations</CardTitle>
                <CardDescription>
                  CRUD operations for customers, vehicles, sponsors, and companies ({report.categories.masterDataOperations.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.categories.masterDataOperations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No master data operations in this period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {report.categories.masterDataOperations.slice(0, 100).map((log) => (
                      <div 
                        key={log.id} 
                        className="border rounded-lg p-4 hover-elevate"
                        data-testid={`master-data-op-${log.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {formatActionName(log.action)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                              </span>
                            </div>
                            
                            {log.details && (
                              <p className="text-sm">
                                {log.details}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {log.userFirstName && log.userLastName 
                                ? `${log.userFirstName} ${log.userLastName}`
                                : log.userName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {report.categories.masterDataOperations.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center pt-4">
                        Showing first 100 operations. Use date filters to narrow results.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 3: Financial Operations */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Contract Modifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Field Modifications</CardTitle>
                  <CardDescription>
                    Field-level changes to contract data ({report.modifications.length} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.modifications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      No contract modifications in this period
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {report.modifications.slice(0, 50).map((mod) => (
                        <div 
                          key={mod.id} 
                          className="border rounded-lg p-4 hover-elevate"
                          data-testid={`modification-${mod.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Link href={`/contracts/${mod.contractId}`}>
                                <span className="text-primary hover:underline font-medium">
                                  Contract {mod.contractId.slice(0, 8)}
                                </span>
                              </Link>
                              <Badge variant="outline">{getFieldLabel(mod.fieldChanged)}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(mod.editedAt), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Old Value</p>
                              <p className="text-sm font-mono bg-muted p-2 rounded">
                                {mod.oldValue || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">New Value</p>
                              <p className="text-sm font-mono bg-muted p-2 rounded">
                                {mod.newValue || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Modified by: <span className="font-medium">{mod.userName}</span>
                            </span>
                            {mod.reason && (
                              <span className="text-muted-foreground">
                                Reason: <span className="font-medium">{mod.reason}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {report.modifications.length > 50 && (
                        <p className="text-sm text-muted-foreground text-center pt-4">
                          Showing first 50 modifications. Use date filters to narrow results.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Operations */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Operations</CardTitle>
                  <CardDescription>
                    Payment creation events ({report.categories.paymentOperations.length} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.categories.paymentOperations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      No payment operations in this period
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {report.categories.paymentOperations.slice(0, 50).map((log) => (
                        <div 
                          key={log.id} 
                          className="border rounded-lg p-4 hover-elevate"
                          data-testid={`payment-op-${log.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="font-mono text-xs">
                                  Payment Recorded
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                                </span>
                              </div>
                              
                              {log.details && (
                                <p className="text-sm">
                                  {log.details}
                                </p>
                              )}
                              
                              {log.contractId && (
                                <Link href={`/contracts/${log.contractId}`}>
                                  <span className="text-xs text-primary hover:underline">
                                    Contract: {log.contractId.slice(0, 8)}
                                  </span>
                                </Link>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {log.userFirstName && log.userLastName 
                                  ? `${log.userFirstName} ${log.userLastName}`
                                  : log.userName}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {report.categories.paymentOperations.length > 50 && (
                        <p className="text-sm text-muted-foreground text-center pt-4">
                          Showing first 50 operations. Use date filters to narrow results.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab 4: Summary Statistics */}
        <TabsContent value="summary" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overview Statistics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-operations">
                      {report.summary.totalAuditLogs}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All business operations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-active-users">
                      {report.summary.activeUsers}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Users who made changes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Contract Modifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-modifications">
                      {report.summary.totalModifications}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Field-level changes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Unique Contracts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-unique-contracts">
                      {report.summary.uniqueContracts}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modified contracts
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Operation Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Operation Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of operations by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="description" className=" text-primary" />
                        <div>
                          <p className="font-medium">Contract Operations</p>
                          <p className="text-sm text-muted-foreground">Lifecycle events</p>
                        </div>
                      </div>
                      <Badge variant="default">{report.summary.contractOperationsCount}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="storage" className=" text-primary" />
                        <div>
                          <p className="font-medium">Master Data Operations</p>
                          <p className="text-sm text-muted-foreground">Customers, vehicles, sponsors, companies</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{report.summary.masterDataOperationsCount}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="payments" className=" text-primary" />
                        <div>
                          <p className="font-medium">Payment Operations</p>
                          <p className="text-sm text-muted-foreground">Payment recordings</p>
                        </div>
                      </div>
                      <Badge variant="default">{report.summary.paymentOperationsCount}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="edit_note" className=" text-primary" />
                        <div>
                          <p className="font-medium">Contract Modifications</p>
                          <p className="text-sm text-muted-foreground">Field-level changes</p>
                        </div>
                      </div>
                      <Badge variant="outline">{report.summary.totalModifications}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="check_circle" className=" text-primary" />
                        <div>
                          <p className="font-medium">Vehicle Inspections</p>
                          <p className="text-sm text-muted-foreground">Pre/post inspections</p>
                        </div>
                      </div>
                      <Badge variant="outline">{report.summary.inspectionOperationsCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Most Modified Contracts */}
              {report.mostModifiedContracts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Most Modified Contracts</CardTitle>
                    <CardDescription>
                      Contracts with the most field changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract ID</TableHead>
                          <TableHead className="text-right">Modifications</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.mostModifiedContracts.map((contract) => (
                          <TableRow key={contract.contractId}>
                            <TableCell>
                              <Link href={`/contracts/${contract.contractId}`}>
                                <span className="text-primary hover:underline font-mono">
                                  {contract.contractId.slice(0, 12)}
                                </span>
                              </Link>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{contract.modificationCount}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
