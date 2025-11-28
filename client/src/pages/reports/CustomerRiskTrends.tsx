import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { format } from "date-fns";

interface RiskScore {
  id: string;
  customerId: string;
  riskScore: number;
  riskCategory: string;
  createdAt: Date;
}

export default function CustomerRiskTrends() {
  const { data: riskScores, isLoading } = useQuery<RiskScore[]>({
    queryKey: ['/api/risk-scoring/all'],
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
  const totalCustomers = new Set(riskScores?.map(r => r.customerId) || []).size;
  const highRiskCount = riskScores?.filter(r => r.riskCategory === 'high').length || 0;
  const mediumRiskCount = riskScores?.filter(r => r.riskCategory === 'medium').length || 0;
  const lowRiskCount = riskScores?.filter(r => r.riskCategory === 'low').length || 0;

  // Risk distribution data
  const riskDistribution = [
    { name: 'Low Risk', value: lowRiskCount, color: '#22c55e' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#eab308' },
    { name: 'High Risk', value: highRiskCount, color: '#ef4444' },
  ];

  // Trend data (group by date)
  const trendData = riskScores
    ?.reduce((acc: any[], score) => {
      const date = format(new Date(score.createdAt), 'MMM dd');
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.avgScore = (existing.avgScore + score.riskScore) / 2;
        existing.count += 1;
      } else {
        acc.push({ date, avgScore: score.riskScore, count: 1 });
      }
      return acc;
    }, [])
    ?.slice(-30) || [];

  const handleExport = () => {
    if (!riskScores) return;

    const csv = [
      ['Customer ID', 'Risk Score', 'Risk Category', 'Date'].join(','),
      ...riskScores.map(r => [
        r.customerId,
        r.riskScore,
        r.riskCategory,
        format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-trends-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-risk-trends">
            Customer Risk Trends Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor customer risk levels and trends over time
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2" data-testid="button-export">
          <MaterialSymbol name="download" size="sm" />
          Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <MaterialSymbol name="group" size="sm" className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Risk profiles monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <MaterialSymbol name="shield" size="sm" className="text-[hsl(var(--positive))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--positive))]">{lowRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCustomers > 0 ? Math.round((lowRiskCount / totalCustomers) * 100) : 0}% of customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <MaterialSymbol name="trending_up" size="sm" className="text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCustomers > 0 ? Math.round((mediumRiskCount / totalCustomers) * 100) : 0}% of customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <MaterialSymbol name="warning" size="sm" className="text-[hsl(var(--negative))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--negative))]">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCustomers > 0 ? Math.round((highRiskCount / totalCustomers) * 100) : 0}% of customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current customer risk breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Score Trends</CardTitle>
            <CardDescription>Average risk scores over last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} name="Avg Risk Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Category Comparison</CardTitle>
          <CardDescription>Visual comparison of risk levels</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Number of Customers">
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
