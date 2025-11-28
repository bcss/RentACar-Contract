import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { format } from "date-fns";

export default function TollExpenseAnalysis() {
  const { data: tolls, isLoading } = useQuery<any[]>({
    queryKey: ['/api/tolls'],
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
  const totalExpense = tolls?.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0) || 0;
  const salikTotal = tolls?.filter(t => t.tollProvider === 'salik').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0) || 0;
  const darbTotal = tolls?.filter(t => t.tollProvider === 'darb').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0) || 0;
  const aberTotal = tolls?.filter(t => t.tollProvider === 'aber').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0) || 0;

  // Provider breakdown
  const providerData = [
    { name: 'Salik (Dubai)', value: salikTotal, color: '#3b82f6' },
    { name: 'Darb (Abu Dhabi)', value: darbTotal, color: '#22c55e' },
    { name: 'Aber (Sharjah)', value: aberTotal, color: '#eab308' },
  ];

  // Monthly trend
  const monthlyData = tolls
    ?.reduce((acc: any[], toll) => {
      const month = format(new Date(toll.tollDate), 'MMM yyyy');
      const existing = acc.find(d => d.month === month);
      if (existing) {
        existing.amount += parseFloat(toll.amount || '0');
        existing.count += 1;
      } else {
        acc.push({ month, amount: parseFloat(toll.amount || '0'), count: 1 });
      }
      return acc;
    }, [])
    ?.slice(-12) || [];

  const handleExport = () => {
    if (!tolls) return;
    const csv = [
      ['Date', 'Provider', 'Gate', 'Amount', 'Vehicle', 'Contract'].join(','),
      ...tolls.map(t => [
        format(new Date(t.tollDate), 'yyyy-MM-dd'),
        t.tollProvider,
        t.gateName || '',
        t.amount,
        t.vehicleId || '',
        t.contractId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toll-expense-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Toll Expense vs Budget Analysis</h1>
          <p className="text-muted-foreground">UAE toll gate expenses across Salik, Darb, and Aber</p>
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
            <CardTitle className="text-sm font-medium">Total Toll Expense</CardTitle>
            <MaterialSymbol name="payments" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{tolls?.length || 0} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salik (Dubai)</CardTitle>
            <MaterialSymbol name="trending_up" size="sm" className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">AED {salikTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalExpense > 0 ? ((salikTotal / totalExpense) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Darb (Abu Dhabi)</CardTitle>
            <MaterialSymbol name="trending_up" size="sm" className="text-[hsl(var(--positive))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--positive))]">AED {darbTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalExpense > 0 ? ((darbTotal / totalExpense) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aber (Sharjah)</CardTitle>
            <MaterialSymbol name="trending_up" size="sm" className="text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">AED {aberTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalExpense > 0 ? ((aberTotal / totalExpense) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Distribution</CardTitle>
            <CardDescription>Expense breakdown by toll provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={providerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: AED ${entry.value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `AED ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Toll Expenses</CardTitle>
            <CardDescription>Last 12 months trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `AED ${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Amount (AED)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
