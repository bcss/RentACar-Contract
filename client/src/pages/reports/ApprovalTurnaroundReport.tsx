import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, differenceInHours, differenceInDays } from "date-fns";

export default function ApprovalTurnaroundReport() {
  const { data: approvals, isLoading } = useQuery<any[]>({
    queryKey: ['/api/approval-requests'],
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
  const totalRequests = approvals?.length || 0;
  const approvedCount = approvals?.filter(a => a.status === 'approved').length || 0;
  const rejectedCount = approvals?.filter(a => a.status === 'rejected').length || 0;
  const pendingCount = approvals?.filter(a => a.status === 'pending').length || 0;

  // Calculate average turnaround time (for completed approvals)
  const completedApprovals = approvals?.filter(a => a.status === 'approved' || a.status === 'rejected') || [];
  const totalTurnaroundHours = completedApprovals.reduce((sum, a) => {
    if (a.resolvedAt) {
      return sum + differenceInHours(new Date(a.resolvedAt), new Date(a.createdAt));
    }
    return sum;
  }, 0);
  const avgTurnaroundHours = completedApprovals.length > 0 
    ? (totalTurnaroundHours / completedApprovals.length).toFixed(1)
    : '0';

  // Status breakdown
  const statusData = [
    { name: 'Approved', value: approvedCount, color: '#22c55e' },
    { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
    { name: 'Pending', value: pendingCount, color: '#eab308' },
  ];

  // Entity type breakdown
  const entityTypes = approvals?.reduce((acc: any, a) => {
    const type = a.entityType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};

  const entityData = Object.entries(entityTypes).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  // Turnaround time distribution (in days)
  const turnaroundBuckets = {
    '0-1 days': 0,
    '1-3 days': 0,
    '3-7 days': 0,
    '7+ days': 0,
  };

  completedApprovals.forEach(approval => {
    if (!approval.resolvedAt) return;
    const days = differenceInDays(new Date(approval.resolvedAt), new Date(approval.createdAt));
    
    if (days <= 1) turnaroundBuckets['0-1 days']++;
    else if (days <= 3) turnaroundBuckets['1-3 days']++;
    else if (days <= 7) turnaroundBuckets['3-7 days']++;
    else turnaroundBuckets['7+ days']++;
  });

  const turnaroundData = Object.entries(turnaroundBuckets).map(([name, value]) => ({
    name,
    value,
  }));

  const handleExport = () => {
    if (!approvals) return;
    const csv = [
      ['Created Date', 'Entity Type', 'Amount', 'Status', 'Resolved Date', 'Turnaround (hours)'].join(','),
      ...approvals.map(a => {
        const turnaround = a.resolvedAt 
          ? differenceInHours(new Date(a.resolvedAt), new Date(a.createdAt))
          : 'N/A';
        return [
          format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm'),
          a.entityType || '',
          a.amount || '0',
          a.status,
          a.resolvedAt ? format(new Date(a.resolvedAt), 'yyyy-MM-dd HH:mm') : 'Pending',
          turnaround
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approval-turnaround-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Approval Turnaround Time Report</h1>
          <p className="text-muted-foreground">Workflow efficiency and decision-making speed analysis</p>
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
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">All approval requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgTurnaroundHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Average resolution time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRequests > 0 ? ((approvedCount / totalRequests) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{approvedCount} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting decision</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Approval outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turnaround Time Distribution</CardTitle>
            <CardDescription>Resolution speed breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnaroundData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Type Distribution</CardTitle>
          <CardDescription>Approvals by entity type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={entityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
