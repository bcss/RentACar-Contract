import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Mail, MessageSquare, Edit, Power, AlertCircle } from "lucide-react";
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
import { insertCommunicationProviderSchema, type CommunicationProvider, type InsertCommunicationProvider } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CommunicationProviders() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CommunicationProvider | null>(null);

  const { data: providers = [], isLoading } = useQuery<CommunicationProvider[]>({
    queryKey: ["/api/communication-providers"],
  });

  const form = useForm<InsertCommunicationProvider>({
    resolver: zodResolver(insertCommunicationProviderSchema),
    defaultValues: {
      name: "",
      type: "sms",
      provider: "twilio",
      isActive: true,
      priority: 1,
      credentials: {},
      configuration: {},
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCommunicationProvider) => apiRequest("POST", "/api/communication-providers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communication-providers"] });
      showSuccess(t("success"), "Provider created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCommunicationProvider> }) =>
      apiRequest("PATCH", `/api/communication-providers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communication-providers"] });
      showSuccess(t("success"), "Provider updated successfully");
      setDialogOpen(false);
      setEditingProvider(null);
      form.reset();
    },
    onError: (error: Error) => {
      showError(error, t("error"));
    },
  });

  const handleCreate = () => {
    setEditingProvider(null);
    form.reset({
      name: "",
      type: "sms",
      provider: "twilio",
      isActive: true,
      priority: 1,
      credentials: {},
      configuration: {},
    });
    setDialogOpen(true);
  };

  const handleEdit = (provider: CommunicationProvider) => {
    setEditingProvider(provider);
    form.reset({
      name: provider.name,
      type: provider.type,
      provider: provider.provider,
      isActive: provider.isActive,
      priority: provider.priority,
      credentials: provider.credentials || {},
      configuration: provider.configuration || {},
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertCommunicationProvider) => {
    if (editingProvider) {
      updateMutation.mutate({ id: editingProvider.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const smsProviders = providers.filter(p => p.type === 'sms');
  const emailProviders = providers.filter(p => p.type === 'email');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Communication Providers</h1>
          <p className="text-muted-foreground mt-1">Manage SMS and Email service providers with priority-based fallback routing</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-provider">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Providers ({smsProviders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smsProviders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No SMS providers configured</p>
                  <p className="text-sm">Add Twilio or another SMS provider to enable notifications</p>
                </div>
              ) : (
                smsProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`provider-sms-${provider.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority: {provider.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {provider.provider.toUpperCase()} • 
                        Last used: {provider.lastUsed ? new Date(provider.lastUsed).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(provider)}
                      data-testid={`button-edit-provider-${provider.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Providers ({emailProviders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emailProviders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No Email providers configured</p>
                  <p className="text-sm">Add SendGrid, Gmail, or SMTP to enable email notifications</p>
                </div>
              ) : (
                emailProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`provider-email-${provider.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority: {provider.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {provider.provider.toUpperCase()} • 
                        Last used: {provider.lastUsed ? new Date(provider.lastUsed).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(provider)}
                      data-testid={`button-edit-provider-${provider.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Provider" : "Add Communication Provider"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Primary Twilio SMS" data-testid="input-provider-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!editingProvider}>
                        <FormControl>
                          <SelectTrigger data-testid="select-provider-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-provider-service">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("type") === "sms" ? (
                            <>
                              <SelectItem value="twilio">Twilio</SelectItem>
                              <SelectItem value="generic">Generic API</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="sendgrid">SendGrid</SelectItem>
                              <SelectItem value="gmail">Gmail OAuth</SelectItem>
                              <SelectItem value="smtp">SMTP/TLS</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (1 = Highest)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min="1" max="10" onChange={(e) => field.onChange(parseInt(e.target.value))} data-testid="input-provider-priority" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <FormLabel className="mb-0">Active</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-provider-active" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> API credentials must be configured via Replit Secrets for security.
                  Required secrets vary by provider:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc space-y-1">
                  <li><strong>Twilio SMS:</strong> TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER</li>
                  <li><strong>SendGrid Email:</strong> SENDGRID_API_KEY, SENDGRID_FROM_EMAIL</li>
                  <li><strong>Gmail OAuth:</strong> GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-provider"
                >
                  {editingProvider ? "Update Provider" : "Create Provider"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel-provider"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
