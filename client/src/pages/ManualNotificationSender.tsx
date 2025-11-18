import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { NotificationTemplate, Customer } from "@shared/schema";
import { Send, Mail, Phone, AlertCircle, CheckCircle2 } from "lucide-react";

const manualNotificationSchema = z.object({
  channel: z.enum(["sms", "email"]),
  recipient: z.string().min(1, "Recipient is required"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  templateId: z.string().optional(),
});

type ManualNotificationForm = z.infer<typeof manualNotificationSchema>;

export default function ManualNotificationSender() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);

  const form = useForm<ManualNotificationForm>({
    resolver: zodResolver(manualNotificationSchema),
    defaultValues: {
      channel: "sms",
      recipient: "",
      subject: "",
      message: "",
    },
  });

  const { data: templates } = useQuery<NotificationTemplate[]>({
    queryKey: ['/api/notification-templates'],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const sendMutation = useMutation({
    mutationFn: (data: ManualNotificationForm) => 
      apiRequest("POST", "/api/notifications/send", data),
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Notification has been queued for delivery",
      });
      form.reset();
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      form.setValue("message", template.bodyEn);
      if (template.subjectEn) {
        form.setValue("subject", template.subjectEn);
      }
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers?.find(c => c.id === customerId);
    if (customer) {
      const channel = form.watch("channel");
      if (channel === "sms") {
        form.setValue("recipient", customer.phone);
      } else {
        form.setValue("recipient", customer.email || "");
      }
    }
  };

  const onSubmit = (data: ManualNotificationForm) => {
    sendMutation.mutate(data);
  };

  const channelValue = form.watch("channel");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-manual-sender">
          Send Notification
        </h1>
        <p className="text-muted-foreground">
          Manually send SMS or Email notifications to customers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>
                Select a template or compose a custom message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Channel Selection */}
                  <FormField
                    control={form.control}
                    name="channel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-channel">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sms">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                SMS
                              </div>
                            </SelectItem>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quick Customer Select */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Quick Select Customer
                    </label>
                    <Select onValueChange={handleCustomerSelect}>
                      <SelectTrigger data-testid="select-customer">
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.nameEn} - {channelValue === 'sms' ? customer.phone : customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recipient */}
                  <FormField
                    control={form.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {channelValue === 'sms' ? 'Phone Number' : 'Email Address'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              channelValue === 'sms' 
                                ? '+971501234567' 
                                : 'customer@example.com'
                            }
                            data-testid="input-recipient"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject (Email only) */}
                  {channelValue === 'email' && (
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter email subject"
                              data-testid="input-subject"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter your message here..."
                            className="min-h-[200px]"
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormDescription>
                          {channelValue === 'sms' && (
                            <>Character count: {field.value?.length || 0} / 160</>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={sendMutation.isPending}
                      data-testid="button-send-notification"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendMutation.isPending ? 'Sending...' : 'Send Notification'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        setSelectedTemplate(null);
                      }}
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Templates Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Quick load from system templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates?.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-3 border rounded-lg cursor-pointer hover-elevate ${
                      selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    data-testid={`template-card-${template.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{template.name}</p>
                      {template.isSystemTemplate && (
                        <Badge variant="secondary" className="text-xs">System</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.bodyEn}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!templates || templates.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No templates available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Send Status */}
          {sendMutation.isSuccess && (
            <Card className="mt-4 border-green-200 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="font-medium">Message queued successfully!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
