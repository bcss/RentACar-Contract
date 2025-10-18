import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Customer } from '@shared/schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const customerSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nationalId: z.string().min(1, 'National ID is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  licenseNumber: z.string().optional(),
  licenseExpiryDate: z.coerce.date().optional().nullable(),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function Customers() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nameEn: '',
      nameAr: '',
      nationalId: '',
      phone: '',
      email: '',
      licenseNumber: '',
      licenseExpiryDate: null,
      address: '',
    },
  });

  const { data: activeCustomers = [], isLoading: activeLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers', 'active'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/customers?disabled=false');
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
  });

  const { data: disabledCustomers = [], isLoading: disabledLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers', 'disabled'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/customers?disabled=true');
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return apiRequest('POST', '/api/customers', {
        ...data,
        licenseExpiryDate: data.licenseExpiryDate || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: t('common.success'),
        description: t('customers.customerCreated'),
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
    mutationFn: async (data: CustomerFormData) => {
      if (!selectedCustomer) throw new Error('No customer selected');
      return apiRequest('PATCH', `/api/customers/${selectedCustomer.id}`, {
        ...data,
        licenseExpiryDate: data.licenseExpiryDate || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: t('common.success'),
        description: t('customers.customerUpdated'),
      });
      setEditOpen(false);
      setSelectedCustomer(null);
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
    mutationFn: async (customerId: string) => {
      return apiRequest('POST', `/api/customers/${customerId}/disable`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: t('common.success'),
        description: t('customers.customerDisabled'),
      });
      setDisableDialogOpen(false);
      setCustomerToToggle(null);
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
    mutationFn: async (customerId: string) => {
      return apiRequest('POST', `/api/customers/${customerId}/enable`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: t('common.success'),
        description: t('customers.customerEnabled'),
      });
      setEnableDialogOpen(false);
      setCustomerToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreate = (data: CustomerFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.reset({
      nameEn: customer.nameEn ?? '',
      nameAr: customer.nameAr ?? '',
      nationalId: customer.nationalId ?? '',
      phone: customer.phone ?? '',
      email: customer.email || '',
      licenseNumber: customer.licenseNumber || '',
      licenseExpiryDate: customer.licenseExpiryDate ? new Date(customer.licenseExpiryDate) : undefined,
      address: customer.address || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = (data: CustomerFormData) => {
    updateMutation.mutate(data);
  };

  const handleDisableClick = (customer: Customer) => {
    setCustomerToToggle(customer);
    setDisableDialogOpen(true);
  };

  const handleEnableClick = (customer: Customer) => {
    setCustomerToToggle(customer);
    setEnableDialogOpen(true);
  };

  const handleDisableConfirm = () => {
    if (customerToToggle) {
      disableMutation.mutate(customerToToggle.id);
    }
  };

  const handleEnableConfirm = () => {
    if (customerToToggle) {
      enableMutation.mutate(customerToToggle.id);
    }
  };

  const filterCustomers = (customers: Customer[]) => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.nameEn?.toLowerCase().includes(query) ||
        c.nameAr?.toLowerCase().includes(query) ||
        c.nationalId?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
    );
  };

  const filteredActiveCustomers = filterCustomers(activeCustomers);
  const filteredDisabledCustomers = filterCustomers(disabledCustomers);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="loading-customers">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === 'admin';

  const CustomerForm = ({ onSubmit, isPending }: { onSubmit: (data: CustomerFormData) => void; isPending: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.nameEn')}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-name-en" />
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
                <FormLabel>{t('customers.nameAr')}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-name-ar" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="nationalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('customers.nationalId')}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-customer-national-id" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.phone')}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.email')}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" data-testid="input-customer-email" />
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
                <FormLabel>{t('customers.licenseNumber')}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-license-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="licenseExpiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customers.licenseExpiry')}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    data-testid="input-customer-license-expiry"
                  />
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
              <FormLabel>{t('customers.address')}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-customer-address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isPending} data-testid="button-submit-customer">
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  const CustomerTable = ({ customers, showActions }: { customers: Customer[]; showActions: 'disable' | 'enable' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('customers.name')}</TableHead>
          <TableHead>{t('customers.nationalId')}</TableHead>
          <TableHead>{t('customers.phone')}</TableHead>
          <TableHead>{t('customers.email')}</TableHead>
          <TableHead>{t('customers.licenseNumber')}</TableHead>
          <TableHead>{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              {t('customers.noCustomers')}
            </TableCell>
          </TableRow>
        ) : (
          customers.map((customer) => (
            <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
              <TableCell className="font-medium">
                <div>{customer.nameEn}</div>
                <div className="text-sm text-muted-foreground">{customer.nameAr}</div>
              </TableCell>
              <TableCell>{customer.nationalId}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.email || '-'}</TableCell>
              <TableCell>{customer.licenseNumber || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(customer)}
                    data-testid={`button-edit-customer-${customer.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {isAdmin && showActions === 'disable' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisableClick(customer)}
                      data-testid={`button-disable-customer-${customer.id}`}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                  {isAdmin && showActions === 'enable' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnableClick(customer)}
                      data-testid={`button-enable-customer-${customer.id}`}
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
    <div className="container mx-auto p-6" data-testid="page-customers">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('customers.title')}</CardTitle>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-customer">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('customers.addCustomer')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('customers.newCustomer')}</DialogTitle>
                  <DialogDescription>
                    {t('customers.addCustomer')}
                  </DialogDescription>
                </DialogHeader>
                <CustomerForm onSubmit={handleCreate} isPending={createMutation.isPending} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('customers.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-customers"
              />
            </div>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active" data-testid="tab-active-customers">
                {t('customers.activeCustomers')} ({activeCustomers.length})
              </TabsTrigger>
              <TabsTrigger value="disabled" data-testid="tab-disabled-customers">
                {t('customers.disabledCustomers')} ({disabledCustomers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <CustomerTable customers={filteredActiveCustomers} showActions="disable" />
              )}
            </TabsContent>

            <TabsContent value="disabled">
              {disabledLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <CustomerTable customers={filteredDisabledCustomers} showActions="enable" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('customers.editCustomer')}</DialogTitle>
            <DialogDescription>
              {t('customers.editCustomer')}
            </DialogDescription>
          </DialogHeader>
          <CustomerForm onSubmit={handleUpdate} isPending={updateMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.disableCustomer')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('customers.confirmDisableCustomer')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disable-customer">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              data-testid="button-confirm-disable-customer"
            >
              {t('customers.disableCustomer')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable Confirmation */}
      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.enableCustomer')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('customers.confirmEnableCustomer')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enable-customer">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableConfirm}
              data-testid="button-confirm-enable-customer"
            >
              {t('customers.enableCustomer')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
