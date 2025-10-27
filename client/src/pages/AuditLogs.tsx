import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AuditLog } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { format } from 'date-fns';

export default function AuditLogs() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin, isManager } = useAuth();

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

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit-logs'],
    enabled: isAuthenticated && (isAdmin || isManager),
  });

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

  // Get unique values for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueUsers = Array.from(new Set(logs.map(log => log.userId).filter(Boolean)));

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
          <h1 className="text-3xl font-bold" data-testid="text-audit-logs-title">{t('audit.systemLogsTitle')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('audit.systemLogsSubtitle')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('audit.systemLogsDescription')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="material-icons">filter_list</span>
            {t('common.filter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium block">{t('audit.action')}</label>
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
              <label className="text-sm font-medium block">{t('audit.user')}</label>
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
              <label className="text-sm font-medium block">{t('common.dateFrom')}</label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                data-testid="input-date-from"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">{t('common.dateTo')}</label>
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
                  <TableHead>{t('audit.location')}</TableHead>
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
                    <TableCell className="text-sm">
                      {log.city || log.country ? (
                        <div className="flex items-center gap-1" data-testid={`text-log-location-${log.id}`}>
                          <span className="material-icons text-xs text-muted-foreground">location_on</span>
                          <span>
                            {[log.city, log.region, log.country].filter(Boolean).join(', ') || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.createdAt && format(new Date(log.createdAt), 'PPp')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground" data-testid={`text-log-details-${log.id}`}>
                      <div className="space-y-1">
                        <div>{log.details || '-'}</div>
                        {log.userAgent && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs" title={log.userAgent}>
                            {log.userAgent}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
