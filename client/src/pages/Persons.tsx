import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
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
        title: 'Success',
        description: 'Person created successfully',
      });
      setCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
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
        title: 'Success',
        description: 'Person updated successfully',
      });
      setEditOpen(false);
      setSelectedPerson(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
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
        title: 'Success',
        description: 'Person disabled successfully',
      });
      setDisableDialogOpen(false);
      setPersonToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
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
        title: 'Success',
        description: 'Person enabled successfully',
      });
      setEnableDialogOpen(false);
      setPersonToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
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
                <FormLabel>Name (English) / الاسم (إنجليزي)</FormLabel>
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
                <FormLabel>Name (Arabic) / الاسم (عربي)</FormLabel>
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
                <FormLabel>Nationality / الجنسية</FormLabel>
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
                <FormLabel>Passport ID / رقم الجواز</FormLabel>
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
                <FormLabel>License Number / رقم الرخصة</FormLabel>
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
                <FormLabel>Mobile / الجوال</FormLabel>
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
              <FormLabel>Address / العنوان</FormLabel>
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
              <FormLabel>Relation / العلاقة</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="e.g., Employer, Family Member" data-testid="input-person-relation" />
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
              <FormLabel>Notes / ملاحظات</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} data-testid="input-person-notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isPending} data-testid="button-submit-person">
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  const PersonTable = ({ persons, showActions }: { persons: Person[]; showActions: 'disable' | 'enable' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name (En) / الاسم (إنجليزي)</TableHead>
          <TableHead>Name (Ar) / الاسم (عربي)</TableHead>
          <TableHead>Nationality / الجنسية</TableHead>
          <TableHead>Passport ID / رقم الجواز</TableHead>
          <TableHead>License / الرخصة</TableHead>
          <TableHead>Mobile / الجوال</TableHead>
          <TableHead>Relation / العلاقة</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {persons.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              No persons found
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
            <CardTitle>Persons Management / إدارة الأشخاص</CardTitle>
            {canManage && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-person">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Person / إضافة شخص
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>New Person / شخص جديد</DialogTitle>
                    <DialogDescription>
                      Add a new person (sponsor or driver) / إضافة شخص جديد (كفيل أو سائق)
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
                placeholder="Search persons... / البحث عن أشخاص..."
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
                Active / نشط ({activePersons.length})
              </TabsTrigger>
              <TabsTrigger value="disabled" data-testid="tab-disabled-persons">
                Disabled / معطل ({disabledPersons.length})
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
            <DialogTitle>Edit Person / تحرير شخص</DialogTitle>
            <DialogDescription>
              Update person information / تحديث معلومات الشخص
            </DialogDescription>
          </DialogHeader>
          <PersonForm onSubmit={handleUpdate} isPending={updateMutation.isPending} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Person / تعطيل شخص</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable this person? They will be moved to the disabled tab.
              <br />
              هل أنت متأكد من تعطيل هذا الشخص؟ سيتم نقله إلى علامة التبويب المعطلة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disable">Cancel / إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              data-testid="button-confirm-disable"
            >
              Disable / تعطيل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Person / تفعيل شخص</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to enable this person? They will be moved to the active tab.
              <br />
              هل أنت متأكد من تفعيل هذا الشخص؟ سيتم نقله إلى علامة التبويب النشطة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enable">Cancel / إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableConfirm}
              data-testid="button-confirm-enable"
            >
              Enable / تفعيل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
