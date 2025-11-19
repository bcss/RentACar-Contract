import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Car,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Plus,
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Star,
  Flag
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const sampleData = {
  revenueData: [
    { month: "Jan", revenue: 45000, contracts: 85 },
    { month: "Feb", revenue: 52000, contracts: 92 },
    { month: "Mar", revenue: 48000, contracts: 88 },
    { month: "Apr", revenue: 61000, contracts: 105 },
    { month: "May", revenue: 55000, contracts: 98 },
    { month: "Jun", revenue: 67000, contracts: 112 }
  ],
  categoryData: [
    { name: "Economy", value: 45, color: "#0ea5e9" },
    { name: "Compact", value: 25, color: "#8b5cf6" },
    { name: "SUV", value: 20, color: "#f59e0b" },
    { name: "Luxury", value: 10, color: "#10b981" }
  ],
  contracts: [
    { id: 1, contractNumber: "CTR-2025-001", customer: "Ahmed Al Mansoori", vehicle: "Toyota Camry 2024", status: "active", amount: 2100, startDate: "2025-01-15", endDate: "2025-01-22" },
    { id: 2, contractNumber: "CTR-2025-002", customer: "Fatima Hassan", vehicle: "Nissan Patrol 2023", status: "completed", amount: 4500, startDate: "2025-01-10", endDate: "2025-01-20" },
    { id: 3, contractNumber: "CTR-2025-003", customer: "Mohammed Ali", vehicle: "Honda Accord 2024", status: "pending", amount: 1800, startDate: "2025-01-20", endDate: "2025-01-25" },
    { id: 4, contractNumber: "CTR-2025-004", customer: "Sara Abdullah", vehicle: "Kia Sportage 2024", status: "active", amount: 3200, startDate: "2025-01-18", endDate: "2025-01-28" }
  ],
  vehicles: [
    { id: 1, plateNumber: "A-12345", brand: "Toyota", model: "Camry", year: 2024, status: "available", utilization: 85 },
    { id: 2, plateNumber: "B-67890", brand: "Nissan", model: "Patrol", year: 2023, status: "rented", utilization: 92 },
    { id: 3, plateNumber: "C-11223", brand: "Honda", model: "Accord", year: 2024, status: "maintenance", utilization: 78 },
    { id: 4, plateNumber: "D-44556", brand: "Kia", model: "Sportage", year: 2024, status: "available", utilization: 88 }
  ],
  timeline: [
    { id: 1, action: "Contract Created", user: "Staff User", timestamp: "2025-01-19 10:30 AM", type: "create" },
    { id: 2, action: "Payment Received", user: "System", timestamp: "2025-01-19 10:35 AM", type: "payment" },
    { id: 3, action: "Vehicle Assigned", user: "Manager User", timestamp: "2025-01-19 11:00 AM", type: "assign" },
    { id: 4, action: "Contract Activated", user: "System", timestamp: "2025-01-19 11:05 AM", type: "status" }
  ]
};

export default function DesignSamplesShowcase() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Active" },
      completed: { variant: "secondary", label: "Completed" },
      pending: { variant: "outline", label: "Pending" },
      available: { variant: "default", label: "Available" },
      rented: { variant: "secondary", label: "Rented" },
      maintenance: { variant: "destructive", label: "Maintenance" }
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Design System Showcase</h1>
            <p className="text-muted-foreground mt-1" data-testid="text-page-description">
              Comprehensive visual guide to RCCMS UI components and patterns
            </p>
          </div>
          <Button variant="outline" size="icon" data-testid="button-settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
      </div>

      {/* Tabs Navigation */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto" data-testid="tabs-navigation">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tables" data-testid="tab-tables">Data Tables</TabsTrigger>
          <TabsTrigger value="forms" data-testid="tab-forms">Forms</TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
          <TabsTrigger value="components" data-testid="tab-components">Components</TabsTrigger>
        </TabsList>

        {/* SAMPLE 1: DASHBOARD LAYOUT */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Stat Cards */}
            <Card data-testid="card-stat-total-revenue">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-revenue-amount">AED 328,600</div>
                <p className="text-xs text-muted-foreground" data-testid="text-revenue-change">
                  <TrendingUp className="inline h-3 w-3 text-green-500" /> +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-active-contracts">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-contracts-count">142</div>
                <p className="text-xs text-muted-foreground" data-testid="text-contracts-change">
                  <TrendingUp className="inline h-3 w-3 text-green-500" /> +8 new today
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-fleet-utilization">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-utilization-percentage">87%</div>
                <Progress value={87} className="mt-2" data-testid="progress-utilization" />
              </CardContent>
            </Card>

            <Card data-testid="card-stat-total-customers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-customers-count">1,249</div>
                <p className="text-xs text-muted-foreground" data-testid="text-customers-change">
                  +23 this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SAMPLE 2: CHART CARDS */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-revenue-chart">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue and contract trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sampleData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue (AED)" />
                    <Bar dataKey="contracts" fill="#8b5cf6" name="Contracts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-category-chart">
              <CardHeader>
                <CardTitle>Fleet by Category</CardTitle>
                <CardDescription>Distribution of vehicle types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={sampleData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sampleData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* SAMPLE 3: ALERTS & NOTIFICATIONS */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20" data-testid="card-alert-warning">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-amber-900 dark:text-amber-100">Pending Approvals</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 dark:text-amber-200" data-testid="text-alert-message">
                  You have 3 high-value contracts waiting for approval.
                </p>
                <Button variant="outline" size="sm" className="mt-4" data-testid="button-view-approvals">
                  View Approvals
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20" data-testid="card-alert-success">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-900 dark:text-green-100">System Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800 dark:text-green-200" data-testid="text-status-message">
                  All systems operational. Last backup: 2 hours ago.
                </p>
                <Button variant="outline" size="sm" className="mt-4" data-testid="button-view-logs">
                  View Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SAMPLE 4: DATA TABLES */}
        <TabsContent value="tables" className="space-y-6">
          <Card data-testid="card-contracts-table">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rental Contracts</CardTitle>
                  <CardDescription>Manage all rental agreements</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" data-testid="button-add-contract">
                    <Plus className="h-4 w-4 mr-2" />
                    New Contract
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts..."
                    className="pl-9"
                    data-testid="input-search-contracts"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleData.contracts.map((contract) => (
                      <TableRow key={contract.id} data-testid={`row-contract-${contract.id}`}>
                        <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                        <TableCell>{contract.customer}</TableCell>
                        <TableCell>{contract.vehicle}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {contract.startDate} to {contract.endDate}
                        </TableCell>
                        <TableCell>AED {contract.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" data-testid={`button-view-${contract.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-edit-${contract.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-${contract.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing 1-4 of 142 contracts</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled data-testid="button-previous">Previous</Button>
                <Button variant="outline" size="sm" data-testid="button-next">Next</Button>
              </div>
            </CardFooter>
          </Card>

          {/* SAMPLE 5: VEHICLE LIST WITH PROGRESS */}
          <Card data-testid="card-vehicles-list">
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
              <CardDescription>Vehicle utilization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleData.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate" data-testid={`item-vehicle-${vehicle.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
                        <p className="text-sm text-muted-foreground">Plate: {vehicle.plateNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">Utilization</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={vehicle.utilization} className="w-24" />
                          <span className="text-sm text-muted-foreground">{vehicle.utilization}%</span>
                        </div>
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAMPLE 6: FORM LAYOUTS */}
        <TabsContent value="forms" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card data-testid="card-form-customer">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Create or edit customer details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" placeholder="Enter full name" data-testid="input-fullname" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="customer@example.com" data-testid="input-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+971 50 123 4567" data-testid="input-phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emirate">Emirate</Label>
                  <Select>
                    <SelectTrigger id="emirate" data-testid="select-emirate">
                      <SelectValue placeholder="Select emirate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dubai">Dubai</SelectItem>
                      <SelectItem value="abu_dhabi">Abu Dhabi</SelectItem>
                      <SelectItem value="sharjah">Sharjah</SelectItem>
                      <SelectItem value="ajman">Ajman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="newsletter" data-testid="checkbox-newsletter" />
                  <Label htmlFor="newsletter" className="text-sm font-normal">
                    Subscribe to promotional emails
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" data-testid="button-cancel">Cancel</Button>
                <Button data-testid="button-save-customer">Save Customer</Button>
              </CardFooter>
            </Card>

            <Card data-testid="card-form-contract">
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>Configure rental agreement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select>
                    <SelectTrigger id="vehicle" data-testid="select-vehicle">
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Toyota Camry 2024 - A-12345</SelectItem>
                      <SelectItem value="2">Nissan Patrol 2023 - B-67890</SelectItem>
                      <SelectItem value="3">Honda Accord 2024 - C-11223</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startdate">Start Date</Label>
                    <Input id="startdate" type="date" data-testid="input-startdate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enddate">End Date</Label>
                    <Input id="enddate" type="date" data-testid="input-enddate" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyrate">Daily Rate (AED)</Label>
                  <Input id="dailyrate" type="number" placeholder="300" data-testid="input-dailyrate" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" placeholder="Enter any special requirements..." data-testid="textarea-notes" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="insurance">Include Insurance</Label>
                  <Switch id="insurance" data-testid="switch-insurance" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" data-testid="button-draft">Save as Draft</Button>
                <Button data-testid="button-create-contract">Create Contract</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* SAMPLE 7: CHARTS & ANALYTICS */}
        <TabsContent value="charts" className="space-y-6">
          <Card data-testid="card-trend-chart">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>6-month performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sampleData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} name="Revenue (AED)" />
                  <Line type="monotone" dataKey="contracts" stroke="#8b5cf6" strokeWidth={2} name="Contracts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" data-testid="button-export-chart">
                <Download className="h-4 w-4 mr-2" />
                Export Chart
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card data-testid="card-metric-revenue">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Contract Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">AED 2,314</div>
                <p className="text-xs text-muted-foreground mt-2">
                  <Activity className="inline h-3 w-3" /> Based on 142 contracts
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-metric-duration">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">7.2 days</div>
                <p className="text-xs text-muted-foreground mt-2">
                  <Calendar className="inline h-3 w-3" /> Typical rental period
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-metric-rating">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold flex items-center gap-2">
                  4.8
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on 523 reviews
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SAMPLE 8-12: COMPONENT PATTERNS */}
        <TabsContent value="components" className="space-y-6">
          {/* SAMPLE 8: TIMELINE VIEW */}
          <Card data-testid="card-timeline">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleData.timeline.map((item, index) => (
                  <div key={item.id} className="flex gap-4" data-testid={`timeline-item-${item.id}`}>
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        item.type === 'create' ? 'bg-blue-100 dark:bg-blue-950' :
                        item.type === 'payment' ? 'bg-green-100 dark:bg-green-950' :
                        item.type === 'assign' ? 'bg-purple-100 dark:bg-purple-950' :
                        'bg-amber-100 dark:bg-amber-950'
                      }`}>
                        {item.type === 'create' && <Plus className="h-5 w-5 text-blue-600" />}
                        {item.type === 'payment' && <DollarSign className="h-5 w-5 text-green-600" />}
                        {item.type === 'assign' && <Car className="h-5 w-5 text-purple-600" />}
                        {item.type === 'status' && <CheckCircle className="h-5 w-5 text-amber-600" />}
                      </div>
                      {index < sampleData.timeline.length - 1 && (
                        <div className="h-full w-px bg-border my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">by {item.user}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SAMPLE 9: USER CARDS */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card data-testid="card-user-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">AM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Ahmed Al Mansoori</h3>
                    <p className="text-sm text-muted-foreground">Manager</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-email-user-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-call-user-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-user-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">FH</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Fatima Hassan</h3>
                    <p className="text-sm text-muted-foreground">Sales Staff</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-email-user-2">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-call-user-2">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-user-3">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">MA</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Mohammed Ali</h3>
                    <p className="text-sm text-muted-foreground">Fleet Manager</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-email-user-3">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-call-user-3">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SAMPLE 10: DIALOG PATTERNS */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-dialogs">
              <CardHeader>
                <CardTitle>Modal Dialogs</CardTitle>
                <CardDescription>Various dialog patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="button-open-form-dialog">
                      <Plus className="h-4 w-4 mr-2" />
                      Open Form Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-form">
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>Enter vehicle details to add to fleet</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="platenumber">Plate Number</Label>
                        <Input id="platenumber" placeholder="A-12345" data-testid="input-platenumber" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input id="brand" placeholder="Toyota" data-testid="input-brand" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" data-testid="button-close-dialog">Cancel</Button>
                      <Button data-testid="button-submit-dialog">Add Vehicle</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" data-testid="button-open-alert">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Confirmation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-testid="alert-delete">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the contract
                        and remove the data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                      <AlertDialogAction data-testid="button-confirm-delete">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* SAMPLE 11: BADGE VARIATIONS */}
            <Card data-testid="card-badges">
              <CardHeader>
                <CardTitle>Status Badges</CardTitle>
                <CardDescription>Different badge styles and variants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge data-testid="badge-default">Default</Badge>
                    <Badge variant="secondary" data-testid="badge-secondary">Secondary</Badge>
                    <Badge variant="outline" data-testid="badge-outline">Outline</Badge>
                    <Badge variant="destructive" data-testid="badge-destructive">Destructive</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Contract Status:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge data-testid="badge-contract-active">Active</Badge>
                      <Badge variant="secondary" data-testid="badge-contract-completed">Completed</Badge>
                      <Badge variant="outline" data-testid="badge-contract-pending">Pending</Badge>
                      <Badge variant="destructive" data-testid="badge-contract-cancelled">Cancelled</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Status:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500" data-testid="badge-payment-paid">Paid</Badge>
                      <Badge className="bg-amber-500" data-testid="badge-payment-partial">Partial</Badge>
                      <Badge className="bg-red-500" data-testid="badge-payment-overdue">Overdue</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SAMPLE 12: ACTION BUTTONS */}
          <Card data-testid="card-buttons">
            <CardHeader>
              <CardTitle>Button Variations</CardTitle>
              <CardDescription>Different button sizes and styles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Variants:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button data-testid="button-variant-default">Default</Button>
                    <Button variant="secondary" data-testid="button-variant-secondary">Secondary</Button>
                    <Button variant="outline" data-testid="button-variant-outline">Outline</Button>
                    <Button variant="ghost" data-testid="button-variant-ghost">Ghost</Button>
                    <Button variant="destructive" data-testid="button-variant-destructive">Destructive</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sizes:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" data-testid="button-size-small">Small</Button>
                    <Button data-testid="button-size-default">Default</Button>
                    <Button size="lg" data-testid="button-size-large">Large</Button>
                    <Button size="icon" data-testid="button-size-icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">With Icons:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button data-testid="button-icon-download">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" data-testid="button-icon-upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <Button variant="secondary" data-testid="button-icon-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
