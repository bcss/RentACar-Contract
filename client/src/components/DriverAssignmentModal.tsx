import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle2, Calendar, Clock } from 'lucide-react';
import type { Driver, Contract } from '@shared/schema';

const driverAssignmentSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  assignmentNotes: z.string().optional(),
}).refine((data) => {
  return data.endDateTime > data.startDateTime;
}, {
  message: "End date must be after start date",
  path: ["endDateTime"],
});

type DriverAssignmentFormData = z.infer<typeof driverAssignmentSchema>;

interface DriverAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  onSuccess?: () => void;
}

export function DriverAssignmentModal({
  open,
  onOpenChange,
  contract,
  onSuccess,
}: DriverAssignmentModalProps) {
  const { toast } = useToast();
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    isAvailable: boolean;
    message: string;
    conflicts?: any[];
  } | null>(null);

  const form = useForm<DriverAssignmentFormData>({
    resolver: zodResolver(driverAssignmentSchema),
    defaultValues: {
      driverId: '',
      startDateTime: contract.rentalStartDate || new Date(),
      endDateTime: contract.rentalEndDate || new Date(),
      assignmentNotes: '',
    },
  });

  // Fetch active drivers
  const { data: drivers = [], isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ['/api/drivers', 'active'],
    enabled: open,
  });

  // Create driver assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: DriverAssignmentFormData) => {
      return await apiRequest('POST', '/api/driver-assignments', {
        contractId: contract.id,
        driverId: data.driverId,
        startDateTime: data.startDateTime.toISOString(),
        endDateTime: data.endDateTime.toISOString(),
        assignmentNotes: data.assignmentNotes,
        status: 'scheduled',
        createdBy: '', // Will be set by backend
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts', contract.id] });
      toast({
        title: "Driver Assigned",
        description: "Driver has been successfully assigned to this contract",
      });
      onOpenChange(false);
      form.reset();
      setAvailabilityStatus(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign driver",
        variant: "destructive",
      });
    },
  });

  // Check driver availability
  const checkAvailability = async () => {
    const driverId = form.getValues('driverId');
    const startDateTime = form.getValues('startDateTime');
    const endDateTime = form.getValues('endDateTime');

    if (!driverId || !startDateTime || !endDateTime) {
      toast({
        title: "Missing Information",
        description: "Please select a driver and date range first",
        variant: "destructive",
      });
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await fetch(
        `/api/drivers/${driverId}/availability?` +
        `startDateTime=${startDateTime.toISOString()}&` +
        `endDateTime=${endDateTime.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      const data = await response.json();
      setAvailabilityStatus(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check driver availability",
        variant: "destructive",
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onSubmit = (data: DriverAssignmentFormData) => {
    createAssignmentMutation.mutate(data);
  };

  const selectedDriver = drivers.find(d => d.id === form.watch('driverId'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assign Driver to Contract
          </DialogTitle>
          <DialogDescription>
            Contract #{contract.contractNumber} - {contract.status}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Driver *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setAvailabilityStatus(null); // Reset availability when driver changes
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-driver">
                        <SelectValue placeholder="Choose a driver..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {driversLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading drivers...
                        </div>
                      ) : drivers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No active drivers available
                        </div>
                      ) : (
                        drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            <div className="flex items-center gap-2">
                              <span>{driver.driverCode}</span>
                              <span className="text-muted-foreground">-</span>
                              <span>{driver.nameEn}</span>
                              {driver.availability === 'available' && (
                                <Badge variant="secondary" className="ml-2">Available</Badge>
                              )}
                              {driver.availability === 'busy' && (
                                <Badge variant="outline" className="ml-2">Busy</Badge>
                              )}
                              {driver.availability === 'off_duty' && (
                                <Badge variant="outline" className="ml-2">Off Duty</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedDriver && (
              <div className="rounded-lg border p-3 space-y-1 bg-muted/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Driver Details</p>
                  <Badge>{selectedDriver.availability}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Code:</span>{' '}
                    <span className="font-mono">{selectedDriver.driverCode}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">License:</span>{' '}
                    <span className="font-mono">{selectedDriver.licenseNumber}</span>
                  </div>
                  {selectedDriver.mobile && (
                    <div>
                      <span className="text-muted-foreground">Mobile:</span>{' '}
                      <span>{selectedDriver.mobile}</span>
                    </div>
                  )}
                  {selectedDriver.outsourceCompanyId && (
                    <div>
                      <span className="text-muted-foreground">Company:</span>{' '}
                      <span>Outsourced</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) => {
                          field.onChange(new Date(e.target.value));
                          setAvailabilityStatus(null); // Reset availability when dates change
                        }}
                        data-testid="input-start-datetime"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) => {
                          field.onChange(new Date(e.target.value));
                          setAvailabilityStatus(null); // Reset availability when dates change
                        }}
                        data-testid="input-end-datetime"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={checkAvailability}
                disabled={checkingAvailability || !form.watch('driverId')}
                className="flex-1"
                data-testid="button-check-availability"
              >
                {checkingAvailability ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Check Availability
                  </>
                )}
              </Button>
            </div>

            {availabilityStatus && (
              <Alert variant={availabilityStatus.isAvailable ? "default" : "destructive"}>
                <div className="flex items-start gap-2">
                  {availabilityStatus.isAvailable ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-[hsl(var(--positive))]" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <p className="font-medium mb-1">
                        {availabilityStatus.isAvailable
                          ? 'Driver Available'
                          : 'Scheduling Conflict Detected'}
                      </p>
                      <p className="text-sm">{availabilityStatus.message}</p>
                      {availabilityStatus.conflicts && availabilityStatus.conflicts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-medium">Conflicts:</p>
                          {availabilityStatus.conflicts.map((conflict, idx) => (
                            <div key={idx} className="text-xs bg-background/50 rounded p-2">
                              {conflict.type === 'assignment' && (
                                <p>Contract {conflict.contractNumber}: {new Date(conflict.startDateTime).toLocaleString()} - {new Date(conflict.endDateTime).toLocaleString()}</p>
                              )}
                              {conflict.type === 'schedule_block' && (
                                <p>Scheduled Block: {conflict.blockType} - {new Date(conflict.startDateTime).toLocaleString()} - {new Date(conflict.endDateTime).toLocaleString()}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="assignmentNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any special instructions or notes for this assignment..."
                      rows={3}
                      data-testid="input-assignment-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                  setAvailabilityStatus(null);
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createAssignmentMutation.isPending ||
                  (availabilityStatus !== null && !availabilityStatus.isAvailable)
                }
                data-testid="button-assign-driver"
              >
                {createAssignmentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Driver'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
