import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from 'react-i18next';

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
              <Icon name="check_circle" className="text-primary text-2xl" />
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
        <TabsList className="grid w-full grid-cols-5 h-auto gap-2 bg-transparent">
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
        </TabsList>

        {/* Clean Modern Design */}
        <TabsContent value="clean-modern" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Clean Modern Design</h2>
              <p className="text-sm text-muted-foreground">Inspired by modern car rental platforms - spacious layout with soft rounded corners</p>
            </div>
            <Button onClick={() => setSelectedDesign('Clean Modern')} variant={selectedDesign === 'Clean Modern' ? 'default' : 'outline'} data-testid="button-select-clean-modern">
              {selectedDesign === 'Clean Modern' ? <Icon name="check" className="mr-2" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-blue-900 flex items-center justify-center">
                  <Icon name="sell" className="text-blue-600 text-xl" />
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
                  <Icon name="directions_car" className="text-purple-600 text-xl" />
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
                  <Icon name="event_note" className="text-orange-600 text-xl" />
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
                  <Icon name="local_shipping" className="text-green-600 text-xl" />
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
                  <Icon name="more_vert" />
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
                  <Icon name="more_vert" />
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
              {selectedDesign === 'Data Dense' ? <Icon name="check" className="mr-2" /> : null}
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
                  <Icon name="trending_up" className="text-green-600 text-sm" />
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
              {selectedDesign === 'Dark Elegant' ? <Icon name="check" className="mr-2" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Icon name="auto_graph" className="text-3xl opacity-80" />
                <Icon name="more_horiz" className="text-sm" />
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Sales Growth</p>
              <p className="text-4xl font-bold mb-1">+15%</p>
              <p className="text-xs opacity-70">Compared to last month</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Icon name="group" className="text-3xl opacity-80" />
                <Icon name="more_horiz" className="text-sm" />
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider mb-1">New Customers</p>
              <p className="text-4xl font-bold mb-1">+3,082</p>
              <p className="text-xs opacity-70">This quarter</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-600 to-red-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Icon name="analytics" className="text-3xl opacity-80" />
                <Icon name="more_horiz" className="text-sm" />
              </div>
              <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Conversion</p>
              <p className="text-4xl font-bold mb-1">9.3%</p>
              <p className="text-xs opacity-70">Target achieved</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-600 to-emerald-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Icon name="payments" className="text-3xl opacity-80" />
                <Icon name="more_horiz" className="text-sm" />
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
              {selectedDesign === 'Minimal Cards' ? <Icon name="check" className="mr-2" /> : null}
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
                  <Icon name="arrow_drop_up" className="text-lg" />
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
                  <Icon name="arrow_drop_up" className="text-lg" />
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
                <Icon name="filter_list" className="text-sm" />
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
              {selectedDesign === 'Colorful Analytics' ? <Icon name="check" className="mr-2" /> : null}
              Select This Design
            </Button>
          </div>

          {/* Colorful Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900 dark:to-pink-950 border-pink-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center">
                  <Icon name="shopping_bag" className="text-white text-xl" />
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
                  <Icon name="receipt" className="text-white text-xl" />
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
                  <Icon name="inventory_2" className="text-white text-xl" />
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
                  <Icon name="person_add" className="text-white text-xl" />
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
      </Tabs>

      {/* Footer Info */}
      <Card className="p-6 bg-muted/30">
        <div className="flex items-start gap-4">
          <Icon name="info" className="text-primary text-2xl flex-shrink-0" />
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
