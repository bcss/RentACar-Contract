import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Contract, AuditLog, SystemError } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
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

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [isAcknowledgeAllDialogOpen, setIsAcknowledgeAllDialogOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('common.error'),
        description: t('msg.noPermission'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, t]);

  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
    enabled: isAuthenticated,
  });

  const { data: recentActivity = [] } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit-logs', 'recent'],
    enabled: isAuthenticated,
  });

  const { data: unacknowledgedErrors = [] } = useQuery<SystemError[]>({
    queryKey: ['/api/system-errors', 'unacknowledged'],
    enabled: isAuthenticated && isAdmin,
  });

  const acknowledgeAllMutation = useMutation({
    mutationFn: async () => {
      // Acknowledge all unacknowledged errors
      const promises = unacknowledgedErrors.map(error => 
        apiRequest('POST', `/api/system-errors/${error.id}/acknowledge`)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors', 'unacknowledged'] });
      toast({
        title: 'All Errors Acknowledged',
        description: 'All system errors have been acknowledged successfully',
      });
      setIsAcknowledgeAllDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || 'Failed to acknowledge errors',
      });
    },
  });

  const draftContracts = contracts.filter(c => c.status === 'draft').length;
  const finalizedContracts = contracts.filter(c => c.status === 'finalized').length;

  const getStatusBadge = (status: string) => {
    return status === 'finalized' 
      ? <Badge variant="default" className="bg-chart-2 hover:bg-chart-2">{t('contracts.finalized')}</Badge>
      : <Badge variant="secondary" className="bg-chart-4 hover:bg-chart-4">{t('contracts.draft')}</Badge>;
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

  if (isLoading) {
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
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('auth.welcomeBack')}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="outline" data-testid="button-add-user">
              <Link href="/users?action=add">
                <span className="material-icons">person_add</span>
                <span>{t('users.addUser')}</span>
              </Link>
            </Button>
          )}
          <Button asChild data-testid="button-new-contract">
            <Link href="/contracts/new">
              <span className="material-icons">add</span>
              <span>{t('contracts.newContract')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalContracts')}
            </CardTitle>
            <span className="material-icons text-muted-foreground">description</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-contracts">{contracts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.draftContracts')}
            </CardTitle>
            <span className="material-icons text-muted-foreground">edit_note</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4" data-testid="stat-draft-contracts">{draftContracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.finalizedContracts')}
            </CardTitle>
            <span className="material-icons text-muted-foreground">check_circle</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2" data-testid="stat-finalized-contracts">{finalizedContracts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Unacknowledged System Errors (Admin only) */}
      {isAdmin && unacknowledgedErrors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons text-destructive">error</span>
              Unacknowledged System Errors
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" data-testid="badge-error-count">
                {unacknowledgedErrors.length} Pending
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAcknowledgeAllDialogOpen(true)}
                data-testid="button-acknowledge-all"
              >
                <span className="material-icons text-sm">done_all</span>
                <span>Acknowledge All</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unacknowledgedErrors.slice(0, 3).map((error) => (
                <div key={error.id} className="flex items-start gap-3 p-3 rounded-md hover-elevate border border-destructive/30" data-testid={`error-item-${error.id}`}>
                  <span className="material-icons text-destructive mt-0.5">dangerous</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">
                        {error.errorType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {error.createdAt && format(new Date(error.createdAt), 'PPp')}
                      </span>
                    </div>
                    <p className="text-sm font-mono truncate">{error.errorMessage}</p>
                    {error.endpoint && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Endpoint: {error.endpoint}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {unacknowledgedErrors.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation('/audit-logs?tab=errors')}
                  data-testid="button-view-all-errors"
                >
                  View All {unacknowledgedErrors.length} Errors
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="material-icons">history</span>
            {t('dashboard.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('common.noResults')}</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-md hover-elevate border">
                  <span className="material-icons text-muted-foreground">
                    {getActionIcon(log.action)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {t(`action.${log.action}`)}
                      {log.contractId && ` - ${t('contracts.contractNumber')} ${log.contractId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.createdAt && format(new Date(log.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledge All Dialog */}
      <AlertDialog open={isAcknowledgeAllDialogOpen} onOpenChange={setIsAcknowledgeAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acknowledge All System Errors</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to acknowledge all {unacknowledgedErrors.length} unacknowledged system errors? This will mark them all as reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-acknowledge-all">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => acknowledgeAllMutation.mutate()}
              disabled={acknowledgeAllMutation.isPending}
              data-testid="button-confirm-acknowledge-all"
            >
              {acknowledgeAllMutation.isPending ? 'Acknowledging...' : 'Acknowledge All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
