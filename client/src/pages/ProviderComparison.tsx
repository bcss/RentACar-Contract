import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Phone, MessageSquare, Server, Key, Globe,
  CheckCircle2, XCircle, ArrowLeft, Clock
} from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface Provider {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  type: 'email' | 'sms' | 'whatsapp';
  lastUsed?: string;
}

const sampleProviders: Provider[] = [
  { id: '1', name: 'Twilio', code: 'TWILIO', status: 'active', type: 'sms', lastUsed: '2 hours ago' },
  { id: '2', name: 'MessageBird', code: 'MSGBIRD', status: 'inactive', type: 'sms', lastUsed: '3 days ago' },
  { id: '3', name: 'SendGrid', code: 'SENDGRID', status: 'active', type: 'email', lastUsed: '15 minutes ago' },
  { id: '4', name: 'Mailgun', code: 'MAILGUN', status: 'inactive', type: 'email', lastUsed: 'Never' },
];

export default function ProviderComparison() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(sampleProviders[0]);

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-primary" />;
      case 'sms':
        return <Phone className="h-5 w-5 text-primary" />;
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      default:
        return <Server className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              Provider Layout Comparison
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-page-description">
              Professional provider management UI with card-based list and split-screen layouts
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            data-testid="button-back"
            className="rounded-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Layout Comparison Tabs */}
        <Tabs defaultValue="split-screen" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="split-screen" data-testid="tab-split-screen">
              Split-Screen Layout
            </TabsTrigger>
            <TabsTrigger value="card-based" data-testid="tab-card-based">
              Card-Based Layout
            </TabsTrigger>
          </TabsList>

          {/* Split-Screen Layout - PROFESSIONAL REDESIGN */}
          <TabsContent value="split-screen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Split-Screen Layout</CardTitle>
                <CardDescription>
                  Professional master-detail view with card-based list (left) and configuration panel (right)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-6">
                  {/* LEFT: Provider List - PROFESSIONAL CARD-BASED DESIGN */}
                  <div className="col-span-5 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        Communication Providers
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {sampleProviders.length} providers
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {sampleProviders.map((provider) => (
                        <div
                          key={provider.id}
                          className={cn(
                            "relative rounded-md border p-4 cursor-pointer transition-all",
                            "hover-elevate active-elevate-2",
                            selectedProvider?.id === provider.id 
                              ? "border-primary bg-primary/5" 
                              : "border-border bg-card"
                          )}
                          onClick={() => setSelectedProvider(provider)}
                          data-testid={`item-provider-${provider.id}`}
                        >
                          {/* Selection Indicator */}
                          {selectedProvider?.id === provider.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md" />
                          )}

                          <div className="flex items-start gap-3 pl-2">
                            {/* Provider Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {getProviderIcon(provider.type)}
                            </div>

                            {/* Provider Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground truncate">
                                  {provider.name}
                                </h4>
                                {provider.status === 'active' ? (
                                  <div className="flex items-center gap-1 text-xs text-success">
                                    <div className="h-2 w-2 rounded-full bg-success" />
                                    <span className="font-medium">Active</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                                    <span className="font-medium">Inactive</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono font-medium">{provider.code}</span>
                                <span>•</span>
                                <span className="capitalize">{provider.type}</span>
                              </div>

                              {provider.lastUsed && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Last used: {provider.lastUsed}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: Provider Details/Form */}
                  <div className="col-span-7 space-y-6">
                    {selectedProvider && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                              {getProviderIcon(selectedProvider.type)}
                              {selectedProvider.name} Configuration
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Global settings for {selectedProvider.name} {selectedProvider.type} provider
                            </p>
                          </div>
                          <Button variant="destructive" size="sm" className="rounded-none" data-testid="button-delete">
                            Delete
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {/* Provider Name */}
                          <div className="flex items-center gap-3 border-b border-border pb-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Provider name"
                              defaultValue={selectedProvider?.name}
                              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                              data-testid="input-provider-name"
                            />
                          </div>

                          {/* Provider Code */}
                          <div className="flex items-center gap-3 border-b border-border pb-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Unique code"
                              defaultValue={selectedProvider?.code}
                              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground uppercase font-mono"
                              data-testid="input-provider-code"
                            />
                          </div>

                          {/* Base URL */}
                          <div className="flex items-center gap-3 border-b border-border pb-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="url"
                              placeholder="Base URL (e.g. https://api.provider.com)"
                              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                              data-testid="input-base-url"
                            />
                          </div>

                          {/* API Key */}
                          <div className="flex items-center gap-3 border-b border-border pb-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="password"
                              placeholder="API Key"
                              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground font-mono"
                              data-testid="input-api-key"
                            />
                          </div>

                          {/* Description */}
                          <div className="border-b border-border pb-2">
                            <div className="flex items-center gap-3 mb-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">Description</span>
                            </div>
                            <textarea
                              rows={3}
                              className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none"
                              placeholder="Internal notes about this provider's configuration and usage..."
                              data-testid="textarea-description"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                          <Button variant="outline" className="rounded-none" data-testid="button-cancel">
                            Cancel
                          </Button>
                          <Button className="rounded-none" data-testid="button-save">
                            Save Configuration
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Card-Based Layout */}
          <TabsContent value="card-based" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleProviders.map((provider) => (
                <Card key={provider.id} className="hover-elevate" data-testid={`card-provider-${provider.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(provider.type)}
                        <div>
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <CardDescription className="text-xs font-mono mt-0.5">
                            {provider.code}
                          </CardDescription>
                        </div>
                      </div>
                      {provider.status === 'active' ? (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span className="font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <span className="font-medium">Inactive</span>
                        </div>
                      )}
                    </div>
                    {provider.lastUsed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>Last used: {provider.lastUsed}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Base URL */}
                    <div className="flex items-center gap-3 border-b border-border pb-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="Base URL"
                        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                        data-testid={`input-base-url-${provider.id}`}
                      />
                    </div>

                    {/* API Key */}
                    <div className="flex items-center gap-3 border-b border-border pb-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="API Key"
                        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground font-mono"
                        data-testid={`input-api-key-${provider.id}`}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" className="rounded-none">
                        Test Connection
                      </Button>
                      <Button size="sm" className="rounded-none">
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Card-Based Layout Benefits</CardTitle>
                <CardDescription>
                  Each provider gets its own card - ideal for dashboards and configuration overviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Scannable grid layout with visual separation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Self-contained configuration per provider
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Responsive and mobile-friendly design
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Parallel management of multiple providers
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
