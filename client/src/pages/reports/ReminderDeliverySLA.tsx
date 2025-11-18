import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ReminderDeliverySLA() {
  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ['/api/communication-logs'],
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
  const totalMessages = logs?.length || 0;
  const deliveredCount = logs?.filter(l => l.status === 'delivered').length || 0;
  const sentCount = logs?.filter(l => l.status === 'sent').length || 0;
  const failedCount = logs?.filter(l => l.status === 'failed').length || 0;
  const pendingCount = logs?.filter(l => l.status === 'pending').length || 0;

  const deliveryRate = totalMessages > 0 ? ((deliveredCount / totalMessages) * 100).toFixed(1) : '0';
  const failureRate = totalMessages > 0 ? ((failedCount / totalMessages) * 100).toFixed(1) : '0';

  // Status breakdown
  const statusData = [
    { name: 'Delivered', value: deliveredCount, color: '#22c55e' },
    { name: 'Sent', value: sentCount, color: '#3b82f6' },
    { name: 'Failed', value: failedCount, color: '#ef4444' },
    { name: 'Pending', value: pendingCount, color: '#eab308' },
  ];

  // Channel breakdown
  const smsCount = logs?.filter(l => l.channel === 'sms').length || 0;
  const emailCount = logs?.filter(l => l.channel === 'email').length || 0;

  const channelData = [
    { name: 'SMS', value: smsCount, color: '#22c55e' },
    { name: 'Email', value: emailCount, color: '#3b82f6' },
  ];

  // Daily delivery trend
  const dailyData = logs
    ?.reduce((acc: any[], log) => {
      const date = format(new Date(log.createdAt), 'MMM dd');
      const existing = acc.find(d => d.date === date);
      
      if (existing) {
        existing.total += 1;
        if (log.status === 'delivered') existing.delivered += 1;
        if (log.status === 'failed') existing.failed += 1;
      } else {
        acc.push({
          date,
          total: 1,
          delivered: log.status === 'delivered' ? 1 : 0,
          failed: log.status === 'failed' ? 1 : 0,
        });
      }
      return acc;
    }, [])
    ?.slice(-14) || [];

  const handleExport = () => {
    if (!logs) return;
    const csv = [
      ['Date', 'Channel', 'Recipient', 'Status', 'Provider'].join(','),
      ...logs.map(l => [
        format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm'),
        l.channel,
        l.recipient,
        l.status,
        l.providerName || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reminder-delivery-sla-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reminder Delivery SLA Report</h1>
          <p className="text-muted-foreground">SMS and Email notification delivery performance</p>
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
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">All notification attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveryRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{deliveredCount} delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failureRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{failedCount} failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">In queue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status Distribution</CardTitle>
            <CardDescription>Message delivery outcomes</CardDescription>
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
            <CardTitle>Channel Distribution</CardTitle>
            <CardDescription>SMS vs Email usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Messages">
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Delivery Trend</CardTitle>
          <CardDescription>Last 14 days notification activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Sent" />
              <Line type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2} name="Delivered" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
