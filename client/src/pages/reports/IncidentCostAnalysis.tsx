import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, AlertTriangle, DollarSign, Shield, FileText } from "lucide-react";
import { format } from "date-fns";

export default function IncidentCostAnalysis() {
  const { data: incidents, isLoading } = useQuery<any[]>({
    queryKey: ['/api/incidents'],
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
  const totalIncidents = incidents?.length || 0;
  const totalEstimatedCost = incidents?.reduce((sum, i) => sum + parseFloat(i.estimatedCost || '0'), 0) || 0;
  const activeClaimsCount = incidents?.filter(i => i.insuranceClaimStatus === 'filed' || i.insuranceClaimStatus === 'in_progress').length || 0;
  const settledClaimsCount = incidents?.filter(i => i.insuranceClaimStatus === 'settled').length || 0;

  // Severity breakdown
  const severityCounts = {
    minor: incidents?.filter(i => i.severity === 'minor').length || 0,
    moderate: incidents?.filter(i => i.severity === 'moderate').length || 0,
    major: incidents?.filter(i => i.severity === 'major').length || 0,
  };

  const severityData = [
    { name: 'Minor', value: severityCounts.minor, color: '#22c55e' },
    { name: 'Moderate', value: severityCounts.moderate, color: '#eab308' },
    { name: 'Major', value: severityCounts.major, color: '#ef4444' },
  ];

  // Monthly cost trend
  const monthlyData = incidents
    ?.reduce((acc: any[], incident) => {
      const month = format(new Date(incident.incidentDate), 'MMM yyyy');
      const existing = acc.find(d => d.month === month);
      const cost = parseFloat(incident.estimatedCost || '0');
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
    if (!incidents) return;
    const csv = [
      ['Date', 'Type', 'Severity', 'Estimated Cost', 'Insurance Status', 'Liability'].join(','),
      ...incidents.map(i => [
        format(new Date(i.incidentDate), 'yyyy-MM-dd'),
        i.incidentType,
        i.severity,
        i.estimatedCost || '0',
        i.insuranceClaimStatus || 'N/A',
        i.liabilityParty || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-cost-analysis-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Incident Cost & Liability Analysis</h1>
          <p className="text-muted-foreground">Accident tracking, insurance claims, and financial impact</p>
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
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">All recorded incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-[hsl(var(--negative))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--negative))]">AED {totalEstimatedCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total financial impact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activeClaimsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settled Claims</CardTitle>
            <Shield className="h-4 w-4 text-[hsl(var(--positive))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--positive))]">{settledClaimsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Incidents by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
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
            <CardTitle>Monthly Cost Trend</CardTitle>
            <CardDescription>Incident costs over last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `AED ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="cost" fill="#ef4444" name="Cost (AED)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Costly Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Costly Incidents</CardTitle>
          <CardDescription>Highest estimated cost incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incidents
              ?.sort((a, b) => parseFloat(b.estimatedCost || '0') - parseFloat(a.estimatedCost || '0'))
              .slice(0, 10)
              .map((incident, index) => (
                <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{incident.incidentType}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(incident.incidentDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">AED {parseFloat(incident.estimatedCost || '0').toFixed(2)}</p>
                    <Badge variant={incident.severity === 'major' ? 'destructive' : incident.severity === 'moderate' ? 'default' : 'secondary'}>
                      {incident.severity}
                    </Badge>
                  </div>
                </div>
              )) || []}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
