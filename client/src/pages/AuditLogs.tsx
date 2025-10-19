import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AuditLog, SystemError } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function AuditLogs() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin, isManager } = useAuth();

  // Check for tab query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'errors' && isAdmin ? 'errors' : 'audit');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (!isAdmin && !isManager))) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isAdmin, isManager, authLoading, toast]);
  
  // Audit log filters
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  
  // System error filters
  const [errorTypeFilter, setErrorTypeFilter] = useState<string>('all');
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [errorDateFromFilter, setErrorDateFromFilter] = useState<string>('');
  const [errorDateToFilter, setErrorDateToFilter] = useState<string>('');

  // Acknowledge dialog
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit-logs'],
    enabled: isAuthenticated && (isAdmin || isManager),
  });

  const { data: systemErrors = [], isLoading: systemErrorsLoading } = useQuery<SystemError[]>({
    queryKey: ['/api/system-errors'],
    enabled: isAuthenticated && isAdmin,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/system-errors/${id}/acknowledge`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors', 'unacknowledged'] });
      toast({
        title: 'Error Acknowledged',
        description: 'System error has been acknowledged successfully',
      });
      setIsAcknowledgeDialogOpen(false);
      setSelectedError(null);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || 'Failed to acknowledge error',
      });
    },
  });

  const handleAcknowledge = () => {
    if (selectedError) {
      acknowledgeMutation.mutate(selectedError.id);
    }
  };

  const openAcknowledgeDialog = (error: SystemError) => {
    setSelectedError(error);
    setIsAcknowledgeDialogOpen(true);
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      create: 'add_circle',
      edit: 'edit',
      finalize: 'lock',
      print: 'print',
      delete: 'delete',
      login: 'login',
      logout: 'logout',
    };
    return icons[action] || 'circle';
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      create: 'default',
      finalize: 'default',
      edit: 'secondary',
      print: 'outline',
      delete: 'outline',
    };
    return variants[action] || 'outline';
  };

  // Filter audit logs
  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesUser = userFilter === 'all' || log.userId?.toString() === userFilter;
    
    let matchesDateRange = true;
    if (dateFromFilter || dateToFilter) {
      if (log.createdAt) {
        const logDate = new Date(log.createdAt);
        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          fromDate.setHours(0, 0, 0, 0);
          matchesDateRange = matchesDateRange && logDate >= fromDate;
        }
        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && logDate <= toDate;
        }
      }
    }
    
    return matchesAction && matchesUser && matchesDateRange;
  });

  // Filter system errors
  const filteredSystemErrors = systemErrors.filter(error => {
    const matchesErrorType = errorTypeFilter === 'all' || error.errorType === errorTypeFilter;
    const matchesEndpoint = endpointFilter === 'all' || error.endpoint === endpointFilter;
    
    let matchesDateRange = true;
    if (errorDateFromFilter || errorDateToFilter) {
      if (error.createdAt) {
        const errorDate = new Date(error.createdAt);
        if (errorDateFromFilter) {
          const fromDate = new Date(errorDateFromFilter);
          fromDate.setHours(0, 0, 0, 0);
          matchesDateRange = matchesDateRange && errorDate >= fromDate;
        }
        if (errorDateToFilter) {
          const toDate = new Date(errorDateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && errorDate <= toDate;
        }
      }
    }
    
    return matchesErrorType && matchesEndpoint && matchesDateRange;
  });

  // Get unique values for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueUsers = Array.from(new Set(logs.map(log => log.userId).filter(Boolean)));
  const uniqueErrorTypes = Array.from(new Set(systemErrors.map(error => error.errorType)));
  const uniqueEndpoints = Array.from(new Set(systemErrors.map(error => error.endpoint)));

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-audit-logs-title">{t('audit.title')}</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList data-testid="tabs-audit-logs">
          <TabsTrigger value="audit" data-testid="tab-audit-trail">
            {t('audit.auditTrail')}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="errors" data-testid="tab-system-errors">
              {t('audit.systemErrors')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">filter_list</span>
                {t('common.filter')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('audit.action')}</label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger data-testid="select-action-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {uniqueActions.map(action => (
                        <SelectItem key={action} value={action}>{t(`action.${action}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('audit.user')}</label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger data-testid="select-user-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {uniqueUsers.map(userId => (
                        <SelectItem key={userId} value={userId!.toString()}>{userId}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.dateFrom')}</label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    data-testid="input-date-from"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.dateTo')}</label>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    data-testid="input-date-to"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">history</span>
                {t('audit.auditTrail')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-icons text-6xl text-muted-foreground">history</span>
                  <p className="mt-4 text-muted-foreground">{t('common.noResults')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('audit.action')}</TableHead>
                      <TableHead>{t('audit.contract')}</TableHead>
                      <TableHead>{t('audit.user')}</TableHead>
                      <TableHead>{t('audit.timestamp')}</TableHead>
                      <TableHead>{t('audit.details')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover-elevate" data-testid={`row-log-${log.id}`}>
                        <TableCell>
                          <Badge variant={getActionBadge(log.action)} className="flex items-center gap-1 w-fit">
                            <span className="material-icons text-sm">{getActionIcon(log.action)}</span>
                            {t(`action.${log.action}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono" data-testid={`text-log-contract-${log.id}`}>
                          {log.contractId || 'N/A'}
                        </TableCell>
                        <TableCell data-testid={`text-log-user-${log.id}`}>
                          {(log as any).userFirstName && (log as any).userLastName
                            ? `${(log as any).userFirstName} ${(log as any).userLastName}`
                            : (log as any).userName || log.userId}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.createdAt && format(new Date(log.createdAt), 'PPp')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`text-log-details-${log.id}`}>
                          {log.details || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-icons">filter_list</span>
                  {t('common.filter')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('audit.errorType')}</label>
                    <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
                      <SelectTrigger data-testid="select-error-type-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all')}</SelectItem>
                        {uniqueErrorTypes.map(errorType => (
                          <SelectItem key={errorType} value={errorType}>{errorType}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('audit.endpoint')}</label>
                    <Select value={endpointFilter} onValueChange={setEndpointFilter}>
                      <SelectTrigger data-testid="select-endpoint-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all')}</SelectItem>
                        {uniqueEndpoints.filter(Boolean).map(endpoint => (
                          <SelectItem key={endpoint} value={endpoint!}>{endpoint}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('common.dateFrom')}</label>
                    <Input
                      type="date"
                      value={errorDateFromFilter}
                      onChange={(e) => setErrorDateFromFilter(e.target.value)}
                      data-testid="input-error-date-from"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('common.dateTo')}</label>
                    <Input
                      type="date"
                      value={errorDateToFilter}
                      onChange={(e) => setErrorDateToFilter(e.target.value)}
                      data-testid="input-error-date-to"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-icons">error</span>
                  {t('audit.systemErrors')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {systemErrorsLoading ? (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                  </div>
                ) : filteredSystemErrors.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-icons text-6xl text-muted-foreground">error</span>
                    <p className="mt-4 text-muted-foreground">{t('common.noResults')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>{t('audit.errorMessage')}</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>{t('audit.timestamp')}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSystemErrors.map((error) => (
                        <TableRow key={error.id} className="hover-elevate" data-testid={`row-error-${error.id}`}>
                          <TableCell>
                            <Badge 
                              variant="destructive"
                              className="flex items-center gap-1 w-fit"
                            >
                              <span className="material-icons text-sm">dangerous</span>
                              {error.errorType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm" data-testid={`text-error-message-${error.id}`}>
                            {error.errorMessage}
                          </TableCell>
                          <TableCell className="text-sm">
                            {error.endpoint || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {error.createdAt && format(new Date(error.createdAt), 'PPp')}
                          </TableCell>
                          <TableCell>
                            {error.acknowledged ? (
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <span className="material-icons text-sm">check_circle</span>
                                Acknowledged
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <span className="material-icons text-sm">pending</span>
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!error.acknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAcknowledgeDialog(error)}
                                data-testid={`button-acknowledge-${error.id}`}
                              >
                                <span className="material-icons text-sm">check</span>
                                <span>Acknowledge</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Acknowledge Dialog */}
      <AlertDialog open={isAcknowledgeDialogOpen} onOpenChange={setIsAcknowledgeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acknowledge System Error</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to acknowledge this system error? This will mark it as reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-acknowledge">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcknowledge}
              disabled={acknowledgeMutation.isPending}
              data-testid="button-confirm-acknowledge"
            >
              {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
