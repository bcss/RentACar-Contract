import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDriverSchema, type Driver, type InsertDriver } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { ListPageLayout, FilterPanel, FilterGroup } from "@/components/layouts";

export default function Drivers() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/driver-companies"],
  });

  const form = useForm<InsertDriver>({
    resolver: zodResolver(insertDriverSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      mobile: "",
      email: "",
      licenseNumber: "",
      nationality: "",
      outsourceCompanyId: null,
      employmentType: "outsourced",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertDriver) => apiRequest("POST", "/api/drivers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      showSuccess(t("success"), "Driver created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDriver> }) =>
      apiRequest("PATCH", `/api/drivers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      showSuccess(t("success"), "Driver updated successfully");
      setDialogOpen(false);
      setEditingDriver(null);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const handleCreate = () => {
    setEditingDriver(null);
    form.reset({
      nameEn: "",
      nameAr: "",
      mobile: "",
      email: "",
      licenseNumber: "",
      nationality: "",
      outsourceCompanyId: null,
      employmentType: "outsourced",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    form.reset({
      nameEn: driver.nameEn,
      nameAr: driver.nameAr || "",
      mobile: driver.mobile || "",
      email: driver.email || "",
      licenseNumber: driver.licenseNumber,
      nationality: driver.nationality || "",
      outsourceCompanyId: driver.outsourceCompanyId,
      employmentType: driver.employmentType as any,
      isActive: driver.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertDriver) => {
    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch = 
      driver.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.nameAr && driver.nameAr.includes(searchTerm)) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && driver.isActive) ||
      (statusFilter === "inactive" && !driver.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div data-testid="page-drivers">
      <ListPageLayout
        title={t("drivers")}
        subtitle={`${filteredDrivers.length} ${t("drivers")}`}
        actionButton={
          <Button onClick={handleCreate} className="gap-2" data-testid="button-create-driver">
            <MaterialSymbol name="add_circle" size="sm" />
            {t("addDriver")}
          </Button>
        }
        filterPanel={
          <FilterPanel title={t("common.filters")} showButtons={false}>
            <FilterGroup label={t("common.search")}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MaterialSymbol name="search" size="sm" />
                </span>
                <Input
                  placeholder={t("searchDrivers")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-lg"
                  data-testid="input-search"
                />
              </div>
            </FilterGroup>
            
            <FilterGroup label={t("status")}>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-lg" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </FilterGroup>
          </FilterPanel>
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MaterialSymbol name="progress_activity" className="animate-spin" />
              {t("common.loading")}
            </div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-12 text-center">
            <MaterialSymbol name="person" size="2xl" className="text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground">{t("driverName")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("licenseNumber")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("employmentType")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("contact")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("status")}</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow 
                    key={driver.id} 
                    className="hover:bg-muted/30 transition-colors"
                    data-testid={`row-driver-${driver.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MaterialSymbol name="person" size="sm" className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{driver.nameEn}</div>
                          {driver.nameAr && (
                            <div className="text-sm text-muted-foreground">{driver.nameAr}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        <MaterialSymbol name="id_card" size="xs" className="mr-1" />
                        {driver.licenseNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={driver.employmentType === 'in_house' ? 'default' : 'secondary'}
                        className="rounded-full"
                      >
                        <MaterialSymbol name={driver.employmentType === 'in_house' ? 'home' : 'business'} size="xs" className="mr-1" />
                        {driver.employmentType === 'in_house' ? t("directEmployee") : t("outsourced")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <MaterialSymbol name="phone" size="xs" className="text-muted-foreground" />
                          {driver.mobile || "-"}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MaterialSymbol name="mail" size="xs" />
                          {driver.email || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {driver.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400 rounded-full">
                          <MaterialSymbol name="check_circle" size="xs" className="mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          <MaterialSymbol name="pause_circle" size="xs" className="mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(driver)}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          data-testid={`button-edit-driver-${driver.id}`}
                        >
                          <MaterialSymbol name="edit" size="sm" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ListPageLayout>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDriver ? t("editDriver") : t("addNewDriver")}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="employment">Employment Details</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (English)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-name-en" />
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
                          <FormLabel>Name (Arabic)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-name-ar" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-license-number" />
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
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-nationality" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-mobile" />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} type="email" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="employment" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-employment-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in_house">Direct Employee</SelectItem>
                            <SelectItem value="outsourced">Outsourced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="outsourceCompanyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outsource Company</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Select company (if outsourced)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (Direct Employee)</SelectItem>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.nameEn}
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
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Inactive drivers won't be available for assignments
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
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t("saving")
                    : editingDriver
                    ? t("update")
                    : t("create")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
