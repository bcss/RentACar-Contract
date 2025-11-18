import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, AlertCircle } from "lucide-react";
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
  insertIncidentSchema,
  type Incident,
  type InsertIncident
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const SEVERITY_COLORS = {
  minor: "secondary",
  moderate: "default",
  major: "destructive",
  total_loss: "destructive",
} as const;

export default function Incidents() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: drivers = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers"],
  });

  const form = useForm<InsertIncident>({
    resolver: zodResolver(insertIncidentSchema),
    defaultValues: {
      contractId: "",
      vehicleId: "",
      customerId: undefined,
      driverId: undefined,
      incidentType: "accident",
      severity: "minor",
      incidentDate: new Date(),
      location: "",
      description: "",
      policeReportNumber: "",
      insuranceClaimNumber: "",
      estimatedCost: "",
      actualCost: "",
      deductibleAmount: "",
      customerLiability: "",
      status: "reported",
      photoUrls: [],
      documentUrls: [],
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertIncident) => apiRequest("POST", "/api/incidents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      showSuccess(t("success"), "Incident created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertIncident> }) =>
      apiRequest("PATCH", `/api/incidents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      showSuccess(t("success"), "Incident updated successfully");
      setDialogOpen(false);
      setEditingIncident(null);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const handleCreate = () => {
    setEditingIncident(null);
    form.reset({
      contractId: "",
      vehicleId: "",
      customerId: undefined,
      driverId: undefined,
      incidentType: "accident",
      severity: "minor",
      incidentDate: new Date(),
      location: "",
      description: "",
      policeReportNumber: "",
      insuranceClaimNumber: "",
      estimatedCost: "",
      actualCost: "",
      deductibleAmount: "",
      customerLiability: "",
      status: "reported",
      photoUrls: [],
      documentUrls: [],
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    form.reset({
      contractId: incident.contractId,
      vehicleId: incident.vehicleId,
      customerId: incident.customerId || undefined,
      driverId: incident.driverId || undefined,
      incidentType: incident.incidentType,
      severity: incident.severity as any,
      incidentDate: incident.incidentDate,
      location: incident.location || "",
      description: incident.description,
      policeReportNumber: incident.policeReportNumber || "",
      insuranceClaimNumber: incident.insuranceClaimNumber || "",
      estimatedCost: incident.estimatedCost || "",
      actualCost: incident.actualCost || "",
      deductibleAmount: incident.deductibleAmount || "",
      customerLiability: incident.customerLiability || "",
      status: incident.status as any,
      photoUrls: incident.photoUrls || [],
      documentUrls: incident.documentUrls || [],
      notes: incident.notes || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertIncident) => {
    if (editingIncident) {
      updateMutation.mutate({ id: editingIncident.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("incidents")}
          </h1>
          <p className="text-muted-foreground mt-1">Track accidents, damage, and incident claims</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-incident">
          <Plus className="w-4 h-4 mr-2" />
          Add Incident
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Incident Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No incidents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Insurance Claim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => {
                  const contract = contracts.find(c => c.id === incident.contractId);
                  const vehicle = vehicles.find(v => v.id === incident.vehicleId);
                  return (
                    <TableRow key={incident.id} data-testid={`table-row-incident-${incident.id}`}>
                      <TableCell className="font-medium">{contract?.contractNumber || "N/A"}</TableCell>
                      <TableCell>{vehicle?.registration || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{incident.incidentType}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(incident.incidentDate), "PP")}</TableCell>
                      <TableCell>
                        <Badge variant={SEVERITY_COLORS[incident.severity as keyof typeof SEVERITY_COLORS] || "secondary"}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{incident.insuranceClaimNumber || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            incident.status === "closed"
                              ? "default"
                              : incident.status === "reported"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(incident)}
                          data-testid={`button-edit-incident-${incident.id}`}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIncident ? "Edit Incident" : "Add Incident"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contractId">
                            <SelectValue placeholder="Select contract" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contracts.map((contract) => (
                            <SelectItem key={contract.id} value={contract.id}>
                              {contract.contractNumber}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incidentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-incidentType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="accident">Accident</SelectItem>
                          <SelectItem value="theft">Theft</SelectItem>
                          <SelectItem value="damage">Damage</SelectItem>
                          <SelectItem value="breakdown">Breakdown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-severity">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="major">Major</SelectItem>
                          <SelectItem value="total_loss">Total Loss</SelectItem>
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
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Date *</FormLabel>
                      <FormControl>
                        <DateSelector
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-incidentDate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-location" placeholder="Incident location" />
                    </FormControl>
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
                      <Textarea {...field} data-testid="input-description" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="policeReportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Police Report Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-policeReportNumber" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceClaimNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Claim Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-insuranceClaimNumber" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-estimatedCost" type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Cost (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-actualCost" type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deductibleAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deductible Amount (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-deductibleAmount" type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerLiability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Liability (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customerLiability" type="number" step="0.01" />
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="under_investigation">Under Investigation</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Textarea {...field} data-testid="input-notes" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-incident">
                  {editingIncident ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
