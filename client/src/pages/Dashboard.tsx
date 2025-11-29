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
    <div className="p-6 lg:p-8">
      {/* Page Header - Reference Design Match */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]" data-testid="text-dashboard-title">
            {t('dashboard.title')}
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-greeting">
            {greetingText}, <span className="font-medium text-foreground">{firstName}</span>
            {user?.role && (
              <span className="text-primary font-medium"> ({user.role})</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground" data-testid="text-last-login">
            {t('dashboard.lastLogin')}: {lastLoginText}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* System Errors Icon Button - Positioned with badge on top-right corner */}
          {isAdmin && unacknowledgedErrors.length > 0 && (
            <div className="relative flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="toggle-elevate"
                onClick={() => setLocation('/system-errors')}
                title={t('systemErrors.unacknowledgedCount', { count: unacknowledgedErrors.length })}
                data-testid="button-system-errors"
              >
                <MaterialSymbol name="warning" size="md" className="text-destructive" />
              </Button>
              <Badge 
                variant="destructive" 
                className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-5 min-w-[20px] px-1 text-[10px] font-bold pointer-events-none"
                data-testid="badge-error-count"
              >
                {unacknowledgedErrors.length > 99 ? '99+' : unacknowledgedErrors.length}
              </Badge>
            </div>
          )}
          <Button asChild className="h-10 px-4 text-sm font-bold gap-2" data-testid="button-new-contract">
            <Link href="/contracts/new">
              <MaterialSymbol name="add" size="sm" />
              <span>{t('contracts.newContract')}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabbed Dashboard - Reference Design Match */}
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-border">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger 
                value="my-day" 
                data-testid="tab-my-day"
                className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-[13px] pt-4 text-sm font-bold leading-normal tracking-[0.015em] data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-[3px] data-[state=inactive]:border-transparent hover:border-b-gray-300 dark:hover:border-b-gray-500 transition-colors"
              >
                <MaterialSymbol name="today" size="sm" className="mr-2" />
                {t('dashboard.myDay')}
              </TabsTrigger>
              {canViewManagement && (
                <>
                  <TabsTrigger 
                    value="company-today" 
                    data-testid="tab-company-today"
                    className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-[13px] pt-4 text-sm font-bold leading-normal tracking-[0.015em] data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-[3px] data-[state=inactive]:border-transparent hover:border-b-gray-300 dark:hover:border-b-gray-500 transition-colors"
                  >
                    <MaterialSymbol name="domain" size="sm" className="mr-2" />
                    {t('dashboard.companyToday')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="executive-overview" 
                    data-testid="tab-executive-overview"
                    className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-[13px] pt-4 text-sm font-bold leading-normal tracking-[0.015em] data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-[3px] data-[state=inactive]:border-transparent hover:border-b-gray-300 dark:hover:border-b-gray-500 transition-colors"
                  >
                    <MaterialSymbol name="analytics" size="sm" className="mr-2" />
                    {t('dashboard.executiveOverview')}
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

        <TabsContent value="my-day" className="mt-8" data-testid="content-my-day">
          <MyDayTab />
        </TabsContent>

        {canViewManagement && (
          <>
            <TabsContent value="company-today" className="mt-8" data-testid="content-company-today">
              <CompanyTodayTab />
            </TabsContent>

            <TabsContent value="executive-overview" className="mt-8" data-testid="content-executive-overview">
              <ExecutiveOverviewTab />
            </TabsContent>
          </>
        )}
        </Tabs>
      </div>
    </div>
  );
}
