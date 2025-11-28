/**
 * File: client/src/pages/Contracts.tsx
 * @area Contract Listing
 * @checklist §2.2, §3.1-3.16
 * @purpose Contract list view with filtering per Master Spec Part 3
 * 
 * @behaviour
 *  - Status filter: ALL, DRAFT, ACTIVE, COMPLETED, CLOSED (§2.2)
 *  - Role-based visibility: Staff sees own contracts only
 *  - Quick actions: View, Edit, Disable (no hard delete)
 *  - Status badges: Color-coded per contract state
 *  - Overdue/Pending refunds filters from dashboard
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.2, Part 3)
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBilingualField } from '@/hooks/useBilingualField';
import { Link, useLocation } from 'wouter';
import { Contract, ContractWithDetails } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { EditReasonDialog } from '@/components/EditReasonDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Icon } from '@/components/Icon';
import { ListPageLayout, FilterPanel, FilterGroup } from '@/components/layouts';
import { MaterialSymbol } from '@/components/MaterialSymbol';

export default function Contracts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getBilingualValue } = useBilingualField();
  const { isAuthenticated, isLoading, isAdmin, isViewer } = useAuth();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const statusFromUrl = searchParams.get('status') || 'all';
  const overdueFromUrl = searchParams.get('overdue') === 'true';
  const pendingRefundsFromUrl = searchParams.get('pendingRefunds') === 'true';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(statusFromUrl);
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(overdueFromUrl);
  const [showPendingRefundsOnly, setShowPendingRefundsOnly] = useState<boolean>(pendingRefundsFromUrl);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditReasonDialogOpen, setIsEditReasonDialogOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const status = params.get('status') || 'all';
    const overdue = params.get('overdue') === 'true';
    const pendingRefunds = params.get('pendingRefunds') === 'true';
    
    setStatusFilter(status);
    setShowOverdueOnly(overdue);
    setShowPendingRefundsOnly(pendingRefunds);
  }, [location]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('common.error'),
        description: t('msg.noPermission'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast, t]);

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ['/api/contracts'],
    enabled: isAuthenticated,
  });

  const { data: disabledContracts = [], isLoading: disabledContractsLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ['/api/contracts/disabled'],
    enabled: isAuthenticated,
  });

  const disableContractMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/contracts/${id}/disable`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts/disabled'] });
      toast({
        title: t('contracts.contractDisabled'),
      });
      setIsDisableDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      });
    },
  });

  const enableContractMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/contracts/${id}/enable`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts/disabled'] });
      toast({
        title: t('contracts.contractEnabled'),
      });
      setIsEnableDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      });
    },
  });

  const handleDisableContract = () => {
    if (selectedContract) {
      disableContractMutation.mutate(selectedContract.id);
    }
  };

  const handleEnableContract = () => {
    if (selectedContract) {
      enableContractMutation.mutate(selectedContract.id);
    }
  };

  const openDisableDialog = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDisableDialogOpen(true);
  };

  const openEnableDialog = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEnableDialogOpen(true);
  };

  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  const allContracts = statusFilter === 'disabled' ? disabledContracts : contracts;

  const filteredContracts = allContracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toString().includes(searchTerm) ||
      (contract.customerNameEn && contract.customerNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contract.customerNameAr && contract.customerNameAr.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || statusFilter === 'disabled' || contract.status === statusFilter;
    
    let matchesDateRange = true;
    if (fromDate || toDate) {
      const rentalStart = contract.rentalStartDate ? new Date(contract.rentalStartDate) : null;
      const rentalEnd = contract.rentalEndDate ? new Date(contract.rentalEndDate) : null;
      
      if (fromDate && rentalStart && rentalStart < fromDate) {
        matchesDateRange = false;
      }
      if (toDate && rentalEnd && rentalEnd > toDate) {
        matchesDateRange = false;
      }
    }
    
    // Context-aware filter for overdue contracts (from dashboard)
    let matchesOverdue = true;
    if (showOverdueOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isOverdue = contract.status === 'active' && contract.rentalEndDate && (() => {
        const endDate = new Date(contract.rentalEndDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate < today;
      })();
      matchesOverdue = isOverdue;
    }
    
    // Context-aware filter for pending refunds (from dashboard)
    let matchesPendingRefunds = true;
    if (showPendingRefundsOnly) {
      matchesPendingRefunds = contract.status === 'closed' && 
                              contract.depositPaid === true && 
                              !contract.depositRefunded;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange && matchesOverdue && matchesPendingRefunds;
  });

  const getStatusBadge = (status: string, disabled?: boolean) => {
    if (disabled) {
      return (
        <Badge variant="default" className="bg-secondary hover:bg-secondary text-secondary-foreground flex items-center gap-1 w-fit" data-testid="badge-status-disabled">
          <Icon name="block" className=" text-sm" />
          {t('common.disabled')}
        </Badge>
      );
    }

    const statusMap: Record<string, { color: string; icon: string; label: string }> = {
      draft: { color: 'bg-chart-4 hover:bg-chart-4 text-white', icon: 'edit', label: t('contracts.draft') },
      finalized: { color: 'bg-chart-2 hover:bg-chart-2 text-white', icon: 'lock', label: t('contracts.finalized') },
      active: { color: 'bg-chart-2 hover:bg-chart-2 text-white', icon: 'local_shipping', label: 'Active' },
      completed: { color: 'bg-chart-5 hover:bg-chart-5 text-white', icon: 'assignment_turned_in', label: 'Completed' },
      closed: { color: 'bg-secondary hover:bg-secondary text-secondary-foreground', icon: 'lock', label: 'Closed' },
    };

    const statusInfo = statusMap[status] || statusMap.draft;

    return (
      <Badge variant="default" className={`${statusInfo.color} flex items-center gap-1 w-fit`} data-testid={`badge-status-${status}`}>
        <Icon name="{statusInfo.icon}" className=" text-sm" />
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading || contractsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div data-testid="page-contracts">
      <ListPageLayout
        title={t('contracts.title')}
        subtitle={`${filteredContracts.length} ${t('contracts.title')}`}
        actionButton={
          <Button asChild data-testid="button-new-contract" className="gap-2">
            <Link href="/contracts/new">
              <MaterialSymbol name="add_circle" size="sm" />
              <span>{t('contracts.newContract')}</span>
            </Link>
          </Button>
        }
        filterPanel={
          <FilterPanel title={t('common.filters')} showButtons={false}>
            <FilterGroup label={t('common.search')}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MaterialSymbol name="search" size="sm" />
                </span>
                <Input
                  placeholder={t('contracts.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-lg"
                  data-testid="input-search"
                />
              </div>
            </FilterGroup>
            
            <FilterGroup label={t('contracts.status')}>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter" className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="draft">{t('contracts.draft')}</SelectItem>
                  <SelectItem value="active">{t('contracts.active')}</SelectItem>
                  <SelectItem value="completed">{t('contracts.completed')}</SelectItem>
                  <SelectItem value="closed">{t('contracts.closed')}</SelectItem>
                  <SelectItem value="disabled">{t('common.disabled')}</SelectItem>
                </SelectContent>
              </Select>
            </FilterGroup>

            <FilterGroup label={t('common.dateRange')}>
              <div className="space-y-2">
                <DatePicker
                  date={fromDate}
                  onDateChange={setFromDate}
                  placeholder={t('common.dateFrom')}
                />
                <DatePicker
                  date={toDate}
                  onDateChange={setToDate}
                  placeholder={t('common.dateTo')}
                />
                {(fromDate || toDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilters}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    data-testid="button-clear-dates"
                  >
                    <MaterialSymbol name="close" size="sm" className="mr-1" />
                    {t('contracts.clearDateFilter')}
                  </Button>
                )}
              </div>
            </FilterGroup>

            {(showOverdueOnly || showPendingRefundsOnly) && (
              <FilterGroup label={t('common.activeFilters')}>
                <div className="space-y-2">
                  {showOverdueOnly && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <MaterialSymbol name="warning" size="sm" />
                      <span className="font-medium">{t('contracts.overdueOnly')}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-auto hover:bg-destructive/20"
                        onClick={() => setShowOverdueOnly(false)}
                      >
                        <MaterialSymbol name="close" size="xs" />
                      </Button>
                    </div>
                  )}
                  {showPendingRefundsOnly && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
                      <MaterialSymbol name="pending_actions" size="sm" />
                      <span className="font-medium">{t('contracts.pendingRefunds')}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-auto hover:bg-amber-500/20"
                        onClick={() => setShowPendingRefundsOnly(false)}
                      >
                        <MaterialSymbol name="close" size="xs" />
                      </Button>
                    </div>
                  )}
                </div>
              </FilterGroup>
            )}
          </FilterPanel>
        }
      >
        {contractsLoading || disabledContractsLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MaterialSymbol name="progress_activity" className="animate-spin" />
              {t('common.loading')}
            </div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="p-12 text-center">
            <MaterialSymbol name="description" size="2xl" className="text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t('common.noResults')}</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground">{t('contracts.contractNumber')}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t('contracts.customerName')}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t('contracts.status')}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t('contracts.rentalStartDate')}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t('contracts.rentalEndDate')}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t('contracts.createdBy')}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t('contracts.createdDate')}</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">{t('contracts.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const isDisabled = statusFilter === 'disabled';
                  return (
                    <TableRow 
                      key={contract.id} 
                      className="hover:bg-muted/30 transition-colors" 
                      data-testid={`row-contract-${contract.id}`}
                    >
                      <TableCell className="font-medium" data-testid={`text-contract-number-${contract.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MaterialSymbol name="description" size="sm" className="text-primary" />
                          </div>
                          <span className="font-mono">#{contract.contractNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-customer-name-${contract.id}`}>
                        {getBilingualValue(contract.customerNameEn, contract.customerNameAr)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.status, isDisabled)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contract.rentalStartDate ? format(new Date(contract.rentalStartDate), 'PP') : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contract.rentalEndDate ? format(new Date(contract.rentalEndDate), 'PP') : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-creator-${contract.id}`}>
                        {contract.creatorFirstName && contract.creatorLastName 
                          ? `${contract.creatorFirstName} ${contract.creatorLastName}`
                          : contract.creatorName || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contract.createdAt && format(new Date(contract.createdAt), 'PP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {!isDisabled && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                data-testid={`button-view-${contract.id}`}
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              >
                                <Link href={`/contracts/${contract.id}`}>
                                  <MaterialSymbol name="visibility" size="sm" />
                                </Link>
                              </Button>
                              {contract.status === 'draft' && !isViewer && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setContractToEdit(contract);
                                    setIsEditReasonDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-${contract.id}`}
                                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                >
                                  <MaterialSymbol name="edit" size="sm" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                data-testid={`button-print-${contract.id}`}
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              >
                                <Link href={`/contracts/${contract.id}`}>
                                  <MaterialSymbol name="print" size="sm" />
                                </Link>
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDisableDialog(contract)}
                                  data-testid={`button-disable-contract-${contract.id}`}
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <MaterialSymbol name="block" size="sm" />
                                </Button>
                              )}
                            </>
                          )}
                          {isDisabled && isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEnableDialog(contract)}
                              data-testid={`button-enable-contract-${contract.id}`}
                              className="h-8 w-8 hover:bg-green-500/10 hover:text-green-600"
                            >
                              <MaterialSymbol name="check_circle" size="sm" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </ListPageLayout>

      <AlertDialog open={isDisableDialogOpen} onOpenChange={setIsDisableDialogOpen}>
        <AlertDialogContent data-testid="dialog-disable-contract">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.disableContract')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.confirmDisableContract')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disable">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableContract}
              disabled={disableContractMutation.isPending}
              data-testid="button-confirm-disable"
            >
              {t('contracts.disableContract')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isEnableDialogOpen} onOpenChange={setIsEnableDialogOpen}>
        <AlertDialogContent data-testid="dialog-enable-contract">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.enableContract')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.confirmEnableContract')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-enable">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableContract}
              disabled={enableContractMutation.isPending}
              data-testid="button-confirm-enable"
            >
              {t('contracts.enableContract')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {contractToEdit && (
        <EditReasonDialog
          open={isEditReasonDialogOpen}
          onOpenChange={setIsEditReasonDialogOpen}
          contractId={contractToEdit.id}
          contractNumber={contractToEdit.contractNumber}
        />
      )}
    </div>
  );
}
