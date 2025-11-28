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
import { insertBranchSchema, type Branch, type InsertBranch } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { ListPageLayout, FilterPanel, FilterGroup } from "@/components/layouts";

const EMIRATES = [
  { value: "dubai", label: "Dubai" },
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
];

export default function Branches() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const form = useForm<InsertBranch>({
    resolver: zodResolver(insertBranchSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      branchCode: "",
      emirate: "dubai",
      addressEn: "",
      addressAr: "",
      phone: "",
      email: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBranch) => apiRequest("POST", "/api/branches", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      showSuccess(t("success"), "Branch created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertBranch> }) =>
      apiRequest("PATCH", `/api/branches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      showSuccess(t("success"), "Branch updated successfully");
      setDialogOpen(false);
      setEditingBranch(null);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const handleCreate = () => {
    setEditingBranch(null);
    form.reset({
      nameEn: "",
      nameAr: "",
      branchCode: "",
      emirate: "dubai",
      addressEn: "",
      addressAr: "",
      phone: "",
      email: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.reset({
      nameEn: branch.nameEn,
      nameAr: branch.nameAr || "",
      branchCode: branch.branchCode,
      emirate: branch.emirate as any,
      addressEn: branch.addressEn || "",
      addressAr: branch.addressAr || "",
      phone: branch.phone || "",
      email: branch.email || "",
      isActive: branch.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertBranch) => {
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [emirateFilter, setEmirateFilter] = useState<string>("all");

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch = 
      branch.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.nameAr && branch.nameAr.includes(searchTerm)) ||
      branch.branchCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmirate = emirateFilter === "all" || branch.emirate === emirateFilter;
    return matchesSearch && matchesEmirate;
  });

  return (
    <div data-testid="page-branches">
      <ListPageLayout
        title={t("branches")}
        subtitle={`${filteredBranches.length} ${t("branches")}`}
        actionButton={
          <Button onClick={handleCreate} className="gap-2" data-testid="button-create-branch">
            <MaterialSymbol name="add_circle" size="sm" />
            {t("addBranch")}
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
            
            <FilterGroup label={t("emirate")}>
              <Select value={emirateFilter} onValueChange={setEmirateFilter}>
                <SelectTrigger className="h-10 rounded-lg" data-testid="select-emirate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {EMIRATES.map((emirate) => (
                    <SelectItem key={emirate.value} value={emirate.value}>
                      {emirate.label}
                    </SelectItem>
                  ))}
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
        ) : filteredBranches.length === 0 ? (
          <div className="p-12 text-center">
            <MaterialSymbol name="business" size="2xl" className="text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground">{t("code")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("branchName")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("emirate")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("contact")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("status")}</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow 
                    key={branch.id} 
                    className="hover:bg-muted/30 transition-colors"
                    data-testid={`row-branch-${branch.id}`}
                  >
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        <MaterialSymbol name="tag" size="xs" className="mr-1" />
                        {branch.branchCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MaterialSymbol name="business" size="sm" className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{branch.nameEn}</div>
                          {branch.nameAr && (
                            <div className="text-sm text-muted-foreground">{branch.nameAr}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MaterialSymbol name="location_on" size="xs" className="text-muted-foreground" />
                        {EMIRATES.find((e) => e.value === branch.emirate)?.label || branch.emirate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <MaterialSymbol name="phone" size="xs" className="text-muted-foreground" />
                          {branch.phone || "-"}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MaterialSymbol name="mail" size="xs" />
                          {branch.email || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {branch.isActive ? (
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
                          onClick={() => handleEdit(branch)}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          data-testid={`button-edit-branch-${branch.id}`}
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
              {editingBranch ? t("editBranch") : t("addNewBranch")}
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
                      <FormLabel>Branch Name (English)</FormLabel>
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
                      <FormLabel>Branch Name (Arabic)</FormLabel>
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
                  name="branchCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="HQ" data-testid="input-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emirate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emirate</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value as any)} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-emirate">
                            <SelectValue />
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
              </div>

              <FormField
                control={form.control}
                name="addressEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (English)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-address-en" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-address-ar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-phone" />
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Inactive branches won't appear in selections
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
                    : editingBranch
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
