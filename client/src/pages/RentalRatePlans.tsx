import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, FileText, Edit, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRentalRatePlanSchema, type RentalRatePlan, type InsertRentalRatePlan } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore } from "date-fns";

const PLAN_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "seasonal", label: "Seasonal" },
  { value: "promotional", label: "Promotional" },
  { value: "corporate", label: "Corporate" },
  { value: "long_term", label: "Long Term" },
];

const VEHICLE_CATEGORIES = [
  { value: "economy", label: "Economy" },
  { value: "compact", label: "Compact" },
  { value: "midsize", label: "Midsize" },
  { value: "luxury", label: "Luxury" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Van" },
  { value: "sports", label: "Sports" },
];

export default function RentalRatePlans() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RentalRatePlan | null>(null);
  const [filters, setFilters] = useState({
    planType: "all",
    vehicleCategory: "all",
    isActive: "all",
    activeNow: false,
  });

  const { data: ratePlans = [], isLoading } = useQuery<RentalRatePlan[]>({
    queryKey: ["/api/rental-rate-plans"],
  });

  const form = useForm<InsertRentalRatePlan>({
    resolver: zodResolver(insertRentalRatePlanSchema),
    defaultValues: {
      planName: "",
      planType: "standard",
      vehicleCategory: "",
      dailyRate: "",
      weeklyRate: "",
      monthlyRate: "",
      minimumDays: 1,
      discountPercentage: "0",
      effectiveFrom: new Date(),
      effectiveTo: undefined,
      isActive: true,
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertRentalRatePlan) => apiRequest("POST", "/api/rental-rate-plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rental-rate-plans"] });
      showSuccess(t("success"), "Rate plan created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertRentalRatePlan> }) =>
      apiRequest("PATCH", `/api/rental-rate-plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rental-rate-plans"] });
      showSuccess(t("success"), "Rate plan updated successfully");
      setDialogOpen(false);
      setEditingPlan(null);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const handleCreate = () => {
    setEditingPlan(null);
    form.reset({
      planName: "",
      planType: "standard",
      vehicleCategory: "",
      dailyRate: "",
      weeklyRate: "",
      monthlyRate: "",
      minimumDays: 1,
      discountPercentage: "0",
      effectiveFrom: new Date(),
      effectiveTo: undefined,
      isActive: true,
      description: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (plan: RentalRatePlan) => {
    setEditingPlan(plan);
    form.reset({
      planName: plan.planName,
      planType: plan.planType,
      vehicleCategory: plan.vehicleCategory || "",
      dailyRate: plan.dailyRate || "",
      weeklyRate: plan.weeklyRate || "",
      monthlyRate: plan.monthlyRate || "",
      minimumDays: plan.minimumDays || 1,
      discountPercentage: plan.discountPercentage || "0",
      effectiveFrom: plan.effectiveFrom ? new Date(plan.effectiveFrom) : new Date(),
      effectiveTo: plan.effectiveTo ? new Date(plan.effectiveTo) : undefined,
      isActive: plan.isActive,
      description: plan.description || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertRentalRatePlan) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Get effective period status
  const getEffectiveStatus = (plan: RentalRatePlan) => {
    const now = new Date();
    const from = new Date(plan.effectiveFrom);
    const to = plan.effectiveTo ? new Date(plan.effectiveTo) : null;

    if (isBefore(now, from)) {
      return { label: "Upcoming", variant: "secondary" as const };
    } else if (to && isAfter(now, to)) {
      return { label: "Expired", variant: "destructive" as const };
    } else {
      return { label: "Active Now", variant: "default" as const };
    }
  };

  // Filter plans
  const filteredPlans = useMemo(() => {
    return ratePlans.filter((plan) => {
      if (filters.planType && filters.planType !== "all" && plan.planType !== filters.planType) return false;
      if (filters.vehicleCategory && filters.vehicleCategory !== "all" && plan.vehicleCategory !== filters.vehicleCategory) return false;
      if (filters.isActive !== "all" && plan.isActive !== (filters.isActive === "true")) return false;
      
      if (filters.activeNow) {
        const now = new Date();
        const from = new Date(plan.effectiveFrom);
        const to = plan.effectiveTo ? new Date(plan.effectiveTo) : null;
        const isActiveNow = !isBefore(now, from) && (!to || !isAfter(now, to));
        if (!isActiveNow) return false;
      }
      
      return true;
    });
  }, [ratePlans, filters]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("rentalRatePlans")}
          </h1>
          <p className="text-muted-foreground mt-1">Manage rental pricing plans and promotional rates</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-rate-plan">
          <Plus className="w-4 h-4 mr-2" />
          Add Rate Plan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Plan Type</label>
              <Select value={filters.planType} onValueChange={(value) => setFilters({ ...filters, planType: value })}>
                <SelectTrigger data-testid="select-filter-plan-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PLAN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Vehicle Category</label>
              <Select value={filters.vehicleCategory} onValueChange={(value) => setFilters({ ...filters, vehicleCategory: value })}>
                <SelectTrigger data-testid="select-filter-vehicle-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {VEHICLE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.isActive} onValueChange={(value) => setFilters({ ...filters, isActive: value })}>
                <SelectTrigger data-testid="select-filter-is-active">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-now"
                  checked={filters.activeNow}
                  onCheckedChange={(checked) => setFilters({ ...filters, activeNow: checked })}
                  data-testid="switch-filter-active-now"
                />
                <label htmlFor="active-now" className="text-sm font-medium">
                  Active Now Only
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Rate Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rate plans found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Vehicle Category</TableHead>
                  <TableHead>Daily/Weekly/Monthly Rates</TableHead>
                  <TableHead>Effective Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => {
                  const effectiveStatus = getEffectiveStatus(plan);
                  return (
                    <TableRow key={plan.id} data-testid={`table-row-rate-plan-${plan.id}`}>
                      <TableCell>
                        <div className="font-medium">{plan.planName}</div>
                        {plan.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">{plan.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {PLAN_TYPES.find((t) => t.value === plan.planType)?.label || plan.planType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {plan.vehicleCategory ? (
                          VEHICLE_CATEGORIES.find((c) => c.value === plan.vehicleCategory)?.label || plan.vehicleCategory
                        ) : (
                          <span className="text-muted-foreground">All</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {plan.dailyRate && <div>Daily: AED {plan.dailyRate}</div>}
                          {plan.weeklyRate && <div>Weekly: AED {plan.weeklyRate}</div>}
                          {plan.monthlyRate && <div>Monthly: AED {plan.monthlyRate}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>From: {format(new Date(plan.effectiveFrom), "dd MMM yyyy")}</div>
                          {plan.effectiveTo && <div>To: {format(new Date(plan.effectiveTo), "dd MMM yyyy")}</div>}
                        </div>
                        <Badge variant={effectiveStatus.variant} className="mt-1">
                          {effectiveStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {plan.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                          data-testid={`button-edit-rate-plan-${plan.id}`}
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
              {editingPlan ? "Edit Rate Plan" : "Add New Rate Plan"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="planName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-plan-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-plan-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLAN_TYPES.map((type) => (
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

                <FormField
                  control={form.control}
                  name="vehicleCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle-category">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">All Categories</SelectItem>
                          {VEHICLE_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <FormLabel>Daily Rate (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-daily-rate" />
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
                      <FormLabel>Weekly Rate (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-weekly-rate" />
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
                      <FormLabel>Monthly Rate (AED)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-monthly-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minimumDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Rental Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? 1}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                          data-testid="input-minimum-days"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage (0-100)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || "0"} type="number" step="0.1" min="0" max="100" data-testid="input-discount-percentage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="effectiveFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-effective-from"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective To (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-effective-to"
                        />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={3} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this rate plan
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
