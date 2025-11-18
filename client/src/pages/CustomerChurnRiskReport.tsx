import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Download, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { CustomerChurnRiskReport as CustomerChurnRiskReportType } from '@shared/schema';

const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export default function CustomerChurnRiskReport() {
  const { t } = useTranslation();
  const [riskLevel, setRiskLevel] = useState('');
  const [minContracts, setMinContracts] = useState('');

  const { data, isLoading } = useQuery<CustomerChurnRiskReportType>({
    queryKey: ['/api/reports/predictive/customer-churn', riskLevel, minContracts],
  });

  const exportData = () => {
    if (!data) return;
    const csvContent = [
      ['Customer ID', 'Name', 'Risk Score', 'Risk Level', 'Total Contracts', 'Days Since Last', 'Payment Score'].join(','),
      ...data.customers.map((c: any) => 
        [c.customerId, c.customerName, c.riskScore, c.riskLevel, c.totalContracts, c.daysSinceLastContract, c.paymentScore].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `churn-risk-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskBadgeVariant = (level: string) => {
    return level === 'high' ? 'destructive' : level === 'medium' ? 'default' : 'outline';
  };

  if (isLoading) {
    return <div className="p-6" data-testid="loading-churn-report">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-customer-churn">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold" data-testid="title-customer-churn">
          {t('reports.customerChurnRisk')}
        </h1>
        <Button onClick={exportData} disabled={!data} data-testid="button-export-churn">
          <Download className="h-4 w-4 mr-2" />
          {t('common.exportCSV')}
        </Button>
      </div>

      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle>{t('common.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('reports.riskLevel')}</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger data-testid="select-risk-level">
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="high">{t('reports.high')}</SelectItem>
                  <SelectItem value="medium">{t('reports.medium')}</SelectItem>
                  <SelectItem value="low">{t('reports.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('reports.minContracts')}</Label>
              <Input
                type="number"
                value={minContracts}
                onChange={(e) => setMinContracts(e.target.value)}
                placeholder="0"
                data-testid="input-min-contracts"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-total-customers">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalCustomers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold" data-testid="text-total-customers">
                    {data.summary.totalCustomers}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-high-risk">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.highRisk')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-high-risk">
                  {data.summary.highRiskCount}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-medium-risk">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.mediumRisk')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="text-medium-risk">
                  {data.summary.mediumRiskCount}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-low-risk">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.lowRisk')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-low-risk">
                  {data.summary.lowRiskCount}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-risk-distribution">
              <CardHeader>
                <CardTitle>{t('reports.riskDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('reports.high'), value: data.summary.highRiskCount },
                        { name: t('reports.medium'), value: data.summary.mediumRiskCount },
                        { name: t('reports.low'), value: data.summary.lowRiskCount },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={RISK_COLORS.high} />
                      <Cell fill={RISK_COLORS.medium} />
                      <Cell fill={RISK_COLORS.low} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-scores">
              <CardHeader>
                <CardTitle>{t('reports.averageScores')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { metric: t('reports.riskScore'), value: data.summary.averageRiskScore },
                      { metric: t('reports.paymentScore'), value: data.summary.averagePaymentScore },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-high-risk-customers">
            <CardHeader>
              <CardTitle>{t('reports.highRiskCustomers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('customers.name')}</th>
                      <th className="text-left p-2">{t('reports.riskScore')}</th>
                      <th className="text-left p-2">{t('reports.riskLevel')}</th>
                      <th className="text-left p-2">{t('reports.totalContracts')}</th>
                      <th className="text-left p-2">{t('reports.daysSinceLast')}</th>
                      <th className="text-left p-2">{t('reports.paymentScore')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.customers.filter((c: any) => c.riskLevel === 'high').slice(0, 10).map((customer: any, idx: number) => (
                      <tr key={customer.customerId} className="border-b" data-testid={`customer-row-${idx}`}>
                        <td className="p-2">{customer.customerName}</td>
                        <td className="p-2 font-bold">{customer.riskScore.toFixed(1)}</td>
                        <td className="p-2">
                          <Badge variant={getRiskBadgeVariant(customer.riskLevel)}>
                            {t(`reports.${customer.riskLevel}`)}
                          </Badge>
                        </td>
                        <td className="p-2">{customer.totalContracts}</td>
                        <td className="p-2">{customer.daysSinceLastContract}</td>
                        <td className="p-2">{customer.paymentScore.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
