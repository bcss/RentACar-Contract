import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Phone, MessageSquare, Server, Key, Globe,
  CheckCircle2, XCircle, ArrowLeft
} from 'lucide-react';
import { useLocation } from 'wouter';

interface Provider {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  type: 'email' | 'sms' | 'whatsapp';
}

const sampleProviders: Provider[] = [
  { id: '1', name: 'Twilio', code: 'TWILIO', status: 'active', type: 'sms' },
  { id: '2', name: 'MessageBird', code: 'MSGBIRD', status: 'inactive', type: 'sms' },
  { id: '3', name: 'SendGrid', code: 'SENDGRID', status: 'active', type: 'email' },
  { id: '4', name: 'Mailgun', code: 'MAILGUN', status: 'inactive', type: 'email' },
];

export default function ProviderComparison() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(sampleProviders[0]);

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
              Side-by-side comparison of card-based vs split-screen provider management layouts
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

          {/* Split-Screen Layout */}
          <TabsContent value="split-screen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Split-Screen Layout (from comms-provider.html)</CardTitle>
                <CardDescription>
                  Left sidebar for list, right panel for details/form - ideal for master-detail views
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-6">
                  {/* LEFT: Provider List */}
                  <div className="col-span-5 space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Providers
                    </h3>
                    <div className="border border-border rounded-md">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 font-medium">Name</th>
                            <th className="px-3 py-2 font-medium">Code</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sampleProviders.map((provider) => (
                            <tr
                              key={provider.id}
                              className={`hover-elevate active-elevate-2 cursor-pointer ${
                                selectedProvider?.id === provider.id ? 'bg-accent' : ''
                              }`}
                              onClick={() => setSelectedProvider(provider)}
                              data-testid={`row-provider-${provider.id}`}
                            >
                              <td className="px-3 py-2 text-foreground">{provider.name}</td>
                              <td className="px-3 py-2 text-muted-foreground text-[11px]">{provider.code}</td>
                              <td className="px-3 py-2">
                                {provider.status === 'active' ? (
                                  <Badge variant="default" className="text-[11px]">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[11px]">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Inactive
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RIGHT: Provider Details/Form */}
                  <div className="col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">
                          Provider Configuration
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Global configuration for {selectedProvider?.name}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" className="rounded-none" data-testid="button-delete">
                        Delete
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Minimal Input Fields (from fields-demo.html) */}
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

                      <div className="flex items-center gap-3 border-b border-border pb-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Unique code"
                          defaultValue={selectedProvider?.code}
                          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground uppercase"
                          data-testid="input-provider-code"
                        />
                      </div>

                      <div className="flex items-center gap-3 border-b border-border pb-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="url"
                          placeholder="Base URL (e.g. https://api.provider.com)"
                          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                          data-testid="input-base-url"
                        />
                      </div>

                      <div className="flex items-center gap-3 border-b border-border pb-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="API Key"
                          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                          data-testid="input-api-key"
                        />
                      </div>

                      <div className="border-b border-border pb-2">
                        <div className="flex items-center gap-3 mb-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Description</span>
                        </div>
                        <textarea
                          rows={2}
                          className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none"
                          placeholder="Internal notes about this provider"
                          data-testid="textarea-description"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" className="rounded-none" data-testid="button-cancel">
                        Cancel
                      </Button>
                      <Button className="rounded-none" data-testid="button-save">
                        Save Configuration
                      </Button>
                    </div>
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
                        {provider.type === 'email' ? (
                          <Mail className="h-5 w-5 text-primary" />
                        ) : provider.type === 'sms' ? (
                          <Phone className="h-5 w-5 text-primary" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-primary" />
                        )}
                        <CardTitle>{provider.name}</CardTitle>
                      </div>
                      {provider.status === 'active' ? (
                        <Badge variant="default">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <CardDescription>Code: {provider.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Minimal Input Fields */}
                    <div className="flex items-center gap-3 border-b border-border pb-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="Base URL"
                        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                        data-testid={`input-base-url-${provider.id}`}
                      />
                    </div>

                    <div className="flex items-center gap-3 border-b border-border pb-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="API Key"
                        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                        data-testid={`input-api-key-${provider.id}`}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="rounded-none">
                        Test
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
                  Each provider gets its own card - great for dashboards and overviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Scannable grid layout</li>
                  <li>✓ Self-contained configuration per card</li>
                  <li>✓ Responsive and mobile-friendly</li>
                  <li>✓ Visual separation between providers</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
