import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Contract } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/Icon';
import { format } from 'date-fns';
import { FileText, DollarSign, CheckCircle, Clock, Plus, TrendingUp, AlertCircle, CheckCircle2, XCircle, ArrowRight, Calendar } from 'lucide-react';

export function MyDayTab() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { currency } = useCurrency();

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
  });

  // Filter contracts created by the current user
  const myContracts = contracts.filter(c => c.createdBy === user?.id);
  
  // Status breakdown
  const myDraftContracts = myContracts.filter(c => c.status === 'draft');
  const myActiveContracts = myContracts.filter(c => c.status === 'active');
  const myCompletedContracts = myContracts.filter(c => c.status === 'completed');
  const myClosedContracts = myContracts.filter(c => c.status === 'closed');

  // Calculate personal revenue (sum of total amounts from my contracts)
  const myTotalRevenue = myContracts.reduce((sum, contract) => {
    return sum + parseFloat(contract.totalAmount || '0');
  }, 0);

  // This month's contracts and revenue
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const myContractsThisMonth = myContracts.filter(c => new Date(c.createdAt) >= firstDayOfMonth);
  const myRevenueThisMonth = myContractsThisMonth.reduce((sum, contract) => {
    return sum + parseFloat(contract.totalAmount || '0');
  }, 0);

  // Pending tasks
  const myOverdueReturns = myActiveContracts.filter(c => {
    return c.rentalEndDate && new Date(c.rentalEndDate) < now;
  });
  
  const myPendingRefunds = myContracts.filter(c => {
    return (c.status === 'completed' || c.status === 'active') && 
           !c.depositRefunded && 
           parseFloat(c.securityDeposit || '0') > 0;
  });
  
  // Unclosed contracts: completed but not yet closed (missing closedAt timestamp)
  const myUnclosedContracts = myCompletedContracts.filter(c => !c.closedAt);

  if (contractsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section - Modern MD3 Typography */}
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight" data-testid="text-my-day-title">
          {t('dashboard.myDay')}
        </h2>
        <p className="text-sm text-muted-foreground leading-6" data-testid="text-my-day-subtitle">
          {t('dashboard.myDaySubtitle')}
        </p>
      </div>

      {/* Quick Actions - Modern MD3 Assist Chips with Tonal Containers */}
      <Card className="shadow-lg border-transparent ring-1 ring-[hsl(var(--primary)/0.2)]" data-testid="card-quick-actions">
        <CardHeader className="p-6">
          <CardTitle className="text-base font-medium uppercase tracking-[0.08em]">{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex gap-3 flex-wrap">
            {/* Primary Action - Filled Style */}
            <Link href="/contracts/create">
              <Button 
                className="transition-all duration-200 ease-out shadow-md"
                data-testid="button-create-contract"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('contract.createContract')}
              </Button>
            </Link>

            {/* Contextual Actions - Tonal MD3 Style with Better Visual Hierarchy */}
            {myOverdueReturns.length > 0 && (
              <Link href="/contracts?status=active&overdue=true">
                <Button 
                  variant="destructive" 
                  className="transition-all duration-200 ease-out"
                  data-testid="button-view-overdue"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {t('dashboard.overdueReturns')} 
                  <Badge variant="outline" className="ml-2 bg-background/50">
                    {myOverdueReturns.length}
                  </Badge>
                </Button>
              </Link>
            )}

            {myPendingRefunds.length > 0 && (
              <Link href="/contracts?status=completed&needsRefund=true">
                <Button 
                  variant="secondary" 
                  className="transition-all duration-200 ease-out"
                  data-testid="button-view-refunds"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t('dashboard.pendingRefunds')} 
                  <Badge variant="outline" className="ml-2">
                    {myPendingRefunds.length}
                  </Badge>
                </Button>
              </Link>
            )}

            {myUnclosedContracts.length > 0 && (
              <Link href="/contracts?status=completed&needsClosure=true">
                <Button 
                  variant="secondary" 
                  className="transition-all duration-200 ease-out"
                  data-testid="button-view-unclosed"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('dashboard.unclosedContracts')} 
                  <Badge variant="outline" className="ml-2">
                    {myUnclosedContracts.length}
                  </Badge>
                </Button>
              </Link>
            )}

            {/* General Navigation - Outline Style */}
            <Link href="/contracts">
              <Button 
                variant="outline" 
                className="transition-all duration-200 ease-out"
                data-testid="button-view-all-contracts"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('dashboard.viewAllMyContracts')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Hero KPI Rail - Modern MD3 3-Column Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* My Contracts - Primary Tonal Container */}
        <Card className="bg-[hsl(var(--primary)/0.08)] shadow-lg border-transparent hover-elevate transition-all duration-200" data-testid="card-my-contracts-total">
          <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
            <div className="flex-1">
              <CardTitle className="text-base font-medium uppercase tracking-[0.08em] text-muted-foreground">{t('dashboard.myContracts')}</CardTitle>
            </div>
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-semibold tabular-nums tracking-tight" data-testid="text-my-contracts-count">
              {myContracts.length}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-xs font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{myContractsThisMonth.length} {t('dashboard.thisMonth')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* My Revenue - Success Tonal Container */}
        <Card className="bg-[hsl(var(--primary)/0.08)] shadow-lg border-transparent hover-elevate transition-all duration-200" data-testid="card-my-revenue">
          <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
            <div className="flex-1">
              <CardTitle className="text-base font-medium uppercase tracking-[0.08em] text-muted-foreground">{t('dashboard.myRevenue')}</CardTitle>
            </div>
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-3xl font-semibold tabular-nums tracking-tight" data-testid="text-my-revenue-total">
              {currency} {myTotalRevenue.toLocaleString(i18n.language, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground leading-6">
                {currency} {myRevenueThisMonth.toLocaleString(i18n.language, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('dashboard.thisMonth')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks - Warning/Alert Tonal Container */}
        <Card 
          className={`${
            (myOverdueReturns.length + myPendingRefunds.length + myUnclosedContracts.length) > 0
              ? 'bg-[hsl(var(--destructive)/0.08)] border-[hsl(var(--destructive)/0.2)]'
              : 'bg-[hsl(var(--muted))]'
          } shadow-lg hover-elevate transition-all duration-200`}
          data-testid="card-my-pending-tasks"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
            <div className="flex-1">
              <CardTitle className="text-base font-medium uppercase tracking-[0.08em] text-muted-foreground">{t('dashboard.pendingTasks')}</CardTitle>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              (myOverdueReturns.length + myPendingRefunds.length + myUnclosedContracts.length) > 0
                ? 'bg-[hsl(var(--destructive)/0.15)]'
                : 'bg-[hsl(var(--muted)/0.15)]'
            }`}>
              {(myOverdueReturns.length + myPendingRefunds.length + myUnclosedContracts.length) > 0 ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-4xl font-semibold tabular-nums tracking-tight" data-testid="text-my-pending-count">
              {myOverdueReturns.length + myPendingRefunds.length + myUnclosedContracts.length}
            </div>
            <div className="flex items-center gap-2 mt-3">
              {(myOverdueReturns.length + myPendingRefunds.length + myUnclosedContracts.length) > 0 ? (
                <span className="text-sm text-destructive font-medium leading-6">
                  {t('dashboard.actionRequired')}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground leading-6">
                  All caught up!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Contracts Status Breakdown - Modern Grid with Better Visuals */}
      <Card className="shadow-lg" data-testid="card-my-contracts-breakdown">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-semibold tracking-tight">{t('dashboard.myContractsBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/contracts?status=draft">
              <div className="group relative p-5 rounded-xl border-2 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden" data-testid="button-my-draft-contracts">
                <div className="absolute top-0 left-0 w-1 h-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('contract.status.draft')}</p>
                    <Badge variant="secondary" className="text-xs">{t('contract.status.draft')}</Badge>
                  </div>
                  <p className="text-3xl font-semibold tabular-nums">{myDraftContracts.length}</p>
                </div>
              </div>
            </Link>

            <Link href="/contracts?status=active">
              <div className="group relative p-5 rounded-xl border-2 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden" data-testid="button-my-active-contracts">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:bg-primary transition-colors" />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('contract.status.active')}</p>
                    <Badge variant="default" className="text-xs">{t('contract.status.active')}</Badge>
                  </div>
                  <p className="text-3xl font-semibold tabular-nums text-primary">{myActiveContracts.length}</p>
                </div>
              </div>
            </Link>

            <Link href="/contracts?status=completed">
              <div className="group relative p-5 rounded-xl border-2 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden" data-testid="button-my-completed-contracts">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500 group-hover:bg-primary transition-colors" />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('contract.status.completed')}</p>
                    <Badge className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">{t('contract.status.completed')}</Badge>
                  </div>
                  <p className="text-3xl font-semibold tabular-nums">{myCompletedContracts.length}</p>
                </div>
              </div>
            </Link>

            <Link href="/contracts?status=closed">
              <div className="group relative p-5 rounded-xl border-2 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden" data-testid="button-my-closed-contracts">
                <div className="absolute top-0 left-0 w-1 h-full bg-muted group-hover:bg-primary transition-colors" />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('contract.status.closed')}</p>
                    <Badge variant="outline" className="text-xs">{t('contract.status.closed')}</Badge>
                  </div>
                  <p className="text-3xl font-semibold tabular-nums">{myClosedContracts.length}</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* My Pending Tasks Details - Elegant List Design */}
      {(myOverdueReturns.length > 0 || myPendingRefunds.length > 0 || myUnclosedContracts.length > 0) && (
        <Card className="shadow-lg border-[hsl(var(--destructive)/0.2)]" data-testid="card-my-pending-tasks-details">
          <CardHeader className="p-6 bg-[hsl(var(--destructive)/0.05)]">
            <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('dashboard.myPendingTasks')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {myOverdueReturns.length > 0 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-destructive uppercase tracking-wide flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('dashboard.overdueReturns')}
                    </h4>
                    <Badge variant="destructive">{myOverdueReturns.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {myOverdueReturns.slice(0, 3).map((contract, idx) => {
                      const daysOverdue = contract.rentalEndDate 
                        ? Math.floor((now.getTime() - new Date(contract.rentalEndDate).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                      return (
                        <Link key={contract.id} href={`/contracts/${contract.id}`}>
                          <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-[hsl(var(--destructive)/0.05)] transition-colors cursor-pointer" data-testid={`row-overdue-${contract.id}`}>
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-destructive">{daysOverdue}d</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">#{contract.contractNumber}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {contract.customerNameEn || 'N/A'} • {contract.vehicleRegistration}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {contract.rentalEndDate && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(contract.rentalEndDate), 'MMM d')}
                                </span>
                              )}
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {myPendingRefunds.length > 0 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <DollarSign className="h-4 w-4" />
                      {t('dashboard.pendingRefunds')}
                    </h4>
                    <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">{myPendingRefunds.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {myPendingRefunds.slice(0, 3).map((contract, idx) => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <div className="group flex items-center gap-4 p-3 rounded-lg hover-elevate transition-colors cursor-pointer" data-testid={`row-refund-${contract.id}`}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">#{contract.contractNumber}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {contract.customerNameEn || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                              {currency} {parseFloat(contract.securityDeposit || '0').toLocaleString(i18n.language, { minimumFractionDigits: 0 })}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {myUnclosedContracts.length > 0 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {t('dashboard.unclosedContracts')}
                    </h4>
                    <Badge variant="outline">{myUnclosedContracts.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {myUnclosedContracts.slice(0, 3).map((contract, idx) => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <div className="group flex items-center gap-4 p-3 rounded-lg hover-elevate transition-colors cursor-pointer" data-testid={`row-unclosed-${contract.id}`}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">#{contract.contractNumber}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {contract.customerNameEn || 'N/A'} • {contract.vehicleRegistration}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{t('dashboard.needsClosure')}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
