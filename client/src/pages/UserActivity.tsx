import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/Icon';

interface UserActivity {
  userId: string;
  userName: string;
  modificationCount: number;
  auditActionCount: number;
  totalActions: number;
}

interface AuditReport {
  modifications: any[];
  userActivity: UserActivity[];
  summary: {
    totalModifications: number;
    totalAuditLogs: number;
    activeUsers: number;
  };
}

export default function UserActivity() {
  const { t } = useTranslation();
  const { isAdmin, isManager } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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
            User Activity Report
          </h1>
          <p className="text-muted-foreground mt-1">
            Track user contributions and activity levels across the system
          </p>
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
                  Users who performed actions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-actions">
                  {report.userActivity.reduce((sum, user) => sum + user.totalActions, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Combined user activity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average per User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-actions">
                  {report.userActivity.length > 0
                    ? (report.userActivity.reduce((sum, user) => sum + user.totalActions, 0) / report.userActivity.length).toFixed(1)
                    : '0.0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Actions per active user
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Details</CardTitle>
              <CardDescription>
                Breakdown of all user actions (sorted by total activity)
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
                        Contract Modifications
                      </TableHead>
                      <TableHead className="text-right" data-testid="table-header-audit-actions">
                        Business Operations
                      </TableHead>
                      <TableHead className="text-right" data-testid="table-header-total-actions">
                        Total Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.userActivity.map((user) => (
                      <TableRow key={user.userId} data-testid={`row-user-${user.userId}`}>
                        <TableCell className="font-medium">{user.userName}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{user.modificationCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{user.auditActionCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default">{user.totalActions}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Activity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>
                Understand the balance between different types of activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="edit_note" className=" text-primary" />
                    <div>
                      <p className="font-medium">Contract Modifications</p>
                      <p className="text-sm text-muted-foreground">Field-level contract changes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {report.userActivity.reduce((sum, user) => sum + user.modificationCount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {report.userActivity.reduce((sum, user) => sum + user.totalActions, 0) > 0
                        ? `${((report.userActivity.reduce((sum, user) => sum + user.modificationCount, 0) / report.userActivity.reduce((sum, user) => sum + user.totalActions, 0)) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="business" className=" text-primary" />
                    <div>
                      <p className="font-medium">Business Operations</p>
                      <p className="text-sm text-muted-foreground">CRUD operations, lifecycle events</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {report.userActivity.reduce((sum, user) => sum + user.auditActionCount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {report.userActivity.reduce((sum, user) => sum + user.totalActions, 0) > 0
                        ? `${((report.userActivity.reduce((sum, user) => sum + user.auditActionCount, 0) / report.userActivity.reduce((sum, user) => sum + user.totalActions, 0)) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
