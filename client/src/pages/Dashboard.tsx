import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
import { format } from 'date-fns';
import { getTimeBasedGreeting, getTimeAgo } from '@/utils/timeGreeting';
import { AlertCircle, X, AlertTriangle } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { TrendIndicator } from '@/components/TrendIndicator';
import { RevenueTrendChart } from '@/components/RevenueTrendChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin, isManager, user } = useAuth();
  const { currency } = useCurrency();
  const [, setLocation] = useLocation();
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

  const { data: revenueTrendData = [], isLoading: revenueTrendLoading } = useQuery<any[]>({
    queryKey: ['/api/analytics/revenue-trend'],
    enabled: isAuthenticated && canViewAnalytics,
  });

  // Phase 3.2: Enhanced Dashboard Analytics Queries
  const { data: fleetStatusData, isLoading: fleetStatusLoading } = useQuery<{
    available: number;
    rented: number;
    maintenance: number;
    damaged: number;
  }>({
    queryKey: ['/api/analytics/fleet-status'],
    enabled: isAuthenticated && canViewAnalytics,
  });

  const { data: geographicData, isLoading: geographicLoading } = useQuery<{
    customersByRegion: Array<{ region: string; count: number }>;
    vehiclesByRegion: Array<{ region: string; count: number }>;
  }>({
    queryKey: ['/api/analytics/geographic-distribution'],
    enabled: isAuthenticated && canViewAnalytics,
  });

  const { data: pendingActionsData, isLoading: pendingActionsLoading } = useQuery<{
    overdueReturns: Array<{ id: string; contractNumber: number; customerNameEn: string; daysOverdue: number }>;
    pendingRefunds: Array<{ id: string; contractNumber: number; customerNameEn: string; depositAmount: number }>;
    unclosedContracts: Array<{ id: string; contractNumber: number; customerNameEn: string; daysUnclosed: number }>;
  }>({
    queryKey: ['/api/analytics/pending-actions'],
    enabled: isAuthenticated && canViewAnalytics,
  });

  const { data: topPerformersData, isLoading: topPerformersLoading } = useQuery<{
    topVehicles: Array<{ registration: string; make: string; model: string; revenue: number }>;
    topStaff: Array<{ name: string; contractCount: number }>;
  }>({
    queryKey: ['/api/analytics/top-performers'],
    enabled: isAuthenticated && canViewAnalytics,
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
              <Icon name="add" className="" />
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
                <Icon name="directions_car" className=" text-primary" />
              </CardHeader>
              <CardContent>
                {contractsLoading || operationalLoading ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-primary truncate" data-testid="stat-active-contracts">{activeContracts}</div>
                    {operationalAnalytics && operationalAnalytics.contractsLastMonth > 0 && (
                      <TrendIndicator 
                        value={operationalAnalytics.contractsThisMonth}
                        previousValue={operationalAnalytics.contractsLastMonth}
                        format="number"
                        className="mt-1"
                      />
                    )}
                  </>
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
                <Icon name="payments" className=" text-chart-1" />
              </CardHeader>
              <CardContent>
                {contractsLoading || revenueLoading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-bold text-chart-1 truncate" data-testid="stat-monthly-revenue">
                      {currency} {(revenueAnalytics?.monthlyRevenue || monthlyRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {revenueAnalytics && revenueAnalytics.lastMonthRevenue > 0 && (
                      <TrendIndicator 
                        value={revenueAnalytics.monthlyRevenue}
                        previousValue={revenueAnalytics.lastMonthRevenue}
                        format="currency"
                        currency={currency}
                        className="mt-1"
                      />
                    )}
                  </>
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
                <Icon name="warning" className={overdueContracts.length > 0 ? 'text-destructive' : 'text-muted-foreground'} />
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
                <Icon name="account_balance_wallet" className={pendingRefunds.length > 0 ? 'text-chart-3' : 'text-muted-foreground'} />
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
                <Icon name="local_shipping" className=" text-chart-2" />
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
                <Icon name="account_balance" className={paymentCollectionRate >= 90 ? 'text-chart-2' : paymentCollectionRate >= 70 ? 'text-chart-3' : 'text-destructive'} />
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
                <Icon name="receipt_long" className=" text-chart-5" />
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
                <Icon name="edit_note" className=" text-muted-foreground text-sm" />
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
                <Icon name="directions_car" className=" text-muted-foreground text-sm" />
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
                <Icon name="done_all" className=" text-muted-foreground text-sm" />
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
                <Icon name="archive" className=" text-muted-foreground text-sm" />
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
                <Icon name="description" className=" text-muted-foreground text-sm" />
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
                <Icon name="monetization_on" className=" text-muted-foreground" />
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
                      <Icon 
                        name={revenueAnalytics.revenueGrowth >= 0 ? 'trending_up' : 'trending_down'}
                        className={`text-sm ${revenueAnalytics.revenueGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`}
                      />
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
                <Icon name="assessment" className=" text-muted-foreground" />
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
                      <Icon 
                        name={operationalAnalytics.contractGrowth >= 0 ? 'trending_up' : 'trending_down'}
                        className={`text-sm ${operationalAnalytics.contractGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`}
                      />
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
                <Icon name="people" className=" text-muted-foreground" />
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
                      <Icon name="person_add" className=" text-sm text-chart-2" />
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

      {/* Enhanced Analytics Charts - Admin/Manager only */}
      {canViewAnalytics && (
        <div className="space-y-6">
          <RevenueTrendChart data={revenueTrendData} isLoading={revenueTrendLoading} />

          {/* Phase 3.2: New Visual Analytics Cards - Professionally Redesigned */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Status Distribution - Enhanced Design */}
            <Card data-testid="card-fleet-status" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">{t('analytics.fleetStatus')}</p>
                  <h3 className="text-sm font-semibold">Fleet Status Distribution</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="local_shipping" className="text-primary text-lg" />
                </div>
              </div>
              
              {fleetStatusLoading ? (
                <Skeleton className="h-[320px] w-full rounded-lg" />
              ) : fleetStatusData ? (
                (() => {
                  const totalVehicles = fleetStatusData.available + fleetStatusData.rented + fleetStatusData.maintenance + fleetStatusData.damaged;
                  const utilizationRate = totalVehicles > 0 ? ((fleetStatusData.rented / totalVehicles) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <div className="space-y-4">
                      {/* Concentric Donut Chart with Central Metric */}
                      <div className="relative">
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Available', value: fleetStatusData.available },
                                { name: 'Rented', value: fleetStatusData.rented },
                                { name: 'Maintenance', value: fleetStatusData.maintenance },
                                { name: 'Damaged', value: fleetStatusData.damaged },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius="55%"
                              outerRadius="85%"
                              paddingAngle={2}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              <Cell fill="hsl(var(--chart-2))" />
                              <Cell fill="hsl(var(--primary))" />
                              <Cell fill="hsl(var(--chart-3))" />
                              <Cell fill="hsl(var(--destructive))" />
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--popover))', 
                                border: '1px solid hsl(var(--border))', 
                                borderRadius: '8px',
                                fontSize: '12px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Center Content */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                          <div className="text-2xl font-bold tracking-tight">{totalVehicles}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Fleet</div>
                          <Badge variant="outline" className="mt-2 text-xs font-medium">
                            {utilizationRate}% Utilization
                          </Badge>
                        </div>
                      </div>

                      {/* Status Chips Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-chart-2/10 border border-chart-2/20">
                          <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Available</p>
                            <p className="text-sm font-semibold">{fleetStatusData.available}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Rented</p>
                            <p className="text-sm font-semibold">{fleetStatusData.rented}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-chart-3/10 border border-chart-3/20">
                          <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Maintenance</p>
                            <p className="text-sm font-semibold">{fleetStatusData.maintenance}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div className="w-2 h-2 rounded-full bg-destructive"></div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Damaged</p>
                            <p className="text-sm font-semibold">{fleetStatusData.damaged}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center h-[320px] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon name="local_shipping" className="text-muted-foreground text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No Fleet Data</p>
                    <p className="text-xs text-muted-foreground mt-1">Add vehicles to view distribution</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Geographic Distribution - Enhanced Design */}
            <Card data-testid="card-geographic-distribution" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">{t('analytics.geographic')}</p>
                  <h3 className="text-sm font-semibold">Geographic Distribution (Top 10)</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="location_on" className="text-primary text-lg" />
                </div>
              </div>
              
              {geographicLoading ? (
                <Skeleton className="h-[320px] w-full rounded-lg" />
              ) : geographicData && ((geographicData.customersByRegion?.length ?? 0) > 0 || (geographicData.vehiclesByRegion?.length ?? 0) > 0) ? (
                (() => {
                  const topCustomerRegion = geographicData.customersByRegion?.[0];
                  const topVehicleRegion = geographicData.vehiclesByRegion?.[0];
                  const totalCustomers = geographicData.customersByRegion?.reduce((sum, r) => sum + r.count, 0) || 0;
                  const totalVehicles = geographicData.vehiclesByRegion?.reduce((sum, r) => sum + r.count, 0) || 0;
                  
                  return (
                    <div className="space-y-4">
                      {/* Mini KPI Strip */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs text-muted-foreground mb-1">Top Region</p>
                          <p className="text-sm font-semibold truncate">{topCustomerRegion?.region || topVehicleRegion?.region || 'N/A'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/10">
                          <p className="text-xs text-muted-foreground mb-1">Customers</p>
                          <p className="text-sm font-semibold">{totalCustomers}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-chart-3/5 border border-chart-3/10">
                          <p className="text-xs text-muted-foreground mb-1">Vehicles</p>
                          <p className="text-sm font-semibold">{totalVehicles}</p>
                        </div>
                      </div>

                      {/* Horizontal Ranked Bar Charts */}
                      {geographicData.customersByRegion && geographicData.customersByRegion.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Customers by Region</h4>
                          <ResponsiveContainer width="100%" height={120}>
                            <BarChart 
                              data={geographicData.customersByRegion.slice(0, 5)} 
                              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                              <YAxis type="category" dataKey="region" tick={{ fontSize: 10 }} width={60} stroke="hsl(var(--muted-foreground))" />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--popover))', 
                                  border: '1px solid hsl(var(--border))', 
                                  borderRadius: '8px',
                                  fontSize: '12px'
                                }} 
                              />
                              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      
                      {geographicData.vehiclesByRegion && geographicData.vehiclesByRegion.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Vehicles by Region</h4>
                          <ResponsiveContainer width="100%" height={120}>
                            <BarChart 
                              data={geographicData.vehiclesByRegion.slice(0, 5)} 
                              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                              <YAxis type="category" dataKey="region" tick={{ fontSize: 10 }} width={60} stroke="hsl(var(--muted-foreground))" />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--popover))', 
                                  border: '1px solid hsl(var(--border))', 
                                  borderRadius: '8px',
                                  fontSize: '12px'
                                }} 
                              />
                              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center h-[320px] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon name="map" className="text-muted-foreground text-xl" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">No Geographic Data</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">Import data with licensing authority information to view regional distribution</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLocation('/import-data')} className="mt-2">
                    <Icon name="upload" className="mr-2 text-sm" />
                    Import Data
                  </Button>
                </div>
              )}
            </Card>

            {/* Pending Actions - Enhanced Design */}
            <Card data-testid="card-pending-actions" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">{t('analytics.actions')}</p>
                  <h3 className="text-sm font-semibold">Pending Actions</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Icon name="notifications_active" className="text-destructive text-lg" />
                </div>
              </div>
              
              {pendingActionsLoading ? (
                <Skeleton className="h-[320px] w-full rounded-lg" />
              ) : pendingActionsData ? (
                <div className="space-y-4">
                  {/* Three-Column Severity Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Overdue Returns - High Priority */}
                    <div 
                      className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 cursor-pointer hover-elevate active-elevate-2 transition-all"
                      onClick={() => setLocation('/contracts?overdue=true')}
                      data-testid="action-overdue-returns"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">High</Badge>
                        <Icon name="schedule" className="text-destructive text-sm" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-destructive">
                        {Array.isArray(pendingActionsData.overdueReturns) ? pendingActionsData.overdueReturns.length : 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Overdue Returns</p>
                    </div>

                    {/* Pending Refunds - Medium Priority */}
                    <div 
                      className="p-3 rounded-lg bg-chart-3/5 border border-chart-3/20 cursor-pointer hover-elevate active-elevate-2 transition-all"
                      onClick={() => setLocation('/contracts?pendingRefunds=true')}
                      data-testid="action-pending-refunds"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">Medium</Badge>
                        <Icon name="account_balance_wallet" className="text-chart-3 text-sm" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-chart-3">
                        {Array.isArray(pendingActionsData.pendingRefunds) ? pendingActionsData.pendingRefunds.length : 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Pending Refunds</p>
                    </div>

                    {/* Unclosed Contracts - Normal Priority */}
                    <div 
                      className="p-3 rounded-lg bg-chart-5/5 border border-chart-5/20 cursor-pointer hover-elevate active-elevate-2 transition-all"
                      onClick={() => setLocation('/unclosed-contracts-report')}
                      data-testid="action-unclosed-contracts"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs px-2 py-0.5">Normal</Badge>
                        <Icon name="assignment_late" className="text-chart-5 text-sm" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-chart-5">
                        {pendingActionsData.unclosedContracts}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Unclosed Contracts</p>
                    </div>
                  </div>

                  {/* Action Items List */}
                  <div className="space-y-2">
                    {Array.isArray(pendingActionsData.overdueReturns) && pendingActionsData.overdueReturns.slice(0, 3).map((item: any) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/10 rounded-lg hover-elevate cursor-pointer"
                        onClick={() => setLocation(`/contracts/${item.id}`)}
                        data-testid={`overdue-item-${item.contractNumber}`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Icon name="error" className="text-destructive text-sm" />
                          <span className="text-xs font-medium truncate">#{item.contractNumber} - {item.customerNameEn}</span>
                        </div>
                        <Badge variant="destructive" className="text-xs">{item.daysOverdue}d overdue</Badge>
                      </div>
                    ))}
                    {Array.isArray(pendingActionsData.pendingRefunds) && pendingActionsData.pendingRefunds.slice(0, 2).map((item: any) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-chart-3/5 border border-chart-3/10 rounded-lg hover-elevate cursor-pointer"
                        onClick={() => setLocation(`/contracts/${item.id}`)}
                        data-testid={`refund-item-${item.contractNumber}`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Icon name="info" className="text-chart-3 text-sm" />
                          <span className="text-xs font-medium truncate">#{item.contractNumber} - {item.customerNameEn}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{currency} {item.depositAmount}</Badge>
                      </div>
                    ))}
                    {(!Array.isArray(pendingActionsData.overdueReturns) || pendingActionsData.overdueReturns.length === 0) && 
                     (!Array.isArray(pendingActionsData.pendingRefunds) || pendingActionsData.pendingRefunds.length === 0) && 
                     pendingActionsData.unclosedContracts === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-chart-2/20 flex items-center justify-center">
                          <Icon name="check_circle" className="text-chart-2 text-lg" />
                        </div>
                        <p className="text-sm font-medium">All Clear!</p>
                        <p className="text-xs text-muted-foreground">No pending actions required</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[320px] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon name="notifications_none" className="text-muted-foreground text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No Action Data</p>
                    <p className="text-xs text-muted-foreground mt-1">Unable to load pending actions</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Top Performers - Enhanced Design */}
            <Card data-testid="card-top-performers" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">{t('analytics.performance')}</p>
                  <h3 className="text-sm font-semibold">Top Performers</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <Icon name="emoji_events" className="text-chart-1 text-lg" />
                </div>
              </div>
              
              {topPerformersLoading ? (
                <Skeleton className="h-[320px] w-full rounded-lg" />
              ) : topPerformersData ? (
                <div className="space-y-4">
                  {/* Top Vehicles Section */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Top 5 Vehicles by Revenue</h4>
                    {topPerformersData.topVehiclesByRevenue && topPerformersData.topVehiclesByRevenue.length > 0 ? (
                      <div className="space-y-2">
                        {topPerformersData.topVehiclesByRevenue.slice(0, 5).map((vehicle: any, index: number) => (
                          <div 
                            key={vehicle.registration} 
                            className="flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-lg hover-elevate cursor-pointer" 
                            data-testid={`top-vehicle-${index + 1}`}
                            onClick={() => setLocation(`/vehicles/${vehicle.vehicleId}`)}
                          >
                            <div className="flex items-center gap-3">
                              {/* Rank Badge */}
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                index === 0 ? 'bg-chart-1/20 text-chart-1' :
                                index === 1 ? 'bg-chart-3/20 text-chart-3' :
                                index === 2 ? 'bg-chart-4/20 text-chart-4' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </div>
                              {/* Vehicle Icon */}
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon name="directions_car" className="text-primary text-sm" />
                              </div>
                              {/* Vehicle Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">{vehicle.registration}</p>
                                <p className="text-xs text-muted-foreground truncate">{vehicle.make} {vehicle.model}</p>
                              </div>
                            </div>
                            {/* Revenue KPI */}
                            <div className="text-right">
                              <p className="text-sm font-bold text-chart-1">
                                {currency} {Number(vehicle.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon name="directions_car" className="text-muted-foreground text-lg" />
                        </div>
                        <p className="text-xs text-muted-foreground">No vehicle data available</p>
                      </div>
                    )}
                  </div>

                  {/* Top Staff Section */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Most Active Staff</h4>
                    {topPerformersData.mostActiveStaff && topPerformersData.mostActiveStaff.length > 0 ? (
                      <div className="space-y-2">
                        {topPerformersData.mostActiveStaff.slice(0, 5).map((staff: any, index: number) => (
                          <div 
                            key={staff.username} 
                            className="flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-lg hover-elevate cursor-pointer" 
                            data-testid={`top-staff-${index + 1}`}
                            onClick={() => setLocation(`/users`)}
                          >
                            <div className="flex items-center gap-3">
                              {/* Rank Badge */}
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                index === 0 ? 'bg-primary/20 text-primary' :
                                index === 1 ? 'bg-chart-2/20 text-chart-2' :
                                index === 2 ? 'bg-chart-3/20 text-chart-3' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </div>
                              {/* Staff Avatar */}
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary">
                                  {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                                </span>
                              </div>
                              {/* Staff Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">{staff.firstName} {staff.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">@{staff.username}</p>
                              </div>
                            </div>
                            {/* Revenue & Contract Count KPI */}
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary">
                                {currency} {Number(staff.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">{staff.contractCount} contracts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon name="person" className="text-muted-foreground text-lg" />
                        </div>
                        <p className="text-xs text-muted-foreground">No staff data available</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[320px] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon name="emoji_events" className="text-muted-foreground text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No Performance Data</p>
                    <p className="text-xs text-muted-foreground mt-1">Unable to load top performers</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
