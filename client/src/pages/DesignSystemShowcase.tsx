import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, Users, Car, FileText, CheckCircle, XCircle, 
  Clock, AlertTriangle, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  DashboardStatCard,
  StatusBadge,
  DataTablePattern,
  ChartCard,
  FilterPanel,
  TimelineEvent,
  EmptyState,
  LoadingState,
  PageHeader,
  GuidelineBox,
  type DataTableColumn
} from '@/components/design-system';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DesignSystemShowcase() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('dashboard-cards');

  const contractColumns: DataTableColumn[] = [
    { key: 'number', header: t('contracts.contractNumber', 'Contract #') },
    { key: 'customer', header: t('common.customer', 'Customer') },
    { key: 'vehicle', header: t('common.vehicle', 'Vehicle') },
    { 
      key: 'status', 
      header: t('common.status', 'Status'),
      render: (value) => (
        <StatusBadge 
          variant={value} 
          label={t(`contracts.status.${value}`, value)} 
          testId={`badge-status-${value}`}
        />
      )
    },
    { key: 'amount', header: t('common.amount', 'Amount'), align: 'right' as const },
    { 
      key: 'actions', 
      header: t('common.actions', 'Actions'), 
      align: 'right' as const,
      render: () => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" data-testid="button-view">
            {t('common.view', 'View')}
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit">
            {t('common.edit', 'Edit')}
          </Button>
        </div>
      )
    },
  ];

  const contractData = [
    { number: 'RC-2025-001', customer: t('designSystem.examples.customerName1', 'Ahmed Ali'), vehicle: t('designSystem.examples.vehicle1', 'Toyota Camry - DXB-12345'), status: 'active', amount: 'AED 3,500' },
    { number: 'RC-2025-002', customer: t('designSystem.examples.customerName2', 'Sara Mohammed'), vehicle: t('designSystem.examples.vehicle2', 'Honda Accord - AUH-67890'), status: 'pending', amount: 'AED 2,800' },
  ];

  const chartData = [
    { month: t('months.jan', 'Jan'), revenue: 45000 },
    { month: t('months.feb', 'Feb'), revenue: 52000 },
    { month: t('months.mar', 'Mar'), revenue: 48000 },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title={t('designSystem.title', 'RCCMS Design System')}
        description={t('designSystem.description', 'Standardized UI components and patterns for consistent, professional design across the application')}
        testId="page-header-design-system"
      />

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6" data-testid="tabs-design-patterns">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-2" data-testid="tabslist-patterns">
          <TabsTrigger value="dashboard-cards" data-testid="tab-dashboard-cards">
            {t('designSystem.patterns.dashboardCards', 'Dashboard Cards')}
          </TabsTrigger>
          <TabsTrigger value="data-tables" data-testid="tab-data-tables">
            {t('designSystem.patterns.dataTables', 'Data Tables')}
          </TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">
            {t('designSystem.patterns.charts', 'Charts')}
          </TabsTrigger>
          <TabsTrigger value="status-badges" data-testid="tab-status-badges">
            {t('designSystem.patterns.statusBadges', 'Status Badges')}
          </TabsTrigger>
          <TabsTrigger value="states" data-testid="tab-states">
            {t('designSystem.patterns.states', 'States')}
          </TabsTrigger>
          <TabsTrigger value="filters" data-testid="tab-filters">
            {t('designSystem.patterns.filters', 'Filters')}
          </TabsTrigger>
          <TabsTrigger value="timelines" data-testid="tab-timelines">
            {t('designSystem.patterns.timelines', 'Timelines')}
          </TabsTrigger>
        </TabsList>

        {/* Pattern 1: Dashboard Cards */}
        <TabsContent value="dashboard-cards" className="space-y-6" data-testid="content-dashboard-cards">
          <Card data-testid="card-pattern-dashboard">
            <CardHeader>
              <CardTitle data-testid="title-dashboard-cards">
                {t('designSystem.pattern1.title', 'Pattern 1: Dashboard Stat Cards')}
              </CardTitle>
              <CardDescription data-testid="desc-dashboard-cards">
                {t('designSystem.pattern1.description', 'Standard KPI cards with icon, title, value, and trend indicator.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="grid-stat-cards">
                <DashboardStatCard
                  title={t('designSystem.examples.totalRevenue', 'Total Revenue')}
                  value="AED 125,430"
                  icon={DollarSign}
                  trend={{ value: 12.5, label: t('designSystem.examples.fromLastMonth', 'from last month'), direction: 'up' }}
                  testId="card-stat-revenue"
                />
                <DashboardStatCard
                  title={t('designSystem.examples.activeContracts', 'Active Contracts')}
                  value="47"
                  icon={FileText}
                  trend={{ value: -3.2, label: t('designSystem.examples.fromLastWeek', 'from last week'), direction: 'down' }}
                  testId="card-stat-contracts"
                />
                <DashboardStatCard
                  title={t('designSystem.examples.fleetUtilization', 'Fleet Utilization')}
                  value="78.5%"
                  icon={Car}
                  progress={78.5}
                  testId="card-stat-fleet"
                />
                <DashboardStatCard
                  title={t('designSystem.examples.totalCustomers', 'Total Customers')}
                  value="1,247"
                  icon={Users}
                  trend={{ value: 23, label: t('designSystem.examples.thisMonth', 'this month'), direction: 'up' }}
                  testId="card-stat-customers"
                />
              </div>

              <GuidelineBox 
                title={t('designSystem.usageGuidelines', 'Usage Guidelines:')}
                testId="guidelines-dashboard-cards"
              >
                <ul className="space-y-1">
                  <li data-testid="guideline-1">✅ {t('designSystem.pattern1.guideline1', 'Use for important KPIs on dashboards')}</li>
                  <li data-testid="guideline-2">✅ {t('designSystem.pattern1.guideline2', 'Include icon for quick visual recognition')}</li>
                  <li data-testid="guideline-3">✅ {t('designSystem.pattern1.guideline3', 'Add trend indicator when showing changes over time')}</li>
                  <li data-testid="guideline-4">❌ {t('designSystem.pattern1.guideline4', "Don't use for detailed data (use tables instead)")}</li>
                </ul>
              </GuidelineBox>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern 2: Data Tables */}
        <TabsContent value="data-tables" className="space-y-6" data-testid="content-data-tables">
          <Card data-testid="card-pattern-tables">
            <CardHeader>
              <CardTitle data-testid="title-data-tables">
                {t('designSystem.pattern2.title', 'Pattern 2: Data Tables')}
              </CardTitle>
              <CardDescription data-testid="desc-data-tables">
                {t('designSystem.pattern2.description', 'Standard table layout with consistent styling, hover effects, and action buttons.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTablePattern
                columns={contractColumns}
                data={contractData}
                testId="table-contracts-example"
              />

              <GuidelineBox 
                title={t('designSystem.usageGuidelines', 'Usage Guidelines:')}
                testId="guidelines-data-tables"
              >
                <ul className="space-y-1">
                  <li data-testid="guideline-table-1">✅ {t('designSystem.pattern2.guideline1', 'Use hover-elevate on TableRow for interactive feedback')}</li>
                  <li data-testid="guideline-table-2">✅ {t('designSystem.pattern2.guideline2', 'Align numbers to the right for easy scanning')}</li>
                  <li data-testid="guideline-table-3">✅ {t('designSystem.pattern2.guideline3', 'Use consistent badge styling for status columns')}</li>
                  <li data-testid="guideline-table-4">❌ {t('designSystem.pattern2.guideline4', "Don't use too many action buttons per row (max 2-3)")}</li>
                </ul>
              </GuidelineBox>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern 3: Charts */}
        <TabsContent value="charts" className="space-y-6" data-testid="content-charts">
          <ChartCard
            title={t('designSystem.pattern3.title', 'Pattern 3: Data Visualization')}
            description={t('designSystem.pattern3.description', 'Standard chart layouts with consistent colors and styling.')}
            testId="card-pattern-charts"
          >
            <div data-testid="chart-revenue-trend">
              <h4 className="font-medium mb-4" data-testid="title-chart-revenue">
                {t('designSystem.examples.monthlyRevenueTrend', 'Monthly Revenue Trend')}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#0891b2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>

        {/* Pattern 4: Status Badges */}
        <TabsContent value="status-badges" className="space-y-6" data-testid="content-status-badges">
          <Card data-testid="card-pattern-badges">
            <CardHeader>
              <CardTitle data-testid="title-badges">
                {t('designSystem.pattern4.title', 'Pattern 4: Status Badges')}
              </CardTitle>
              <CardDescription data-testid="desc-badges">
                {t('designSystem.pattern4.description', 'Consistent badge styling for different status types.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div data-testid="section-contract-badges">
                <h4 className="font-medium mb-3" data-testid="title-contract-badges">
                  {t('designSystem.contractStatusBadges', 'Contract Status Badges')}
                </h4>
                <div className="flex flex-wrap gap-3" data-testid="group-contract-badges">
                  <StatusBadge variant="draft" label={t('contracts.status.draft', 'Draft')} icon={FileText} testId="badge-draft" />
                  <StatusBadge variant="active" label={t('contracts.status.active', 'Active')} icon={CheckCircle} testId="badge-active" />
                  <StatusBadge variant="completed" label={t('contracts.status.completed', 'Completed')} icon={CheckCircle} testId="badge-completed" />
                  <StatusBadge variant="closed" label={t('contracts.status.closed', 'Closed')} icon={XCircle} testId="badge-closed" />
                </div>
              </div>

              <div data-testid="section-payment-badges">
                <h4 className="font-medium mb-3" data-testid="title-payment-badges">
                  {t('designSystem.paymentStatusBadges', 'Payment Status Badges')}
                </h4>
                <div className="flex flex-wrap gap-3" data-testid="group-payment-badges">
                  <StatusBadge variant="pending" label={t('payments.status.pending', 'Pending')} icon={Clock} testId="badge-payment-pending" />
                  <StatusBadge variant="paid" label={t('payments.status.paid', 'Paid')} icon={CheckCircle} testId="badge-payment-paid" />
                  <StatusBadge variant="overdue" label={t('payments.status.overdue', 'Overdue')} icon={AlertTriangle} testId="badge-payment-overdue" />
                </div>
              </div>

              <div data-testid="section-risk-badges">
                <h4 className="font-medium mb-3" data-testid="title-risk-badges">
                  {t('designSystem.riskLevelBadges', 'Risk Level Badges')}
                </h4>
                <div className="flex flex-wrap gap-3" data-testid="group-risk-badges">
                  <StatusBadge variant="low" label={t('risk.low', 'Low Risk')} testId="badge-risk-low" />
                  <StatusBadge variant="medium" label={t('risk.medium', 'Medium Risk')} testId="badge-risk-medium" />
                  <StatusBadge variant="high" label={t('risk.high', 'High Risk')} testId="badge-risk-high" />
                  <StatusBadge variant="very_high" label={t('risk.veryHigh', 'Very High Risk')} testId="badge-risk-very-high" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern 5: States */}
        <TabsContent value="states" className="space-y-6" data-testid="content-states">
          <Card data-testid="card-pattern-states">
            <CardHeader>
              <CardTitle data-testid="title-states">
                {t('designSystem.pattern5.title', 'Pattern 5: Loading & Empty States')}
              </CardTitle>
              <CardDescription data-testid="desc-states">
                {t('designSystem.pattern5.description', 'Consistent feedback for loading and empty data scenarios.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div data-testid="section-loading-state">
                <h4 className="font-medium mb-4" data-testid="title-loading-state">
                  {t('designSystem.loadingState', 'Loading State')}
                </h4>
                <LoadingState 
                  message={t('common.loading', 'Loading data...')} 
                  testId="loading-example" 
                />
              </div>

              <div data-testid="section-empty-state">
                <h4 className="font-medium mb-4" data-testid="title-empty-state">
                  {t('designSystem.emptyState', 'Empty State')}
                </h4>
                <EmptyState
                  title={t('designSystem.examples.noContractsFound', 'No Contracts Found')}
                  description={t('designSystem.examples.noContractsDesc', 'There are no contracts matching your filters. Try adjusting your search criteria or create a new contract.')}
                  actionLabel={t('contracts.createNew', 'Create Contract')}
                  testId="empty-example"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern 6: Filters */}
        <TabsContent value="filters" className="space-y-6" data-testid="content-filters">
          <FilterPanel
            title={t('designSystem.pattern6.title', 'Pattern 6: Filter Panels')}
            testId="filter-panel-example"
            contentClassName="grid gap-4 md:grid-cols-3"
          >
            <div className="space-y-2" data-testid="filter-search">
              <Label data-testid="label-search">{t('common.search', 'Search')}</Label>
              <Input placeholder={t('common.searchPlaceholder', 'Search...')} data-testid="input-search" />
            </div>
            <div className="space-y-2" data-testid="filter-date">
              <Label data-testid="label-date-range">{t('common.dateRange', 'Date Range')}</Label>
              <Select>
                <SelectTrigger data-testid="select-date-range">
                  <SelectValue placeholder={t('common.selectPeriod', 'Select period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today" data-testid="option-today">{t('common.today', 'Today')}</SelectItem>
                  <SelectItem value="week" data-testid="option-week">{t('common.thisWeek', 'This Week')}</SelectItem>
                  <SelectItem value="month" data-testid="option-month">{t('common.thisMonth', 'This Month')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2" data-testid="filter-status">
              <Label data-testid="label-status">{t('common.status', 'Status')}</Label>
              <Select>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder={t('common.selectStatus', 'Select status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" data-testid="option-active">{t('contracts.status.active', 'Active')}</SelectItem>
                  <SelectItem value="completed" data-testid="option-completed">{t('contracts.status.completed', 'Completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FilterPanel>
        </TabsContent>

        {/* Pattern 7: Timelines */}
        <TabsContent value="timelines" className="space-y-6" data-testid="content-timelines">
          <Card data-testid="card-pattern-timeline">
            <CardHeader>
              <CardTitle data-testid="title-timelines">
                {t('designSystem.pattern7.title', 'Pattern 7: Timeline & Activity Display')}
              </CardTitle>
              <CardDescription data-testid="desc-timelines">
                {t('designSystem.pattern7.description', 'Chronological activity feed with icons and timestamps.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="timeline-events">
                <TimelineEvent
                  time={t('designSystem.examples.time1', '2 hours ago')}
                  action={t('designSystem.examples.action1', 'Contract activated')}
                  user={`${t('common.by', 'by')} ${t('designSystem.examples.user1', 'Ahmed Ali')}`}
                  icon={CheckCircle}
                  variant="success"
                  showLine
                  testId="timeline-event-0"
                />
                <TimelineEvent
                  time={t('designSystem.examples.time2', '5 hours ago')}
                  action={t('designSystem.examples.action2', 'Payment received')}
                  user={`${t('common.by', 'by')} ${t('designSystem.examples.user2', 'Sara Mohammed')}`}
                  icon={DollarSign}
                  variant="info"
                  testId="timeline-event-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Design Tokens Reference */}
      <Card data-testid="card-design-tokens">
        <CardHeader>
          <CardTitle data-testid="title-design-tokens">
            {t('designSystem.designTokens', 'Design Tokens & Constants')}
          </CardTitle>
          <CardDescription data-testid="desc-design-tokens">
            {t('designSystem.designTokensDesc', 'Core design values used consistently across the application')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2" data-testid="grid-design-tokens">
            <div data-testid="section-spacing">
              <h4 className="font-medium mb-3" data-testid="title-spacing-scale">
                {t('designSystem.spacingScale', 'Spacing Scale')}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between" data-testid="spacing-gap-2">
                  <span className="text-muted-foreground">gap-2</span>
                  <span className="font-mono">0.5rem (8px)</span>
                </div>
                <div className="flex items-center justify-between" data-testid="spacing-gap-4">
                  <span className="text-muted-foreground">gap-4</span>
                  <span className="font-mono">1rem (16px)</span>
                </div>
                <div className="flex items-center justify-between" data-testid="spacing-gap-6">
                  <span className="text-muted-foreground">gap-6</span>
                  <span className="font-mono">1.5rem (24px)</span>
                </div>
              </div>
            </div>

            <div data-testid="section-border-radius">
              <h4 className="font-medium mb-3" data-testid="title-border-radius">
                {t('designSystem.borderRadius', 'Border Radius')}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between" data-testid="radius-md">
                  <span className="text-muted-foreground">rounded-md</span>
                  <span className="font-mono">0.375rem (6px)</span>
                </div>
                <div className="flex items-center justify-between" data-testid="radius-lg">
                  <span className="text-muted-foreground">rounded-lg</span>
                  <span className="font-mono">0.5rem (8px)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
