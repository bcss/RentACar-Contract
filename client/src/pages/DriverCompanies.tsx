import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import { insertDriverOutsourceCompanySchema, type DriverOutsourceCompany, type InsertDriverOutsourceCompany } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { ListPageLayout, FilterPanel, FilterGroup } from "@/components/layouts";

export default function DriverCompanies() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<DriverOutsourceCompany | null>(null);

  const { data: companies = [], isLoading } = useQuery<DriverOutsourceCompany[]>({
    queryKey: ["/api/driver-companies"],
  });

  const form = useForm<InsertDriverOutsourceCompany>({
    resolver: zodResolver(insertDriverOutsourceCompanySchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      contactPerson: "",
      mobile: "",
      email: "",
      address: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertDriverOutsourceCompany) => apiRequest("POST", "/api/driver-companies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-companies"] });
      showSuccess(t("success"), "Company created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDriverOutsourceCompany> }) =>
      apiRequest("PATCH", `/api/driver-companies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-companies"] });
      showSuccess(t("success"), "Company updated successfully");
      setDialogOpen(false);
      setEditingCompany(null);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const handleCreate = () => {
    setEditingCompany(null);
    form.reset({
      nameEn: "",
      nameAr: "",
      contactPerson: "",
      mobile: "",
      email: "",
      address: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (company: DriverOutsourceCompany) => {
    setEditingCompany(company);
    form.reset({
      nameEn: company.nameEn,
      nameAr: company.nameAr || "",
      contactPerson: company.contactPerson || "",
      mobile: company.mobile || "",
      email: company.email || "",
      address: company.address || "",
      isActive: company.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertDriverOutsourceCompany) => {
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = 
      company.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.nameAr && company.nameAr.includes(searchTerm)) ||
      (company.contactPerson && company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div data-testid="page-driver-companies">
      <ListPageLayout
        title={t("driverCompanies")}
        subtitle={`${filteredCompanies.length} ${t("companies")}`}
        actionButton={
          <Button onClick={handleCreate} className="gap-2" data-testid="button-create-company">
            <MaterialSymbol name="add_circle" size="sm" />
            {t("addCompany")}
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
                  placeholder={t("common.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-lg"
                  data-testid="input-search"
                />
              </div>
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
        ) : filteredCompanies.length === 0 ? (
          <div className="p-12 text-center">
            <MaterialSymbol name="business" size="2xl" className="text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground">{t("companyName")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("contactPerson")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("contact")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("status")}</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow 
                    key={company.id} 
                    className="hover:bg-muted/30 transition-colors"
                    data-testid={`row-company-${company.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MaterialSymbol name="business" size="sm" className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{company.nameEn}</div>
                          {company.nameAr && (
                            <div className="text-sm text-muted-foreground">{company.nameAr}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MaterialSymbol name="person" size="xs" className="text-muted-foreground" />
                        {company.contactPerson || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <MaterialSymbol name="phone" size="xs" className="text-muted-foreground" />
                          {company.mobile || "-"}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MaterialSymbol name="mail" size="xs" />
                          {company.email || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.isActive ? (
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
                          onClick={() => handleEdit(company)}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          data-testid={`button-edit-company-${company.id}`}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? t("editCompany") : t("addNewCompany")}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (English)</FormLabel>
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
                      <FormLabel>Company Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-name-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-contact-person" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-address" />
                    </FormControl>
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
                      <FormLabel>Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Inactive companies won't appear in driver assignments
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
                    : editingCompany
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
