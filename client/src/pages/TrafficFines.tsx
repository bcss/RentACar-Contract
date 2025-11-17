import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DateSelector } from "@/components/ui/date-selector";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertTrafficFineSchema,
  type TrafficFine,
  type InsertTrafficFine
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function TrafficFines() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFine, setEditingFine] = useState<TrafficFine | null>(null);

  const { data: trafficFines = [], isLoading } = useQuery<TrafficFine[]>({
    queryKey: ["/api/traffic-fines"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: drivers = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers"],
  });

  const form = useForm<InsertTrafficFine>({
    resolver: zodResolver(insertTrafficFineSchema),
    defaultValues: {
      vehicleId: "",
      customerId: undefined,
      driverId: undefined,
      contractId: undefined,
      fineSource: "RTA",
      fineCategory: "Traffic",
      fineCode: "",
      description: "",
      fineDate: new Date(),
      amount: "",
      blackPoints: 0,
      paymentStatus: "pending",
      paidBy: "",
      documentUrl: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTrafficFine) => apiRequest("POST", "/api/traffic-fines", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic-fines"] });
      showSuccess(t("success"), "Traffic fine created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTrafficFine> }) =>
      apiRequest("PATCH", `/api/traffic-fines/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic-fines"] });
      showSuccess(t("success"), "Traffic fine updated successfully");
      setDialogOpen(false);
      setEditingFine(null);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const handleCreate = () => {
    setEditingFine(null);
    form.reset({
      vehicleId: "",
      customerId: undefined,
      driverId: undefined,
      contractId: undefined,
      fineSource: "RTA",
      fineCategory: "Traffic",
      fineCode: "",
      description: "",
      fineDate: new Date(),
      amount: "",
      blackPoints: 0,
      paymentStatus: "pending",
      paidBy: "",
      documentUrl: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (fine: TrafficFine) => {
    setEditingFine(fine);
    form.reset({
      vehicleId: fine.vehicleId,
      customerId: fine.customerId || undefined,
      driverId: fine.driverId || undefined,
      contractId: fine.contractId || undefined,
      fineSource: fine.fineSource,
      fineCategory: fine.fineCategory,
      fineCode: fine.fineCode || "",
      description: fine.description,
      fineDate: fine.fineDate,
      amount: fine.amount,
      blackPoints: fine.blackPoints || 0,
      paymentStatus: fine.paymentStatus as any,
      paidBy: fine.paidBy || "",
      paidDate: fine.paidDate || undefined,
      documentUrl: fine.documentUrl || "",
      notes: fine.notes || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertTrafficFine) => {
    if (editingFine) {
      updateMutation.mutate({ id: editingFine.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Calculate totals
  const totalAmount = trafficFines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
  const totalBlackPoints = trafficFines.reduce((sum, fine) => sum + (fine.blackPoints || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("trafficFines")}
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage traffic violations and fines</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-traffic-fine">
          <Plus className="w-4 h-4 mr-2" />
          Add Traffic Fine
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Fines Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Black Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBlackPoints}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Traffic Fines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : trafficFines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No traffic fines found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Fine Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Black Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficFines.map((fine) => {
                  const vehicle = vehicles.find(v => v.id === fine.vehicleId);
                  const customer = customers.find(c => c.id === fine.customerId);
                  return (
                    <TableRow key={fine.id} data-testid={`table-row-traffic-fine-${fine.id}`}>
                      <TableCell className="font-medium">{vehicle?.registration || "N/A"}</TableCell>
                      <TableCell>{customer?.nameEn || "N/A"}</TableCell>
                      <TableCell>{format(new Date(fine.fineDate), "PP")}</TableCell>
                      <TableCell>{fine.fineCategory}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fine.fineSource}</Badge>
                      </TableCell>
                      <TableCell>AED {fine.amount}</TableCell>
                      <TableCell>
                        {fine.blackPoints ? (
                          <Badge variant="destructive">{fine.blackPoints}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            fine.paymentStatus === "paid"
                              ? "default"
                              : fine.paymentStatus === "pending"
                              ? "secondary"
                              : fine.paymentStatus === "disputed"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {fine.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(fine)}
                          data-testid={`button-edit-traffic-fine-${fine.id}`}
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFine ? "Edit Traffic Fine" : "Add Traffic Fine"}
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
                          <SelectTrigger data-testid="select-vehicleId">
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
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-customerId">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.nameEn}
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
                  name="fineSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fine Source *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-fineSource">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RTA">RTA</SelectItem>
                          <SelectItem value="Police">Police</SelectItem>
                          <SelectItem value="Municipality">Municipality</SelectItem>
                          <SelectItem value="Salik">Salik</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fineCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-fineCategory">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Traffic">Traffic</SelectItem>
                          <SelectItem value="Parking">Parking</SelectItem>
                          <SelectItem value="Toll">Toll</SelectItem>
                          <SelectItem value="Accident">Accident</SelectItem>
                          <SelectItem value="Speeding">Speeding</SelectItem>
                          <SelectItem value="Red Light">Red Light</SelectItem>
                          <SelectItem value="Mobile Usage">Mobile Usage</SelectItem>
                          <SelectItem value="No Seatbelt">No Seatbelt</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
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
                  name="fineCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fine Code</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-fineCode" placeholder="e.g. T123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (AED) *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-amount" type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fineDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fine Date *</FormLabel>
                      <FormControl>
                        <DateSelector
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-fineDate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blackPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Black Points</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          data-testid="input-blackPoints" 
                          type="number" 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-paymentStatus">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="disputed">Disputed</SelectItem>
                          <SelectItem value="waived">Waived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-description" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid By</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-paidBy" placeholder="e.g. customer, company" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document URL</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-documentUrl" placeholder="URL to fine document/photo" />
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
                      <Textarea {...field} data-testid="input-notes" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-traffic-fine">
                  {editingFine ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
