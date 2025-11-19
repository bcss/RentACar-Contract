import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Car, TrendingUp, DollarSign, FileText, Bell, Settings, Search, Plus, Download, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DesignSamples() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Design System Mockups</h1>
        <p className="text-muted-foreground">
          Visual samples demonstrating the unified Material Design 3 based design system for RCCMS
        </p>
      </div>

      <Tabs defaultValue="dashboards" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        {/* Dashboard Samples */}
        <TabsContent value="dashboards" className="space-y-6">
          <h2 className="text-2xl font-semibold">Dashboard Layouts</h2>
          
          {/* Sample 1: Executive Dashboard */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
              Executive Overview Dashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">AED 245,680</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.5%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8</span> new this week
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8/5.0</div>
                  <p className="text-xs text-muted-foreground">
                    Based on 234 reviews
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sample 2: Operations Dashboard */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
              Fleet Operations Dashboard
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Vehicle Status Overview</CardTitle>
                  <CardDescription>Current fleet distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Available (45 vehicles)</span>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="bg-muted" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-sm">On Rent (38 vehicles)</span>
                      </div>
                      <span className="text-sm font-medium">38%</span>
                    </div>
                    <Progress value={38} className="bg-muted" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Maintenance (12 vehicles)</span>
                      </div>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <Progress value={12} className="bg-muted" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-500" />
                        <span className="text-sm">Reserved (5 vehicles)</span>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                    <Progress value={5} className="bg-muted" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Contract
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Car className="h-4 w-4 mr-2" />
                    Check-In Vehicle
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sample 3: Analytics Dashboard */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
              Revenue Analytics Dashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">AED 89,450</div>
                  <p className="text-xs text-muted-foreground mt-1">Target: AED 100,000</p>
                  <Progress value={89} className="mt-3" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">AED 185</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600">+AED 15</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">73%</div>
                  <p className="text-xs text-muted-foreground mt-1">Industry avg: 68%</p>
                  <Badge variant="default" className="mt-2">Above Average</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Form Samples */}
        <TabsContent value="forms" className="space-y-6">
          <h2 className="text-2xl font-semibold">Form Designs</h2>

          {/* Sample 4: Customer Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">4</span>
              Customer Registration Form
            </h3>
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>New Customer</CardTitle>
                <CardDescription>Add a new customer to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="license">Driving License Number</Label>
                  <Input id="license" placeholder="DL-12345" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Customer</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sample 5: Contract Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">5</span>
              Contract Creation Form
            </h3>
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>New Rental Contract</CardTitle>
                <CardDescription>Create a new rental agreement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c1">Ahmed Al Mansoori</SelectItem>
                        <SelectItem value="c2">Sara Mohammed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">Toyota Camry - ABC 1234</SelectItem>
                        <SelectItem value="v2">Honda Accord - XYZ 5678</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Rate (AED)</Label>
                    <Input type="number" placeholder="185" />
                  </div>
                  <div className="space-y-2">
                    <Label>Security Deposit (AED)</Label>
                    <Input type="number" placeholder="1500" />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Estimated Total</span>
                    <span className="text-2xl font-bold text-primary">AED 3,885</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>7 days × AED 185</span>
                      <span>AED 1,295</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance (AED 30/day)</span>
                      <span>AED 210</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>AED 50</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (5%)</span>
                      <span>AED 77.75</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit</span>
                      <span>AED 1,500</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Save as Draft</Button>
                <Button>Create Contract</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Table Samples */}
        <TabsContent value="tables" className="space-y-6">
          <h2 className="text-2xl font-semibold">Data Tables</h2>

          {/* Sample 6: Contracts Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">6</span>
              Active Contracts Table
            </h3>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Contracts</CardTitle>
                    <CardDescription>Manage all active rental agreements</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search contracts..." className="pl-8 w-64" />
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Contract
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="p-3 text-left text-sm font-medium">Contract #</th>
                          <th className="p-3 text-left text-sm font-medium">Customer</th>
                          <th className="p-3 text-left text-sm font-medium">Vehicle</th>
                          <th className="p-3 text-left text-sm font-medium">Start Date</th>
                          <th className="p-3 text-left text-sm font-medium">End Date</th>
                          <th className="p-3 text-left text-sm font-medium">Status</th>
                          <th className="p-3 text-left text-sm font-medium">Amount</th>
                          <th className="p-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover-elevate">
                          <td className="p-3 text-sm font-medium">RC-2024-001</td>
                          <td className="p-3 text-sm">Ahmed Al Mansoori</td>
                          <td className="p-3 text-sm">Toyota Camry - ABC 1234</td>
                          <td className="p-3 text-sm">Jan 15, 2024</td>
                          <td className="p-3 text-sm">Jan 22, 2024</td>
                          <td className="p-3">
                            <Badge variant="default">Active</Badge>
                          </td>
                          <td className="p-3 text-sm font-medium">AED 3,885</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b hover-elevate">
                          <td className="p-3 text-sm font-medium">RC-2024-002</td>
                          <td className="p-3 text-sm">Sara Mohammed</td>
                          <td className="p-3 text-sm">Honda Accord - XYZ 5678</td>
                          <td className="p-3 text-sm">Jan 16, 2024</td>
                          <td className="p-3 text-sm">Jan 30, 2024</td>
                          <td className="p-3">
                            <Badge variant="default">Active</Badge>
                          </td>
                          <td className="p-3 text-sm font-medium">AED 7,245</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="hover-elevate">
                          <td className="p-3 text-sm font-medium">RC-2024-003</td>
                          <td className="p-3 text-sm">Omar Hassan</td>
                          <td className="p-3 text-sm">Nissan Altima - DEF 9012</td>
                          <td className="p-3 text-sm">Jan 17, 2024</td>
                          <td className="p-3 text-sm">Feb 01, 2024</td>
                          <td className="p-3">
                            <Badge variant="default">Active</Badge>
                          </td>
                          <td className="p-3 text-sm font-medium">AED 5,920</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Card Samples */}
        <TabsContent value="cards" className="space-y-6">
          <h2 className="text-2xl font-semibold">Card Variations</h2>

          {/* Sample 7: Notification Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">7</span>
              Notification & Alert Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader className="flex flex-row items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base">Payment Received</CardTitle>
                    <CardDescription>Contract RC-2024-001 has been paid in full</CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                <CardHeader className="flex flex-row items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base">Maintenance Due</CardTitle>
                    <CardDescription>Vehicle ABC 1234 requires servicing in 2 days</CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                <CardHeader className="flex flex-row items-start gap-4">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base">Payment Overdue</CardTitle>
                    <CardDescription>Contract RC-2023-985 payment is 5 days overdue</CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader className="flex flex-row items-start gap-4">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base">New Booking Request</CardTitle>
                    <CardDescription">Customer Sara Mohammed requested a vehicle for Feb 5-12</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Sample 8: Profile Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">8</span>
              Customer Profile Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Ahmed Al Mansoori</CardTitle>
                      <CardDescription>Premium Customer</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Rentals:</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lifetime Value:</span>
                    <span className="font-medium">AED 45,890</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <Badge variant="default" className="bg-green-600">Low</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </CardFooter>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Sara Mohammed</CardTitle>
                      <CardDescription>Regular Customer</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Rentals:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lifetime Value:</span>
                    <span className="font-medium">AED 18,450</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <Badge variant="default" className="bg-green-600">Low</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </CardFooter>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>OH</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Omar Hassan</CardTitle>
                      <CardDescription>New Customer</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Rentals:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lifetime Value:</span>
                    <span className="font-medium">AED 4,280</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Component Samples */}
        <TabsContent value="components" className="space-y-6">
          <h2 className="text-2xl font-semibold">Component Library</h2>

          {/* Sample 9: Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">9</span>
              Button Variations
            </h3>
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Different button styles and states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">With Icons</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="secondary">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">States</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button>
                      Loading...
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample 10: Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">10</span>
              Status Badges
            </h3>
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Contract Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="secondary">Pending</Badge>
                    <Badge variant="outline">Reserved</Badge>
                    <Badge variant="destructive">Cancelled</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Payment Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-600">Paid</Badge>
                    <Badge className="bg-yellow-600">Pending</Badge>
                    <Badge className="bg-red-600">Overdue</Badge>
                    <Badge className="bg-blue-600">Partial</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Vehicle Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-600">Available</Badge>
                    <Badge className="bg-blue-600">On Rent</Badge>
                    <Badge className="bg-yellow-600">Maintenance</Badge>
                    <Badge className="bg-gray-600">Reserved</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Risk Levels</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-600">Low Risk</Badge>
                    <Badge className="bg-yellow-600">Medium Risk</Badge>
                    <Badge className="bg-red-600">High Risk</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Design System Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Color Scheme:</strong> Material Design 3 with cyan-blue primary color</p>
          <p><strong>Typography:</strong> Inter font (English), Cairo font (Arabic)</p>
          <p><strong>Components:</strong> shadcn/ui based on Radix UI primitives</p>
          <p><strong>Interactions:</strong> Hover elevation, active states, smooth transitions</p>
          <p><strong>Responsive:</strong> Mobile-first design with Tailwind CSS breakpoints</p>
          <p><strong>Accessibility:</strong> WCAG 2.1 AA compliant</p>
          <p><strong>Theme:</strong> Light and dark mode support</p>
          <p><strong>Bilingual:</strong> Full RTL/LTR layout support for English/Arabic</p>
        </CardContent>
      </Card>
    </div>
  );
}
