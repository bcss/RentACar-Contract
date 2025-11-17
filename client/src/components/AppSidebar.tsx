import { useState, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as WouterLink, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

// Create a ref-forwarding Link component for compatibility with Radix UI Slot
const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof WouterLink>>((props, ref) => {
  return <WouterLink {...props} ref={ref as any} />;
});
Link.displayName = 'Link';
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
import {
  Menu,
  Sun,
  Moon,
  Globe,
  Car,
  LayoutDashboard,
  FileText,
  Hospital,
  Folder,
  BarChart3,
  ChevronRight,
  Settings,
  Building2,
  BarChart,
  Users,
  ShieldCheck,
  Clock,
  UserSearch,
  AlertTriangle,
  ChevronDown,
  HelpCircle,
  FileCheck,
  Scale,
  UserCog,
  Building,
  Shield,
  DollarSign,
  Lock,
  LogOut,
  Info,
  Landmark,
  AlertOctagon,
  FileWarning,
  FolderOpen,
  Wrench,
  Receipt,
  Package,
  Calendar,
  Bell,
  CheckSquare,
} from 'lucide-react';

interface AppSidebarProps {
  side?: 'left' | 'right';
}

// Helper function to map icon names to lucide-react components
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    // Masters
    'people_outline': Users,
    'directions_car': Car,
    'business': Building,
    'people': Users,
    // Reports
    'account_balance': DollarSign,
    'bar_chart': BarChart,
    'assessment': BarChart3,
    // Audit
    'timeline': Clock,
    'warning_amber': AlertTriangle,
    'person_search': UserSearch,
    // Settings
    'settings': Settings,
    'business_center': Building2,
    'description': FileText,
    // Help & Legal
    'help_outline': HelpCircle,
    'gavel': Scale,
    'shield': Shield,
    'info': HelpCircle,
    // New Features - Wave 1 (Compliance & Operations)
    'landmark': Landmark,
    'alert_octagon': AlertOctagon,
    'file_warning': FileWarning,
    'folder_open': FolderOpen,
    // New Features - Wave 2 (Fleet Economics)
    'wrench': Wrench,
    'receipt': Receipt,
    'package': Package,
    // New Features - Wave 3 (Workforce & Automation)
    'calendar': Calendar,
    'bell': Bell,
    'check_square': CheckSquare,
    // Default
    'default': FileText,
  };
  
  return iconMap[iconName] || FileText;
};

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
  const [mastersOpen, setMastersOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpLegalOpen, setHelpLegalOpen] = useState(false);
  
  // Track which submenu should open after sidebar expands
  const [pendingSubmenuOpen, setPendingSubmenuOpen] = useState<string | null>(null);

  // Load collapsible state from localStorage on mount
  useEffect(() => {
    const savedMasters = localStorage.getItem('sidebar_masters_open');
    const savedReports = localStorage.getItem('sidebar_reports_open');
    const savedAudit = localStorage.getItem('sidebar_audit_open');
    const savedSettings = localStorage.getItem('sidebar_settings_open');
    const savedHelpLegal = localStorage.getItem('sidebar_helplegal_open');

    if (savedMasters !== null) setMastersOpen(savedMasters === 'true');
    if (savedReports !== null) setReportsOpen(savedReports === 'true');
    if (savedAudit !== null) setAuditOpen(savedAudit === 'true');
    if (savedSettings !== null) setSettingsOpen(savedSettings === 'true');
    if (savedHelpLegal !== null) setHelpLegalOpen(savedHelpLegal === 'true');
  }, []);

  // When sidebar expands and there's a pending submenu, open it
  useEffect(() => {
    if (sidebarState === 'expanded' && pendingSubmenuOpen) {
      // Sidebar has expanded, now open the pending submenu
      switch (pendingSubmenuOpen) {
        case 'masters':
          setMastersOpen(true);
          localStorage.setItem('sidebar_masters_open', 'true');
          break;
        case 'reports':
          setReportsOpen(true);
          localStorage.setItem('sidebar_reports_open', 'true');
          break;
        case 'audit':
          setAuditOpen(true);
          localStorage.setItem('sidebar_audit_open', 'true');
          break;
        case 'settings':
          setSettingsOpen(true);
          localStorage.setItem('sidebar_settings_open', 'true');
          break;
        case 'helplegal':
          setHelpLegalOpen(true);
          localStorage.setItem('sidebar_helplegal_open', 'true');
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

  const handleAuditToggle = (open: boolean) => {
    // If sidebar is collapsed and user is trying to open submenu, expand sidebar first
    // and defer opening the submenu until after expansion completes
    if (open && sidebarState === 'collapsed') {
      setPendingSubmenuOpen('audit');
      toggleSidebar();
      return; // Don't open submenu yet - wait for sidebar to expand
    }
    setAuditOpen(open);
    localStorage.setItem('sidebar_audit_open', String(open));
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
  
  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
  });

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
      title: 'Branches',
      icon: 'business',
      url: '/branches',
      show: isAdmin || isManager,
    },
    {
      title: 'Drivers',
      icon: 'people',
      url: '/drivers',
      show: isAdmin || isManager,
    },
    {
      title: 'Driver Companies',
      icon: 'business_center',
      url: '/driver-companies',
      show: isAdmin || isManager,
    },
    // Wave 1 - Compliance & Operations
    {
      title: 'Toll Management',
      icon: 'landmark',
      url: '/toll-management',
      show: true,
    },
    {
      title: 'Traffic Fines',
      icon: 'alert_octagon',
      url: '/traffic-fines',
      show: true,
    },
    {
      title: 'Incidents',
      icon: 'file_warning',
      url: '/incidents',
      show: true,
    },
    {
      title: 'Document Registry',
      icon: 'folder_open',
      url: '/documents',
      show: true,
    },
    // Wave 2 - Fleet Economics
    {
      title: 'Vehicle Maintenance',
      icon: 'wrench',
      url: '/vehicle-maintenance',
      show: true,
    },
    {
      title: 'Rental Rate Plans',
      icon: 'receipt',
      url: '/rate-plans',
      show: true,
    },
    {
      title: 'Vehicle Accessories',
      icon: 'package',
      url: '/accessories',
      show: true,
    },
    // Wave 3 - Workforce & Automation
    {
      title: 'Driver Scheduling',
      icon: 'calendar',
      url: '/driver-scheduling',
      show: true,
    },
    {
      title: 'Automated Reminders',
      icon: 'bell',
      url: '/reminders',
      show: true,
    },
    {
      title: 'Customer Risk Scoring',
      icon: 'shield',
      url: '/risk-scoring',
      show: isAdmin || isManager,
    },
  ];

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
      title: 'Public Holidays',
      icon: 'default',
      url: '/public-holidays',
      show: isAdmin,
    },
    {
      title: 'Import Data',
      icon: 'upload',
      url: '/settings/import',
      show: isAdmin && (user?.isImmutable === true),
    },
    {
      title: t('nav.systemUsers'),
      icon: 'people',
      url: '/users',
      show: isAdmin,
    },
    // Wave 3 - Approval Workflows
    {
      title: 'Approval Workflows',
      icon: 'check_square',
      url: '/approvals',
      show: isAdmin || isManager,
    },
  ];

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

  const reportItems = [
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

  const auditItems = [
    {
      title: t('nav.auditLogs'),
      icon: 'history',
      url: '/audit-logs',
      show: isAdmin || isManager,
    },
    {
      title: 'Access Report',
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
      <SidebarHeader className="p-3 border-b">
        {/* Microsoft 365-style control cluster - Responsive to sidebar state */}
        <div className={`flex ${sidebarState === 'collapsed' ? 'flex-col' : 'flex-row'} items-center gap-2 mb-3`}>
          {/* Sidebar Toggle - Icon only */}
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
                <Menu className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
              <p>{sidebarState === 'expanded' ? t('header.collapseSidebar') : t('header.expandSidebar')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme Toggle - Icon only */}
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
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
              <p>{theme === 'light' ? t('header.switchToDark') : t('header.switchToLight')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Language Toggle - Icon only */}
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
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
              <p>{language === 'en' ? t('header.switchToArabic') : t('header.switchToEnglish')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Company branding - below controls */}
        {sidebarState === 'expanded' && (
          <div className="overflow-hidden">
            <h2 className="text-base font-semibold truncate">
              {settings 
                ? i18n.language === 'ar' 
                  ? settings.companyNameAr || settings.companyNameEn || t('landing.title')
                  : settings.companyNameEn || settings.companyNameAr || t('landing.title')
                : t('landing.title')
              }
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {t('landing.title')}
            </p>
          </div>
        )}
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
                    <LayoutDashboard className="h-4 w-4" />
                    {sidebarState === 'expanded' && <span>{t('nav.dashboard')}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Contracts */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === '/contracts'} 
                  data-testid="nav-contracts"
                  tooltip={{
                    children: t('nav.contracts'),
                    side: language === 'ar' ? 'left' : 'right'
                  }}
                >
                  <Link href="/contracts">
                    <FileText className="h-4 w-4" />
                    {sidebarState === 'expanded' && <span>{t('nav.contracts')}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Insurance Claims */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === '/insurance-claims'} 
                  data-testid="nav-insurance-claims"
                  tooltip={{
                    children: 'Insurance Claims',
                    side: language === 'ar' ? 'left' : 'right'
                  }}
                >
                  <Link href="/insurance-claims">
                    <Hospital className="h-4 w-4" />
                    {sidebarState === 'expanded' && <span>Insurance Claims</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Masters - Collapsible */}
              <Collapsible open={mastersOpen} onOpenChange={handleMastersToggle} className="group/collapsible">
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton data-testid="nav-masters">
                          <Folder className="h-4 w-4" />
                          {sidebarState === 'expanded' && <span>{t('nav.masters')}</span>}
                          {sidebarState === 'expanded' && (
                            <ChevronRight className="ml-auto h-4 w-4 group-data-[state=open]/collapsible:rotate-90 transition-transform" />
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
                      {masterItems.filter(item => item.show).map((item) => {
                        const IconComponent = getIconComponent(item.icon);
                        return (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                              <Link href={item.url}>
                                <IconComponent className="h-4 w-4" />
                                {sidebarState === 'expanded' && <span>{item.title}</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
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
                            <BarChart3 className="h-4 w-4" />
                            {sidebarState === 'expanded' && <span>{t('nav.reports')}</span>}
                            {sidebarState === 'expanded' && (
                              <ChevronRight className="ml-auto h-4 w-4 group-data-[state=open]/collapsible:rotate-90 transition-transform" />
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
                        {reportItems.filter(item => item.show).map((item) => {
                          const IconComponent = getIconComponent(item.icon);
                          return (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/reports/', '')}-reports`}>
                                <Link href={item.url}>
                                  <IconComponent className="h-4 w-4" />
                                  {sidebarState === 'expanded' && <span>{item.title}</span>}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Audit Logs & System Errors - Collapsible (Admin/Manager only) */}
              {(isAdmin || isManager) && (
                <Collapsible open={auditOpen} onOpenChange={handleAuditToggle} className="group/collapsible">
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton data-testid="nav-audit-parent">
                            <ShieldCheck className="h-4 w-4" />
                            {sidebarState === 'expanded' && <span>{t('nav.auditLogsAndErrors')}</span>}
                            {sidebarState === 'expanded' && (
                              <ChevronRight className="ml-auto h-4 w-4 group-data-[state=open]/collapsible:rotate-90 transition-transform" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      {sidebarState === 'collapsed' && (
                        <TooltipContent side={language === 'ar' ? 'left' : 'right'}>
                          <p>{t('nav.auditLogsAndErrors')}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {auditItems.filter(item => item.show).map((item) => {
                          const IconComponent = getIconComponent(item.icon);
                          return (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={location.startsWith('/audit-logs') && window.location.search.includes(item.url.split('=')[1])} data-testid={`nav-${item.url.split('?')[0].replace('/', '')}-${item.url.split('=')[1]}`}>
                                <Link href={item.url}>
                                  <IconComponent className="h-4 w-4" />
                                  {sidebarState === 'expanded' && <span>{item.title}</span>}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
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
                            <Settings className="h-4 w-4" />
                            {sidebarState === 'expanded' && <span>{t('nav.settings')}</span>}
                            {sidebarState === 'expanded' && (
                              <ChevronRight className="ml-auto h-4 w-4 group-data-[state=open]/collapsible:rotate-90 transition-transform" />
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
                        {settingsItems.filter(item => item.show).map((item) => {
                          const IconComponent = getIconComponent(item.icon);
                          return (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                                <Link href={item.url}>
                                  <IconComponent className="h-4 w-4" />
                                  {sidebarState === 'expanded' && <span>{item.title}</span>}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
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
                          <HelpCircle className="h-4 w-4" />
                          {sidebarState === 'expanded' && <span>Help & Legal</span>}
                          {sidebarState === 'expanded' && (
                            <ChevronRight className="ml-auto h-4 w-4 group-data-[state=open]/collapsible:rotate-90 transition-transform" />
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
                      {helpLegalItems.filter(item => item.show).map((item) => {
                        const IconComponent = getIconComponent(item.icon);
                        return (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild isActive={location === item.url} data-testid={`nav-${item.url.split('/').pop()}`}>
                              <Link href={item.url}>
                                <IconComponent className="h-4 w-4" />
                                {sidebarState === 'expanded' && <span>{item.title}</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
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
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
              <Lock className="mr-2 h-4 w-4" />
              {t('users.changePassword')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
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
