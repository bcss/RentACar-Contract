import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Contract } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function DisabledContracts() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const isRtl = i18n.language === 'ar';

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts/disabled'],
  });

  const enableContractMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/contracts/${id}/enable`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts/disabled'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
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

  const handleEnableContract = () => {
    if (selectedContract) {
      enableContractMutation.mutate(selectedContract.id);
    }
  };

  const openEnableDialog = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEnableDialogOpen(true);
  };

  const filteredContracts = contracts.filter((contract) => {
    const search = searchQuery.toLowerCase();
    return (
      contract.contractNumber.toString().includes(search) ||
      (contract.customerNameEn && contract.customerNameEn.toLowerCase().includes(search)) ||
      (contract.customerNameAr && contract.customerNameAr.toLowerCase().includes(search))
    );
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">{t('contracts.disabledContracts')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t('contracts.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-disabled-contracts"
          />

          {isLoading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noResults')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('contracts.contractNumber')}</TableHead>
                  <TableHead>{t('contracts.customerName')}</TableHead>
                  <TableHead>{t('contracts.status')}</TableHead>
                  <TableHead>{t('contracts.disabledAt')}</TableHead>
                  <TableHead className="text-right">{t('contracts.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} data-testid={`row-disabled-contract-${contract.id}`}>
                    <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                    <TableCell>
                      {isRtl ? contract.customerNameAr || contract.customerNameEn : contract.customerNameEn || contract.customerNameAr}
                    </TableCell>
                    <TableCell>{t(`contracts.${contract.status}`)}</TableCell>
                    <TableCell>
                      {contract.disabledAt ? new Date(contract.disabledAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEnableDialog(contract)}
                        data-testid={`button-enable-contract-${contract.id}`}
                      >
                        <span className="material-icons text-base">check_circle</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
