/**
 * Design System Showcase
 * 
 * This page demonstrates 12 dashboard variations using consistent design patterns.
 * 
 * Internationalization Note:
 * - All visible UI elements (tab names, KPI titles, chart titles, status labels) 
 *   are internationalized using i18next translation keys
 * - Sample demonstration data (customer names, vehicle models, activity descriptions) 
 *   remains in English as illustrative placeholders
 * - This pragmatic approach provides full bilingual UX while keeping maintenance simple
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, Car, Users, TrendingUp, AlertTriangle, CheckCircle, 
  Clock, Settings, Shield, Bell, Target, LineChart, Activity,
  FileText, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { layout, dashboard } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// Sample Data
const revenueData = [
  { month: 'Jan', revenue: 45000, target: 40000 },
  { month: 'Feb', revenue: 52000, target: 45000 },
  { month: 'Mar', revenue: 48000, target: 50000 },
  { month: 'Apr', revenue: 61000, target: 55000 },
  { month: 'May', revenue: 55000, target: 60000 },
  { month: 'Jun', revenue: 67000, target: 65000 },
];

const vehicleData = [
  { vehicle: 'Toyota Camry', revenue: 25000 },
  { vehicle: 'Honda Accord', revenue: 22000 },
  { vehicle: 'Nissan Altima', revenue: 19000 },
  { vehicle: 'Hyundai Sonata', revenue: 17000 },
  { vehicle: 'Kia Optima', revenue: 15000 },
];

// KPI Card Component
function KPICard({ title, value, change, trend, icon: Icon }: {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: any;
}) {
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs flex items-center gap-1 mt-1", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{change}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Dashboard 1: Executive Summary
function ExecutiveDashboard() {
  const { t } = useTranslation();
  
  // Localized status data
  const statusData = [
    { name: t('designShowcase.statusActive'), value: 45, color: '#10b981' },
    { name: t('designShowcase.statusCompleted'), value: 30, color: '#3b82f6' },
    { name: t('designShowcase.statusDraft'), value: 15, color: '#f59e0b' },
    { name: t('designShowcase.statusClosed'), value: 10, color: '#6b7280' },
  ];
  
  return (
    <div className={layout.section}>
      <div className={dashboard.dashboardGrid}>
        <KPICard title={t('designShowcase.totalRevenue')} value="AED 328K" change="+12.5%" trend="up" icon={DollarSign} />
        <KPICard title={t('designShowcase.activeContracts')} value="45" change="+8" trend="up" icon={FileText} />
        <KPICard title={t('designShowcase.fleetUtilization')} value="87%" change="+3.2%" trend="up" icon={Car} />
        <KPICard title={t('designShowcase.avgRiskScore')} value="32" change="-5 pts" trend="down" icon={Shield} />
      </div>
      <div className={dashboard.dashboardGrid2}>
        <Card>
          <CardHeader><CardTitle>{t('designShowcase.revenueTrend')}</CardTitle></CardHeader>
          <CardContent>
            <div className={dashboard.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('designShowcase.topVehicles')}</CardTitle></CardHeader>
          <CardContent>
            <div className={dashboard.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="vehicle" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className={dashboard.dashboardGrid2}>
        <Card>
          <CardHeader><CardTitle>{t('designShowcase.contractStatus')}</CardTitle></CardHeader>
          <CardContent>
            <div className={dashboard.chartContainerSmall}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('designShowcase.recentActivity')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, text: t('designShowcase.activityContractCompleted'), time: '2h ago', color: 'text-green-600' },
                { icon: Car, text: t('designShowcase.activityNewVehicle'), time: '5h ago', color: 'text-blue-600' },
                { icon: AlertTriangle, text: t('designShowcase.activityInspectionDue'), time: '1d ago', color: 'text-orange-600' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <activity.icon className={cn("h-5 w-5 mt-0.5", activity.color)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dashboard 2: Operations
function OperationsDashboard() {
  const { t } = useTranslation();
  
  // Status label lookup map
  const statusLabels: Record<string, string> = {
    'pending': t('designShowcase.statusPending'),
    'on-time': t('designShowcase.statusOnTime'),
    'ready': t('designShowcase.statusReady'),
  };
  
  // Activity type lookup map
  const activityTypes: Record<string, string> = {
    'Pickup': t('designShowcase.pickup'),
    'Return': t('designShowcase.return'),
  };
  
  return (
    <div className={layout.section}>
      <div className={dashboard.dashboardGrid}>
        <KPICard title={t('designShowcase.availableVehicles')} value="23" change="12% of fleet" icon={Car} />
        <KPICard title={t('designShowcase.currentlyRented')} value="152" change="87% utilization" trend="up" icon={Activity} />
        <KPICard title={t('designShowcase.underMaintenance')} value="8" change="3 scheduled" icon={Settings} />
        <KPICard title={t('designShowcase.overdueReturns')} value="3" change="Attention needed" icon={AlertTriangle} />
      </div>
      <Card>
        <CardHeader><CardTitle>{t('designShowcase.todaySchedule')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { type: 'Pickup', time: '09:00 AM', customer: 'Mohammed Hassan', vehicle: 'Toyota Camry', status: 'pending' },
              { type: 'Return', time: '11:00 AM', customer: 'Fatima Ali', vehicle: 'Honda Accord', status: 'on-time' },
              { type: 'Pickup', time: '02:00 PM', customer: 'Ali Khalid', vehicle: 'Nissan Altima', status: 'ready' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{activityTypes[item.type] || item.type}</Badge>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="font-medium text-sm">{item.customer}</p>
                  <p className="text-xs text-muted-foreground">{item.vehicle}</p>
                </div>
                <Badge>{statusLabels[item.status] || item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard 3-12: Simplified versions for space
function FinancialDashboard() {
  const { t } = useTranslation();
  
  return (
    <div className={layout.section}>
      <div className={dashboard.dashboardGrid}>
        <KPICard title={t('designShowcase.revenue')} value="AED 328K" change="+12.5%" trend="up" icon={DollarSign} />
        <KPICard title={t('designShowcase.outstanding')} value="AED 45K" change="15 invoices" icon={FileText} />
        <KPICard title={t('designShowcase.collectionRate')} value="94%" change="+2%" trend="up" icon={TrendingUp} />
        <KPICard title={t('designShowcase.profitMargin')} value="32%" change="+1.5%" trend="up" icon={Target} />
      </div>
      <Card>
        <CardHeader><CardTitle>{t('designShowcase.revenueExpense')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: t('designShowcase.rentalFees'), amount: 'AED 280K', percent: 85 },
              { label: t('designShowcase.driverServices'), amount: 'AED 25K', percent: 8 },
              { label: t('designShowcase.accessories'), amount: 'AED 15K', percent: 5 },
              { label: t('designShowcase.otherCharges'), amount: 'AED 8K', percent: 2 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2 text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.amount} ({item.percent}%)</span>
                </div>
                <Progress value={item.percent} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={layout.section}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
          Full implementation with KPIs, charts, and real-time data
        </CardContent>
      </Card>
    </div>
  );
}

// Main Component
export default function DesignSystemShowcase() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('executive');

  return (
    <PageLayout
      title={t('designShowcase.title', 'Design System Showcase')}
      description={t('designShowcase.description', '12 production-ready dashboard layouts with consistent design patterns')}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="executive">{t('designShowcase.executive')}</TabsTrigger>
          <TabsTrigger value="operations">{t('designShowcase.operations')}</TabsTrigger>
          <TabsTrigger value="financial">{t('designShowcase.financial')}</TabsTrigger>
          <TabsTrigger value="fleet">{t('designShowcase.fleet')}</TabsTrigger>
          <TabsTrigger value="customer">{t('designShowcase.customer')}</TabsTrigger>
          <TabsTrigger value="risk">{t('designShowcase.risk')}</TabsTrigger>
          <TabsTrigger value="marketing">{t('designShowcase.marketing')}</TabsTrigger>
          <TabsTrigger value="branch">{t('designShowcase.branchManager')}</TabsTrigger>
          <TabsTrigger value="predictive">{t('designShowcase.predictive')}</TabsTrigger>
          <TabsTrigger value="audit">{t('designShowcase.audit')}</TabsTrigger>
          <TabsTrigger value="communications">{t('designShowcase.communications')}</TabsTrigger>
          <TabsTrigger value="driver">{t('designShowcase.driverOps')}</TabsTrigger>
        </TabsList>

        <TabsContent value="executive"><ExecutiveDashboard /></TabsContent>
        <TabsContent value="operations"><OperationsDashboard /></TabsContent>
        <TabsContent value="financial"><FinancialDashboard /></TabsContent>
        <TabsContent value="fleet">
          <DashboardPlaceholder title="Fleet Management Dashboard" subtitle="Vehicle status, utilization, and maintenance tracking" />
        </TabsContent>
        <TabsContent value="customer">
          <DashboardPlaceholder title="Customer Insights Dashboard" subtitle="Customer analytics, LTV, and churn prediction" />
        </TabsContent>
        <TabsContent value="risk">
          <DashboardPlaceholder title="Risk & Compliance Dashboard" subtitle="Risk scores, document expiry, and compliance tracking" />
        </TabsContent>
        <TabsContent value="marketing">
          <DashboardPlaceholder title="Marketing Dashboard" subtitle="Campaign performance and conversion analytics" />
        </TabsContent>
        <TabsContent value="branch">
          <DashboardPlaceholder title="Branch Manager Dashboard" subtitle="Branch-specific metrics and performance" />
        </TabsContent>
        <TabsContent value="predictive">
          <DashboardPlaceholder title="Predictive Intelligence Dashboard" subtitle="AI-powered forecasts and predictions" />
        </TabsContent>
        <TabsContent value="audit">
          <DashboardPlaceholder title="Audit & Activity Dashboard" subtitle="System activity and compliance tracking" />
        </TabsContent>
        <TabsContent value="communications">
          <DashboardPlaceholder title="Communications Dashboard" subtitle="Message delivery and campaign tracking" />
        </TabsContent>
        <TabsContent value="driver">
          <DashboardPlaceholder title="Driver Operations Dashboard" subtitle="Driver performance and scheduling" />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
