import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertTollSystemSchema, 
  insertTollGateSchema, 
  insertTollPassSchema,
  type TollSystem,
  type TollGate,
  type TollPass,
  type InsertTollSystem,
  type InsertTollGate,
  type InsertTollPass
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const EMIRATES = [
  { value: "dubai", label: "Dubai" },
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
];

export default function TollManagement() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [activeTab, setActiveTab] = useState("systems");
  
  // Toll Systems State
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<TollSystem | null>(null);
  
  // Toll Gates State
  const [gateDialogOpen, setGateDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<TollGate | null>(null);
  
  // Toll Passes State
  const [passDialogOpen, setPassDialogOpen] = useState(false);
  const [editingPass, setEditingPass] = useState<TollPass | null>(null);

  // Fetch data
  const { data: tollSystems = [], isLoading: systemsLoading } = useQuery<TollSystem[]>({
    queryKey: ["/api/toll-systems"],
  });

  const { data: tollGates = [], isLoading: gatesLoading } = useQuery<TollGate[]>({
    queryKey: ["/api/toll-gates"],
  });

  const { data: tollPasses = [], isLoading: passesLoading } = useQuery<TollPass[]>({
    queryKey: ["/api/toll-passes"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  // Toll System Form
  const systemForm = useForm<InsertTollSystem>({
    resolver: zodResolver(insertTollSystemSchema),
    defaultValues: {
      systemName: "",
      emirate: "dubai",
      provider: "",
      standardFee: "4",
      holidayExempt: false,
      isActive: true,
    },
  });

  // Toll Gate Form
  const gateForm = useForm<InsertTollGate>({
    resolver: zodResolver(insertTollGateSchema),
    defaultValues: {
      tollSystemId: "",
      gateName: "",
      gpsLocation: "",
      direction: "",
      gateType: "",
      isPeakDependent: false,
      isActive: true,
    },
  });

  // Toll Pass Form
  const passForm = useForm<InsertTollPass>({
    resolver: zodResolver(insertTollPassSchema),
    defaultValues: {
      vehicleId: "",
      gateId: "",
      contractId: undefined,
      passDateTime: new Date(),
      feeCharged: "4",
      paymentStatus: "pending",
      paidBy: "",
      notes: "",
    },
  });

  // Toll System Mutations
  const createSystemMutation = useMutation({
    mutationFn: (data: InsertTollSystem) => apiRequest("POST", "/api/toll-systems", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/toll-systems"] });
      showSuccess(t("success"), "Toll system created successfully");
      setSystemDialogOpen(false);
      systemForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateSystemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTollSystem> }) =>
      apiRequest("PATCH", `/api/toll-systems/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/toll-systems"] });
      showSuccess(t("success"), "Toll system updated successfully");
      setSystemDialogOpen(false);
      setEditingSystem(null);
      systemForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  // Toll Gate Mutations
  const createGateMutation = useMutation({
    mutationFn: (data: InsertTollGate) => apiRequest("POST", "/api/toll-gates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/toll-gates"] });
      showSuccess(t("success"), "Toll gate created successfully");
      setGateDialogOpen(false);
      gateForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateGateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTollGate> }) =>
      apiRequest("PATCH", `/api/toll-gates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/toll-gates"] });
      showSuccess(t("success"), "Toll gate updated successfully");
      setGateDialogOpen(false);
      setEditingGate(null);
      gateForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  // Toll Pass Mutations
  const createPassMutation = useMutation({
    mutationFn: (data: InsertTollPass) => apiRequest("POST", "/api/toll-passes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/toll-passes"] });
      showSuccess(t("success"), "Toll pass created successfully");
      setPassDialogOpen(false);
      passForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updatePassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTollPass> }) =>
      apiRequest("PATCH", `/api/toll-passes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/toll-passes"] });
      showSuccess(t("success"), "Toll pass updated successfully");
      setPassDialogOpen(false);
      setEditingPass(null);
      passForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  // Handlers
  const handleCreateSystem = () => {
    setEditingSystem(null);
    systemForm.reset({
      systemName: "",
      emirate: "dubai",
      provider: "",
      standardFee: "4",
      holidayExempt: false,
      isActive: true,
    });
    setSystemDialogOpen(true);
  };

  const handleEditSystem = (system: TollSystem) => {
    setEditingSystem(system);
    systemForm.reset({
      systemName: system.systemName,
      emirate: system.emirate as any,
      provider: system.provider,
      standardFee: system.standardFee,
      holidayExempt: system.holidayExempt,
      isActive: system.isActive,
    });
    setSystemDialogOpen(true);
  };

  const handleCreateGate = () => {
    setEditingGate(null);
    gateForm.reset({
      tollSystemId: "",
      gateName: "",
      gpsLocation: "",
      direction: "",
      gateType: "",
      isPeakDependent: false,
      isActive: true,
    });
    setGateDialogOpen(true);
  };

  const handleEditGate = (gate: TollGate) => {
    setEditingGate(gate);
    gateForm.reset({
      tollSystemId: gate.tollSystemId,
      gateName: gate.gateName,
      gpsLocation: gate.gpsLocation || "",
      direction: gate.direction || "",
      gateType: gate.gateType || "",
      isPeakDependent: gate.isPeakDependent,
      isActive: gate.isActive,
    });
    setGateDialogOpen(true);
  };

  const handleCreatePass = () => {
    setEditingPass(null);
    passForm.reset({
      vehicleId: "",
      gateId: "",
      contractId: undefined,
      passDateTime: new Date(),
      feeCharged: "4",
      paymentStatus: "pending",
      paidBy: "",
      notes: "",
    });
    setPassDialogOpen(true);
  };

  const handleEditPass = (pass: TollPass) => {
    setEditingPass(pass);
    passForm.reset({
      vehicleId: pass.vehicleId,
      gateId: pass.gateId,
      contractId: pass.contractId || undefined,
      passDateTime: pass.passDateTime,
      feeCharged: pass.feeCharged,
      paymentStatus: pass.paymentStatus as any,
      paidBy: pass.paidBy || "",
      paidDate: pass.paidDate || undefined,
      notes: pass.notes || "",
    });
    setPassDialogOpen(true);
  };

  const onSystemSubmit = (data: InsertTollSystem) => {
    if (editingSystem) {
      updateSystemMutation.mutate({ id: editingSystem.id, data });
    } else {
      createSystemMutation.mutate(data);
    }
  };

  const onGateSubmit = (data: InsertTollGate) => {
    if (editingGate) {
      updateGateMutation.mutate({ id: editingGate.id, data });
    } else {
      createGateMutation.mutate(data);
    }
  };

  const onPassSubmit = (data: InsertTollPass) => {
    if (editingPass) {
      updatePassMutation.mutate({ id: editingPass.id, data });
    } else {
      createPassMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("tollManagement")}
          </h1>
          <p className="text-muted-foreground mt-1">Manage toll systems, gates, and pass records</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="systems" data-testid="tab-toll-systems" className="gap-2">
            <MaterialSymbol name="toll" size="sm" />
            Toll Systems
          </TabsTrigger>
          <TabsTrigger value="gates" data-testid="tab-toll-gates" className="gap-2">
            <MaterialSymbol name="location_on" size="sm" />
            Toll Gates
          </TabsTrigger>
          <TabsTrigger value="passes" data-testid="tab-toll-passes" className="gap-2">
            <MaterialSymbol name="receipt" size="sm" />
            Toll Passes
          </TabsTrigger>
        </TabsList>

        {/* Toll Systems Tab */}
        <TabsContent value="systems" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateSystem} className="gap-2" data-testid="button-create-toll-system">
              <MaterialSymbol name="add_circle" size="sm" />
              Add Toll System
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MaterialSymbol name="toll" size="md" className="text-primary" />
                Toll Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MaterialSymbol name="progress_activity" className="animate-spin" />
                    Loading...
                  </div>
                </div>
              ) : tollSystems.length === 0 ? (
                <div className="p-12 text-center">
                  <MaterialSymbol name="toll" size="2xl" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No toll systems found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>System Name</TableHead>
                      <TableHead>Emirate</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Standard Fee</TableHead>
                      <TableHead>Holiday Exempt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tollSystems.map((system) => (
                      <TableRow key={system.id} data-testid={`table-row-toll-system-${system.id}`}>
                        <TableCell className="font-medium">{system.systemName}</TableCell>
                        <TableCell>{EMIRATES.find(e => e.value === system.emirate)?.label}</TableCell>
                        <TableCell>{system.provider}</TableCell>
                        <TableCell>AED {system.standardFee}</TableCell>
                        <TableCell>
                          {system.holidayExempt ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {system.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditSystem(system)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            data-testid={`button-edit-toll-system-${system.id}`}
                          >
                            <MaterialSymbol name="edit" size="sm" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Toll Gates Tab */}
        <TabsContent value="gates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateGate} className="gap-2" data-testid="button-create-toll-gate">
              <MaterialSymbol name="add_circle" size="sm" />
              Add Toll Gate
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MaterialSymbol name="location_on" size="md" className="text-primary" />
                Toll Gates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gatesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MaterialSymbol name="progress_activity" className="animate-spin" />
                    Loading...
                  </div>
                </div>
              ) : tollGates.length === 0 ? (
                <div className="p-12 text-center">
                  <MaterialSymbol name="location_on" size="2xl" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No toll gates found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gate Name</TableHead>
                      <TableHead>Toll System</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Gate Type</TableHead>
                      <TableHead>Peak Dependent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tollGates.map((gate) => {
                      const system = tollSystems.find(s => s.id === gate.tollSystemId);
                      return (
                        <TableRow key={gate.id} data-testid={`table-row-toll-gate-${gate.id}`}>
                          <TableCell className="font-medium">{gate.gateName}</TableCell>
                          <TableCell>{system?.systemName || "N/A"}</TableCell>
                          <TableCell>{gate.direction || "—"}</TableCell>
                          <TableCell>{gate.gateType || "—"}</TableCell>
                          <TableCell>
                            {gate.isPeakDependent ? (
                              <Badge variant="secondary">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {gate.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditGate(gate)}
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              data-testid={`button-edit-toll-gate-${gate.id}`}
                            >
                              <MaterialSymbol name="edit" size="sm" />
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
        </TabsContent>

        {/* Toll Passes Tab */}
        <TabsContent value="passes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreatePass} className="gap-2" data-testid="button-create-toll-pass">
              <MaterialSymbol name="add_circle" size="sm" />
              Add Toll Pass
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MaterialSymbol name="receipt" size="md" className="text-primary" />
                Toll Passes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MaterialSymbol name="progress_activity" className="animate-spin" />
                    Loading...
                  </div>
                </div>
              ) : tollPasses.length === 0 ? (
                <div className="p-12 text-center">
                  <MaterialSymbol name="receipt" size="2xl" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No toll passes found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Toll Gate</TableHead>
                      <TableHead>Pass Date/Time</TableHead>
                      <TableHead>Fee Charged</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Paid By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tollPasses.map((pass) => {
                      const vehicle = vehicles.find(v => v.id === pass.vehicleId);
                      const gate = tollGates.find(g => g.id === pass.gateId);
                      return (
                        <TableRow key={pass.id} data-testid={`table-row-toll-pass-${pass.id}`}>
                          <TableCell className="font-medium">{vehicle?.registration || "N/A"}</TableCell>
                          <TableCell>{gate?.gateName || "N/A"}</TableCell>
                          <TableCell>{format(new Date(pass.passDateTime), "PPp")}</TableCell>
                          <TableCell>AED {pass.feeCharged}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                pass.paymentStatus === "paid"
                                  ? "default"
                                  : pass.paymentStatus === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {pass.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{pass.paidBy || "—"}</TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditPass(pass)}
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              data-testid={`button-edit-toll-pass-${pass.id}`}
                            >
                              <MaterialSymbol name="edit" size="sm" />
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
        </TabsContent>
      </Tabs>

      {/* Toll System Dialog */}
      <Dialog open={systemDialogOpen} onOpenChange={setSystemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSystem ? "Edit Toll System" : "Add Toll System"}
            </DialogTitle>
          </DialogHeader>
          <Form {...systemForm}>
            <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-4">
              <FormField
                control={systemForm.control}
                name="systemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-systemName" placeholder="e.g. Salik, Darb" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={systemForm.control}
                  name="emirate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emirate</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-emirate">
                            <SelectValue placeholder="Select emirate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMIRATES.map((emirate) => (
                            <SelectItem key={emirate.value} value={emirate.value}>
                              {emirate.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={systemForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-provider" placeholder="Provider name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={systemForm.control}
                  name="standardFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Fee (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-standardFee" type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={systemForm.control}
                  name="holidayExempt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Holiday Exempt</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-holidayExempt"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={systemForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-isActive"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSystemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-toll-system">
                  {editingSystem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Toll Gate Dialog */}
      <Dialog open={gateDialogOpen} onOpenChange={setGateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGate ? "Edit Toll Gate" : "Add Toll Gate"}
            </DialogTitle>
          </DialogHeader>
          <Form {...gateForm}>
            <form onSubmit={gateForm.handleSubmit(onGateSubmit)} className="space-y-4">
              <FormField
                control={gateForm.control}
                name="tollSystemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toll System</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tollSystemId">
                          <SelectValue placeholder="Select toll system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tollSystems.map((system) => (
                          <SelectItem key={system.id} value={system.id}>
                            {system.systemName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={gateForm.control}
                name="gateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gate Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-gateName" placeholder="e.g. Al Maktoum Bridge" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={gateForm.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-direction" placeholder="e.g. Northbound" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={gateForm.control}
                  name="gateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gate Type</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-gateType" placeholder="e.g. Standard, Express" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={gateForm.control}
                name="gpsLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPS Location</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-gpsLocation" placeholder="GPS coordinates" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={gateForm.control}
                  name="isPeakDependent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Peak Dependent</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-isPeakDependent"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={gateForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-isActive"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setGateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-toll-gate">
                  {editingGate ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Toll Pass Dialog */}
      <Dialog open={passDialogOpen} onOpenChange={setPassDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPass ? "Edit Toll Pass" : "Add Toll Pass"}
            </DialogTitle>
          </DialogHeader>
          <Form {...passForm}>
            <form onSubmit={passForm.handleSubmit(onPassSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={passForm.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
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
                  control={passForm.control}
                  name="gateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toll Gate</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gateId">
                            <SelectValue placeholder="Select gate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tollGates.map((gate) => (
                            <SelectItem key={gate.id} value={gate.id}>
                              {gate.gateName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={passForm.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-contractId">
                          <SelectValue placeholder="Select contract" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={passForm.control}
                  name="feeCharged"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Charged (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-feeCharged" type="number" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passForm.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-paymentStatus">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="waived">Waived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={passForm.control}
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
                control={passForm.control}
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
                <Button type="button" variant="outline" onClick={() => setPassDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-toll-pass">
                  {editingPass ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
