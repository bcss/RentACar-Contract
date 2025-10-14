import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Contract } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { format } from 'date-fns';

export default function Contracts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
    enabled: isAuthenticated,
  });

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toString().includes(searchTerm) ||
      contract.customerNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.customerNameAr && contract.customerNameAr.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'finalized') {
      return (
        <Badge variant="default" className="bg-chart-2 hover:bg-chart-2 flex items-center gap-1 w-fit" data-testid={`badge-status-finalized`}>
          <span className="material-icons text-sm">lock</span>
          {t('contracts.finalized')}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-chart-4 hover:bg-chart-4 flex items-center gap-1 w-fit" data-testid={`badge-status-draft`}>
        <span className="material-icons text-sm">edit</span>
        {t('contracts.draft')}
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
        <CardContent className="p-0">
          {filteredContracts.length === 0 ? (
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
                            asChild
                            data-testid={`button-edit-${contract.id}`}
                          >
                            <Link href={`/contracts/${contract.id}/edit`}>
                              <span className="material-icons">edit</span>
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-print-${contract.id}`}
                        >
                          <span className="material-icons">print</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
