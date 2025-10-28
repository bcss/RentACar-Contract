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
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit, Ban, CheckCircle } from 'lucide-react';
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
      <DialogFooter>
        <Button type="submit" disabled={isPending} data-testid="button-submit-vehicle">
          {isPending ? t('common.saving') : t('common.save')}
        </Button>
      </DialogFooter>
    </form>
  </Form>
);

export default function Vehicles() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user, isViewer } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const statusFilterFromUrl = searchParams.get('status'); // e.g., 'rented', 'available'
  
  const [searchQuery, setSearchQuery] = useState('');
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

  const VehicleTable = ({ vehicles, showActions }: { vehicles: Vehicle[]; showActions: 'disable' | 'enable' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('vehicles.registration')}</TableHead>
          <TableHead>{t('vehicles.make')} / {t('vehicles.model')}</TableHead>
          <TableHead>{t('vehicles.year')}</TableHead>
          <TableHead>{t('vehicles.color')}</TableHead>
          <TableHead>{t('vehicles.status')}</TableHead>
          <TableHead>{t('vehicles.dailyRate')}</TableHead>
          <TableHead>{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              {t('vehicles.noVehicles')}
            </TableCell>
          </TableRow>
        ) : (
          vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} data-testid={`row-vehicle-${vehicle.id}`}>
              <TableCell className="font-medium">{vehicle.registration}</TableCell>
              <TableCell>
                <div>{vehicle.make} {vehicle.model}</div>
                <div className="text-sm text-muted-foreground">
                  {vehicle.fuelType}{vehicle.tankCapacity ? ` (${vehicle.tankCapacity}L)` : ''}
                </div>
              </TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>{vehicle.color || '-'}</TableCell>
              <TableCell>
                <span className={`text-sm px-2 py-1 rounded ${
                  vehicle.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  vehicle.status === 'rented' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {vehicle.status}
                </span>
              </TableCell>
              <TableCell>{vehicle.dailyRate}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {!isViewer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                      data-testid={`button-edit-vehicle-${vehicle.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {isAdmin && showActions === 'disable' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisableClick(vehicle)}
                      data-testid={`button-disable-vehicle-${vehicle.id}`}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                  {isAdmin && showActions === 'enable' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnableClick(vehicle)}
                      data-testid={`button-enable-vehicle-${vehicle.id}`}
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
    <div className="container mx-auto p-6" data-testid="page-vehicles">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('vehicles.title')}</CardTitle>
            {!isViewer && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-vehicle">
                    <Plus className="h-4 w-4 mr-2" />
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('vehicles.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-vehicles"
              />
            </div>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active" data-testid="tab-active-vehicles">
                {t('vehicles.activeVehicles')} ({activeVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="disabled" data-testid="tab-disabled-vehicles">
                {t('vehicles.disabledVehicles')} ({disabledVehicles.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <VehicleTable vehicles={filteredActiveVehicles} showActions="disable" />
              )}
            </TabsContent>

            <TabsContent value="disabled">
              {disabledLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <VehicleTable vehicles={filteredDisabledVehicles} showActions="enable" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
