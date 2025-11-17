import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Package, Edit, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertVehicleAccessorySchema, 
  insertContractAccessorySchema,
  type VehicleAccessory, 
  type ContractAccessory,
  type InsertVehicleAccessory,
  type InsertContractAccessory 
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ACCESSORY_CATEGORIES = [
  { value: "gps", label: "GPS" },
  { value: "child_seat", label: "Child Seat" },
  { value: "wifi_hotspot", label: "WiFi Hotspot" },
  { value: "roof_rack", label: "Roof Rack" },
  { value: "ski_rack", label: "Ski Rack" },
  { value: "bike_rack", label: "Bike Rack" },
  { value: "snow_chains", label: "Snow Chains" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "usb_charger", label: "USB Charger" },
  { value: "phone_mount", label: "Phone Mount" },
  { value: "other", label: "Other" },
];

export default function VehicleAccessories() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [activeTab, setActiveTab] = useState("catalog");
  
  // Accessory Catalog State
  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<VehicleAccessory | null>(null);
  const [catalogFilters, setCatalogFilters] = useState({
    category: "",
    isActive: "",
    inStock: false,
  });

  // Contract Accessories State
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [editingContractAccessory, setEditingContractAccessory] = useState<ContractAccessory | null>(null);
  const [contractFilters, setContractFilters] = useState({
    contractId: "",
    accessoryId: "",
  });

  // Fetch data
  const { data: accessories = [], isLoading: accessoriesLoading } = useQuery<VehicleAccessory[]>({
    queryKey: ["/api/vehicle-accessories"],
  });

  const { data: contractAccessories = [], isLoading: contractAccessoriesLoading } = useQuery<ContractAccessory[]>({
    queryKey: ["/api/contract-accessories"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  // Forms
  const accessoryForm = useForm<InsertVehicleAccessory>({
    resolver: zodResolver(insertVehicleAccessorySchema),
    defaultValues: {
      accessoryName: "",
      category: "gps",
      dailyRate: "",
      weeklyRate: "",
      monthlyRate: "",
      quantity: 0,
      isActive: true,
      description: "",
    },
  });

  const contractAccessoryForm = useForm<InsertContractAccessory>({
    resolver: zodResolver(insertContractAccessorySchema),
    defaultValues: {
      contractId: "",
      accessoryId: "",
      quantity: 1,
      dailyRate: "",
      totalCost: "",
    },
  });

  // Accessory Catalog Mutations
  const createAccessoryMutation = useMutation({
    mutationFn: (data: InsertVehicleAccessory) => apiRequest("POST", "/api/vehicle-accessories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-accessories"] });
      showSuccess(t("success"), "Accessory created successfully");
      setCatalogDialogOpen(false);
      accessoryForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateAccessoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertVehicleAccessory> }) =>
      apiRequest("PATCH", `/api/vehicle-accessories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-accessories"] });
      showSuccess(t("success"), "Accessory updated successfully");
      setCatalogDialogOpen(false);
      setEditingAccessory(null);
      accessoryForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  // Contract Accessories Mutations
  const createContractAccessoryMutation = useMutation({
    mutationFn: (data: InsertContractAccessory) => apiRequest("POST", "/api/contract-accessories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-accessories"] });
      showSuccess(t("success"), "Contract accessory created successfully");
      setContractDialogOpen(false);
      contractAccessoryForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateContractAccessoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertContractAccessory> }) =>
      apiRequest("PATCH", `/api/contract-accessories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-accessories"] });
      showSuccess(t("success"), "Contract accessory updated successfully");
      setContractDialogOpen(false);
      setEditingContractAccessory(null);
      contractAccessoryForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  // Handlers - Accessory Catalog
  const handleCreateAccessory = () => {
    setEditingAccessory(null);
    accessoryForm.reset({
      accessoryName: "",
      category: "gps",
      dailyRate: "",
      weeklyRate: "",
      monthlyRate: "",
      quantity: 0,
      isActive: true,
      description: "",
    });
    setCatalogDialogOpen(true);
  };

  const handleEditAccessory = (accessory: VehicleAccessory) => {
    setEditingAccessory(accessory);
    accessoryForm.reset({
      accessoryName: accessory.accessoryName,
      category: accessory.category,
      dailyRate: accessory.dailyRate || "",
      weeklyRate: accessory.weeklyRate || "",
      monthlyRate: accessory.monthlyRate || "",
      quantity: accessory.quantity || 0,
      isActive: accessory.isActive,
      description: accessory.description || "",
    });
    setCatalogDialogOpen(true);
  };

  const onAccessorySubmit = (data: InsertVehicleAccessory) => {
    if (editingAccessory) {
      updateAccessoryMutation.mutate({ id: editingAccessory.id, data });
    } else {
      createAccessoryMutation.mutate(data);
    }
  };

  // Handlers - Contract Accessories
  const handleCreateContractAccessory = () => {
    setEditingContractAccessory(null);
    contractAccessoryForm.reset({
      contractId: "",
      accessoryId: "",
      quantity: 1,
      dailyRate: "",
      totalCost: "",
    });
    setContractDialogOpen(true);
  };

  const handleEditContractAccessory = (contractAccessory: ContractAccessory) => {
    setEditingContractAccessory(contractAccessory);
    contractAccessoryForm.reset({
      contractId: contractAccessory.contractId,
      accessoryId: contractAccessory.accessoryId,
      quantity: contractAccessory.quantity || 1,
      dailyRate: contractAccessory.dailyRate || "",
      totalCost: contractAccessory.totalCost || "",
    });
    setContractDialogOpen(true);
  };

  const onContractAccessorySubmit = (data: InsertContractAccessory) => {
    if (editingContractAccessory) {
      updateContractAccessoryMutation.mutate({ id: editingContractAccessory.id, data });
    } else {
      createContractAccessoryMutation.mutate(data);
    }
  };

  // Auto-populate daily rate when accessory is selected
  const handleAccessorySelect = (accessoryId: string) => {
    const accessory = accessories.find((a) => a.id === accessoryId);
    if (accessory) {
      contractAccessoryForm.setValue("dailyRate", accessory.dailyRate || "");
      // Auto-calculate total cost
      const quantity = contractAccessoryForm.getValues("quantity") || 1;
      const rate = parseFloat(accessory.dailyRate || "0");
      const total = (quantity * rate).toFixed(2);
      contractAccessoryForm.setValue("totalCost", total);
    }
  };

  // Auto-calculate total cost when quantity changes
  const handleQuantityChange = (quantity: number) => {
    const dailyRate = parseFloat(contractAccessoryForm.getValues("dailyRate") || "0");
    const total = (quantity * dailyRate).toFixed(2);
    contractAccessoryForm.setValue("totalCost", total);
  };

  // Filter accessories
  const filteredAccessories = useMemo(() => {
    return accessories.filter((accessory) => {
      if (catalogFilters.category && accessory.category !== catalogFilters.category) return false;
      if (catalogFilters.isActive !== "" && accessory.isActive !== (catalogFilters.isActive === "true")) return false;
      if (catalogFilters.inStock && (accessory.quantity || 0) <= 0) return false;
      return true;
    });
  }, [accessories, catalogFilters]);

  // Filter contract accessories
  const filteredContractAccessories = useMemo(() => {
    return contractAccessories.filter((ca) => {
      if (contractFilters.contractId && ca.contractId !== contractFilters.contractId) return false;
      if (contractFilters.accessoryId && ca.accessoryId !== contractFilters.accessoryId) return false;
      return true;
    });
  }, [contractAccessories, contractFilters]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return filteredContractAccessories.reduce((sum, ca) => {
      const cost = parseFloat(ca.totalCost || "0");
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
  }, [filteredContractAccessories]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("vehicleAccessories")}
          </h1>
          <p className="text-muted-foreground mt-1">Manage vehicle accessories catalog and contract assignments</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog" data-testid="tab-accessory-catalog">Accessory Catalog</TabsTrigger>
          <TabsTrigger value="contracts" data-testid="tab-contract-accessories">Contract Accessories</TabsTrigger>
        </TabsList>

        {/* Tab 1: Accessory Catalog */}
        <TabsContent value="catalog" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleCreateAccessory} data-testid="button-create-accessory">
              <Plus className="w-4 h-4 mr-2" />
              Add Accessory
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={catalogFilters.category} onValueChange={(value) => setCatalogFilters({ ...catalogFilters, category: value })}>
                    <SelectTrigger data-testid="select-filter-category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {ACCESSORY_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={catalogFilters.isActive} onValueChange={(value) => setCatalogFilters({ ...catalogFilters, isActive: value })}>
                    <SelectTrigger data-testid="select-filter-is-active">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="in-stock"
                      checked={catalogFilters.inStock}
                      onCheckedChange={(checked) => setCatalogFilters({ ...catalogFilters, inStock: checked })}
                      data-testid="switch-filter-in-stock"
                    />
                    <label htmlFor="in-stock" className="text-sm font-medium">
                      In Stock Only
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessories Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Accessory Catalog
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accessoriesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredAccessories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No accessories found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Accessory Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Daily/Weekly/Monthly Price</TableHead>
                      <TableHead>Stock Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccessories.map((accessory) => (
                      <TableRow key={accessory.id} data-testid={`table-row-accessory-${accessory.id}`}>
                        <TableCell>
                          <div className="font-medium">{accessory.accessoryName}</div>
                          {accessory.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{accessory.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ACCESSORY_CATEGORIES.find((c) => c.value === accessory.category)?.label || accessory.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {accessory.dailyRate && <div>Daily: AED {accessory.dailyRate}</div>}
                            {accessory.weeklyRate && <div>Weekly: AED {accessory.weeklyRate}</div>}
                            {accessory.monthlyRate && <div>Monthly: AED {accessory.monthlyRate}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(accessory.quantity || 0) > 0 ? "default" : "destructive"}>
                            {accessory.quantity || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {accessory.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAccessory(accessory)}
                            data-testid={`button-edit-accessory-${accessory.id}`}
                          >
                            <Edit className="w-4 h-4" />
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

        {/* Tab 2: Contract Accessories */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="flex items-center justify-between">
            <Card className="flex-1 mr-4">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accessory Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-revenue">
                  AED {totalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleCreateContractAccessory} data-testid="button-create-contract-accessory">
              <Plus className="w-4 h-4 mr-2" />
              Assign Accessory
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contract</label>
                  <Select value={contractFilters.contractId} onValueChange={(value) => setContractFilters({ ...contractFilters, contractId: value })}>
                    <SelectTrigger data-testid="select-filter-contract">
                      <SelectValue placeholder="All Contracts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Contracts</SelectItem>
                      {contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.contractNumber || contract.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Accessory</label>
                  <Select value={contractFilters.accessoryId} onValueChange={(value) => setContractFilters({ ...contractFilters, accessoryId: value })}>
                    <SelectTrigger data-testid="select-filter-accessory">
                      <SelectValue placeholder="All Accessories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Accessories</SelectItem>
                      {accessories.map((accessory) => (
                        <SelectItem key={accessory.id} value={accessory.id}>
                          {accessory.accessoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Accessories Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Contract Accessories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contractAccessoriesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredContractAccessories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No contract accessories found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract ID</TableHead>
                      <TableHead>Accessory</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContractAccessories.map((ca) => {
                      const accessory = accessories.find((a) => a.id === ca.accessoryId);
                      const contract = contracts.find((c) => c.id === ca.contractId);
                      return (
                        <TableRow key={ca.id} data-testid={`table-row-contract-accessory-${ca.id}`}>
                          <TableCell>
                            <Badge variant="outline">{contract?.contractNumber || ca.contractId.substring(0, 8)}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{accessory?.accessoryName || "Unknown"}</div>
                          </TableCell>
                          <TableCell>{ca.quantity}</TableCell>
                          <TableCell>AED {ca.dailyRate}</TableCell>
                          <TableCell>
                            <span className="font-medium">AED {ca.totalCost}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditContractAccessory(ca)}
                              data-testid={`button-edit-contract-accessory-${ca.id}`}
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
        </TabsContent>
      </Tabs>

      {/* Accessory Catalog Dialog */}
      <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccessory ? "Edit Accessory" : "Add New Accessory"}
            </DialogTitle>
          </DialogHeader>

          <Form {...accessoryForm}>
            <form onSubmit={accessoryForm.handleSubmit(onAccessorySubmit)} className="space-y-4">
              <FormField
                control={accessoryForm.control}
                name="accessoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessory Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-accessory-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accessoryForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACCESSORY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={accessoryForm.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Rate (AED) *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-daily-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accessoryForm.control}
                  name="weeklyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Rate (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-weekly-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={accessoryForm.control}
                  name="monthlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rate (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-monthly-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={accessoryForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                        data-testid="input-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accessoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={3} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={accessoryForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this accessory
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCatalogDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAccessoryMutation.isPending || updateAccessoryMutation.isPending}>
                  {createAccessoryMutation.isPending || updateAccessoryMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Contract Accessory Dialog */}
      <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContractAccessory ? "Edit Contract Accessory" : "Assign Accessory to Contract"}
            </DialogTitle>
          </DialogHeader>

          <Form {...contractAccessoryForm}>
            <form onSubmit={contractAccessoryForm.handleSubmit(onContractAccessorySubmit)} className="space-y-4">
              <FormField
                control={contractAccessoryForm.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-contract-id">
                          <SelectValue placeholder="Select contract" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.contractNumber || contract.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={contractAccessoryForm.control}
                name="accessoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessory *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleAccessorySelect(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-accessory-id">
                          <SelectValue placeholder="Select accessory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accessories.filter((a) => a.isActive).map((accessory) => (
                          <SelectItem key={accessory.id} value={accessory.id}>
                            {accessory.accessoryName} - AED {accessory.dailyRate}/day
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
                  control={contractAccessoryForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? 1}
                          onChange={(e) => {
                            const qty = e.target.value ? parseInt(e.target.value) : 1;
                            field.onChange(qty);
                            handleQuantityChange(qty);
                          }}
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contractAccessoryForm.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (AED) *</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-daily-rate" readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={contractAccessoryForm.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cost (AED) *</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-total-cost" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setContractDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContractAccessoryMutation.isPending || updateContractAccessoryMutation.isPending}>
                  {createContractAccessoryMutation.isPending || updateContractAccessoryMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
