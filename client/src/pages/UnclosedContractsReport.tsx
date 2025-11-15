import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { AlertTriangle, FileDown, Eye, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface UnclosedContract {
  id: string;
  contractNumber: number;
  customerName: string;
  vehicleRegistration: string;
  completedAt: string;
  daysUnclosed: number;
  outstandingBalance: number;
  handlerName: string;
}

export default function UnclosedContractsReport() {
  const { t, i18n } = useTranslation();
  const { currency } = useCurrency();
  const { isAdmin, isManager } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [handlerFilter, setHandlerFilter] = useState<string>('all');
  const [minBalance, setMinBalance] = useState<string>('');
  const [maxBalance, setMaxBalance] = useState<string>('');

  const { data: unclosedContracts = [], isLoading } = useQuery<UnclosedContract[]>({
    queryKey: ['/api/contracts/unclosed-alerts'],
    enabled: isAdmin || isManager,
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  // Get unique handlers for filter
  const uniqueHandlers = Array.from(new Set(unclosedContracts.map(c => c.handlerName))).sort();

  // Apply filters
  const filteredContracts = unclosedContracts.filter(contract => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      contract.contractNumber.toString().includes(searchLower) ||
      contract.customerName.toLowerCase().includes(searchLower) ||
      contract.vehicleRegistration.toLowerCase().includes(searchLower);
    
    // Handler filter
    const matchesHandler = handlerFilter === 'all' || contract.handlerName === handlerFilter;
    
    // Balance filter
    const min = minBalance === '' ? -Infinity : parseFloat(minBalance);
    const max = maxBalance === '' ? Infinity : parseFloat(maxBalance);
    const matchesBalance = contract.outstandingBalance >= min && contract.outstandingBalance <= max;
    
    return matchesSearch && matchesHandler && matchesBalance;
  });

  // Calculate summary statistics
  const totalUnclosed = filteredContracts.length;
  const totalOutstanding = filteredContracts.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const oldestDays = filteredContracts.length > 0 
    ? Math.max(...filteredContracts.map(c => c.daysUnclosed))
    : 0;
  const avgDays = filteredContracts.length > 0
    ? Math.round(filteredContracts.reduce((sum, c) => sum + c.daysUnclosed, 0) / filteredContracts.length)
    : 0;

  const getDaysUnclosedBadge = (days: number) => {
    if (days > 60) {
      return <Badge variant="destructive" data-testid={`badge-days-${days}`}>{days} days</Badge>;
    } else {
      return <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-600" data-testid={`badge-days-${days}`}>{days} days</Badge>;
    }
  };

  const handleExport = () => {
    try {
      const exportData = filteredContracts.map(contract => ({
        'Contract Number': `#${contract.contractNumber}`,
        'Customer Name': contract.customerName,
        'Vehicle Registration': contract.vehicleRegistration,
        'Completed Date': format(new Date(contract.completedAt), 'yyyy-MM-dd'),
        'Days Unclosed': contract.daysUnclosed,
        'Outstanding Balance': contract.outstandingBalance,
        'Handler': contract.handlerName,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Unclosed Contracts');
      XLSX.writeFile(wb, `unclosed-contracts-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

      toast({
        title: t('common.success'),
        description: 'Report exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setHandlerFilter('all');
    setMinBalance('');
    setMaxBalance('');
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
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-destructive" data-testid="icon-alert-triangle" />
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              Unclosed Contracts Report
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Contracts completed more than 30 days ago that haven't been closed
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} data-testid="button-export-excel">
          <FileDown className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Unclosed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-unclosed">
              {totalUnclosed}
            </div>
            <p className="text-xs text-muted-foreground">
              Contracts pending closure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-outstanding">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined balance due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Oldest Unclosed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-oldest-days">
              {oldestDays} days
            </div>
            <p className="text-xs text-muted-foreground">
              Longest pending contract
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-average-days">
              {avgDays} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average unclosed duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by contract #, customer, vehicle"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div>
              <Select value={handlerFilter} onValueChange={setHandlerFilter}>
                <SelectTrigger data-testid="select-handler">
                  <SelectValue placeholder="Filter by handler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Handlers</SelectItem>
                  {uniqueHandlers.map(handler => (
                    <SelectItem key={handler} value={handler}>{handler}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="number"
                placeholder="Min balance"
                value={minBalance}
                onChange={(e) => setMinBalance(e.target.value)}
                data-testid="input-min-balance"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max balance"
                value={maxBalance}
                onChange={(e) => setMaxBalance(e.target.value)}
                data-testid="input-max-balance"
              />
            </div>
          </div>
          {(searchQuery || handlerFilter !== 'all' || minBalance || maxBalance) && (
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                <XCircle className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unclosed Contracts</CardTitle>
          <CardDescription>
            {filteredContracts.length} contract(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-empty-state">
                {unclosedContracts.length === 0 
                  ? 'No unclosed contracts found. Great job!' 
                  : 'No contracts match your filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Days Unclosed</TableHead>
                    <TableHead className="text-right">Outstanding Balance</TableHead>
                    <TableHead>Handler</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id} data-testid={`row-contract-${contract.contractNumber}`}>
                      <TableCell className="font-medium">
                        <Link href={`/contracts/${contract.id}`}>
                          <Button variant="link" className="p-0 h-auto" data-testid={`link-contract-${contract.contractNumber}`}>
                            #{contract.contractNumber}
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell data-testid={`text-customer-${contract.contractNumber}`}>
                        {contract.customerName}
                      </TableCell>
                      <TableCell data-testid={`text-vehicle-${contract.contractNumber}`}>
                        {contract.vehicleRegistration}
                      </TableCell>
                      <TableCell data-testid={`text-completed-${contract.contractNumber}`}>
                        {format(new Date(contract.completedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {getDaysUnclosedBadge(contract.daysUnclosed)}
                      </TableCell>
                      <TableCell className="text-right font-medium" data-testid={`text-balance-${contract.contractNumber}`}>
                        {formatCurrency(contract.outstandingBalance)}
                      </TableCell>
                      <TableCell data-testid={`text-handler-${contract.contractNumber}`}>
                        {contract.handlerName}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/contracts/${contract.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-${contract.contractNumber}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
