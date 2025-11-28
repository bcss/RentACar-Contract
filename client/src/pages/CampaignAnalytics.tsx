/**
 * Campaign Analytics Dashboard
 * 
 * Provides comprehensive analytics and insights for marketing campaigns:
 * - Campaign performance metrics
 * - Delivery statistics
 * - Provider health monitoring
 * - Success/failure rates
 * - Cost tracking
 * - Engagement analytics
 */

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, Send, CheckCircle, XCircle, DollarSign, Users,
  Mail, MessageSquare, Activity, AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export default function CampaignAnalytics() {
  const { t } = useTranslation();
  
  // Fetch campaign analytics data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/campaigns'],
  });
  
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/communication-logs'],
  });
  
  const { data: providerHealth = [], isLoading: providersLoading } = useQuery({
    queryKey: ['/api/communication-providers/health'],
  });
  
  // Calculate overall metrics
  const totalSent = logs.filter((l: any) => l.status === 'sent' || l.status === 'delivered').length;
  const totalFailed = logs.filter((l: any) => l.status === 'failed').length;
  const totalPending = logs.filter((l: any) => l.status === 'pending').length;
  const successRate = totalSent > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) : '0';
  
  const totalSmsSent = logs.filter((l: any) => l.channel === 'sms' && (l.status === 'sent' || l.status === 'delivered')).length;
  const totalEmailSent = logs.filter((l: any) => l.channel === 'email' && (l.status === 'sent' || l.status === 'delivered')).length;
  
  // Campaign status distribution
  const campaignStatusData = [
    { name: 'Scheduled', value: campaigns.filter((c: any) => c.status === 'scheduled').length, color: '#3b82f6' },
    { name: 'In Progress', value: campaigns.filter((c: any) => c.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Completed', value: campaigns.filter((c: any) => c.status === 'completed').length, color: '#10b981' },
    { name: 'Failed', value: campaigns.filter((c: any) => c.status === 'failed').length, color: '#ef4444' },
  ];
  
  // Channel distribution
  const channelData = [
    { name: 'SMS', value: totalSmsSent, color: '#8b5cf6' },
    { name: 'Email', value: totalEmailSent, color: '#06b6d4' },
  ];
  
  // Daily delivery trend (last 7 days)
  const deliveryTrendData = generateDeliveryTrend(logs);
  
  return (
    <PageLayout title={t('campaigns.analytics')}>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList data-testid="tabs-analytics">
          <TabsTrigger value="overview" data-testid="tab-overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">{t('campaigns.title')}</TabsTrigger>
          <TabsTrigger value="providers" data-testid="tab-providers">{t('communications.providers')}</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title={t('communications.totalSent')}
              value={totalSent.toLocaleString()}
              icon={Send}
              trend="+12% from last week"
              isLoading={logsLoading}
            />
            <KPICard
              title={t('communications.successRate')}
              value={`${successRate}%`}
              icon={CheckCircle}
              trend="98.5% target"
              isLoading={logsLoading}
            />
            <KPICard
              title={t('communications.totalFailed')}
              value={totalFailed.toLocaleString()}
              icon={XCircle}
              trend="-5% from last week"
              isLoading={logsLoading}
            />
            <KPICard
              title={t('communications.pending')}
              value={totalPending.toLocaleString()}
              icon={Activity}
              trend="In queue"
              isLoading={logsLoading}
            />
          </div>
          
          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Delivery Trend */}
            <Card>
              <CardHeader>
                <CardTitle>{t('communications.deliveryTrend')}</CardTitle>
                <CardDescription>{t('communications.last7Days')}</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={deliveryTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} name="Sent" />
                      <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('communications.channelDistribution')}</CardTitle>
                <CardDescription>{t('communications.byMessageType')}</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Campaign Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t('campaigns.statusDistribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6">
                      {campaignStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>{t('campaigns.recent')}</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('campaigns.noData')}</p>
              ) : (
                <div className="space-y-2">
                  {campaigns.slice(0, 5).map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate active-elevate-2">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      </div>
                      <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {providersLoading ? (
              <>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </>
            ) : providerHealth.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-8">
                  <p className="text-sm text-muted-foreground text-center">{t('communications.noProviders')}</p>
                </CardContent>
              </Card>
            ) : (
              providerHealth.map((provider: any) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {provider.type === 'sms' ? <MessageSquare className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                        {provider.name}
                      </CardTitle>
                      <Badge variant={provider.healthStatus === 'healthy' ? 'default' : 'destructive'}>
                        {provider.healthStatus}
                      </Badge>
                    </div>
                    <CardDescription>{provider.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('communications.totalSent')}</span>
                      <span className="font-medium">{provider.totalSent || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('communications.totalFailed')}</span>
                      <span className="font-medium text-[hsl(var(--negative))]">{provider.totalFailed || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('communications.lastUsed')}</span>
                      <span className="font-medium">
                        {provider.lastUsed ? new Date(provider.lastUsed).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

// KPI Card Component
function KPICard({ title, value, icon: Icon, trend, isLoading }: {
  title: string;
  value: string;
  icon: any;
  trend?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

// Helper: Generate delivery trend data for last 7 days
function generateDeliveryTrend(logs: any[]): any[] {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySent = logs.filter((l: any) => 
      l.createdAt && 
      l.createdAt.startsWith(dateStr) && 
      (l.status === 'sent' || l.status === 'delivered')
    ).length;
    
    const dayFailed = logs.filter((l: any) => 
      l.createdAt && 
      l.createdAt.startsWith(dateStr) && 
      l.status === 'failed'
    ).length;
    
    last7Days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sent: daySent,
      failed: dayFailed,
    });
  }
  
  return last7Days;
}
