import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Contract, SystemError } from '@shared/schema';
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
  const { isAuthenticated, isLoading, isAdmin, isManager } = useAuth();
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

  // Analytics queries (Admin and Manager only)
  const canViewAnalytics = isAdmin || isManager;
  
  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery<{
    totalRevenue: number;
    averageContractValue: number;
    monthlyRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number;
  }>({
    queryKey: ['/api/analytics', 'revenue'],
    enabled: isAuthenticated && canViewAnalytics,
  });

  const { data: operationalAnalytics, isLoading: operationalLoading } = useQuery<{
    averageRentalDuration: number;
    contractsThisMonth: number;
    contractsLastMonth: number;
    contractGrowth: number;
    mostActiveUser: { name: string; count: number } | null;
  }>({
    queryKey: ['/api/analytics', 'operations'],
    enabled: isAuthenticated && canViewAnalytics,
  });

  const { data: customerAnalytics, isLoading: customerLoading } = useQuery<{
    totalCustomers: number;
    repeatCustomers: number;
    repeatCustomerRate: number;
    newCustomersThisMonth: number;
  }>({
    queryKey: ['/api/analytics', 'customers'],
    enabled: isAuthenticated && canViewAnalytics,
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

  // Phase 3.1: Enhanced dashboard metrics
  const draftContracts = contracts.filter(c => c.status === 'draft').length;
  const confirmedContracts = contracts.filter(c => c.status === 'confirmed').length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const closedContracts = contracts.filter(c => c.status === 'closed').length;
  const finalizedContracts = contracts.filter(c => c.status === 'finalized').length;
  
  // Calculate overdue returns (active contracts past rental end date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueContracts = contracts.filter(c => {
    if (c.status !== 'active') return false;
    const endDate = new Date(c.rentalEndDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  });
  
  // Calculate pending refunds (closed contracts with deposit paid but not refunded)
  const pendingRefunds = contracts.filter(c => 
    c.status === 'closed' && 
    c.depositPaid === true && 
    c.depositRefunded !== true
  );
  
  // Calculate monthly revenue from active and completed contracts
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = contracts
    .filter(c => {
      if (!c.createdAt) return false;
      const contractDate = new Date(c.createdAt);
      return contractDate.getMonth() === currentMonth && 
             contractDate.getFullYear() === currentYear &&
             (c.status === 'active' || c.status === 'completed' || c.status === 'closed');
    })
    .reduce((sum, c) => {
      const total = parseFloat(c.totalAmount || '0');
      const extras = parseFloat(c.totalExtraCharges || '0');
      return sum + total + extras;
    }, 0);

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

      {/* Phase 3.1: Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Rentals
            </CardTitle>
            <span className="material-icons text-primary">directions_car</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="stat-active-contracts">{activeContracts}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently rented out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <span className="material-icons text-chart-1">payments</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-1" data-testid="stat-monthly-revenue">
              {monthlyRevenue.toLocaleString('en-SA', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className={overdueContracts.length > 0 ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Returns
            </CardTitle>
            <span className={`material-icons ${overdueContracts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              warning
            </span>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueContracts.length > 0 ? 'text-destructive' : ''}`} data-testid="stat-overdue-contracts">
              {overdueContracts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card className={pendingRefunds.length > 0 ? "border-chart-3" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Refunds
            </CardTitle>
            <span className={`material-icons ${pendingRefunds.length > 0 ? 'text-chart-3' : 'text-muted-foreground'}`}>
              account_balance_wallet
            </span>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${pendingRefunds.length > 0 ? 'text-chart-3' : ''}`} data-testid="stat-pending-refunds">
              {pendingRefunds.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Deposits to refund</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <span className="material-icons text-muted-foreground text-sm">edit_note</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4" data-testid="stat-draft-contracts">{draftContracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <span className="material-icons text-muted-foreground text-sm">check</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-confirmed-contracts">{confirmedContracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="material-icons text-muted-foreground text-sm">done_all</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-completed-contracts">{completedContracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <span className="material-icons text-muted-foreground text-sm">archive</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="stat-closed-contracts">{closedContracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <span className="material-icons text-muted-foreground text-sm">description</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-contracts">{contracts.length}</div>
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

      {/* Business Analytics (Admin and Manager only) */}
      {canViewAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.revenueMetrics')}
            </CardTitle>
            <span className="material-icons text-muted-foreground">monetization_on</span>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : revenueAnalytics ? (
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold" data-testid="stat-total-revenue">
                    ${revenueAnalytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('analytics.totalRevenue')}</p>
                </div>
                <div>
                  <div className="text-lg font-medium" data-testid="stat-avg-contract">
                    ${revenueAnalytics.averageContractValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('analytics.avgContractValue')}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className={`material-icons text-sm ${revenueAnalytics.revenueGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {revenueAnalytics.revenueGrowth >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  <span className={`text-sm font-medium ${revenueAnalytics.revenueGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`} data-testid="stat-revenue-growth">
                    {revenueAnalytics.revenueGrowth >= 0 ? '+' : ''}{revenueAnalytics.revenueGrowth.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{t('analytics.vsLastMonth')}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Operational Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.operationalMetrics')}
            </CardTitle>
            <span className="material-icons text-muted-foreground">assessment</span>
          </CardHeader>
          <CardContent>
            {operationalLoading ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : operationalAnalytics ? (
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold" data-testid="stat-avg-duration">
                    {operationalAnalytics.averageRentalDuration.toFixed(1)} {t('analytics.days')}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('analytics.avgRentalDuration')}</p>
                </div>
                <div>
                  <div className="text-lg font-medium" data-testid="stat-contracts-this-month">
                    {operationalAnalytics.contractsThisMonth} {t('analytics.contracts')}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('analytics.contractsThisMonth')}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className={`material-icons text-sm ${operationalAnalytics.contractGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {operationalAnalytics.contractGrowth >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  <span className={`text-sm font-medium ${operationalAnalytics.contractGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`} data-testid="stat-contract-growth">
                    {operationalAnalytics.contractGrowth >= 0 ? '+' : ''}{operationalAnalytics.contractGrowth.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{t('analytics.vsLastMonth')}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.customerInsights')}
            </CardTitle>
            <span className="material-icons text-muted-foreground">people</span>
          </CardHeader>
          <CardContent>
            {customerLoading ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : customerAnalytics ? (
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold" data-testid="stat-total-customers">
                    {customerAnalytics.totalCustomers}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('analytics.totalCustomers')}</p>
                </div>
                <div>
                  <div className="text-lg font-medium" data-testid="stat-repeat-rate">
                    {customerAnalytics.repeatCustomerRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">{t('analytics.repeatCustomerRate')}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="material-icons text-sm text-chart-2">person_add</span>
                  <span className="text-sm font-medium" data-testid="stat-new-customers">
                    {customerAnalytics.newCustomersThisMonth} {t('analytics.newCustomers')}
                  </span>
                  <span className="text-xs text-muted-foreground">{t('analytics.thisMonth')}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
            )}
          </CardContent>
        </Card>
        </div>
      )}

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
