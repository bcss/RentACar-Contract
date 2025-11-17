import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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

export default function PublicHolidays() {
  const { t } = useTranslation();
  const { toast } = useToast();
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
      toast({ title: t("success"), description: t("holidayCreated") });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPublicHoliday> }) =>
      apiRequest("PATCH", `/api/public-holidays/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-holidays"] });
      toast({ title: t("success"), description: t("holidayUpdated") });
      setDialogOpen(false);
      setEditingHoliday(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/public-holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-holidays"] });
      toast({ title: t("success"), description: t("holidayDeleted") });
    },
    onError: (error: Error) => {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("publicHolidays")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("manageUaePublicHolidays")}
          </p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-holiday">
          <Plus className="w-4 h-4 mr-2" />
          {t("addHoliday")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t("holidayCalendar")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              {t("loading")}
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noHolidaysFound")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("holidayName")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("surchargeRate")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id} data-testid={`row-holiday-${holiday.id}`}>
                    <TableCell>
                      {format(new Date(holiday.holidayDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{holiday.nameEn}</div>
                        {holiday.nameAr && (
                          <div className="text-sm text-muted-foreground">{holiday.nameAr}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {holiday.isRecurring ? (
                        <Badge variant="secondary">
                          {t("recurring")} ({holiday.recurrenceType || "gregorian"})
                        </Badge>
                      ) : (
                        <Badge variant="outline">{t("oneTime")}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {holiday.surchargeRate ? `${holiday.surchargeRate}x` : "-"}
                    </TableCell>
                    <TableCell>
                      {holiday.isActive ? (
                        <Badge variant="default">{t("active")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("inactive")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(holiday)}
                          data-testid={`button-edit-holiday-${holiday.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(holiday.id)}
                          data-testid={`button-delete-holiday-${holiday.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
