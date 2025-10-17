import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AuditLog, SystemError } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const [activeTab, setActiveTab] = useState('audit');

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit-logs'],
    enabled: isAuthenticated && (isAdmin || isManager),
  });

  const { data: systemErrors = [], isLoading: systemErrorsLoading } = useQuery<SystemError[]>({
    queryKey: ['/api/system-errors'],
    enabled: isAuthenticated && isAdmin,
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
                <span className="material-icons">history</span>
                {t('audit.auditTrail')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
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
                    {logs.map((log) => (
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
                          {log.userId}
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
                  <span className="material-icons">error</span>
                  {t('audit.systemErrors')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {systemErrorsLoading ? (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                  </div>
                ) : systemErrors.length === 0 ? (
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
                        <TableHead>{t('audit.details')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemErrors.map((error) => (
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
                          <TableCell className="text-sm text-muted-foreground" data-testid={`text-error-details-${error.id}`}>
                            {error.errorStack || error.additionalData || '-'}
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
    </div>
  );
}
