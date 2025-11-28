import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { format } from "date-fns";

const safeFormatDate = (dateValue: string | Date | null | undefined, formatStr: string, fallback: string = "—") => {
  if (!dateValue) return fallback;
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatStr);
  } catch {
    return fallback;
  }
};

export default function DriverUtilizationReport() {
  const { data: schedules, isLoading } = useQuery<any[]>({
    queryKey: ['/api/driver-schedules'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Calculate metrics
  const totalSchedules = schedules?.length || 0;
  const totalHours = schedules?.reduce((sum, s) => sum + (s.actualHours || 0), 0) || 0;
  const overtimeHours = schedules?.reduce((sum, s) => sum + (s.overtimeHours || 0), 0) || 0;
  const uniqueDrivers = new Set(schedules?.map(s => s.driverId) || []).size;

  // Utilization by driver
  const driverData = schedules?.reduce((acc: any[], schedule) => {
    const existing = acc.find(d => d.driverId === schedule.driverId);
    const hours = schedule.actualHours || 0;
    const overtime = schedule.overtimeHours || 0;
    
    if (existing) {
      existing.totalHours += hours;
      existing.overtime += overtime;
      existing.shifts += 1;
    } else {
      acc.push({
        driverId: schedule.driverId,
        totalHours: hours,
        overtime: overtime,
        shifts: 1,
      });
    }
    return acc;
  }, [])
    ?.sort((a, b) => b.totalHours - a.totalHours)
    ?.slice(0, 10) || [];

  // Monthly hours trend
  const monthlyData = schedules
    ?.filter(schedule => schedule.shiftDate)
    ?.reduce((acc: any[], schedule) => {
      const month = safeFormatDate(schedule.shiftDate, 'MMM yyyy', 'Unknown');
      if (month === 'Unknown') return acc;
      const existing = acc.find(d => d.month === month);
      const hours = schedule.actualHours || 0;
      const overtime = schedule.overtimeHours || 0;
      
      if (existing) {
        existing.hours += hours;
        existing.overtime += overtime;
      } else {
        acc.push({ month, hours, overtime });
      }
      return acc;
    }, [])
    ?.slice(-12) || [];

  const avgHoursPerDriver = uniqueDrivers > 0 ? (totalHours / uniqueDrivers).toFixed(1) : '0';
  const overtimeRate = totalHours > 0 ? ((overtimeHours / totalHours) * 100).toFixed(1) : '0';

  const handleExport = () => {
    if (!schedules) return;
    const csv = [
      ['Date', 'Driver ID', 'Shift Type', 'Actual Hours', 'Overtime Hours', 'Status'].join(','),
      ...schedules.map(s => [
        safeFormatDate(s.shiftDate, 'yyyy-MM-dd', ''),
        s.driverId || '',
        s.shiftType || '',
        s.actualHours || 0,
        s.overtimeHours || 0,
        s.status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-utilization-${safeFormatDate(new Date(), 'yyyy-MM-dd', 'export')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Driver Utilization & Overtime Report</h1>
          <p className="text-muted-foreground">Workforce productivity and labor cost analysis</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <MaterialSymbol name="download" size="sm" />
          Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <MaterialSymbol name="group" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDrivers}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalSchedules} shifts scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <MaterialSymbol name="schedule" size="sm" className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">{avgHoursPerDriver} avg per driver</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <MaterialSymbol name="trending_up" size="sm" className="text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overtimeHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">{overtimeRate}% of total hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <MaterialSymbol name="payments" size="sm" className="text-[hsl(var(--positive))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--positive))]">
              {totalHours > 0 ? ((totalHours / (uniqueDrivers * 160)) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs 160h/month standard</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Drivers by Hours</CardTitle>
            <CardDescription>Most utilized drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={driverData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="driverId" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalHours" fill="#3b82f6" name="Regular Hours" />
                <Bar dataKey="overtime" fill="#f97316" name="Overtime" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Hours Trend</CardTitle>
            <CardDescription>Last 12 months workforce activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} name="Regular Hours" />
                <Line type="monotone" dataKey="overtime" stroke="#f97316" strokeWidth={2} name="Overtime" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
