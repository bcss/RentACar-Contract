import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, AlertCircle, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function TrafficFineAgingReport() {
  const { data: fines, isLoading } = useQuery<any[]>({
    queryKey: ['/api/traffic-fines'],
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
  const totalFines = fines?.length || 0;
  const unpaidFines = fines?.filter(f => f.paymentStatus !== 'paid') || [];
  const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + parseFloat(f.fineAmount || '0'), 0);
  const totalBlackPoints = fines?.reduce((sum, f) => sum + (f.blackPoints || 0), 0) || 0;

  // Aging analysis (days since fine date)
  const today = new Date();
  const agingBuckets = {
    current: 0,
    '30days': 0,
    '60days': 0,
    '90plus': 0,
  };

  unpaidFines.forEach(fine => {
    const days = differenceInDays(today, new Date(fine.fineDate));
    if (days <= 30) agingBuckets.current++;
    else if (days <= 60) agingBuckets['30days']++;
    else if (days <= 90) agingBuckets['60days']++;
    else agingBuckets['90plus']++;
  });

  const agingData = [
    { name: '0-30 Days', value: agingBuckets.current, color: '#22c55e' },
    { name: '31-60 Days', value: agingBuckets['30days'], color: '#eab308' },
    { name: '61-90 Days', value: agingBuckets['60days'], color: '#f97316' },
    { name: '90+ Days', value: agingBuckets['90plus'], color: '#ef4444' },
  ];

  // Payment status breakdown
  const paidCount = fines?.filter(f => f.paymentStatus === 'paid').length || 0;
  const pendingCount = fines?.filter(f => f.paymentStatus === 'pending').length || 0;
  const overdueCount = fines?.filter(f => f.paymentStatus === 'overdue').length || 0;

  const statusData = [
    { name: 'Paid', value: paidCount, color: '#22c55e' },
    { name: 'Pending', value: pendingCount, color: '#eab308' },
    { name: 'Overdue', value: overdueCount, color: '#ef4444' },
  ];

  const handleExport = () => {
    if (!fines) return;
    const csv = [
      ['Fine Date', 'Fine Number', 'Amount', 'Black Points', 'Payment Status', 'Days Outstanding'].join(','),
      ...unpaidFines.map(f => [
        format(new Date(f.fineDate), 'yyyy-MM-dd'),
        f.fineNumber || '',
        f.fineAmount,
        f.blackPoints || 0,
        f.paymentStatus,
        differenceInDays(today, new Date(f.fineDate))
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-fines-aging-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Traffic Fine Aging & Recovery</h1>
          <p className="text-muted-foreground">Outstanding fines analysis and payment tracking</p>
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
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFines}</div>
            <p className="text-xs text-muted-foreground mt-1">{unpaidFines.length} unpaid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">AED {totalUnpaidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Black Points</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalBlackPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">Total accumulated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalFines > 0 ? ((paidCount / totalFines) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{paidCount} fines paid</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aging Analysis</CardTitle>
            <CardDescription>Unpaid fines by age bracket</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agingData.map((entry, index) => (
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
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Fine payment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Number of Fines">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Outstanding Fines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Outstanding Fines</CardTitle>
          <CardDescription>Highest unpaid fines by amount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {unpaidFines
              .sort((a, b) => parseFloat(b.fineAmount || '0') - parseFloat(a.fineAmount || '0'))
              .slice(0, 10)
              .map((fine, index) => (
                <div key={fine.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{fine.fineNumber || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(fine.fineDate), 'MMM dd, yyyy')} • 
                        {differenceInDays(today, new Date(fine.fineDate))} days old
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">AED {parseFloat(fine.fineAmount || '0').toFixed(2)}</p>
                    {fine.blackPoints > 0 && (
                      <Badge variant="destructive" className="mt-1">{fine.blackPoints} points</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
