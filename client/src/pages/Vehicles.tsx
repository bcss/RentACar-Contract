/**
 * File: client/src/pages/Vehicles.tsx
 * @area Vehicle Management
 * @checklist §2.10, §3.18-3.23, §4.5
 * @purpose Vehicle listing and CRUD per Master Spec §2.10
 * 
 * @behaviour
 *  - 8 status states: AVAILABLE, RESERVED, OUT, etc. (§3.18)
 *  - Branch assignment and class/group categorization (§4.5)
 *  - Pricing: dailyRate, weeklyRate, monthlyRate
 *  - Quick actions: Edit, Disable, View history
 *  - Maintenance and transfer tracking
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.10, §3.18-3.23)
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
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
import { useErrorDisplay } from '@/components/design-system';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit, Ban, CheckCircle } from 'lucide-react';
import { ListPageLayout, FilterPanel, FilterGroup, FilterSearch } from '@/components/layouts';
import { MaterialSymbol } from '@/components/MaterialSymbol';
import type { Vehicle } from '@shared/schema';
import { insertVehicleSchema } from '@shared/schema';
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
const vehicleFormSchema = insertVehicleSchema.extend({
  weeklyRate: z.string().optional().transform(val => val || undefined),
  monthlyRate: z.string().optional().transform(val => val || undefined),
  color: z.string().optional().transform(val => val || undefined),
  fuelType: z.string().optional().transform(val => val || undefined),
  tankCapacity: z.coerce.number().optional().nullable(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

// VehicleForm component - moved outside to prevent re-renders and input focus loss
interface VehicleFormProps {
  form: any;
  t: (key: string) => string;
  onSubmit: (data: VehicleFormData) => void;
  isPending: boolean;
}

const VehicleForm = ({ form, t, onSubmit, isPending }: VehicleFormProps) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs defaultValue="basic" className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" data-testid="tab-vehicle-basic">Basic Info</TabsTrigger>
            <TabsTrigger value="technical" data-testid="tab-vehicle-technical">Technical</TabsTrigger>
            <TabsTrigger value="ownership" data-testid="tab-vehicle-ownership">Ownership</TabsTrigger>
            <TabsTrigger value="rental" data-testid="tab-vehicle-rental">Rental Settings</TabsTrigger>
          </TabsList>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-0 space-y-4">
            <FormField
              control={form.control}
              name="registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicles.registration')}</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-vehicle-registration" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.make')}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-vehicle-make" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.model')}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-vehicle-model" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.year')}</FormLabel>
              <FormControl>
                <Input type="text" {...field} data-testid="input-vehicle-year" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vehicles.color')}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-vehicle-color" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.fuelType')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle-fuel-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="petrol">{t('vehicles.fuelTypePetrol')}</SelectItem>
                        <SelectItem value="diesel">{t('vehicles.fuelTypeDiesel')}</SelectItem>
                        <SelectItem value="electric">{t('vehicles.fuelTypeElectric')}</SelectItem>
                        <SelectItem value="hybrid">{t('vehicles.fuelTypeHybrid')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tankCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tank Capacity (L)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        data-testid="input-vehicle-tank-capacity" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Technical fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engineNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Number / رقم المحرك</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-engine-no" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chassisNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chassis Number / رقم الهيكل</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-chassis-no" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type / نوع المركبة</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} placeholder="e.g., Sedan, SUV" data-testid="input-vehicle-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelOrigin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Origin / بلد المنشأ</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} placeholder="e.g., Japanese, German" data-testid="input-vehicle-model-origin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grossVehicleWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Vehicle Weight / الوزن الإجمالي</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-gross-weight" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grossVehicleWeightType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Unit / وحدة الوزن</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger data-testid="select-vehicle-weight-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg (كجم)</SelectItem>
                          <SelectItem value="lbs">lbs (رطل)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Ownership Tab */}
          <TabsContent value="ownership" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tcNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TC Number / رقم TC</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-tc-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="placeOfIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Issue / مكان الإصدار</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-place-of-issue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trafficCodeNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traffic Code No / رقم كود المرور</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-traffic-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licensingAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licensing Authority / سلطة الترخيص</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-licensing-authority" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name / اسم المالك</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-owner-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerNationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Nationality / جنسية المالك</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-owner-nationality" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registrationExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Expiry / انتهاء التسجيل</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-vehicle-registration-expiry"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insuranceExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Expiry / انتهاء التأمين</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        data-testid="input-vehicle-insurance-expiry"
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
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number / رقم البوليصة</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-vehicle-policy-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mortgagedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mortgaged By / مرهونة لدى</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} placeholder="If applicable" data-testid="input-vehicle-mortgaged-by" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Rental Settings Tab */}
          <TabsContent value="rental" className="mt-0 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.dailyRate')}</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} data-testid="input-vehicle-daily-rate" />
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
                    <FormLabel>{t('vehicles.weeklyRate')}</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} data-testid="input-vehicle-weekly-rate" />
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
                    <FormLabel>{t('vehicles.monthlyRate')}</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} data-testid="input-vehicle-monthly-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicles.status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-vehicle-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">{t('vehicles.statusAvailable')}</SelectItem>
                      <SelectItem value="rented">{t('vehicles.statusRented')}</SelectItem>
                      <SelectItem value="maintenance">{t('vehicles.statusMaintenance')}</SelectItem>
                      <SelectItem value="out_of_service">{t('vehicles.statusOutOfService')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20">
          <Button type="submit" disabled={isPending} data-testid="button-submit-vehicle">
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </Tabs>
    </form>
  </Form>
);

export default function Vehicles() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user, isViewer } = useAuth();
  const { showError, showSuccess } = useErrorDisplay();
  const { toast } = useToast();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const statusFilterFromUrl = searchParams.get('status'); // e.g., 'rented', 'available'
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'disabled'>('active');
  const [statusFilter, setStatusFilter] = useState<string | null>(statusFilterFromUrl);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [vehicleToToggle, setVehicleToToggle] = useState<Vehicle | null>(null);

  // Update status filter when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const status = params.get('status');
    setStatusFilter(status);
  }, [location]);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      registration: '',
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      color: '',
      fuelType: 'petrol',
      tankCapacity: null,
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      status: 'available',
    },
  });

  const { data: activeVehicles = [], isLoading: activeLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles', 'active'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/vehicles?disabled=false');
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    },
  });

  const { data: disabledVehicles = [], isLoading: disabledLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles', 'disabled'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/vehicles?disabled=true');
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      return apiRequest('POST', '/api/vehicles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: t('common.success'),
        description: t('vehicles.vehicleCreated'),
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
    mutationFn: async (data: VehicleFormData) => {
      if (!selectedVehicle) throw new Error('No vehicle selected');
      return apiRequest('PATCH', `/api/vehicles/${selectedVehicle.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: t('common.success'),
        description: t('vehicles.vehicleUpdated'),
      });
      setEditOpen(false);
      setSelectedVehicle(null);
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
    mutationFn: async (vehicleId: string) => {
      return apiRequest('POST', `/api/vehicles/${vehicleId}/disable`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: t('common.success'),
        description: t('vehicles.vehicleDisabled'),
      });
      setDisableDialogOpen(false);
      setVehicleToToggle(null);
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
    mutationFn: async (vehicleId: string) => {
      return apiRequest('POST', `/api/vehicles/${vehicleId}/enable`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: t('common.success'),
        description: t('vehicles.vehicleEnabled'),
      });
      setEnableDialogOpen(false);
      setVehicleToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreate = (data: VehicleFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    form.reset({
      registration: vehicle.registration ?? '',
      make: vehicle.make ?? '',
      model: vehicle.model ?? '',
      year: vehicle.year ?? new Date().getFullYear().toString(),
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || 'petrol',
      tankCapacity: vehicle.tankCapacity ?? null,
      dailyRate: vehicle.dailyRate ?? '',
      weeklyRate: vehicle.weeklyRate || '',
      monthlyRate: vehicle.monthlyRate || '',
      status: vehicle.status ?? 'available',
    });
    setEditOpen(true);
  };

  const handleUpdate = (data: VehicleFormData) => {
    updateMutation.mutate(data);
  };

  const handleDisableClick = (vehicle: Vehicle) => {
    setVehicleToToggle(vehicle);
    setDisableDialogOpen(true);
  };

  const handleEnableClick = (vehicle: Vehicle) => {
    setVehicleToToggle(vehicle);
    setEnableDialogOpen(true);
  };

  const handleDisableConfirm = () => {
    if (vehicleToToggle) {
      disableMutation.mutate(vehicleToToggle.id);
    }
  };

  const handleEnableConfirm = () => {
    if (vehicleToToggle) {
      enableMutation.mutate(vehicleToToggle.id);
    }
  };

  const filterVehicles = (vehicles: Vehicle[]) => {
    let filtered = vehicles;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.registration?.toLowerCase().includes(query) ||
          v.make?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query) ||
          v.color?.toLowerCase().includes(query)
      );
    }
    
    // Context-aware filter for vehicle status (from dashboard)
    if (statusFilter) {
      filtered = filtered.filter(v => v.status === statusFilter);
    }
    
    return filtered;
  };

  const filteredActiveVehicles = filterVehicles(activeVehicles);
  const filteredDisabledVehicles = filterVehicles(disabledVehicles);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="loading-vehicles">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === 'admin';

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rented':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'reserved':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'out_of_service':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'check_circle';
      case 'rented':
        return 'directions_car';
      case 'maintenance':
        return 'build';
      case 'reserved':
        return 'schedule';
      case 'out_of_service':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const VehicleTable = ({ vehicles, showActions }: { vehicles: Vehicle[]; showActions: 'disable' | 'enable' }) => (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">{t('vehicles.registration')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('vehicles.make')} / {t('vehicles.model')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('vehicles.year')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('vehicles.color')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('vehicles.status')}</TableHead>
            <TableHead className="font-semibold text-foreground">{t('vehicles.dailyRate')}</TableHead>
            <TableHead className="font-semibold text-foreground text-right">{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <MaterialSymbol name="directions_car_filled" size="xl" className="text-muted-foreground/50" />
                  <span>{t('vehicles.noVehicles')}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow 
                key={vehicle.id} 
                data-testid={`row-vehicle-${vehicle.id}`}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MaterialSymbol name="directions_car" size="sm" className="text-primary" />
                    </div>
                    <span>{vehicle.registration}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                  <div className="text-sm text-muted-foreground">
                    {vehicle.fuelType}{vehicle.tankCapacity ? ` (${vehicle.tankCapacity}L)` : ''}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{vehicle.year}</TableCell>
                <TableCell className="text-muted-foreground">{vehicle.color || '-'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadgeStyle(vehicle.status || 'available')}`}>
                    <MaterialSymbol name={getStatusIcon(vehicle.status || 'available')} size="xs" />
                    {vehicle.status}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{vehicle.dailyRate}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    {!isViewer && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vehicle)}
                        data-testid={`button-edit-vehicle-${vehicle.id}`}
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <MaterialSymbol name="edit" size="sm" />
                      </Button>
                    )}
                    {isAdmin && showActions === 'disable' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDisableClick(vehicle)}
                        data-testid={`button-disable-vehicle-${vehicle.id}`}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <MaterialSymbol name="block" size="sm" />
                      </Button>
                    )}
                    {isAdmin && showActions === 'enable' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEnableClick(vehicle)}
                        data-testid={`button-enable-vehicle-${vehicle.id}`}
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
    <div data-testid="page-vehicles">
      <ListPageLayout
        title={t('vehicles.title')}
        actionButton={
          !isViewer && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-vehicle" className="gap-2">
                  <MaterialSymbol name="add_circle" size="sm" />
                  {t('vehicles.addVehicle')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('vehicles.newVehicle')}</DialogTitle>
                  <DialogDescription>
                    {t('vehicles.addVehicle')}
                  </DialogDescription>
                </DialogHeader>
                <VehicleForm form={form} t={t} onSubmit={handleCreate} isPending={createMutation.isPending} />
              </DialogContent>
            </Dialog>
          )
        }
        filterPanel={
          <FilterPanel title={t('common.filters')} showButtons={false}>
            <FilterGroup label={t('vehicles.searchPlaceholder')}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MaterialSymbol name="search" size="sm" />
                </span>
                <Input
                  placeholder={t('vehicles.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg"
                  data-testid="input-search-vehicles"
                />
              </div>
            </FilterGroup>
            
            <FilterGroup label={t('common.status')}>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors">
                  <input
                    type="radio"
                    name="vehicle-status"
                    checked={activeTab === 'active'}
                    onChange={() => setActiveTab('active')}
                    className="h-4 w-4 border-2 border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{t('vehicles.activeVehicles')} ({activeVehicles.length})</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors">
                  <input
                    type="radio"
                    name="vehicle-status"
                    checked={activeTab === 'disabled'}
                    onChange={() => setActiveTab('disabled')}
                    className="h-4 w-4 border-2 border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{t('vehicles.disabledVehicles')} ({disabledVehicles.length})</span>
                </label>
              </div>
            </FilterGroup>

            {statusFilter && (
              <FilterGroup label={t('vehicles.statusFilter')}>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-primary text-sm">
                  <MaterialSymbol name={getStatusIcon(statusFilter)} size="sm" />
                  <span className="font-medium capitalize">{statusFilter}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto hover:bg-primary/20"
                    onClick={() => setStatusFilter(null)}
                  >
                    <MaterialSymbol name="close" size="xs" />
                  </Button>
                </div>
              </FilterGroup>
            )}
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
            <VehicleTable vehicles={filteredActiveVehicles} showActions="disable" />
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
            <VehicleTable vehicles={filteredDisabledVehicles} showActions="enable" />
          )
        )}
      </ListPageLayout>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('vehicles.editVehicle')}</DialogTitle>
            <DialogDescription>
              {t('vehicles.editVehicle')}
            </DialogDescription>
          </DialogHeader>
          <VehicleForm form={form} t={t} onSubmit={handleUpdate} isPending={updateMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('vehicles.disableVehicle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('vehicles.confirmDisableVehicle')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disable-vehicle">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              data-testid="button-confirm-disable-vehicle"
            >
              {t('vehicles.disableVehicle')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable Confirmation */}
      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('vehicles.enableVehicle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('vehicles.confirmEnableVehicle')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enable-vehicle">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableConfirm}
              data-testid="button-confirm-enable-vehicle"
            >
              {t('vehicles.enableVehicle')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
