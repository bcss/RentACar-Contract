import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Contract, SystemError, Vehicle } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { getTimeBasedGreeting, getTimeAgo } from '@/utils/timeGreeting';
import { AlertCircle, X, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin, isManager, user } = useAuth();
  const { currency } = useCurrency();
  const [, setLocation] = useLocation();
  const [isAcknowledgeAllDialogOpen, setIsAcknowledgeAllDialogOpen] = useState(false);
  const [isErrorBannerDismissed, setIsErrorBannerDismissed] = useState(false);

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

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
    enabled: isAuthenticated,
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
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

  // Query unclosed contracts for alert card (Admin and Manager only)
  const { data: unclosedContracts = [] } = useQuery<any[]>({
    queryKey: ['/api/contracts/unclosed-alerts'],
    enabled: isAuthenticated && canViewAnalytics,
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
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const closedContracts = contracts.filter(c => c.status === 'closed').length;
  
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

  // Calculate Vehicle Utilization (% of vehicles currently rented)
  const totalVehicles = vehicles.filter(v => !v.disabled).length;
  const vehicleUtilization = totalVehicles > 0 ? (activeContracts / totalVehicles) * 100 : 0;

  // Calculate Payment Collection Rate (% collected vs total due)
  const totalDue = contracts
    .filter(c => ['active', 'completed', 'closed'].includes(c.status))
    .reduce((sum, c) => {
      const total = parseFloat(c.totalAmount || '0');
      const extras = parseFloat(c.totalExtraCharges || '0');
      return sum + total + extras;
    }, 0);

  const totalCollected = contracts
    .filter(c => ['active', 'completed', 'closed'].includes(c.status))
    .reduce((sum, c) => {
      const payments = parseFloat(c.amountPaid || '0');
      return sum + payments;
    }, 0);

  const paymentCollectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;

  // Calculate Average Extra Charges from completed contracts
  const completedWithExtras = contracts.filter(c => 
    c.status === 'completed' && parseFloat(c.totalExtraCharges || '0') > 0
  );
  const totalExtraCharges = completedWithExtras.reduce((sum, c) => 
    sum + parseFloat(c.totalExtraCharges || '0'), 0
  );
  const avgExtraCharges = completedContracts > 0 ? totalExtraCharges / completedContracts : 0;

  const getStatusBadge = (status: string) => {
    return status === 'draft' 
      ? <Badge variant="secondary" className="bg-chart-4 hover:bg-chart-4">{t('contracts.draft')}</Badge>
      : <Badge variant="default" className="bg-chart-2 hover:bg-chart-2">{status}</Badge>;
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

  // Get time-based greeting
  const greeting = getTimeBasedGreeting();
  const greetingText = i18n.language === 'ar' ? greeting.ar : greeting.en;
  const firstName = user?.firstName || user?.username || 'User';
  
  // Format last login time using i18n
  const getLastLoginText = () => {
    if (!user?.lastLoginAt) {
      return t('timeAgo.never');
    }
    const timeAgoResult = getTimeAgo(new Date(user.lastLoginAt), i18n.language);
    if (typeof timeAgoResult === 'string') {
      // It's a formatted date string
      return timeAgoResult;
    }
    // It's a translation key with optional count
    return t(timeAgoResult.key, { count: timeAgoResult.count });
  };
  const lastLoginText = getLastLoginText();

  return (
    <div className="p-6 space-y-6">
      {/* System Errors Banner - Only show if there are unacknowledged errors and banner is not dismissed */}
      {isAdmin && unacknowledgedErrors.length > 0 && !isErrorBannerDismissed && (
        <Alert variant="destructive" className="relative" data-testid="alert-system-errors">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('greeting.systemErrors')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t('systemErrors.unacknowledgedCount', { count: unacknowledgedErrors.length })}{' '}
              <button 
                className="underline hover:no-underline"
                onClick={() => setLocation('/system-errors')}
                data-testid="link-view-errors"
              >
                {t('systemErrors.clickToView')}
              </button>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setIsErrorBannerDismissed(true)}
              data-testid="button-dismiss-error-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">{t('dashboard.title')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-lg text-muted-foreground" data-testid="text-greeting">
              {greetingText}, <span className="font-semibold text-foreground">{firstName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-normal" data-testid="badge-user-role">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </Badge>
            <span>•</span>
            <span data-testid="text-last-login">{t('greeting.lastLogin')}: {lastLoginText}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/contracts?status=active')} data-testid="card-active-rentals">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Rentals
                </CardTitle>
                <span className="material-icons text-primary">directions_car</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-primary truncate" data-testid="stat-active-contracts">{activeContracts}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Currently rented out</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view active contracts</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/reports/financial?tab=revenue')} data-testid="card-monthly-revenue">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <span className="material-icons text-chart-1">payments</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-chart-1 truncate" data-testid="stat-monthly-revenue">
                    {currency} {monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view revenue details</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className={`cursor-pointer hover-elevate active-elevate-2 ${overdueContracts.length > 0 ? "border-destructive" : ""}`} onClick={() => setLocation('/contracts?overdue=true')} data-testid="card-overdue-returns">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Returns
                </CardTitle>
                <span className={`material-icons ${overdueContracts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  warning
                </span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <div className={`text-2xl sm:text-3xl xl:text-4xl font-bold truncate ${overdueContracts.length > 0 ? 'text-destructive' : ''}`} data-testid="stat-overdue-contracts">
                    {overdueContracts.length}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view overdue contracts</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className={`cursor-pointer hover-elevate active-elevate-2 ${pendingRefunds.length > 0 ? "border-chart-3" : ""}`} onClick={() => setLocation('/contracts?pendingRefunds=true')} data-testid="card-pending-refunds">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Refunds
                </CardTitle>
                <span className={`material-icons ${pendingRefunds.length > 0 ? 'text-chart-3' : 'text-muted-foreground'}`}>
                  account_balance_wallet
                </span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <div className={`text-2xl sm:text-3xl xl:text-4xl font-bold truncate ${pendingRefunds.length > 0 ? 'text-chart-3' : ''}`} data-testid="stat-pending-refunds">
                    {pendingRefunds.length}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Deposits to refund</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view contracts with pending refunds</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* New Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/vehicles?status=rented')} data-testid="card-vehicle-utilization">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vehicle Utilization
                </CardTitle>
                <span className="material-icons text-chart-2">local_shipping</span>
              </CardHeader>
              <CardContent>
                {contractsLoading || vehiclesLoading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-chart-2 truncate" data-testid="stat-vehicle-utilization">
                      {vehicleUtilization.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeContracts} of {totalVehicles} vehicles in use
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view vehicle fleet</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/reports/financial?tab=collection')} data-testid="card-payment-collection">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Payment Collection Rate
                </CardTitle>
                <span className={`material-icons ${paymentCollectionRate >= 90 ? 'text-chart-2' : paymentCollectionRate >= 70 ? 'text-chart-3' : 'text-destructive'}`}>
                  account_balance
                </span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <>
                    <div className={`text-2xl sm:text-3xl xl:text-4xl font-bold truncate ${paymentCollectionRate >= 90 ? 'text-chart-2' : paymentCollectionRate >= 70 ? 'text-chart-3' : 'text-destructive'}`} data-testid="stat-payment-collection-rate">
                      {paymentCollectionRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currency} {totalCollected.toFixed(2)} of {currency} {totalDue.toFixed(2)} collected
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view payment collection details</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/reports/operational?tab=extra-charges')} data-testid="card-avg-extra-charges">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Extra Charges
                </CardTitle>
                <span className="material-icons text-chart-5">receipt_long</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-10 w-28" />
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-chart-5 truncate" data-testid="stat-avg-extra-charges">
                      {currency} {avgExtraCharges.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per completed contract
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view extra charges details</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Unclosed Contracts Alert Card - Admin/Manager only */}
      {canViewAnalytics && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className={`cursor-pointer hover-elevate active-elevate-2 ${unclosedContracts.length > 0 ? "border-destructive" : ""}`} 
              onClick={() => setLocation('/unclosed-contracts-report')} 
              data-testid="card-unclosed-contracts-alert"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${unclosedContracts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                  Unclosed Contracts Alert
                </CardTitle>
                <Badge variant={unclosedContracts.length > 0 ? "destructive" : "secondary"} data-testid="badge-unclosed-count">
                  {unclosedContracts.length}
                </Badge>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : unclosedContracts.length > 0 ? (
                  <>
                    <div className="text-lg font-bold text-destructive mb-2" data-testid="text-unclosed-warning">
                      {unclosedContracts.length} contract(s) completed 30+ days ago but not closed
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click to view details and take action
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground" data-testid="text-unclosed-ok">
                    All completed contracts are properly closed
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>View contracts that need to be closed</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Additional Status Cards - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/contracts?status=draft')} data-testid="card-status-draft">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <span className="material-icons text-muted-foreground text-sm">edit_note</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-chart-4" data-testid="stat-draft-contracts">{draftContracts}</div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view draft contracts</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/contracts?status=active')} data-testid="card-status-active">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <span className="material-icons text-muted-foreground text-sm">directions_car</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-primary" data-testid="stat-active-status-contracts">{activeContracts}</div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view active contracts</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/contracts?status=completed')} data-testid="card-status-completed">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <span className="material-icons text-muted-foreground text-sm">done_all</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-completed-contracts">{completedContracts}</div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view completed contracts</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/contracts?status=closed')} data-testid="card-status-closed">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Closed</CardTitle>
                <span className="material-icons text-muted-foreground text-sm">archive</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-chart-2" data-testid="stat-closed-contracts">{closedContracts}</div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view closed contracts</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/contracts?status=all')} data-testid="card-status-total">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <span className="material-icons text-muted-foreground text-sm">description</span>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="stat-total-contracts">{contracts.length}</div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view all contracts</p>
          </TooltipContent>
        </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/reports/financial')} data-testid="card-revenue-metrics">
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
                        {currency} {revenueAnalytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <p className="text-xs text-muted-foreground">{t('analytics.totalRevenue')}</p>
                    </div>
                    <div>
                      <div className="text-lg font-medium" data-testid="stat-avg-contract">
                        {currency} {revenueAnalytics.averageContractValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view financial reports</p>
          </TooltipContent>
        </Tooltip>

        {/* Operational Metrics */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/reports/operational')} data-testid="card-operational-metrics">
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view operational reports</p>
          </TooltipContent>
        </Tooltip>

        {/* Customer Insights */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-pointer hover-elevate active-elevate-2" onClick={() => setLocation('/reports/customers')} data-testid="card-customer-insights">
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view customer reports</p>
          </TooltipContent>
        </Tooltip>
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
