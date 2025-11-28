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
import { insertPublicHolidaySchema, type PublicHoliday, type InsertPublicHoliday } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { ListPageLayout, FilterPanel, FilterGroup } from "@/components/layouts";

export default function PublicHolidays() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null);

  const { data: holidays = [], isLoading } = useQuery<PublicHoliday[]>({
    queryKey: ["/api/public-holidays"],
  });

  const form = useForm<InsertPublicHoliday>({
    resolver: zodResolver(insertPublicHolidaySchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      holidayDate: new Date(),
      isRecurring: false,
      recurrenceType: "gregorian",
      surchargeRate: "",
      notes: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPublicHoliday) => apiRequest("POST", "/api/public-holidays", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-holidays"] });
      showSuccess(t("success"), t("holidayCreated"));
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPublicHoliday> }) =>
      apiRequest("PATCH", `/api/public-holidays/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-holidays"] });
      showSuccess(t("success"), t("holidayUpdated"));
      setDialogOpen(false);
      setEditingHoliday(null);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/public-holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-holidays"] });
      showSuccess(t("success"), t("holidayDeleted"));
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const handleCreate = () => {
    setEditingHoliday(null);
    form.reset({
      nameEn: "",
      nameAr: "",
      holidayDate: new Date(),
      isRecurring: false,
      recurrenceType: "gregorian",
      surchargeRate: "",
      notes: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (holiday: PublicHoliday) => {
    setEditingHoliday(holiday);
    form.reset({
      nameEn: holiday.nameEn,
      nameAr: holiday.nameAr || "",
      holidayDate: new Date(holiday.holidayDate),
      isRecurring: holiday.isRecurring,
      recurrenceType: (holiday.recurrenceType as "gregorian" | "hijri" | undefined) || "gregorian",
      surchargeRate: holiday.surchargeRate || "",
      notes: holiday.notes || "",
      isActive: holiday.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("confirmDeleteHoliday"))) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertPublicHoliday) => {
    if (editingHoliday) {
      updateMutation.mutate({ id: editingHoliday.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch = 
      holiday.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (holiday.nameAr && holiday.nameAr.includes(searchTerm));
    return matchesSearch;
  });

  return (
    <div data-testid="page-public-holidays">
      <ListPageLayout
        title={t("publicHolidays")}
        subtitle={`${filteredHolidays.length} ${t("holidays")}`}
        actionButton={
          <Button onClick={handleCreate} className="gap-2" data-testid="button-create-holiday">
            <MaterialSymbol name="add_circle" size="sm" />
            {t("addHoliday")}
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
        ) : filteredHolidays.length === 0 ? (
          <div className="p-12 text-center">
            <MaterialSymbol name="calendar_month" size="2xl" className="text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("noHolidaysFound")}</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground">{t("date")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("holidayName")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("type")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("surchargeRate")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("status")}</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.map((holiday) => (
                  <TableRow 
                    key={holiday.id} 
                    className="hover:bg-muted/30 transition-colors"
                    data-testid={`row-holiday-${holiday.id}`}
                  >
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        <MaterialSymbol name="event" size="xs" className="mr-1" />
                        {format(new Date(holiday.holidayDate), "MMM dd, yyyy")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MaterialSymbol name="celebration" size="sm" className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{holiday.nameEn}</div>
                          {holiday.nameAr && (
                            <div className="text-sm text-muted-foreground">{holiday.nameAr}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {holiday.isRecurring ? (
                        <Badge variant="secondary" className="rounded-full">
                          <MaterialSymbol name="event_repeat" size="xs" className="mr-1" />
                          {t("recurring")} ({holiday.recurrenceType || "gregorian"})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full">
                          <MaterialSymbol name="event" size="xs" className="mr-1" />
                          {t("oneTime")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {holiday.surchargeRate ? (
                        <span className="flex items-center gap-1">
                          <MaterialSymbol name="percent" size="xs" className="text-muted-foreground" />
                          {holiday.surchargeRate}x
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {holiday.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400 rounded-full">
                          <MaterialSymbol name="check_circle" size="xs" className="mr-1" />
                          {t("active")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          <MaterialSymbol name="pause_circle" size="xs" className="mr-1" />
                          {t("inactive")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(holiday)}
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          data-testid={`button-edit-holiday-${holiday.id}`}
                        >
                          <MaterialSymbol name="edit" size="sm" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(holiday.id)}
                          className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                          data-testid={`button-delete-holiday-${holiday.id}`}
                        >
                          <MaterialSymbol name="delete" size="sm" />
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
              {editingHoliday ? t("editHoliday") : t("addNewHoliday")}
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
                      <FormLabel>{t("holidayNameEn")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-holiday-name-en" />
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
                      <FormLabel>{t("holidayNameAr")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-holiday-name-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="holidayDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("date")}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date && !isNaN(field.value.getTime()) ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          if (!isNaN(newDate.getTime())) {
                            field.onChange(newDate);
                          }
                        }}
                        data-testid="input-holiday-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>{t("recurringAnnually")}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {t("repeatEveryYear")}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-recurring"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurrenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("recurrenceType")}</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value as "gregorian" | "hijri")} 
                        value={field.value || "gregorian"}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-recurrence-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gregorian">{t("gregorian")}</SelectItem>
                          <SelectItem value="hijri">{t("hijri")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="surchargeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("surchargeMultiplier")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="2.0"
                        data-testid="input-surcharge-rate"
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      {t("leaveBkankToUseDefaultSetting")}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("notes")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={3} data-testid="input-notes" />
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
                      <FormLabel>{t("active")}</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {t("inactiveHolidaysWontApplySurcharge")}
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
                    : editingHoliday
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
