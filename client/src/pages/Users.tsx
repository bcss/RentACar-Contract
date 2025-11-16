import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Icon } from '@/components/Icon';

export default function Users() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isAdmin, authLoading, toast]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'staff',
    canAccessReports: false,
    canCloseContracts: false,
    canViewAllContracts: false,
    // Granular report permissions
    canAccessRevenueTrends: false,
    canAccessFleetPerformance: false,
    canAccessContractAnalytics: false,
    canAccessCollectionPerformance: false,
    canAccessFinancialReports: false,
    canAccessOperationalReports: false,
    canAccessCustomerReports: false,
    canAccessInsuranceReports: false,
    canAccessAuditReports: false,
    canAccessUserActivityReports: false,
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: disabledUsers = [], isLoading: isLoadingDisabled } = useQuery<User[]>({
    queryKey: ['/api/users/disabled'],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/users', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: t('users.userCreated'),
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: t('users.userUpdated'),
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      });
    },
  });

  const disableUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/users/${id}/disable`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/disabled'] });
      toast({
        title: t('users.userDisabled'),
      });
      setIsDisableDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      });
    },
  });

  const enableUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/users/${id}/enable`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/disabled'] });
      toast({
        title: t('users.userEnabled'),
      });
      setIsEnableDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'staff',
      canAccessReports: false,
      canCloseContracts: false,
      canViewAllContracts: false,
      // Granular report permissions
      canAccessRevenueTrends: false,
      canAccessFleetPerformance: false,
      canAccessContractAnalytics: false,
      canAccessCollectionPerformance: false,
      canAccessFinancialReports: false,
      canAccessOperationalReports: false,
      canAccessCustomerReports: false,
      canAccessInsuranceReports: false,
      canAccessAuditReports: false,
      canAccessUserActivityReports: false,
    });
    setSelectedUser(null);
  };

  const handleCreateUser = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('users.passwordMismatch'),
      });
      return;
    }

    const { confirmPassword, ...userData } = formData;
    createUserMutation.mutate(userData);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updateData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      canAccessReports: formData.canAccessReports,
      canCloseContracts: formData.canCloseContracts,
      canViewAllContracts: formData.canViewAllContracts,
    };

    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          variant: 'destructive',
          title: t('users.passwordMismatch'),
        });
        return;
      }
      updateData.password = formData.password;
    }

    updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const handleDisableUser = () => {
    if (selectedUser) {
      disableUserMutation.mutate(selectedUser.id);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role,
      canAccessReports: user.canAccessReports ?? false,
      canCloseContracts: user.canCloseContracts ?? false,
      canViewAllContracts: user.canViewAllContracts ?? false,
      // Granular report permissions
      canAccessRevenueTrends: user.canAccessRevenueTrends ?? false,
      canAccessFleetPerformance: user.canAccessFleetPerformance ?? false,
      canAccessContractAnalytics: user.canAccessContractAnalytics ?? false,
      canAccessCollectionPerformance: user.canAccessCollectionPerformance ?? false,
      canAccessFinancialReports: user.canAccessFinancialReports ?? false,
      canAccessOperationalReports: user.canAccessOperationalReports ?? false,
      canAccessCustomerReports: user.canAccessCustomerReports ?? false,
      canAccessInsuranceReports: user.canAccessInsuranceReports ?? false,
      canAccessAuditReports: user.canAccessAuditReports ?? false,
      canAccessUserActivityReports: user.canAccessUserActivityReports ?? false,
    });
    setIsEditDialogOpen(true);
  };

  const openDisableDialog = (user: User) => {
    setSelectedUser(user);
    setIsDisableDialogOpen(true);
  };

  const openEnableDialog = (user: User) => {
    setSelectedUser(user);
    setIsEnableDialogOpen(true);
  };

  const handleEnableUser = () => {
    if (selectedUser) {
      enableUserMutation.mutate(selectedUser.id);
    }
  };

  // Merge active and disabled users
  const allUsers = [...users, ...disabledUsers];

  // Apply status filter
  const filteredByStatus = allUsers.filter((user) => {
    if (statusFilter === 'active') return !user.disabledAt;
    if (statusFilter === 'disabled') return user.disabledAt;
    return true; // 'all'
  });

  // Apply search filter across username, name, email, and role
  const filteredUsers = filteredByStatus.filter((user) => {
    const search = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      (user.firstName && user.firstName.toLowerCase().includes(search)) ||
      (user.lastName && user.lastName.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search)) ||
      t(`role.${user.role}`).toLowerCase().includes(search)
    );
  });

  const isDisabledUser = (user: User) => !!user.disabledAt;

  return (
    <div className="flex-1 overflow-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">{t('users.title')}</CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-add-user">
            <Icon name="add" className=" mr-2" />
            {t('users.addUser')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t('users.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-users"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.filterAll')} ({allUsers.length})</SelectItem>
                <SelectItem value="active">{t('users.filterActive')} ({users.length})</SelectItem>
                <SelectItem value="disabled">{t('users.filterDisabled')} ({disabledUsers.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading || isLoadingDisabled ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.noResults')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.username')}</TableHead>
                  <TableHead>{t('users.name')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">{t('contracts.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    data-testid={`row-user-${user.id}`}
                    className={isDisabledUser(user) ? 'opacity-60' : ''}
                  >
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : '-'}
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{t(`role.${user.role}`)}</TableCell>
                    <TableCell>
                      {isDisabledUser(user) ? (
                        <Badge variant="secondary" data-testid={`badge-disabled-${user.id}`}>
                          {t('common.disabled')}
                        </Badge>
                      ) : (
                        <Badge variant="default" data-testid={`badge-active-${user.id}`}>
                          {t('common.active')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!isDisabledUser(user) ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Icon name="edit" className=" text-base" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDisableDialog(user)}
                            disabled={user.isImmutable}
                            data-testid={`button-disable-user-${user.id}`}
                          >
                            <Icon name="block" className=" text-base" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEnableDialog(user)}
                          data-testid={`button-enable-user-${user.id}`}
                        >
                          <Icon name="check_circle" className=" text-base" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-user">
          <DialogHeader>
            <DialogTitle>{t('users.addUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('users.username')}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                data-testid="input-create-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('users.password')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                data-testid="input-create-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('users.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                data-testid="input-create-confirm-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('users.firstName')}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                data-testid="input-create-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('users.lastName')}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                data-testid="input-create-lastname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('users.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-create-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('users.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger data-testid="select-create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('role.admin')}</SelectItem>
                  <SelectItem value="manager">{t('role.manager')}</SelectItem>
                  <SelectItem value="staff">{t('role.staff')}</SelectItem>
                  <SelectItem value="viewer">{t('role.viewer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Core Permission Toggles */}
            <div className="space-y-3 border-t pt-3">
              <Label className="text-sm font-semibold">{t('users.permissions')}</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-canAccessReports"
                  checked={formData.canAccessReports}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canAccessReports: checked as boolean })
                  }
                  data-testid="checkbox-create-can-access-reports"
                />
                <Label htmlFor="create-canAccessReports" className="text-sm font-normal cursor-pointer">
                  {t('users.canAccessReports')}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-canCloseContracts"
                  checked={formData.canCloseContracts}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canCloseContracts: checked as boolean })
                  }
                  data-testid="checkbox-create-can-close-contracts"
                />
                <Label htmlFor="create-canCloseContracts" className="text-sm font-normal cursor-pointer">
                  {t('users.canCloseContracts')}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-canViewAllContracts"
                  checked={formData.canViewAllContracts}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canViewAllContracts: checked as boolean })
                  }
                  data-testid="checkbox-create-can-view-all-contracts"
                />
                <Label htmlFor="create-canViewAllContracts" className="text-sm font-normal cursor-pointer">
                  {t('users.canViewAllContracts')}
                </Label>
              </div>
            </div>
            
            {/* Granular Report Permissions */}
            <div className="space-y-3 border-t pt-3">
              <Label className="text-sm font-semibold">Granular Report Permissions</Label>
              <p className="text-xs text-muted-foreground">Grant access to specific reports individually (Admin/Manager always have full access)</p>
              
              {/* Analytical Reports Group */}
              <div className="space-y-2 pl-2 border-l-2">
                <Label className="text-xs font-medium text-muted-foreground">Analytical Reports</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessRevenueTrends"
                    checked={formData.canAccessRevenueTrends}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessRevenueTrends: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-revenue-trends"
                  />
                  <Label htmlFor="create-canAccessRevenueTrends" className="text-sm font-normal cursor-pointer">
                    Revenue Trends Report
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessFleetPerformance"
                    checked={formData.canAccessFleetPerformance}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessFleetPerformance: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-fleet-performance"
                  />
                  <Label htmlFor="create-canAccessFleetPerformance" className="text-sm font-normal cursor-pointer">
                    Fleet Performance Report
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessContractAnalytics"
                    checked={formData.canAccessContractAnalytics}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessContractAnalytics: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-contract-analytics"
                  />
                  <Label htmlFor="create-canAccessContractAnalytics" className="text-sm font-normal cursor-pointer">
                    Contract Analytics Report
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessCollectionPerformance"
                    checked={formData.canAccessCollectionPerformance}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessCollectionPerformance: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-collection-performance"
                  />
                  <Label htmlFor="create-canAccessCollectionPerformance" className="text-sm font-normal cursor-pointer">
                    Collection Performance Report
                  </Label>
                </div>
              </div>
              
              {/* Standard Reports Group */}
              <div className="space-y-2 pl-2 border-l-2">
                <Label className="text-xs font-medium text-muted-foreground">Standard Reports</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessFinancialReports"
                    checked={formData.canAccessFinancialReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessFinancialReports: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-financial-reports"
                  />
                  <Label htmlFor="create-canAccessFinancialReports" className="text-sm font-normal cursor-pointer">
                    Financial Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessOperationalReports"
                    checked={formData.canAccessOperationalReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessOperationalReports: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-operational-reports"
                  />
                  <Label htmlFor="create-canAccessOperationalReports" className="text-sm font-normal cursor-pointer">
                    Operational Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessCustomerReports"
                    checked={formData.canAccessCustomerReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessCustomerReports: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-customer-reports"
                  />
                  <Label htmlFor="create-canAccessCustomerReports" className="text-sm font-normal cursor-pointer">
                    Customer Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessInsuranceReports"
                    checked={formData.canAccessInsuranceReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessInsuranceReports: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-insurance-reports"
                  />
                  <Label htmlFor="create-canAccessInsuranceReports" className="text-sm font-normal cursor-pointer">
                    Insurance Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessAuditReports"
                    checked={formData.canAccessAuditReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessAuditReports: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-audit-reports"
                  />
                  <Label htmlFor="create-canAccessAuditReports" className="text-sm font-normal cursor-pointer">
                    Audit Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-canAccessUserActivityReports"
                    checked={formData.canAccessUserActivityReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessUserActivityReports: checked as boolean })
                    }
                    data-testid="checkbox-create-can-access-user-activity-reports"
                  />
                  <Label htmlFor="create-canAccessUserActivityReports" className="text-sm font-normal cursor-pointer">
                    User Activity Reports
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel-create"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
                data-testid="button-submit-create"
              >
                {t('common.create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-user">
          <DialogHeader>
            <DialogTitle>{t('users.editUser')}</DialogTitle>
            <DialogDescription>Username: {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">{t('users.firstName')}</Label>
              <Input
                id="edit-firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                data-testid="input-edit-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">{t('users.lastName')}</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                data-testid="input-edit-lastname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('users.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-edit-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t('users.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={selectedUser?.isImmutable}
              >
                <SelectTrigger data-testid="select-edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('role.admin')}</SelectItem>
                  <SelectItem value="manager">{t('role.manager')}</SelectItem>
                  <SelectItem value="staff">{t('role.staff')}</SelectItem>
                  <SelectItem value="viewer">{t('role.viewer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Permission Toggles */}
            <div className="space-y-3 border-t pt-3">
              <Label className="text-sm font-semibold">{t('users.permissions')}</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canAccessReports"
                  checked={formData.canAccessReports}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canAccessReports: checked as boolean })
                  }
                  data-testid="checkbox-can-access-reports"
                />
                <Label htmlFor="canAccessReports" className="text-sm font-normal cursor-pointer">
                  {t('users.canAccessReports')}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canCloseContracts"
                  checked={formData.canCloseContracts}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canCloseContracts: checked as boolean })
                  }
                  data-testid="checkbox-can-close-contracts"
                />
                <Label htmlFor="canCloseContracts" className="text-sm font-normal cursor-pointer">
                  {t('users.canCloseContracts')}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canViewAllContracts"
                  checked={formData.canViewAllContracts}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canViewAllContracts: checked as boolean })
                  }
                  data-testid="checkbox-can-view-all-contracts"
                />
                <Label htmlFor="canViewAllContracts" className="text-sm font-normal cursor-pointer">
                  {t('users.canViewAllContracts')}
                </Label>
              </div>
            </div>
            
            {/* Granular Report Permissions */}
            <div className="space-y-3 border-t pt-3">
              <Label className="text-sm font-semibold">Granular Report Permissions</Label>
              <p className="text-xs text-muted-foreground">Grant access to specific reports individually (Admin/Manager always have full access)</p>
              
              {/* Analytical Reports Group */}
              <div className="space-y-2 pl-2 border-l-2">
                <Label className="text-xs font-medium text-muted-foreground">Analytical Reports</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessRevenueTrends"
                    checked={formData.canAccessRevenueTrends}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessRevenueTrends: checked as boolean })
                    }
                    data-testid="checkbox-can-access-revenue-trends"
                  />
                  <Label htmlFor="canAccessRevenueTrends" className="text-sm font-normal cursor-pointer">
                    Revenue Trends Report
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessFleetPerformance"
                    checked={formData.canAccessFleetPerformance}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessFleetPerformance: checked as boolean })
                    }
                    data-testid="checkbox-can-access-fleet-performance"
                  />
                  <Label htmlFor="canAccessFleetPerformance" className="text-sm font-normal cursor-pointer">
                    Fleet Performance Report
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessContractAnalytics"
                    checked={formData.canAccessContractAnalytics}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessContractAnalytics: checked as boolean })
                    }
                    data-testid="checkbox-can-access-contract-analytics"
                  />
                  <Label htmlFor="canAccessContractAnalytics" className="text-sm font-normal cursor-pointer">
                    Contract Analytics Report
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessCollectionPerformance"
                    checked={formData.canAccessCollectionPerformance}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessCollectionPerformance: checked as boolean })
                    }
                    data-testid="checkbox-can-access-collection-performance"
                  />
                  <Label htmlFor="canAccessCollectionPerformance" className="text-sm font-normal cursor-pointer">
                    Collection Performance Report
                  </Label>
                </div>
              </div>
              
              {/* Standard Reports Group */}
              <div className="space-y-2 pl-2 border-l-2">
                <Label className="text-xs font-medium text-muted-foreground">Standard Reports</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessFinancialReports"
                    checked={formData.canAccessFinancialReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessFinancialReports: checked as boolean })
                    }
                    data-testid="checkbox-can-access-financial-reports"
                  />
                  <Label htmlFor="canAccessFinancialReports" className="text-sm font-normal cursor-pointer">
                    Financial Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessOperationalReports"
                    checked={formData.canAccessOperationalReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessOperationalReports: checked as boolean })
                    }
                    data-testid="checkbox-can-access-operational-reports"
                  />
                  <Label htmlFor="canAccessOperationalReports" className="text-sm font-normal cursor-pointer">
                    Operational Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessCustomerReports"
                    checked={formData.canAccessCustomerReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessCustomerReports: checked as boolean })
                    }
                    data-testid="checkbox-can-access-customer-reports"
                  />
                  <Label htmlFor="canAccessCustomerReports" className="text-sm font-normal cursor-pointer">
                    Customer Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessInsuranceReports"
                    checked={formData.canAccessInsuranceReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessInsuranceReports: checked as boolean })
                    }
                    data-testid="checkbox-can-access-insurance-reports"
                  />
                  <Label htmlFor="canAccessInsuranceReports" className="text-sm font-normal cursor-pointer">
                    Insurance Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessAuditReports"
                    checked={formData.canAccessAuditReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessAuditReports: checked as boolean })
                    }
                    data-testid="checkbox-can-access-audit-reports"
                  />
                  <Label htmlFor="canAccessAuditReports" className="text-sm font-normal cursor-pointer">
                    Audit Reports
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAccessUserActivityReports"
                    checked={formData.canAccessUserActivityReports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canAccessUserActivityReports: checked as boolean })
                    }
                    data-testid="checkbox-can-access-user-activity-reports"
                  />
                  <Label htmlFor="canAccessUserActivityReports" className="text-sm font-normal cursor-pointer">
                    User Activity Reports
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">{t('users.password')} (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                data-testid="input-edit-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-confirmPassword">{t('users.confirmPassword')}</Label>
              <Input
                id="edit-confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                data-testid="input-edit-confirm-password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel-edit"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={updateUserMutation.isPending}
                data-testid="button-submit-edit"
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable User Dialog */}
      <AlertDialog open={isDisableDialogOpen} onOpenChange={setIsDisableDialogOpen}>
        <AlertDialogContent data-testid="dialog-disable-user">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.disableUser')}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isImmutable
                ? t('users.cannotDisableSuperAdmin')
                : t('users.confirmDisableUser')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disable">
              {t('common.cancel')}
            </AlertDialogCancel>
            {!selectedUser?.isImmutable && (
              <AlertDialogAction
                onClick={handleDisableUser}
                disabled={disableUserMutation.isPending}
                data-testid="button-confirm-disable"
              >
                {t('users.disableUser')}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable User Dialog */}
      <AlertDialog open={isEnableDialogOpen} onOpenChange={setIsEnableDialogOpen}>
        <AlertDialogContent data-testid="dialog-enable-user">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.enableUser')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.confirmEnableUser')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enable">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableUser}
              disabled={enableUserMutation.isPending}
              data-testid="button-confirm-enable"
            >
              {t('users.enableUser')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
