import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CustomerActivity {
  customerId: string;
  nameEn: string;
  nameAr: string;
  contractCount: number;
  totalRevenue: number;
  totalDays: number;
  lastRental: string | null;
}

interface CustomerReport {
  customerActivity: CustomerActivity[];
  repeatCustomers: CustomerActivity[];
  newCustomers: CustomerActivity[];
}

export default function CustomerReports() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('activity');

  // Build query URL with date filters
  const getQueryUrl = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    return `/api/reports/customers${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const { data: report, isLoading } = useQuery<CustomerReport>({
    queryKey: ['/api/reports/customers', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(getQueryUrl(), { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch customer report');
      return response.json();
    },
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (!isAdmin && !isManager) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardHeader>
            <CardTitle>{t('common.error')}</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Customer Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Customer activity, retention, and acquisition metrics
          </p>
        </div>
        <Button variant="outline" disabled data-testid="button-export">
          <span className="material-icons mr-2">download</span>
          Export (Coming Soon)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateFrom')}</label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder={t('common.dateFrom')}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">{t('common.dateTo')}</label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder={t('common.dateTo')}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={!startDate && !endDate}
              data-testid="button-clear-filters"
            >
              <span className="material-icons mr-2">clear</span>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-customer-reports">
          <TabsTrigger value="activity" data-testid="tab-activity">
            Customer Activity
          </TabsTrigger>
          <TabsTrigger value="repeat" data-testid="tab-repeat">
            Repeat Customers
          </TabsTrigger>
          <TabsTrigger value="new" data-testid="tab-new">
            New Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card data-testid="card-top-customers-chart">
                <CardHeader>
                  <CardTitle>Top 10 Customers by Revenue</CardTitle>
                  <CardDescription>
                    Highest revenue generating customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.customerActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No customer activity in this period
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" minHeight={300}>
                      <BarChart data={report.customerActivity.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="nameEn" 
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          className="text-xs"
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${value.toLocaleString()}`}
                          className="text-xs"
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-md p-3 shadow-lg">
                                <p className="text-sm font-medium mb-1">
                                  {data.nameEn || data.nameAr}
                                </p>
                                <p className="text-sm text-primary">
                                  Revenue: {formatCurrency(data.totalRevenue)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Contracts: {data.contractCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Rental Days: {data.totalDays}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="totalRevenue" 
                          fill="hsl(var(--primary))"
                          name="Total Revenue"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Customer Activity</CardTitle>
                  <CardDescription>
                    Sorted by total revenue (highest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.customerActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      No customer activity in this period
                    </p>
                  ) : (
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-header-customer">Customer</TableHead>
                        <TableHead className="text-right" data-testid="table-header-contracts">Contracts</TableHead>
                        <TableHead className="text-right" data-testid="table-header-revenue">Total Revenue</TableHead>
                        <TableHead className="text-right" data-testid="table-header-days">Rental Days</TableHead>
                        <TableHead data-testid="table-header-last-rental">Last Rental</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.customerActivity.map((customer) => (
                        <TableRow key={customer.customerId} data-testid={`row-customer-${customer.customerId}`}>
                          <TableCell className="font-medium">
                            {customer.nameEn || customer.nameAr}
                          </TableCell>
                          <TableCell className="text-right">{customer.contractCount}</TableCell>
                          <TableCell className="text-right">{formatCurrency(customer.totalRevenue)}</TableCell>
                          <TableCell className="text-right">{customer.totalDays}</TableCell>
                          <TableCell>
                            {customer.lastRental 
                              ? format(new Date(customer.lastRental), 'MMM d, yyyy')
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="repeat" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Repeat Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-repeat-count">
                      {report.repeatCustomers.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Customers with 2+ contracts
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Retention Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-retention-rate">
                      {report.customerActivity.length > 0
                        ? ((report.repeatCustomers.length / report.customerActivity.length) * 100).toFixed(1)
                        : '0.0'}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Of active customers
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-repeat-vs-new-chart">
                <CardHeader>
                  <CardTitle>Repeat vs New Customers</CardTitle>
                  <CardDescription>
                    Customer acquisition and retention breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" minHeight={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: 'Repeat Customers', 
                            value: report.repeatCustomers.length,
                            color: 'hsl(142, 71%, 45%)'
                          },
                          { 
                            name: 'New Customers', 
                            value: report.newCustomers.length,
                            color: 'hsl(199, 89%, 48%)'
                          },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Repeat Customers', value: report.repeatCustomers.length, color: 'hsl(142, 71%, 45%)' },
                          { name: 'New Customers', value: report.newCustomers.length, color: 'hsl(199, 89%, 48%)' },
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          return (
                            <div className="bg-background border border-border rounded-md p-3 shadow-lg">
                              <p className="text-sm font-medium mb-1">
                                {payload[0].name}
                              </p>
                              <p className="text-sm text-primary">
                                Count: {payload[0].value}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Repeat Customers</CardTitle>
                  <CardDescription>
                    Sorted by contract count (highest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.repeatCustomers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      No repeat customers in this period
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="table-header-customer-repeat">Customer</TableHead>
                          <TableHead className="text-right" data-testid="table-header-contracts-repeat">Contracts</TableHead>
                          <TableHead className="text-right" data-testid="table-header-revenue-repeat">Total Revenue</TableHead>
                          <TableHead className="text-right" data-testid="table-header-days-repeat">Rental Days</TableHead>
                          <TableHead data-testid="table-header-last-rental-repeat">Last Rental</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.repeatCustomers.map((customer) => (
                          <TableRow key={customer.customerId} data-testid={`row-repeat-${customer.customerId}`}>
                            <TableCell className="font-medium">
                              {customer.nameEn || customer.nameAr}
                            </TableCell>
                            <TableCell className="text-right">{customer.contractCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(customer.totalRevenue)}</TableCell>
                            <TableCell className="text-right">{customer.totalDays}</TableCell>
                            <TableCell>
                              {customer.lastRental 
                                ? format(new Date(customer.lastRental), 'MMM d, yyyy')
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-6 mt-6">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !report ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>New Customers</CardTitle>
                <CardDescription>
                  Customers who made their first rental in this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.newCustomers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No new customers in this period
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="table-header-customer-new">Customer</TableHead>
                        <TableHead className="text-right" data-testid="table-header-contracts-new">Contracts</TableHead>
                        <TableHead className="text-right" data-testid="table-header-revenue-new">Total Revenue</TableHead>
                        <TableHead className="text-right" data-testid="table-header-days-new">Rental Days</TableHead>
                        <TableHead data-testid="table-header-first-rental">First Rental</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.newCustomers.map((customer) => (
                        <TableRow key={customer.customerId} data-testid={`row-new-${customer.customerId}`}>
                          <TableCell className="font-medium">
                            {customer.nameEn || customer.nameAr}
                          </TableCell>
                          <TableCell className="text-right">{customer.contractCount}</TableCell>
                          <TableCell className="text-right">{formatCurrency(customer.totalRevenue)}</TableCell>
                          <TableCell className="text-right">{customer.totalDays}</TableCell>
                          <TableCell>
                            {customer.lastRental 
                              ? format(new Date(customer.lastRental), 'MMM d, yyyy')
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
