import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Bell, Send, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DateSelector } from "@/components/ui/date-selector";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertAutomatedReminderSchema,
  type AutomatedReminder,
  type InsertAutomatedReminder
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AutomatedReminders() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<AutomatedReminder | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<string>("contract");

  const { data: reminders = [], isLoading } = useQuery<AutomatedReminder[]>({
    queryKey: ["/api/automated-reminders"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: drivers = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: sponsors = [] } = useQuery<any[]>({
    queryKey: ["/api/sponsors"],
  });

  const { data: documents = [] } = useQuery<any[]>({
    queryKey: ["/api/documents"],
  });

  const form = useForm<InsertAutomatedReminder>({
    resolver: zodResolver(insertAutomatedReminderSchema),
    defaultValues: {
      entityType: "contract",
      entityId: "",
      reminderType: "contract_expiry",
      reminderDate: new Date(),
      frequency: "once",
      channel: "email",
      messageTemplate: "",
      recipientEmail: "",
      recipientPhone: "",
      isSent: false,
      sendAttempts: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertAutomatedReminder) => apiRequest("POST", "/api/automated-reminders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automated-reminders"] });
      showSuccess(t("success"), "Reminder created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertAutomatedReminder> }) =>
      apiRequest("PATCH", `/api/automated-reminders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automated-reminders"] });
      showSuccess(t("success"), "Reminder updated successfully");
      setDialogOpen(false);
      setEditingReminder(null);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const markSentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/automated-reminders/${id}/mark-sent`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automated-reminders"] });
      showSuccess(t("success"), "Reminder marked as sent");
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const handleCreate = () => {
    setEditingReminder(null);
    form.reset({
      entityType: "contract",
      entityId: "",
      reminderType: "contract_expiry",
      reminderDate: new Date(),
      frequency: "once",
      channel: "email",
      messageTemplate: "",
      recipientEmail: "",
      recipientPhone: "",
      isSent: false,
      sendAttempts: 0,
      isActive: true,
    });
    setSelectedEntityType("contract");
    setDialogOpen(true);
  };

  const handleEdit = (reminder: AutomatedReminder) => {
    setEditingReminder(reminder);
    setSelectedEntityType(reminder.entityType);
    form.reset({
      entityType: reminder.entityType,
      entityId: reminder.entityId,
      reminderType: reminder.reminderType,
      reminderDate: reminder.reminderDate,
      frequency: reminder.frequency as any,
      channel: reminder.channel as any,
      messageTemplate: reminder.messageTemplate || "",
      recipientEmail: reminder.recipientEmail || "",
      recipientPhone: reminder.recipientPhone || "",
      isSent: reminder.isSent,
      sendAttempts: reminder.sendAttempts || 0,
      isActive: reminder.isActive,
    });
    setDialogOpen(true);
  };

  const handleMarkSent = (id: string) => {
    markSentMutation.mutate(id);
  };

  const onSubmit = (data: InsertAutomatedReminder) => {
    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getEntityOptions = (entityType: string) => {
    switch (entityType) {
      case "customer":
        return customers.map(c => ({ value: c.id, label: c.nameEn }));
      case "driver":
        return drivers.map(d => ({ value: d.id, label: d.nameEn }));
      case "vehicle":
        return vehicles.map(v => ({ value: v.id, label: `${v.registration} - ${v.make} ${v.model}` }));
      case "contract":
        return contracts.map(c => ({ value: c.id, label: c.contractNumber }));
      case "sponsor":
        return sponsors.map(s => ({ value: s.id, label: s.nameEn }));
      case "document":
        return documents.map(d => ({ value: d.id, label: d.documentType }));
      default:
        return [];
    }
  };

  const getEntityName = (entityType: string, entityId: string) => {
    switch (entityType) {
      case "customer":
        return customers.find(c => c.id === entityId)?.nameEn || "N/A";
      case "driver":
        return drivers.find(d => d.id === entityId)?.nameEn || "N/A";
      case "vehicle":
        const vehicle = vehicles.find(v => v.id === entityId);
        return vehicle ? vehicle.registration : "N/A";
      case "contract":
        return contracts.find(c => c.id === entityId)?.contractNumber || "N/A";
      case "sponsor":
        return sponsors.find(s => s.id === entityId)?.nameEn || "N/A";
      case "document":
        return documents.find(d => d.id === entityId)?.documentType || "N/A";
      default:
        return "N/A";
    }
  };

  const getStatusBadge = (reminder: AutomatedReminder) => {
    if (!reminder.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (reminder.isSent) {
      return <Badge variant="default">Sent</Badge>;
    }
    if (reminder.lastError) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const totalReminders = reminders.length;
  const sentReminders = reminders.filter(r => r.isSent).length;
  const pendingReminders = reminders.filter(r => !r.isSent && r.isActive).length;
  const failedReminders = reminders.filter(r => r.lastError).length;
  const failedRate = totalReminders > 0 ? ((failedReminders / totalReminders) * 100).toFixed(1) : "0";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Automated Reminders
          </h1>
          <p className="text-muted-foreground mt-1">Manage automated notifications and reminders</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-reminder">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReminders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentReminders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReminders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Rate</CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No reminders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reminder Type</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id} data-testid={`table-row-reminder-${reminder.id}`}>
                    <TableCell className="font-medium">{reminder.reminderType}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reminder.entityType}</Badge>
                    </TableCell>
                    <TableCell>{getEntityName(reminder.entityType, reminder.entityId)}</TableCell>
                    <TableCell>{format(new Date(reminder.reminderDate), "PPp")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {reminder.channel === "email" && <Mail className="w-4 h-4" />}
                        {reminder.channel === "sms" && <MessageSquare className="w-4 h-4" />}
                        <span>{reminder.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(reminder)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(reminder)}
                          data-testid={`button-edit-reminder-${reminder.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!reminder.isSent && reminder.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkSent(reminder.id)}
                            data-testid={`button-mark-sent-${reminder.id}`}
                          >
                            Mark as Sent
                          </Button>
                        )}
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
            <DialogTitle>{editingReminder ? "Edit Reminder" : "Create Reminder"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="entityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedEntityType(value);
                        form.setValue("entityId", "");
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-entityType">
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="sponsor">Sponsor</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-entityId">
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getEntityOptions(selectedEntityType).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="reminderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reminderType">
                          <SelectValue placeholder="Select reminder type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contract_expiry">Contract Expiry</SelectItem>
                        <SelectItem value="payment_due">Payment Due</SelectItem>
                        <SelectItem value="document_expiry">Document Expiry</SelectItem>
                        <SelectItem value="license_renewal">License Renewal</SelectItem>
                        <SelectItem value="insurance_renewal">Insurance Renewal</SelectItem>
                        <SelectItem value="maintenance_due">Maintenance Due</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Date *</FormLabel>
                    <FormControl>
                      <DateSelector
                        value={field.value}
                        onChange={field.onChange}
                        data-testid="input-reminderDate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-channel">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(form.watch("channel") === "email" || form.watch("channel") === "both") && (
                <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-recipientEmail" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(form.watch("channel") === "sms" || form.watch("channel") === "both") && (
                <FormField
                  control={form.control}
                  name="recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-recipientPhone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="messageTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Template</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-messageTemplate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
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
                      <FormLabel className="text-base">Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this reminder
                      </div>
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-reminder">
                  {editingReminder ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
