import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Wrench, Edit, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleServiceRecordSchema, type VehicleServiceRecord, type InsertVehicleServiceRecord, type Vehicle } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const SERVICE_TYPES = [
  { value: "oil_change", label: "Oil Change" },
  { value: "tire_replacement", label: "Tire Replacement" },
  { value: "brake_service", label: "Brake Service" },
  { value: "engine_repair", label: "Engine Repair" },
  { value: "transmission", label: "Transmission" },
  { value: "ac_service", label: "A/C Service" },
  { value: "battery", label: "Battery" },
  { value: "inspection", label: "Inspection" },
  { value: "other", label: "Other" },
];

export default function VehicleMaintenance() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleServiceRecord | null>(null);
  const [filters, setFilters] = useState({
    vehicleId: "all",
    serviceType: "all",
  });

  const { data: serviceRecords = [], isLoading } = useQuery<VehicleServiceRecord[]>({
    queryKey: ["/api/vehicle-service-records"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const form = useForm<InsertVehicleServiceRecord>({
    resolver: zodResolver(insertVehicleServiceRecordSchema),
    defaultValues: {
      vehicleId: "",
      serviceType: "oil_change",
      serviceDate: new Date(),
      odometerReading: undefined,
      serviceProvider: "",
      description: "",
      cost: "",
      nextServiceDue: undefined,
      nextServiceOdometer: undefined,
      invoiceNumber: "",
      documentUrls: [],
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertVehicleServiceRecord) => apiRequest("POST", "/api/vehicle-service-records", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-service-records"] });
      showSuccess(t("success"), "Service record created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertVehicleServiceRecord> }) =>
      apiRequest("PATCH", `/api/vehicle-service-records/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-service-records"] });
      showSuccess(t("success"), "Service record updated successfully");
      setDialogOpen(false);
      setEditingRecord(null);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const handleCreate = () => {
    setEditingRecord(null);
    form.reset({
      vehicleId: "",
      serviceType: "oil_change",
      serviceDate: new Date(),
      odometerReading: undefined,
      serviceProvider: "",
      description: "",
      cost: "",
      nextServiceDue: undefined,
      nextServiceOdometer: undefined,
      invoiceNumber: "",
      documentUrls: [],
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (record: VehicleServiceRecord) => {
    setEditingRecord(record);
    form.reset({
      vehicleId: record.vehicleId,
      serviceType: record.serviceType,
      serviceDate: record.serviceDate ? new Date(record.serviceDate) : new Date(),
      odometerReading: record.odometerReading ?? undefined,
      serviceProvider: record.serviceProvider || "",
      description: record.description || "",
      cost: record.cost || "",
      nextServiceDue: record.nextServiceDue ? new Date(record.nextServiceDue) : undefined,
      nextServiceOdometer: record.nextServiceOdometer ?? undefined,
      invoiceNumber: record.invoiceNumber || "",
      documentUrls: record.documentUrls || [],
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertVehicleServiceRecord) => {
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return serviceRecords.filter((record) => {
      if (filters.vehicleId && filters.vehicleId !== "all" && record.vehicleId !== filters.vehicleId) return false;
      if (filters.serviceType && filters.serviceType !== "all" && record.serviceType !== filters.serviceType) return false;
      return true;
    });
  }, [serviceRecords, filters]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalCost = filteredRecords.reduce((sum, record) => {
      const cost = parseFloat(record.cost || "0");
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);

    const averageCost = filteredRecords.length > 0 ? totalCost / filteredRecords.length : 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const servicesThisMonth = filteredRecords.filter((record) => {
      const serviceDate = new Date(record.serviceDate);
      return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
    }).length;

    return { totalCost, averageCost, servicesThisMonth };
  }, [filteredRecords]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("vehicleMaintenance")}
          </h1>
          <p className="text-muted-foreground mt-1">Manage vehicle service records and maintenance history</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-service-record">
          <Plus className="w-4 h-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Service Cost</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cost">
              AED {summaryMetrics.totalCost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost per Service</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-average-cost">
              AED {summaryMetrics.averageCost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services This Month</CardTitle>
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-services-month">
              {summaryMetrics.servicesThisMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Vehicle</label>
              <Select value={filters.vehicleId} onValueChange={(value) => setFilters({ ...filters, vehicleId: value })}>
                <SelectTrigger data-testid="select-filter-vehicle">
                  <SelectValue placeholder="All Vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Service Type</label>
              <Select value={filters.serviceType} onValueChange={(value) => setFilters({ ...filters, serviceType: value })}>
                <SelectTrigger data-testid="select-filter-service-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Service Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No service records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Next Service Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const vehicle = vehicles.find((v) => v.id === record.vehicleId);
                  return (
                    <TableRow key={record.id} data-testid={`table-row-service-record-${record.id}`}>
                      <TableCell>
                        <div className="font-medium">
                          {vehicle?.registration || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle?.make} {vehicle?.model}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {SERVICE_TYPES.find((t) => t.value === record.serviceType)?.label || record.serviceType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.serviceDate ? format(new Date(record.serviceDate), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell>{record.odometerReading ? `${record.odometerReading.toLocaleString()} km` : "-"}</TableCell>
                      <TableCell>
                        <span className="font-medium">AED {record.cost || "0.00"}</span>
                      </TableCell>
                      <TableCell>
                        {record.nextServiceDue ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(record.nextServiceDue), "dd MMM yyyy")}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(record)}
                          data-testid={`button-edit-service-record-${record.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Service Record" : "Add New Service Record"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle-id">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.registration} - {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-service-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="odometerReading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odometer Reading (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-odometer-reading"
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
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Cost (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-cost" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Provider</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-service-provider" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nextServiceDue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Service Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-next-service-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextServiceOdometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Service Odometer (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-next-service-odometer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-invoice-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-description" />
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
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
