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
      showSuccess(t("success"), t('communications.providerCreated'));
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
      showSuccess(t("success"), t('communications.providerUpdated'));
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
          <h1 className="text-3xl font-bold">{t('communications.providers')}</h1>
          <p className="text-muted-foreground mt-1">{t('communications.providersDescription')}</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-provider">
          <Plus className="h-4 w-4" />
          {t('communications.addProvider')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('communications.smsProviders')} ({smsProviders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smsProviders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t('communications.noSmsProviders')}</p>
                  <p className="text-sm">{t('communications.addSmsProviderHint')}</p>
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
                          {provider.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                        <Badge variant="outline">{t('communications.priority')}: {provider.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {provider.provider.toUpperCase()} • 
                        {t('communications.lastUsed')}: {provider.lastUsed ? new Date(provider.lastUsed).toLocaleDateString() : t('common.never')}
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
              {t('communications.emailProviders')} ({emailProviders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emailProviders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t('communications.noEmailProviders')}</p>
                  <p className="text-sm">{t('communications.addEmailProviderHint')}</p>
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
                          {provider.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                        <Badge variant="outline">{t('communications.priority')}: {provider.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {provider.provider.toUpperCase()} • 
                        {t('communications.lastUsed')}: {provider.lastUsed ? new Date(provider.lastUsed).toLocaleDateString() : t('common.never')}
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
            <DialogTitle>{editingProvider ? t('communications.editProvider') : t('communications.addProvider')}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('communications.providerName')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('communications.providerNamePlaceholder')} data-testid="input-provider-name" />
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
                      <FormLabel>{t('communications.providerType')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!editingProvider}>
                        <FormControl>
                          <SelectTrigger data-testid="select-provider-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sms">{t('communications.typeSms')}</SelectItem>
                          <SelectItem value="email">{t('communications.typeEmail')}</SelectItem>
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
                      <FormLabel>{t('communications.service')}</FormLabel>
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
                      <FormLabel>{t('communications.priorityLabel')}</FormLabel>
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
                      <FormLabel className="mb-0">{t('common.active')}</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-provider-active" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>{t('common.note')}:</strong> {t('communications.credentialsNote')}
                </p>
                <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc space-y-1">
                  <li><strong>{t('communications.twilioSms')}:</strong> TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER</li>
                  <li><strong>{t('communications.sendgridEmail')}:</strong> SENDGRID_API_KEY, SENDGRID_FROM_EMAIL</li>
                  <li><strong>{t('communications.gmailOauth')}:</strong> GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-provider"
                >
                  {editingProvider ? t('communications.updateProvider') : t('communications.createProvider')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel-provider"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
