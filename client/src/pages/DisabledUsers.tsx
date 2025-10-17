import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function DisabledUsers() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/disabled'],
  });

  const enableUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/users/${id}/enable`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/disabled'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
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

  const handleEnableUser = () => {
    if (selectedUser) {
      enableUserMutation.mutate(selectedUser.id);
    }
  };

  const openEnableDialog = (user: User) => {
    setSelectedUser(user);
    setIsEnableDialogOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const search = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      (user.firstName && user.firstName.toLowerCase().includes(search)) ||
      (user.lastName && user.lastName.toLowerCase().includes(search))
    );
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">{t('users.disabledUsers')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t('users.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-disabled-users"
          />

          {isLoading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noResults')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.username')}</TableHead>
                  <TableHead>{t('users.name')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('users.disabledAt')}</TableHead>
                  <TableHead className="text-right">{t('contracts.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-disabled-user-${user.id}`}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : '-'}
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{t(`role.${user.role}`)}</TableCell>
                    <TableCell>
                      {user.disabledAt ? new Date(user.disabledAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEnableDialog(user)}
                        data-testid={`button-enable-user-${user.id}`}
                      >
                        <span className="material-icons text-base">check_circle</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
