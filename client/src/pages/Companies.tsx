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
import type { Company } from '@shared/schema';
import { insertCompanySchema } from '@shared/schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

type CompanyFormData = z.infer<typeof insertCompanySchema>;

export default function Companies() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [companyToToggle, setCompanyToToggle] = useState<Company | null>(null);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      nameEn: '',
      nameAr: '',
      registrationNumber: '',
      registrationValidity: undefined,
      taxId: '',
      taxValidity: undefined,
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },
  });

  const { data: activeCompanies = [], isLoading: activeLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies', 'active'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/companies?disabled=false');
      if (!res.ok) throw new Error('Failed to fetch companies');
      return res.json();
    },
  });

  const { data: disabledCompanies = [], isLoading: disabledLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies', 'disabled'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/companies?disabled=true');
      if (!res.ok) throw new Error('Failed to fetch companies');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return apiRequest('POST', '/api/companies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: t('common.success'),
        description: t('companies.companyCreated'),
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
    mutationFn: async (data: CompanyFormData) => {
      if (!selectedCompany) throw new Error('No company selected');
      return apiRequest('PATCH', `/api/companies/${selectedCompany.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: t('common.success'),
        description: t('companies.companyUpdated'),
      });
      setEditOpen(false);
      setSelectedCompany(null);
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
    mutationFn: async (companyId: string) => {
      return apiRequest('PATCH', `/api/companies/${companyId}/disable`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: t('common.success'),
        description: t('companies.companyDisabled'),
      });
      setDisableDialogOpen(false);
      setCompanyToToggle(null);
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
    mutationFn: async (companyId: string) => {
      return apiRequest('PATCH', `/api/companies/${companyId}/enable`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: t('common.success'),
        description: t('companies.companyEnabled'),
      });
      setEnableDialogOpen(false);
      setCompanyToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreate = (data: CompanyFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    form.reset({
      nameEn: company.nameEn ?? '',
      nameAr: company.nameAr || '',
      registrationNumber: company.registrationNumber || '',
      registrationValidity: company.registrationValidity || undefined,
      taxId: company.taxId || '',
      taxValidity: company.taxValidity || undefined,
      contactPerson: company.contactPerson || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      notes: company.notes || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = (data: CompanyFormData) => {
    updateMutation.mutate(data);
  };

  const handleDisableClick = (company: Company) => {
    setCompanyToToggle(company);
    setDisableDialogOpen(true);
  };

  const handleEnableClick = (company: Company) => {
    setCompanyToToggle(company);
    setEnableDialogOpen(true);
  };

  const handleDisableConfirm = () => {
    if (companyToToggle) {
      disableMutation.mutate(companyToToggle.id);
    }
  };

  const handleEnableConfirm = () => {
    if (companyToToggle) {
      enableMutation.mutate(companyToToggle.id);
    }
  };

  const filterCompanies = (companies: Company[]) => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.nameEn?.toLowerCase().includes(query) ||
        c.nameAr?.toLowerCase().includes(query) ||
        c.registrationNumber?.toLowerCase().includes(query) ||
        c.taxId?.toLowerCase().includes(query) ||
        c.contactPerson?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
    );
  };

  const filteredActiveCompanies = filterCompanies(activeCompanies);
  const filteredDisabledCompanies = filterCompanies(disabledCompanies);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="loading-companies">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t('companies.title')}</h1>
        </div>
        {isManagerOrAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-company">
                <Plus className="w-4 h-4 mr-2" />
                {t('companies.addCompany')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('companies.newCompany')}</DialogTitle>
                <DialogDescription>
                  {t('companies.addCompany')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companies.nameEn')}</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-nameEn" />
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
                          <FormLabel>{t('companies.nameAr')}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} className="font-arabic" data-testid="input-nameAr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companies.registrationNumber')}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} data-testid="input-registrationNumber" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="registrationValidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companies.registrationValidity')}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              data-testid="input-registrationValidity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companies.taxId')}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} data-testid="input-taxId" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxValidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companies.taxValidity')}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              data-testid="input-taxValidity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companies.contactPerson')}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} data-testid="input-contactPerson" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companies.phone')}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('companies.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ''} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('companies.address')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} data-testid="input-address" />
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
                        <FormLabel>{t('companies.notes')}</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel">
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                      {createMutation.isPending ? t('common.saving') : t('common.save')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t('companies.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-companies"
        />
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active-companies">
            {t('companies.activeCompanies')} ({filteredActiveCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="disabled" data-testid="tab-disabled-companies">
            {t('companies.disabledCompanies')} ({filteredDisabledCompanies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('companies.activeCompanies')}</CardTitle>
            </CardHeader>
            <CardContent>
              {activeLoading ? (
                <div className="text-center py-8" data-testid="loading-active-companies">{t('common.loading')}</div>
              ) : filteredActiveCompanies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-companies">
                  {t('companies.noCompanies')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('companies.nameEn')}</TableHead>
                      <TableHead>{t('companies.nameAr')}</TableHead>
                      <TableHead>{t('companies.registrationNumber')}</TableHead>
                      <TableHead>{t('companies.contactPerson')}</TableHead>
                      <TableHead>{t('companies.phone')}</TableHead>
                      <TableHead className="text-right">{t('companies.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActiveCompanies.map((company) => (
                      <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                        <TableCell className="font-medium">{company.nameEn}</TableCell>
                        <TableCell className="font-arabic">{company.nameAr || '-'}</TableCell>
                        <TableCell>{company.registrationNumber || '-'}</TableCell>
                        <TableCell>{company.contactPerson || '-'}</TableCell>
                        <TableCell>{company.phone || '-'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          {isManagerOrAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(company)}
                              data-testid={`button-edit-${company.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisableClick(company)}
                              data-testid={`button-disable-${company.id}`}
                            >
                              <Ban className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="disabled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('companies.disabledCompanies')}</CardTitle>
            </CardHeader>
            <CardContent>
              {disabledLoading ? (
                <div className="text-center py-8" data-testid="loading-disabled-companies">{t('common.loading')}</div>
              ) : filteredDisabledCompanies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-disabled-companies">
                  {t('companies.noCompanies')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('companies.nameEn')}</TableHead>
                      <TableHead>{t('companies.nameAr')}</TableHead>
                      <TableHead>{t('companies.registrationNumber')}</TableHead>
                      <TableHead>{t('companies.contactPerson')}</TableHead>
                      <TableHead>{t('companies.phone')}</TableHead>
                      <TableHead className="text-right">{t('companies.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisabledCompanies.map((company) => (
                      <TableRow key={company.id} data-testid={`row-disabled-company-${company.id}`}>
                        <TableCell className="font-medium">{company.nameEn}</TableCell>
                        <TableCell className="font-arabic">{company.nameAr || '-'}</TableCell>
                        <TableCell>{company.registrationNumber || '-'}</TableCell>
                        <TableCell>{company.contactPerson || '-'}</TableCell>
                        <TableCell>{company.phone || '-'}</TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEnableClick(company)}
                              data-testid={`button-enable-${company.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
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
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('companies.editCompany')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('companies.nameEn')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-nameEn" />
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
                      <FormLabel>{t('companies.nameAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} className="font-arabic" data-testid="input-edit-nameAr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('companies.registrationNumber')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-edit-registrationNumber" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationValidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('companies.registrationValidity')}</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-edit-registrationValidity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('companies.taxId')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-edit-taxId" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxValidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('companies.taxValidity')}</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-edit-taxValidity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('companies.contactPerson')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-edit-contactPerson" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('companies.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-edit-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value || ''} data-testid="input-edit-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companies.address')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} data-testid="input-edit-address" />
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
                    <FormLabel>{t('companies.notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} data-testid="input-edit-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('companies.disableCompany')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('companies.confirmDisableCompany')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disable">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              disabled={disableMutation.isPending}
              data-testid="button-confirm-disable"
            >
              {disableMutation.isPending ? t('common.saving') : t('companies.disableCompany')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable Confirmation Dialog */}
      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('companies.enableCompany')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('companies.confirmEnableCompany')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enable">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableConfirm}
              disabled={enableMutation.isPending}
              data-testid="button-confirm-enable"
            >
              {enableMutation.isPending ? t('common.saving') : t('companies.enableCompany')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
