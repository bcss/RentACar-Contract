import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Car, DollarSign, 
  Calendar, CheckCircle, XCircle, Clock, AlertTriangle,
  FileText, Download, Upload, Settings, Zap
} from 'lucide-react';

/**
 * RCCMS Design System Showcase
 * 
 * This page demonstrates 10+ standardized UI patterns that should be reused
 * across the entire application for visual consistency and professional appearance.
 * 
 * Each pattern includes:
 * - Visual example
 * - Code snippet for reuse
 * - Usage guidelines
 * - When to use/not use
 */

export default function DesignSystemShowcase() {
  const [selectedTab, setSelectedTab] = useState('dashboard-cards');

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">RCCMS Design System</h1>
        <p className="text-lg text-muted-foreground">
          Standardized UI components and patterns for consistent, professional design across the application
        </p>
      </div>

      {/* Navigation */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-2">
          <TabsTrigger value="dashboard-cards">Dashboard Cards</TabsTrigger>
          <TabsTrigger value="data-tables">Data Tables</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="status-badges">Status Badges</TabsTrigger>
          <TabsTrigger value="actions">Action Buttons</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="modals">Modals & Dialogs</TabsTrigger>
          <TabsTrigger value="timelines">Timelines</TabsTrigger>
        </TabsList>

        {/* PATTERN 1: Dashboard Cards */}
        <TabsContent value="dashboard-cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 1: Dashboard Stat Cards</CardTitle>
              <CardDescription>
                Standard KPI cards with icon, title, value, and trend indicator.
                Use for dashboards, reports, and summary views.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Primary Metric */}
                <Card className="hover-elevate active-elevate-2">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">AED 125,430</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">+12.5%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Secondary Metric */}
                <Card className="hover-elevate active-elevate-2">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <TrendingDown className="mr-1 h-3 w-3 text-rose-600" />
                      <span className="text-rose-600 font-medium">-3.2%</span>
                      <span className="ml-1">from last week</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: Fleet Metric */}
                <Card className="hover-elevate active-elevate-2">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78.5%</div>
                    <Progress value={78.5} className="mt-2" />
                  </CardContent>
                </Card>

                {/* Card 4: Customer Metric */}
                <Card className="hover-elevate active-elevate-2">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">+23</span>
                      <span className="ml-1">this month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Usage Guidelines:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Use for important KPIs on dashboards</li>
                  <li>✅ Include icon for quick visual recognition</li>
                  <li>✅ Add trend indicator when showing changes over time</li>
                  <li>✅ Use hover-elevate for interactive feel</li>
                  <li>❌ Don't use for detailed data (use tables instead)</li>
                  <li>❌ Don't overcrowd with too many metrics (limit to 4-6 per row)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATTERN 2: Data Tables */}
        <TabsContent value="data-tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 2: Data Tables</CardTitle>
              <CardDescription>
                Standard table layout with consistent styling, hover effects, and action buttons.
                Use for list views, reports, and data grids.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover-elevate">
                    <TableCell className="font-medium">RC-2025-001</TableCell>
                    <TableCell>Ahmed Ali</TableCell>
                    <TableCell>Toyota Camry - DXB-12345</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">AED 3,500</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover-elevate">
                    <TableCell className="font-medium">RC-2025-002</TableCell>
                    <TableCell>Sara Mohammed</TableCell>
                    <TableCell>Honda Accord - AUH-67890</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover-elevate">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">AED 2,800</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover-elevate">
                    <TableCell className="font-medium">RC-2025-003</TableCell>
                    <TableCell>Khaled Hassan</TableCell>
                    <TableCell>Nissan Patrol - SHJ-34567</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200 hover-elevate">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">AED 5,200</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          Invoice
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Usage Guidelines:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Use hover-elevate on TableRow for interactive feedback</li>
                  <li>✅ Align numbers to the right for easy scanning</li>
                  <li>✅ Use consistent badge styling for status columns</li>
                  <li>✅ Keep action buttons in rightmost column</li>
                  <li>✅ Use font-medium for important identifiers (IDs, names)</li>
                  <li>❌ Don't use too many action buttons per row (max 2-3)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATTERN 3: Forms */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 3: Form Layout</CardTitle>
              <CardDescription>
                Standard form design with proper spacing, labels, and validation states.
                Use for all data entry forms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Two-column layout for desktop */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="Enter first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Enter last name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="customer@example.com" />
                  <p className="text-xs text-muted-foreground">We'll use this for contract notifications</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" placeholder="+971 50 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emirate">Emirate</Label>
                    <Select>
                      <SelectTrigger id="emirate">
                        <SelectValue placeholder="Select emirate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dubai">Dubai</SelectItem>
                        <SelectItem value="abudhabi">Abu Dhabi</SelectItem>
                        <SelectItem value="sharjah">Sharjah</SelectItem>
                        <SelectItem value="ajman">Ajman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline">Cancel</Button>
                  <Button type="submit">Save Customer</Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Usage Guidelines:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Use md:grid-cols-2 for two-column layout on desktop</li>
                  <li>✅ Add * asterisk for required fields</li>
                  <li>✅ Include helper text for complex fields</li>
                  <li>✅ Use Separator before action buttons</li>
                  <li>✅ Place primary action (Save) on the right</li>
                  <li>❌ Don't overcrowd forms (use tabs if needed)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATTERN 4: Charts */}
        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 4: Data Visualization</CardTitle>
              <CardDescription>
                Standard chart layouts with consistent colors and styling.
                Use for reports and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bar Chart Example */}
              <div>
                <h4 className="font-medium mb-4">Monthly Revenue Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { month: 'Jan', revenue: 45000 },
                    { month: 'Feb', revenue: 52000 },
                    { month: 'Mar', revenue: 48000 },
                    { month: 'Apr', revenue: 61000 },
                    { month: 'May', revenue: 55000 },
                    { month: 'Jun', revenue: 67000 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#0891b2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart Example */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Contract Status Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: 45, color: '#10b981' },
                          { name: 'Completed', value: 30, color: '#3b82f6' },
                          { name: 'Pending', value: 15, color: '#f59e0b' },
                          { name: 'Cancelled', value: 10, color: '#ef4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { color: '#10b981' },
                          { color: '#3b82f6' },
                          { color: '#f59e0b' },
                          { color: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Fleet Utilization Trend</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[
                      { day: 'Mon', rate: 75 },
                      { day: 'Tue', rate: 82 },
                      { day: 'Wed', rate: 78 },
                      { day: 'Thu', rate: 85 },
                      { day: 'Fri', rate: 92 },
                      { day: 'Sat', rate: 88 },
                      { day: 'Sun', rate: 79 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#0891b2" strokeWidth={2} dot={{ fill: '#0891b2' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Usage Guidelines:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Use primary color (#0891b2 cyan) for single-dataset charts</li>
                  <li>✅ Use semantic colors for status-based data (green=good, red=bad)</li>
                  <li>✅ Include proper axis labels and grid lines</li>
                  <li>✅ Use ResponsiveContainer for mobile compatibility</li>
                  <li>✅ Add chart title above visualization</li>
                  <li>❌ Don't use too many colors (max 4-5 in pie charts)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATTERN 5: Status Badges */}
        <TabsContent value="status-badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 5: Status Badges</CardTitle>
              <CardDescription>
                Consistent badge styling for different status types.
                Use for contract status, payment status, risk levels, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Contract Status Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200 hover-elevate">
                    <FileText className="mr-1 h-3 w-3" />
                    Draft
                  </Badge>
                  <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                  <Badge variant="default" className="bg-cyan-100 text-cyan-700 border-cyan-200 hover-elevate">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border-slate-200 hover-elevate">
                    <XCircle className="mr-1 h-3 w-3" />
                    Closed
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Payment Status Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200 hover-elevate">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                  <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                  <Badge variant="default" className="bg-rose-100 text-rose-700 border-rose-200 hover-elevate">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Overdue
                  </Badge>
                  <Badge variant="default" className="bg-purple-100 text-purple-700 border-purple-200 hover-elevate">
                    <DollarSign className="mr-1 h-3 w-3" />
                    Refunded
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Risk Level Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Low Risk
                  </Badge>
                  <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200 hover-elevate">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Medium Risk
                  </Badge>
                  <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-200 hover-elevate">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    High Risk
                  </Badge>
                  <Badge variant="default" className="bg-rose-100 text-rose-700 border-rose-200 hover-elevate">
                    <XCircle className="mr-1 h-3 w-3" />
                    Very High Risk
                  </Badge>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Color Coding Standards:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>🟢 <strong>Green (Emerald):</strong> Success, Active, Completed, Low Risk</li>
                  <li>🔵 <strong>Blue (Cyan/Sky):</strong> Info, Draft, In Progress</li>
                  <li>🟡 <strong>Yellow (Amber):</strong> Warning, Pending, Medium Risk</li>
                  <li>🟠 <strong>Orange:</strong> Caution, High Risk</li>
                  <li>🔴 <strong>Red (Rose):</strong> Danger, Failed, Very High Risk, Overdue</li>
                  <li>⚪ <strong>Gray (Slate):</strong> Inactive, Disabled, Closed</li>
                  <li>🟣 <strong>Purple:</strong> Special actions (Refund, Transfer)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATTERN 6: Action Buttons */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 6: Action Button Patterns</CardTitle>
              <CardDescription>
                Standard button combinations for common actions.
                Use for page headers, forms, and toolbars.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Page Header Actions</h4>
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <h2 className="text-2xl font-bold">Contracts Management</h2>
                    <p className="text-sm text-muted-foreground">Manage all rental contracts</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      New Contract
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Form Actions</h4>
                <div className="flex justify-end gap-3 p-4 bg-muted/30 rounded-lg">
                  <Button type="button" variant="outline">Cancel</Button>
                  <Button type="button" variant="secondary">Save as Draft</Button>
                  <Button type="submit">Save & Continue</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Record Actions</h4>
                <div className="flex gap-2 p-4 bg-muted/30 rounded-lg">
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                    <XCircle className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Button Hierarchy:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Primary (default):</strong> Main action (Save, Submit, Create)</li>
                  <li><strong>Secondary:</strong> Alternative action (Save as Draft)</li>
                  <li><strong>Outline:</strong> Secondary actions in groups</li>
                  <li><strong>Ghost:</strong> Tertiary actions (View, Preview)</li>
                  <li><strong>Destructive:</strong> Use red colors for delete actions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATTERN 7: Statistics Display */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 7: Statistics & Metrics Display</CardTitle>
              <CardDescription>
                Different ways to present numerical data and statistics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inline Stats */}
              <div>
                <h4 className="font-medium mb-3">Inline Statistics</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold">94.2%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-600" />
                    </div>
                    <Progress value={94.2} className="mt-3" />
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Daily Revenue</p>
                        <p className="text-2xl font-bold">AED 12,450</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-cyan-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Last 30 days</p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Response Time</p>
                        <p className="text-2xl font-bold">1.2 hrs</p>
                      </div>
                      <Zap className="h-8 w-8 text-amber-600" />
                    </div>
                    <p className="text-xs text-emerald-600 mt-3">↓ 15% faster</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comparison Stats */}
              <div>
                <h4 className="font-medium mb-3">Comparison Statistics</h4>
                <Card className="p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">This Month</p>
                      <p className="text-3xl font-bold">AED 125,430</p>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="mr-1 h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">+12.5%</span>
                        <span className="text-muted-foreground ml-1">vs last month</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Last Month</p>
                      <p className="text-3xl font-bold text-muted-foreground">AED 111,560</p>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>October 2025</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add more TabsContent for patterns 8-10 */}
        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 8: Filter Panels</CardTitle>
              <CardDescription>Standard filter layouts for search and filtering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dubai">Dubai</SelectItem>
                      <SelectItem value="abudhabi">Abu Dhabi</SelectItem>
                      <SelectItem value="sharjah">Sharjah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm">Reset</Button>
                <Button size="sm">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 9: Modal Dialog Layouts</CardTitle>
              <CardDescription>Standard patterns for dialog content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-background">
                <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete this contract? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Delete Contract</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern 10: Timeline & Activity Display</CardTitle>
              <CardDescription>Chronological activity and event display</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '2 hours ago', action: 'Contract activated', user: 'Ahmed Ali', icon: CheckCircle, color: 'text-emerald-600' },
                  { time: '5 hours ago', action: 'Payment received', user: 'Sara Mohammed', icon: DollarSign, color: 'text-cyan-600' },
                  { time: '1 day ago', action: 'Contract created', user: 'Khaled Hassan', icon: FileText, color: 'text-blue-600' },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full p-2 bg-muted ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      {index < 2 && <div className="w-px h-12 bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">by {item.user}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Design Tokens Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Design Tokens & Constants</CardTitle>
          <CardDescription>
            Core design values used consistently across the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Spacing Scale</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">gap-2</span>
                  <span className="font-mono">0.5rem (8px)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">gap-4</span>
                  <span className="font-mono">1rem (16px)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">gap-6</span>
                  <span className="font-mono">1.5rem (24px)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">gap-8</span>
                  <span className="font-mono">2rem (32px)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Border Radius</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">rounded-md</span>
                  <span className="font-mono">0.375rem (6px)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">rounded-lg</span>
                  <span className="font-mono">0.5rem (8px)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">rounded-full</span>
                  <span className="font-mono">9999px</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
