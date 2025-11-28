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
import { AlertTriangle, Download, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import type { PaymentDefaultPredictionReport } from '@shared/schema';

const RISK_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

export default function PaymentDefaultPrediction() {
  const { t } = useTranslation();
  const [riskLevel, setRiskLevel] = useState('');
  const [minAmount, setMinAmount] = useState('');

  const { data, isLoading } = useQuery<PaymentDefaultPredictionReport>({
    queryKey: ['/api/reports/predictive/payment-default', riskLevel, minAmount],
  });

  const exportData = () => {
    if (!data) return;
    const csvContent = [
      [t('reports.columns.contractId'), t('reports.columns.customerName'), t('reports.columns.defaultProbability'), t('reports.columns.riskLevel'), t('reports.columns.outstandingAmount'), t('reports.columns.daysOverdue')].join(','),
      ...data.contracts.map((c: any) => 
        [c.contractId, c.customerName, c.defaultProbability, c.riskLevel, c.outstandingAmount, c.daysOverdue].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-default-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskBadgeVariant = (level: string) => {
    return level === 'high' ? 'destructive' : level === 'medium' ? 'default' : 'outline';
  };

  if (isLoading) {
    return <div className="p-6" data-testid="loading-payment-default">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-payment-default">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold" data-testid="title-payment-default">
          {t('reports.paymentDefaultPrediction')}
        </h1>
        <Button onClick={exportData} disabled={!data} data-testid="button-export-payment">
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
              <Label>{t('reports.minOutstanding')}</Label>
              <Input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
                data-testid="input-min-amount"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card data-testid="card-total-outstanding">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalOutstanding')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold" data-testid="text-total-outstanding">
                    {data.summary.totalOutstanding.toLocaleString()} AED
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-high-risk-contracts">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.highRiskContracts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(var(--negative))]" data-testid="text-high-risk-contracts">
                  {data.summary.highRiskCount}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-at-risk-amount">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.atRiskAmount')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="text-at-risk-amount">
                  {data.summary.atRiskAmount.toLocaleString()} AED
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-probability">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.avgDefaultProbability')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-probability">
                  {data.summary.avgDefaultProbability.toFixed(1)}%
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
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-overdue-aging">
              <CardHeader>
                <CardTitle>{t('reports.overdueAging')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { range: '0-30', count: data.contracts.filter((c: any) => c.daysOverdue <= 30).length },
                      { range: '31-60', count: data.contracts.filter((c: any) => c.daysOverdue > 30 && c.daysOverdue <= 60).length },
                      { range: '61-90', count: data.contracts.filter((c: any) => c.daysOverdue > 60 && c.daysOverdue <= 90).length },
                      { range: '90+', count: data.contracts.filter((c: any) => c.daysOverdue > 90).length },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name={t('reports.contracts')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-high-risk-table">
            <CardHeader>
              <CardTitle>{t('reports.highRiskContracts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('contracts.contractId')}</th>
                      <th className="text-left p-2">{t('customers.name')}</th>
                      <th className="text-left p-2">{t('reports.defaultProbability')}</th>
                      <th className="text-left p-2">{t('reports.riskLevel')}</th>
                      <th className="text-left p-2">{t('reports.outstanding')}</th>
                      <th className="text-left p-2">{t('reports.daysOverdue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contracts.filter((c: any) => c.riskLevel === 'high').slice(0, 10).map((contract: any, idx: number) => (
                      <tr key={contract.contractId} className="border-b" data-testid={`contract-row-${idx}`}>
                        <td className="p-2 font-mono">{contract.contractId}</td>
                        <td className="p-2">{contract.customerName}</td>
                        <td className="p-2 font-bold">{contract.defaultProbability.toFixed(1)}%</td>
                        <td className="p-2">
                          <Badge variant={getRiskBadgeVariant(contract.riskLevel)}>
                            {t(`reports.${contract.riskLevel}`)}
                          </Badge>
                        </td>
                        <td className="p-2">{contract.outstandingAmount.toLocaleString()} AED</td>
                        <td className="p-2">{contract.daysOverdue}</td>
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
