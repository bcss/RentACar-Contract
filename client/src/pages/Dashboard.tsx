import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { SystemError } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTimeBasedGreeting, getTimeAgo } from '@/utils/timeGreeting';
import { MaterialSymbol } from '@/components/MaterialSymbol';

// Import tab components
import { MyDayTab } from './dashboard/MyDayTab';
import { CompanyTodayTab } from './dashboard/CompanyTodayTab';
import { ExecutiveOverviewTab } from './dashboard/ExecutiveOverviewTab';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin, isManager, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('my-day');

  const handleTabChange = (value: string) => {
    if (!canViewManagement && value !== 'my-day') {
      return;
    }
    setActiveTab(value);
  };

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

  const { data: unacknowledgedErrors = [] } = useQuery<SystemError[]>({
    queryKey: ['/api/system-errors', 'unacknowledged'],
    enabled: isAuthenticated && isAdmin,
  });

  // Determine if user can view management tabs
  const canViewManagement = isAdmin || isManager;

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
  
  // Format last login time
  const getLastLoginText = () => {
    if (!user?.lastLoginAt) {
      return t('timeAgo.never');
    }
    const timeAgoResult = getTimeAgo(new Date(user.lastLoginAt), i18n.language);
    if (typeof timeAgoResult === 'string') {
      return timeAgoResult;
    }
    return t(timeAgoResult.key, { count: timeAgoResult.count });
  };
  const lastLoginText = getLastLoginText();

  return (
    <div className="p-4 lg:p-5">
      {/* Page Header - Compact Design */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-black leading-tight tracking-[-0.033em]" data-testid="text-dashboard-title">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-greeting">
            {greetingText}, <span className="font-medium text-foreground">{firstName}</span>
            {user?.role && (
              <span className="text-primary font-medium"> ({user.role})</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground" data-testid="text-last-login">
            {t('dashboard.lastLogin')}: {lastLoginText}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* System Errors Icon Button - Badge positioned on the icon */}
          {isAdmin && unacknowledgedErrors.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="relative toggle-elevate"
              onClick={() => setLocation('/system-errors')}
              title={t('systemErrors.unacknowledgedCount', { count: unacknowledgedErrors.length })}
              data-testid="button-system-errors"
            >
              <MaterialSymbol name="warning" size="sm" className="text-destructive" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 text-[0.5rem] font-bold pointer-events-none"
                data-testid="badge-error-count"
              >
                {unacknowledgedErrors.length > 99 ? '99+' : unacknowledgedErrors.length}
              </Badge>
            </Button>
          )}
          <Button asChild size="sm" className="font-bold gap-1.5" data-testid="button-new-contract">
            <Link href="/contracts/new">
              <MaterialSymbol name="add" size="xs" />
              <span>{t('contracts.newContract')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabbed Dashboard - Compact Design */}
      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-border">
            <TabsList className="bg-transparent h-auto p-0 gap-5">
              <TabsTrigger 
                value="my-day" 
                data-testid="tab-my-day"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-2 pt-2 text-xs font-bold leading-normal tracking-[0.015em] data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent hover:border-b-gray-300 dark:hover:border-b-gray-500 transition-colors"
              >
                <MaterialSymbol name="today" size="xs" className="mr-1.5" />
                {t('dashboard.myDay')}
              </TabsTrigger>
              {canViewManagement && (
                <>
                  <TabsTrigger 
                    value="company-today" 
                    data-testid="tab-company-today"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-2 pt-2 text-xs font-bold leading-normal tracking-[0.015em] data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent hover:border-b-gray-300 dark:hover:border-b-gray-500 transition-colors"
                  >
                    <MaterialSymbol name="domain" size="xs" className="mr-1.5" />
                    {t('dashboard.companyToday')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="executive-overview" 
                    data-testid="tab-executive-overview"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-2 pt-2 text-xs font-bold leading-normal tracking-[0.015em] data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent hover:border-b-gray-300 dark:hover:border-b-gray-500 transition-colors"
                  >
                    <MaterialSymbol name="analytics" size="xs" className="mr-1.5" />
                    {t('dashboard.executiveOverview')}
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

        <TabsContent value="my-day" className="mt-4" data-testid="content-my-day">
          <MyDayTab />
        </TabsContent>

        {canViewManagement && (
          <>
            <TabsContent value="company-today" className="mt-4" data-testid="content-company-today">
              <CompanyTodayTab />
            </TabsContent>

            <TabsContent value="executive-overview" className="mt-4" data-testid="content-executive-overview">
              <ExecutiveOverviewTab />
            </TabsContent>
          </>
        )}
        </Tabs>
      </div>
    </div>
  );
}
