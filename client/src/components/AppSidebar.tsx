import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, isAdmin, isManager } = useAuth();

  const menuItems = [
    {
      title: t('nav.contracts'),
      icon: 'description',
      url: '/contracts',
      show: true,
    },
    {
      title: t('nav.users'),
      icon: 'people',
      url: '/users',
      show: isAdmin,
    },
    {
      title: t('nav.auditLogs'),
      icon: 'history',
      url: '/audit-logs',
      show: isAdmin || isManager,
    },
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'staff':
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

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <span className="material-icons text-3xl text-primary">
            directions_car
          </span>
          <div>
            <h2 className="text-lg font-semibold">{t('landing.title')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('landing.subtitle').split(' ').slice(0, 4).join(' ')}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.contracts')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => item.show).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                    <Link href={item.url}>
                      <span className="material-icons">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} style={{ objectFit: 'cover' }} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-username">
              {user?.firstName || user?.lastName 
                ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                : user?.email?.split('@')[0] || 'User'}
            </p>
            <Badge variant={getRoleBadgeVariant(user?.role || 'staff')} className="text-xs mt-1" data-testid="badge-role">
              {t(`role.${user?.role || 'staff'}`)}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
