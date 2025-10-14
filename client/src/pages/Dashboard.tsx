import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Contract, AuditLog } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
        <Button asChild data-testid="button-new-contract">
          <Link href="/contracts/new">
            <span className="material-icons">add</span>
            <span>{t('contracts.newContract')}</span>
          </Link>
        </Button>
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
    </div>
  );
}
