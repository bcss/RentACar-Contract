import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { insertContractSchema, type InsertContract, type Contract, type CompanySettings } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { isUnauthorizedError } from '@/lib/authUtils';

export default function ContractForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params.id && params.id !== 'new';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t('common.error'),
        description: t('msg.noPermission'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast, t]);

  const { data: existingContract, isLoading: contractLoading } = useQuery<Contract>({
    queryKey: ['/api/contracts', params.id],
    enabled: isEditing && isAuthenticated,
  });

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated,
  });

  const form = useForm<InsertContract>({
    resolver: zodResolver(insertContractSchema),
    defaultValues: {
      status: 'draft',
      hirerType: 'direct',
      customerNameEn: '',
      customerNameAr: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      licenseNumber: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      vehiclePlate: '',
      vehicleVin: '',
      rentalStartDate: new Date(),
      rentalEndDate: new Date(),
      rentalType: 'daily',
      pickupLocation: '',
      dropoffLocation: '',
      dailyRate: '',
      totalDays: 1,
      totalAmount: '',
      notes: '',
      termsAccepted: false,
      createdBy: '',
    },
  });

  // Watch the hirerType from form state
  const hirerType = form.watch('hirerType') || 'direct';

  useEffect(() => {
    if (existingContract) {
      form.reset({
        ...existingContract,
        rentalStartDate: new Date(existingContract.rentalStartDate),
        rentalEndDate: new Date(existingContract.rentalEndDate),
        dateOfBirth: existingContract.dateOfBirth ? new Date(existingContract.dateOfBirth) : undefined,
        licenseIssueDate: existingContract.licenseIssueDate ? new Date(existingContract.licenseIssueDate) : undefined,
        licenseExpiryDate: existingContract.licenseExpiryDate ? new Date(existingContract.licenseExpiryDate) : undefined,
        depositPaidDate: existingContract.depositPaidDate ? new Date(existingContract.depositPaidDate) : undefined,
        depositRefundedDate: existingContract.depositRefundedDate ? new Date(existingContract.depositRefundedDate) : undefined,
        finalPaymentDate: existingContract.finalPaymentDate ? new Date(existingContract.finalPaymentDate) : undefined,
        confirmedAt: existingContract.confirmedAt ? new Date(existingContract.confirmedAt) : undefined,
        activatedAt: existingContract.activatedAt ? new Date(existingContract.activatedAt) : undefined,
        completedAt: existingContract.completedAt ? new Date(existingContract.completedAt) : undefined,
        closedAt: existingContract.closedAt ? new Date(existingContract.closedAt) : undefined,
      } as InsertContract);
    }
  }, [existingContract, form]);

  // Auto-calculate totalDays from date range
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'rentalStartDate' || name === 'rentalEndDate') {
        const startDate = value.rentalStartDate;
        const endDate = value.rentalEndDate;
        
        if (startDate instanceof Date && !isNaN(startDate.getTime()) && 
            endDate instanceof Date && !isNaN(endDate.getTime())) {
          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const totalDays = Math.max(1, diffDays); // Minimum 1 day
          form.setValue('totalDays', totalDays);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-calculate subtotal from rate and days
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'dailyRate' || name === 'weeklyRate' || name === 'monthlyRate' || 
          name === 'rentalType' || name === 'totalDays') {
        const rentalType = value.rentalType || 'daily';
        const totalDays = value.totalDays || 1;
        let subtotal = 0;

        if (rentalType === 'daily' && value.dailyRate) {
          const rate = parseFloat(value.dailyRate);
          if (!isNaN(rate)) {
            subtotal = rate * totalDays;
          }
        } else if (rentalType === 'weekly' && value.weeklyRate) {
          const rate = parseFloat(value.weeklyRate);
          if (!isNaN(rate)) {
            const weeks = Math.ceil(totalDays / 7);
            subtotal = rate * weeks;
          }
        } else if (rentalType === 'monthly' && value.monthlyRate) {
          const rate = parseFloat(value.monthlyRate);
          if (!isNaN(rate)) {
            const months = Math.ceil(totalDays / 30);
            subtotal = rate * months;
          }
        }

        if (subtotal > 0) {
          form.setValue('subtotal', subtotal.toFixed(2));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-calculate VAT amount from subtotal
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'subtotal') {
        const subtotalValue = value.subtotal;
        const vatPercentage = settings?.vatPercentage || '5';
        
        if (subtotalValue) {
          const subtotalNum = parseFloat(subtotalValue);
          const vatRate = parseFloat(vatPercentage);
          
          if (!isNaN(subtotalNum) && !isNaN(vatRate)) {
            const vatAmount = subtotalNum * (vatRate / 100);
            form.setValue('vatAmount', vatAmount.toFixed(2));
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, settings]);

  // Auto-calculate totalAmount from subtotal and vatAmount
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'subtotal' || name === 'vatAmount') {
        const subtotalValue = parseFloat(value.subtotal || '0');
        const vatAmountValue = parseFloat(value.vatAmount || '0');
        
        if (!isNaN(subtotalValue) && !isNaN(vatAmountValue)) {
          const total = subtotalValue + vatAmountValue;
          form.setValue('totalAmount', total.toFixed(2));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertContract) => {
      return await apiRequest('POST', '/api/contracts', data);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('msg.contractCreated'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      navigate('/contracts');
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertContract) => {
      return await apiRequest('PATCH', `/api/contracts/${params.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('msg.contractUpdated'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      navigate('/contracts');
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContract) => {
    // Clear irrelevant fields based on hirer type
    const cleanedData = { ...data };
    
    if (data.hirerType === 'from_company') {
      // Clear individual hirer fields for company
      cleanedData.gender = undefined;
      cleanedData.dateOfBirth = undefined;
      cleanedData.idNumber = undefined;
      cleanedData.licenseNumber = '';
      cleanedData.licenseIssueDate = undefined;
      cleanedData.licenseExpiryDate = undefined;
      cleanedData.sponsorNameEn = undefined;
      cleanedData.sponsorNameAr = undefined;
      cleanedData.sponsorIdNumber = undefined;
      cleanedData.sponsorPhone = undefined;
    } else if (data.hirerType === 'with_sponsor') {
      // Clear company fields for individual with sponsor
      cleanedData.companyNameEn = undefined;
      cleanedData.companyNameAr = undefined;
      cleanedData.companyContactPerson = undefined;
      cleanedData.companyPhone = undefined;
    } else {
      // Clear both sponsor and company fields for direct hirer
      cleanedData.sponsorNameEn = undefined;
      cleanedData.sponsorNameAr = undefined;
      cleanedData.sponsorIdNumber = undefined;
      cleanedData.sponsorPhone = undefined;
      cleanedData.companyNameEn = undefined;
      cleanedData.companyNameAr = undefined;
      cleanedData.companyContactPerson = undefined;
      cleanedData.companyPhone = undefined;
    }
    
    if (isEditing) {
      updateMutation.mutate(cleanedData);
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  if (authLoading || (isEditing && contractLoading)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-form-title">
            {isEditing ? t('common.edit') : t('contracts.newContract')}
          </h1>
          <p className="text-muted-foreground">
            {isEditing && existingContract ? `${t('contracts.contractNumber')} #${existingContract.contractNumber}` : ''}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/contracts')} data-testid="button-back">
          <span className="material-icons">arrow_back</span>
          <span>{t('common.back')}</span>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Hirer Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">badge</span>
                {t('form.hirerInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={hirerType} onValueChange={(v) => form.setValue('hirerType', v as 'direct' | 'with_sponsor' | 'from_company')}>
                <TabsList className="grid w-full grid-cols-3" data-testid="tabs-hirer-type">
                  <TabsTrigger value="direct" data-testid="tab-hirer-direct">{t('form.hirerTypeDirect')}</TabsTrigger>
                  <TabsTrigger value="with_sponsor" data-testid="tab-hirer-with-sponsor">{t('form.hirerTypeWithSponsor')}</TabsTrigger>
                  <TabsTrigger value="from_company" data-testid="tab-hirer-from-company">{t('form.hirerTypeFromCompany')}</TabsTrigger>
                </TabsList>

                {/* Direct Hirer */}
                <TabsContent value="direct" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">{t('form.hirerTypeDirect')}</p>
                </TabsContent>

                {/* With Sponsor */}
                <TabsContent value="with_sponsor" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">{t('form.hirerTypeWithSponsor')}</p>
                </TabsContent>

                {/* From Company */}
                <TabsContent value="from_company" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">{t('form.hirerTypeFromCompany')}</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Customer/Hirer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">person</span>
                {hirerType === 'from_company' ? t('form.companyInfo') : t('form.customerInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hirerType === 'from_company' ? (
                <>
                  <FormField
                    control={form.control}
                    name="companyNameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.companyNameEn')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-company-name-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyNameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.companyNameAr')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-company-name-ar" className="font-arabic" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyContactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.companyContactPerson')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-company-contact" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.companyPhone')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-company-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="customerNameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.customerNameEn')}</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-customer-name-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerNameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.customerNameAr')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-customer-name-ar" className="font-arabic" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.gender')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder={t('form.gender')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t('form.genderMale')}</SelectItem>
                            <SelectItem value="female">{t('form.genderFemale')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.dateOfBirth')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-date-of-birth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.idNumber')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} data-testid="input-id-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.customerPhone')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-customer-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.customerEmail')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="email" data-testid="input-customer-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('form.customerAddress')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} data-testid="input-customer-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('form.licenseNumber')}
                      {hirerType === 'from_company' && (
                        <span className="text-muted-foreground text-sm ml-2">({t('common.optional')})</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-license-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {hirerType !== 'from_company' && (
                <>
                  <FormField
                    control={form.control}
                    name="licenseIssueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.licenseIssueDate')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-license-issue-date"
                          />
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
                        <FormLabel>{t('form.licenseExpiryDate')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-license-expiry-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Sponsor Information (only for with_sponsor) */}
          {hirerType === 'with_sponsor' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="material-icons">supervised_user_circle</span>
                  {t('form.sponsorInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sponsorNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.sponsorNameEn')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-sponsor-name-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sponsorNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.sponsorNameAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-sponsor-name-ar" className="font-arabic" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sponsorIdNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.sponsorIdNumber')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-sponsor-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sponsorPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.sponsorPhone')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-sponsor-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">directions_car</span>
                {t('form.vehicleInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleMake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vehicleMake')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-make" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vehicleModel')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vehicleYear')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-year" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vehicleColor')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-color" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehiclePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vehiclePlate')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-plate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleVin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vehicleVin')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-vehicle-vin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fuelLevelStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.fuelLevelStart')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fuel-start">
                          <SelectValue placeholder={t('form.fuelLevel')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full">{t('form.fuelFull')}</SelectItem>
                        <SelectItem value="3/4">{t('form.fuel3Quarter')}</SelectItem>
                        <SelectItem value="1/2">{t('form.fuelHalf')}</SelectItem>
                        <SelectItem value="1/4">{t('form.fuelQuarter')}</SelectItem>
                        <SelectItem value="empty">{t('form.fuelEmpty')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fuelLevelEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.fuelLevelEnd')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fuel-end">
                          <SelectValue placeholder={t('form.fuelLevel')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full">{t('form.fuelFull')}</SelectItem>
                        <SelectItem value="3/4">{t('form.fuel3Quarter')}</SelectItem>
                        <SelectItem value="1/2">{t('form.fuelHalf')}</SelectItem>
                        <SelectItem value="1/4">{t('form.fuelQuarter')}</SelectItem>
                        <SelectItem value="empty">{t('form.fuelEmpty')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="odometerStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.odometerStart')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-odometer-start"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odometerEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.odometerEnd')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-odometer-end"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleCondition"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('form.vehicleCondition')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} rows={3} data-testid="input-vehicle-condition" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Rental Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">event</span>
                {t('form.rentalDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rentalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.rentalType')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-rental-type">
                          <SelectValue placeholder={t('form.rentalType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">{t('form.rentalTypeDaily')}</SelectItem>
                        <SelectItem value="weekly">{t('form.rentalTypeWeekly')}</SelectItem>
                        <SelectItem value="monthly">{t('form.rentalTypeMonthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div></div>
              
              <FormField
                control={form.control}
                name="rentalStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.rentalStartDate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-rental-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentalStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.rentalStartTime')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ''} data-testid="input-rental-start-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rentalEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.rentalEndDate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-rental-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentalEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.rentalEndTime')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ''} data-testid="input-rental-end-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.pickupLocation')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-pickup-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dropoffLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.dropoffLocation')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-dropoff-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">attach_money</span>
                {t('form.pricing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.dailyRate')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-daily-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeklyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.weeklyRate')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-weekly-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.monthlyRate')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-monthly-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.totalDays')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-total-days"
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.subtotal')}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        data-testid="input-subtotal" 
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vatAmount')}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        data-testid="input-vat-amount" 
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mileageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.mileageLimit')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-mileage-limit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="extraKmRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.extraKmRate')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-extra-km-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.totalAmount')}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        data-testid="input-total-amount" 
                        readOnly
                        className="bg-muted font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="securityDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.securityDeposit')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-security-deposit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accidentLiability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.accidentLiability')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-accident-liability" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">info</span>
                {t('form.additionalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} rows={4} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-terms-accepted"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('form.termsAccepted')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/contracts')} data-testid="button-cancel">
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {createMutation.isPending || updateMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
