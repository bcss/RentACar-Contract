import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit, Ban, CheckCircle } from 'lucide-react';
import type { Person } from '@shared/schema';
import { insertPersonSchema } from '@shared/schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type PersonFormData = z.infer<typeof insertPersonSchema>;

export default function Persons() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [personToToggle, setPersonToToggle] = useState<Person | null>(null);

  const form = useForm<PersonFormData>({
    resolver: zodResolver(insertPersonSchema),
    defaultValues: {
      nameEn: '',
      nameAr: '',
      nationality: '',
      passportId: '',
      licenseNumber: '',
      mobile: '',
      address: '',
      relation: '',
      notes: '',
    },
  });

  const { data: activePersons = [], isLoading: activeLoading } = useQuery<Person[]>({
    queryKey: ['/api/persons', 'active'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/persons?disabled=false');
      if (!res.ok) throw new Error('Failed to fetch persons');
      return res.json();
    },
  });

  const { data: disabledPersons = [], isLoading: disabledLoading } = useQuery<Person[]>({
    queryKey: ['/api/persons', 'disabled'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/persons?disabled=true');
      if (!res.ok) throw new Error('Failed to fetch persons');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PersonFormData) => {
      return apiRequest('POST', '/api/persons', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      toast({
        title: t('common.success'),
        description: t('persons.personCreated'),
      });
      setCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PersonFormData) => {
      if (!selectedPerson) throw new Error('No person selected');
      return apiRequest('PATCH', `/api/persons/${selectedPerson.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      toast({
        title: t('common.success'),
        description: t('persons.personUpdated'),
      });
      setEditOpen(false);
      setSelectedPerson(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (personId: string) => {
      return apiRequest('PATCH', `/api/persons/${personId}/disable`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      toast({
        title: t('common.success'),
        description: t('persons.personDisabled'),
      });
      setDisableDialogOpen(false);
      setPersonToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const enableMutation = useMutation({
    mutationFn: async (personId: string) => {
      return apiRequest('PATCH', `/api/persons/${personId}/enable`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/persons'] });
      toast({
        title: t('common.success'),
        description: t('persons.personEnabled'),
      });
      setEnableDialogOpen(false);
      setPersonToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreate = (data: PersonFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    form.reset({
      nameEn: person.nameEn ?? '',
      nameAr: person.nameAr || '',
      nationality: person.nationality || '',
      passportId: person.passportId || '',
      licenseNumber: person.licenseNumber || '',
      mobile: person.mobile || '',
      address: person.address || '',
      relation: person.relation || '',
      notes: person.notes || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = (data: PersonFormData) => {
    updateMutation.mutate(data);
  };

  const handleDisableClick = (person: Person) => {
    setPersonToToggle(person);
    setDisableDialogOpen(true);
  };

  const handleEnableClick = (person: Person) => {
    setPersonToToggle(person);
    setEnableDialogOpen(true);
  };

  const handleDisableConfirm = () => {
    if (personToToggle) {
      disableMutation.mutate(personToToggle.id);
    }
  };

  const handleEnableConfirm = () => {
    if (personToToggle) {
      enableMutation.mutate(personToToggle.id);
    }
  };

  const filterPersons = (persons: Person[]) => {
    if (!searchQuery.trim()) return persons;
    const query = searchQuery.toLowerCase();
    return persons.filter(
      (p) =>
        p.nameEn?.toLowerCase().includes(query) ||
        p.nameAr?.toLowerCase().includes(query) ||
        p.passportId?.toLowerCase().includes(query) ||
        p.mobile?.toLowerCase().includes(query) ||
        p.nationality?.toLowerCase().includes(query)
    );
  };

  const filteredActivePersons = filterPersons(activePersons);
  const filteredDisabledPersons = filterPersons(disabledPersons);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="loading-persons">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const PersonForm = ({ onSubmit, isPending }: { onSubmit: (data: PersonFormData) => void; isPending: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('persons.nameEn')}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-person-name-en" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nameAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('persons.nameAr')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} data-testid="input-person-name-ar" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('persons.nationality')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} data-testid="input-person-nationality" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passportId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('persons.passportId')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} data-testid="input-person-passport-id" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('persons.licenseNumber')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} data-testid="input-person-license-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('persons.mobile')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} data-testid="input-person-mobile" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('persons.address')}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} data-testid="input-person-address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="relation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('persons.relation')}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder={t('persons.relationPlaceholder')} data-testid="input-person-relation" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.notes')}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} data-testid="input-person-notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isPending} data-testid="button-submit-person">
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  const PersonTable = ({ persons, showActions }: { persons: Person[]; showActions: 'disable' | 'enable' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('persons.nameEn')}</TableHead>
          <TableHead>{t('persons.nameAr')}</TableHead>
          <TableHead>{t('persons.nationality')}</TableHead>
          <TableHead>{t('persons.passportId')}</TableHead>
          <TableHead>{t('persons.licenseNumber')}</TableHead>
          <TableHead>{t('persons.mobile')}</TableHead>
          <TableHead>{t('persons.relation')}</TableHead>
          <TableHead>{t('persons.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              {t('persons.noPersons')}
            </TableCell>
          </TableRow>
        ) : (
          persons.map((person) => (
            <TableRow key={person.id} data-testid={`row-person-${person.id}`}>
              <TableCell className="font-medium" data-testid={`text-person-name-en-${person.id}`}>
                {person.nameEn}
              </TableCell>
              <TableCell data-testid={`text-person-name-ar-${person.id}`}>
                {person.nameAr || '-'}
              </TableCell>
              <TableCell data-testid={`text-person-nationality-${person.id}`}>
                {person.nationality || '-'}
              </TableCell>
              <TableCell data-testid={`text-person-passport-id-${person.id}`}>
                {person.passportId || '-'}
              </TableCell>
              <TableCell data-testid={`text-person-license-${person.id}`}>
                {person.licenseNumber || '-'}
              </TableCell>
              <TableCell data-testid={`text-person-mobile-${person.id}`}>
                {person.mobile || '-'}
              </TableCell>
              <TableCell data-testid={`text-person-relation-${person.id}`}>
                {person.relation || '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(person)}
                      data-testid={`button-edit-person-${person.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canManage && showActions === 'disable' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisableClick(person)}
                      data-testid={`button-disable-person-${person.id}`}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                  {canManage && showActions === 'enable' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnableClick(person)}
                      data-testid={`button-enable-person-${person.id}`}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto p-6" data-testid="page-persons">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('persons.title')}</CardTitle>
            {canManage && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-person">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('persons.addPerson')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('persons.newPerson')}</DialogTitle>
                    <DialogDescription>
                      {t('persons.addPerson')}
                    </DialogDescription>
                  </DialogHeader>
                  <PersonForm onSubmit={handleCreate} isPending={createMutation.isPending} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('persons.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-persons"
              />
            </div>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active" data-testid="tab-active-persons">
                {t('persons.activePersons')} ({activePersons.length})
              </TabsTrigger>
              <TabsTrigger value="disabled" data-testid="tab-disabled-persons">
                {t('persons.disabledPersons')} ({disabledPersons.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PersonTable persons={filteredActivePersons} showActions="disable" />
              )}
            </TabsContent>

            <TabsContent value="disabled">
              {disabledLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PersonTable persons={filteredDisabledPersons} showActions="enable" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('persons.editPerson')}</DialogTitle>
            <DialogDescription>
              {t('persons.personUpdated')}
            </DialogDescription>
          </DialogHeader>
          <PersonForm onSubmit={handleUpdate} isPending={updateMutation.isPending} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('persons.disablePerson')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('persons.confirmDisablePerson')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disable">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              data-testid="button-confirm-disable"
            >
              {t('persons.disablePerson')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('persons.enablePerson')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('persons.confirmEnablePerson')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enable">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableConfirm}
              data-testid="button-confirm-enable"
            >
              {t('persons.enablePerson')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
