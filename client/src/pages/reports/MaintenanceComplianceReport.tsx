import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Wrench, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function MaintenanceComplianceReport() {
  const { data: maintenance, isLoading } = useQuery<any[]>({
    queryKey: ['/api/vehicle-maintenance'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const today = new Date();

  // Calculate metrics
  const totalRecords = maintenance?.length || 0;
  const totalCost = maintenance?.reduce((sum, m) => sum + parseFloat(m.cost || '0'), 0) || 0;
  const overdueCount = maintenance?.filter(m => {
    if (!m.nextServiceDate) return false;
    return new Date(m.nextServiceDate) < today;
  }).length || 0;

  const upcomingCount = maintenance?.filter(m => {
    if (!m.nextServiceDate) return false;
    const nextDate = new Date(m.nextServiceDate);
    const daysUntil = differenceInDays(nextDate, today);
    return daysUntil >= 0 && daysUntil <= 30;
  }).length || 0;

  // Service type breakdown
  const serviceTypes = maintenance?.reduce((acc: any, m) => {
    const type = m.serviceType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  const serviceData = Object.entries(serviceTypes).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  // Monthly cost trend
  const monthlyData = maintenance
    ?.reduce((acc: any[], m) => {
      const month = format(new Date(m.serviceDate), 'MMM yyyy');
      const existing = acc.find(d => d.month === month);
      const cost = parseFloat(m.cost || '0');
      if (existing) {
        existing.cost += cost;
        existing.count += 1;
      } else {
        acc.push({ month, cost, count: 1 });
      }
      return acc;
    }, [])
    ?.slice(-12) || [];

  const handleExport = () => {
    if (!maintenance) return;
    const csv = [
      ['Date', 'Vehicle', 'Service Type', 'Cost', 'Odometer', 'Next Service Date'].join(','),
      ...maintenance.map(m => [
        format(new Date(m.serviceDate), 'yyyy-MM-dd'),
        m.vehicleId || '',
        m.serviceType || '',
        m.cost || '0',
        m.odometerReading || '',
        m.nextServiceDate ? format(new Date(m.nextServiceDate), 'yyyy-MM-dd') : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-compliance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Maintenance Compliance Report</h1>
          <p className="text-muted-foreground">Fleet service tracking and preventive maintenance scheduling</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Records</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">Total maintenance events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">AED {totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Maintenance spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Services</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (30 Days)</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Schedule soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
            <CardDescription>Breakdown by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Maintenance Costs</CardTitle>
            <CardDescription>Last 12 months spending trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `AED ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="cost" fill="#3b82f6" name="Cost (AED)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
