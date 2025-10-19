import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { insertContractSchema, insertCustomerSchema, insertVehicleSchema, type InsertContract, type Contract, type CompanySettings, type Customer, type Vehicle } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Check, ChevronsUpDown, Plus, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Extended validation schema with customerId and vehicleId
const contractFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  hirerType: z.string().default('direct'),
  rentalStartDate: z.coerce.date(),
  rentalEndDate: z.coerce.date(),
  rentalType: z.string().default('daily'),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  dailyRate: z.string().min(1, "Daily rate is required"),
  weeklyRate: z.string().nullable().optional(),
  monthlyRate: z.string().nullable().optional(),
  totalDays: z.coerce.number().default(1),
  subtotal: z.string().nullable().optional(),
  vatAmount: z.string().nullable().optional(),
  totalAmount: z.string().min(1, "Total amount is required"),
  mileageLimit: z.coerce.number().nullable().optional(),
  extraKmRate: z.string().nullable().optional(),
  securityDeposit: z.string().nullable().optional(),
  odometerStart: z.coerce.number().nullable().optional(),
  fuelLevelStart: z.string().nullable().optional(),
  vehicleCondition: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  createdBy: z.string(),
  status: z.string().nullable().optional(),
});

type ContractFormData = z.infer<typeof contractFormSchema>;

export default function ContractForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params.id && params.id !== 'new';

  // State for dialogs and selections
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [createVehicleOpen, setCreateVehicleOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleAvailable, setVehicleAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

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

  // Guard: Check for edit reason when loading edit form
  useEffect(() => {
    if (isEditing && params.id) {
      const editReason = sessionStorage.getItem(`editReason_${params.id}`);
      if (!editReason) {
        toast({
          title: t('common.error'),
          description: 'Please provide an edit reason before modifying this contract.',
          variant: "destructive",
        });
        navigate('/contracts');
      }
    }
  }, [isEditing, params.id, navigate, toast, t]);

  const { data: existingContract, isLoading: contractLoading } = useQuery<Contract>({
    queryKey: ['/api/contracts', params.id],
    enabled: isEditing && isAuthenticated,
  });

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated,
  });

  // Search customers
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers/search', customerSearchQuery],
    enabled: isAuthenticated && customerSearchQuery.length > 0,
    queryFn: async () => {
      const res = await fetch(`/api/customers/search?q=${encodeURIComponent(customerSearchQuery)}`);
      if (!res.ok) throw new Error('Failed to search customers');
      return res.json();
    },
  });

  // Search vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles/search', vehicleSearchQuery],
    enabled: isAuthenticated && vehicleSearchQuery.length > 0,
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/search?q=${encodeURIComponent(vehicleSearchQuery)}`);
      if (!res.ok) throw new Error('Failed to search vehicles');
      return res.json();
    },
  });

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      status: 'draft',
      hirerType: 'direct',
      customerId: '',
      vehicleId: '',
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

  const watchedCustomerId = form.watch('customerId');
  const watchedVehicleId = form.watch('vehicleId');
  const watchedStartDate = form.watch('rentalStartDate');
  const watchedEndDate = form.watch('rentalEndDate');

  // Load selected customer details
  useEffect(() => {
    if (watchedCustomerId && isAuthenticated) {
      queryClient.fetchQuery({
        queryKey: ['/api/customers', watchedCustomerId],
      }).then((customer) => {
        setSelectedCustomer(customer as Customer);
      });
    }
  }, [watchedCustomerId, isAuthenticated]);

  // Load selected vehicle details and auto-populate pricing
  useEffect(() => {
    if (watchedVehicleId && isAuthenticated) {
      queryClient.fetchQuery({
        queryKey: ['/api/vehicles', watchedVehicleId],
      }).then((vehicle) => {
        setSelectedVehicle(vehicle as Vehicle);
        // Auto-populate pricing
        if (vehicle) {
          const v = vehicle as Vehicle;
          form.setValue('dailyRate', v.dailyRate);
          if (v.weeklyRate) form.setValue('weeklyRate', v.weeklyRate);
          if (v.monthlyRate) form.setValue('monthlyRate', v.monthlyRate);
        }
      });
    }
  }, [watchedVehicleId, isAuthenticated, form]);

  // Check vehicle availability when vehicle or dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!watchedVehicleId || !watchedStartDate || !watchedEndDate) {
        setVehicleAvailable(null);
        return;
      }

      setCheckingAvailability(true);
      try {
        const startDateStr = watchedStartDate instanceof Date 
          ? watchedStartDate.toISOString().split('T')[0] 
          : '';
        const endDateStr = watchedEndDate instanceof Date 
          ? watchedEndDate.toISOString().split('T')[0] 
          : '';

        if (!startDateStr || !endDateStr) {
          setVehicleAvailable(null);
          return;
        }

        const excludeContractId = isEditing ? params.id : undefined;
        const queryParams = new URLSearchParams({
          startDate: startDateStr,
          endDate: endDateStr,
          ...(excludeContractId && { excludeContractId }),
        });

        const result = await fetch(`/api/vehicles/${watchedVehicleId}/availability?${queryParams}`, {
          credentials: 'include',
        });
        const data = await result.json();
        setVehicleAvailable(data.available);
      } catch (error) {
        console.error('Error checking availability:', error);
        setVehicleAvailable(null);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [watchedVehicleId, watchedStartDate, watchedEndDate, isEditing, params.id]);

  useEffect(() => {
    if (existingContract) {
      form.reset({
        ...existingContract,
        rentalStartDate: new Date(existingContract.rentalStartDate),
        rentalEndDate: new Date(existingContract.rentalEndDate),
        depositPaidDate: existingContract.depositPaidDate ? new Date(existingContract.depositPaidDate) : undefined,
        depositRefundedDate: existingContract.depositRefundedDate ? new Date(existingContract.depositRefundedDate) : undefined,
        finalPaymentDate: existingContract.finalPaymentDate ? new Date(existingContract.finalPaymentDate) : undefined,
        confirmedAt: existingContract.confirmedAt ? new Date(existingContract.confirmedAt) : undefined,
        activatedAt: existingContract.activatedAt ? new Date(existingContract.activatedAt) : undefined,
        completedAt: existingContract.completedAt ? new Date(existingContract.completedAt) : undefined,
        closedAt: existingContract.closedAt ? new Date(existingContract.closedAt) : undefined,
      } as ContractFormData);
    }
  }, [existingContract, form]);

  // Auto-calculate totalDays from date range
  useEffect(() => {
    const subscription = form.watch((value: any, { name }: any) => {
      if (name === 'rentalStartDate' || name === 'rentalEndDate') {
        const startDate = value.rentalStartDate;
        const endDate = value.rentalEndDate;
        
        if (startDate instanceof Date && !isNaN(startDate.getTime()) && 
            endDate instanceof Date && !isNaN(endDate.getTime())) {
          const diffTime = endDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const totalDays = Math.max(1, diffDays);
          form.setValue('totalDays', totalDays);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-calculate subtotal from rate and days
  useEffect(() => {
    const subscription = form.watch((value: any, { name }: any) => {
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
    const subscription = form.watch((value: any, { name }: any) => {
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
    const subscription = form.watch((value: any, { name }: any) => {
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

  // Customer form for inline creation
  const customerForm = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      nameEn: '',
      nameAr: '',
      nationalId: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      licenseNumber: '',
      notes: '',
      createdBy: '',
    },
  });

  // Vehicle form for inline creation
  const vehicleForm = useForm({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      registration: '',
      vin: '',
      make: '',
      model: '',
      year: '',
      color: '',
      fuelType: '',
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      status: 'available',
      notes: '',
      createdBy: '',
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: any): Promise<Customer> => {
      const response = await apiRequest('POST', '/api/customers', data);
      return response as unknown as Customer;
    },
    onSuccess: (customer: Customer) => {
      toast({
        title: t('common.success'),
        description: 'Customer created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      form.setValue('customerId', customer.id);
      setSelectedCustomer(customer);
      setCreateCustomerOpen(false);
      customerForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: any): Promise<Vehicle> => {
      const response = await apiRequest('POST', '/api/vehicles', data);
      return response as unknown as Vehicle;
    },
    onSuccess: (vehicle: Vehicle) => {
      toast({
        title: t('common.success'),
        description: 'Vehicle created successfully',
      });
      // Invalidate both general and search queries to refresh vehicle selectors
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          query.queryKey[0] === '/api/vehicles/search'
      });
      form.setValue('vehicleId', vehicle.id);
      setSelectedVehicle(vehicle);
      // Auto-populate pricing
      form.setValue('dailyRate', vehicle.dailyRate);
      if (vehicle.weeklyRate) form.setValue('weeklyRate', vehicle.weeklyRate);
      if (vehicle.monthlyRate) form.setValue('monthlyRate', vehicle.monthlyRate);
      setCreateVehicleOpen(false);
      vehicleForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContractFormData) => {
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
    mutationFn: async (data: ContractFormData) => {
      // Retrieve edit reason from sessionStorage
      const editReason = sessionStorage.getItem(`editReason_${params.id}`);
      
      if (!editReason) {
        throw new Error('Edit reason is required. Please start editing from the contracts list.');
      }
      
      // Include editReason in the request
      return await apiRequest('PATCH', `/api/contracts/${params.id}`, {
        ...data,
        editReason,
      });
    },
    onSuccess: () => {
      // Clear the edit reason from sessionStorage after successful update
      if (params.id) {
        sessionStorage.removeItem(`editReason_${params.id}`);
      }
      
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

  const onSubmit = (data: ContractFormData) => {
    // Check vehicle availability before submitting
    if (vehicleAvailable === false) {
      toast({
        title: t('common.error'),
        description: "Vehicle is not available for the selected dates",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCreateCustomer = (data: any) => {
    createCustomerMutation.mutate({
      ...data,
      createdBy: 'current-user-id',
    });
  };

  const handleCreateVehicle = (data: any) => {
    createVehicleMutation.mutate({
      ...data,
      createdBy: 'current-user-id',
    });
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
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('form.customerInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Customer *</FormLabel>
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-customer-select"
                          >
                            {selectedCustomer
                              ? `${selectedCustomer.nameEn} - ${selectedCustomer.phone}`
                              : "Select customer..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search customers..."
                            value={customerSearchQuery}
                            onValueChange={setCustomerSearchQuery}
                            data-testid="input-customer-search"
                          />
                          <CommandList>
                            <CommandEmpty>
                              {customersLoading ? "Loading..." : "No customers found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.id}
                                  onSelect={() => {
                                    field.onChange(customer.id);
                                    setSelectedCustomer(customer);
                                    setCustomerSearchOpen(false);
                                  }}
                                  data-testid={`item-customer-${customer.id}`}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === customer.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {customer.nameEn} - {customer.phone}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Dialog open={createCustomerOpen} onOpenChange={setCreateCustomerOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full" data-testid="button-create-customer">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                  </DialogHeader>
                  <Form {...customerForm}>
                    <form onSubmit={customerForm.handleSubmit(handleCreateCustomer)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={customerForm.control}
                          name="nameEn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name (English) *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-new-customer-name-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customerForm.control}
                          name="nameAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name (Arabic)</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} data-testid="input-new-customer-name-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-new-customer-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} type="email" data-testid="input-new-customer-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customerForm.control}
                          name="nationalId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>National ID</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} data-testid="input-new-customer-national-id" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customerForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-new-customer-gender">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customerForm.control}
                          name="licenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Number</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} data-testid="input-new-customer-license" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={customerForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ''} data-testid="input-new-customer-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={customerForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ''} data-testid="input-new-customer-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateCustomerOpen(false)}
                          data-testid="button-cancel-customer"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createCustomerMutation.isPending}
                          data-testid="button-save-customer"
                        >
                          {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Vehicle Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Vehicle Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Vehicle *</FormLabel>
                    <Popover open={vehicleSearchOpen} onOpenChange={setVehicleSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-vehicle-select"
                          >
                            {selectedVehicle
                              ? `${selectedVehicle.registration} - ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})`
                              : "Select vehicle..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search vehicles..."
                            value={vehicleSearchQuery}
                            onValueChange={setVehicleSearchQuery}
                            data-testid="input-vehicle-search"
                          />
                          <CommandList>
                            <CommandEmpty>
                              {vehiclesLoading ? "Loading..." : "No vehicles found"}
                            </CommandEmpty>
                            <CommandGroup>
                              {vehicles.map((vehicle) => (
                                <CommandItem
                                  key={vehicle.id}
                                  value={vehicle.id}
                                  onSelect={() => {
                                    field.onChange(vehicle.id);
                                    setSelectedVehicle(vehicle);
                                    setVehicleSearchOpen(false);
                                  }}
                                  data-testid={`item-vehicle-${vehicle.id}`}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === vehicle.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {vehicle.registration} - {vehicle.make} {vehicle.model} ({vehicle.year})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {checkingAvailability && (
                <Badge variant="secondary" data-testid="badge-checking-availability">
                  Checking availability...
                </Badge>
              )}
              
              {vehicleAvailable === false && (
                <Badge variant="destructive" className="flex items-center gap-2" data-testid="badge-vehicle-unavailable">
                  <AlertCircle className="h-4 w-4" />
                  Vehicle not available for these dates
                </Badge>
              )}

              {vehicleAvailable === true && (
                <Badge variant="default" className="bg-green-600" data-testid="badge-vehicle-available">
                  <Check className="mr-1 h-4 w-4" />
                  Vehicle available
                </Badge>
              )}

              <Dialog open={createVehicleOpen} onOpenChange={setCreateVehicleOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full" data-testid="button-create-vehicle">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Vehicle</DialogTitle>
                  </DialogHeader>
                  <Form {...vehicleForm}>
                    <form onSubmit={vehicleForm.handleSubmit(handleCreateVehicle)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={vehicleForm.control}
                          name="registration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration / Plate *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-new-vehicle-registration" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="vin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>VIN</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} data-testid="input-new-vehicle-vin" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="make"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Make *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Toyota" data-testid="input-new-vehicle-make" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Camry" data-testid="input-new-vehicle-model" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 2024" data-testid="input-new-vehicle-year" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-new-vehicle-color" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="fuelType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuel Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-new-vehicle-fuel">
                                    <SelectValue placeholder="Select fuel type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="petrol">Petrol</SelectItem>
                                  <SelectItem value="diesel">Diesel</SelectItem>
                                  <SelectItem value="electric">Electric</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="dailyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Rate *</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" data-testid="input-new-vehicle-daily-rate" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="weeklyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weekly Rate</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} type="number" step="0.01" data-testid="input-new-vehicle-weekly-rate" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="monthlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Rate</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} type="number" step="0.01" data-testid="input-new-vehicle-monthly-rate" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={vehicleForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ''} data-testid="input-new-vehicle-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateVehicleOpen(false)}
                          data-testid="button-cancel-vehicle"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createVehicleMutation.isPending}
                          data-testid="button-save-vehicle"
                        >
                          {createVehicleMutation.isPending ? "Creating..." : "Create Vehicle"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Rental Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">event</span>
                Rental Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rentalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rental Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-rental-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Days</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" readOnly data-testid="input-total-days" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentalStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-start-date"
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
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-end-date"
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
                    <FormLabel>Pickup Location</FormLabel>
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
                    <FormLabel>Dropoff Location</FormLabel>
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
                <span className="material-icons">payments</span>
                Pricing & Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Rate</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" data-testid="input-daily-rate" />
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
                    <FormLabel>Weekly Rate</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="number" step="0.01" data-testid="input-weekly-rate" />
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
                    <FormLabel>Monthly Rate</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="number" step="0.01" data-testid="input-monthly-rate" />
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
                    <FormLabel>Mileage Limit (km/day)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="number" data-testid="input-mileage-limit" />
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
                    <FormLabel>Extra KM Rate</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="number" step="0.01" data-testid="input-extra-km-rate" />
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
                    <FormLabel>Security Deposit</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="number" step="0.01" data-testid="input-security-deposit" />
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
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} readOnly data-testid="input-subtotal" />
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
                    <FormLabel>VAT Amount</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} readOnly data-testid="input-vat-amount" />
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
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="font-bold" data-testid="input-total-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contract Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">description</span>
                Contract Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="odometerStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer Start (km)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} type="number" data-testid="input-odometer-start" />
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
                    <FormLabel>Fuel Level Start</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fuel-start">
                          <SelectValue placeholder="Select fuel level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full">Full</SelectItem>
                        <SelectItem value="3/4">3/4</SelectItem>
                        <SelectItem value="1/2">1/2</SelectItem>
                        <SelectItem value="1/4">1/4</SelectItem>
                        <SelectItem value="Empty">Empty</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleCondition"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Vehicle Condition Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} data-testid="input-vehicle-condition" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} data-testid="input-notes" />
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
                        data-testid="checkbox-terms"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I accept the terms and conditions *
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/contracts')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || vehicleAvailable === false}
              data-testid="button-submit"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Contract"
                : "Create Contract"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
