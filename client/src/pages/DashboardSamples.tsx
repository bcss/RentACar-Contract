import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  CheckCircle, 
  Check, 
  DollarSign, 
  Car, 
  Calendar,
  Truck,
  MoreVertical,
  TrendingUp,
  BarChart3,
  MoreHorizontal,
  Users,
  CreditCard,
  ArrowUp,
  Filter,
  ShoppingBag,
  Receipt,
  Package,
  UserPlus,
  Info,
  Clock,
  Activity,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function DashboardSamples() {
  const { t } = useTranslation();
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  return (
    <div className="h-full overflow-auto p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-samples-title">
          Dashboard Design Samples
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose your preferred dashboard design style. Each design is fully functional and will be adapted to RCCMS with your data.
        </p>
      </div>

      {/* Design Selection Banner */}
      {selectedDesign && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">Selected Design: {selectedDesign}</p>
                <p className="text-xs text-muted-foreground">Click "Confirm Selection" below to proceed with implementation</p>
              </div>
            </div>
            <Button 
              variant="default" 
              onClick={() => alert(`You selected: ${selectedDesign}. Implementation will begin with this design.`)}
              data-testid="button-confirm-selection"
            >
              Confirm Selection
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs for Design Samples */}
      <Tabs defaultValue="clean-modern" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 h-auto gap-2 bg-transparent">
          <TabsTrigger value="clean-modern" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-clean-modern">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Clean Modern</p>
              <p className="text-xs opacity-70">Spacious & Minimal</p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="data-dense" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-data-dense">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Data Dense</p>
              <p className="text-xs opacity-70">Information Rich</p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="dark-elegant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-dark-elegant">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Dark Elegant</p>
              <p className="text-xs opacity-70">Premium & Sleek</p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="minimal-cards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-minimal-cards">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Minimal Cards</p>
              <p className="text-xs opacity-70">Clean Hierarchy</p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="colorful" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-colorful">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Colorful</p>
              <p className="text-xs opacity-70">Vibrant & Playful</p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="gauges-metrics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-gauges-metrics">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Gauges & Metrics</p>
              <p className="text-xs opacity-70">Performance Dials</p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="timeline-view" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-timeline-view">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Timeline View</p>
              <p className="text-xs opacity-70">Activity Feed</p>
            </div>
          </TabsTrigger>
          <TabsTrigger value="comparison-table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-comparison-table">
            <div className="text-center py-2">
              <p className="font-semibold text-sm">Comparison Table</p>
              <p className="text-xs opacity-70">Data Comparison</p>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Clean Modern Design */}
        <TabsContent value="clean-modern" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Clean Modern Design</h2>
              <p className="text-sm text-muted-foreground">Inspired by modern car rental platforms - spacious layout with soft rounded corners</p>
            </div>
            <Button onClick={() => setSelectedDesign('Clean Modern')} variant={selectedDesign === 'Clean Modern' ? 'default' : 'outline'} data-testid="button-select-clean-modern">
              {selectedDesign === 'Clean Modern' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-blue-900 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-3">+8.2%</Badge>
              </div>
              <p className="text-3xl font-bold mb-1">$8,450</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xs text-muted-foreground mt-2">from last week</p>
            </Card>

            <Card className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-purple-900 flex items-center justify-center">
                  <Car className="h-5 w-5 text-purple-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-3">+12.5%</Badge>
              </div>
              <p className="text-3xl font-bold mb-1">214</p>
              <p className="text-sm text-muted-foreground">Active Rentals</p>
              <p className="text-xs text-muted-foreground mt-2">from last week</p>
            </Card>

            <Card className="p-6 rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-orange-900 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full px-3">+5.4%</Badge>
              </div>
              <p className="text-3xl font-bold mb-1">386</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-xs text-muted-foreground mt-2">from last week</p>
            </Card>

            <Card className="p-6 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-green-900 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-3">+9.3%</Badge>
              </div>
              <p className="text-3xl font-bold mb-1">89</p>
              <p className="text-sm text-muted-foreground">Available Cars</p>
              <p className="text-xs text-muted-foreground mt-2">ready to rent</p>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Revenue Trend</h3>
                  <p className="text-sm text-muted-foreground">Last 6 months</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              {/* Placeholder for chart */}
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground text-sm">Area Chart Visualization</p>
              </div>
            </Card>

            <Card className="p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Fleet Status</h3>
                  <p className="text-sm text-muted-foreground">Current distribution</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              {/* Placeholder for donut chart */}
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground text-sm">Donut Chart Visualization</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Data Dense Design */}
        <TabsContent value="data-dense" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Data Dense Design</h2>
              <p className="text-sm text-muted-foreground">Maximum information density - perfect for power users and managers</p>
            </div>
            <Button onClick={() => setSelectedDesign('Data Dense')} variant={selectedDesign === 'Data Dense' ? 'default' : 'outline'} data-testid="button-select-data-dense">
              {selectedDesign === 'Data Dense' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {['Revenue', 'Rentals', 'Available', 'Maintenance', 'Customers', 'Bookings'].map((metric) => (
              <Card key={metric} className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{metric}</p>
                <p className="text-2xl font-bold">1,234</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">+12%</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Multi-Chart Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-3">Daily Revenue</h3>
              <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Line Chart</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className="text-sm font-bold">$2.4K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg</p>
                  <p className="text-sm font-bold">$2.1K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peak</p>
                  <p className="text-sm font-bold">$3.2K</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-3">Contract Status</h3>
              <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Bar Chart</p>
              </div>
              <div className="mt-3 space-y-2">
                {['Active', 'Completed', 'Draft'].map((status) => (
                  <div key={status} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="font-semibold">156</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-3">Top Vehicles</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">
                      #{i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">ABC-1234</p>
                      <p className="text-xs text-muted-foreground truncate">Toyota Camry</p>
                    </div>
                    <p className="text-xs font-bold whitespace-nowrap">$4.2K</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-xs text-muted-foreground flex-1">Contract #CR-{1000 + i} created</p>
                  <p className="text-xs text-muted-foreground">{i} min ago</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Dark Elegant Design */}
        <TabsContent value="dark-elegant" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Dark Elegant Design</h2>
              <p className="text-sm text-muted-foreground">Premium dark theme with gradients and depth - modern and sophisticated</p>
            </div>
            <Button onClick={() => setSelectedDesign('Dark Elegant')} variant={selectedDesign === 'Dark Elegant' ? 'default' : 'outline'} data-testid="button-select-dark-elegant">
              {selectedDesign === 'Dark Elegant' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 opacity-80" />
                <MoreHorizontal className="h-4 w-4" />
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Sales Growth</p>
              <p className="text-4xl font-bold mb-1">+15%</p>
              <p className="text-xs opacity-70">Compared to last month</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 opacity-80" />
                <MoreHorizontal className="h-4 w-4" />
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider mb-1">New Customers</p>
              <p className="text-4xl font-bold mb-1">+3,082</p>
              <p className="text-xs opacity-70">This quarter</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-600 to-red-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 opacity-80" />
                <MoreHorizontal className="h-4 w-4" />
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Conversion</p>
              <p className="text-4xl font-bold mb-1">9.3%</p>
              <p className="text-xs opacity-70">Target achieved</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-600 to-emerald-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-8 w-8 opacity-80" />
                <MoreHorizontal className="h-4 w-4" />
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Revenue</p>
              <p className="text-4xl font-bold mb-1">$173K</p>
              <p className="text-xs opacity-70">Monthly total</p>
            </Card>
          </div>

          {/* Chart Cards with Dark Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">Sales Overview</h3>
                <p className="text-sm text-slate-400">Performance over time</p>
              </div>
              <div className="h-56 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-slate-500 text-sm">Smooth Gradient Area Chart</p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">Satisfaction Rate</h3>
                <p className="text-sm text-slate-400">Customer feedback</p>
              </div>
              <div className="h-56 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="text-center">
                  <p className="text-6xl font-bold text-emerald-400 mb-2">95%</p>
                  <p className="text-slate-500 text-sm">Gauge Chart</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Minimal Cards Design */}
        <TabsContent value="minimal-cards" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Minimal Cards Design</h2>
              <p className="text-sm text-muted-foreground">Clean hierarchy with focus on essential information - perfect for quick glances</p>
            </div>
            <Button onClick={() => setSelectedDesign('Minimal Cards')} variant={selectedDesign === 'Minimal Cards' ? 'default' : 'outline'} data-testid="button-select-minimal-cards">
              {selectedDesign === 'Minimal Cards' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Today's Stats Header */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-1">Today's Statistics</h3>
            <p className="text-sm text-muted-foreground">Tue, 14 Nov, 2025, 11:30 AM</p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Income</p>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Today</Badge>
              </div>
              <p className="text-4xl font-bold mb-2">$ 9460.00</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-5 w-5" />
                  1.5%
                </span>
                <span className="text-muted-foreground">Compared to $9940 yesterday</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last week income: $25658.00</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Expenses</p>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Today</Badge>
              </div>
              <p className="text-4xl font-bold mb-2">$ 5660.00</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-5 w-5" />
                  2.5%
                </span>
                <span className="text-muted-foreground">Compared to $5240 yesterday</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last week expenses: $22658.00</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Hire vs Cancel</p>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">Today</Badge>
              </div>
              <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg mb-3">
                <p className="text-xs text-muted-foreground">Donut Chart</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Total Hired
                  </span>
                  <span className="font-semibold">54% ↑</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Total Canceled
                  </span>
                  <span className="font-semibold">20% ↑</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Total Pending
                  </span>
                  <span className="font-semibold">26% ↓</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Live Car Status Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Live Car Status</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-3 font-medium">No.</th>
                    <th className="pb-3 font-medium">Car no.</th>
                    <th className="pb-3 font-medium">Driver</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Earning</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { no: '01', car: '6465', driver: 'Alex Noman', status: 'completed', earning: '$35.44', color: 'green' },
                    { no: '02', car: '5665', driver: 'Razib Rahman', status: 'pending', earning: '$0.00', color: 'blue' },
                    { no: '03', car: '1755', driver: 'Luke Norton', status: 'in route', earning: '$23.50', color: 'red' },
                  ].map((row) => (
                    <tr key={row.no} className="hover-elevate">
                      <td className="py-4">{row.no}</td>
                      <td className="py-4 font-medium">{row.car}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                            {row.driver.charAt(0)}
                          </div>
                          {row.driver}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={`bg-${row.color}-50 text-${row.color}-700 border-${row.color}-200`}>
                          <div className={`w-2 h-2 rounded-full bg-${row.color}-500 mr-2`}></div>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-4 font-semibold">{row.earning}</td>
                      <td className="py-4">
                        <Button variant="default" size="sm">Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Colorful Design */}
        <TabsContent value="colorful" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Colorful Analytics Design</h2>
              <p className="text-sm text-muted-foreground">Vibrant colors and playful charts - engaging and memorable</p>
            </div>
            <Button onClick={() => setSelectedDesign('Colorful Analytics')} variant={selectedDesign === 'Colorful Analytics' ? 'default' : 'outline'} data-testid="button-select-colorful">
              {selectedDesign === 'Colorful Analytics' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Colorful Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900 dark:to-pink-950 border-pink-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-700">$1k</p>
                  <p className="text-xs text-pink-600">Total Sales</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">+5% from yesterday</Badge>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-950 border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">300</p>
                  <p className="text-xs text-orange-600">Total Order</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">+5% from yesterday</Badge>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-950 border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">5</p>
                  <p className="text-xs text-green-600">Product Sold</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">+21% from yesterday</Badge>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-950 border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">8</p>
                  <p className="text-xs text-purple-600">New Customers</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">+45% from yesterday</Badge>
            </Card>
          </div>

          {/* Multi-Colored Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Visitor Insights</h3>
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl">
                <p className="text-sm text-muted-foreground">Multi-Line Chart</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Target vs Reality</h3>
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-xl">
                <p className="text-sm text-muted-foreground">Grouped Bar Chart</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Customer Satisfaction</h3>
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl">
                <p className="text-sm text-muted-foreground">Stacked Area Chart</p>
              </div>
            </Card>
          </div>

          {/* Geographic Map Visualization */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Sales Mapping by Country</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 rounded-xl">
                <p className="text-sm text-muted-foreground">Interactive Map Visualization</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4">Top Products</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Home Decor Range', color: 'cyan', value: '45%' },
                    { name: 'Disney Princess Pink Bag', color: 'green', value: '29%' },
                    { name: 'Bathroom Essentials', color: 'purple', value: '18%' },
                    { name: 'Apple Smartwatches', color: 'orange', value: '25%' },
                  ].map((product, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">0{i + 1}</span>
                        <span className="flex-1 mx-3 text-xs">{product.name}</span>
                        <Badge className={`bg-${product.color}-100 text-${product.color}-700`}>{product.value}</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full bg-${product.color}-500`} style={{ width: product.value }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Gauges & Metrics Design */}
        <TabsContent value="gauges-metrics" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Gauges & Metrics Design</h2>
              <p className="text-sm text-muted-foreground">Performance indicators with radial gauges - perfect for KPI tracking</p>
            </div>
            <Button onClick={() => setSelectedDesign('Gauges & Metrics')} variant={selectedDesign === 'Gauges & Metrics' ? 'default' : 'outline'} data-testid="button-select-gauges-metrics">
              {selectedDesign === 'Gauges & Metrics' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Gauge Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Fleet Utilization Gauge */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold mb-2">Fleet Utilization</h3>
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      barSize={10}
                      data={[{ name: 'Utilization', value: 78, fill: '#3b82f6' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={30}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">78%</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">+5.2% from last month</span>
                </div>
              </div>
            </Card>

            {/* Revenue Target Gauge */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold mb-2">Revenue Target</h3>
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      barSize={10}
                      data={[{ name: 'Revenue', value: 92, fill: '#10b981' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={30}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">92%</p>
                      <p className="text-xs text-muted-foreground">of Goal</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">On track</span>
                </div>
              </div>
            </Card>

            {/* Customer Satisfaction Gauge */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold mb-2">Customer Satisfaction</h3>
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      barSize={10}
                      data={[{ name: 'Satisfaction', value: 95, fill: '#8b5cf6' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={30}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-600">Excellent</span>
                </div>
              </div>
            </Card>

            {/* Vehicle Availability Gauge */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold mb-2">Vehicle Availability</h3>
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      barSize={10}
                      data={[{ name: 'Available', value: 65, fill: '#f59e0b' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={30}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">65%</p>
                      <p className="text-xs text-muted-foreground">Ready</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Car className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-amber-600">89 vehicles</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Metrics Table */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Detailed Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Active Contracts', value: '214', change: '+12.5%', positive: true },
                { title: 'Pending Returns', value: '23', change: '-8.3%', positive: true },
                { title: 'Overdue Payments', value: '7', change: '+2.1%', positive: false },
                { title: 'Maintenance Due', value: '15', change: '-15.4%', positive: true },
                { title: 'Fuel Efficiency', value: '18.5 L/100km', change: '-3.2%', positive: true },
                { title: 'Average Rental Days', value: '12.3', change: '+6.7%', positive: true },
              ].map((metric, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{metric.title}</p>
                  <p className="text-2xl font-bold mb-1">{metric.value}</p>
                  <div className="flex items-center gap-1">
                    <ArrowUp className={`h-4 w-4 ${metric.positive ? 'text-green-600' : 'text-red-600'} ${!metric.positive && 'rotate-180'}`} />
                    <span className={`text-xs ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>{metric.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Timeline View Design */}
        <TabsContent value="timeline-view" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Timeline View Design</h2>
              <p className="text-sm text-muted-foreground">Activity-based layout with chronological feed - perfect for operations tracking</p>
            </div>
            <Button onClick={() => setSelectedDesign('Timeline View')} variant={selectedDesign === 'Timeline View' ? 'default' : 'outline'} data-testid="button-select-timeline-view">
              {selectedDesign === 'Timeline View' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Today's Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Car, label: 'New Rentals', value: '18', color: 'blue' },
              { icon: CheckCircle, label: 'Completed Returns', value: '12', color: 'green' },
              { icon: Clock, label: 'Pending Actions', value: '5', color: 'amber' },
              { icon: Activity, label: 'Active Operations', value: '32', color: 'purple' },
            ].map((stat, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-950 flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Activity Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  {
                    time: '2:45 PM',
                    title: 'New rental contract created',
                    description: 'Contract #10325 - Toyota Camry',
                    user: 'Ahmed Al-Mansoori',
                    icon: Car,
                    color: 'blue',
                  },
                  {
                    time: '1:20 PM',
                    title: 'Vehicle returned',
                    description: 'Contract #10298 - Honda Accord',
                    user: 'Fatima Al-Zaabi',
                    icon: CheckCircle,
                    color: 'green',
                  },
                  {
                    time: '11:05 AM',
                    title: 'Payment received',
                    description: 'AED 3,500 - Contract #10315',
                    user: 'System',
                    icon: DollarSign,
                    color: 'purple',
                  },
                  {
                    time: '9:30 AM',
                    title: 'Maintenance scheduled',
                    description: 'Vehicle ABC-123 - Oil change',
                    user: 'Mohammed Hassan',
                    icon: Truck,
                    color: 'amber',
                  },
                  {
                    time: '8:15 AM',
                    title: 'Customer inquiry',
                    description: 'New inquiry for weekly rental',
                    user: 'Sarah Ahmed',
                    icon: Users,
                    color: 'cyan',
                  },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-950 flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                      </div>
                      {i < 4 && <div className="w-px h-8 bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Upcoming Schedule</h3>
              <div className="space-y-4">
                {[
                  {
                    date: 'Today, 4:00 PM',
                    title: 'Vehicle pickup scheduled',
                    location: 'Dubai Airport Terminal 3',
                    contract: '#10328',
                  },
                  {
                    date: 'Tomorrow, 10:00 AM',
                    title: 'Contract expiration',
                    location: 'Main Office',
                    contract: '#10285',
                  },
                  {
                    date: 'Tomorrow, 2:30 PM',
                    title: 'Maintenance appointment',
                    location: 'Service Center - Al Barsha',
                    contract: 'Vehicle XYZ-789',
                  },
                  {
                    date: 'Nov 18, 9:00 AM',
                    title: 'Fleet inspection',
                    location: 'Main Parking Lot',
                    contract: '15 vehicles',
                  },
                  {
                    date: 'Nov 19, 11:30 AM',
                    title: 'Contract renewal',
                    location: 'Customer Office',
                    contract: '#10145',
                  },
                ].map((event, i) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg hover-elevate">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm mb-1">{event.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{event.contract}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Table Design */}
        <TabsContent value="comparison-table" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Comparison Table Design</h2>
              <p className="text-sm text-muted-foreground">Side-by-side data comparison - perfect for analytics and reporting</p>
            </div>
            <Button onClick={() => setSelectedDesign('Comparison Table')} variant={selectedDesign === 'Comparison Table' ? 'default' : 'outline'} data-testid="button-select-comparison-table">
              {selectedDesign === 'Comparison Table' ? <Check className="mr-2 h-4 w-4" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Period Comparison Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">This Month</h3>
                <Badge className="bg-blue-100 text-blue-700">Current Period</Badge>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Total Revenue', value: 'AED 45,680', change: '+18.2%' },
                  { label: 'Active Contracts', value: '214', change: '+12.5%' },
                  { label: 'New Customers', value: '42', change: '+25.3%' },
                  { label: 'Avg Contract Value', value: 'AED 2,145', change: '+8.7%' },
                ].map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className="text-xl font-bold">{metric.value}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{metric.change}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Last Month</h3>
                <Badge variant="outline">Previous Period</Badge>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Total Revenue', value: 'AED 38,620' },
                  { label: 'Active Contracts', value: '190' },
                  { label: 'New Customers', value: '34' },
                  { label: 'Avg Contract Value', value: 'AED 1,975' },
                ].map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className="text-xl font-bold text-muted-foreground">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Fleet Performance Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Fleet Performance Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Vehicle Type</th>
                    <th className="text-right p-3 text-sm font-semibold">Total Units</th>
                    <th className="text-right p-3 text-sm font-semibold">Utilization</th>
                    <th className="text-right p-3 text-sm font-semibold">Revenue</th>
                    <th className="text-right p-3 text-sm font-semibold">Avg Daily Rate</th>
                    <th className="text-right p-3 text-sm font-semibold">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: 'Luxury Sedans', units: 24, utilization: 92, revenue: 'AED 18,500', rate: 'AED 450', performance: 'Excellent' },
                    { type: 'Economy Cars', units: 45, utilization: 78, revenue: 'AED 12,350', rate: 'AED 150', performance: 'Good' },
                    { type: 'SUVs', units: 18, utilization: 85, revenue: 'AED 14,200', rate: 'AED 380', performance: 'Excellent' },
                    { type: 'Vans', units: 12, utilization: 65, revenue: 'AED 8,900', rate: 'AED 280', performance: 'Average' },
                    { type: 'Sports Cars', units: 8, utilization: 95, revenue: 'AED 16,400', rate: 'AED 850', performance: 'Outstanding' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b hover-elevate">
                      <td className="p-3 font-medium">{row.type}</td>
                      <td className="p-3 text-right">{row.units}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${row.utilization}%` }}
                            />
                          </div>
                          <span className="text-sm">{row.utilization}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold">{row.revenue}</td>
                      <td className="p-3 text-right">{row.rate}</td>
                      <td className="p-3 text-right">
                        <Badge
                          className={
                            row.performance === 'Outstanding'
                              ? 'bg-purple-100 text-purple-700'
                              : row.performance === 'Excellent'
                              ? 'bg-green-100 text-green-700'
                              : row.performance === 'Good'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {row.performance}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Regional Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Regional Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { region: 'Dubai', revenue: 'AED 28,400', contracts: 142, growth: '+22%' },
                { region: 'Abu Dhabi', revenue: 'AED 12,350', contracts: 58, growth: '+15%' },
                { region: 'Sharjah', revenue: 'AED 4,930', contracts: 14, growth: '+8%' },
              ].map((region, i) => (
                <div key={i} className="p-4 border rounded-lg hover-elevate">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{region.region}</h4>
                    <Badge className="bg-green-100 text-green-700">{region.growth}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold">{region.revenue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Contracts</p>
                      <p className="text-lg font-bold">{region.contracts}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="p-6 bg-muted/30">
        <div className="flex items-start gap-4">
          <Info className="h-6 w-6 text-primary flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-semibold">About These Design Samples</h4>
            <p className="text-sm text-muted-foreground">
              Each design style will be fully implemented with your RCCMS data, including:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Real-time contract, vehicle, and customer data</li>
              <li>Bilingual support (English/Arabic) with RTL layouts</li>
              <li>Dark/Light theme compatibility</li>
              <li>Role-based permissions and visibility</li>
              <li>Responsive design for all screen sizes</li>
              <li>UAE 7 Emirates geographic distribution</li>
              <li>Tabbed interface: My Day, Company Today, Executive Overview</li>
            </ul>
            <p className="text-sm font-medium text-primary mt-4">
              Select your preferred design and we'll proceed with full implementation!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
