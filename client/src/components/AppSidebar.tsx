import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { CompanySettings } from '@shared/schema';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialSymbol } from '@/components/MaterialSymbol';
import kararaosLogo from '@assets/kararaos_logo_1763759128002.png';

interface AppSidebarProps {
  side?: 'left' | 'right';
}

// Helper component to render Material Symbol icons
const SidebarIcon = ({ name, filled = false }: { name: string; filled?: boolean }) => (
  <MaterialSymbol name={name} size="sm" filled={filled} />
);

export function AppSidebar({ side = 'left' }: AppSidebarProps) {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const { 
    user, 
    isAdmin, 
    isManager, 
    canAccessReports, 
    canCloseContracts,
    // Granular report permissions
    canAccessRevenueTrends,
    canAccessFleetPerformance,
    canAccessContractAnalytics,
    canAccessCollectionPerformance,
    canAccessFinancialReports,
    canAccessOperationalReports,
    canAccessCustomerReports,
    canAccessInsuranceReports,
    canAccessAuditReports,
    canAccessUserActivityReports,
  } = useAuth();
  const { toast } = useToast();
  const { toggleSidebar, state: sidebarState } = useSidebar();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Collapsible menu state management with localStorage persistence
  // Default to collapsed (false) on first login
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [administrationOpen, setAdministrationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpLegalOpen, setHelpLegalOpen] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  
  // Track which submenu should open after sidebar expands
  const [pendingSubmenuOpen, setPendingSubmenuOpen] = useState<string | null>(null);

  // Load collapsible state from localStorage on mount
  useEffect(() => {
    const savedOperations = localStorage.getItem('sidebar_operations_open');
    const savedMasters = localStorage.getItem('sidebar_masters_open');
    const savedReports = localStorage.getItem('sidebar_reports_open');
    const savedAdministration = localStorage.getItem('sidebar_administration_open');
    const savedSettings = localStorage.getItem('sidebar_settings_open');
    const savedHelpLegal = localStorage.getItem('sidebar_helplegal_open');
    const savedSample = localStorage.getItem('sidebar_sample_open');

    if (savedOperations !== null) setOperationsOpen(savedOperations === 'true');
    if (savedMasters !== null) setMastersOpen(savedMasters === 'true');
    if (savedReports !== null) setReportsOpen(savedReports === 'true');
    if (savedAdministration !== null) setAdministrationOpen(savedAdministration === 'true');
    if (savedSettings !== null) setSettingsOpen(savedSettings === 'true');
    if (savedHelpLegal !== null) setHelpLegalOpen(savedHelpLegal === 'true');
    if (savedSample !== null) setSampleOpen(savedSample === 'true');
  }, []);

  // When sidebar expands and there's a pending submenu, open it
  useEffect(() => {
    if (sidebarState === 'expanded' && pendingSubmenuOpen) {
      // Sidebar has expanded, now open the pending submenu
      switch (pendingSubmenuOpen) {
        case 'operations':
          setOperationsOpen(true);
          localStorage.setItem('sidebar_operations_open', 'true');
          break;
        case 'masters':
          setMastersOpen(true);
          localStorage.setItem('sidebar_masters_open', 'true');
          break;
        case 'reports':
          setReportsOpen(true);
          localStorage.setItem('sidebar_reports_open', 'true');
          break;
        case 'administration':
          setAdministrationOpen(true);
          localStorage.setItem('sidebar_administration_open', 'true');
          break;
        case 'settings':
          setSettingsOpen(true);
          localStorage.setItem('sidebar_settings_open', 'true');
          break;
        case 'helplegal':
          setHelpLegalOpen(true);
          localStorage.setItem('sidebar_helplegal_open', 'true');
          break;
        case 'sample':
          setSampleOpen(true);
          localStorage.setItem('sidebar_sample_open', 'true');
          break;
      }
      setPendingSubmenuOpen(null); // Clear pending state
    }
  }, [sidebarState, pendingSubmenuOpen]);

  // Save collapsible state to localStorage when changed
  const handleMastersToggle = (open: boolean) => {
    // If sidebar is collapsed and user is trying to open submenu, expand sidebar first
    // and defer opening the submenu until after expansion completes
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('masters');
      toggleSidebar();
      return; // Don't open submenu yet - wait for sidebar to expand
    }
    setMastersOpen(open);
    localStorage.setItem('sidebar_masters_open', String(open));
  };

  const handleReportsToggle = (open: boolean) => {
    // If sidebar is collapsed and user is trying to open submenu, expand sidebar first
    // and defer opening the submenu until after expansion completes
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('reports');
      toggleSidebar();
      return; // Don't open submenu yet - wait for sidebar to expand
    }
    setReportsOpen(open);
    localStorage.setItem('sidebar_reports_open', String(open));
  };

  const handleOperationsToggle = (open: boolean) => {
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('operations');
      toggleSidebar();
      return;
    }
    setOperationsOpen(open);
    localStorage.setItem('sidebar_operations_open', String(open));
  };

  const handleAdministrationToggle = (open: boolean) => {
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('administration');
      toggleSidebar();
      return;
    }
    setAdministrationOpen(open);
    localStorage.setItem('sidebar_administration_open', String(open));
  };

  const handleSettingsToggle = (open: boolean) => {
    // If sidebar is collapsed and user is trying to open submenu, expand sidebar first
    // and defer opening the submenu until after expansion completes
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('settings');
      toggleSidebar();
      return; // Don't open submenu yet - wait for sidebar to expand
    }
    setSettingsOpen(open);
    localStorage.setItem('sidebar_settings_open', String(open));
  };

  const handleHelpLegalToggle = (open: boolean) => {
    // If sidebar is collapsed and user is trying to open submenu, expand sidebar first
    // and defer opening the submenu until after expansion completes
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('helplegal');
      toggleSidebar();
      return; // Don't open submenu yet - wait for sidebar to expand
    }
    setHelpLegalOpen(open);
    localStorage.setItem('sidebar_helplegal_open', String(open));
  };

  const handleSampleToggle = (open: boolean) => {
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('sample');
      toggleSidebar();
      return;
    }
    setSampleOpen(open);
    localStorage.setItem('sidebar_sample_open', String(open));
  };
  
  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
  });

  // Operations Items
  const operationsItems = [
    {
      title: t('nav.contracts'),
      icon: 'description',
      url: '/contracts',
      show: true,
    },
    {
      title: t('nav.insuranceClaims'),
      icon: 'health_and_safety',
      url: '/insurance-claims',
      show: true,
    },
    {
      title: t('nav.tollManagement'),
      icon: 'toll',
      url: '/toll-management',
      show: true,
    },
    {
      title: t('nav.trafficFines'),
      icon: 'warning',
      url: '/traffic-fines',
      show: true,
    },
    {
      title: t('nav.incidents'),
      icon: 'report_problem',
      url: '/incidents',
      show: true,
    },
    {
      title: t('nav.vehicleMaintenance'),
      icon: 'build',
      url: '/vehicle-maintenance',
      show: true,
    },
    {
      title: t('nav.driverScheduling'),
      icon: 'event',
      url: '/driver-scheduling',
      show: true,
    },
    {
      title: t('nav.communicationLogs'),
      icon: 'chat',
      url: '/communication/logs',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.campaignManagement'),
      icon: 'send',
      url: '/campaigns',
      show: isAdmin || isManager || user?.role === 'staff',
    },
    {
      title: t('nav.manualNotificationSender'),
      icon: 'email',
      url: '/notifications/send',
      show: isAdmin || isManager || user?.role === 'staff',
    },
  ];

  // Master Data Items
  const masterItems = [
    {
      title: t('nav.customers'),
      icon: 'person',
      url: '/customers',
      show: true,
    },
    {
      title: t('nav.vehicles'),
      icon: 'directions_car',
      url: '/vehicles',
      show: true,
    },
    {
      title: t('nav.sponsors'),
      icon: 'badge',
      url: '/sponsors',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.companies'),
      icon: 'business',
      url: '/companies',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.branches'),
      icon: 'business',
      url: '/branches',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.drivers'),
      icon: 'people',
      url: '/drivers',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.driverCompanies'),
      icon: 'business_center',
      url: '/driver-companies',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.documentRegistry'),
      icon: 'folder_open',
      url: '/documents',
      show: true,
    },
    {
      title: t('nav.rentalRatePlans'),
      icon: 'receipt',
      url: '/rate-plans',
      show: true,
    },
    {
      title: t('nav.vehicleAccessories'),
      icon: 'inventory_2',
      url: '/accessories',
      show: true,
    },
    {
      title: t('nav.publicHolidays'),
      icon: 'event_available',
      url: '/public-holidays',
      show: isAdmin,
    },
  ];

  // Administration Items
  const administrationItems = [
    {
      title: t('nav.customerRiskScoring'),
      icon: 'security',
      url: '/risk-scoring',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.approvalWorkflows'),
      icon: 'checklist',
      url: '/approvals',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.automatedReminders'),
      icon: 'notifications',
      url: '/reminders',
      show: true,
    },
    {
      title: t('nav.communicationProviders'),
      icon: 'email',
      url: '/communication/providers',
      show: isAdmin,
    },
    {
      title: t('nav.auditLogs'),
      icon: 'history',
      url: '/audit-logs',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.accessReport'),
      icon: 'verified_user',
      url: '/access-report',
      show: isAdmin || isManager || user?.canAccessAppAccessReport === true,
    },
    {
      title: t('nav.systemErrors'),
      icon: 'error_outline',
      url: '/system-errors',
      show: isAdmin,
    },
    {
      title: t('nav.performanceMonitoring'),
      icon: 'speed',
      url: '/performance-monitoring',
      show: isAdmin,
    },
  ];

  // Settings Items
  const settingsItems = [
    {
      title: t('nav.companySettings'),
      icon: 'business_center',
      url: '/settings/company',
      show: isAdmin,
    },
    {
      title: t('nav.financialSettings'),
      icon: 'account_balance',
      url: '/settings/financials',
      show: isAdmin,
    },
    {
      title: t('nav.termsConditions'),
      icon: 'description',
      url: '/settings/terms',
      show: isAdmin,
    },
    {
      title: t('nav.systemUsers'),
      icon: 'people',
      url: '/users',
      show: isAdmin,
    },
    {
      title: 'Import Data',
      icon: 'upload',
      url: '/settings/import',
      show: isAdmin && (user?.isImmutable === true),
    },
  ];

  // Sample & Demo Items
  const sampleItems = [
    {
      title: t('nav.designShowcase'),
      icon: 'dashboard',
      url: '/design-system-showcase',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.dashboardSamples'),
      icon: 'view_quilt',
      url: '/dashboard-samples',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.designSamples'),
      icon: 'palette',
      url: '/design-samples',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.contractFormSample'),
      icon: 'description',
      url: '/contract-form-sample',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.providerComparison'),
      icon: 'email',
      url: '/provider-comparison',
      show: isAdmin || isManager,
    },
    {
      title: t('nav.fieldStyleShowcase'),
      icon: 'text_fields',
      url: '/field-style-showcase',
      show: isAdmin || isManager,
    },
  ];

  // Help & Legal Items
  const helpLegalItems = [
    {
      title: 'Support & Help',
      icon: 'support',
      url: '/settings/support',
      show: true,
    },
    {
      title: 'Privacy Policy',
      icon: 'privacy_tip',
      url: '/settings/privacy',
      show: true,
    },
    {
      title: 'Terms of Service',
      icon: 'gavel',
      url: '/settings/terms-of-service',
      show: true,
    },
  ];

  // Report Items
  const reportItems = [
    // Communication & Campaign Analytics
    {
      title: t('nav.campaignAnalytics'),
      icon: 'trending_up',
      url: '/campaign-analytics',
      show: isAdmin || isManager,
    },
    // Predictive Intelligence Reports
    {
      title: 'Revenue Forecast',
      icon: 'trending_up',
      url: '/reports/predictive/revenue-forecast',
      show: isAdmin || isManager || canAccessReports,
    },
    {
      title: 'Fleet Utilization Forecast',
      icon: 'trending_up',
      url: '/reports/predictive/fleet-utilization',
      show: isAdmin || isManager || canAccessReports,
    },
    {
      title: 'Customer Churn Risk',
      icon: 'target',
      url: '/reports/predictive/customer-churn',
      show: isAdmin || isManager || canAccessReports,
    },
    {
      title: 'Maintenance Cost Forecast',
      icon: 'line_chart',
      url: '/reports/predictive/maintenance-forecast',
      show: isAdmin || isManager || canAccessReports,
    },
    {
      title: 'Payment Default Prediction',
      icon: 'trending_up',
      url: '/reports/predictive/payment-default',
      show: isAdmin || isManager || canAccessReports,
    },
    {
      title: 'Location Demand Forecast',
      icon: 'trending_up',
      url: '/reports/predictive/demand-forecast',
      show: isAdmin || isManager || canAccessReports,
    },
    // Analytical Reports - Granular Permissions
    {
      title: 'Revenue Trends',
      icon: 'trending_up',
      url: '/reports/revenue-trends',
      show: isAdmin || isManager || canAccessRevenueTrends,
    },
    {
      title: 'Fleet Performance',
      icon: 'directions_car',
      url: '/reports/fleet-performance',
      show: isAdmin || isManager || canAccessFleetPerformance,
    },
    {
      title: 'Contract Analytics',
      icon: 'analytics',
      url: '/reports/contract-analytics',
      show: isAdmin || isManager || canAccessContractAnalytics,
    },
    {
      title: 'Collection Performance',
      icon: 'account_balance_wallet',
      url: '/reports/collection-performance',
      show: isAdmin || isManager || canAccessCollectionPerformance,
    },
    {
      title: 'Driver Utilization',
      icon: 'person_pin_circle',
      url: '/reports/driver-utilization',
      show: isAdmin || isManager || canAccessReports,
    },
    {
      title: 'Driver Revenue & Cost',
      icon: 'account_balance_wallet',
      url: '/reports/driver-revenue-cost',
      show: isAdmin || isManager || canAccessReports,
    },
    // Standard Reports - Granular Permissions
    {
      title: t('nav.financialReports'),
      icon: 'account_balance',
      url: '/reports/financial',
      show: isAdmin || isManager || canAccessFinancialReports,
    },
    {
      title: t('nav.operationalReports'),
      icon: 'bar_chart',
      url: '/reports/operational',
      show: isAdmin || isManager || canAccessOperationalReports,
    },
    {
      title: t('nav.customerReports'),
      icon: 'people_outline',
      url: '/reports/customers',
      show: isAdmin || isManager || canAccessCustomerReports,
    },
    {
      title: 'Insurance Reports',
      icon: 'health_and_safety',
      url: '/reports/insurance',
      show: isAdmin || isManager || canAccessInsuranceReports,
    },
    {
      title: t('nav.auditReports'),
      icon: 'timeline',
      url: '/reports/audit',
      show: isAdmin || isManager || canAccessAuditReports,
    },
    {
      title: t('nav.userActivity'),
      icon: 'person_search',
      url: '/reports/user-activity',
      show: isAdmin || isManager || canAccessUserActivityReports,
    },
    // Special Reports - Keep master toggle
    {
      title: 'Unclosed Contracts',
      icon: 'warning_amber',
      url: '/unclosed-contracts-report',
      show: isAdmin || isManager || canAccessReports,
    },
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default';
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'staff':
        return 'outline';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest('POST', '/api/auth/change-password', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('users.passwordChanged'),
      });
      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      });
    },
  });

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('users.passwordMismatch'),
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      // Clear all cached data
      queryClient.clear();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('auth.logoutFailed'),
      });
    }
  };

  return (
    <Sidebar side={side} collapsible="icon" data-testid="sidebar-main">
      <SidebarHeader className="p-4 border-b">
        {/* Company branding - Reference Design */}
        <div className="flex items-center gap-3 px-2">
          {/* KarāraOS Logo */}
          <div className="size-10 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-lg">
            <img 
              src={kararaosLogo} 
              alt="KarāraOS" 
              className="size-full object-contain"
              data-testid="img-sidebar-logo"
            />
          </div>
          {sidebarState === 'expanded' && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-base font-bold leading-normal truncate">
                {settings 
                  ? i18n.language === 'ar' 
                    ? settings.companyNameAr || settings.companyNameEn || 'KarāraOS'
                    : settings.companyNameEn || settings.companyNameAr || 'KarāraOS'
                  : 'KarāraOS'
                }
              </h1>
              <p className="text-sm font-normal text-muted-foreground leading-normal truncate">
                {t('landing.title')}
              </p>
            </div>
          )}
        </div>

        {/* Control cluster - below branding */}
        <div className={`flex ${sidebarState === 'collapsed' ? 'flex-col' : 'flex-row'} items-center gap-2 mt-4`}>
          {/* Sidebar Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                data-testid="button-sidebar-toggle"
                className="h-8 w-8 hover-elevate active-elevate-2 shrink-0"
                aria-label={sidebarState === 'expanded' ? t('header.collapseSidebar') : t('header.expandSidebar')}
              >
                <SidebarIcon name="menu" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
              <p>{sidebarState === 'expanded' ? t('header.collapseSidebar') : t('header.expandSidebar')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
                className="h-8 w-8 hover-elevate active-elevate-2 shrink-0"
                aria-label={theme === 'light' ? t('header.switchToDark') : t('header.switchToLight')}
              >
                <SidebarIcon name={theme === 'light' ? 'dark_mode' : 'light_mode'} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
              <p>{theme === 'light' ? t('header.switchToDark') : t('header.switchToLight')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Language Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                data-testid="button-language-toggle"
                className="h-8 w-8 hover-elevate active-elevate-2 shrink-0"
                aria-label={language === 'en' ? t('header.switchToArabic') : t('header.switchToEnglish')}
              >
                <SidebarIcon name="language" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
              <p>{language === 'en' ? t('header.switchToArabic') : t('header.switchToEnglish')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          {sidebarState === 'expanded' && <SidebarGroupLabel>{t('nav.menu')}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === '/'} 
                  data-testid="nav-dashboard"
                  tooltip={{
                    children: t('nav.dashboard'),
                    side: language === 'ar' ? 'left' : 'right'
                  }}
                >
                  <Link href="/">
                    <SidebarIcon name="dashboard" filled={location === '/'} />
                    {sidebarState === 'expanded' && <span>{t('nav.dashboard')}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Operations - Collapsible */}
              <Collapsible open={operationsOpen} onOpenChange={handleOperationsToggle} className="group/collapsible">
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton data-testid="nav-operations">
                          <SidebarIcon name="work" />
                          {sidebarState === 'expanded' && <span>{t('nav.operations')}</span>}
                          {sidebarState === 'expanded' && (
                            <MaterialSymbol name="chevron_right" size="sm" className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    {sidebarState === 'collapsed' && (
                      <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                        <p>{t('nav.operations')}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {operationsItems.filter(item => item.show).map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                            <Link href={item.url}>
                              <SidebarIcon name={item.icon} filled={location === item.url} />
                              {sidebarState === 'expanded' && <span>{item.title}</span>}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Masters - Collapsible */}
              <Collapsible open={mastersOpen} onOpenChange={handleMastersToggle} className="group/collapsible">
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton data-testid="nav-masters">
                          <SidebarIcon name="folder" />
                          {sidebarState === 'expanded' && <span>{t('nav.masters')}</span>}
                          {sidebarState === 'expanded' && (
                            <MaterialSymbol name="chevron_right" size="sm" className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    {sidebarState === 'collapsed' && (
                      <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                        <p>{t('nav.masters')}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {masterItems.filter(item => item.show).map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                            <Link href={item.url}>
                              <SidebarIcon name={item.icon} filled={location === item.url} />
                              {sidebarState === 'expanded' && <span>{item.title}</span>}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Reports - Collapsible (Admin/Manager or users with canAccessReports) */}
              {(isAdmin || isManager || canAccessReports) && (
                <Collapsible open={reportsOpen} onOpenChange={handleReportsToggle} className="group/collapsible">
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton data-testid="nav-reports">
                            <SidebarIcon name="bar_chart" />
                            {sidebarState === 'expanded' && <span>{t('nav.reports')}</span>}
                            {sidebarState === 'expanded' && (
                              <MaterialSymbol name="chevron_right" size="sm" className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      {sidebarState === 'collapsed' && (
                        <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                          <p>{t('nav.reports')}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {reportItems.filter(item => item.show).map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/reports/', '')}-reports`}>
                              <Link href={item.url}>
                                <SidebarIcon name={item.icon} filled={location === item.url} />
                                {sidebarState === 'expanded' && <span>{item.title}</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Administration - Collapsible (Admin/Manager only) */}
              {(isAdmin || isManager) && (
                <Collapsible open={administrationOpen} onOpenChange={handleAdministrationToggle} className="group/collapsible">
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton data-testid="nav-administration">
                            <SidebarIcon name="admin_panel_settings" />
                            {sidebarState === 'expanded' && <span>{t('nav.administration')}</span>}
                            {sidebarState === 'expanded' && (
                              <MaterialSymbol name="chevron_right" size="sm" className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      {sidebarState === 'collapsed' && (
                        <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                          <p>{t('nav.administration')}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {administrationItems.filter(item => item.show).map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                              <Link href={item.url}>
                                <SidebarIcon name={item.icon} filled={location === item.url} />
                                {sidebarState === 'expanded' && <span>{item.title}</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Settings - Collapsible (Admin only) */}
              {isAdmin && (
                <Collapsible open={settingsOpen} onOpenChange={handleSettingsToggle} className="group/collapsible">
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton data-testid="nav-settings">
                            <SidebarIcon name="settings" />
                            {sidebarState === 'expanded' && <span>{t('nav.settings')}</span>}
                            {sidebarState === 'expanded' && (
                              <MaterialSymbol name="chevron_right" size="sm" className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      {sidebarState === 'collapsed' && (
                        <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                          <p>{t('nav.settings')}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {settingsItems.filter(item => item.show).map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                              <Link href={item.url}>
                                <SidebarIcon name={item.icon} filled={location === item.url} />
                                {sidebarState === 'expanded' && <span>{item.title}</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Sample & Demos - Collapsible (Admin/Manager only) */}
              {(isAdmin || isManager) && (
                <Collapsible open={sampleOpen} onOpenChange={handleSampleToggle} className="group/collapsible">
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton data-testid="nav-sample">
                            <SidebarIcon name="palette" />
                            {sidebarState === 'expanded' && <span>{t('nav.sample')}</span>}
                            {sidebarState === 'expanded' && (
                              <MaterialSymbol name="chevron_right" size="sm" className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      {sidebarState === 'collapsed' && (
                        <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                          <p>{t('nav.sample')}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {sampleItems.filter(item => item.show).map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                              <Link href={item.url}>
                                <SidebarIcon name={item.icon} filled={location === item.url} />
                                {sidebarState === 'expanded' && <span>{item.title}</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Help & Legal - Collapsible (All users) */}
              <Collapsible open={helpLegalOpen} onOpenChange={handleHelpLegalToggle} className="group/collapsible">
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton data-testid="nav-help-legal">
                          <SidebarIcon name="help_outline" />
                          {sidebarState === 'expanded' && <span>Help & Legal</span>}
                          {sidebarState === 'expanded' && (
                            <MaterialSymbol name="chevron_right" size="sm" className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    {sidebarState === 'collapsed' && (
                      <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                        <p>Help & Legal</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {helpLegalItems.filter(item => item.show).map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.split('/').pop()}`}>
                            <Link href={item.url}>
                              <SidebarIcon name={item.icon} filled={location === item.url} />
                              {sidebarState === 'expanded' && <span>{item.title}</span>}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {/* Support Button - Quick access to help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/settings/support">
              {sidebarState === 'expanded' ? (
                <button 
                  className="flex items-center gap-3 w-full hover-elevate p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-support"
                >
                  <MaterialSymbol name="headphones" size="md" />
                  <span className="text-sm font-medium">{t('nav.support')}</span>
                </button>
              ) : (
                <button 
                  className="flex items-center justify-center w-full hover-elevate p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-support"
                >
                  <MaterialSymbol name="headphones" size="md" />
                </button>
              )}
            </Link>
          </TooltipTrigger>
          {sidebarState === 'collapsed' && (
            <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
              <p>{t('nav.support')}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {/* User menu - Responsive to sidebar state */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                {sidebarState === 'expanded' ? (
                  <button className="flex items-center gap-3 w-full hover-elevate p-2 rounded-md" data-testid="button-user-menu">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} style={{ objectFit: 'cover' }} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate" data-testid="text-username">
                        {user?.firstName || user?.lastName 
                          ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                          : user?.username || 'User'}
                      </p>
                      <Badge variant={getRoleBadgeVariant(user?.role || 'staff')} className="text-xs mt-1" data-testid="badge-role">
                        {t(`role.${user?.role || 'staff'}`)}
                      </Badge>
                    </div>
                    <MaterialSymbol name="expand_more" size="sm" className="text-muted-foreground" />
                  </button>
                ) : (
                  <button className="flex items-center justify-center w-full hover-elevate p-2 rounded-md" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} style={{ objectFit: 'cover' }} />
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </button>
                )}
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{user?.firstName || user?.lastName 
                ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                : user?.username || 'User'}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('auth.myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)} data-testid="button-change-password">
              <MaterialSymbol name="lock" size="sm" className="mr-2" />
              {t('users.changePassword')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
              <MaterialSymbol name="logout" size="sm" className="mr-2" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent data-testid="dialog-change-password">
          <DialogHeader>
            <DialogTitle>{t('users.changePassword')}</DialogTitle>
            <DialogDescription>{t('users.changePasswordDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">{t('users.currentPassword')}</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                data-testid="input-current-password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">{t('users.newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">{t('users.confirmPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} data-testid="button-cancel-password">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handlePasswordChange} 
              disabled={changePasswordMutation.isPending}
              data-testid="button-submit-password"
            >
              {changePasswordMutation.isPending ? t('common.saving') : t('users.changePassword')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
