import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Contract, ContractWithDetails } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';

export default function Contracts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('active');
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditReasonDialogOpen, setIsEditReasonDialogOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);

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

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toString().includes(searchTerm) ||
      (contract.customerNameEn && contract.customerNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contract.customerNameAr && contract.customerNameAr.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredDisabledContracts = disabledContracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toString().includes(searchTerm) ||
      (contract.customerNameEn && contract.customerNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contract.customerNameAr && contract.customerNameAr.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: string; label: string }> = {
      draft: { color: 'bg-chart-4 hover:bg-chart-4 text-white', icon: 'edit', label: t('contracts.draft') },
      finalized: { color: 'bg-chart-2 hover:bg-chart-2 text-white', icon: 'lock', label: t('contracts.finalized') },
      confirmed: { color: 'bg-chart-3 hover:bg-chart-3 text-white', icon: 'check_circle', label: 'Confirmed' },
      active: { color: 'bg-chart-2 hover:bg-chart-2 text-white', icon: 'local_shipping', label: 'Active' },
      completed: { color: 'bg-chart-5 hover:bg-chart-5 text-white', icon: 'assignment_turned_in', label: 'Completed' },
      closed: { color: 'bg-secondary hover:bg-secondary text-secondary-foreground', icon: 'lock', label: 'Closed' },
    };

    const statusInfo = statusMap[status] || statusMap.draft;

    return (
      <Badge variant="default" className={`${statusInfo.color} flex items-center gap-1 w-fit`} data-testid={`badge-status-${status}`}>
        <span className="material-icons text-sm">{statusInfo.icon}</span>
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-contracts-title">{t('contracts.title')}</h1>
          <p className="text-muted-foreground">{filteredContracts.length} {t('contracts.title')}</p>
        </div>
        <Button asChild data-testid="button-new-contract">
          <Link href="/contracts/new">
            <span className="material-icons">add</span>
            <span>{t('contracts.newContract')}</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="material-icons">filter_list</span>
            {t('common.filter')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.search')}</label>
              <Input
                placeholder={t('contracts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('contracts.status')}</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">{t('contracts.draft')}</SelectItem>
                  <SelectItem value="finalized">{t('contracts.finalized')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" data-testid="tab-active-contracts">
                {t('contracts.activeContracts')} ({contracts.length})
              </TabsTrigger>
              <TabsTrigger value="disabled" data-testid="tab-disabled-contracts">
                {t('contracts.disabledContracts')} ({disabledContracts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {contractsLoading ? (
                <div className="text-center py-8">{t('common.loading')}</div>
              ) : filteredContracts.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-icons text-6xl text-muted-foreground">description</span>
                  <p className="mt-4 text-muted-foreground">{t('common.noResults')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('contracts.contractNumber')}</TableHead>
                      <TableHead>{t('contracts.customerName')}</TableHead>
                      <TableHead>{t('contracts.status')}</TableHead>
                      <TableHead>{t('contracts.createdDate')}</TableHead>
                      <TableHead className="text-right">{t('contracts.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id} className="hover-elevate" data-testid={`row-contract-${contract.id}`}>
                        <TableCell className="font-mono font-medium" data-testid={`text-contract-number-${contract.id}`}>
                          #{contract.contractNumber}
                        </TableCell>
                        <TableCell data-testid={`text-customer-name-${contract.id}`}>
                          {contract.customerNameEn}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contract.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contract.createdAt && format(new Date(contract.createdAt), 'PP')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              data-testid={`button-view-${contract.id}`}
                            >
                              <Link href={`/contracts/${contract.id}`}>
                                <span className="material-icons">visibility</span>
                              </Link>
                            </Button>
                            {contract.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setContractToEdit(contract);
                                  setIsEditReasonDialogOpen(true);
                                }}
                                data-testid={`button-edit-${contract.id}`}
                              >
                                <span className="material-icons">edit</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              data-testid={`button-print-${contract.id}`}
                            >
                              <Link href={`/contracts/${contract.id}`}>
                                <span className="material-icons">print</span>
                              </Link>
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDisableDialog(contract)}
                                data-testid={`button-disable-contract-${contract.id}`}
                              >
                                <span className="material-icons">block</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="disabled" className="mt-4">
              {disabledContractsLoading ? (
                <div className="text-center py-8">{t('common.loading')}</div>
              ) : filteredDisabledContracts.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-icons text-6xl text-muted-foreground">description</span>
                  <p className="mt-4 text-muted-foreground">{t('common.noResults')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('contracts.contractNumber')}</TableHead>
                      <TableHead>{t('contracts.customerName')}</TableHead>
                      <TableHead>{t('contracts.status')}</TableHead>
                      <TableHead>{t('contracts.disabledDate')}</TableHead>
                      <TableHead className="text-right">{t('contracts.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisabledContracts.map((contract) => (
                      <TableRow key={contract.id} className="hover-elevate" data-testid={`row-disabled-contract-${contract.id}`}>
                        <TableCell className="font-mono font-medium" data-testid={`text-contract-number-${contract.id}`}>
                          #{contract.contractNumber}
                        </TableCell>
                        <TableCell data-testid={`text-customer-name-${contract.id}`}>
                          {contract.customerNameEn}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contract.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contract.disabledAt ? format(new Date(contract.disabledAt), 'PP p') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEnableDialog(contract)}
                                data-testid={`button-enable-contract-${contract.id}`}
                              >
                                <span className="material-icons">check_circle</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Disable Contract Dialog */}
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

      {/* Enable Contract Dialog */}
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

      {/* Edit Reason Dialog */}
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
