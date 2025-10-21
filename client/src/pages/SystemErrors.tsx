import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SystemError } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function SystemErrors() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isAdmin, authLoading, toast]);

  // System error filters
  const [errorTypeFilter, setErrorTypeFilter] = useState<string>('all');
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [errorDateFromFilter, setErrorDateFromFilter] = useState<string>('');
  const [errorDateToFilter, setErrorDateToFilter] = useState<string>('');

  // Acknowledge dialog
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);

  const { data: systemErrors = [], isLoading: systemErrorsLoading } = useQuery<SystemError[]>({
    queryKey: ['/api/system-errors'],
    enabled: isAuthenticated && isAdmin,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/system-errors/${id}/acknowledge`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors', 'unacknowledged'] });
      toast({
        title: 'Error Acknowledged',
        description: 'System error has been acknowledged successfully',
      });
      setIsAcknowledgeDialogOpen(false);
      setSelectedError(null);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || 'Failed to acknowledge error',
      });
    },
  });

  const handleAcknowledge = () => {
    if (selectedError) {
      acknowledgeMutation.mutate(selectedError.id);
    }
  };

  const openAcknowledgeDialog = (error: SystemError) => {
    setSelectedError(error);
    setIsAcknowledgeDialogOpen(true);
  };

  // Filter system errors
  const filteredSystemErrors = systemErrors.filter(error => {
    const matchesErrorType = errorTypeFilter === 'all' || error.errorType === errorTypeFilter;
    const matchesEndpoint = endpointFilter === 'all' || error.endpoint === endpointFilter;
    
    let matchesDateRange = true;
    if (errorDateFromFilter || errorDateToFilter) {
      if (error.createdAt) {
        const errorDate = new Date(error.createdAt);
        if (errorDateFromFilter) {
          const fromDate = new Date(errorDateFromFilter);
          fromDate.setHours(0, 0, 0, 0);
          matchesDateRange = matchesDateRange && errorDate >= fromDate;
        }
        if (errorDateToFilter) {
          const toDate = new Date(errorDateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && errorDate <= toDate;
        }
      }
    }
    
    return matchesErrorType && matchesEndpoint && matchesDateRange;
  });

  // Get unique values for filters
  const uniqueErrorTypes = Array.from(new Set(systemErrors.map(error => error.errorType)));
  const uniqueEndpoints = Array.from(new Set(systemErrors.map(error => error.endpoint)));

  if (authLoading || systemErrorsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-system-errors-title">{t('audit.systemErrors')}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="material-icons">filter_list</span>
            {t('common.filter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium block">{t('audit.errorType')}</label>
              <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
                <SelectTrigger data-testid="select-error-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {uniqueErrorTypes.map(errorType => (
                    <SelectItem key={errorType} value={errorType}>{errorType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">{t('audit.endpoint')}</label>
              <Select value={endpointFilter} onValueChange={setEndpointFilter}>
                <SelectTrigger data-testid="select-endpoint-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {uniqueEndpoints.filter(Boolean).map(endpoint => (
                    <SelectItem key={endpoint} value={endpoint!}>{endpoint}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">{t('common.dateFrom')}</label>
              <Input
                type="date"
                value={errorDateFromFilter}
                onChange={(e) => setErrorDateFromFilter(e.target.value)}
                data-testid="input-error-date-from"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">{t('common.dateTo')}</label>
              <Input
                type="date"
                value={errorDateToFilter}
                onChange={(e) => setErrorDateToFilter(e.target.value)}
                data-testid="input-error-date-to"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="material-icons">error</span>
            {t('audit.systemErrors')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {systemErrorsLoading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredSystemErrors.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-icons text-6xl text-muted-foreground">error</span>
              <p className="mt-4 text-muted-foreground">{t('common.noResults')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>{t('audit.errorMessage')}</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>{t('audit.timestamp')}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSystemErrors.map((error) => (
                  <TableRow key={error.id} className="hover-elevate" data-testid={`row-error-${error.id}`}>
                    <TableCell>
                      <Badge 
                        variant="destructive"
                        className="flex items-center gap-1 w-fit"
                      >
                        <span className="material-icons text-sm">dangerous</span>
                        {error.errorType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm" data-testid={`text-error-message-${error.id}`}>
                      {error.errorMessage}
                    </TableCell>
                    <TableCell className="text-sm">
                      {error.endpoint || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {error.createdAt && format(new Date(error.createdAt), 'PPp')}
                    </TableCell>
                    <TableCell>
                      {error.acknowledged ? (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <span className="material-icons text-sm">check_circle</span>
                          Acknowledged
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <span className="material-icons text-sm">pending</span>
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!error.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAcknowledgeDialog(error)}
                          data-testid={`button-acknowledge-${error.id}`}
                        >
                          <span className="material-icons text-sm">check</span>
                          <span>Acknowledge</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Acknowledge Dialog */}
      <AlertDialog open={isAcknowledgeDialogOpen} onOpenChange={setIsAcknowledgeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acknowledge System Error</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to acknowledge this system error? This will mark it as reviewed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-acknowledge">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcknowledge}
              disabled={acknowledgeMutation.isPending}
              data-testid="button-confirm-acknowledge"
            >
              {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
