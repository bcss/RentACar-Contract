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
import { AlertCircle, X } from 'lucide-react';
import { Icon } from '@/components/Icon';

// Import tab components
import { MyDayTab } from './dashboard/MyDayTab';
import { CompanyTodayTab } from './dashboard/CompanyTodayTab';
import { ExecutiveOverviewTab } from './dashboard/ExecutiveOverviewTab';
import { DesignSamplesTab } from './dashboard/DesignSamplesTab';

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
    <div className="p-6 space-y-6">
      {/* System Errors Banner */}
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

      {/* Welcome Header */}
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

      {/* Tabbed Dashboard */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-4xl" style={{ gridTemplateColumns: canViewManagement ? '1fr 1fr 1fr 1fr' : '1fr' }}>
          <TabsTrigger value="my-day" data-testid="tab-my-day">
            {t('dashboard.myDay')}
          </TabsTrigger>
          {canViewManagement && (
            <>
              <TabsTrigger value="company-today" data-testid="tab-company-today">
                {t('dashboard.companyToday')}
              </TabsTrigger>
              <TabsTrigger value="executive-overview" data-testid="tab-executive-overview">
                {t('dashboard.executiveOverview')}
              </TabsTrigger>
              <TabsTrigger value="design-samples" data-testid="tab-design-samples">
                Design Samples
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="my-day" className="mt-6" data-testid="content-my-day">
          <MyDayTab />
        </TabsContent>

        {canViewManagement && (
          <>
            <TabsContent value="company-today" className="mt-6" data-testid="content-company-today">
              <CompanyTodayTab />
            </TabsContent>

            <TabsContent value="executive-overview" className="mt-6" data-testid="content-executive-overview">
              <ExecutiveOverviewTab />
            </TabsContent>

            <TabsContent value="design-samples" className="mt-6" data-testid="content-design-samples">
              <DesignSamplesTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
