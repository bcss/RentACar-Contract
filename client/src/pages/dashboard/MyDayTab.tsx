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
import { FileText, DollarSign, CheckCircle, Clock, Plus } from 'lucide-react';

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
  
  const myUnclosedContracts = myCompletedContracts.filter(c => c.status === 'completed');

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
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight" data-testid="text-my-day-title">
          {t('dashboard.myDay')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1" data-testid="text-my-day-subtitle">
          {t('dashboard.myDaySubtitle')}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-my-contracts-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.myContracts')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-my-contracts-count">{myContracts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {myContractsThisMonth.length} {t('dashboard.thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-my-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.myRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-my-revenue-total">
              {currency} {myTotalRevenue.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currency} {myRevenueThisMonth.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('dashboard.thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-my-active">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeRentals')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-my-active-count">{myActiveContracts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {myOverdueReturns.length} {t('dashboard.overdue')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-my-pending-tasks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pendingTasks')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-my-pending-count">
              {myOverdueReturns.length + myPendingRefunds.length + myUnclosedContracts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.actionRequired')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Contracts Status Breakdown */}
      <Card data-testid="card-my-contracts-breakdown">
        <CardHeader>
          <CardTitle>{t('dashboard.myContractsBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/contracts?status=draft">
              <div className="p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer" data-testid="button-my-draft-contracts">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('contract.status.draft')}</p>
                    <p className="text-2xl font-bold mt-1">{myDraftContracts.length}</p>
                  </div>
                  <Badge variant="secondary">{t('contract.status.draft')}</Badge>
                </div>
              </div>
            </Link>

            <Link href="/contracts?status=active">
              <div className="p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer" data-testid="button-my-active-contracts">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('contract.status.active')}</p>
                    <p className="text-2xl font-bold mt-1">{myActiveContracts.length}</p>
                  </div>
                  <Badge variant="default">{t('contract.status.active')}</Badge>
                </div>
              </div>
            </Link>

            <Link href="/contracts?status=completed">
              <div className="p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer" data-testid="button-my-completed-contracts">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('contract.status.completed')}</p>
                    <p className="text-2xl font-bold mt-1">{myCompletedContracts.length}</p>
                  </div>
                  <Badge>{t('contract.status.completed')}</Badge>
                </div>
              </div>
            </Link>

            <Link href="/contracts?status=closed">
              <div className="p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer" data-testid="button-my-closed-contracts">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('contract.status.closed')}</p>
                    <p className="text-2xl font-bold mt-1">{myClosedContracts.length}</p>
                  </div>
                  <Badge variant="outline">{t('contract.status.closed')}</Badge>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* My Pending Tasks Details */}
      {(myOverdueReturns.length > 0 || myPendingRefunds.length > 0 || myUnclosedContracts.length > 0) && (
        <Card data-testid="card-my-pending-tasks-details">
          <CardHeader>
            <CardTitle>{t('dashboard.myPendingTasks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOverdueReturns.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-destructive">
                    {t('dashboard.overdueReturns')} ({myOverdueReturns.length})
                  </h4>
                  <div className="space-y-2">
                    {myOverdueReturns.slice(0, 3).map(contract => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <div className="p-3 rounded-lg border hover-elevate cursor-pointer" data-testid={`row-overdue-${contract.id}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">#{contract.contractNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('dashboard.dueDate')}: {contract.rentalEndDate ? format(new Date(contract.rentalEndDate), 'PPP', { locale: i18n.language === 'ar' ? undefined : undefined }) : '-'}
                              </p>
                            </div>
                            <Badge variant="destructive">{t('dashboard.overdue')}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {myPendingRefunds.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    {t('dashboard.pendingRefunds')} ({myPendingRefunds.length})
                  </h4>
                  <div className="space-y-2">
                    {myPendingRefunds.slice(0, 3).map(contract => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <div className="p-3 rounded-lg border hover-elevate cursor-pointer" data-testid={`row-refund-${contract.id}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">#{contract.contractNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('dashboard.deposit')}: {currency} {parseFloat(contract.securityDeposit || '0').toLocaleString(i18n.language)}
                              </p>
                            </div>
                            <Badge>{t('dashboard.refundPending')}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {myUnclosedContracts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    {t('dashboard.unclosedContracts')} ({myUnclosedContracts.length})
                  </h4>
                  <div className="space-y-2">
                    {myUnclosedContracts.slice(0, 3).map(contract => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <div className="p-3 rounded-lg border hover-elevate cursor-pointer" data-testid={`row-unclosed-${contract.id}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">#{contract.contractNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('contract.status.completed')}
                              </p>
                            </div>
                            <Badge variant="outline">{t('dashboard.needsClosure')}</Badge>
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

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Link href="/contracts/create">
              <Button data-testid="button-create-contract">
                <Plus className="h-4 w-4 mr-2" />
                {t('contract.createContract')}
              </Button>
            </Link>
            <Link href="/contracts">
              <Button variant="outline" data-testid="button-view-all-contracts">
                {t('dashboard.viewAllMyContracts')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
