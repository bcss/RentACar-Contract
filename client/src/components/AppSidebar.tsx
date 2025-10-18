import { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, isAdmin, isManager } = useAuth();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const menuItems = [
    {
      title: t('nav.dashboard'),
      icon: 'dashboard',
      url: '/',
      show: true,
    },
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
    {
      title: t('nav.settings'),
      icon: 'settings',
      url: '/settings',
      show: isAdmin,
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
      window.location.href = '/';
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('auth.logoutFailed'),
      });
    }
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
          <SidebarGroupLabel>{t('nav.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => item.show).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.url.replace('/', '') || 'dashboard'}`}>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover-elevate p-2 rounded-md" data-testid="button-user-menu">
              <Avatar className="h-10 w-10">
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
              <span className="material-icons text-muted-foreground">expand_more</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('auth.myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)} data-testid="button-change-password">
              <span className="material-icons mr-2">lock</span>
              {t('users.changePassword')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
              <span className="material-icons mr-2">logout</span>
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
