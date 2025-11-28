import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { SystemError } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  const [isErrorBannerDismissed, setIsErrorBannerDismissed] = useState(false);
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
    <div className="p-fluid-4 md:p-fluid-6 lg:p-fluid-8">
      {/* System Errors Banner */}
      {isAdmin && unacknowledgedErrors.length > 0 && !isErrorBannerDismissed && (
        <Alert variant="destructive" className="relative rounded-xl mb-fluid-4" data-testid="alert-system-errors">
          <MaterialSymbol name="error" size="sm" />
          <AlertTitle className="text-fluid-sm">{t('greeting.systemErrors')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between text-fluid-xs">
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
              className="absolute top-2 right-2 hover:bg-destructive/20"
              onClick={() => setIsErrorBannerDismissed(true)}
              data-testid="button-dismiss-error-banner"
            >
              <MaterialSymbol name="close" size="sm" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header - Responsive Design */}
      <div className="flex flex-wrap justify-between items-center gap-fluid-4">
        <div className="flex flex-col gap-fluid-2">
          <h1 className="text-fluid-4xl font-black leading-tight tracking-[-0.033em]" data-testid="text-dashboard-title">
            {t('dashboard.title')}
          </h1>
          <p className="text-fluid-base text-muted-foreground" data-testid="text-greeting">
            {greetingText}, <span className="font-medium text-foreground">{firstName}</span>
          </p>
        </div>
        <Button asChild className="h-9 md:h-10 px-3 md:px-4 text-fluid-sm font-bold gap-2" data-testid="button-new-contract">
          <Link href="/contracts/new">
            <MaterialSymbol name="add" size="sm" />
            <span>{t('contracts.newContract')}</span>
          </Link>
        </Button>
      </div>

      {/* Tabbed Dashboard */}
      <div className="mt-fluid-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-border">
            <TabsList className="bg-transparent h-auto p-0 gap-4 md:gap-6 lg:gap-8">
              <TabsTrigger 
                value="my-day" 
                data-testid="tab-my-day"
                className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-2 md:pb-3 pt-3 md:pt-4 text-fluid-sm font-bold leading-normal tracking-wide data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-[3px] data-[state=inactive]:border-transparent hover:text-primary transition-colors"
              >
                <MaterialSymbol name="today" size="sm" className="mr-1 md:mr-2" />
                {t('dashboard.myDay')}
              </TabsTrigger>
              {canViewManagement && (
                <>
                  <TabsTrigger 
                    value="company-today" 
                    data-testid="tab-company-today"
                    className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-2 md:pb-3 pt-3 md:pt-4 text-fluid-sm font-bold leading-normal tracking-wide data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-[3px] data-[state=inactive]:border-transparent hover:text-primary transition-colors"
                  >
                    <MaterialSymbol name="domain" size="sm" className="mr-1 md:mr-2" />
                    {t('dashboard.companyToday')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="executive-overview" 
                    data-testid="tab-executive-overview"
                    className="data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-0 pb-2 md:pb-3 pt-3 md:pt-4 text-fluid-sm font-bold leading-normal tracking-wide data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-b-[3px] data-[state=inactive]:border-transparent hover:text-primary transition-colors"
                  >
                    <MaterialSymbol name="analytics" size="sm" className="mr-1 md:mr-2" />
                    {t('dashboard.executiveOverview')}
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

        <TabsContent value="my-day" className="mt-fluid-6" data-testid="content-my-day">
          <MyDayTab />
        </TabsContent>

        {canViewManagement && (
          <>
            <TabsContent value="company-today" className="mt-fluid-6" data-testid="content-company-today">
              <CompanyTodayTab />
            </TabsContent>

            <TabsContent value="executive-overview" className="mt-fluid-6" data-testid="content-executive-overview">
              <ExecutiveOverviewTab />
            </TabsContent>
          </>
        )}
        </Tabs>
      </div>
    </div>
  );
}
