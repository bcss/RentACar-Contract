import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { z } from 'zod';
import { type Contract, type CompanySettings, type Customer, type Vehicle } from '@shared/schema';
import { isUnauthorizedError } from '@/lib/authUtils';
import { 
  User, Car, Calendar, DollarSign, Clipboard, UserPlus, 
  Truck, MapPin, FileText, Wrench, Shield, Hash, Fuel,
  Mail, Phone, CreditCard, Building, IdCard, Globe,
  Clock, Percent, Calculator, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MinimalInput } from '@/components/ui/minimal-input';
import { MinimalSelect, MinimalSelectItem } from '@/components/ui/minimal-select';
import { MinimalTextarea } from '@/components/ui/minimal-textarea';
import { MinimalDateInput } from '@/components/ui/minimal-date-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Comprehensive contract form schema
const contractFormSchema = z.object({
  // Customer Selection
  customerId: z.string().min(1, "Customer is required"),
  hirerType: z.enum(['direct', 'with_sponsor', 'from_company']),
  sponsorId: z.string().nullable().optional(),
  companySponsorId: z.string().nullable().optional(),
  
  // Vehicle Selection
  vehicleId: z.string().min(1, "Vehicle is required"),
  branchId: z.string().min(1, "Branch is required"),
  
  // Rental Period
  rentalStartDate: z.date(),
  rentalEndDate: z.date(),
  totalDays: z.coerce.number().default(1),
  rentalType: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  
  // Pickup/Dropoff
  pickupLocation: z.string().min(1, "Pickup location required"),
  dropoffLocation: z.string().min(1, "Dropoff location required"),
  
  // Financial Terms
  dailyRate: z.string().min(1, "Daily rate required"),
  weeklyRate: z.string().nullable().optional(),
  monthlyRate: z.string().nullable().optional(),
  subtotal: z.string().nullable().optional(),
  vatAmount: z.string().nullable().optional(),
  totalAmount: z.string().min(1, "Total amount required"),
  discountPercentage: z.string().nullable().optional(),
  securityDeposit: z.string().nullable().optional(),
  
  // Mileage
  mileageLimit: z.coerce.number().nullable().optional(),
  extraKmRate: z.string().nullable().optional(),
  odometerStart: z.coerce.number().nullable().optional(),
  
  // Inspection
  inspectionTools: z.boolean().nullable().optional(),
  inspectionSpareTyre: z.boolean().nullable().optional(),
  inspectionGps: z.boolean().nullable().optional(),
  inspectionFuelPercentage: z.coerce.number().min(0).max(100).nullable().optional(),
  inspectionDamageNotes: z.string().nullable().optional(),
  
  // Extra Charges
  salikCharge: z.string().nullable().optional(),
  trafficFineCharge: z.string().nullable().optional(),
  
  // Delivery Service
  dropOffEnabled: z.boolean().nullable().optional(),
  dropOffCharge: z.string().nullable().optional(),
  dropOffAddressEn: z.string().nullable().optional(),
  pickUpEnabled: z.boolean().nullable().optional(),
  pickUpCharge: z.string().nullable().optional(),
  pickUpAddressEn: z.string().nullable().optional(),
  
  // Driver Service
  requiresDriver: z.boolean().nullable().optional(),
  driverServiceType: z.string().nullable().optional(),
  driverServiceRate: z.string().nullable().optional(),
  driverServiceQuantity: z.string().nullable().optional(),
  driverServiceTotal: z.string().nullable().optional(),
  
  // Notes
  notes: z.string().nullable().optional(),
  createdBy: z.string(),
});

type ContractFormData = z.infer<typeof contractFormSchema>;

export default function ContractFormSample() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params.id && params.id !== 'new';
  const [activeTab, setActiveTab] = useState('customer');

  // Search state for type-ahead
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [branchSearchOpen, setBranchSearchOpen] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);

  const [sponsorSearchOpen, setSponsorSearchOpen] = useState(false);
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<any | null>(null);

  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  // Auth guard
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

  // Edit reason guard
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

  // Query for existing contract (edit mode)
  const { data: existingContract, isLoading: contractLoading } = useQuery<Contract>({
    queryKey: ['/api/contracts', params.id],
    enabled: isEditing && isAuthenticated,
  });

  // Query for company settings
  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated,
  });

  // Fetch customers, vehicles, and branches
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['/api/branches'],
  });

  const { data: sponsors = [] } = useQuery<any[]>({
    queryKey: ['/api/sponsors'],
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ['/api/companies'],
  });

  const form = useForm({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      customerId: '',
      vehicleId: '',
      branchId: '',
      hirerType: 'direct',
      rentalType: 'daily',
      pickupLocation: '',
      dropoffLocation: '',
      dailyRate: '',
      totalAmount: '',
      totalDays: 1,
      inspectionTools: false,
      inspectionSpareTyre: false,
      inspectionGps: false,
      dropOffEnabled: false,
      pickUpEnabled: false,
      requiresDriver: false,
      createdBy: user?.id || '',
    },
  });

  // Mutations for contract CRUD
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
      const editReason = sessionStorage.getItem(`editReason_${params.id}`);
      
      if (!editReason) {
        throw new Error('Edit reason is required. Please start editing from the contracts list.');
      }
      
      return await apiRequest('PATCH', `/api/contracts/${params.id}`, {
        ...data,
        editReason,
      });
    },
    onSuccess: () => {
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

  // Watch form values for calculations
  const watchedStartDate = form.watch('rentalStartDate');
  const watchedEndDate = form.watch('rentalEndDate');
  const watchedDailyRate = form.watch('dailyRate');
  const watchedTotalDays = form.watch('totalDays');
  const watchedHirerType = form.watch('hirerType');
  const watchedRequiresDriver = form.watch('requiresDriver');
  const watchedDropOffEnabled = form.watch('dropOffEnabled');
  const watchedPickUpEnabled = form.watch('pickUpEnabled');

  // Auto-calculate total days
  useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const diffTime = watchedEndDate.getTime() - watchedStartDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      form.setValue('totalDays', Math.max(1, diffDays));
    }
  }, [watchedStartDate, watchedEndDate, form]);

  // Auto-calculate subtotal and total
  useEffect(() => {
    if (watchedDailyRate && watchedTotalDays) {
      const rate = parseFloat(watchedDailyRate);
      if (!isNaN(rate)) {
        const subtotal = rate * watchedTotalDays;
        form.setValue('subtotal', subtotal.toFixed(2));
        
        // Calculate VAT (5%)
        const vat = subtotal * 0.05;
        form.setValue('vatAmount', vat.toFixed(2));
        
        // Calculate total
        const total = subtotal + vat;
        form.setValue('totalAmount', total.toFixed(2));
      }
    }
  }, [watchedDailyRate, watchedTotalDays, form]);

  // Edit mode: Hydrate form with existing contract data
  useEffect(() => {
    if (existingContract && !contractLoading) {
      form.reset({
        customerId: existingContract.customerId || '',
        vehicleId: existingContract.vehicleId || '',
        branchId: existingContract.branchId || '',
        hirerType: (existingContract.hirerType as 'direct' | 'with_sponsor' | 'from_company') || 'direct',
        sponsorId: existingContract.sponsorId || null,
        companySponsorId: existingContract.companySponsorId || null,
        rentalStartDate: existingContract.rentalStartDate ? new Date(existingContract.rentalStartDate) : new Date(),
        rentalEndDate: existingContract.rentalEndDate ? new Date(existingContract.rentalEndDate) : new Date(),
        rentalType: (existingContract.rentalType as 'daily' | 'weekly' | 'monthly') || 'daily',
        pickupLocation: existingContract.pickupLocation || '',
        dropoffLocation: existingContract.dropoffLocation || '',
        dailyRate: existingContract.dailyRate || '',
        weeklyRate: existingContract.weeklyRate || '',
        monthlyRate: existingContract.monthlyRate || '',
        subtotal: existingContract.subtotal || '',
        vatAmount: existingContract.vatAmount || '',
        totalAmount: existingContract.totalAmount || '',
        totalDays: existingContract.totalDays || 1,
        mileageLimit: existingContract.mileageLimit || null,
        extraKmRate: existingContract.extraKmRate || '',
        odometerStart: existingContract.odometerStart || null,
        securityDeposit: existingContract.securityDeposit || '',
        inspectionTools: existingContract.inspectionTools || false,
        inspectionSpareTyre: existingContract.inspectionSpareTyre || false,
        inspectionGps: existingContract.inspectionGps || false,
        inspectionFuelPercentage: existingContract.inspectionFuelPercentage || 100,
        inspectionDamageNotes: existingContract.inspectionDamageNotes || '',
        salikCharge: existingContract.salikCharge || '',
        trafficFineCharge: existingContract.trafficFineCharge || '',
        dropOffEnabled: existingContract.dropOffEnabled || false,
        dropOffCharge: existingContract.dropOffCharge || '',
        dropOffAddressEn: existingContract.dropOffAddressEn || '',
        pickUpEnabled: existingContract.pickUpEnabled || false,
        pickUpCharge: existingContract.pickUpCharge || '',
        pickUpAddressEn: existingContract.pickUpAddressEn || '',
        requiresDriver: existingContract.requiresDriver || false,
        driverServiceType: existingContract.driverServiceType || '',
        driverServiceRate: existingContract.driverServiceRate || '',
        driverServiceQuantity: existingContract.driverServiceQuantity || '',
        driverServiceTotal: existingContract.driverServiceTotal || '',
        notes: existingContract.notes || '',
        createdBy: existingContract.createdBy || user?.id || '',
      });
    }
  }, [existingContract, contractLoading, form, user?.id]);

  const onSubmit = async (data: ContractFormData) => {
    try {
      const payload = {
        ...data,
        rentalStartDate: data.rentalStartDate instanceof Date 
          ? data.rentalStartDate.toISOString() 
          : data.rentalStartDate,
        rentalEndDate: data.rentalEndDate instanceof Date 
          ? data.rentalEndDate.toISOString() 
          : data.rentalEndDate,
      };

      if (isEditing) {
        updateMutation.mutate(payload as ContractFormData);
      } else {
        createMutation.mutate(payload as ContractFormData);
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to save contract',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              Minimal Input Contract Form Sample
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-page-description">
              Complete contract form with beautiful bottom-border minimal inputs
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/contracts')}
            data-testid="button-back"
          >
            Back to Contracts
          </Button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7 gap-1">
                <TabsTrigger value="customer" data-testid="tab-customer">
                  <User className="h-4 w-4 mr-2" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="vehicle" data-testid="tab-vehicle">
                  <Car className="h-4 w-4 mr-2" />
                  Vehicle
                </TabsTrigger>
                <TabsTrigger value="rental" data-testid="tab-rental">
                  <Calendar className="h-4 w-4 mr-2" />
                  Rental
                </TabsTrigger>
                <TabsTrigger value="financial" data-testid="tab-financial">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financial
                </TabsTrigger>
                <TabsTrigger value="inspection" data-testid="tab-inspection">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Inspection
                </TabsTrigger>
                <TabsTrigger value="services" data-testid="tab-services">
                  <Truck className="h-4 w-4 mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="notes" data-testid="tab-notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              {/* Customer Selection Tab */}
              <TabsContent value="customer" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                    <CardDescription>
                      Select customer and hirer type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Selection - Type-ahead Search */}
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel data-testid="label-customer">Customer *</FormLabel>
                            <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="flex items-center gap-3 border-b border-border pb-2 cursor-pointer hover-elevate active-elevate-2" data-testid="trigger-customer-search">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className={cn(
                                        "text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}>
                                        {selectedCustomer ? `${selectedCustomer.nameEn} - ${selectedCustomer.phone}` : "Search and select customer"}
                                      </span>
                                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Type to search customers..."
                                  value={customerSearchQuery}
                                  onValueChange={setCustomerSearchQuery}
                                  data-testid="input-customer-search"
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {customerSearchQuery.length > 0 ? "No customers found" : "Start typing to search"}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {customers
                                      .filter((customer: any) => 
                                        !customerSearchQuery || 
                                        customer.nameEn?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                                        customer.nameAr?.includes(customerSearchQuery) ||
                                        customer.phone?.includes(customerSearchQuery) ||
                                        customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                                      )
                                      .map((customer: any) => (
                                        <CommandItem
                                          key={customer.id}
                                          value={customer.id}
                                          onSelect={() => {
                                            field.onChange(customer.id.toString());
                                            setSelectedCustomer(customer);
                                            setCustomerSearchOpen(false);
                                            setCustomerSearchQuery('');
                                          }}
                                          data-testid={`item-customer-${customer.id}`}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === customer.id.toString() ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col">
                                            <span className="font-medium">{customer.nameEn}</span>
                                            {customer.nameAr && (
                                              <span className="text-sm text-muted-foreground">{customer.nameAr}</span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                              {customer.phone} {customer.email && `• ${customer.email}`}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                            <FormMessage data-testid="error-customer" />
                          </FormItem>
                        )}
                      />

                      {/* Hirer Type */}
                      <FormField
                        control={form.control}
                        name="hirerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-hirer-type">Hirer Type *</FormLabel>
                            <FormControl>
                              <MinimalSelect
                                icon={<IdCard className="h-4 w-4" />}
                                placeholder="Select hirer type"
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <MinimalSelectItem value="direct">Direct Customer</MinimalSelectItem>
                                <MinimalSelectItem value="with_sponsor">With Sponsor</MinimalSelectItem>
                                <MinimalSelectItem value="from_company">From Company</MinimalSelectItem>
                              </MinimalSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Conditional Sponsor Selection - Type-ahead Search (Full Width) */}
                    {watchedHirerType === 'with_sponsor' && (
                      <FormField
                        control={form.control}
                        name="sponsorId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Sponsor *</FormLabel>
                            <Popover open={sponsorSearchOpen} onOpenChange={setSponsorSearchOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="flex items-center gap-3 border-b border-border pb-2 cursor-pointer hover-elevate active-elevate-2" data-testid="trigger-sponsor-search">
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className={cn(
                                        "text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}>
                                        {selectedSponsor ? selectedSponsor.name : "Search and select sponsor"}
                                      </span>
                                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[350px] p-0" align="start">
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder="Type to search sponsors..."
                                    value={sponsorSearchQuery}
                                    onValueChange={setSponsorSearchQuery}
                                    data-testid="input-sponsor-search"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      {sponsorSearchQuery.length > 0 ? "No sponsors found" : "Start typing to search"}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {sponsors
                                        .filter((sponsor: any) => 
                                          !sponsorSearchQuery ||
                                          sponsor.name?.toLowerCase().includes(sponsorSearchQuery.toLowerCase())
                                        )
                                        .map((sponsor: any) => (
                                          <CommandItem
                                            key={sponsor.id}
                                            value={sponsor.id}
                                            onSelect={() => {
                                              field.onChange(sponsor.id.toString());
                                              setSelectedSponsor(sponsor);
                                              setSponsorSearchOpen(false);
                                              setSponsorSearchQuery('');
                                            }}
                                            data-testid={`item-sponsor-${sponsor.id}`}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === sponsor.id.toString() ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <span className="font-medium">{sponsor.name}</span>
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
                    )}

                    {/* Conditional Company Selection - Type-ahead Search */}
                    {watchedHirerType === 'from_company' && (
                      <FormField
                        control={form.control}
                        name="companySponsorId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Company *</FormLabel>
                            <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="flex items-center gap-3 border-b border-border pb-2 cursor-pointer hover-elevate active-elevate-2" data-testid="trigger-company-search">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className={cn(
                                        "text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}>
                                        {selectedCompany ? selectedCompany.nameEn : "Search and select company"}
                                      </span>
                                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[350px] p-0" align="start">
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder="Type to search companies..."
                                    value={companySearchQuery}
                                    onValueChange={setCompanySearchQuery}
                                    data-testid="input-company-search"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      {companySearchQuery.length > 0 ? "No companies found" : "Start typing to search"}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {companies
                                        .filter((company: any) => 
                                          !companySearchQuery ||
                                          company.nameEn?.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
                                          company.nameAr?.includes(companySearchQuery)
                                        )
                                        .map((company: any) => (
                                          <CommandItem
                                            key={company.id}
                                            value={company.id}
                                            onSelect={() => {
                                              field.onChange(company.id.toString());
                                              setSelectedCompany(company);
                                              setCompanySearchOpen(false);
                                              setCompanySearchQuery('');
                                            }}
                                            data-testid={`item-company-${company.id}`}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === company.id.toString() ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <div className="flex flex-col">
                                              <span className="font-medium">{company.nameEn}</span>
                                              {company.nameAr && (
                                                <span className="text-sm text-muted-foreground">{company.nameAr}</span>
                                              )}
                                            </div>
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vehicle Selection Tab */}
              <TabsContent value="vehicle" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle & Branch
                    </CardTitle>
                    <CardDescription>
                      Select vehicle and branch location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Vehicle Selection - Type-ahead Search */}
                      <FormField
                        control={form.control}
                        name="vehicleId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Vehicle *</FormLabel>
                            <Popover open={vehicleSearchOpen} onOpenChange={setVehicleSearchOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="flex items-center gap-3 border-b border-border pb-2 cursor-pointer hover-elevate active-elevate-2" data-testid="trigger-vehicle-search">
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className={cn(
                                        "text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}>
                                        {selectedVehicle 
                                          ? `${selectedVehicle.registration} - ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})` 
                                          : "Search and select vehicle"}
                                      </span>
                                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                            <PopoverContent className="w-[450px] p-0" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Type to search vehicles..."
                                  value={vehicleSearchQuery}
                                  onValueChange={setVehicleSearchQuery}
                                  data-testid="input-vehicle-search"
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {vehicleSearchQuery.length > 0 ? "No vehicles found" : "Start typing to search"}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {vehicles
                                      .filter((vehicle: any) => 
                                        !vehicleSearchQuery ||
                                        vehicle.registration?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                                        vehicle.make?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                                        vehicle.model?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                                        vehicle.year?.toString().includes(vehicleSearchQuery)
                                      )
                                      .map((vehicle: any) => (
                                        <CommandItem
                                          key={vehicle.id}
                                          value={vehicle.id}
                                          onSelect={() => {
                                            field.onChange(vehicle.id.toString());
                                            setSelectedVehicle(vehicle);
                                            setVehicleSearchOpen(false);
                                            setVehicleSearchQuery('');
                                          }}
                                          data-testid={`item-vehicle-${vehicle.id}`}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === vehicle.id.toString() ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col">
                                            <span className="font-medium">{vehicle.registration}</span>
                                            <span className="text-sm text-muted-foreground">
                                              {vehicle.make} {vehicle.model} ({vehicle.year})
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {vehicle.color} • {vehicle.category || 'N/A'}
                                            </span>
                                          </div>
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

                      {/* Branch Selection - Type-ahead Search */}
                      <FormField
                        control={form.control}
                        name="branchId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Branch *</FormLabel>
                            <Popover open={branchSearchOpen} onOpenChange={setBranchSearchOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="flex items-center gap-3 border-b border-border pb-2 cursor-pointer hover-elevate active-elevate-2" data-testid="trigger-branch-search">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className={cn(
                                        "text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}>
                                        {selectedBranch ? selectedBranch.nameEn : "Search and select branch"}
                                      </span>
                                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[350px] p-0" align="start">
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder="Type to search branches..."
                                    value={branchSearchQuery}
                                    onValueChange={setBranchSearchQuery}
                                    data-testid="input-branch-search"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      {branchSearchQuery.length > 0 ? "No branches found" : "Start typing to search"}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {branches
                                        .filter((branch: any) => 
                                          !branchSearchQuery ||
                                          branch.nameEn?.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
                                          branch.nameAr?.includes(branchSearchQuery)
                                        )
                                        .map((branch: any) => (
                                          <CommandItem
                                            key={branch.id}
                                            value={branch.id}
                                            onSelect={() => {
                                              field.onChange(branch.id.toString());
                                              setSelectedBranch(branch);
                                              setBranchSearchOpen(false);
                                              setBranchSearchQuery('');
                                            }}
                                            data-testid={`item-branch-${branch.id}`}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === branch.id.toString() ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <div className="flex flex-col">
                                              <span className="font-medium">{branch.nameEn}</span>
                                              {branch.nameAr && (
                                                <span className="text-sm text-muted-foreground">{branch.nameAr}</span>
                                              )}
                                            </div>
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rental Details Tab */}
              <TabsContent value="rental" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Rental Period & Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Date */}
                      <FormField
                        control={form.control}
                        name="rentalStartDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <MinimalDateInput
                                icon={<Calendar className="h-4 w-4" />}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select start date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* End Date */}
                      <FormField
                        control={form.control}
                        name="rentalEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <MinimalDateInput
                                icon={<Calendar className="h-4 w-4" />}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select end date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Total Days (auto-calculated) */}
                      <FormField
                        control={form.control}
                        name="totalDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Days</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<Hash className="h-4 w-4" />}
                                type="number"
                                placeholder="Auto-calculated"
                                {...field}
                                value={field.value}
                                disabled
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Rental Type */}
                      <FormField
                        control={form.control}
                        name="rentalType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rental Type *</FormLabel>
                            <FormControl>
                              <MinimalSelect
                                icon={<Clock className="h-4 w-4" />}
                                placeholder="Select rental type"
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <MinimalSelectItem value="daily">Daily</MinimalSelectItem>
                                <MinimalSelectItem value="weekly">Weekly</MinimalSelectItem>
                                <MinimalSelectItem value="monthly">Monthly</MinimalSelectItem>
                              </MinimalSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Pickup Location */}
                    <FormField
                      control={form.control}
                      name="pickupLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location *</FormLabel>
                          <FormControl>
                            <MinimalInput
                              icon={<MapPin className="h-4 w-4" />}
                              placeholder="Enter pickup location"
                              {...field}
                              error={!!form.formState.errors.pickupLocation}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Dropoff Location */}
                    <FormField
                      control={form.control}
                      name="dropoffLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dropoff Location *</FormLabel>
                          <FormControl>
                            <MinimalInput
                              icon={<MapPin className="h-4 w-4" />}
                              placeholder="Enter dropoff location"
                              {...field}
                              error={!!form.formState.errors.dropoffLocation}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Daily Rate */}
                      <FormField
                        control={form.control}
                        name="dailyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Rate *</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<DollarSign className="h-4 w-4" />}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                error={!!form.formState.errors.dailyRate}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Security Deposit */}
                      <FormField
                        control={form.control}
                        name="securityDeposit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Deposit</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<Shield className="h-4 w-4" />}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Subtotal (auto-calculated) */}
                      <FormField
                        control={form.control}
                        name="subtotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtotal</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<Calculator className="h-4 w-4" />}
                                type="text"
                                placeholder="Auto-calculated"
                                {...field}
                                value={field.value || ''}
                                disabled
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* VAT Amount (auto-calculated) */}
                      <FormField
                        control={form.control}
                        name="vatAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT (5%)</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<Percent className="h-4 w-4" />}
                                type="text"
                                placeholder="Auto-calculated"
                                {...field}
                                value={field.value || ''}
                                disabled
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Total Amount */}
                      <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount *</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<DollarSign className="h-4 w-4" />}
                                type="text"
                                placeholder="Auto-calculated"
                                {...field}
                                disabled
                                error={!!form.formState.errors.totalAmount}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Discount Percentage */}
                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount %</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<Percent className="h-4 w-4" />}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Mileage Section */}
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-4">Mileage Terms</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="mileageLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mileage Limit (km)</FormLabel>
                              <FormControl>
                                <MinimalInput
                                  icon={<Hash className="h-4 w-4" />}
                                  type="number"
                                  placeholder="Unlimited"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
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
                              <FormLabel>Extra KM Rate</FormLabel>
                              <FormControl>
                                <MinimalInput
                                  icon={<DollarSign className="h-4 w-4" />}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inspection Tab */}
              <TabsContent value="inspection" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clipboard className="h-5 w-5" />
                      Vehicle Inspection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Readings Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Odometer */}
                      <FormField
                        control={form.control}
                        name="odometerStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Odometer Reading (km)</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<Hash className="h-4 w-4" />}
                                type="number"
                                placeholder="Enter odometer reading"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Fuel Percentage */}
                      <FormField
                        control={form.control}
                        name="inspectionFuelPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Level (%)</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<Fuel className="h-4 w-4" />}
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0-100"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Equipment Check Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Equipment Check
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="inspectionTools"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-tools"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Tools Present</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="inspectionSpareTyre"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-spare-tyre"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Spare Tyre Present</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="inspectionGps"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-gps"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">GPS Device Present</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Damage Notes */}
                    <FormField
                      control={form.control}
                      name="inspectionDamageNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Damage Notes</FormLabel>
                          <FormControl>
                            <MinimalTextarea
                              icon={<FileText className="h-4 w-4" />}
                              label="Existing damage or issues"
                              rows={3}
                              placeholder="Document any existing damage..."
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                {/* Delivery Service */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Delivery & Pickup Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Drop Off Service */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="dropOffEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-dropoff"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Enable Drop-off Delivery</FormLabel>
                          </FormItem>
                        )}
                      />

                      {watchedDropOffEnabled && (
                        <div className="pl-7">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="dropOffAddressEn"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Drop-off Address</FormLabel>
                                  <FormControl>
                                    <MinimalInput
                                      icon={<MapPin className="h-4 w-4" />}
                                      placeholder="Enter delivery address"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dropOffCharge"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Drop-off Charge</FormLabel>
                                  <FormControl>
                                    <MinimalInput
                                      icon={<DollarSign className="h-4 w-4" />}
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pick Up Service */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="pickUpEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-pickup"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Enable Pick-up Service</FormLabel>
                          </FormItem>
                        )}
                      />

                      {watchedPickUpEnabled && (
                        <div className="pl-7">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="pickUpAddressEn"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pick-up Address</FormLabel>
                                  <FormControl>
                                    <MinimalInput
                                      icon={<MapPin className="h-4 w-4" />}
                                      placeholder="Enter pickup address"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pickUpCharge"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pick-up Charge</FormLabel>
                                  <FormControl>
                                    <MinimalInput
                                      icon={<DollarSign className="h-4 w-4" />}
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Driver Service */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Driver Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="requiresDriver"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-driver"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Requires Driver Service</FormLabel>
                        </FormItem>
                      )}
                    />

                    {watchedRequiresDriver && (
                      <div className="pl-7 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="driverServiceType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Type</FormLabel>
                                <FormControl>
                                  <MinimalSelect
                                    icon={<UserPlus className="h-4 w-4" />}
                                    placeholder="Select type"
                                    value={field.value || ''}
                                    onValueChange={field.onChange}
                                  >
                                    <MinimalSelectItem value="hourly">Hourly</MinimalSelectItem>
                                    <MinimalSelectItem value="daily">Daily</MinimalSelectItem>
                                    <MinimalSelectItem value="monthly">Monthly</MinimalSelectItem>
                                  </MinimalSelect>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="driverServiceRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rate</FormLabel>
                                <FormControl>
                                  <MinimalInput
                                    icon={<DollarSign className="h-4 w-4" />}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="driverServiceQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity (hours/days)</FormLabel>
                                <FormControl>
                                  <MinimalInput
                                    icon={<Hash className="h-4 w-4" />}
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="driverServiceTotal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total</FormLabel>
                                <FormControl>
                                  <MinimalInput
                                    icon={<Calculator className="h-4 w-4" />}
                                    type="text"
                                    placeholder="Auto-calculated"
                                    {...field}
                                    value={field.value || ''}
                                    disabled
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Extra Charges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Extra Charges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="salikCharge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salik/Toll Charge</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<DollarSign className="h-4 w-4" />}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="trafficFineCharge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Traffic Fine Charge</FormLabel>
                            <FormControl>
                              <MinimalInput
                                icon={<DollarSign className="h-4 w-4" />}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Notes</FormLabel>
                          <FormControl>
                            <MinimalTextarea
                              icon={<FileText className="h-4 w-4" />}
                              label="Additional information"
                              rows={6}
                              placeholder="Enter any additional notes, special conditions, or remarks..."
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/contracts')}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
                  data-testid="button-reset"
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  data-testid="button-submit"
                >
                  Create Contract with Minimal Inputs
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
