/**
 * File: client/src/pages/Customers.tsx
 * @area Customer Management
 * @checklist §2.14, §4.2.1
 * @purpose Customer listing and CRUD per Master Spec §2.14
 * 
 * @behaviour
 *  - Bilingual display: nameEn/nameAr (RTL support)
 *  - Document fields: Emirates ID, Passport, License (§2.14)
 *  - Communication prefs: preferredLanguage, marketingOptIn, DND window (§4.2.1)
 *  - Quick create: Inline customer creation dialog
 *  - Search: Type-ahead filtering by name/ID
 *  - Disable/Enable: Soft-delete pattern (no hard delete)
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.14, §4.2.1)
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useBilingualField } from '@/hooks/useBilingualField';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { ListPageLayout, FilterPanel, FilterGroup, FilterSearch } from '@/components/layouts';
import { MaterialSymbol } from '@/components/MaterialSymbol';
import type { Customer } from '@shared/schema';
import { insertCustomerSchema } from '@shared/schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Extend the shared schema to handle nullable fields for forms
const customerFormSchema = insertCustomerSchema.extend({
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  nameAr: z.string().optional().transform(val => val || undefined),
  gender: z.string().optional().transform(val => val || undefined),
  address: z.string().optional().transform(val => val || undefined),
  licenseIssuedBy: z.string().optional().transform(val => val || undefined),
  notes: z.string().optional().transform(val => val || undefined),
  // Driver service preferences
  preferredDriverService: z.boolean().optional(),
  preferredDriverServiceType: z.string().optional(),
  // Required fields: nationalId, nationality, phone, licenseNumber (inherited from insertCustomerSchema)
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface PhoneDuplicateWarning {
  hasDuplicate: boolean;
  duplicateCount: number;
  duplicateCustomers: Array<{ id: string; nameEn: string | null; nameAr: string | null }>;
}

// CustomerForm component - moved outside to prevent re-renders and input focus loss
interface CustomerFormProps {
  form: any;
  phoneWarning: PhoneDuplicateWarning | null;
  t: (key: string) => string;
  onSubmit: (data: CustomerFormData) => void;
  isPending: boolean;
}

const CustomerForm = ({ form, phoneWarning, t, onSubmit, isPending }: CustomerFormProps) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs defaultValue="basic" className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" data-testid="tab-customer-basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-customer-contact">Contact</TabsTrigger>
            <TabsTrigger value="license" data-testid="tab-customer-license">License</TabsTrigger>
            <TabsTrigger value="additional" data-testid="tab-customer-additional">Additional</TabsTrigger>
          </TabsList>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-0 space-y-4">
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
      <div className="grid grid-cols-2 gap-4">
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
        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality / الجنسية</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-customer-nationality" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('customers.gender')}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger data-testid="select-customer-gender">
                    <SelectValue placeholder={t('customers.gender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('customers.male')}</SelectItem>
                    <SelectItem value="female">{t('customers.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('customers.dateOfBirth')}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  data-testid="input-customer-dob"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-0 space-y-4">
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
            {phoneWarning && phoneWarning.hasDuplicate && (
              <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" data-testid="alert-phone-duplicate-warning">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Warning: This phone number is already used by customer(s): {phoneWarning.duplicateCustomers.map(c => c.nameEn || c.nameAr || 'Unknown').join(', ')}. You can still proceed if this is intentional.
                </AlertDescription>
              </Alert>
            )}
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
          </TabsContent>

          {/* License Tab */}
          <TabsContent value="license" className="mt-0 space-y-4">
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
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="licenseIssuedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Issued By / صدر الرخصة</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-customer-license-issued-by" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="licenseIssueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Issue Date / تاريخ الإصدار</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  data-testid="input-customer-license-issue-date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
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
      
            <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="rta-license-fields">
          <AccordionTrigger>RTA License Details / تفاصيل رخصة القيادة</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licensePermittedVehicles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permitted Vehicles / المركبات المسموح بها</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} placeholder="e.g., Light vehicles" data-testid="input-customer-permitted-vehicles" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseTransmissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission Type / نوع ناقل الحركة</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger data-testid="select-customer-transmission-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic / أوتوماتيك</SelectItem>
                          <SelectItem value="manual">Manual / يدوي</SelectItem>
                          <SelectItem value="both">Both / كلاهما</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licenseWearingGlasses"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Wearing Glasses / نظارات طبية</FormLabel>
                      <div className="text-sm text-muted-foreground">Required to wear glasses while driving</div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4"
                        data-testid="checkbox-customer-wearing-glasses"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licensePlaceOfIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Place of Issue / مكان الإصدار</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-customer-license-place-of-issue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="licenseLicensingAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licensing Authority / سلطة الترخيص</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-customer-licensing-authority" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseTrafficCodeNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traffic Code No / رقم كود المرور</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-customer-license-traffic-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="licenseDateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License DOB / تاريخ الميلاد</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-customer-license-dob"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseDateOfIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Issue Date / تاريخ الإصدار</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-customer-license-issue-date-rta"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseDateOfExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Expiry / تاريخ الانتهاء</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-customer-license-expiry-rta"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Additional Tab */}
          <TabsContent value="additional" className="mt-0 space-y-4">
            <div className="space-y-4 p-4 border rounded-md">
              <h4 className="font-medium">Driver Service Preferences</h4>
              <FormField
                control={form.control}
                name="preferredDriverService"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-preferred-driver-service"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Prefers Driver Service
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Customer prefers professional driver service for rentals
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              {form.watch('preferredDriverService') && (
                <FormField
                  control={form.control}
                  name="preferredDriverServiceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Service Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger data-testid="select-preferred-driver-service-type">
                            <SelectValue placeholder="Select preferred type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily Rate</SelectItem>
                          <SelectItem value="hourly">Hourly Rate</SelectItem>
                          <SelectItem value="flat">Flat Fee</SelectItem>
                          <SelectItem value="none">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes / ملاحظات</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} data-testid="input-customer-notes" placeholder="Additional notes..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20">
          <Button type="submit" disabled={isPending} data-testid="button-submit-customer">
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </Tabs>
    </form>
  </Form>
);

export default function Customers() {
  const { t } = useTranslation();
  const { getBilingualValue } = useBilingualField();
  const { isAuthenticated, isLoading, user, isViewer } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'disabled'>('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);
  const [phoneWarning, setPhoneWarning] = useState<PhoneDuplicateWarning | null>(null);
  const phoneCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      nameEn: '',
      nameAr: '',
      nationalId: '',
      nationality: '',
      gender: '',
      dateOfBirth: undefined,
      phone: '',
      email: '',
      address: '',
      licenseNumber: '',
      licenseIssuedBy: '',
      licenseIssueDate: undefined,
      licenseExpiryDate: undefined,
    },
  });

  // Watch phone field for changes
  const phoneValue = form.watch('phone');

  // Check for duplicate phone numbers with debouncing
  useEffect(() => {
    // Clear any existing timeout
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }

    // Clear warning if phone is empty
    if (!phoneValue || phoneValue.trim() === '') {
      setPhoneWarning(null);
      return;
    }

    // Debounce the API call
    phoneCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const excludeId = selectedCustomer?.id || '';
        const url = `/api/customers/check-phone/${encodeURIComponent(phoneValue)}${excludeId ? `?excludeId=${excludeId}` : ''}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data: PhoneDuplicateWarning = await response.json();
          
          if (data.hasDuplicate) {
            setPhoneWarning(data);
          } else {
            setPhoneWarning(null);
          }
        }
      } catch (error) {
        console.error('Error checking phone uniqueness:', error);
      }
    }, 500);

    // Cleanup function
    return () => {
      if (phoneCheckTimeoutRef.current) {
        clearTimeout(phoneCheckTimeoutRef.current);
      }
    };
  }, [phoneValue, selectedCustomer?.id]);

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
        dateOfBirth: data.dateOfBirth || null,
        licenseIssueDate: data.licenseIssueDate || null,
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
    setPhoneWarning(null);
    form.reset({
      nameEn: customer.nameEn ?? '',
      nameAr: customer.nameAr ?? '',
      nationalId: customer.nationalId ?? '',
      nationality: customer.nationality || '',
      gender: customer.gender || '',
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth) : undefined,
      phone: customer.phone ?? '',
      email: customer.email || '',
      address: customer.address || '',
      licenseNumber: customer.licenseNumber || '',
      licenseIssuedBy: customer.licenseIssuedBy || '',
      licenseIssueDate: customer.licenseIssueDate ? new Date(customer.licenseIssueDate) : undefined,
      licenseExpiryDate: customer.licenseExpiryDate ? new Date(customer.licenseExpiryDate) : undefined,
    });
    setEditOpen(true);
  };

  const handleCreateDialogChange = (open: boolean) => {
    setCreateOpen(open);
    if (!open) {
      setPhoneWarning(null);
      form.reset();
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setPhoneWarning(null);
      setSelectedCustomer(null);
      form.reset();
    }
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

  const CustomerTable = ({ customers, showActions }: { customers: Customer[]; showActions: 'disable' | 'enable' }) => (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">{t('customers.name')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('customers.nationalId')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('customers.phone')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('customers.email')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('customers.licenseNumber')}</TableHead>
            <TableHead className="font-semibold text-foreground text-right">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <MaterialSymbol name="person_off" size="xl" className="text-muted-foreground/50" />
                  <span>{t('customers.noCustomers')}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow 
                key={customer.id} 
                data-testid={`row-customer-${customer.id}`}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MaterialSymbol name="person" size="sm" className="text-primary" />
                    </div>
                    <span>{getBilingualValue(customer.nameEn, customer.nameAr)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.nationalId}</TableCell>
                <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{customer.licenseNumber || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    {!isViewer && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(customer)}
                        data-testid={`button-edit-customer-${customer.id}`}
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <MaterialSymbol name="edit" size="sm" />
                      </Button>
                    )}
                    {isAdmin && showActions === 'disable' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDisableClick(customer)}
                        data-testid={`button-disable-customer-${customer.id}`}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <MaterialSymbol name="block" size="sm" />
                      </Button>
                    )}
                    {isAdmin && showActions === 'enable' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEnableClick(customer)}
                        data-testid={`button-enable-customer-${customer.id}`}
                        className="h-8 w-8 hover:bg-green-500/10 hover:text-green-600"
                      >
                        <MaterialSymbol name="check_circle" size="sm" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div data-testid="page-customers">
      <ListPageLayout
        title={t('customers.title')}
        actionButton={
          !isViewer && (
            <Dialog open={createOpen} onOpenChange={handleCreateDialogChange}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-customer" className="gap-2">
                  <MaterialSymbol name="person_add" size="sm" />
                  {t('customers.addCustomer')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                  <DialogTitle>{t('customers.newCustomer')}</DialogTitle>
                  <DialogDescription>
                    {t('customers.addCustomer')}
                  </DialogDescription>
                </DialogHeader>
                <CustomerForm form={form} phoneWarning={phoneWarning} t={t} onSubmit={handleCreate} isPending={createMutation.isPending} />
              </DialogContent>
            </Dialog>
          )
        }
        filterPanel={
          <FilterPanel title={t('common.filters')} showButtons={false}>
            <FilterGroup label={t('customers.searchPlaceholder')}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MaterialSymbol name="search" size="sm" />
                </span>
                <Input
                  placeholder={t('customers.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg"
                  data-testid="input-search-customers"
                />
              </div>
            </FilterGroup>
            
            <FilterGroup label={t('common.status')}>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors">
                  <input
                    type="radio"
                    name="customer-status"
                    checked={activeTab === 'active'}
                    onChange={() => setActiveTab('active')}
                    className="h-4 w-4 border-2 border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{t('customers.activeCustomers')} ({activeCustomers.length})</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors">
                  <input
                    type="radio"
                    name="customer-status"
                    checked={activeTab === 'disabled'}
                    onChange={() => setActiveTab('disabled')}
                    className="h-4 w-4 border-2 border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{t('customers.disabledCustomers')} ({disabledCustomers.length})</span>
                </label>
              </div>
            </FilterGroup>
          </FilterPanel>
        }
      >
        {activeTab === 'active' ? (
          activeLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MaterialSymbol name="progress_activity" className="animate-spin" />
                {t('common.loading')}
              </div>
            </div>
          ) : (
            <CustomerTable customers={filteredActiveCustomers} showActions="disable" />
          )
        ) : (
          disabledLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MaterialSymbol name="progress_activity" className="animate-spin" />
                {t('common.loading')}
              </div>
            </div>
          ) : (
            <CustomerTable customers={filteredDisabledCustomers} showActions="enable" />
          )
        )}
      </ListPageLayout>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{t('customers.editCustomer')}</DialogTitle>
            <DialogDescription>
              {t('customers.editCustomer')}
            </DialogDescription>
          </DialogHeader>
          <CustomerForm form={form} phoneWarning={phoneWarning} t={t} onSubmit={handleUpdate} isPending={updateMutation.isPending} />
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
