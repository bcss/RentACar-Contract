import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, UserCircle, Edit, Car } from "lucide-react";
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("drivers")}
          </h1>
          <p className="text-muted-foreground mt-1">Manage professional drivers and assignments</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-driver">
          <Plus className="w-4 h-4 mr-2" />
          {t("addDriver")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Driver Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No drivers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("driverName")}</TableHead>
                  <TableHead>{t("licenseNumber")}</TableHead>
                  <TableHead>{t("employmentType")}</TableHead>
                  <TableHead>{t("contact")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id} data-testid={`row-driver-${driver.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{driver.nameEn}</div>
                        {driver.nameAr && (
                          <div className="text-sm text-muted-foreground">{driver.nameAr}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{driver.licenseNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.employmentType === 'in_house' ? 'default' : 'secondary'}>
                        {driver.employmentType === 'in_house' ? t("directEmployee") : t("outsourced")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{driver.mobile}</div>
                        <div className="text-muted-foreground">{driver.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {driver.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(driver)}
                        data-testid={`button-edit-driver-${driver.id}`}
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
