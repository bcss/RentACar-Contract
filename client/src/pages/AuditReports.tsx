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
  contractsModified: number;
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
}

export default function AuditReports() {
  const { t, i18n } = useTranslation();
  const { isAdmin, isManager } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('modifications');

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
      
      const response = await fetch(`/api/reports/audit/export?${params.toString()}`, {
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
    };
    return labels[field] || field;
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
            {t('audit.businessOpsTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('audit.businessOpsSubtitle')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('audit.businessOpsDescription')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')} data-testid="button-export-pdf">
            <span className="material-icons mr-2">picture_as_pdf</span>
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} data-testid="button-export-excel">
            <span className="material-icons mr-2">table_chart</span>
            Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
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
              <span className="material-icons mr-2">clear</span>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-audit-reports">
          <TabsTrigger value="modifications" data-testid="tab-modifications">
            Contract Modifications
          </TabsTrigger>
          <TabsTrigger value="all-actions" data-testid="tab-all-actions">
            All Actions
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            User Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modifications" className="space-y-6 mt-6">
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
                <CardTitle>Contract Modifications</CardTitle>
                <CardDescription>
                  Most recent modifications first
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.modifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No contract modifications in this period
                  </p>
                ) : (
                  <div className="space-y-4">
                    {report.modifications.slice(0, 100).map((mod) => (
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
                    
                    {report.modifications.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center pt-4">
                        Showing first 100 modifications. Use date filters to narrow results.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all-actions" className="space-y-6 mt-6">
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
                <CardTitle>All System Actions</CardTitle>
                <CardDescription>
                  Complete CRUD operation history for all entities (contracts, customers, vehicles, sponsors, companies)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.auditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No system actions in this period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {report.auditLogs.slice(0, 100).map((log) => (
                      <div 
                        key={log.id} 
                        className="border rounded-lg p-4 hover-elevate"
                        data-testid={`audit-log-${log.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {log.action}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                              </span>
                            </div>
                            
                            {log.details && (
                              <p className="text-sm">
                                {log.details}
                              </p>
                            )}
                            
                            {log.contractId && (
                              <p className="text-xs text-muted-foreground">
                                Contract ID: {log.contractId}
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
                    
                    {report.auditLogs.length > 100 && (
                      <p className="text-sm text-muted-foreground text-center pt-4">
                        Showing first 100 actions. Use date filters to narrow results.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
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
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-active-users">
                      {report.userActivity.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Made modifications
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Modifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-modifications">
                      {report.modifications.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      In selected period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg. per User
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-avg-modifications">
                      {report.userActivity.length > 0
                        ? (report.modifications.length / report.userActivity.length).toFixed(1)
                        : '0.0'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modifications
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity Summary</CardTitle>
                  <CardDescription>
                    Sorted by modification count (highest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.userActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      No user activity in this period
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="table-header-user">User</TableHead>
                          <TableHead className="text-right" data-testid="table-header-modifications">
                            Modifications
                          </TableHead>
                          <TableHead className="text-right" data-testid="table-header-contracts-modified">
                            Contracts Modified
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.userActivity.map((user) => (
                          <TableRow key={user.userId} data-testid={`row-user-${user.userId}`}>
                            <TableCell className="font-medium">{user.userName}</TableCell>
                            <TableCell className="text-right">{user.modificationCount}</TableCell>
                            <TableCell className="text-right">{user.contractsModified}</TableCell>
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
