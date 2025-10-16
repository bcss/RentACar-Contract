import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { insertContractSchema, type InsertContract, type Contract } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const form = useForm<InsertContract>({
    resolver: zodResolver(insertContractSchema),
    defaultValues: {
      status: 'draft',
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
      pickupLocation: '',
      dropoffLocation: '',
      dailyRate: '',
      totalDays: 1,
      totalAmount: '',
      deposit: '',
      notes: '',
      termsAccepted: false,
      createdBy: '',
    },
  });

  useEffect(() => {
    if (existingContract) {
      form.reset({
        ...existingContract,
        rentalStartDate: new Date(existingContract.rentalStartDate),
        rentalEndDate: new Date(existingContract.rentalEndDate),
      });
    }
  }, [existingContract, form]);

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
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
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
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">person</span>
                {t('form.customerInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormLabel>{t('form.licenseNumber')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-license-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
                      />
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
                      <Input {...field} data-testid="input-total-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.deposit')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-deposit" />
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
